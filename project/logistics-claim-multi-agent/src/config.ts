import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3005),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:5434/claim_audit',
  redisUrl: process.env.REDIS_URL ?? '',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? '',
  model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
  llmTimeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 60000),
  llmMaxRetries: Number(process.env.LLM_MAX_RETRIES ?? 2),
  largeAmountThreshold: Number(process.env.LARGE_AMOUNT_THRESHOLD ?? 3000),
  highRiskManual: (process.env.HIGH_RISK_MANUAL_APPROVAL ?? 'true') === 'true',
  approverToken: process.env.APPROVER_TOKEN ?? 'demo-approver-token',
};

// 项目根（config.ts 位于 src/ 下，回退一级）
export const ROOT_DIR = new URL('..', import.meta.url).pathname;
