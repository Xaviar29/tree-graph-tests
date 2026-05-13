import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { calculateMcClellan, type DailyADData } from '@/lib/calculations/mcclellan'
import { CACHE_TTL } from '@/lib/constants'
import { getBreadthHistory } from '@/lib/supabase'
import type { McClellanData } from '@/types/breadth.types'
import type { ApiResponse } from '@/types/api.types'

export async function GET(_request: NextRequest) {
  return withRateLimit(_request, async () => {
    try {
      const result = await getCachedOrFetch<McClellanData>(
        'breadth:mcclellan',
        {},
        async () => {
          const history = await getBreadthHistory()

          if (history.length < 2) {
            return {
              oscillator: 0,
              summationIndex: 0,
              ema19: 0,
              ema39: 0,
              timestamp: new Date().toISOString(),
              note: 'insufficient_history' as any,
            }
          }

          const dailyData: DailyADData[] = history.map((h) => ({
            date: h.date,
            advancing: h.advancing,
            declining: h.declining,
          }))

          return calculateMcClellan(dailyData)
        },
        CACHE_TTL.BREADTH,
      )

      return NextResponse.json({
        success: true,
        data: result.data,
        meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.BREADTH },
      } satisfies ApiResponse<McClellanData>)
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch McClellan' },
      } satisfies ApiResponse<null>, { status: 502 })
    }
  })
}
