import '../polyfill.js'; // 必须最先：NODE_OPTIONS shim 会破坏 globalThis.crypto
import 'dotenv/config';
import { initDb } from '../db/schema.js';
import { pool } from '../db/pool.js';
import { config } from '../config.js';
import { getClaimGraph } from '../graph/build.js';
import { recoverInterruptedRuns } from '../graph/runner.js';
import { app } from './app.js';
import { quitKv } from '../services/redis.js';
import { shutdownMcp } from '../services/mcp.js';

// 启动顺序：业务表 DDL → checkpoint 表迁移（PostgresSaver.setup）→ 编译图 →
// 断点恢复（扫描卡在中间态的案件续跑）→ 监听端口
initDb()
  .then(() => getClaimGraph())
  .then(async () => {
    const { resumed, restarted } = await recoverInterruptedRuns();
    if (resumed + restarted > 0) {
      console.log(`[claim-audit] 异常恢复：${resumed} 个案件从 checkpoint 断点续跑，${restarted} 个重新提交执行`);
    }
    app.listen(config.port, () => {
      console.log(`[claim-audit] 服务已启动: http://127.0.0.1:${config.port} （审核台: /）`);
    });
  })
  .catch((err) => {
    console.error('[claim-audit] 启动失败（请确认 PostgreSQL/Redis 已启动，先执行 npm run seed）:', err?.message ?? err);
    process.exit(1);
  });

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    console.log(`\n[claim-audit] 收到 ${signal}，优雅退出...`);
    shutdownMcp()
      .catch(() => {})
      .finally(() => quitKv().catch(() => {}).finally(() => pool.end().catch(() => {}).finally(() => process.exit(0))));
  });
}
