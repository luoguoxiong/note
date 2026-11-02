// 图执行器：提交案件后台跑图（SSE 推进度）、审批后 Command(resume) 恢复执行、
// 服务重启后对卡在中间态的案件从 checkpoint 断点自动续跑（graph.stream(null)）。
// 进程内并发闸：同一案件同时只允许一个图执行（幂等保护，避免重复调用业务接口）。
import { Command } from '@langchain/langgraph';
import { getClaimGraph } from './build.js';
import { getCase, getReport, listDocuments, updateCaseStatus } from '../db/repo.js';
import { query } from '../db/pool.js';
import { bus } from '../services/bus.js';
import type { ApprovalDecision, CaseRec, CaseStatus } from '../types.js';

const running = new Set<string>();

export function isRunning(caseId: string) {
  return running.has(caseId);
}

interface GraphInput {
  caseId: string;
  caseNo: string;
  caseType: CaseRec['caseType'];
  declaredAmount: number;
  waybillNo: string;
  documents: Awaited<ReturnType<typeof listDocuments>>;
}

/** 执行结束后的状态对账：图跑完但状态仍停在中间态时按报告结果收敛 */
async function reconcileAfterRun(caseId: string) {
  const c = await getCase(caseId).catch(() => null);
  if (!c) return;
  const settled: CaseStatus[] = ['completed', 'failed', 'waiting_approval', 'rejected'];
  if (settled.includes(c.status)) return;
  const report = await getReport(caseId).catch(() => null);
  await updateCaseStatus(caseId, report ? 'completed' : 'failed').catch(() => {});
}

async function streamRun(caseId: string, input: unknown, threadId: string): Promise<void> {
  if (running.has(caseId)) throw new Error('CASE_RUNNING');
  running.add(caseId);
  try {
    const graph = await getClaimGraph();
    const cfg = { configurable: { thread_id: threadId }, streamMode: 'updates' as const };
    const stream = await graph.stream(input as any, cfg);
    for await (const ev of stream) {
      if ((ev as any)?.__interrupt__) {
        // interrupt 挂起：审批请求已由 approval 节点推送；等待 Command(resume)
        continue;
      }
    }
    await reconcileAfterRun(caseId);
    bus.emitCase(caseId, { type: 'done', label: '图执行结束' });
  } catch (err: any) {
    if (String(err?.message ?? err).includes('CASE_RUNNING')) throw err;
    await updateCaseStatus(caseId, 'failed').catch(() => {});
    bus.emitCase(caseId, { type: 'error', label: `图执行失败：${String(err?.message ?? err)}` });
  } finally {
    running.delete(caseId);
  }
}

/** 首次执行：从案件建档数据启动工作流（异步，不阻塞 API 响应） */
export async function startCase(caseRec: CaseRec): Promise<void> {
  const documents = await listDocuments(caseRec.id);
  const input: GraphInput = {
    caseId: caseRec.id,
    caseNo: caseRec.caseNo,
    caseType: caseRec.caseType,
    declaredAmount: caseRec.declaredAmount,
    waybillNo: caseRec.waybillNo,
    documents,
  };
  const threadId = caseRec.threadId ?? crypto.randomUUID();
  await updateCaseStatus(caseRec.id, 'planning', { threadId }).catch(() => {});
  void streamRun(caseRec.id, input, threadId).catch((err) => {
    if (String(err?.message ?? err).includes('CASE_RUNNING')) return; // 已有执行在跑
    console.error(`[runner] case ${caseRec.caseNo} 执行失败:`, err?.message ?? err);
  });
}

/** 人工审批后恢复执行（interrupt → Command(resume)） */
export async function resumeCase(caseRec: CaseRec, decision: ApprovalDecision): Promise<void> {
  if (!caseRec.threadId) throw new Error('案件无挂起线程，无法恢复');
  void streamRun(caseRec.id, new Command({ resume: decision }), caseRec.threadId).catch((err) => {
    if (String(err?.message ?? err).includes('CASE_RUNNING')) return;
    console.error(`[runner] case ${caseRec.caseNo} 恢复失败:`, err?.message ?? err);
  });
}

/** 需要自动恢复的中间态（不含 waiting_approval——那是等审批，由人工触发） */
const RECOVERABLE_STATUSES: CaseStatus[] = ['planning', 'parsing', 'verifying', 'rule_checking', 'risk_assessing', 'reporting'];

/**
 * 服务重启后的异常恢复：扫描卡在中间态的案件，从 checkpoint 断点续跑。
 * - submitted（有 thread_id 但还没跑起来）：重建输入重新执行
 * - 中间态：graph.stream(null, cfg) —— LangGraph 依据 checkpoint 从"下一个节点"继续，
 *   已完成节点不重跑；幂等锁保证进行中的核验不重复调用业务接口
 */
export async function recoverInterruptedRuns(): Promise<{ resumed: number; restarted: number }> {
  const rows = await query<any>(
    `SELECT * FROM cases WHERE thread_id IS NOT NULL AND (status = 'submitted' OR status = ANY($1))`,
    [RECOVERABLE_STATUSES],
  );
  let resumed = 0;
  let restarted = 0;
  for (const r of rows) {
    const c: CaseRec = {
      id: r.id, caseNo: r.case_no, claimantName: r.claimant_name, claimantPhone: r.claimant_phone,
      caseType: r.case_type, waybillNo: r.waybill_no, declaredAmount: Number(r.declared_amount),
      incidentDesc: r.incident_desc ?? '', status: r.status as CaseStatus, threadId: r.thread_id,
      templateKey: r.template_key ?? undefined,
    };
    if (running.has(c.id)) continue;
    try {
      if (c.status === 'submitted') {
        await startCase(c);
        restarted++;
        console.log(`[runner] 恢复案件 ${c.caseNo}（重启前未开始执行，重新提交）`);
      } else {
        await updateCaseStatus(c.id, c.status).catch(() => {});
        void streamRun(c.id, null, c.threadId!).catch((err) => {
          if (String(err?.message ?? err).includes('CASE_RUNNING')) return;
          console.error(`[runner] 案件 ${c.caseNo} 断点恢复失败:`, err?.message ?? err);
        });
        resumed++;
        console.log(`[runner] 恢复案件 ${c.caseNo}（从 checkpoint 断点续跑，中断于 ${c.status}）`);
      }
      bus.emitCase(c.id, { type: 'status', label: '服务重启，工作流断点恢复中' });
    } catch (err: any) {
      console.error(`[runner] 恢复案件 ${c.caseNo} 失败:`, err?.message ?? err);
    }
  }
  return { resumed, restarted };
}
