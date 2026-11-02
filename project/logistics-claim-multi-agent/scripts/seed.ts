// 初始化：业务表 DDL + checkpoint 表迁移（PostgresSaver.setup）+ 灌入 mock 业务数据
import '../src/polyfill.js';
import 'dotenv/config';
import { initDb } from '../src/db/schema.js';
import { pool } from '../src/db/pool.js';
import { CASE_TEMPLATES } from '../src/mock/data.js';
import { getClaimGraph } from '../src/graph/build.js';

await initDb();
await getClaimGraph(); // 幂等：建 checkpoint* 表

for (const t of CASE_TEMPLATES) {
  const s = t.shipment;
  await pool.query(
    `INSERT INTO shipments (waybill_no, route, goods_desc, weight_kg, insured_amount, signed_at, signed_by, events, temperature_events)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (waybill_no) DO UPDATE SET route=$2, goods_desc=$3, weight_kg=$4, insured_amount=$5,
       signed_at=$6, signed_by=$7, events=$8, temperature_events=$9`,
    [s.waybillNo, s.route, s.goodsDesc, s.weightKg, s.insuredAmount, s.signedAt, s.signedBy, JSON.stringify(s.events), JSON.stringify(s.temperatureEvents)],
  );
  for (const c of t.claimHistory ?? []) {
    await pool.query(
      `INSERT INTO claim_history (claimant_phone, waybill_no, amount, conclusion, created_at) VALUES ($1,$2,$3,$4,$5)`,
      [t.case.claimantPhone, c.waybillNo, c.amount, c.conclusion, c.createdAt],
    );
  }
  for (const w of t.workOrders ?? []) {
    await pool.query(
      `INSERT INTO work_orders (waybill_no, wo_type, status, description, created_at) VALUES ($1,$2,$3,$4,$5)`,
      [t.case.waybillNo, w.woType, w.status, w.description, w.createdAt],
    );
  }
  console.log(`seed: ${t.key} (${t.title})`);
}

const { rows } = await pool.query<{ c: string }>('SELECT count(*)::text AS c FROM shipments');
console.log(`\nseed 完成：${CASE_TEMPLATES.length} 个案件模板，${rows[0].c} 条运单数据`);
await pool.end();
process.exit(0);
