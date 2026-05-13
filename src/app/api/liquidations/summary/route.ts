import { NextRequest, NextResponse } from 'next/server'
import { liquidationBuffer } from '@/lib/providers/binance-ws'
import { withRateLimit } from '@/lib/cache'
import type { ApiResponse } from '@/types/api.types'

interface SummaryData {
  longNotional: number
  shortNotional: number
  longCount: number
  shortCount: number
  total: number
  maxLiquidation: number
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    liquidationBuffer.connect()
    const symbol = request.nextUrl.searchParams.get('symbol') || undefined
    const data = liquidationBuffer.getSummary(symbol)
    return NextResponse.json({ success: true, data, meta: { cachedAt: new Date().toISOString(), source: 'binance-ws', ttlMs: 5000 } } satisfies ApiResponse<SummaryData>)
  })
}
