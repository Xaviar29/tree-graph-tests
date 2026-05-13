import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { calculatePercentAboveMA, sp500Symbols } from '@/lib/calculations/breadth'
import { CACHE_TTL } from '@/lib/constants'
import type { ApiResponse } from '@/types/api.types'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const period = parseInt(request.nextUrl.searchParams.get('period') || '50', 10)

    if (![50, 200].includes(period)) {
      return NextResponse.json({
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'INVALID_PERIOD', message: 'period must be 50 or 200' },
      } satisfies ApiResponse<null>, { status: 400 })
    }

    try {
      const result = await getCachedOrFetch<{ percentAbove: number; period: number }>(
        `breadth:above-ma:${period}`,
        { period: period.toString() },
        async () => {
          const percentAbove = await calculatePercentAboveMA([], period)
          return { percentAbove, period }
        },
        CACHE_TTL.BREADTH,
      )

      return NextResponse.json({
        success: true,
        data: result.data,
        meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.BREADTH },
      } satisfies ApiResponse<{ percentAbove: number; period: number }>)
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch above MA' },
      } satisfies ApiResponse<null>, { status: 502 })
    }
  })
}
