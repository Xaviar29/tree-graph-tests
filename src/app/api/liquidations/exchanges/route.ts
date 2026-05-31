import { NextResponse } from 'next/server'
import { getExchangeStatus } from '@/lib/providers/liquidations'
import type { ApiResponse } from '@/types/api.types'

export async function GET() {
  return NextResponse.json({ success: true, data: getExchangeStatus(), meta: { cachedAt: new Date().toISOString(), source: 'multi-exchange-ws', ttlMs: 5000 } } satisfies ApiResponse<ReturnType<typeof getExchangeStatus>>)
}
