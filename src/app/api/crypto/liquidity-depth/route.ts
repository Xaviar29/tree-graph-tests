import { NextResponse } from 'next/server'
import { getCryptoOrderbook } from '@/lib/providers/alpaca-markets'

const BINANCE_DEPTH = 'https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=1000'
const BINANCE_PRICE = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
const BUCKET_SIZE = 250

interface LiquidityBin {
  price: number
  volume: number
  side: 'bid' | 'ask'
}

function aggregateBinanceLevels(levels: string[][], side: 'bid' | 'ask'): LiquidityBin[] {
  const buckets = new Map<number, number>()
  for (const [priceStr, qtyStr] of levels) {
    const price = parseFloat(priceStr)
    const qty = parseFloat(qtyStr)
    const bucketKey = Math.round(price / BUCKET_SIZE) * BUCKET_SIZE
    const usdVolume = price * qty
    buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + usdVolume)
  }
  return Array.from(buckets.entries())
    .map(([price, volume]) => ({ price, volume: Math.round(volume), side }))
    .sort((a, b) => a.price - b.price)
}

function aggregateAlpacaLevels(levels: { price: number; volume: number }[], side: 'bid' | 'ask'): LiquidityBin[] {
  const buckets = new Map<number, number>()
  for (const { price, volume } of levels) {
    const bucketKey = Math.round(price / BUCKET_SIZE) * BUCKET_SIZE
    const usdVolume = price * volume
    buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + usdVolume)
  }
  return Array.from(buckets.entries())
    .map(([price, volume]) => ({ price, volume: Math.round(volume), side }))
    .sort((a, b) => a.price - b.price)
}

export async function GET() {
  try {
    const alpacaBook = await getCryptoOrderbook('BTCUSD')
    if (alpacaBook && alpacaBook.bids.length > 0 && alpacaBook.asks.length > 0) {
      const currentPrice = alpacaBook.asks.length > 0
        ? alpacaBook.asks[0].price
        : alpacaBook.bids[0].price
      const bids = aggregateAlpacaLevels(alpacaBook.bids.slice(0, 200), 'bid')
      const asks = aggregateAlpacaLevels(alpacaBook.asks.slice(0, 200), 'ask')
      return NextResponse.json({
        success: true,
        data: { bids, asks, currentPrice },
        meta: { source: 'alpaca-orderbook', bucketSize: BUCKET_SIZE },
      })
    }

    const [depthRes, priceRes] = await Promise.all([
      fetch(BINANCE_DEPTH, { next: { revalidate: 10 } }),
      fetch(BINANCE_PRICE, { next: { revalidate: 5 } }),
    ])
    if (!depthRes.ok || !priceRes.ok) throw new Error('Binance API error')

    const [depth, priceData] = await Promise.all([depthRes.json(), priceRes.json()])
    const currentPrice = parseFloat(priceData.price)
    const bids = aggregateBinanceLevels(depth.bids.slice(0, 200), 'bid')
    const asks = aggregateBinanceLevels(depth.asks.slice(0, 200), 'ask')

    return NextResponse.json({
      success: true,
      data: { bids, asks, currentPrice },
      meta: { source: 'binance-depth', bucketSize: BUCKET_SIZE },
    })
  } catch {
    const syntheticPrice = 82500 + Math.sin(Date.now() * 0.0001) * 2500
    const bins: LiquidityBin[] = []
    for (let p = 30000; p <= 85000; p += BUCKET_SIZE) {
      const distFromPrice = Math.abs(p - syntheticPrice)
      const volume = Math.max(5000000, 50000000 * Math.exp(-distFromPrice / 5000) + Math.random() * 10000000)
      bins.push({ price: p, volume: Math.round(volume), side: p < syntheticPrice ? 'bid' : 'ask' })
    }
    return NextResponse.json({
      success: true,
      data: { bids: bins.filter(b => b.side === 'bid'), asks: bins.filter(b => b.side === 'ask'), currentPrice: Math.round(syntheticPrice) },
      meta: { source: 'synthetic-fallback' },
    })
  }
}
