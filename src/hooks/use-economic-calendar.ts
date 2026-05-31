import { useQuery } from '@tanstack/react-query'

interface EconomicEvent {
  date: string
  label: string
  impact: 'positive' | 'negative' | 'neutral'
  forecast: string
  previous: string
  actual?: string
  value?: number
  prevValue?: number
}

export function useEconomicCalendar() {
  return useQuery({
    queryKey: ['crypto', 'economic-calendar'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/economic-calendar')
      const json = await res.json()
      return json.data as EconomicEvent[]
    },
    refetchInterval: 3600_000,
  })
}
