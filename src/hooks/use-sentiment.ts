'use client'

import { useQuery } from '@tanstack/react-query'
import type { FearGreedData, PutCallData, VixData } from '@/types/sentiment.types'
import type { ApiResponse } from '@/types/api.types'

async function fetchFearGreed(): Promise<FearGreedData> {
  const res = await fetch('/api/sentiment/fear-greed')
  const json: ApiResponse<FearGreedData> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch Fear & Greed')
  return json.data
}

async function fetchVIX(): Promise<VixData> {
  const res = await fetch('/api/sentiment/vix')
  const json: ApiResponse<VixData> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch VIX')
  return json.data
}

async function fetchPutCall(): Promise<PutCallData> {
  const res = await fetch('/api/sentiment/put-call')
  const json: ApiResponse<PutCallData> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch Put/Call')
  return json.data
}

export function useSentiment() {
  const fearGreed = useQuery({
    queryKey: ['sentiment', 'fear-greed'],
    queryFn: fetchFearGreed,
    refetchInterval: 3_600_000,
    staleTime: 600_000,
  })

  const vix = useQuery({
    queryKey: ['sentiment', 'vix'],
    queryFn: fetchVIX,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const putCall = useQuery({
    queryKey: ['sentiment', 'put-call'],
    queryFn: fetchPutCall,
    refetchInterval: 300_000,
    staleTime: 60_000,
  })

  return {
    fearGreed,
    vix,
    putCall,
    isLoading: fearGreed.isLoading || vix.isLoading || putCall.isLoading,
  }
}
