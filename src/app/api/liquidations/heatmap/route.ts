import { NextRequest, NextResponse } from 'next/server'
import { liquidationBuffer } from '@/lib/providers/binance-ws'
import { getCachedOrFetch, withRateLimit } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'
import type { ApiResponse } from '@/types/api.types'

const PYTHON_WORKER = 'http://localhost:8001'

interface KDEResult { grid: number[][]; price_bins: number[]; notional_bins: number[] }

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    const symbol = request.nextUrl.searchParams.get('symbol') || 'BTCUSDT'
    try {
      const result = await getCachedOrFetch<KDEResult>(`liquidation:heatmap:${symbol}`, {},
        async () => {
          const liqs = liquidationBuffer.getRecent(symbol, 200)
          if (liqs.length < 5) throw new Error('Not enough liquidation data')
          const prices = liqs.map((l) => l.price)
          const minP = Math.min(...prices) * 0.98
          const maxP = Math.max(...prices) * 1.02

          const res = await fetch(`${PYTHON_WORKER}/heatmap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              liquidations: liqs.map((l) => ({ price: l.price, notional: l.notional })),
              grid_size: 50, price_min: minP, price_max: maxP,
            }),
          })
          if (!res.ok) throw new Error(`Python worker: ${res.status}`)
          return res.json()
        },
        CACHE_TTL.REALTIME,
      )
      return NextResponse.json({ success: true, data: result.data, meta: { cachedAt: result.cachedAt, source: result.source, ttlMs: CACHE_TTL.REALTIME } } satisfies ApiResponse<KDEResult>)
    } catch (error) {
      const liqs = liquidationBuffer.getRecent(symbol, 200)
      const fallback = computeFallbackHeatmap(liqs)
      return NextResponse.json({ success: true, data: fallback, meta: { cachedAt: new Date().toISOString(), source: 'fallback', ttlMs: 10000 } } satisfies ApiResponse<KDEResult>)
    }
  })
}

function computeFallbackHeatmap(liqs: { price: number; notional: number }[]): KDEResult {
  const gridSize = 50
  const prices = liqs.map((l) => l.price)
  const notionals = liqs.map((l) => l.notional)
  if (prices.length === 0) return { grid: [], price_bins: [], notional_bins: [] }
  const minP = Math.min(...prices) * 0.98, maxP = Math.max(...prices) * 1.02
  const minN = 0, maxN = Math.max(...notionals, 1)
  const stepP = (maxP - minP) / gridSize
  const stepN = (maxN - minN) / gridSize
  const grid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0))
  for (const l of liqs) {
    const xi = Math.min(gridSize - 1, Math.floor((l.price - minP) / stepP))
    const yi = Math.min(gridSize - 1, Math.floor((l.notional - minN) / stepN))
    grid[yi][xi] += l.notional
  }
  const maxV = Math.max(...grid.flat(), 1)
  const normalized = grid.map((row) => row.map((v) => v / maxV))
  const priceBins = Array.from({ length: gridSize }, (_, i) => minP + i * stepP)
  const notionalBins = Array.from({ length: gridSize }, (_, i) => minN + i * stepN)
  return { grid: normalized, price_bins: priceBins, notional_bins: notionalBins }
}
