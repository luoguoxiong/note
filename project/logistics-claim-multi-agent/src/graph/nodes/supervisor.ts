// Supervisor（编排者）：基于案件类型/金额/材料情况生成执行计划，
// 决定启用哪些核验 Agent 与额外检查项，实现按案件类型动态选择执行路径。
// LLM 生成计划 + 确定性规则兜底/修正（LLM 只能加严，不能放宽）。
import { z } from 'zod';
import { callJson, withRetry } from '../../services/llm.js';
import { traced } from '../../services/audit.js';
import { updateCaseStatus } from '../../db/repo.js';
import { config } from '../../config.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import type { AuditPlan, CaseType } from '../../types.js';
import { nodeCtx, notifyAgent, notifyStatus } from './util.js';

const PlanSchema = z.object({
  summary: z.string().describe('一句话执行计划'),
  enableHistory: z.boolean().describe('是否并行调度历史工单核验 Agent'),
  extraChecks: z.array(z.string()).describe('额外核验要求'),
  reason: z.string().describe('编排理由'),
});

/** 确定性兜底计划：LLM 失败时保证流程可继续 */
export function fallbackPlan(caseType: CaseType, declaredAmount: number): AuditPlan {
  const enableHistory = declaredAmount >= config.largeAmountThreshold || caseType === 'fresh';
  const extraChecks = caseType === 'fresh'
    ? ['冷链温控记录核验']
    : caseType === 'digital'
      ? ['购买凭证（发票）核验']
      : [];
  return { summary: '按案件类型默认计划执行', enableHistory, extraChecks, reason: 'LLM 编排不可用，规则兜底' };
}

/** 大额案件强制启用历史核验（修正 LLM 决策） */
function enforce(plan: AuditPlan, caseType: CaseType, declaredAmount: number): AuditPlan {
  let p = { ...plan };
  if (declaredAmount >= config.largeAmountThreshold && !p.enableHistory) {
    p = { ...p, enableHistory: true, reason: `${p.reason}；金额 ${declaredAmount} ≥ 大额阈值 ${config.largeAmountThreshold}，强制启用历史核验` };
  }
  if (caseType === 'fresh' && !p.extraChecks.some((x) => x.includes('温控'))) {
    p = { ...p, extraChecks: [...p.extraChecks, '冷链温控记录核验'] };
  }
  return p;
}

export async function supervisorNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  const docTypes = (state.documents ?? []).map((d) => d.docType);
  notifyAgent(ctx.caseId, 'supervisor', 'start', '生成执行计划');
  await notifyStatusLater(ctx.caseId, 'planning', '任务编排中');

  const { result: plan, run } = await traced(ctx, 'supervisor', 'plan', async (setMeta) => {
    try {
      const { value, usage } = await withRetry(() =>
        callJson({
          schema: PlanSchema,
          tag: 'supervisor_plan',
          system: [
            '你是物流理赔审核系统的 Supervisor（编排者），负责为每一起理赔案件制定审核执行计划。',
            '可用 Agent：材料解析(parse，必选)、运单核验(waybill，必选)、历史工单核验(history，可选)、规则审核(rules，必选)、风险评估(risk，必选)、报告生成(report，必选)。',
            '编排原则：生鲜类案件骗保风险高，建议启用历史核验；申报金额大（≥大额阈值）强制启用历史核验；按案件类型补充额外核验要求（生鲜→冷链温控、数码→发票/串号、丢失→签收与立案核实）。',
          ].join('\n'),
          user: JSON.stringify({
            caseType: state.caseType,
            declaredAmount: state.declaredAmount,
            waybillNo: state.waybillNo ?? undefined,
            incidentDesc: (state.parsed as any)?.incident ?? undefined,
            大额阈值: config.largeAmountThreshold,
            documents: docTypes,
          }),
        }),
      );
      setMeta({ model: usage.model, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens });
      return value;
    } catch (err) {
      setMeta({ detail: { fallback: true } });
      return fallbackPlan(state.caseType, state.declaredAmount); // 容错：不中断流程
    }
  });

  const finalPlan = enforce(plan, state.caseType, state.declaredAmount);
  notifyAgent(ctx.caseId, 'supervisor', 'done', `计划：${finalPlan.summary}（历史核验${finalPlan.enableHistory ? '启用' : '跳过'}）`, finalPlan);

  return { plan: finalPlan, agentRuns: [run], parsed: state.parsed };
}

async function notifyStatusLater(caseId: string, status: string, label: string) {
  await updateCaseStatus(caseId, status as any).catch(() => {});
  notifyStatus(caseId, label);
}
