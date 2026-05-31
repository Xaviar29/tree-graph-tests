import { useQuery } from '@tanstack/react-query'

interface LiquidityBin {
  price: number
  volume: number
  side: 'bid' | 'ask'
}

interface LiquidityDepthData {
  bids: LiquidityBin[]
  asks: LiquidityBin[]
  currentPrice: number
}

export function useLiquidityDepth() {
  return useQuery({
    queryKey: ['crypto', 'liquidity-depth'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/liquidity-depth')
      const json = await res.json()
      return json.data as LiquidityDepthData
    },
    refetchInterval: 15_000,
  })
}
