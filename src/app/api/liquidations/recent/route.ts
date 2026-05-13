import { NextRequest, NextResponse } from 'next/server'
import { liquidationBuffer } from '@/lib/providers/binance-ws'
import { withRateLimit } from '@/lib/cache'
import type { ApiResponse } from '@/types/api.types'
import type { LiquidationEvent } from '@/lib/providers/binance-ws'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    liquidationBuffer.connect()
    const symbol = request.nextUrl.searchParams.get('symbol') || undefined
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)
    const data = liquidationBuffer.getRecent(symbol, limit)
    return NextResponse.json({ success: true, data, meta: { cachedAt: new Date().toISOString(), source: 'binance-ws', ttlMs: 5000 } } satisfies ApiResponse<LiquidationEvent[]>)
  })
}
