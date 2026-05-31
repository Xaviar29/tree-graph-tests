import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'
  const price = symbol === 'BTC' ? 65000 : symbol === 'ETH' ? 3500 : 150
  const gridSize = 50
  const minP = price * 0.94, maxP = price * 1.06
  const priceBins = Array.from({ length: gridSize }, (_, i) => Math.round((minP + i * (maxP - minP) / gridSize) * 100) / 100)
  const notionalBins = Array.from({ length: gridSize }, (_, i) => Math.round(i * 200000 / gridSize))
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.random() * 0.8)
  )
  return NextResponse.json({
    success: true,
    data: { grid, price_bins: priceBins, notional_bins: notionalBins },
    meta: { source: 'synthetic-hyperliquid' },
  })
}
