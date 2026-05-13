'use client'

import { useQuery } from '@tanstack/react-query'
import type { CryptoMarket, CryptoGlobal, CryptoHistorical } from '@/types/crypto.types'
import type { ApiResponse } from '@/types/api.types'

async function fetchCryptoMarkets(limit = 50): Promise<CryptoMarket[]> {
  const res = await fetch(`/api/crypto?type=markets&limit=${limit}`)
  const json: ApiResponse<CryptoMarket[]> = await res.json()
  if (!json.success) throw new Error('Failed to fetch crypto markets')
  return json.data ?? []
}

async function fetchCryptoGlobal(): Promise<CryptoGlobal | null> {
  const res = await fetch('/api/crypto?type=global')
  const json: ApiResponse<CryptoGlobal> = await res.json()
  if (!json.success) throw new Error('Failed to fetch crypto global')
  return json.data ?? null
}

async function fetchCryptoHistorical(id: string, days: number): Promise<CryptoHistorical[]> {
  const res = await fetch(`/api/crypto?type=historical&id=${id}&days=${days}`)
  const json: ApiResponse<CryptoHistorical[]> = await res.json()
  if (!json.success) throw new Error('Failed to fetch crypto historical')
  return json.data ?? []
}

export function useCryptoMarkets(limit = 50) {
  return useQuery({
    queryKey: ['crypto', 'markets', limit],
    queryFn: () => fetchCryptoMarkets(limit),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function useCryptoGlobal() {
  return useQuery({
    queryKey: ['crypto', 'global'],
    queryFn: fetchCryptoGlobal,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function useCryptoHistorical(id: string, days = 7) {
  return useQuery({
    queryKey: ['crypto', 'historical', id, days],
    queryFn: () => fetchCryptoHistorical(id, days),
    refetchInterval: 300_000,
    staleTime: 120_000,
    enabled: !!id,
  })
}
