// 材料解析 Agent：汇总多模态 OCR 抽取结果，LLM 结构化合并 + 交叉对账，
// 输出标准化理赔要素与文档间冲突（信息缺失/数据冲突在这里暴露）。
import { z } from 'zod';
import { callJson, withRetry } from '../../services/llm.js';
import { traced } from '../../services/audit.js';
import { updateCaseStatus } from '../../db/repo.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import type { Conflict, EvidenceRef, OcrResult } from '../../types.js';
import { nodeCtx, notifyAgent, notifyStatus } from './util.js';

const ParsedSchema = z.object({
  claimant: z.string(),
  phone: z.string(),
  waybillNo: z.string(),
  declaredAmount: z.number(),
  incident: z.string(),
  applyTime: z.string().describe('ISO 时间字符串'),
  goodsCategory: z.string(),
  damagedUnits: z.number(),
  totalUnits: z.number(),
  damageSummary: z.string(),
  ocrIssues: z.array(z.string()).describe('OCR 质量问题/字段缺失提示'),
});

export type ParsedClaim = z.infer<typeof ParsedSchema>;

function docRef(d: { id: string; docType: string }, note?: string): EvidenceRef {
  return { source: 'document', ref: `document:${d.id}`, note: note ?? d.docType };
}

/** 确定性对账：文档间金额/单号/件数冲突（不依赖 LLM，可复核） */
export function reconcileConflicts(documents: { id: string; docType: string; ocr: OcrResult }[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const byType = (t: string) => documents.find((d) => d.docType === t);
  const form = byType('application_form');
  const invoice = byType('invoice');
  const wbPhoto = byType('waybill_photo');
  if (form && invoice) {
    const declared = Number(form.ocr.fields.declaredAmount ?? 0);
    const invAmount = Number(invoice.ocr.fields.amount ?? 0);
    if (declared > 0 && invAmount > 0 && Math.abs(declared - invAmount) / invAmount > 0.01) {
      conflicts.push({
        field: 'declaredAmount',
        detail: `申请表申报金额 ${declared} 元与发票金额 ${invAmount} 元不一致`,
        sources: [docRef(form, 'declaredAmount'), docRef(invoice, 'amount')],
      });
    }
  }
  if (form && wbPhoto) {
    const w1 = String(form.ocr.fields.waybillNo ?? '');
    const w2 = String(wbPhoto.ocr.fields.waybillNo ?? '');
    if (w1 && w2 && w1 !== w2) {
      conflicts.push({ field: 'waybillNo', detail: `申请表运单号 ${w1} 与运单影像 ${w2} 不一致`, sources: [docRef(form, 'waybillNo'), docRef(wbPhoto, 'waybillNo')] });
    }
  }
  return conflicts;
}

export async function parseNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  notifyAgent(ctx.caseId, 'parse', 'start', '材料解析');
  await updateCaseStatus(ctx.caseId, 'parsing').catch(() => {});
  notifyStatus(ctx.caseId, '材料解析中');

  const documents = state.documents ?? [];
  const ocrPayload = documents.map((d) => ({ id: d.id, docType: d.docType, fields: d.ocr.fields, confidence: d.ocr.confidence }));

  const { result: parsed, run } = await traced(ctx, 'parse', 'extract', async (setMeta) => {
    try {
      const { value, usage } = await withRetry(() =>
        callJson({
          schema: ParsedSchema,
          tag: 'parse_extract',
          system: [
            '你是理赔材料解析 Agent。输入是多模态模型对各材料影像的 OCR 抽取结果（JSON）。',
            '任务：合并抽取标准化理赔要素。规则：以申请表(application_form)为基准；材料间冲突不要自行裁决，如实抽取并在 ocrIssues 中标注；缺失字段给出合理默认值并在 ocrIssues 标注。',
          ].join('\n'),
          user: JSON.stringify({ documents: ocrPayload, caseType: state.caseType, waybillNo: state.waybillNo }),
        }),
      );
      setMeta({ model: usage.model, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens });
      return value as ParsedClaim;
    } catch (err: any) {
      // 容错：LLM 失败时以申请表 OCR 为准，流程继续
      const form = documents.find((d) => d.docType === 'application_form');
      const f = (form?.ocr.fields ?? {}) as Record<string, any>;
      setMeta({ detail: { degraded: true, error: String(err?.message ?? err) } });
      return {
        claimant: String(f.claimant ?? ''), phone: String(f.phone ?? ''), waybillNo: String(f.waybillNo ?? state.waybillNo ?? ''),
        declaredAmount: Number(f.declaredAmount ?? state.declaredAmount ?? 0), incident: String(f.incident ?? ''),
        applyTime: String(f.applyTime ?? ''), goodsCategory: '未知', damagedUnits: 0, totalUnits: 0,
        damageSummary: '', ocrIssues: ['LLM 解析失败，降级为申请表 OCR 直读'],
      } satisfies ParsedClaim;
    }
  });

  const conflicts = reconcileConflicts(documents);
  for (const c of conflicts) {
    notifyAgent(ctx.caseId, 'parse', 'done', `发现冲突：${c.detail}`);
  }
  notifyAgent(ctx.caseId, 'parse', 'done', `解析完成：申报 ${parsed.declaredAmount} 元，${documents.length} 份材料${conflicts.length ? `，${conflicts.length} 处冲突` : ''}`, parsed);
  notifyStatus(ctx.caseId, '多源核验中');

  return { parsed: parsed as unknown as Record<string, unknown>, conflicts, agentRuns: [run] };
}
