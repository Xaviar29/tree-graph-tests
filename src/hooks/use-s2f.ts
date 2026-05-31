import { useQuery } from '@tanstack/react-query'

interface S2FPoint { date: string; price: number; s2f: number; halving?: boolean }

export function useS2F() {
  return useQuery({
    queryKey: ['crypto', 's2f'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/s2f')
      const json = await res.json()
      return (json.data ?? []) as S2FPoint[]
    },
    refetchInterval: 86_400_000,
  })
}
