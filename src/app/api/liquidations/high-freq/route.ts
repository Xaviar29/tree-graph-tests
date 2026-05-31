import { NextResponse } from 'next/server'

interface HFCandle { time: number; open: number; high: number; low: number; close: number; volume: number }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const _symbol = searchParams.get('symbol') || 'BTCUSDT'
  const candles: HFCandle[] = []
  const now = Math.floor(Date.now() / 1000)
  const basePrice = _symbol === 'BTCUSDT' ? 65000 : _symbol === 'ETHUSDT' ? 3500 : 150
  let price = basePrice
  for (let i = 240; i >= 0; i--) {
    const time = now - i * 60
    const volatility = price * 0.002
    const open = price
    const close = price * (1 + (Math.random() - 0.5) * 0.004)
    const high = Math.max(open, close) * (1 + Math.random() * 0.002)
    const low = Math.min(open, close) * (1 - Math.random() * 0.002)
    price = close
    candles.push({
      time,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume: Math.round(Math.random() * 500 + 50),
    })
  }
  return NextResponse.json({ success: true, data: candles, meta: { source: 'synthetic' } })
}
