import { useQuery } from '@tanstack/react-query'

export interface HolderCategory { name: string; btc: number; percentage: number; color: string }
export interface PublicCompany { name: string; ticker: string; btc: number; valueUsd: number; percentageOfSupply: number }
export interface PrivateCompany { name: string; btc: number; estValueUsd: number }
export interface Country { name: string; btc: number; valueUsd: number; source: string }
export interface HoldersData {
  categories: HolderCategory[]
  publicCompanies: PublicCompany[]
  privateCompanies: PrivateCompany[]
  countries: Country[]
  totalBtc: number
}

export function useBTCHolders() {
  return useQuery({
    queryKey: ['crypto', 'holders'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/holders')
      const json = await res.json()
      return (json.data ?? {}) as HoldersData
    },
    refetchInterval: 86_400_000,
  })
}
