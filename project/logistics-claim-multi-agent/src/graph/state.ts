import { Annotation } from '@langchain/langgraph';
import type {
  AgentRunRec, ApprovalDecision, AuditPlan, CaseType, Conflict, DocumentRec,
  HistoryVerify, ReportResult, RiskResult, RuleHit, WaybillVerify,
} from '../types.js';

/**
 * 共享审核状态（Supervisor 与各 Agent 统一读写）。
 * 并行节点（运单核验/历史核验）写不同字段，无需合并冲突；
 * conflicts/agentRuns/errors 为追加语义（reducer concat）。
 */
export const ClaimState = Annotation.Root({
  caseId: Annotation<string>({ reducer: (_c, u) => u, default: () => '' }),
  caseNo: Annotation<string>({ reducer: (_c, u) => u, default: () => '' }),
  caseType: Annotation<CaseType>({ reducer: (_c, u) => u, default: () => 'general' }),
  declaredAmount: Annotation<number>({ reducer: (_c, u) => u, default: () => 0 }),
  waybillNo: Annotation<string>({ reducer: (_c, u) => u, default: () => '' }),

  // Supervisor 执行计划（按案件类型动态选择执行路径）
  plan: Annotation<AuditPlan | null>({ reducer: (_c, u) => u, default: () => null }),

  // 材料解析 Agent 输出
  documents: Annotation<DocumentRec[]>({ reducer: (c, u) => (u ? u : c), default: () => [] }),
  parsed: Annotation<Record<string, unknown> | null>({ reducer: (_c, u) => u, default: () => null }),

  // 并行核验输出
  waybillVerify: Annotation<WaybillVerify | null>({ reducer: (_c, u) => u, default: () => null }),
  historyVerify: Annotation<HistoryVerify | null>({ reducer: (_c, u) => u, default: () => null }),
  conflicts: Annotation<Conflict[]>({ reducer: (c, u) => (u?.length ? c.concat(u) : c), default: () => [] }),

  // 规则审核 / 风险评估
  ruleHits: Annotation<RuleHit[]>({ reducer: (c, u) => (u ? u : c), default: () => [] }),
  risk: Annotation<RiskResult | null>({ reducer: (_c, u) => u, default: () => null }),

  // 人工审批（interrupt → Command(resume) 注入）
  approval: Annotation<ApprovalDecision | null>({ reducer: (_c, u) => u, default: () => null }),

  // 报告生成
  report: Annotation<ReportResult | null>({ reducer: (_c, u) => u, default: () => null }),

  // 可观测性：执行轨迹 / 错误
  agentRuns: Annotation<AgentRunRec[]>({ reducer: (c, u) => (u?.length ? c.concat(u) : c), default: () => [] }),
  errors: Annotation<string[]>({ reducer: (c, u) => (u?.length ? c.concat(u) : c), default: () => [] }),
});

export type ClaimStateType = typeof ClaimState.State;
export type ClaimStateUpdate = Partial<ClaimStateType>;
