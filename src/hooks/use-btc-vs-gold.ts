import { useQuery } from '@tanstack/react-query'

interface ComparisonPoint { date: string; btc: number; gold: number; btcSupply: number; goldSupply: number }

export function useBTCvsGold() {
  return useQuery({
    queryKey: ['crypto', 'btc-vs-gold'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/btc-vs-gold')
      const json = await res.json()
      return (json.data ?? []) as ComparisonPoint[]
    },
    refetchInterval: 86_400_000,
  })
}
