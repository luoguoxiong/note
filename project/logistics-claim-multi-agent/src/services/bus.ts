import { EventEmitter } from 'node:events';

export interface CaseEvent {
  type: 'status' | 'agent_status' | 'approval_request' | 'done' | 'error';
  caseId: string;
  ts: number;
  agent?: string;
  status?: string;
  label?: string;
  data?: unknown;
}

/** 案件级事件总线：Agent 执行进度实时推送给 SSE 订阅者（多实例可换 Redis pub/sub） */
class CaseBus extends EventEmitter {
  emitCase(caseId: string, event: Omit<CaseEvent, 'caseId' | 'ts'> & Partial<CaseEvent>) {
    this.emit(`case:${caseId}`, { ts: Date.now(), caseId, ...event } as CaseEvent);
  }

  subscribe(caseId: string, fn: (e: CaseEvent) => void): () => void {
    const ch = `case:${caseId}`;
    this.on(ch, fn);
    return () => this.off(ch, fn);
  }
}

export const bus = new CaseBus();
