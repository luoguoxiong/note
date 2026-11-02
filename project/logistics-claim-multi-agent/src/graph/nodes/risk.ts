// 风险评估 Agent：综合规则命中、多源核验异常与信息冲突，对案件进行风险分级。
// LLM 评估 + 确定性约束叠加：命中规则红线强制高风险（LLM 只能加严不能放宽）。
import { z } from 'zod';
import { callJson, withRetry } from '../../services/llm.js';
import { traced } from '../../services/audit.js';
import { hasBlock } from '../rules.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import type { RiskResult } from '../../types.js';
import { nodeCtx, notifyAgent } from './util.js';

const RiskSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  score: z.number().min(0).max(100),
  factors: z.array(z.string()).describe('风险因子'),
  reason: z.string(),
  recommendation: z.enum(['auto_approve', 'manual_review', 'reject']),
});

export async function riskNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  notifyAgent(ctx.caseId, 'risk', 'start', '风险评估');

  const ruleSummary = (state.ruleHits ?? []).map((h) => `${h.level.toUpperCase()} ${h.code} ${h.title}: ${h.detail}`);
  const conflicts = state.conflicts ?? [];

  const { result: llmRisk, run } = await traced(ctx, 'risk', 'assess', async (setMeta) => {
    try {
      const { value, usage } = await withRetry(() =>
        callJson({
          schema: RiskSchema,
          tag: 'risk_assess',
          system: [
            '你是理赔风险评估 Agent。综合规则审核命中结果、运单核验异常、历史理赔风险标志与材料冲突，输出风险分级。',
            'level: low=可自动通过, medium=建议人工复核, high=必须人工审批/疑似违规。',
            'recommendation 与 level 对应：low→auto_approve, medium→manual_review, high→manual_review 或 reject。',
          ].join('\n'),
          user: JSON.stringify({
            caseType: state.caseType,
            declaredAmount: state.declaredAmount,
            ruleHits: ruleSummary,
            conflicts: conflicts.map((c) => c.detail),
            waybillAnomalies: state.waybillVerify?.anomalies ?? [],
            historyRiskFlags: state.historyVerify?.riskFlags ?? [],
            historyVerifyEnabled: !!state.historyVerify,
          }),
        }),
      );
      setMeta({ model: usage.model, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens });
      return value as RiskResult;
    } catch (err) {
      // 容错：LLM 失败时按规则确定性分级
      setMeta({ detail: { degraded: true } });
      const block = hasBlock(state.ruleHits ?? []);
      return {
        level: block ? 'high' : (state.historyVerify?.riskFlags.length || conflicts.length) ? 'medium' : 'low',
        score: block ? 90 : 50,
        factors: ['LLM 评估不可用，按规则结果分级'],
        reason: '降级评估',
        recommendation: block ? 'manual_review' : 'manual_review',
      } satisfies RiskResult;
    }
  });

  // 确定性叠加：红线强制 high + 人工复核；冲突/证据缺失至少 medium
  let risk: RiskResult = { ...llmRisk };
  const block = hasBlock(state.ruleHits ?? []);
  if (block) {
    risk = {
      ...risk,
      level: 'high',
      score: Math.max(risk.score, 85),
      recommendation: 'manual_review',
      forcedByRule: block.code,
      factors: [...risk.factors, `规则红线 ${block.code} ${block.title}：${block.detail}`],
    };
  } else if (conflicts.length > 0 && risk.level === 'low') {
    risk = { ...risk, level: 'medium', recommendation: 'manual_review', factors: [...risk.factors, `存在 ${conflicts.length} 处材料信息冲突`] };
  } else if (!state.waybillVerify && risk.level === 'low') {
    risk = { ...risk, level: 'medium', recommendation: 'manual_review', factors: [...risk.factors, '运单核验缺失，证据不足'] };
  }

  notifyAgent(ctx.caseId, 'risk', 'done', `风险分级：${risk.level.toUpperCase()}（${risk.score} 分）→ ${risk.recommendation}`, risk);
  return { risk, agentRuns: [run] };
}
