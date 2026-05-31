import { useQuery } from '@tanstack/react-query'

export interface SupplierPoint {
  date: string
  hashPrice: number
  totalCost: number
  electricityCost: number
  hardwareCost: number
  btcPrice: number
  profitPercent: number
  isProfit: boolean
}

export function useSupplier() {
  return useQuery({
    queryKey: ['crypto', 'supplier'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/supplier')
      const json = await res.json()
      return (json.data ?? []) as SupplierPoint[]
    },
    refetchInterval: 86_400_000,
  })
}
