// 人工审批节点：高风险/证据不足/结果冲突的案件在此 interrupt() 挂起，
// 等待审批决定后经 Command({resume}) 恢复流程；审批单落库（pending 唯一索引防重复）。
import { interrupt } from '@langchain/langgraph';
import { traced } from '../../services/audit.js';
import { getPendingApproval, insertApproval, setApprovalDecision, updateCaseStatus } from '../../db/repo.js';
import { bus } from '../../services/bus.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import type { ApprovalDecision, ApprovalRequest, RuleHit } from '../../types.js';
import { nodeCtx, notifyAgent } from './util.js';

function suggestedAction(blockHits: RuleHit[]): string {
  const b = blockHits[0];
  if (!b) return '人工核定赔付方案';
  switch (b.code) {
    case 'R001': return '要求申请人补齐材料后重新提交审核';
    case 'R002': return '按规则拟拒赔，请审批确认';
    case 'R003': return '拟降额至保价上限赔付，请审批确认';
    case 'R006': return '疑似重复理赔，建议转反欺诈调查';
    default: return '人工核定';
  }
}

/** 宽松解析审批决定（审批端输入不可信时兜底为 reject，保证流程可控） */
export function normalizeDecision(v: unknown): ApprovalDecision {
  const o = (v ?? {}) as Record<string, unknown>;
  return {
    decision: o.decision === 'approve' ? 'approve' : 'reject',
    approver: String(o.approver ?? 'unknown'),
    comment: o.comment ? String(o.comment) : undefined,
  };
}

export async function approvalNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  const existing = await getPendingApproval(ctx.caseId);

  let payload: ApprovalRequest;
  if (existing) {
    payload = existing.payload as ApprovalRequest;
  } else {
    payload = {
      type: 'approval',
      caseId: ctx.caseId,
      caseNo: state.caseNo,
      risk: state.risk!,
      blockHits: (state.ruleHits ?? []).filter((h) => h.level === 'block'),
      conflicts: state.conflicts ?? [],
      suggestedAction: suggestedAction((state.ruleHits ?? []).filter((h) => h.level === 'block')),
    };
    await insertApproval({ caseId: ctx.caseId, threadId: ctx.threadId ?? '', payload });
    await updateCaseStatus(ctx.caseId, 'waiting_approval').catch(() => {});
    notifyAgent(ctx.caseId, 'approval', 'start', `案件 ${state.caseNo} 需人工审批：${payload.suggestedAction}`, payload);
    bus.emitCase(ctx.caseId, { type: 'approval_request', data: payload });
  }

  // 挂起等待人工审批；恢复时 interrupt() 直接返回注入的审批决定
  const resumed = interrupt(payload);

  const { result: decision, run } = await traced(ctx, 'approval', 'record', async (setMeta) => {
    const d = normalizeDecision(resumed);
    setMeta({ detail: d });
    return d;
  });

  const pending = await getPendingApproval(ctx.caseId);
  if (pending) await setApprovalDecision(pending.id, decision);
  await updateCaseStatus(ctx.caseId, 'reporting').catch(() => {});
  notifyAgent(ctx.caseId, 'approval', 'done', `审批结果：${decision.decision === 'approve' ? '通过' : '拒绝'}（${decision.approver}）${decision.comment ? `，备注：${decision.comment}` : ''}`, decision);

  return { approval: decision, agentRuns: [run] };
}
