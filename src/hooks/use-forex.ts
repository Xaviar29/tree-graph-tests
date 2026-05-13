import { useQuery } from '@tanstack/react-query'
import { Quote } from '@/types/market.types'
import { ApiResponse } from '@/types/api.types'

export function useForex() {
  return useQuery({
    queryKey: ['forex'],
    queryFn: async () => {
      const res = await fetch('/api/forex')
      if (!res.ok) throw new Error('Failed to fetch forex')
      const json: ApiResponse<Quote[]> = await res.json()
      return json.data
    },
    refetchInterval: 60_000,
  })
}
