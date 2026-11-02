import { pool, query } from './pool.js';
import type { AgentRunRec, ApprovalDecision, ApprovalRequest, CaseRec, CaseStatus, DocumentRec, OcrResult, ReportResult } from '../types.js';

function rowToCase(r: any): CaseRec {
  return {
    id: r.id, caseNo: r.case_no, claimantName: r.claimant_name, claimantPhone: r.claimant_phone,
    caseType: r.case_type, waybillNo: r.waybill_no, declaredAmount: Number(r.declared_amount),
    incidentDesc: r.incident_desc ?? '', status: r.status as CaseStatus, threadId: r.thread_id ?? undefined,
    templateKey: r.template_key ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// ===== cases =====
export async function insertCase(c: CaseRec) {
  await pool.query(
    `INSERT INTO cases (id, case_no, claimant_name, claimant_phone, case_type, waybill_no, declared_amount, incident_desc, status, thread_id, template_key)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [c.id, c.caseNo, c.claimantName, c.claimantPhone, c.caseType, c.waybillNo, c.declaredAmount, c.incidentDesc, c.status, c.threadId ?? null, c.templateKey ?? null],
  );
}

export async function getCase(id: string): Promise<CaseRec | null> {
  const rows = await query('SELECT * FROM cases WHERE id = $1', [id]);
  return rows[0] ? rowToCase(rows[0]) : null;
}

export async function getCaseByNo(caseNo: string): Promise<CaseRec | null> {
  const rows = await query('SELECT * FROM cases WHERE case_no = $1', [caseNo]);
  return rows[0] ? rowToCase(rows[0]) : null;
}

export async function listCases(limit = 50): Promise<CaseRec[]> {
  const rows = await query('SELECT * FROM cases ORDER BY created_at DESC LIMIT $1', [limit]);
  return rows.map(rowToCase);
}

export async function updateCaseStatus(id: string, status: CaseStatus, extra: { threadId?: string } = {}) {
  await pool.query(
    `UPDATE cases SET status = $2, updated_at = now()${extra.threadId ? ', thread_id = $3' : ''} WHERE id = $1`,
    extra.threadId ? [id, status, extra.threadId] : [id, status],
  );
}

export async function countCaseStatus(status: CaseStatus): Promise<number> {
  const rows = await query<{ c: string }>('SELECT count(*)::text AS c FROM cases WHERE status = $1', [status]);
  return Number(rows[0]?.c ?? 0);
}

// ===== documents =====
export async function insertDocument(doc: { caseId: string; docType: string; ocr: OcrResult }): Promise<DocumentRec> {
  const rows = await query(
    `INSERT INTO documents (case_id, doc_type, ocr_json) VALUES ($1,$2,$3) RETURNING *`,
    [doc.caseId, doc.docType, JSON.stringify(doc.ocr)],
  );
  const r = rows[0];
  return { id: r.id, caseId: r.case_id, docType: r.doc_type, ocr: r.ocr_json as OcrResult };
}

export async function listDocuments(caseId: string): Promise<DocumentRec[]> {
  const rows = await query('SELECT * FROM documents WHERE case_id = $1 ORDER BY created_at', [caseId]);
  return rows.map((r: any) => ({ id: r.id, caseId: r.case_id, docType: r.doc_type, ocr: r.ocr_json as OcrResult }));
}

// ===== mock 业务数据源 =====
export interface ShipmentRec {
  waybillNo: string; route: string; goodsDesc: string; weightKg: number; insuredAmount: number;
  signedAt: string | null; signedBy: string; events: { time: string; status: string; desc: string }[];
  temperatureEvents: { time: string; tempC: number; ok: boolean }[];
}

export async function getShipment(waybillNo: string): Promise<ShipmentRec | null> {
  const rows = await query('SELECT * FROM shipments WHERE waybill_no = $1', [waybillNo]);
  const r = rows[0];
  if (!r) return null;
  return {
    waybillNo: r.waybill_no, route: r.route, goodsDesc: r.goods_desc, weightKg: Number(r.weight_kg),
    insuredAmount: Number(r.insured_amount), signedAt: r.signed_at, signedBy: r.signed_by ?? '',
    events: r.events ?? [], temperatureEvents: r.temperature_events ?? [],
  };
}

export interface ClaimHistoryRec { waybillNo: string; amount: number; conclusion: string; createdAt: string }
export async function listClaimHistory(phone: string): Promise<ClaimHistoryRec[]> {
  const rows = await query(
    'SELECT waybill_no, amount, conclusion, created_at FROM claim_history WHERE claimant_phone = $1 ORDER BY created_at DESC',
    [phone],
  );
  return rows.map((r: any) => ({ waybillNo: r.waybill_no, amount: Number(r.amount), conclusion: r.conclusion, createdAt: r.created_at }));
}

export interface WorkOrderRec { waybillNo: string; woType: string; status: string; description: string; createdAt: string }
export async function listWorkOrders(waybillNo: string): Promise<WorkOrderRec[]> {
  const rows = await query('SELECT waybill_no, wo_type, status, description, created_at FROM work_orders WHERE waybill_no = $1 ORDER BY created_at DESC', [waybillNo]);
  return rows.map((r: any) => ({ waybillNo: r.waybill_no, woType: r.wo_type, status: r.status, description: r.description, createdAt: r.created_at }));
}

// ===== agent_runs（执行轨迹）=====
export async function insertAgentRun(run: AgentRunRec & { caseId?: string; threadId?: string; detail?: unknown }) {
  await pool.query(
    `INSERT INTO agent_runs (case_id, thread_id, agent, action, status, duration_ms, model, prompt_tokens, completion_tokens, error, detail)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [run.caseId ?? null, run.threadId ?? null, run.agent, run.action, run.status, Math.round(run.durationMs), run.model ?? '',
      run.promptTokens ?? 0, run.completionTokens ?? 0, run.error ?? '', run.detail ? JSON.stringify(run.detail) : null],
  );
}

export async function listAgentRuns(caseId: string) {
  return query('SELECT * FROM agent_runs WHERE case_id = $1 ORDER BY id', [caseId]);
}

// ===== approvals（人工审批）=====
export async function insertApproval(a: { caseId: string; threadId: string; payload: ApprovalRequest }) {
  const rows = await query(
    `INSERT INTO approvals (case_id, thread_id, payload) VALUES ($1,$2,$3) RETURNING *`,
    [a.caseId, a.threadId, JSON.stringify(a.payload)],
  );
  return rows[0];
}

export async function getPendingApproval(caseId: string) {
  const rows = await query(`SELECT * FROM approvals WHERE case_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1`, [caseId]);
  return rows[0] ?? null;
}

export async function setApprovalDecision(id: string, decision: ApprovalDecision) {
  await pool.query(
    `UPDATE approvals SET status = $2, decision_by = $3, decision_comment = $4, decided_at = now() WHERE id = $1`,
    [id, decision.decision, decision.approver, decision.comment ?? ''],
  );
}

// ===== reports / decisions =====
export async function upsertReport(caseId: string, content: ReportResult, markdown: string) {
  await pool.query(
    `INSERT INTO reports (case_id, content, markdown) VALUES ($1,$2,$3)
     ON CONFLICT (case_id) DO UPDATE SET content = $2, markdown = $3, created_at = now()`,
    [caseId, JSON.stringify(content), markdown],
  );
}

export async function getReport(caseId: string) {
  const rows = await query('SELECT * FROM reports WHERE case_id = $1', [caseId]);
  const r = rows[0];
  return r ? { caseId, content: r.content as ReportResult, markdown: r.markdown, createdAt: r.created_at } : null;
}

export async function insertDecision(d: { caseId: string; action: 'pay' | 'reject'; amount: number; operator: string; comment?: string }) {
  await pool.query(
    `INSERT INTO decisions (case_id, action, amount, operator, comment) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (case_id) DO NOTHING`,
    [d.caseId, d.action, d.amount, d.operator, d.comment ?? ''],
  );
}

export async function getDecision(caseId: string) {
  const rows = await query('SELECT * FROM decisions WHERE case_id = $1', [caseId]);
  return rows[0] ?? null;
}
