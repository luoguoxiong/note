// 确定性规则引擎（不走 LLM，可独立测试）：材料完整性 / 理赔时效 / 金额约束 /
// 生鲜温控 / 禁运品类 / 重复与高频理赔 / 核验完整性。
import type { CaseRec, DocumentRec, HistoryVerify, RuleHit, WaybillVerify } from '../types.js';
import { config } from '../config.js';

const REQUIRED_COMMON = ['application_form', 'waybill_photo', 'damage_photo'];
const REQUIRED_BY_TYPE: Record<CaseRec['caseType'], string[]> = {
  fresh: ['cold_chain_record'],
  digital: ['invoice'],
  general: [],
};
const SLA_HOURS: Record<CaseRec['caseType'], number> = { fresh: 48, general: 24 * 7, digital: 24 * 15 };

export interface RulesInput {
  case: CaseRec;
  documents: DocumentRec[];
  waybillVerify: WaybillVerify | null;
  historyVerify: HistoryVerify | null;
}

export function runRules(input: RulesInput): RuleHit[] {
  const { case: c, documents, waybillVerify, historyVerify } = input;
  const hits: RuleHit[] = [];
  const docRef = (d: DocumentRec, note?: string) => ({ source: 'document' as const, ref: `document:${d.id}`, note: note ?? d.docType });
  const have = new Set(documents.map((d) => d.docType));
  const byType = (t: string) => documents.find((d) => d.docType === t);

  // R001 材料完整性
  const missing = [...REQUIRED_COMMON, ...(REQUIRED_BY_TYPE[c.caseType] ?? [])].filter((x) => !have.has(x));
  hits.push(
    missing.length === 0
      ? { code: 'R001', title: '材料完整性', level: 'pass', detail: `必备材料齐全，共 ${documents.length} 份`, evidenceRefs: documents.map((d) => docRef(d)) }
      : { code: 'R001', title: '材料完整性', level: 'block', detail: `缺少必备材料：${missing.join('、')}`, evidenceRefs: [] },
  );

  // R002 理赔时效（签收后 SLA 内申请）
  const applyTime = byType('application_form')?.ocr.fields.applyTime as string | undefined;
  const signedAt = waybillVerify?.signedAt ?? null;
  if (!applyTime) {
    hits.push({ code: 'R002', title: '理赔时效', level: 'warn', detail: '申请表缺失申请时间，无法核验理赔时效', evidenceRefs: [] });
  } else if (!signedAt) {
    hits.push({ code: 'R002', title: '理赔时效', level: 'warn', detail: '运单无签收时间（未签收/在途丢失），时效以平台立案时间为准', evidenceRefs: [{ source: 'waybill', ref: `shipment:${c.waybillNo}`, note: '无签收记录' }] });
  } else {
    const hours = (new Date(applyTime).getTime() - new Date(signedAt).getTime()) / 3600_000;
    if (hours < 0) {
      hits.push({ code: 'R002', title: '理赔时效', level: 'warn', detail: `申请时间早于签收时间（${hours.toFixed(1)}h），时间线异常，需人工核实`, evidenceRefs: [docRef(byType('application_form')!)] });
    } else if (hours > SLA_HOURS[c.caseType]) {
      hits.push({ code: 'R002', title: '理赔时效', level: 'block', detail: `签收后 ${hours.toFixed(0)}h 才申请，超过 ${c.caseType === 'fresh' ? '48h' : `${SLA_HOURS[c.caseType] / 24} 天`}理赔时效`, evidenceRefs: [{ source: 'waybill', ref: `shipment:${c.waybillNo}`, note: 'signedAt' }] });
    } else {
      hits.push({ code: 'R002', title: '理赔时效', level: 'pass', detail: `签收后 ${hours.toFixed(0)}h 内申请，符合时效要求`, evidenceRefs: [{ source: 'waybill', ref: `shipment:${c.waybillNo}` }] });
    }
  }

  // R003 金额约束（申报 ≤ 保价；申报 vs 发票一致性；大额提示）
  const insured = waybillVerify?.insuredAmount;
  if (insured == null) {
    hits.push({ code: 'R003', title: '金额约束', level: 'warn', detail: '未查到保价金额，无法校验申报金额上限', evidenceRefs: [] });
  } else if (c.declaredAmount > insured) {
    hits.push({ code: 'R003', title: '金额约束', level: 'block', detail: `申报金额 ${c.declaredAmount} 元超过保价金额 ${insured} 元，超出部分不在赔付范围`, evidenceRefs: [{ source: 'waybill', ref: `shipment:${c.waybillNo}`, note: 'insuredAmount' }] });
  } else {
    hits.push({ code: 'R003', title: '金额约束', level: 'pass', detail: `申报金额 ${c.declaredAmount} 元 ≤ 保价金额 ${insured} 元`, evidenceRefs: [{ source: 'waybill', ref: `shipment:${c.waybillNo}` }] });
  }
  const invoice = byType('invoice');
  if (invoice) {
    const invAmount = Number(invoice.ocr.fields.amount ?? 0);
    if (invAmount > 0 && Math.abs(c.declaredAmount - invAmount) / invAmount > 0.01) {
      hits.push({ code: 'R003', title: '金额约束', level: 'warn', detail: `申报金额 ${c.declaredAmount} 元与发票金额 ${invAmount} 元不一致`, evidenceRefs: [docRef(invoice, 'amount')] });
    }
  }
  if (c.declaredAmount > config.largeAmountThreshold) {
    hits.push({ code: 'R003', title: '金额约束', level: 'warn', detail: `申报金额 ${c.declaredAmount} 元超过大额阈值 ${config.largeAmountThreshold} 元，建议人工复核`, evidenceRefs: [] });
  }

  // R004 生鲜温控
  if (c.caseType === 'fresh') {
    const cc = byType('cold_chain_record');
    if (!cc) {
      hits.push({ code: 'R004', title: '冷链温控', level: 'warn', detail: '生鲜案件缺失温控记录，无法确认冷链运输合规，影响赔付比例认定', evidenceRefs: [] });
    } else {
      const breaches = Number(cc.ocr.fields.breachCount ?? 0);
      hits.push(
        breaches > 0
          ? { code: 'R004', title: '冷链温控', level: 'warn', detail: `温控记录存在 ${breaches} 次超标`, evidenceRefs: [docRef(cc, 'breachCount')] }
          : { code: 'R004', title: '冷链温控', level: 'pass', detail: '温控记录正常，无超标', evidenceRefs: [docRef(cc)] },
      );
    }
  }

  // R005 禁运/违规品类
  const cat = String(byType('damage_photo')?.ocr.fields.goodsCategory ?? '');
  if (/充电宝|锂电池|易燃|易爆|管制/.test(cat)) {
    hits.push({ code: 'R005', title: '禁运品类', level: 'block', detail: `疑似禁运品类（${cat}），不属于理赔范围`, evidenceRefs: byType('damage_photo') ? [docRef(byType('damage_photo')!, 'goodsCategory')] : [] });
  }

  // R006 重复/高频理赔（依赖历史工单核验结果）
  if (historyVerify) {
    if (historyVerify.sameWaybillClaimed) {
      hits.push({ code: 'R006', title: '重复理赔', level: 'block', detail: '同运单已存在理赔记录，涉嫌重复理赔', evidenceRefs: historyVerify.evidence });
    } else if (historyVerify.claims90d >= 3) {
      hits.push({ code: 'R006', title: '高频理赔', level: 'warn', detail: `90 天内理赔 ${historyVerify.claims90d} 次（累计 ${historyVerify.totalPaidAmount} 元），高频特征明显`, evidenceRefs: historyVerify.evidence });
    } else {
      hits.push({ code: 'R006', title: '理赔频次', level: 'pass', detail: `90 天内理赔 ${historyVerify.claims90d} 次，未见异常`, evidenceRefs: historyVerify.evidence });
    }
  }

  // R007 核验完整性（运单核验失败 → 证据不足）
  if (!waybillVerify) {
    hits.push({ code: 'R007', title: '核验完整性', level: 'warn', detail: '运单核验失败或超时，关键证据缺失，需人工核实', evidenceRefs: [] });
  }

  return hits;
}

/** 规则汇总：是否存在 block 红线 */
export function hasBlock(hits: RuleHit[]): RuleHit | null {
  return hits.find((x) => x.level === 'block') ?? null;
}
