import type { OcrResult } from '../types.js';

/** 模拟多模态视觉模型对材料影像的抽取结果 */
export function ocr(docType: string, fields: Record<string, unknown>, confidence = 0.94): OcrResult {
  return { docType, fields, confidence, model: 'mock-vision-ocr' };
}

const h = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();
const d = (days: number) => new Date(Date.now() - days * 86400_000).toISOString();

export interface CaseTemplate {
  key: string;
  title: string;
  expect: string;
  case: {
    claimantName: string;
    claimantPhone: string;
    caseType: 'fresh' | 'digital' | 'general';
    waybillNo: string;
    declaredAmount: number;
    incidentDesc: string;
  };
  documents: { docType: string; ocr: OcrResult }[];
  shipment: {
    waybillNo: string;
    route: string;
    goodsDesc: string;
    weightKg: number;
    insuredAmount: number;
    signedAt: string;
    signedBy: string;
    events: { time: string; status: string; desc: string }[];
    temperatureEvents: { time: string; tempC: number; ok: boolean }[];
  };
  claimHistory?: { waybillNo: string; amount: number; conclusion: string; createdAt: string }[];
  workOrders?: { woType: string; status: string; description: string; createdAt: string }[];
}

/** 8 个演示案件：覆盖正常赔付 / 缺温控 / 超保价 / 高频理赔 / 超时效 / 缺材料 / 信息冲突 */
export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    key: 'fresh-normal',
    title: '生鲜水果运输破损，材料齐全、温控正常',
    expect: '低风险 → 自动通过，建议赔付',
    case: { claimantName: '陈晓东', claimantPhone: '13800000001', caseType: 'fresh', waybillNo: 'SF1001', declaredAmount: 1200, incidentDesc: '运输途中挤压导致车厢内 30% 荔枝破损' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '陈晓东', phone: '13800000001', waybillNo: 'SF1001', declaredAmount: 1200, incident: '运输途中挤压破损', applyTime: h(24 - 18 - 6) }) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1001', sender: '广州果农合作社', receiver: '北京水果批发商' }, 0.97) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '挤压破损', damagedUnits: 12, totalUnits: 40, goodsCategory: '生鲜水果' }, 0.92) },
      { docType: 'invoice', ocr: ocr('invoice', { invoiceNo: 'INV-26001', amount: 1200, goodsDesc: '荔枝 40 箱' }, 0.95) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '李强', signedAt: d(1) }, 0.93) },
      { docType: 'cold_chain_record', ocr: ocr('cold_chain_record', { avgTempC: 3.2, maxTempC: 7.8, breachCount: 0 }, 0.91) },
    ],
    shipment: {
      waybillNo: 'SF1001', route: '广州→北京', goodsDesc: '荔枝 40 箱', weightKg: 200, insuredAmount: 2000, signedAt: d(1), signedBy: '李强',
      events: [
        { time: d(3), status: '揽收', desc: '广州白云网点揽收' },
        { time: d(2.5), status: '干线', desc: '干线运输（冷链车）' },
        { time: d(1.2), status: '派送', desc: '北京朝阳营业部派送' },
        { time: d(1), status: '签收', desc: '本人签收' },
      ],
      temperatureEvents: [
        { time: d(2.8), tempC: 3.5, ok: true },
        { time: d(2.0), tempC: 4.1, ok: true },
        { time: d(1.4), tempC: 3.2, ok: true },
      ],
    },
  },
  {
    key: 'fresh-nocold',
    title: '生鲜冻品破损，未上传温控记录',
    expect: '规则 warn → 中风险 → 转人工复核',
    case: { claimantName: '王海燕', claimantPhone: '13800000002', caseType: 'fresh', waybillNo: 'SF1002', declaredAmount: 2600, incidentDesc: '到货时冻品化冻变形' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '王海燕', phone: '13800000002', waybillNo: 'SF1002', declaredAmount: 2600, incident: '化冻变形', applyTime: h(20) }) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1002' }, 0.96) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '化冻变形', damagedUnits: 8, totalUnits: 20, goodsCategory: '生鲜冷冻' }, 0.9) },
      { docType: 'invoice', ocr: ocr('invoice', { invoiceNo: 'INV-26002', amount: 2500, goodsDesc: '冷冻虾仁 20 箱' }, 0.94) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '赵敏', signedAt: d(1) }, 0.92) },
    ],
    shipment: {
      waybillNo: 'SF1002', route: '广州→成都', goodsDesc: '冷冻虾仁 20 箱', weightKg: 150, insuredAmount: 3000, signedAt: d(1), signedBy: '赵敏',
      events: [
        { time: d(2.6), status: '揽收', desc: '广州黄埔网点揽收' },
        { time: d(1.4), status: '异常', desc: '干线冷机告警，短时温度升高' },
        { time: d(1), status: '签收', desc: '代收（前台）' },
      ],
      temperatureEvents: [
        { time: d(1.6), tempC: 9.5, ok: false },
        { time: d(1.5), tempC: 12.3, ok: false },
      ],
    },
  },
  {
    key: 'digital-over',
    title: '数码产品损坏，申报金额超过保价金额',
    expect: '规则 block → 高风险 → 人工审批（降额）',
    case: { claimantName: '刘振宇', claimantPhone: '13800000003', caseType: 'digital', waybillNo: 'SF1003', declaredAmount: 5800, incidentDesc: '外包装完好但开箱屏幕碎裂' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '刘振宇', phone: '13800000003', waybillNo: 'SF1003', declaredAmount: 5800, incident: '屏幕碎裂', applyTime: h(60) }) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1003' }, 0.96) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '屏幕碎裂', damagedUnits: 1, totalUnits: 2, goodsCategory: '数码电子' }, 0.93) },
      { docType: 'invoice', ocr: ocr('invoice', { invoiceNo: 'INV-26003', amount: 5600, goodsDesc: '笔记本电脑 x2' }, 0.95) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '孙浩', signedAt: d(3) }, 0.93) },
    ],
    shipment: {
      waybillNo: 'SF1003', route: '深圳→武汉', goodsDesc: '笔记本电脑 x2', weightKg: 6, insuredAmount: 5000, signedAt: d(3), signedBy: '孙浩',
      events: [
        { time: d(4.2), status: '揽收', desc: '深圳南山网点揽收' },
        { time: d(3.6), status: '干线', desc: '干线运输' },
        { time: d(3), status: '签收', desc: '本人签收（外包装完好）' },
      ],
      temperatureEvents: [],
    },
  },
  {
    key: 'fresh-repeat',
    title: '生鲜理赔，发货人 90 天内多次理赔且同运单有未结工单',
    expect: '历史核验命中欺诈线索 → 高风险 → 人工审批',
    case: { claimantName: '马国富', claimantPhone: '13800000004', caseType: 'fresh', waybillNo: 'SF1004', declaredAmount: 800, incidentDesc: '杨梅到货腐烂' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '马国富', phone: '13800000004', waybillNo: 'SF1004', declaredAmount: 800, incident: '腐烂', applyTime: h(30) }) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1004' }, 0.95) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '腐烂', damagedUnits: 6, totalUnits: 15, goodsCategory: '生鲜水果' }, 0.89) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '周洁', signedAt: d(2) }, 0.9) },
      { docType: 'cold_chain_record', ocr: ocr('cold_chain_record', { avgTempC: 3.8, maxTempC: 6.5, breachCount: 0 }, 0.92) },
    ],
    shipment: {
      waybillNo: 'SF1004', route: '杭州→南京', goodsDesc: '杨梅 15 箱', weightKg: 45, insuredAmount: 900, signedAt: d(2), signedBy: '周洁',
      events: [
        { time: d(3), status: '揽收', desc: '杭州萧山网点揽收' },
        { time: d(2), status: '签收', desc: '本人签收' },
      ],
      temperatureEvents: [{ time: d(2.5), tempC: 4.0, ok: true }],
    },
    claimHistory: [
      { waybillNo: 'SF0991', amount: 450, conclusion: '已赔付', createdAt: d(20) },
      { waybillNo: 'SF0975', amount: 620, conclusion: '已赔付', createdAt: d(55) },
      { waybillNo: 'SF0950', amount: 380, conclusion: '已赔付', createdAt: d(85) },
    ],
    workOrders: [{ woType: '破损投诉', status: 'open', description: '同运单破损投诉处理中', createdAt: d(4) }],
  },
  {
    key: 'general-late',
    title: '普货破损，超过理赔申请时效（签收 18 天后申请）',
    expect: '规则 block（超时效）→ 高风险 → 人工审批（拒赔）',
    case: { claimantName: '郑立群', claimantPhone: '13800000005', caseType: 'general', waybillNo: 'SF1005', declaredAmount: 900, incidentDesc: '纸箱破损内件丢失' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '郑立群', phone: '13800000005', waybillNo: 'SF1005', declaredAmount: 900, incident: '内件丢失', applyTime: h(2 * 24) }, 0.9) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1005' }, 0.95) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '外箱破损', damagedUnits: 1, totalUnits: 4, goodsCategory: '日用品' }, 0.88) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '吴涛', signedAt: d(20) }, 0.91) },
    ],
    shipment: {
      waybillNo: 'SF1005', route: '北京→西安', goodsDesc: '日用品 4 箱', weightKg: 30, insuredAmount: 1000, signedAt: d(20), signedBy: '吴涛',
      events: [
        { time: d(22), status: '揽收', desc: '北京丰台网点揽收' },
        { time: d(20), status: '签收', desc: '本人签收' },
      ],
      temperatureEvents: [],
    },
  },
  {
    key: 'digital-missing',
    title: '数码产品缺失，未提供购买凭证（发票）',
    expect: '规则 block（材料不完整）→ 高风险 → 人工审批（补材料）',
    case: { claimantName: '何雨欣', claimantPhone: '13800000006', caseType: 'digital', waybillNo: 'SF1006', declaredAmount: 3400, incidentDesc: '包裹丢失' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '何雨欣', phone: '13800000006', waybillNo: 'SF1006', declaredAmount: 3400, incident: '包裹丢失', applyTime: h(40) }) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1006' }, 0.96) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '未到货', damagedUnits: 0, totalUnits: 0, goodsCategory: '数码电子' }, 0.85) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '', signedAt: '', note: '无签收记录' }, 0.8) },
    ],
    shipment: {
      waybillNo: 'SF1006', route: '东莞→长沙', goodsDesc: '平板电脑 x1', weightKg: 1.2, insuredAmount: 3500, signedAt: null as unknown as string, signedBy: '',
      events: [
        { time: d(3), status: '揽收', desc: '东莞虎门网点揽收' },
        { time: d(2.8), status: '异常', desc: '中转场扫描缺失，疑似丢失，已立案' },
      ],
      temperatureEvents: [],
    },
  },
  {
    key: 'general-conflict',
    title: '普货破损，申报金额与发票金额冲突、申请时间早于签收',
    expect: '多源核验发现数据冲突 → 中高风险 → 人工审批',
    case: { claimantName: '许文静', claimantPhone: '13800000007', caseType: 'general', waybillNo: 'SF1007', declaredAmount: 1500, incidentDesc: '陶瓷制品破碎' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '许文静', phone: '13800000007', waybillNo: 'SF1007', declaredAmount: 1500, incident: '破碎', applyTime: h(72) }) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1007' }, 0.95) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '破碎', damagedUnits: 5, totalUnits: 12, goodsCategory: '陶瓷工艺品' }, 0.9) },
      { docType: 'invoice', ocr: ocr('invoice', { invoiceNo: 'INV-26007', amount: 900, goodsDesc: '陶瓷茶具 12 件' }, 0.93) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '袁春华', signedAt: h(48) }, 0.92) },
    ],
    shipment: {
      waybillNo: 'SF1007', route: '上海→重庆', goodsDesc: '陶瓷茶具 12 件', weightKg: 18, insuredAmount: 1500, signedAt: d(2), signedBy: '袁春华',
      events: [
        { time: d(3.5), status: '揽收', desc: '上海闵行网点揽收' },
        { time: d(2), status: '签收', desc: '本人签收（外箱完好）' },
      ],
      temperatureEvents: [],
    },
    claimHistory: [{ waybillNo: 'SF0888', amount: 300, conclusion: '已赔付', createdAt: d(60) }],
  },
  {
    key: 'general-normal',
    title: '普货少量破损，材料齐全、金额正常',
    expect: '低风险 → 自动通过，建议按破损比例赔付',
    case: { claimantName: '杨光明', claimantPhone: '13800000008', caseType: 'general', waybillNo: 'SF1008', declaredAmount: 600, incidentDesc: '2 箱外墙纸受潮损坏' },
    documents: [
      { docType: 'application_form', ocr: ocr('application_form', { claimant: '杨光明', phone: '13800000008', waybillNo: 'SF1008', declaredAmount: 600, incident: '受潮损坏', applyTime: h(30) }) },
      { docType: 'waybill_photo', ocr: ocr('waybill_photo', { waybillNo: 'SF1008' }, 0.96) },
      { docType: 'damage_photo', ocr: ocr('damage_photo', { damageType: '受潮', damagedUnits: 2, totalUnits: 10, goodsCategory: '建材家居' }, 0.91) },
      { docType: 'invoice', ocr: ocr('invoice', { invoiceNo: 'INV-26008', amount: 600, goodsDesc: '墙纸 10 箱' }, 0.94) },
      { docType: 'receipt_confirm', ocr: ocr('receipt_confirm', { signedBy: '秦岚', signedAt: d(2) }, 0.93) },
    ],
    shipment: {
      waybillNo: 'SF1008', route: '上海→青岛', goodsDesc: '墙纸 10 箱', weightKg: 80, insuredAmount: 1000, signedAt: d(2), signedBy: '秦岚',
      events: [
        { time: d(3.2), status: '揽收', desc: '上海嘉定网点揽收' },
        { time: d(2.6), status: '异常', desc: '雨天装卸，外包装受潮' },
        { time: d(2), status: '签收', desc: '本人签收（注明 2 箱受潮）' },
      ],
      temperatureEvents: [],
    },
  },
];

export function getTemplate(key: string) {
  return CASE_TEMPLATES.find((t) => t.key === key);
}
