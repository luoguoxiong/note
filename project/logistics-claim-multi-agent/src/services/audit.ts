import { insertAgentRun } from '../db/repo.js';
import type { AgentRunRec } from '../types.js';

export interface RunMeta {
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  detail?: unknown;
}

export type RunMetaSetter = (m: RunMeta) => void;

/**
 * 执行轨迹包装：计时 + 异常捕获 + 落库 agent_runs。
 * 每个 Agent 的每次关键动作（模型调用/工具调用/规则执行）都会留痕，支撑链路追踪。
 */
export async function traced<T>(
  ctx: { caseId?: string; threadId?: string },
  agent: string,
  action: string,
  fn: (setMeta: RunMetaSetter) => Promise<T>,
): Promise<{ result: T; run: AgentRunRec }> {
  const start = Date.now();
  let meta: RunMeta = {};
  const setMeta: RunMetaSetter = (m) => {
    meta = { ...meta, ...m };
  };
  let status: AgentRunRec['status'] = 'ok';
  let error = '';
  try {
    const result = await fn(setMeta);
    const run: AgentRunRec = {
      agent, action, status, durationMs: Date.now() - start,
      model: meta.model, promptTokens: meta.promptTokens, completionTokens: meta.completionTokens,
    };
    await insertAgentRun({ ...run, caseId: ctx.caseId, threadId: ctx.threadId, detail: meta.detail }).catch(() => {});
    return { result, run };
  } catch (err: any) {
    status = 'error';
    error = String(err?.message ?? err);
    const run: AgentRunRec = { agent, action, status, durationMs: Date.now() - start, error };
    await insertAgentRun({ ...run, caseId: ctx.caseId, threadId: ctx.threadId }).catch(() => {});
    throw err;
  }
}
