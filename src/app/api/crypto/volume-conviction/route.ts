import { NextResponse } from 'next/server'
import { getCryptoBars } from '@/lib/providers/alpaca-markets'

const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=100'

interface DailyConviction {
  date: string
  price: number
  volume: number
  conviction: number
  avgVolume20d: number
  buySellRatio: number
}

function alpacaBarsToConviction(bars: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[]): DailyConviction[] {
  return bars.map((b, i) => {
    const date = new Date(b.timestamp * 1000)
    const close = b.close
    const volume = b.volume * close
    const open = b.open
    const high = b.high
    const low = b.low

    const range = high - low
    const buyPressure = range > 0 ? (close - low) / range : 0.5
    const buySellRatio = Math.min(buyPressure / Math.max(1 - buyPressure, 0.01), 5)

    const lookback = bars.slice(Math.max(0, i - 20), i)
    const avgVolume20d = lookback.length > 0
      ? lookback.reduce((s, k2) => s + k2.volume * k2.close, 0) / lookback.length
      : volume

    const volRatio = avgVolume20d > 0 ? volume / avgVolume20d : 1
    const avgRange = lookback.length > 0
      ? lookback.reduce((s, k2) => s + (k2.high - k2.low), 0) / lookback.length
      : range
    const volaRatio = avgRange > 0 ? Math.min(range / avgRange, 2) : 1

    const rawConviction = Math.min(100, Math.max(0,
      (volRatio * 40) + (Math.min(buySellRatio, 2) / 2 * 30) + ((1 - volaRatio / 2) * 30)
    ))

    return {
      date: date.toISOString().slice(0, 10),
      price: Math.round(close),
      volume: Math.round(volume),
      conviction: Math.round(rawConviction),
      avgVolume20d: Math.round(avgVolume20d),
      buySellRatio: Math.round(buySellRatio * 1000) / 1000,
    }
  })
}

function binanceKlinesToConviction(klines: any[][]): DailyConviction[] {
  return klines.map((k, i) => {
    const date = new Date(k[0])
    const close = parseFloat(k[4])
    const volume = k[5] ? parseFloat(k[5]) * close : 0
    const open = parseFloat(k[1])
    const high = parseFloat(k[2])
    const low = parseFloat(k[3])

    const takerBuy = k[9] ? parseFloat(k[9]) * close : volume * 0.5
    const buySellRatio = volume > 0 ? takerBuy / (volume - takerBuy || 1) : 1

    const lookback = klines.slice(Math.max(0, i - 20), i)
    const avgVolume20d = lookback.length > 0
      ? lookback.reduce((s, k2) => s + parseFloat(k2[5]) * parseFloat(k2[4]), 0) / lookback.length
      : volume

    const volRatio = avgVolume20d > 0 ? volume / avgVolume20d : 1
    const range = high - low
    const avgRange = lookback.length > 0
      ? lookback.reduce((s, k2) => s + (parseFloat(k2[2]) - parseFloat(k2[3])), 0) / lookback.length
      : range
    const volaRatio = avgRange > 0 ? Math.min(range / avgRange, 2) : 1

    const rawConviction = Math.min(100, Math.max(0,
      (volRatio * 40) + (Math.min(buySellRatio, 2) / 2 * 30) + ((1 - volaRatio / 2) * 30)
    ))

    return {
      date: date.toISOString().slice(0, 10),
      price: Math.round(close),
      volume: Math.round(volume),
      conviction: Math.round(rawConviction),
      avgVolume20d: Math.round(avgVolume20d),
      buySellRatio: Math.round(buySellRatio * 1000) / 1000,
    }
  })
}

export async function GET() {
  try {
    const alpacaBars = await getCryptoBars('BTCUSD', '1Day', 100)
    if (alpacaBars.length >= 30) {
      const data = alpacaBarsToConviction(alpacaBars)
      return NextResponse.json({
        success: true,
        data,
        meta: { source: 'alpaca-crypto-bars', symbol: 'BTCUSD', interval: '1d' },
      })
    }

    const res = await fetch(BINANCE_KLINES, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('Binance API error')
    const klines: any[][] = await res.json()

    const data = binanceKlinesToConviction(klines)

    return NextResponse.json({
      success: true,
      data,
      meta: { source: 'binance-klines', symbol: 'BTCUSDT', interval: '1d' },
    })
  } catch {
    const data: DailyConviction[] = []
    const now = Date.now()
    for (let i = 99; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      const basePrice = 75000 + Math.sin(i * 0.3) * 10000 + Math.cos(i * 0.1) * 5000
      const volume = 20000000000 + Math.sin(i * 0.5) * 15000000000 + Math.random() * 5000000000
      const avgVol = 25000000000 + Math.sin(i * 0.2) * 5000000000
      const ratio = 0.8 + Math.random() * 0.6
      const volRatio = volume / avgVol
      const rawConviction = Math.min(100, Math.max(0,
        (volRatio * 40) + (ratio / 2 * 30) + 20 + Math.random() * 10
      ))

      data.push({
        date: d.toISOString().slice(0, 10),
        price: Math.round(basePrice),
        volume: Math.round(volume),
        conviction: Math.round(rawConviction),
        avgVolume20d: Math.round(avgVol),
        buySellRatio: Math.round(ratio * 1000) / 1000,
      })
    }
    return NextResponse.json({
      success: true,
      data,
      meta: { source: 'synthetic-fallback', symbol: 'BTCUSDT' },
    })
  }
}
