import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limits that hold across serverless instances when Upstash Redis is configured
 * (UPSTASH_REDIS_REST_URL/TOKEN, or the KV_REST_API_* names the Vercel integration sets).
 * Without it, counters live in this process only: fine locally, best-effort on Vercel.
 */
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

export const rateLimitBackend = redis ? 'redis' : 'memory';

type Result = { ok: boolean; retryAfter: number };

export interface Limiter {
   /** Counts one hit. */
   hit(key: string): Promise<Result>;
   /** Checks without counting. */
   check(key: string): Promise<Result>;
}

const memoryHits = new Map<string, number[]>();

function memoryLimiter(name: string, max: number, windowSeconds: number): Limiter {
   const recent = (key: string) => {
      const since = Date.now() - windowSeconds * 1000;
      const hits = (memoryHits.get(`${name}:${key}`) ?? []).filter((t) => t > since);
      memoryHits.set(`${name}:${key}`, hits);
      return hits;
   };
   const result = (hits: number[]): Result => ({
      ok: hits.length < max,
      retryAfter: hits.length ? Math.ceil((hits[0] + windowSeconds * 1000 - Date.now()) / 1000) : 0,
   });
   return {
      async hit(key) {
         const hits = recent(key);
         const before = result(hits);
         if (before.ok) hits.push(Date.now());
         return before;
      },
      async check(key) {
         return result(recent(key));
      },
   };
}

function redisLimiter(client: Redis, name: string, max: number, windowSeconds: number): Limiter {
   const limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      prefix: `rl:${name}`,
   });
   const retry = (reset: number) => Math.max(0, Math.ceil((reset - Date.now()) / 1000));
   return {
      async hit(key) {
         const r = await limiter.limit(key);
         return { ok: r.success, retryAfter: retry(r.reset) };
      },
      async check(key) {
         const r = await limiter.getRemaining(key);
         return { ok: r.remaining > 0, retryAfter: retry(r.reset) };
      },
   };
}

export function createLimiter(name: string, max: number, windowSeconds: number): Limiter {
   return redis ? redisLimiter(redis, name, max, windowSeconds) : memoryLimiter(name, max, windowSeconds);
}

const memoryOnce = new Map<string, number>();

/** True the first time `key` is seen within `ttlSeconds` (used to stop one-time codes being replayed). */
export async function firstUse(key: string, ttlSeconds: number) {
   if (redis) return (await redis.set(`once:${key}`, 1, { nx: true, ex: ttlSeconds })) === 'OK';
   const now = Date.now();
   for (const [k, expires] of memoryOnce) if (expires < now) memoryOnce.delete(k);
   if (memoryOnce.has(key)) return false;
   memoryOnce.set(key, now + ttlSeconds * 1000);
   return true;
}
