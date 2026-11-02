// REST API：案件提交 / 进度 SSE / 审批恢复 / 报告查询 / 权限隔离的最终决策。
import crypto from 'node:crypto';
import express from 'express';
import type { Request, Response } from 'express';
import { config } from '../config.js';
import {
  getCase, getCaseByNo, getDecision, getPendingApproval, getReport, insertAgentRun,
  insertCase, insertDecision, insertDocument, listCases, listDocuments, listAgentRuns,
} from '../db/repo.js';
import { CASE_TEMPLATES, getTemplate } from '../mock/data.js';
import { bus } from '../services/bus.js';
import { isRunning, resumeCase, startCase } from '../graph/runner.js';
import type { ApprovalDecision, CaseRec } from '../types.js';

export const app = express();
app.use(express.json());
app.use(express.static(new URL('../../public', import.meta.url).pathname));

app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true, ts: Date.now() }));

app.get('/api/templates', (_req: Request, res: Response) => {
  res.json(CASE_TEMPLATES.map((t) => ({ key: t.key, title: t.title, expect: t.expect, caseType: t.case.caseType, declaredAmount: t.case.declaredAmount })));
});

// 提交案件（demo 从模板建档；生产由业务系统推送案件数据）
app.post('/api/cases', async (req: Request, res: Response) => {
  try {
    const { templateKey } = req.body ?? {};
    const tpl = getTemplate(String(templateKey ?? ''));
    if (!tpl) return res.status(400).json({ error: 'INVALID_TEMPLATE', message: '未知案件模板' });
    const caseId = crypto.randomUUID();
    const caseNo = `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const caseRec: CaseRec = {
      id: caseId, caseNo, claimantName: tpl.case.claimantName, claimantPhone: tpl.case.claimantPhone,
      caseType: tpl.case.caseType, waybillNo: tpl.case.waybillNo, declaredAmount: tpl.case.declaredAmount,
      incidentDesc: tpl.case.incidentDesc, status: 'submitted', threadId: crypto.randomUUID(),
      templateKey: tpl.key,
    };
    await insertCase(caseRec);
    for (const d of tpl.documents) await insertDocument({ caseId, docType: d.docType, ocr: d.ocr });
    void startCase(caseRec);
    res.status(202).json({ caseId, caseNo, status: 'submitted', template: tpl.key });
  } catch (err: any) {
    res.status(500).json({ error: 'SUBMIT_FAILED', message: String(err?.message ?? err) });
  }
});

app.get('/api/cases', async (_req: Request, res: Response) => {
  const cases = await listCases();
  res.json(cases.map((c) => ({ ...c, running: isRunning(c.id) })));
});

app.get('/api/cases/:id', async (req: Request, res: Response) => {
  const c = await getCase(req.params.id);
  if (!c) return res.status(404).json({ error: 'NOT_FOUND' });
  const [documents, report, pending, decision] = await Promise.all([
    listDocuments(c.id), getReport(c.id), getPendingApproval(c.id), getDecision(c.id),
  ]);
  res.json({
    ...c,
    running: isRunning(c.id),
    documents: documents.map((d) => ({ id: d.id, docType: d.docType })),
    report: report?.content ?? null,
    reportMarkdown: report?.markdown ?? null,
    pendingApproval: pending ? { id: pending.id, payload: pending.payload, createdAt: pending.created_at } : null,
    decision: decision ?? null,
  });
});

app.get('/api/cases/:id/trace', async (req: Request, res: Response) => {
  const runs = await listAgentRuns(req.params.id);
  res.json(runs);
});

// 案件级 SSE：实时推送 Agent 进度 / 审批请求 / 完成事件
app.get('/api/cases/:id/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 2000\n\n');
  const unsubscribe = bus.subscribe(req.params.id, (e) => {
    res.write(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
  });
  const heartbeat = setInterval(() => res.write(':hb\n\n'), 15000);
  req.on('close', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
});

// 人工审批：恢复 interrupt 挂起的工作流（Command(resume)）
app.post('/api/cases/:id/approve', async (req: Request, res: Response) => {
  try {
    const c = await getCase(req.params.id);
    if (!c) return res.status(404).json({ error: 'NOT_FOUND' });
    if (!c.threadId) return res.status(409).json({ error: 'NOT_SUSPENDED', message: '案件无挂起线程' });
    const pending = await getPendingApproval(c.id);
    if (!pending) return res.status(409).json({ error: 'NO_PENDING_APPROVAL', message: '无待审批单（可能已审批）' });
    if (isRunning(c.id)) return res.status(409).json({ error: 'CASE_RUNNING', message: '案件流程正在执行，请稍后' });
    const body = req.body ?? {};
    const decision: ApprovalDecision = {
      decision: body.decision === 'approve' ? 'approve' : 'reject',
      approver: String(body.approver ?? 'reviewer'),
      comment: body.comment ? String(body.comment) : undefined,
    };
    await resumeCase(c, decision);
    res.status(202).json({ status: 'resuming', decision });
  } catch (err: any) {
    if (String(err?.message ?? err).includes('CASE_RUNNING')) {
      return res.status(409).json({ error: 'CASE_RUNNING', message: '案件流程正在执行，请稍后' });
    }
    res.status(500).json({ error: 'RESUME_FAILED', message: String(err?.message ?? err) });
  }
});

// 最终决策（赔付/拒赔）：与 Agent 自动分析隔离的高影响操作，需要审批令牌 + 审计落库
app.post('/api/cases/:id/decision', async (req: Request, res: Response) => {
  if (req.get('X-Approver-Token') !== config.approverToken) {
    return res.status(403).json({ error: 'FORBIDDEN', message: '需要审批权限（X-Approver-Token）' });
  }
  const c = await getCase(req.params.id);
  if (!c) return res.status(404).json({ error: 'NOT_FOUND' });
  if (c.status !== 'completed') return res.status(409).json({ error: 'CASE_NOT_COMPLETED', message: '审核未完成，不可决策' });
  const report = await getReport(c.id);
  if (!report) return res.status(409).json({ error: 'NO_REPORT', message: '缺少审核报告' });
  const body = req.body ?? {};
  const action = body.action === 'reject' ? 'reject' : 'pay';
  const amount = Number(body.amount ?? (report.content.suggestedPayout ?? 0));
  await insertDecision({ caseId: c.id, action, amount, operator: String(body.operator ?? 'reviewer'), comment: body.comment });
  await insertAgentRun({
    agent: 'human', action: `decision:${action}`, status: 'ok', durationMs: 0,
    caseId: c.id, threadId: c.threadId, detail: { amount, operator: body.operator ?? 'reviewer' },
  });
  bus.emitCase(c.id, { type: 'done', label: `最终决策：${action === 'pay' ? `赔付 ${amount} 元` : '拒赔'}` });
  res.json({ status: 'ok', action, amount });
});

export async function findCaseByIdOrNo(key: string): Promise<CaseRec | null> {
  return (await getCase(key)) ?? (await getCaseByNo(key));
}
