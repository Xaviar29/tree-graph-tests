import { useQuery } from '@tanstack/react-query'

interface ETFPoint { date: string; totalBTC: number; inflow: number; btcPrice: number; etfs: { name: string; btc: number; avgPrice: number }[] }

export function useBTCETFs() {
  return useQuery({
    queryKey: ['crypto', 'etfs'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/etfs')
      const json = await res.json()
      return (json.data ?? []) as ETFPoint[]
    },
    refetchInterval: 86_400_000,
  })
}
