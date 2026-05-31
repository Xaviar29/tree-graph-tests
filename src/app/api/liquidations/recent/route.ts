import { NextRequest, NextResponse } from 'next/server'
import { connectAllExchanges, getRecentByExchange } from '@/lib/providers/liquidations'
import { withRateLimit } from '@/lib/cache'
import type { ApiResponse } from '@/types/api.types'
import type { LiquidationEvent } from '@/lib/providers/binance-ws'
import type { ExchangeType } from '@/lib/providers/liquidations'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    connectAllExchanges()
    const symbol = request.nextUrl.searchParams.get('symbol') || undefined
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)
    const exchange = (request.nextUrl.searchParams.get('exchange') || 'all') as ExchangeType
    const data = getRecentByExchange(exchange, symbol, limit)
    return NextResponse.json({ success: true, data, meta: { cachedAt: new Date().toISOString(), source: `${exchange}-ws`, ttlMs: 5000 } } satisfies ApiResponse<LiquidationEvent[]>)
  })
}
