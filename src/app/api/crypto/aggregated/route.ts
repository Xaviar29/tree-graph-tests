import { NextResponse } from 'next/server'
import { createRng, dailySeed } from '@/lib/random'

interface AggregatedPoint { date: string; value: number }

interface AggregatedData {
  aggregatedVolume: AggregatedPoint[]
  coinbaseVolume: AggregatedPoint[]
  hyperliquidVolume: AggregatedPoint[]
  openInterest: AggregatedPoint[]
  liquidations: AggregatedPoint[]
  oiInBitcoin: AggregatedPoint[]
  currentVolume: number
  currentOI: number
  currentLiqs: number
}

function generateTimeSeries(rng: ReturnType<typeof createRng>, days: number, base: number, vol: number): AggregatedPoint[] {
  const now = new Date()
  let val = base
  const result: AggregatedPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    val = Math.max(base * 0.3, val + (rng.next() - 0.5) * vol)
    result.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(val),
    })
  }
  return result
}

export async function GET() {
  const rng = createRng(dailySeed('aggregated'))

  return NextResponse.json({
    success: true,
    data: {
      aggregatedVolume: generateTimeSeries(rng, 90, 35e9, 5e9),
      coinbaseVolume: generateTimeSeries(rng, 90, 2.5e9, 0.5e9),
      hyperliquidVolume: generateTimeSeries(rng, 90, 1.2e9, 0.3e9),
      openInterest: generateTimeSeries(rng, 90, 40e9, 5e9),
      liquidations: generateTimeSeries(rng, 90, 300e6, 100e6),
      oiInBitcoin: generateTimeSeries(rng, 90, 550000, 50000),
      currentVolume: Math.round(52.3e9),
      currentOI: Math.round(42.1e9),
      currentLiqs: Math.round(385e6),
    },
    meta: { source: 'synthetic-aggregated' },
  })
}
