import type { RunnableConfig } from '@langchain/core/runnables';
import { bus } from '../../services/bus.js';
import type { ClaimStateType } from '../state.js';

export interface NodeCtx {
  caseId: string;
  threadId?: string;
}

export function nodeCtx(state: ClaimStateType, config?: RunnableConfig): NodeCtx {
  return {
    caseId: state.caseId,
    threadId: (config?.configurable as any)?.thread_id,
  };
}

export function notifyAgent(caseId: string, agent: string, status: 'start' | 'done' | 'error', label?: string, data?: unknown) {
  bus.emitCase(caseId, { type: 'agent_status', agent, status, label, data });
}

export function notifyStatus(caseId: string, label: string, data?: unknown) {
  bus.emitCase(caseId, { type: 'status', label, data });
}
