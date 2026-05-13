'use client'

import { useQuery } from '@tanstack/react-query'
import type { BreadthData, McClellanData } from '@/types/breadth.types'
import type { ApiResponse } from '@/types/api.types'

async function fetchBreadthAD(): Promise<BreadthData> {
  const res = await fetch('/api/breadth/advance-decline')
  const json: ApiResponse<BreadthData> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch breadth')
  return json.data
}

async function fetchMcClellan(): Promise<McClellanData> {
  const res = await fetch('/api/breadth/mcclellan')
  const json: ApiResponse<McClellanData> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch McClellan')
  return json.data
}

async function fetchPercentAboveMA(period: number): Promise<{ percentAbove: number; period: number }> {
  const res = await fetch(`/api/breadth/above-ma?period=${period}`)
  const json: ApiResponse<{ percentAbove: number; period: number }> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch above MA')
  return json.data
}

async function fetchNewHighsLows(): Promise<{ newHighs: number; newLows: number; nhRatio: number }> {
  const res = await fetch('/api/breadth/new-highs-lows')
  const json: ApiResponse<{ newHighs: number; newLows: number; nhRatio: number }> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message || 'Failed to fetch NH/NL')
  return json.data
}

export function useBreadth() {
  const ad = useQuery({
    queryKey: ['breadth', 'advance-decline'],
    queryFn: fetchBreadthAD,
    refetchInterval: 300_000,
    staleTime: 60_000,
  })

  const mcClellan = useQuery({
    queryKey: ['breadth', 'mcclellan'],
    queryFn: fetchMcClellan,
    refetchInterval: 300_000,
    staleTime: 60_000,
  })

  const aboveMa50 = useQuery({
    queryKey: ['breadth', 'above-ma', 50],
    queryFn: () => fetchPercentAboveMA(50),
    refetchInterval: 300_000,
    staleTime: 60_000,
  })

  const aboveMa200 = useQuery({
    queryKey: ['breadth', 'above-ma', 200],
    queryFn: () => fetchPercentAboveMA(200),
    refetchInterval: 300_000,
    staleTime: 60_000,
  })

  const nhNl = useQuery({
    queryKey: ['breadth', 'new-highs-lows'],
    queryFn: fetchNewHighsLows,
    refetchInterval: 300_000,
    staleTime: 60_000,
  })

  return {
    advanceDecline: ad,
    mcclellan: mcClellan,
    aboveMa50,
    aboveMa200,
    newHighsLows: nhNl,
    isLoading: ad.isLoading || mcClellan.isLoading,
    isError: ad.isError || mcClellan.isError,
  }
}
