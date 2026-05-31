import { NextResponse } from 'next/server'

interface SimpleMapLevel { price: number; density: number; side: 'long' | 'short' }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const _symbol = searchParams.get('symbol') || 'BTCUSDT'

  const levels: SimpleMapLevel[] = []
  const basePrice = _symbol === 'BTCUSDT' ? 65000 : _symbol === 'ETHUSDT' ? 3500 : 150
  for (let i = 20; i >= -20; i--) {
    const price = basePrice * (1 + i * 0.005)
    levels.push({
      price: Math.round(price),
      density: Math.round(Math.random() * 5000000 + 100000),
      side: Math.random() > 0.5 ? 'long' : 'short',
    })
  }
  return NextResponse.json({ success: true, data: levels, meta: { source: 'synthetic' } })
}
