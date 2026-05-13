import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { getFearGreedFromCNN } from '@/lib/providers/cnn-fear-greed'
import { CACHE_TTL } from '@/lib/constants'
import type { FearGreedData } from '@/types/sentiment.types'
import type { ApiResponse } from '@/types/api.types'

export async function GET(_request: NextRequest) {
  return withRateLimit(_request, async () => {
    try {
      const result = await getCachedOrFetch<FearGreedData>(
        'sentiment:fear-greed',
        {},
        async () => {
          const fg = await getFearGreedFromCNN()
          return {
            value: fg.value,
            label: fg.label as FearGreedData['label'],
            previousClose: fg.previousClose,
            weekAgo: fg.weekAgo,
            monthAgo: fg.monthAgo,
            timestamp: new Date().toISOString(),
          }
        },
        CACHE_TTL.SENTIMENT,
      )

      const response: ApiResponse<FearGreedData> = {
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
        error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch Fear & Greed' },
      }
      return NextResponse.json(response, { status: 502 })
    }
  })
}
