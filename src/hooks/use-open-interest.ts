import { useQuery } from '@tanstack/react-query'

interface OIDataPoint {
  date: string
  openInterest: number
  oiLong?: number
  oiShort?: number
}

export function useOpenInterest(symbol = 'BTCUSDT') {
  return useQuery({
    queryKey: ['crypto', 'open-interest', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/crypto/open-interest?symbol=${symbol}`)
      const json = await res.json()
      return json.data as OIDataPoint[]
    },
    refetchInterval: 60_000,
  })
}
