// 一键演示：拉起服务 → 三个代表性案件全流程（自动通过 / 高风险审批通过 / 超时效拒赔）
// → 幂等与权限演示 → 执行轨迹汇总。
import '../src/polyfill.js';
import { spawn } from 'node:child_process';
import { mkdirSync, appendFileSync } from 'node:fs';
import { config, ROOT_DIR } from '../src/config.js';

const PORT = Number(process.env.DEMO_PORT ?? 3015);
const BASE = `http://127.0.0.1:${PORT}`;
const TOKEN = config.approverToken;
const TSX = `${ROOT_DIR}node_modules/tsx/dist/cli.mjs`;
const LOG = `${ROOT_DIR}data/demo-server.log`;

const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

let server: ReturnType<typeof spawn> | null = null;

async function startServer() {
  mkdirSync(`${ROOT_DIR}data`, { recursive: true });
  const env = { ...process.env, PORT: String(PORT) } as Record<string, string>;
  delete env.NODE_OPTIONS; // 剥离 IDE 注入的 shim，避免子进程 crypto 被破坏
  server = spawn(process.execPath, [TSX, `${ROOT_DIR}src/server/index.ts`], { env, cwd: ROOT_DIR });
  server.stdout!.on('data', (d) => appendFileSync(LOG, d));
  server.stderr!.on('data', (d) => appendFileSync(LOG, d));
  const started = Date.now();
  while (Date.now() - started < 30_000) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('服务启动超时，详见 data/demo-server.log');
}

async function api(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<{ status: number; json: any }> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  return { status: r.status, json };
}

async function submit(templateKey: string) {
  const { json } = await api('POST', '/api/cases', { templateKey });
  return json as { caseId: string; caseNo: string };
}

async function getCase(caseId: string) {
  const { json } = await api('GET', `/api/cases/${caseId}`);
  return json as any;
}

async function waitStatus(caseId: string, want: string[], timeoutMs = 240_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cc = await getCase(caseId);
    if (want.includes(cc.status)) return cc;
    await new Promise((r) => setTimeout(r, 1200));
  }
  throw new Error(`等待状态 ${want.join('/')} 超时`);
}

async function waitApproval(caseId: string, timeoutMs = 240_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cc = await getCase(caseId);
    if (cc.status === 'waiting_approval' && cc.pendingApproval) return cc;
    if (cc.status === 'completed' || cc.status === 'failed') return cc; // 未触发审批（分级低于预期）
    await new Promise((r) => setTimeout(r, 1200));
  }
  throw new Error('等待人工审批超时');
}

function printReport(cc: any) {
  const r = cc.report;
  if (!r) return console.log(c.dim('  （无报告）'));
  console.log(`  结论: ${c.bold(r.conclusion)}　建议赔付: ${c.bold(r.suggestedPayout ?? '—')} 元`);
  console.log(`  意见: ${r.opinion}`);
  for (const b of r.basis.slice(0, 3)) console.log(c.dim(`   · ${b.point}`));
}

async function main() {
  console.log(c.cyan('\n========== 物流智能理赔审核 Multi-Agent 系统 · 演示 =========='));
  await startServer();
  console.log(c.green(`服务已启动: ${BASE}（日志: data/demo-server.log）\n`));

  // ---- 场景 1：生鲜正常破损 → 低风险自动通过 → 赔付决策 ----
  console.log(c.yellow('▶ 场景 1：生鲜水果破损（材料齐全、温控正常）→ 预期低风险自动通过'));
  const s1 = await submit('fresh-normal');
  console.log(c.dim(`  案件 ${s1.caseNo} 已受理，工作流执行中...`));
  const case1 = await waitApproval(s1.caseId);
  if (case1.pendingApproval) {
    console.log(c.dim('  （被分流至人工审批，走审批通过路径）'));
    await api('POST', `/api/cases/${s1.caseId}/approve`, { decision: 'approve', approver: '王经理', comment: '材料齐全' });
  }
  const case1f = await waitStatus(s1.caseId, ['completed', 'failed']);
  console.log(c.green(`  最终状态: ${case1f.status}`));
  printReport(case1f);
  const d1 = await api('POST', `/api/cases/${s1.caseId}/decision`, { action: 'pay', operator: '王经理', comment: '演示：按建议金额赔付' }, { 'X-Approver-Token': TOKEN });
  console.log(c.green(`  赔付决策: HTTP ${d1.status} ${JSON.stringify(d1.json)}\n`));

  // ---- 场景 2：高频理赔 → 高风险 → 人工审批（通过）----
  console.log(c.yellow('▶ 场景 2：生鲜高频理赔（90 天 3 次 + 未结工单）→ 预期人工审批'));
  const s2 = await submit('fresh-repeat');
  console.log(c.dim(`  案件 ${s2.caseNo} 已受理，工作流执行中...`));
  const case2 = await waitApproval(s2.caseId);
  if (case2.pendingApproval) {
    const p = case2.pendingApproval.payload;
    console.log(c.cyan(`  ⏸  审批请求已挂起（interrupt）:`));
    console.log(`     风险: ${p.risk.level}（${p.risk.score} 分）${p.risk.forcedByRule ? ` [规则强制 ${p.risk.forcedByRule}]` : ''}`);
    console.log(`     建议: ${p.suggestedAction}`);
    for (const f of p.risk.factors.slice(0, 3)) console.log(c.dim(`     · ${f}`));
    await api('POST', `/api/cases/${s2.caseId}/approve`, { decision: 'approve', approver: '王经理', comment: '历史理赔属实，本次货损证据充分，同意赔付' });
    console.log(c.dim('  审批通过，Command(resume) 恢复流程...'));
  } else {
    console.log(c.dim('  （案件未触发审批，LLM 分级低于预期，直接完成）'));
  }
  const case2f = await waitStatus(s2.caseId, ['completed', 'failed']);
  console.log(c.green(`  最终状态: ${case2f.status}`));
  printReport(case2f);
  console.log();

  // ---- 场景 3：超时效 → 规则红线 → 人工审批（拒绝）→ 拒赔决策 ----
  console.log(c.yellow('▶ 场景 3：普货签收 18 天后申请理赔（超 7 天时效）→ 预期红线拦截、审批拒绝'));
  const s3 = await submit('general-late');
  console.log(c.dim(`  案件 ${s3.caseNo} 已受理，工作流执行中...`));
  const case3 = await waitApproval(s3.caseId);
  if (case3.pendingApproval) {
    const p = case3.pendingApproval.payload;
    console.log(c.cyan(`  ⏸  审批请求已挂起:`));
    for (const b of p.blockHits) console.log(`     红线 ${b.code} ${b.title}: ${b.detail}`);
    console.log(`     建议: ${p.suggestedAction}`);
    await api('POST', `/api/cases/${s3.caseId}/approve`, { decision: 'reject', approver: '李主管', comment: '超过理赔时效，按规则拒赔' });
    console.log(c.dim('  审批拒绝，恢复流程生成拒赔报告...'));
  }
  const case3f = await waitStatus(s3.caseId, ['completed', 'failed']);
  console.log(c.green(`  最终状态: ${case3f.status}`));
  printReport(case3f);
  const d3 = await api('POST', `/api/cases/${s3.caseId}/decision`, { action: 'reject', operator: '李主管', comment: '超时效拒赔' }, { 'X-Approver-Token': TOKEN });
  console.log(c.green(`  拒赔决策: HTTP ${d3.status} ${JSON.stringify(d3.json)}\n`));

  // ---- 幂等演示：重复审批 → 409 ----
  console.log(c.yellow('▶ 幂等验证：对已审批案件重复提交审批'));
  const dup = await api('POST', `/api/cases/${s2.caseId}/approve`, { decision: 'approve', approver: '王经理' });
  console.log(dup.status === 409 ? c.green(`  重复审批被拒绝: HTTP 409 ${dup.json.error}`) : c.red(`  异常: HTTP ${dup.status}`));

  // ---- 权限演示：无令牌调用赔付决策 → 403 ----
  console.log(c.yellow('▶ 权限验证：无审批令牌调用最终赔付'));
  const noTok = await api('POST', `/api/cases/${s1.caseId}/decision`, { action: 'pay' });
  console.log(noTok.status === 403 ? c.green(`  未授权操作被拒绝: HTTP 403 ${noTok.json.error}`) : c.red(`  异常: HTTP ${noTok.status}`));

  // ---- 执行轨迹汇总 ----
  console.log(c.yellow('\n▶ 执行轨迹（场景 2，Agent 链路追踪）'));
  const { json: trace } = await api('GET', `/api/cases/${s2.caseId}/trace`);
  for (const t of trace) {
    const tok = t.prompt_tokens + t.completion_tokens;
    console.log(c.dim(`  ${String(t.id).padStart(3)} | ${(t.agent ?? '').padEnd(10)} | ${(t.action ?? '').padEnd(14)} | ${String(t.duration_ms).padStart(6)}ms${tok ? ` | tokens ${tok}` : ''}${t.status !== 'ok' ? c.red(` | ${t.status}`) : ''}`));
  }
  console.log(c.cyan('\n========== 演示结束 =========='));
  console.log(c.dim(`报告归档: data/reports/　审核台: npm start 后访问 http://127.0.0.1:${config.port}`));
}

main()
  .catch((err) => {
    console.error(c.red(`\n演示失败: ${err?.message ?? err}`));
    process.exitCode = 1;
  })
  .finally(async () => {
    server?.kill('SIGTERM');
  });
