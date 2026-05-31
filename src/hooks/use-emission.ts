import { useQuery } from '@tanstack/react-query'

interface EmissionPoint { date: string; totalSupply: number; annualInflation: number; blockReward: number; halving?: boolean }

export function useEmission() {
  return useQuery({
    queryKey: ['crypto', 'emission'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/emission')
      const json = await res.json()
      return (json.data ?? []) as EmissionPoint[]
    },
    refetchInterval: 86_400_000,
  })
}
