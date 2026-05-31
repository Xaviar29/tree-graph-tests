import { useQuery } from '@tanstack/react-query'

interface DailyConviction {
  date: string
  price: number
  volume: number
  conviction: number
  avgVolume20d: number
  buySellRatio: number
}

export function useVolumeConviction() {
  return useQuery({
    queryKey: ['crypto', 'volume-conviction'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/volume-conviction')
      const json = await res.json()
      return json.data as DailyConviction[]
    },
    refetchInterval: 120_000,
  })
}
