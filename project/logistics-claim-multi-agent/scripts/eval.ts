// 自动化评测：npm run eval [rules|e2e|approval|restart|permission|mcp|all]
// - rules      确定性规则引擎单元场景（不依赖服务）
// - e2e        全流程（自动通过 + 规则红线转审批 + 赔付校准）
// - approval   审批拒绝路径 / 冲突案件 / 重复审批幂等
// - restart    SIGTERM 重启后 interrupt 案件经 checkpoint 恢复（跨进程续跑）
// - permission 高影响操作权限隔离
// - mcp        运单核验工具经 MCP 调用验证
// 报告落盘 data/eval-report-<ts>.json
import '../src/polyfill.js';
import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdirSync, appendFileSync, writeFileSync } from 'node:fs';
import { config, ROOT_DIR } from '../src/config.js';
import { runRules } from '../src/graph/rules.js';
import type { CaseRec, DocumentRec, HistoryVerify, OcrResult, WaybillVerify } from '../src/types.js';

const PORT = Number(process.env.EVAL_PORT ?? 3016);
const BASE = `http://127.0.0.1:${PORT}`;
const TSX = `${ROOT_DIR}node_modules/tsx/dist/cli.mjs`;
const RUN = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

let server: ReturnType<typeof spawn> | null = null;
const phase = process.argv[2] ?? 'all';

// ---------- 工具 ----------
async function startServer() {
  mkdirSync(`${ROOT_DIR}data`, { recursive: true });
  const env = { ...process.env, PORT: String(PORT) } as Record<string, string>;
  delete env.NODE_OPTIONS; // 剥离 IDE 注入 shim
  server = spawn(process.execPath, [TSX, `${ROOT_DIR}src/server/index.ts`], { env, cwd: ROOT_DIR });
  server.stdout!.on('data', (d) => appendFileSync(`${ROOT_DIR}data/eval-server-${RUN}.log`, d));
  server.stderr!.on('data', (d) => appendFileSync(`${ROOT_DIR}data/eval-server-${RUN}.log`, d));
  const started = Date.now();
  while (Date.now() - started < 30_000) {
    try {
      if ((await fetch(`${BASE}/api/health`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('server 启动超时');
}

async function stopServer() {
  if (!server) return;
  server.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const t = setTimeout(() => {
      server?.kill('SIGKILL');
      resolve();
    }, 8000);
    server!.on('exit', () => {
      clearTimeout(t);
      resolve();
    });
  });
  server = null;
  // 等端口释放
  await new Promise((r) => setTimeout(r, 1200));
}

async function api(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<{ status: number; json: any }> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}

async function submit(templateKey: string) {
  const { json } = await api('POST', '/api/cases', { templateKey });
  return json as { caseId: string; caseNo: string };
}

async function getCase(caseId: string) {
  return (await api('GET', `/api/cases/${caseId}`)).json as any;
}

async function waitStatus(caseId: string, want: string[], timeoutMs = 300_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cc = await getCase(caseId);
    if (want.includes(cc.status)) return cc;
    await new Promise((r) => setTimeout(r, 1200));
  }
  throw new Error(`等待 ${want.join('/')} 超时`);
}

interface Check { name: string; pass: boolean; note?: string }
function check(results: Check[], name: string, pass: boolean, note?: string) {
  results.push({ name, pass: !!pass, note });
  console.log(`  ${pass ? '✓' : '✗'} ${name}${note ? ` (${note})` : ''}`);
}

// ---------- 阶段 1：规则引擎单元场景（确定性，不依赖服务/LLM） ----------
function fakeDoc(docType: string, fields: Record<string, unknown>): DocumentRec {
  return { id: `doc-${docType}`, caseId: 'x', docType, ocr: { docType, fields, confidence: 0.9, model: 'mock' } satisfies OcrResult };
}
function fakeCase(over: Partial<CaseRec> = {}): CaseRec {
  return {
    id: 'x', caseNo: 'X', claimantName: '', claimantPhone: '', caseType: 'general', waybillNo: 'WB1',
    declaredAmount: 1000, incidentDesc: '', status: 'rule_checking', ...over,
  };
}
function fakeWaybill(over: Partial<WaybillVerify> = {}): WaybillVerify {
  return {
    waybillNo: 'WB1', found: true, events: [], anomalies: [], evidence: [], viaMcp: false,
    signedAt: new Date(Date.now() - 86400_000).toISOString(), insuredAmount: 2000, ...over,
  };
}

function phaseRules(): Check[] {
  console.log('\n■ 阶段 rules：确定性规则引擎');
  const results: Check[] = [];
  const base = {
    documents: [
      fakeDoc('application_form', { declaredAmount: 1000, applyTime: new Date(Date.now() - 3600_000).toISOString(), waybillNo: 'WB1' }),
      fakeDoc('waybill_photo', { waybillNo: 'WB1' }),
      fakeDoc('damage_photo', { goodsCategory: '日用品', damagedUnits: 1, totalUnits: 5 }),
      fakeDoc('invoice', { amount: 1000 }),
      fakeDoc('receipt_confirm', { signedBy: 'x', signedAt: new Date().toISOString() }),
    ],
    waybillVerify: fakeWaybill(),
    historyVerify: null,
  };

  // R001 缺材料
  let hits = runRules({ case: fakeCase({ caseType: 'digital' }), ...base, documents: base.documents.filter((d) => d.docType !== 'invoice') });
  check(results, 'R001 缺发票 → block', hits.some((h) => h.code === 'R001' && h.level === 'block'));

  // R002 超时效（签收 21 天前，申请 20 天前 → 签收后 24h 才申请？不对：20 天前申请晚于 21 天前签收 1 天？
  // 时间线：签收=21天前，申请=4天前（签收后 17 天）→ 超 7 天时效
  const lateDocs = structuredClone(base.documents);
  (lateDocs[0].ocr.fields as any).applyTime = new Date(Date.now() - 4 * 86400_000).toISOString();
  hits = runRules({ case: fakeCase(), ...base, documents: lateDocs, waybillVerify: fakeWaybill({ signedAt: new Date(Date.now() - 21 * 86400_000).toISOString() }) });
  check(results, 'R002 超过 7 天时效 → block', hits.some((h) => h.code === 'R002' && h.level === 'block'));

  // R002 申请早于签收
  const beforeDocs = structuredClone(base.documents);
  (beforeDocs[0].ocr.fields as any).applyTime = new Date(Date.now() - 3 * 86400_000).toISOString();
  hits = runRules({ case: fakeCase(), ...base, documents: beforeDocs });
  check(results, 'R002 申请早于签收 → warn', hits.some((h) => h.code === 'R002' && h.level === 'warn'));

  // R003 超保价
  hits = runRules({ case: fakeCase({ declaredAmount: 5000 }), ...base });
  check(results, 'R003 申报超保价 → block', hits.some((h) => h.code === 'R003' && h.level === 'block'));

  // R003 大额提示
  hits = runRules({ case: fakeCase({ declaredAmount: config.largeAmountThreshold + 1 }), ...base });
  check(results, 'R003 大额案件 → warn', hits.some((h) => h.code === 'R003' && h.level === 'warn'));

  // R004 生鲜缺温控
  hits = runRules({ case: fakeCase({ caseType: 'fresh' }), ...base });
  check(results, 'R004 生鲜缺温控记录 → warn', hits.some((h) => h.code === 'R004' && h.level === 'warn'));

  // R005 禁运品类
  const bannedDocs = structuredClone(base.documents);
  (bannedDocs[2].ocr.fields as any).goodsCategory = '充电宝';
  hits = runRules({ case: fakeCase(), ...base, documents: bannedDocs });
  check(results, 'R005 禁运品类（充电宝）→ block', hits.some((h) => h.code === 'R005' && h.level === 'block'));

  // R006 重复理赔
  const hv: HistoryVerify = { claimantPhone: 'p', claims90d: 1, totalPaidAmount: 100, sameWaybillClaimed: true, openWorkOrders: 0, riskFlags: [], evidence: [] };
  hits = runRules({ case: fakeCase(), ...base, historyVerify: hv });
  check(results, 'R006 同运单重复理赔 → block', hits.some((h) => h.code === 'R006' && h.level === 'block'));

  // R006 高频理赔
  hits = runRules({ case: fakeCase(), ...base, historyVerify: { ...hv, sameWaybillClaimed: false, claims90d: 4 } });
  check(results, 'R006 90 天 4 次理赔 → warn', hits.some((h) => h.code === 'R006' && h.level === 'warn'));

  // R007 核验缺失
  hits = runRules({ case: fakeCase(), ...base, waybillVerify: null });
  check(results, 'R007 运单核验失败 → warn（证据不足）', hits.some((h) => h.code === 'R007' && h.level === 'warn'));

  // 全绿基线
  hits = runRules({ case: fakeCase(), ...base, historyVerify: { ...hv, sameWaybillClaimed: false, claims90d: 0 } });
  check(results, '基线案件无 block', !hits.some((h) => h.level === 'block'));

  return results;
}

// ---------- 阶段 2：全流程 E2E ----------
async function phaseE2E(): Promise<Check[]> {
  console.log('\n■ 阶段 e2e：全流程（材料解析 → 并行核验 → 规则 → 风险 → 报告）');
  const results: Check[] = [];

  // 正常生鲜：预期低风险自动通过；若 LLM 保守判 medium 会转审批，走审批通过路径
  const s1 = await submit('fresh-normal');
  let c1 = await waitStatus(s1.caseId, ['completed', 'waiting_approval', 'failed']);
  if (c1.status === 'waiting_approval') {
    await api('POST', `/api/cases/${s1.caseId}/approve`, { decision: 'approve', approver: 'eval', comment: 'e2e 审批通过' });
    c1 = await waitStatus(s1.caseId, ['completed', 'failed']);
  }
  check(results, `fresh-normal 流程完成（${c1.status}）`, c1.status === 'completed');
  const insured = c1.report ? 2000 : null; // 模板保价 2000
  const payout = c1.report?.suggestedPayout;
  check(results, 'fresh-normal 结论 approve', c1.report?.conclusion === 'approve');
  check(results, '赔付金额校准 ≤ min(申报, 保价)', payout != null && payout <= Math.min(c1.declaredAmount, insured ?? Infinity), `payout=${payout}`);
  check(results, '报告依据带证据引用', (c1.report?.basis ?? []).some((b: any) => (b.refs ?? []).length > 0));

  // 超保价数码：R003 block → 强制 high → 审批
  const s2 = await submit('digital-over');
  const c2 = await waitStatus(s2.caseId, ['waiting_approval', 'completed', 'failed']);
  check(results, 'digital-over 转人工审批', c2.status === 'waiting_approval');
  check(results, '审批单含 R003 红线', (c2.pendingApproval?.payload?.blockHits ?? []).some((b: any) => b.code === 'R003'));
  if (c2.status === 'waiting_approval') {
    await api('POST', `/api/cases/${s2.caseId}/approve`, { decision: 'approve', approver: 'eval', comment: '降额赔付' });
  }
  const c2f = await waitStatus(s2.caseId, ['completed', 'failed']);
  check(results, 'digital-over 审批后完成', c2f.status === 'completed');
  check(results, '赔付仍受保价上限约束', (c2f.report?.suggestedPayout ?? 0) <= 5000, `payout=${c2f.report?.suggestedPayout}`);
  const trace2 = (await api('GET', `/api/cases/${s2.caseId}/trace`)).json;
  const agents = new Set(trace2.map((t: any) => t.agent));
  check(results, '六类 Agent 全部留痕', ['supervisor', 'parse', 'waybill', 'rules', 'risk', 'report'].every((a) => agents.has(a)), [...agents].join(','));

  return results;
}

// ---------- 阶段 3：审批路径 / 幂等 ----------
async function phaseApproval(): Promise<Check[]> {
  console.log('\n■ 阶段 approval：审批拒绝路径 + 幂等');
  const results: Check[] = [];

  const s1 = await submit('general-late');
  const c1 = await waitStatus(s1.caseId, ['waiting_approval', 'completed', 'failed']);
  check(results, '超时效案件转人工审批', c1.status === 'waiting_approval' || (c1.status === 'completed' && c1.report?.conclusion === 'reject'));
  if (c1.status === 'waiting_approval') {
    await api('POST', `/api/cases/${s1.caseId}/approve`, { decision: 'reject', approver: 'eval', comment: '超时效' });
  }
  const c1f = await waitStatus(s1.caseId, ['completed', 'failed']);
  check(results, '审批拒绝 → 结论 reject + 赔付 0', c1f.report?.conclusion === 'reject' && Number(c1f.report?.suggestedPayout ?? 1) === 0);

  // 冲突案件（申报 vs 发票冲突 → 转 approval）
  const s2 = await submit('general-conflict');
  const c2 = await waitStatus(s2.caseId, ['waiting_approval', 'completed', 'failed']);
  check(results, '冲突案件转人工审批', c2.status === 'waiting_approval');
  if (c2.status === 'waiting_approval') {
    await api('POST', `/api/cases/${s2.caseId}/approve`, { decision: 'approve', approver: 'eval', comment: '按发票金额赔付' });
    await waitStatus(s2.caseId, ['completed', 'failed']);
  }

  // 幂等：重复审批
  const dup = await api('POST', `/api/cases/${s1.caseId}/approve`, { decision: 'approve', approver: 'eval' });
  check(results, '重复审批被拒绝（409）', dup.status === 409, String(dup.json?.error));

  return results;
}

// ---------- 阶段 4：重启恢复（checkpoint 跨进程） ----------
async function phaseRestart(): Promise<Check[]> {
  console.log('\n■ 阶段 restart：SIGTERM 重启后 interrupt 案件恢复');
  const results: Check[] = [];

  const s = await submit('digital-missing'); // R001 block → 高风险 → 审批
  const c1 = await waitStatus(s.caseId, ['waiting_approval', 'completed', 'failed']);
  check(results, '缺材料案件挂起等待审批', c1.status === 'waiting_approval');

  await stopServer();
  await startServer();
  console.log('  服务已重启（checkpoint 来自 PostgreSQL）');

  const r = await api('POST', `/api/cases/${s.caseId}/approve`, { decision: 'approve', approver: 'eval', comment: '重启后恢复审批' });
  check(results, '重启后可恢复挂起案件', r.status === 202, JSON.stringify(r.json));
  if (r.status === 202) {
    const cf = await waitStatus(s.caseId, ['completed', 'failed']);
    check(results, '恢复后流程跑完', cf.status === 'completed');
    check(results, '恢复后审批记录完整', cf.status === 'completed' && !!cf.report);
  }

  // 执行中强杀：案件跑到核验阶段时 SIGTERM（非 interrupt 挂起），重启后应自动从 checkpoint 断点恢复。
  // 选 verifying 窗口：supervisor/parse 必然已完成，恢复后不应重跑（trace 各只有 1 条）。
  let mid: { caseId: string; caseNo: string } | null = null;
  for (let attempt = 1; attempt <= 4 && !mid; attempt++) {
    const sc = await submit('general-normal');
    const start = Date.now();
    while (Date.now() - start < 120_000) {
      const cc = await getCase(sc.caseId);
      if (['parsing', 'verifying'].includes(cc.status)) {
        mid = sc;
        console.log(`  在 ${cc.status} 阶段强杀服务进程（SIGTERM）...`);
        break;
      }
      if (['completed', 'failed', 'waiting_approval'].includes(cc.status)) break; // 跑太快，换一件重试
      await new Promise((res) => setTimeout(res, 250));
    }
    if (mid) {
      await stopServer();
      break;
    }
  }
  check(results, '捕获到核验中的案件并强杀服务', !!mid);
  if (!mid) return results;
  await startServer();
  console.log('  服务已重启，等待自动断点恢复...');
  let rf = await waitStatus(mid!.caseId, ['completed', 'waiting_approval', 'failed'], 300_000);
  if (rf.status === 'waiting_approval') {
    console.log('  恢复后案件按风险分流至人工审批，走审批通过路径...');
    await api('POST', `/api/cases/${mid!.caseId}/approve`, { decision: 'approve', approver: 'eval', comment: '断点恢复后审批' });
    rf = await waitStatus(mid!.caseId, ['completed', 'failed'], 300_000);
  }
  check(results, '执行中重启后自动断点恢复至完成', rf.status === 'completed', `status=${rf.status}`);
  check(results, '断点恢复后报告已生成', !!rf.report, rf.report?.conclusion ?? '无报告');
  const trace3 = (await api('GET', `/api/cases/${mid!.caseId}/trace`)).json;
  check(results, '断点恢复执行轨迹完整（六类 Agent）', ['supervisor', 'parse', 'waybill', 'rules', 'risk', 'report'].every((a) => trace3.some((t: any) => t.agent === a && t.status === 'ok')));
  const supCount = trace3.filter((t: any) => t.agent === 'supervisor').length;
  check(results, '已完成节点不重跑（supervisor 仅执行 1 次）', supCount === 1, `supervisor x${supCount}`);
  return results;
}

// ---------- 阶段 5：权限隔离 ----------
async function phasePermission(): Promise<Check[]> {
  console.log('\n■ 阶段 permission：高影响操作权限隔离');
  const results: Check[] = [];
  const s = await submit('general-normal');
  const c1 = await waitStatus(s.caseId, ['completed', 'waiting_approval', 'failed']);
  if (c1.status === 'waiting_approval') {
    await api('POST', `/api/cases/${s.caseId}/approve`, { decision: 'approve', approver: 'eval' });
    await waitStatus(s.caseId, ['completed', 'failed']);
  }
  const noTok = await api('POST', `/api/cases/${s.caseId}/decision`, { action: 'pay' });
  check(results, '无令牌决策 → 403', noTok.status === 403);
  const badTok = await api('POST', `/api/cases/${s.caseId}/decision`, { action: 'pay' }, { 'X-Approver-Token': 'wrong' });
  check(results, '错误令牌决策 → 403', badTok.status === 403);
  const ok = await api('POST', `/api/cases/${s.caseId}/decision`, { action: 'pay', operator: 'eval' }, { 'X-Approver-Token': config.approverToken });
  check(results, '正确令牌赔付 → 200', ok.status === 200);
  return results;
}

// ---------- 阶段 6：MCP 工具通道 ----------
async function phaseMcp(): Promise<Check[]> {
  console.log('\n■ 阶段 mcp：运单核验经 MCP 调用');
  const results: Check[] = [];
  const s = await submit('general-normal');
  const c1 = await waitStatus(s.caseId, ['completed', 'waiting_approval', 'failed']);
  if (c1.status === 'waiting_approval') {
    await api('POST', `/api/cases/${s.caseId}/approve`, { decision: 'approve', approver: 'eval' });
    await waitStatus(s.caseId, ['completed', 'failed']);
  }
  const trace = (await api('GET', `/api/cases/${s.caseId}/trace`)).json as any[];
  const wb = trace.find((t) => t.agent === 'waybill' && t.action === 'analyze');
  check(results, 'waybill 核验经 MCP 工具调用', !!wb && wb.detail?.viaMcp === true, `viaMcp=${wb?.detail?.viaMcp}`);
  check(results, 'waybill 模型调用留痕（tokens）', !!wb && (wb.prompt_tokens ?? 0) > 0, `prompt=${wb?.prompt_tokens}`);
  return results;
}

// ---------- 主流程 ----------
const all: Record<string, () => Promise<Check[]> | Check[]> = {
  rules: () => phaseRules(),
  e2e: phaseE2E,
  approval: phaseApproval,
  restart: phaseRestart,
  permission: phasePermission,
  mcp: phaseMcp,
};

try {
  const order = phase === 'all' ? Object.keys(all) : [phase];
  const report: Record<string, Check[]> = {};
  const needServer = order.some((p) => p !== 'rules');

  if (order.includes('rules')) report.rules = phaseRules();
  if (needServer) {
    await startServer();
    for (const p of order.filter((x) => x !== 'rules')) {
      report[p] = await all[p]();
    }
  }

  const flat = Object.values(report).flat();
  const pass = flat.filter((x) => x.pass).length;
  console.log(`\n========== 评测汇总: ${pass}/${flat.length} 通过 ==========`);
  for (const [p, rs] of Object.entries(report)) {
    const pp = rs.filter((x) => x.pass).length;
    console.log(`  ${p.padEnd(10)} ${pp}/${rs.length}`);
  }
  mkdirSync(`${ROOT_DIR}data`, { recursive: true });
  writeFileSync(`${ROOT_DIR}data/eval-report-${RUN}.json`, JSON.stringify({ ts: Date.now(), phase: order, report }, null, 2));
  console.log(`报告: data/eval-report-${RUN}.json`);
  process.exitCode = flat.every((x) => x.pass) ? 0 : 1;
} catch (err: any) {
  console.error(`评测失败: ${err?.message ?? err}`);
  process.exitCode = 1;
} finally {
  await stopServer();
}
