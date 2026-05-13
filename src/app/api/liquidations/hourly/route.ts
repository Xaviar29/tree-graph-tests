import { NextRequest, NextResponse } from 'next/server'
import { liquidationBuffer } from '@/lib/providers/binance-ws'
import { withRateLimit } from '@/lib/cache'
import type { ApiResponse } from '@/types/api.types'

interface HourlyData {
  hour: string
  long: number
  short: number
  count: number
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    liquidationBuffer.connect()
    const symbol = request.nextUrl.searchParams.get('symbol') || undefined
    const data = liquidationBuffer.getHourly(symbol)
    return NextResponse.json({ success: true, data, meta: { cachedAt: new Date().toISOString(), source: 'binance-ws', ttlMs: 5000 } } satisfies ApiResponse<HourlyData[]>)
  })
}
