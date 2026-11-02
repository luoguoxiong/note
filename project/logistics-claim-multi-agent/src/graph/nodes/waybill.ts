// 运单核验 Agent：经 MCP 协议调用运单系统工具（物流轨迹/签收/保价、生鲜温控事件），
// 幂等保护避免重复调用业务接口；LLM 归纳异常线索，失败降级为确定性比对。
import { z } from 'zod';
import { callJson, withRetry } from '../../services/llm.js';
import { traced } from '../../services/audit.js';
import { getWaybillTools } from '../../services/mcp.js';
import { withIdempotency } from '../../services/idempotency.js';
import { getShipment, updateCaseStatus } from '../../db/repo.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import type { WaybillEvent, WaybillVerify } from '../../types.js';
import { nodeCtx, notifyAgent, notifyStatus } from './util.js';

interface TrackData {
  found: boolean;
  waybillNo: string;
  route?: string;
  goodsDesc?: string;
  insuredAmount?: number;
  signedAt?: string | null;
  signedBy?: string;
  events?: { time: string; status: string; desc: string }[];
}

const AnalysisSchema = z.object({
  found: z.boolean(),
  signedAt: z.string().nullable(),
  signedBy: z.string().nullable(),
  insuredAmount: z.number().nullable(),
  anomalies: z.array(z.string()).describe('异常线索（时间线矛盾/签收异常/在途异常等）'),
});

async function queryTrack(waybillNo: string): Promise<{ data: TrackData | null; viaMcp: boolean }> {
  const { tools, viaMcp } = await getWaybillTools();
  if (viaMcp && tools['query_track']) {
    const raw = (await tools['query_track'].invoke({ waybill_no: waybillNo })) as unknown;
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
    return { data: JSON.parse(text) as TrackData, viaMcp: true };
  }
  const s = await getShipment(waybillNo); // 降级：直连本地数据源
  if (!s) return { data: { found: false, waybillNo }, viaMcp: false };
  return {
    data: {
      found: true, waybillNo: s.waybillNo, route: s.route, goodsDesc: s.goodsDesc,
      insuredAmount: s.insuredAmount, signedAt: s.signedAt, signedBy: s.signedBy, events: s.events,
    },
    viaMcp: false,
  };
}

async function queryTemperature(waybillNo: string): Promise<{ time: string; tempC: number; ok: boolean }[]> {
  const { tools, viaMcp } = await getWaybillTools();
  try {
    if (viaMcp && tools['query_temperature_events']) {
      const raw = (await tools['query_temperature_events'].invoke({ waybill_no: waybillNo })) as unknown;
      const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
      const parsed = JSON.parse(text) as { found: boolean; temperatureEvents?: { time: string; tempC: number; ok: boolean }[] };
      return parsed.temperatureEvents ?? [];
    }
    const s = await getShipment(waybillNo);
    return s?.temperatureEvents ?? [];
  } catch {
    return [];
  }
}

/** 确定性异常比对（LLM 不可用时的兜底） */
function baselineAnomalies(track: TrackData, applyTime?: string): string[] {
  const anomalies: string[] = [];
  if (!track.found) anomalies.push('未查到运单记录，请核对运单号');
  if (!track.signedAt) anomalies.push('运单无签收记录');
  if (track.signedAt && applyTime) {
    const h = (new Date(applyTime).getTime() - new Date(track.signedAt).getTime()) / 3600_000;
    if (h < 0) anomalies.push('理赔申请时间早于签收时间，时间线异常');
  }
  const abnormal = (track.events ?? []).filter((e) => /异常|丢失|破损|告警/.test(e.status + e.desc));
  for (const e of abnormal) anomalies.push(`在途异常：${e.status} ${e.desc}`);
  return anomalies;
}

export async function waybillNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  notifyAgent(ctx.caseId, 'waybill', 'start', '运单核验');
  await updateCaseStatus(ctx.caseId, 'verifying').catch(() => {});

  try {
    // 幂等：同一案件同一运单的核验工具调用不重复发起（恢复/重试场景）
    const { value: result, duplicate } = await withIdempotency<{ data: TrackData | null; viaMcp: boolean }>(
      `waybill:track:${ctx.caseId}:${state.waybillNo}`,
      10 * 60_000,
      () => queryTrack(state.waybillNo),
    );
    // duplicate 且无缓存结果（锁被并发占用）：直连兜底，避免流程卡住
    const { data: track, viaMcp } = result ?? { data: (await queryTrack(state.waybillNo)).data, viaMcp: false };
    if (!track) throw new Error('运单查询无结果');

    const tempEvents = state.caseType === 'fresh' ? await queryTemperature(state.waybillNo) : [];
    const tempBreaches = tempEvents.filter((t) => !t.ok).length;

    const parsed = (state.parsed ?? {}) as Record<string, any>;
    const applyTime = parsed?.applyTime as string | undefined;

    const { result: analysis, run } = await traced(ctx, 'waybill', 'analyze', async (setMeta) => {
      try {
        const { value, usage } = await withRetry(() =>
          callJson({
            schema: AnalysisSchema,
            tag: 'waybill_analyze',
            system: [
              '你是运单核验 Agent。输入是运单系统的轨迹/签收/保价查询结果与理赔申请要素。',
              '任务：核对运单信息并归纳异常线索（anomalies）：时间线矛盾、无签收、代签风险、在途异常事件、保价缺失等。没有异常则返回空数组。',
            ].join('\n'),
            user: JSON.stringify({ track, applyTime, incident: parsed?.incident, claimant: parsed?.claimant, temperatureBreaches: tempBreaches }),
          }),
        );
        setMeta({ model: usage.model, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens });
        setMeta({ detail: { viaMcp } });
        return value;
      } catch (err) {
        setMeta({ detail: { degraded: true } });
        return {
          found: track.found,
          signedAt: track.signedAt ?? null,
          signedBy: track.signedBy ?? null,
          insuredAmount: track.insuredAmount ?? null,
          anomalies: baselineAnomalies(track, applyTime),
        } satisfies z.infer<typeof AnalysisSchema>;
      }
    });

    if (tempBreaches > 0 && !analysis.anomalies.some((a) => a.includes('温控'))) {
      analysis.anomalies.push(`冷链温控超标 ${tempBreaches} 次`);
    }

    const events: WaybillEvent[] = (track.events ?? []).map((e) => ({ time: e.time, status: e.status, desc: e.desc }));
    const verify: WaybillVerify = {
      waybillNo: state.waybillNo,
      found: analysis.found,
      route: track.route,
      goodsDesc: track.goodsDesc,
      insuredAmount: analysis.insuredAmount ?? track.insuredAmount,
      signedAt: analysis.signedAt ?? undefined,
      signedBy: analysis.signedBy ?? undefined,
      events,
      anomalies: analysis.anomalies,
      evidence: [{ source: 'waybill', ref: `shipment:${state.waybillNo}`, note: track.route }],
      viaMcp: !!viaMcp,
    };
    notifyAgent(ctx.caseId, 'waybill', 'done', `核验完成：${analysis.found ? '已签收' : '未查到/未签收'}，异常 ${analysis.anomalies.length} 项${verify.viaMcp ? '（MCP）' : '（本地降级）'}`, verify);
    notifyStatus(ctx.caseId, '多源核验中');
    return { waybillVerify: verify, agentRuns: [run] };
  } catch (err: any) {
    notifyAgent(ctx.caseId, 'waybill', 'error', `运单核验失败：${String(err?.message ?? err)}`);
    // 容错：不中断流程，规则引擎 R007 会将"证据不足"计入风险
    return { errors: [`waybill: ${String(err?.message ?? err)}`] };
  } finally {
    await updateCaseStatus(ctx.caseId, 'verifying').catch(() => {});
  }
}
