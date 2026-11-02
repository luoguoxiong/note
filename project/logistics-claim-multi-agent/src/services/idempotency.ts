import { getKv } from './redis.js';

/**
 * 幂等包装：Redis SETNX 抢占 + 结果缓存，避免对业务接口的重复调用
 * （如运单核验在重试/恢复场景被重复触发）。
 */
export async function withIdempotency<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<{ value: T; duplicate: false } | { value: T | undefined; duplicate: true }> {
  const kv = getKv();
  const cacheKey = `idem:${key}`;
  const acquired = await kv.setnx(`lock:${cacheKey}`, ttlMs);
  if (acquired) {
    try {
      const value = await fn();
      await kv.set(cacheKey, JSON.stringify(value ?? null), ttlMs);
      return { value, duplicate: false };
    } catch (err) {
      await kv.del(`lock:${cacheKey}`); // 失败释放锁，允许重试
      throw err;
    }
  }
  const cached = await kv.get(cacheKey);
  if (cached !== null) {
    return { value: JSON.parse(cached) as T, duplicate: true };
  }
  // 锁被他人持有且尚无结果：视为重复调用
  return { value: undefined, duplicate: true };
}
