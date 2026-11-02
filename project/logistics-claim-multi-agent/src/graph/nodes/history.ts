// 历史工单核验 Agent：并行核验的另一数据源——查询理赔人历史理赔记录与运单历史工单，
// 输出风险标志（高频理赔/重复理赔/未结投诉等），LLM 归纳 + 规则兜底。
import { z } from 'zod';
import { callJson, withRetry } from '../../services/llm.js';
import { traced } from '../../services/audit.js';
import { getCase, listClaimHistory, listWorkOrders, updateCaseStatus } from '../../db/repo.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import type { EvidenceRef, HistoryVerify } from '../../types.js';
import { nodeCtx, notifyAgent } from './util.js';

const FlagsSchema = z.object({
  riskFlags: z.array(z.string()).describe('风险标志：高频理赔/重复理赔嫌疑/未结投诉/历史拒赔等'),
});

export async function historyNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  notifyAgent(ctx.caseId, 'history', 'start', '历史工单核验');
  await updateCaseStatus(ctx.caseId, 'verifying').catch(() => {});

  try {
    const caseRec = await getCase(ctx.caseId);
    const phone = (state.parsed as any)?.phone || caseRec?.claimantPhone || '';

    // 多源查询：理赔历史（按手机号）+ 运单历史工单（按运单号）
    const [claims, orders] = await Promise.all([listClaimHistory(phone), listWorkOrders(state.waybillNo)]);

    const now = Date.now();
    const in90d = claims.filter((c) => now - new Date(c.createdAt).getTime() <= 90 * 86400_000);
    const claims90d = in90d.length;
    const totalPaidAmount = in90d.filter((c) => c.conclusion.includes('赔付')).reduce((s, c) => s + c.amount, 0);
    const sameWaybillClaimed = claims.some((c) => c.waybillNo === state.waybillNo && c.conclusion.includes('赔付'));
    const openWorkOrders = orders.filter((o) => o.status === 'open').length;

    const { result: flags, run } = await traced(ctx, 'history', 'analyze', async (setMeta) => {
      try {
        const { value, usage } = await withRetry(() =>
          callJson({
            schema: FlagsSchema,
            tag: 'history_analyze',
            system: '你是历史工单核验 Agent。根据理赔人历史理赔记录与运单历史工单，归纳风险标志 riskFlags（如：90天内高频理赔、同运单重复理赔嫌疑、未结投诉、历史拒赔记录）。没有风险则返回空数组。',
            user: JSON.stringify({ currentWaybillNo: state.waybillNo, claims: in90d, workOrders: orders }),
          }),
        );
        setMeta({ model: usage.model, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens });
        return value.riskFlags;
      } catch (err: any) {
        setMeta({ detail: { degraded: true, error: String(err?.message ?? err) } });
        const fallback: string[] = [];
        if (sameWaybillClaimed) fallback.push('同运单已赔付，重复理赔嫌疑');
        if (claims90d >= 3) fallback.push(`90 天内理赔 ${claims90d} 次，高频理赔`);
        if (openWorkOrders > 0) fallback.push(`存在 ${openWorkOrders} 个未结工单`);
        return fallback;
      }
    });

    const evidence: EvidenceRef[] = [
      { source: 'history', ref: `claim_history:${phone}`, note: `${claims90d} 条/90天` },
      { source: 'history', ref: `work_orders:${state.waybillNo}`, note: `${orders.length} 条工单` },
    ];

    const verify: HistoryVerify = {
      claimantPhone: phone, claims90d, totalPaidAmount, sameWaybillClaimed, openWorkOrders,
      riskFlags: flags, evidence,
    };
    notifyAgent(ctx.caseId, 'history', 'done', `历史核验：90 天理赔 ${claims90d} 次，风险标志 ${flags.length} 项`, verify);
    return { historyVerify: verify, agentRuns: [run] };
  } catch (err: any) {
    notifyAgent(ctx.caseId, 'history', 'error', `历史核验失败：${String(err?.message ?? err)}`);
    return { errors: [`history: ${String(err?.message ?? err)}`] };
  } finally {
    await updateCaseStatus(ctx.caseId, 'verifying').catch(() => {});
  }
}
