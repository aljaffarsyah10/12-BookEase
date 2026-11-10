/**
 * High-performance Cache Module
 * Supports high-speed in-memory LRU/TTL caching with automatic Upstash Redis REST compatibility.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();
const MAX_MEMORY_ITEMS = 5000;

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
const isRedisConfigured = Boolean(upstashUrl && upstashToken);

/**
 * Periodically purge expired memory cache items.
 */
function pruneExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Retrieve a cached value by key.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // 1. Check in-memory store first
  const local = memoryStore.get(key);
  if (local) {
    if (local.expiresAt > Date.now()) {
      return local.value as T;
    }
    memoryStore.delete(key);
  }

  // 2. Fallback to Redis if configured
  if (isRedisConfigured && upstashUrl && upstashToken) {
    try {
      const res = await fetch(`${upstashUrl}/get/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${upstashToken}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as { result: string | null };
        if (json.result) {
          const parsed = JSON.parse(json.result) as T;
          // Populate local cache for instant subsequent reads
          memoryStore.set(key, { value: parsed, expiresAt: Date.now() + 30000 });
          return parsed;
        }
      }
    } catch (err) {
      console.warn("[Cache] Redis get error, fallback to null:", err);
    }
  }

  return null;
}

/**
 * Set a cached key with an optional TTL (in seconds, default: 60s).
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = 60
): Promise<void> {
  const expiresAt = Date.now() + ttlSeconds * 1000;

  // Prune if limit reached
  if (memoryStore.size >= MAX_MEMORY_ITEMS) {
    pruneExpiredEntries();
  }

  memoryStore.set(key, { value, expiresAt });

  // Sync to Redis if configured
  if (isRedisConfigured && upstashUrl && upstashToken) {
    try {
      const payload = JSON.stringify(value);
      await fetch(
        `${upstashUrl}/set/${encodeURIComponent(key)}?ex=${ttlSeconds}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${upstashToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        }
      );
    } catch (err) {
      console.warn("[Cache] Redis set error:", err);
    }
  }
}

/**
 * Invalidate a cached key.
 */
export async function cacheDel(key: string): Promise<void> {
  memoryStore.delete(key);

  if (isRedisConfigured && upstashUrl && upstashToken) {
    try {
      await fetch(`${upstashUrl}/del/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
        },
        cache: "no-store",
      });
    } catch (err) {
      console.warn("[Cache] Redis del error:", err);
    }
  }
}

/**
 * Invalidate all cached keys matching a prefix.
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Reset memory store (used in test suites).
 */
export function _resetCacheStore(): void {
  memoryStore.clear();
}
