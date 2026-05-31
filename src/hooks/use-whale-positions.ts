import { useQuery } from '@tanstack/react-query'

interface WhalePosition {
  id: string
  side: 'long' | 'short'
  entryPrice: number
  liquidationPrice: number
  size: number
  leverage: number
  exchange: string
  label?: string
}

export function useWhalePositions() {
  return useQuery({
    queryKey: ['crypto', 'whale-positions'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/whale-positions')
      const json = await res.json()
      return json.data as WhalePosition[]
    },
    refetchInterval: 30_000,
  })
}
