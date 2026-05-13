'use client'

import { useQuery } from '@tanstack/react-query'
import type { OHLCV } from '@/types/market.types'
import type { ApiResponse } from '@/types/api.types'

async function fetchHistorical(symbol: string, range: string, interval: string): Promise<OHLCV[]> {
  const res = await fetch(`/api/market/historical?symbol=${symbol}&range=${range}&interval=${interval}`)
  const json: ApiResponse<OHLCV[]> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch historical')
  return json.data
}

export function useMarketHistorical(symbol: string, range: string = '1y', interval: string = '1d') {
  return useQuery({
    queryKey: ['market-historical', symbol, range, interval],
    queryFn: () => fetchHistorical(symbol, range, interval),
    refetchInterval: 300_000,
    staleTime: 60_000,
    enabled: !!symbol,
  })
}
