// LangGraph 工作流组装：Supervisor 编排 + 材料解析 → 多源并行核验 → 规则审核 →
// 风险评估 →（高风险）人工审批 interrupt → 报告生成。
// Checkpoint 持久化用 PostgresSaver（跨进程恢复，审批后 Command(resume) 续跑）。
import { END, START, StateGraph } from '@langchain/langgraph';
import type { CompiledStateGraph } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { pool } from '../db/pool.js';
import { config } from '../config.js';
import { ClaimState, type ClaimStateType } from './state.js';
import { supervisorNode } from './nodes/supervisor.js';
import { parseNode } from './nodes/parse.js';
import { waybillNode } from './nodes/waybill.js';
import { historyNode } from './nodes/history.js';
import { rulesNode } from './nodes/rules-node.js';
import { riskNode } from './nodes/risk.js';
import { approvalNode } from './nodes/approval.js';
import { reportNode } from './nodes/report.js';

/** 材料解析后：按 Supervisor 计划动态 fan-out（运单核验必选；历史核验按计划） */
function routeAfterParse(s: ClaimStateType): string[] {
  const next = ['waybill'];
  if (s.plan?.enableHistory) next.push('history');
  return next;
}

/** 风险评估后：高风险 / 建议人工复核 / 存在冲突 → 人工审批；否则直达报告 */
function routeAfterRisk(s: ClaimStateType): 'approval_gate' | 'report_gen' {
  const needApproval = s.risk?.level === 'high' || s.risk?.recommendation === 'manual_review' || (s.conflicts?.length ?? 0) > 0;
  return needApproval && config.highRiskManual ? 'approval_gate' : 'report_gen';
}

let cached: CompiledStateGraph<any, any, any, any, any> | null = null;

export async function getClaimGraph() {
  if (cached) return cached;
  const checkpointer = new PostgresSaver(pool);
  await checkpointer.setup(); // 幂等建 checkpoint 表
  cached = new StateGraph(ClaimState)
    .addNode('supervisor', supervisorNode)
    .addNode('parse', parseNode)
    .addNode('waybill', waybillNode)
    .addNode('history', historyNode)
    .addNode('rules', rulesNode)
    .addNode('risk_assess', riskNode)
    .addNode('approval_gate', approvalNode)
    .addNode('report_gen', reportNode)
    .addEdge(START, 'supervisor')
    .addEdge('supervisor', 'parse')
    .addConditionalEdges('parse', routeAfterParse)
    .addEdge('waybill', 'rules') // 并行 join：waybill/history 都完成后进规则审核
    .addEdge('history', 'rules')
    .addEdge('rules', 'risk_assess')
    .addConditionalEdges('risk_assess', routeAfterRisk)
    .addEdge('approval_gate', 'report_gen')
    .addEdge('report_gen', END)
    .compile({ checkpointer });
  return cached;
}
