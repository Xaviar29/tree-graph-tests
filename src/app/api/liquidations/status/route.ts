import { NextRequest, NextResponse } from 'next/server'
import { connectAllExchanges, getExchangeStatus } from '@/lib/providers/liquidations'
import { withRateLimit } from '@/lib/cache'
import type { ApiResponse } from '@/types/api.types'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    connectAllExchanges()
    const data = getExchangeStatus()
    return NextResponse.json({
      success: true,
      data,
      meta: { cachedAt: new Date().toISOString(), source: 'ws-status', ttlMs: 5000 },
    } satisfies ApiResponse<typeof data>)
  })
}
