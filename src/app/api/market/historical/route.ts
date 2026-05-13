import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { getHistorical } from '@/lib/providers/yahoo-finance'
import { CACHE_TTL } from '@/lib/constants'
import type { OHLCV } from '@/types/market.types'
import type { ApiResponse } from '@/types/api.types'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const symbol = request.nextUrl.searchParams.get('symbol')
    const range = request.nextUrl.searchParams.get('range') || '1y'
    const interval = request.nextUrl.searchParams.get('interval') || '1d'

    if (!symbol) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'MISSING_PARAM', message: 'symbol query parameter is required' },
      }
      return NextResponse.json(response, { status: 400 })
    }

    const validRanges = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max']
    const validIntervals = ['1m', '5m', '15m', '1h', '1d', '1wk', '1mo']

    if (!validRanges.includes(range)) {
      return NextResponse.json({
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'INVALID_RANGE', message: `Invalid range. Valid: ${validRanges.join(', ')}` },
      } satisfies ApiResponse<null>, { status: 400 })
    }

    if (!validIntervals.includes(interval)) {
      return NextResponse.json({
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'INVALID_INTERVAL', message: `Invalid interval. Valid: ${validIntervals.join(', ')}` },
      } satisfies ApiResponse<null>, { status: 400 })
    }

    try {
      const result = await getCachedOrFetch<OHLCV[]>(
        'market:historical',
        { symbol, range, interval },
        () => getHistorical(symbol, range, interval),
        CACHE_TTL.HISTORICAL,
      )

      const response: ApiResponse<OHLCV[]> = {
        success: true,
        data: result.data,
        meta: {
          cachedAt: result.cachedAt,
          source: result.source,
          ttlMs: CACHE_TTL.HISTORICAL,
        },
      }
      return NextResponse.json(response)
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch historical data',
        },
      }
      return NextResponse.json(response, { status: 502 })
    }
  })
}
