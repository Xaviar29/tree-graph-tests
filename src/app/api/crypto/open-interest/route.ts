import { NextResponse } from 'next/server'

const BYBIT_OI = 'https://api.bybit.com/v5/market/open-interest'

interface OIDataPoint {
  date: string
  openInterest: number
  oiLong?: number
  oiShort?: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase()

  try {
    const res = await fetch(
      `${BYBIT_OI}?category=linear&symbol=${symbol}&intervalTime=1d&limit=30`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) throw new Error('Bybit API error')
    const json = await res.json()

    const data: OIDataPoint[] = (json.result?.list ?? []).map((item: any) => ({
      date: item.timestamp
        ? new Date(parseInt(item.timestamp)).toISOString().slice(0, 10)
        : '',
      openInterest: parseFloat(item.openInterest || '0'),
    })).filter((d: OIDataPoint) => d.date).reverse()

    if (data.length === 0) throw new Error('No OI data')

    return NextResponse.json({
      success: true,
      data,
      meta: { source: 'bybit', symbol },
    })
  } catch {
    // Synthetic fallback
    const data: OIDataPoint[] = []
    const now = Date.now()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      const base = 3e9 + Math.sin(i * 0.3) * 1.5e9 + Math.cos(i * 0.1) * 0.5e9
      data.push({
        date: d.toISOString().slice(0, 10),
        openInterest: Math.round(base + Math.random() * 0.2e9),
        oiLong: Math.round((base + Math.random() * 0.2e9) * (0.45 + Math.random() * 0.1)),
        oiShort: Math.round((base + Math.random() * 0.2e9) * (0.35 + Math.random() * 0.1)),
      })
    }
    return NextResponse.json({
      success: true,
      data,
      meta: { source: 'synthetic-fallback', symbol },
    })
  }
}
