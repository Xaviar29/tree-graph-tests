'use client'

import { useQuery } from '@tanstack/react-query'
import type { LiquidationEvent } from '@/lib/providers/binance-ws'
import type { ApiResponse } from '@/types/api.types'

interface LiquidationSummary {
  longNotional: number; shortNotional: number; longCount: number; shortCount: number; total: number; maxLiquidation: number
}

interface HourlyData {
  hour: string; long: number; short: number; count: number
}

interface KDEResult { grid: number[][]; price_bins: number[]; notional_bins: number[] }

async function fetchRecent(symbol: string): Promise<LiquidationEvent[]> {
  const res = await fetch(`/api/liquidations/recent?symbol=${symbol}&limit=50`)
  const json: ApiResponse<LiquidationEvent[]> = await res.json()
  if (!json.success) throw new Error('Failed to fetch recent liquidations')
  return json.data ?? []
}

async function fetchSummary(symbol: string): Promise<LiquidationSummary | null> {
  const res = await fetch(`/api/liquidations/summary?symbol=${symbol}`)
  const json: ApiResponse<LiquidationSummary> = await res.json()
  if (!json.success) throw new Error('Failed to fetch liquidation summary')
  return json.data ?? null
}

async function fetchHourly(symbol: string): Promise<HourlyData[]> {
  const res = await fetch(`/api/liquidations/hourly?symbol=${symbol}`)
  const json: ApiResponse<HourlyData[]> = await res.json()
  if (!json.success) throw new Error('Failed to fetch hourly liquidation data')
  return json.data ?? []
}

async function fetchHeatmap(symbol: string): Promise<KDEResult | null> {
  const res = await fetch(`/api/liquidations/heatmap?symbol=${symbol}`)
  const json: ApiResponse<KDEResult> = await res.json()
  if (!json.success) throw new Error('Failed to fetch liquidation heatmap')
  return json.data ?? null
}

export function useLiquidationsRecent(symbol = 'BTCUSDT') {
  return useQuery({
    queryKey: ['liquidations', 'recent', symbol],
    queryFn: () => fetchRecent(symbol),
    refetchInterval: 5_000,
    staleTime: 3_000,
  })
}

export function useLiquidationsSummary(symbol = 'BTCUSDT') {
  return useQuery({
    queryKey: ['liquidations', 'summary', symbol],
    queryFn: () => fetchSummary(symbol),
    refetchInterval: 10_000,
    staleTime: 5_000,
  })
}

export function useLiquidationsHourly(symbol = 'BTCUSDT') {
  return useQuery({
    queryKey: ['liquidations', 'hourly', symbol],
    queryFn: () => fetchHourly(symbol),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}

export function useLiquidationHeatmap(symbol = 'BTCUSDT') {
  return useQuery({
    queryKey: ['liquidations', 'heatmap', symbol],
    queryFn: () => fetchHeatmap(symbol),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}
