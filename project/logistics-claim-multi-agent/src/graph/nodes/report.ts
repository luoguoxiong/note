// 报告生成 Agent：汇总材料解析、业务核验、规则命中、风险评估与审批记录，
// 生成结构化审核意见（每个结论带证据引用），落库并输出 Markdown 归档。
import { z } from 'zod';
import { mkdir, writeFile } from 'node:fs/promises';
import { callJson, withRetry } from '../../services/llm.js';
import { traced } from '../../services/audit.js';
import { updateCaseStatus, upsertReport } from '../../db/repo.js';
import { config, ROOT_DIR } from '../../config.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import type { EvidenceSource, ReportResult } from '../../types.js';
import { nodeCtx, notifyAgent, notifyStatus } from './util.js';

const ReportSchema = z.object({
  conclusion: z.enum(['approve', 'reject', 'manual_review']),
  suggestedPayout: z.number().nullable().describe('建议赔付金额，拒绝时为 0'),
  opinion: z.string().describe('审核意见摘要（200 字内）'),
  basis: z.array(z.object({
    point: z.string().describe('结论依据点'),
    refs: z.array(z.object({
      source: z.enum(['document', 'waybill', 'history', 'rule', 'risk']),
      ref: z.string(),
      note: z.string().optional(),
    })).describe('证据引用'),
  })),
  nextSteps: z.array(z.string()).describe('后续动作建议'),
});

/** 校准：赔付上限与结论约束（LLM 输出不越界；审批拒绝时结论强制 reject） */
export function calibrateReport(raw: ReportResult, state: ClaimStateType): ReportResult {
  let report = { ...raw };
  const insured = state.waybillVerify?.insuredAmount;
  if (report.suggestedPayout != null) {
    let payout = report.suggestedPayout;
    if (payout > state.declaredAmount) payout = state.declaredAmount;
    if (insured != null && payout > insured) payout = insured;
    report.suggestedPayout = Math.max(0, Math.round(payout * 100) / 100);
  }
  if (state.approval?.decision === 'reject') {
    report = { ...report, conclusion: 'reject', suggestedPayout: 0 };
  }
  return report;
}

/** LLM 不可用时的兜底报告 */
function fallbackReport(state: ClaimStateType): ReportResult {
  const approved = state.approval?.decision === 'approve';
  const rejected = state.approval?.decision === 'reject';
  const conclusion: ReportResult['conclusion'] = rejected ? 'reject' : approved ? 'approve' : 'manual_review';
  return {
    conclusion,
    suggestedPayout: conclusion === 'approve' ? state.declaredAmount : 0,
    opinion: '报告生成 Agent 不可用，按规则审核与风险分级结果出具兜底意见。',
    basis: (state.ruleHits ?? []).slice(0, 5).map((h) => ({ point: `${h.code} ${h.title}: ${h.detail}`, refs: h.evidenceRefs })),
    nextSteps: conclusion === 'approve' ? ['按建议金额发起赔付'] : ['人工复核'],
  };
}

export function renderReportMd(caseNo: string, state: ClaimStateType, report: ReportResult): string {
  const lines: string[] = [];
  lines.push(`# 理赔审核报告 ${caseNo}`);
  lines.push('');
  lines.push(`- 结论：**${report.conclusion}**　建议赔付：**${report.suggestedPayout ?? '—'} 元**`);
  lines.push(`- 案件类型：${state.caseType}　申报金额：${state.declaredAmount} 元`);
  if (state.approval) lines.push(`- 人工审批：${state.approval.decision === 'approve' ? '通过' : '拒绝'}（${state.approval.approver}）${state.approval.comment ?? ''}`);
  lines.push('');
  lines.push(`## 审核意见\n\n${report.opinion}`);
  lines.push('\n## 依据');
  for (const b of report.basis) {
    lines.push(`- ${b.point}${b.refs.length ? `　[${b.refs.map((r) => `${r.source}:${r.ref}`).join(' ; ')}]` : ''}`);
  }
  lines.push('\n## 规则命中');
  for (const h of state.ruleHits ?? []) lines.push(`- **${h.level.toUpperCase()}** ${h.code} ${h.title}：${h.detail}`);
  lines.push('\n## 风险评估');
  if (state.risk) lines.push(`- ${state.risk.level.toUpperCase()}（${state.risk.score} 分）→ ${state.risk.recommendation}${state.risk.forcedByRule ? `（规则强制 ${state.risk.forcedByRule}）` : ''}：${state.risk.reason}`);
  lines.push('\n## 后续动作');
  for (const s of report.nextSteps) lines.push(`- ${s}`);
  lines.push('');
  return lines.join('\n');
}

export async function reportNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  notifyAgent(ctx.caseId, 'report', 'start', '生成审核报告');
  await updateCaseStatus(ctx.caseId, 'reporting').catch(() => {});
  notifyStatus(ctx.caseId, '报告生成中');

  const input = {
    caseNo: state.caseNo, caseType: state.caseType, declaredAmount: state.declaredAmount,
    parsed: state.parsed, conflicts: state.conflicts,
    waybill: state.waybillVerify ? { found: state.waybillVerify.found, signedAt: state.waybillVerify.signedAt, anomalies: state.waybillVerify.anomalies, insuredAmount: state.waybillVerify.insuredAmount } : null,
    history: state.historyVerify ?? null,
    ruleHits: state.ruleHits, risk: state.risk,
    approval: state.approval ?? null,
  };

  const { result: raw, run } = await traced(ctx, 'report', 'generate', async (setMeta) => {
    try {
      const { value, usage } = await withRetry(() =>
        callJson({
          schema: ReportSchema,
          tag: 'report_generate',
          maxTokens: 4000,
          system: [
            '你是理赔报告生成 Agent。汇总输入的全部审核过程数据，生成结构化审核意见。',
            '要求：依据点 basis 不超过 6 条（挑最关键的），每个依据点必须附证据引用（refs 最多 3 个，指向材料/运单/历史/规则/风险的编号）；意见 opinion 控制在 120 字内；审批已拒绝时 conclusion=reject 且赔付为 0；建议赔付不超过申报金额与保价金额的较小值。',
          ].join('\n'),
          user: JSON.stringify(input),
        }),
      );
      setMeta({ model: usage.model, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens });
      return value as ReportResult;
    } catch (err) {
      setMeta({ detail: { degraded: true } });
      return fallbackReport(state);
    }
  });

  const report = calibrateReport(raw, state);
  const markdown = renderReportMd(state.caseNo, state, report);
  await upsertReport(ctx.caseId, report, markdown);
  await mkdir(`${ROOT_DIR}data/reports`, { recursive: true }).catch(() => {});
  await writeFile(`${ROOT_DIR}data/reports/${state.caseNo}.md`, markdown, 'utf8').catch(() => {});

  await updateCaseStatus(ctx.caseId, 'completed').catch(() => {});
  notifyAgent(ctx.caseId, 'report', 'done', `报告完成：结论 ${report.conclusion}，建议赔付 ${report.suggestedPayout ?? '—'} 元`, report);
  notifyStatus(ctx.caseId, '审核完成');
  return { report, agentRuns: [run] };
}
