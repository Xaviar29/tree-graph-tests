import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { getPutCallRatio } from '@/lib/providers/cboe'
import { CACHE_TTL } from '@/lib/constants'
import type { PutCallData } from '@/types/sentiment.types'
import type { ApiResponse } from '@/types/api.types'

export async function GET(_request: NextRequest) {
  return withRateLimit(_request, async () => {
    try {
      const result = await getCachedOrFetch<PutCallData>(
        'sentiment:put-call',
        {},
        async () => {
          const pc = await getPutCallRatio()
          return {
            ratio: pc.ratio,
            totalPutVolume: pc.totalPutVolume,
            totalCallVolume: pc.totalCallVolume,
            timestamp: new Date().toISOString(),
          }
        },
        CACHE_TTL.SENTIMENT,
      )

      const response: ApiResponse<PutCallData> = {
        success: true,
        data: result.data,
        meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.SENTIMENT },
      }
      return NextResponse.json(response)
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch Put/Call' },
      }
      return NextResponse.json(response, { status: 502 })
    }
  })
}
