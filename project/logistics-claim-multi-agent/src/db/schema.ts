import { pool } from './pool.js';

/** 业务表 DDL（幂等执行；checkpoint* 四表由 PostgresSaver.setup() 自建） */
const DDL = `
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY,
  case_no TEXT UNIQUE NOT NULL,
  claimant_name TEXT NOT NULL,
  claimant_phone TEXT NOT NULL DEFAULT '',
  case_type TEXT NOT NULL CHECK (case_type IN ('fresh','digital','general')),
  waybill_no TEXT NOT NULL,
  declared_amount NUMERIC(12,2) NOT NULL,
  incident_desc TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted',
  thread_id TEXT,
  template_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  ocr_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);

-- ===== mock 业务数据源（生产环境为运单系统/工单系统等外部服务）=====
CREATE TABLE IF NOT EXISTS shipments (
  waybill_no TEXT PRIMARY KEY,
  route TEXT NOT NULL DEFAULT '',
  goods_desc TEXT NOT NULL DEFAULT '',
  weight_kg NUMERIC(10,2) DEFAULT 0,
  insured_amount NUMERIC(12,2) DEFAULT 0,
  signed_at TIMESTAMPTZ,
  signed_by TEXT DEFAULT '',
  events JSONB NOT NULL DEFAULT '[]',
  temperature_events JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS claim_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_phone TEXT NOT NULL,
  waybill_no TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  conclusion TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_claim_history_phone ON claim_history(claimant_phone);

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waybill_no TEXT NOT NULL,
  wo_type TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_work_orders_waybill ON work_orders(waybill_no);

-- ===== 运行时表 =====
CREATE TABLE IF NOT EXISTS agent_runs (
  id BIGSERIAL PRIMARY KEY,
  case_id UUID,
  thread_id TEXT,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  duration_ms INT NOT NULL DEFAULT 0,
  model TEXT DEFAULT '',
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  error TEXT DEFAULT '',
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_runs_case ON agent_runs(case_id, id);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  decision_by TEXT DEFAULT '',
  decision_comment TEXT DEFAULT '',
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_approvals_pending ON approvals(case_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  markdown TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('pay','reject')),
  amount NUMERIC(12,2) DEFAULT 0,
  operator TEXT NOT NULL DEFAULT '',
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function initDb() {
  await pool.query(DDL);
}
