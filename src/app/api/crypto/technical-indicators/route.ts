import { NextResponse } from 'next/server'
import { getCryptoBars } from '@/lib/providers/alpaca-markets'

const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=200'

interface IndicatorPoint {
  date: string
  price: number
  ma200: number | null
  rsi: number | null
  macd: number | null
  macdSignal: number | null
  macdHistogram: number | null
}

function calcRSI(prices: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = []
  for (let i = 0; i < prices.length; i++) {
    if (i < period) { rsi.push(null); continue }
    let gains = 0, losses = 0
    for (let j = i - period; j < i; j++) {
      const diff = prices[j + 1] - prices[j]
      if (diff >= 0) gains += diff
      else losses -= diff
    }
    const avgGain = gains / period
    const avgLoss = losses / period
    if (avgLoss === 0) { rsi.push(100); continue }
    const rs = avgGain / avgLoss
    rsi.push(Math.round(100 - 100 / (1 + rs)))
  }
  return rsi
}

function calcEMA(prices: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = []
  const multiplier = 2 / (period + 1)
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) { ema.push(null); continue }
    if (i === period - 1) {
      ema.push(prices.slice(0, period).reduce((s, p) => s + p, 0) / period)
    } else {
      ema.push((prices[i] - ema[i - 1]!) * multiplier + ema[i - 1]!)
    }
  }
  return ema
}

function buildIndicators(closes: number[], dates: string[]): IndicatorPoint[] {
  const ma200 = calcEMA(closes, 200)
  const rsi = calcRSI(closes, 14)
  const macdLine = calcEMA(closes, 12)
  const macdSignal = calcEMA(
    macdLine.filter((v): v is number => v !== null),
    9
  )

  return closes.map((price, i) => {
    const macdVal = macdLine[i]
    const signalOffset = macdLine.slice(0, i + 1).filter(v => v !== null).length - 1
    const sigVal = signalOffset >= 0 && signalOffset < macdSignal.length ? macdSignal[signalOffset] : null
    return {
      date: dates[i],
      price: Math.round(price),
      ma200: ma200[i] ? Math.round(ma200[i]!) : null,
      rsi: rsi[i] ? Math.round(rsi[i]! * 10) / 10 : null,
      macd: macdVal ? Math.round(macdVal * 100) / 100 : null,
      macdSignal: sigVal !== null ? Math.round(sigVal * 100) / 100 : null,
      macdHistogram: macdVal !== null && sigVal !== null
        ? Math.round((macdVal - sigVal) * 100) / 100
        : null,
    }
  })
}

export async function GET() {
  try {
    const alpacaBars = await getCryptoBars('BTCUSD', '1Day', 200)
    if (alpacaBars.length >= 30) {
      const closes = alpacaBars.map(b => b.close)
      const dates = alpacaBars.map(b => new Date(b.timestamp * 1000).toISOString().slice(0, 10))
      const data = buildIndicators(closes, dates)
      return NextResponse.json({
        success: true,
        data,
        meta: { source: 'alpaca-crypto-bars', symbol: 'BTCUSD', interval: '1d' },
      })
    }

    const res = await fetch(BINANCE_KLINES, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('Binance API error')
    const klines: any[][] = await res.json()

    const closes = klines.map(k => parseFloat(k[4]))
    const dates = klines.map(k => new Date(k[0]).toISOString().slice(0, 10))
    const data = buildIndicators(closes, dates)

    return NextResponse.json({
      success: true,
      data,
      meta: { source: 'binance-klines', symbol: 'BTCUSDT', interval: '1d' },
    })
  } catch {
    const data: IndicatorPoint[] = []
    const now = Date.now()
    for (let i = 199; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      const price = 75000 + Math.sin(i * 0.3) * 10000 + Math.cos(i * 0.1) * 5000 + Math.sin(i * 0.05) * 3000
      data.push({
        date: d.toISOString().slice(0, 10),
        price: Math.round(price),
        ma200: i > 20 ? Math.round(price - 5000 + Math.sin(i * 0.2) * 2000) : null,
        rsi: Math.round((40 + Math.sin(i * 0.4) * 20 + Math.random() * 10) * 10) / 10,
        macd: Math.round((Math.sin(i * 0.2) * 150 + Math.random() * 50) * 100) / 100,
        macdSignal: Math.round((Math.sin(i * 0.18) * 120 + Math.random() * 40) * 100) / 100,
        macdHistogram: Math.round((Math.sin(i * 0.3) * 50) * 100) / 100,
      })
    }
    return NextResponse.json({
      success: true,
      data,
      meta: { source: 'synthetic-fallback', symbol: 'BTCUSDT' },
    })
  }
}
