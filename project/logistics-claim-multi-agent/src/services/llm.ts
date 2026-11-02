import { ChatDeepSeek } from '@langchain/deepseek';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { z } from 'zod';
import { config } from '../config.js';

export const llm = new ChatDeepSeek({
  apiKey: config.deepseekApiKey,
  model: config.model,
  temperature: 0.2,
  timeout: config.llmTimeoutMs,
  maxRetries: 0, // 重试由本模块统一管理（可观测）
});

export interface LlmUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
}

/** LLM 调用重试：指数退避（模型调用失败不直接打断审核流程） */
export async function withRetry<T>(fn: (attempt: number) => Promise<T>, opts: { retries?: number; baseMs?: number } = {}): Promise<T> {
  const retries = opts.retries ?? config.llmMaxRetries;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      if (attempt > retries) break;
      await new Promise((r) => setTimeout(r, opts.baseMs ?? 800 * 2 ** (attempt - 1)));
    }
  }
  throw lastErr;
}

function extractUsage(msg: any): LlmUsage {
  const u = msg?.usage_metadata ?? msg?.additional_kwargs?.usage_metadata;
  return {
    model: config.model,
    promptTokens: Number(u?.input_tokens ?? 0),
    completionTokens: Number(u?.output_tokens ?? 0),
  };
}

/**
 * 结构化 JSON 输出调用（response_format=json_object + zod 校验）。
 * 相比 withStructuredOutput 能拿到 token 用量，便于链路可观测。
 */
export async function callJson<T>(opts: {
  schema: z.ZodType<T>;
  system: string;
  user: string;
  tag: string; // 观测标签，如 risk_assess
  maxAttempts?: number;
  maxTokens?: number; // 输出上限（长报告场景需显式放宽，避免 JSON 被截断）
}): Promise<{ value: T; usage: LlmUsage }> {
  let lastRaw = '';
  let lastErr = '';
  const attempts = opts.maxAttempts ?? config.llmMaxRetries + 1;
  for (let i = 1; i <= attempts; i++) {
    const userMsg = i === 1 ? opts.user : `${opts.user}\n\n注意：上一次输出未通过校验（${lastErr}）。原始输出：${lastRaw.slice(0, 800)}。请严格按 schema 重新输出 JSON。`;
    const msg = await llm.invoke(
      [new SystemMessage(`${opts.system}\n只输出一个合法 JSON 对象，不要输出任何其他文字、不要使用 markdown 代码块。`), new HumanMessage(userMsg)],
      opts.maxTokens ? ({ max_tokens: opts.maxTokens } as any) : undefined,
    );
    lastRaw = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    try {
      const json = JSON.parse(stripJsonFence(lastRaw));
      const parsed = opts.schema.safeParse(json);
      if (!parsed.success) {
        lastErr = parsed.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ');
        continue;
      }
      return { value: parsed.data, usage: extractUsage(msg) };
    } catch (err: any) {
      lastErr = `invalid json: ${err?.message ?? err}`;
    }
  }
  throw new Error(`[${opts.tag}] LLM 结构化输出失败: ${lastErr}`);
}

function stripJsonFence(s: string): string {
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (m ? m[1] : s).trim();
}
