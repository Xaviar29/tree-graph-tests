import { NextRequest, NextResponse } from 'next/server'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { calculateAdvanceDecline } from '@/lib/calculations/breadth'
import { CACHE_TTL } from '@/lib/constants'
import { getBreadthHistory, upsertBreadthHistory } from '@/lib/supabase'
import type { BreadthData } from '@/types/breadth.types'
import type { ApiResponse } from '@/types/api.types'

function computeAdLine(history: { net_advances: number }[]): number {
  return history.reduce((sum, h) => sum + h.net_advances, 0)
}

export async function GET(_request: NextRequest) {
  return withRateLimit(_request, async () => {
    try {
      const result = await getCachedOrFetch<BreadthData>(
        'breadth:advance-decline',
        {},
        async () => {
          const { advancing, declining, unchanged, adRatio } = await calculateAdvanceDecline()
          const today = new Date().toISOString().slice(0, 10)
          const netAdvances = advancing - declining

          await upsertBreadthHistory({ date: today, advancing, declining, net_advances: netAdvances })
          const history = await getBreadthHistory()
          const advanceDeclineLine = computeAdLine(history)

          return {
            totalAdvancing: advancing,
            totalDeclining: declining,
            totalUnchanged: unchanged,
            adRatio,
            advanceDeclineLine,
            percentAboveSma50: 0,
            percentAboveSma200: 0,
            newHighs: 0,
            newLows: 0,
            timestamp: new Date().toISOString(),
          }
        },
        CACHE_TTL.BREADTH,
      )

      return NextResponse.json({
        success: true,
        data: result.data,
        meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.BREADTH },
      } satisfies ApiResponse<BreadthData>)
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: null,
        meta: { cachedAt: new Date().toISOString(), source: '', ttlMs: 0 },
        error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch breadth' },
      } satisfies ApiResponse<null>, { status: 502 })
    }
  })
}
