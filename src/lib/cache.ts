import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { CACHE_TTL } from './constants'
import { NextRequest, NextResponse } from 'next/server'

function createRedis(): Redis | null {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return null
    return new Redis({ url, token })
  } catch { return null }
}

let redisInstance: Redis | null = null

function getRedis(): Redis | null {
  if (!redisInstance) redisInstance = createRedis()
  return redisInstance
}

const memoryCache = new Map<string, { data: unknown; expiry: number }>()

function getCacheKey(prefix: string, params: Record<string, string | string[]>): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
    .join('&')
  return `td:${prefix}:${sorted}`
}

export async function getCachedOrFetch<T>(
  prefix: string,
  params: Record<string, string | string[]>,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.REALTIME,
): Promise<{ data: T; cachedAt: string; source: string }> {
  const key = getCacheKey(prefix, params)
  const now = Date.now()

  const redis = getRedis()
  if (redis) {
    try {
      const cached = await redis.get<T>(key)
      if (cached !== null) {
        return { data: cached, cachedAt: new Date(now - ttl).toISOString(), source: 'redis' }
      }
      const data = await fetcher()
      await redis.setex(key, Math.ceil(ttl / 1000), data)
      return { data, cachedAt: new Date().toISOString(), source: 'redis' }
    } catch {}
  }

  const entry = memoryCache.get(key)
  if (entry && entry.expiry > now) {
    return { data: entry.data as T, cachedAt: new Date(entry.expiry - ttl).toISOString(), source: 'memory' }
  }

  try {
    const data = await fetcher()
    memoryCache.set(key, { data, expiry: now + ttl })
    return { data, cachedAt: new Date().toISOString(), source: 'memory' }
  } catch (error) {
    if (entry) {
      return { data: entry.data as T, cachedAt: new Date(entry.expiry - ttl).toISOString(), source: 'stale-memory' }
    }
    throw error
  }
}

export function clearCache() {
  memoryCache.clear()
  redisInstance = null
}

export function getCacheEntry<T>(key: string): { data: T } | undefined {
  const entry = memoryCache.get(key)
  if (entry) return { data: entry.data as T }
  return undefined
}

export function setCacheEntry<T>(key: string, data: T, ttlMs: number) {
  memoryCache.set(key, { data, expiry: Date.now() + ttlMs })
  const redis = getRedis()
  if (redis) {
    redis.setex(key, Math.ceil(ttlMs / 1000), data).catch(() => {})
  }
}

let ratelimitInstance: Ratelimit | null = null
let hasRatelimit = false

function initRatelimit() {
  if (ratelimitInstance) return
  const redis = getRedis()
  if (redis) {
    ratelimitInstance = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '30 s'), prefix: 'td:rl' })
    hasRatelimit = true
  }
}

export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  initRatelimit()
  if (!hasRatelimit || !ratelimitInstance) return handler()

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'anonymous'

  try {
    const { success, remaining, reset } = await ratelimitInstance.limit(ip)
    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: `Too many requests.` } },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': reset.toString() } },
      )
    }
    const res = await handler()
    res.headers.set('X-RateLimit-Remaining', remaining.toString())
    res.headers.set('X-RateLimit-Reset', reset.toString())
    return res
  } catch {
    return handler()
  }
}
