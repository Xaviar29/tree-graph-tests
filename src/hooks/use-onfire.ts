import { useQuery } from '@tanstack/react-query'

interface OnFireAsset {
  symbol: string; name: string; category: string; score: number;
  priceChange24h: number; volume24h: number; volatility: number
}

export function useOnFire(category: string = 'all') {
  return useQuery({
    queryKey: ['onfire', category],
    queryFn: async () => {
      const res = await fetch(`/api/onfire?category=${category}`)
      const json = await res.json()
      return (json.data ?? []) as OnFireAsset[]
    },
    refetchInterval: 300_000,
  })
}
