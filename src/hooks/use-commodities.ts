import { useQuery } from '@tanstack/react-query'
import { Quote } from '@/types/market.types'
import { ApiResponse } from '@/types/api.types'

export function useCommodities() {
  return useQuery({
    queryKey: ['commodities'],
    queryFn: async () => {
      const res = await fetch('/api/commodities')
      if (!res.ok) throw new Error('Failed to fetch commodities')
      const json: ApiResponse<Quote[]> = await res.json()
      return json.data
    },
    refetchInterval: 60_000,
  })
}
