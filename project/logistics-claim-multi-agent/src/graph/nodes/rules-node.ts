// 规则审核节点：调用确定性规则引擎（不走 LLM），校验材料完整性、理赔条件、金额约束等。
import { traced } from '../../services/audit.js';
import { updateCaseStatus } from '../../db/repo.js';
import type { CaseRec } from '../../types.js';
import { runRules } from '../rules.js';
import type { ClaimStateType, ClaimStateUpdate } from '../state.js';
import { nodeCtx, notifyAgent, notifyStatus } from './util.js';

export async function rulesNode(state: ClaimStateType, cfg?: any): Promise<ClaimStateUpdate> {
  const ctx = nodeCtx(state, cfg);
  notifyAgent(ctx.caseId, 'rules', 'start', '规则审核');
  await updateCaseStatus(ctx.caseId, 'rule_checking').catch(() => {});
  notifyStatus(ctx.caseId, '规则审核中');

  const caseRec: CaseRec = {
    id: ctx.caseId, caseNo: state.caseNo, claimantName: '', claimantPhone: '',
    caseType: state.caseType, waybillNo: state.waybillNo ?? '', declaredAmount: state.declaredAmount,
    incidentDesc: '', status: 'rule_checking',
  };

  const { result: hits, run } = await traced(ctx, 'rules', 'rule_engine', async (setMeta) => {
    const result = runRules({
      case: caseRec,
      documents: state.documents ?? [],
      waybillVerify: state.waybillVerify ?? null,
      historyVerify: state.historyVerify ?? null,
    });
    setMeta({ detail: { hitCount: result.length, blocks: result.filter((h) => h.level === 'block').length } });
    return result;
  });

  const blocks = hits.filter((h) => h.level === 'block');
  const warns = hits.filter((h) => h.level === 'warn');
  notifyAgent(ctx.caseId, 'rules', 'done', `规则审核：${hits.length} 条（红线 ${blocks.length}，警告 ${warns.length}）`, hits);
  notifyStatus(ctx.caseId, '风险评估中');
  await updateCaseStatus(ctx.caseId, 'risk_assessing').catch(() => {});

  return { ruleHits: hits, agentRuns: [run] };
}
