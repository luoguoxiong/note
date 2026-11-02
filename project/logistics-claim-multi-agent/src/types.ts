// 领域类型定义（理赔审核）
export type CaseType = 'fresh' | 'digital' | 'general';

export type CaseStatus =
  | 'submitted'
  | 'planning'
  | 'parsing'
  | 'verifying'
  | 'rule_checking'
  | 'risk_assessing'
  | 'waiting_approval'
  | 'reporting'
  | 'completed'
  | 'rejected'
  | 'failed';

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  submitted: '已受理',
  planning: '任务编排中',
  parsing: '材料解析中',
  verifying: '多源核验中',
  rule_checking: '规则审核中',
  risk_assessing: '风险评估中',
  waiting_approval: '等待人工审批',
  reporting: '报告生成中',
  completed: '审核完成',
  rejected: '已拒绝',
  failed: '审核失败',
};

/** 理赔案件（cases 表） */
export interface CaseRec {
  id: string;
  caseNo: string;
  claimantName: string;
  claimantPhone: string;
  caseType: CaseType;
  waybillNo: string;
  declaredAmount: number;
  incidentDesc: string;
  status: CaseStatus;
  threadId?: string;
  templateKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 模拟多模态模型（OCR/视觉）对理赔材料影像的抽取结果 */
export interface OcrResult {
  docType: string;
  fields: Record<string, unknown>;
  confidence: number;
  model: string; // 生成该抽取结果的模型（demo 为 mock-vision-ocr）
}

export interface DocumentRec {
  id: string;
  caseId: string;
  docType: string;
  ocr: OcrResult;
}

export type EvidenceSource = 'document' | 'waybill' | 'history' | 'rule' | 'risk';

/** 证据引用：审核链路里每个结论都要能回溯到来源 */
export interface EvidenceRef {
  source: EvidenceSource;
  ref: string; // document:<id> / shipment:<waybillNo> / claim_history:<phone> / rule:<code>
  note?: string;
}

export interface WaybillEvent {
  time: string;
  status: string;
  desc: string;
}

/** 运单核验 Agent 输出 */
export interface WaybillVerify {
  waybillNo: string;
  found: boolean;
  route?: string;
  goodsDesc?: string;
  insuredAmount?: number;
  signedAt?: string;
  signedBy?: string;
  events: WaybillEvent[];
  anomalies: string[]; // 异常线索（LLM 归纳，如"签收时间晚于理赔申请"）
  evidence: EvidenceRef[];
  viaMcp: boolean; // 工具是否经 MCP 调用
}

/** 历史工单核验 Agent 输出 */
export interface HistoryVerify {
  claimantPhone: string;
  claims90d: number;
  totalPaidAmount: number;
  sameWaybillClaimed: boolean;
  openWorkOrders: number;
  riskFlags: string[];
  evidence: EvidenceRef[];
}

export interface Conflict {
  field: string; // 冲突字段，如 declaredAmount
  detail: string;
  sources: EvidenceRef[];
}

export type RuleLevel = 'pass' | 'warn' | 'block';

export interface RuleHit {
  code: string;
  title: string;
  level: RuleLevel;
  detail: string;
  evidenceRefs: EvidenceRef[];
}

export interface RiskResult {
  level: 'low' | 'medium' | 'high';
  score: number; // 0-100
  factors: string[];
  recommendation: 'auto_approve' | 'manual_review' | 'reject';
  reason: string;
  forcedByRule?: string; // 命中确定性红线时记录强制来源（LLM 只能加严不能放宽）
}

/** interrupt() 挂起时抛给人工审批端的请求 payload */
export interface ApprovalRequest {
  type: 'approval';
  caseId: string;
  caseNo: string;
  risk: RiskResult;
  blockHits: RuleHit[];
  conflicts: Conflict[];
  suggestedAction: string;
}

/** Command({resume}) 注入的审批决定 */
export interface ApprovalDecision {
  decision: 'approve' | 'reject';
  approver: string;
  comment?: string;
}

export interface ReportResult {
  conclusion: 'approve' | 'reject' | 'manual_review';
  suggestedPayout: number | null;
  opinion: string;
  basis: { point: string; refs: EvidenceRef[] }[];
  nextSteps: string[];
}

export interface AgentRunRec {
  agent: string;
  action: string;
  status: 'ok' | 'error';
  durationMs: number;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  error?: string;
}

/** Supervisor 生成的执行计划：按案件类型动态选择执行路径 */
export interface AuditPlan {
  summary: string;
  enableHistory: boolean; // 是否并行调度历史工单核验 Agent
  extraChecks: string[]; // 额外核验要求（如生鲜温控、数码 IMEI）
  reason: string;
}
