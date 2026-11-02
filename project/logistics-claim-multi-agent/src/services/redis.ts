import Redis from 'ioredis';
import { config } from '../config.js';

/** Redis 客户端：未配置 REDIS_URL 时降级为进程内存实现（单实例 demo 够用） */
interface KvLike {
  set(key: string, value: string, ttlMs: number): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
  setnx(key: string, ttlMs: number): Promise<boolean>;
  quit(): Promise<void>;
}

class MemoryKv implements KvLike {
  private m = new Map<string, { v: string; exp: number }>();
  private sweep() {
    const now = Date.now();
    for (const [k, e] of this.m) if (e.exp && e.exp < now) this.m.delete(k);
  }
  async set(key: string, value: string, ttlMs: number) {
    this.m.set(key, { v: value, exp: ttlMs ? Date.now() + ttlMs : 0 });
  }
  async get(key: string) {
    this.sweep();
    return this.m.get(key)?.v ?? null;
  }
  async del(key: string) {
    this.m.delete(key);
  }
  async setnx(key: string, ttlMs: number) {
    this.sweep();
    if (this.m.has(key)) return false;
    this.m.set(key, { v: '1', exp: ttlMs ? Date.now() + ttlMs : 0 });
    return true;
  }
  async quit() {}
}

class RedisKv implements KvLike {
  constructor(private client: Redis) {}
  async set(key: string, value: string, ttlMs: number) {
    if (ttlMs) await this.client.set(key, value, 'PX', ttlMs);
    else await this.client.set(key, value);
  }
  async get(key: string) {
    return this.client.get(key);
  }
  async del(key: string) {
    await this.client.del(key);
  }
  async setnx(key: string, ttlMs: number) {
    const ok = await this.client.set(key, '1', 'PX', ttlMs, 'NX');
    return ok === 'OK';
  }
  async quit() {
    await this.client.quit();
  }
}

let kv: KvLike | null = null;

export function getKv(): KvLike {
  if (!kv) {
    kv = config.redisUrl ? new RedisKv(new Redis(config.redisUrl)) : new MemoryKv();
  }
  return kv;
}

export async function quitKv() {
  if (kv) await kv.quit();
  kv = null;
}
