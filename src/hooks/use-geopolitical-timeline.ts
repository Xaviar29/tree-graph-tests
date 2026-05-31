import { useQuery } from '@tanstack/react-query'

interface GeoEvent {
  date: string
  title: string
  description: string
  impact: 'positive' | 'negative' | 'mixed'
  btcPrice?: number
  url?: string
  tone?: number
  source?: string
}

interface PricePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
}

interface GeopoliticalData {
  events: GeoEvent[]
  priceData: PricePoint[]
}

export function useGeopoliticalTimeline() {
  return useQuery({
    queryKey: ['crypto', 'geopolitical-timeline'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/geopolitical-timeline')
      const json = await res.json()
      return json.data as GeopoliticalData
    },
    refetchInterval: 900_000,
  })
}
