import { useQuery } from '@tanstack/react-query'

export interface AggregatedPoint { date: string; value: number }
export interface AggregatedData {
  aggregatedVolume: AggregatedPoint[]
  coinbaseVolume: AggregatedPoint[]
  hyperliquidVolume: AggregatedPoint[]
  openInterest: AggregatedPoint[]
  liquidations: AggregatedPoint[]
  oiInBitcoin: AggregatedPoint[]
  currentVolume: number
  currentOI: number
  currentLiqs: number
}

export function useAggregated() {
  return useQuery({
    queryKey: ['crypto', 'aggregated'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/aggregated')
      const json = await res.json()
      return (json.data ?? {}) as AggregatedData
    },
    refetchInterval: 86_400_000,
  })
}
