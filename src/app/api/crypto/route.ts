import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { getCryptoMarkets, getCryptoHistorical, getCryptoGlobal } from '@/lib/providers/coingecko'
import { CACHE_TTL } from '@/lib/constants'
import type { CryptoMarket, CryptoGlobal, CryptoHistorical } from '@/types/crypto.types'
import type { ApiResponse } from '@/types/api.types'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const type = request.nextUrl.searchParams.get('type') || 'markets'
    try {
      if (type === 'markets') {
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)
        const result = await getCachedOrFetch('crypto:markets', { limit: limit.toString() }, () => getCryptoMarkets(limit), CACHE_TTL.REALTIME)
        const response: ApiResponse<CryptoMarket[]> = { success: true, data: result.data, meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.REALTIME } }
        return NextResponse.json(response)
      }
      if (type === 'historical') {
        const id = request.nextUrl.searchParams.get('id') || 'bitcoin'
        const days = parseInt(request.nextUrl.searchParams.get('days') || '7', 10)
        const result = await getCachedOrFetch(`crypto:historical:${id}`, { days: days.toString() }, () => getCryptoHistorical(id, days), CACHE_TTL.HISTORICAL)
        const response: ApiResponse<CryptoHistorical[]> = { success: true, data: result.data, meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.HISTORICAL } }
        return NextResponse.json(response)
      }
      if (type === 'global') {
        const result = await getCachedOrFetch('crypto:global', {}, () => getCryptoGlobal(), CACHE_TTL.REALTIME)
        const response: ApiResponse<CryptoGlobal> = { success: true, data: result.data, meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.REALTIME } }
        return NextResponse.json(response)
      }
      const errorResponse: ApiResponse<null> = { success: false, data: null, meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 }, error: { code: 'INVALID_TYPE', message: 'type must be markets, historical, or global' } }
      return NextResponse.json(errorResponse, { status: 400 })
    } catch (error) {
      const errorResponse: ApiResponse<null> = { success: false, data: null, meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 }, error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Crypto fetch failed' } }
      return NextResponse.json(errorResponse, { status: 502 })
    }
  })
}
