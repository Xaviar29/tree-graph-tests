import { useQuery } from '@tanstack/react-query'

interface IndicatorPoint {
  date: string
  price: number
  ma200: number | null
  rsi: number | null
  macd: number | null
  macdSignal: number | null
  macdHistogram: number | null
}

export function useTechnicalIndicators() {
  return useQuery({
    queryKey: ['crypto', 'technical-indicators'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/technical-indicators')
      const json = await res.json()
      return json.data as IndicatorPoint[]
    },
    refetchInterval: 120_000,
  })
}
