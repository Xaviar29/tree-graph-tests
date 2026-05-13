import { useQuery } from '@tanstack/react-query'
import { SectorPerformance, SectorRRG } from '@/types/sectors.types'
import { ApiResponse } from '@/types/api.types'

export function useSectorsPerformance() {
  return useQuery({
    queryKey: ['sectors-performance'],
    queryFn: async () => {
      const res = await fetch('/api/sectors/performance')
      if (!res.ok) throw new Error('Failed to fetch sectors performance')
      const json: ApiResponse<SectorPerformance[]> = await res.json()
      return json.data
    },
    refetchInterval: 60_000, // 1 minute
  })
}

export function useSectorsRRG() {
  return useQuery({
    queryKey: ['sectors-rrg'],
    queryFn: async () => {
      const res = await fetch('/api/sectors/rrg')
      if (!res.ok) throw new Error('Failed to fetch sectors RRG')
      const json: ApiResponse<SectorRRG[]> = await res.json()
      return json.data
    },
    refetchInterval: 300_000, // 5 minutes (historical data changes less often)
  })
}
