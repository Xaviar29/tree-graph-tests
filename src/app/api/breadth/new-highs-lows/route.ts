import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { calculateNewHighsLows } from '@/lib/calculations/breadth'
import type { NewHighsLowsData } from '@/lib/calculations/breadth'
import { CACHE_TTL } from '@/lib/constants'
import type { ApiResponse } from '@/types/api.types'

export async function GET(_request: NextRequest) {
  return withRateLimit(_request, async () => {
    try {
      const result = await getCachedOrFetch<NewHighsLowsData>(
        'breadth:new-highs-lows',
        {},
        () => calculateNewHighsLows(),
        CACHE_TTL.BREADTH,
      )

      return NextResponse.json({
        success: true,
        data: result.data,
        meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.BREADTH },
      } satisfies ApiResponse<NewHighsLowsData>)
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch NH/NL' },
      } satisfies ApiResponse<null>, { status: 502 })
    }
  })
}
