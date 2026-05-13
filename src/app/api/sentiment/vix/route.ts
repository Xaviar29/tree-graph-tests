import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { getVIX } from '@/lib/providers/vix'
import { CACHE_TTL } from '@/lib/constants'
import type { VixData } from '@/types/sentiment.types'
import type { ApiResponse } from '@/types/api.types'

export async function GET(_request: NextRequest) {
  return withRateLimit(_request, async () => {
    try {
      const result = await getCachedOrFetch<VixData>(
        'sentiment:vix',
        {},
        async () => {
          const vix = await getVIX()
          return {
            value: vix.value,
            change: vix.change,
            changePercent: vix.changePercent,
            timestamp: new Date().toISOString(),
          }
        },
        CACHE_TTL.REALTIME,
      )

      const response: ApiResponse<VixData> = {
        success: true,
        data: result.data,
        meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.REALTIME },
      }
      return NextResponse.json(response)
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch VIX' },
      }
      return NextResponse.json(response, { status: 502 })
    }
  })
}
