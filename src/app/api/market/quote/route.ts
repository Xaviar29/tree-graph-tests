import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { getQuote } from '@/lib/providers/yahoo-finance'
import { CACHE_TTL } from '@/lib/constants'
import type { Quote } from '@/types/market.types'
import type { ApiResponse } from '@/types/api.types'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const symbolsParam = request.nextUrl.searchParams.get('symbols')

    if (!symbolsParam) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'MISSING_PARAM', message: 'symbols query parameter is required' },
      }
      return NextResponse.json(response, { status: 400 })
    }

    const symbols = symbolsParam.split(',').map((s) => s.trim()).filter(Boolean)

    try {
      const result = await getCachedOrFetch<Quote[]>(
        'market:quote',
        { symbols: symbolsParam },
        () => getQuote(symbols),
        CACHE_TTL.REALTIME,
      )

      const response: ApiResponse<Quote[]> = {
        success: true,
        data: result.data,
        meta: {
          cachedAt: result.cachedAt,
          source: result.source,
          ttlMs: CACHE_TTL.REALTIME,
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
          message: error instanceof Error ? error.message : 'Failed to fetch quotes',
        },
      }
      return NextResponse.json(response, { status: 502 })
    }
  })
}
