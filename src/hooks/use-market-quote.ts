'use client'

import { useQuery } from '@tanstack/react-query'
import type { Quote } from '@/types/market.types'
import type { ApiResponse } from '@/types/api.types'

async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const res = await fetch(`/api/market/quote?symbols=${symbols.join(',')}`)
  const json: ApiResponse<Quote[]> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch quotes')
  return json.data
}

export function useMarketQuote(symbols: string[]) {
  return useQuery({
    queryKey: ['market-quote', symbols.join(',')],
    queryFn: () => fetchQuotes(symbols),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: symbols.length > 0,
  })
}
