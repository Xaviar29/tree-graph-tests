import type { CryptoMarket, CryptoGlobal, CryptoHistorical } from '@/types/crypto.types'

const BASE = 'https://api.coingecko.com/api/v3'
const HEADERS = { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }

export async function getCryptoMarkets(limit = 50): Promise<CryptoMarket[]> {
  const res = await fetch(
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`,
    { headers: HEADERS, next: { revalidate: 60 } },
  )
  if (!res.ok) throw new Error(`CoinGecko markets: ${res.status}`)
  const data = await res.json()
  return data.map((c: any) => ({
    id: c.id, symbol: c.symbol.toUpperCase(), name: c.name,
    currentPrice: c.current_price, marketCap: c.market_cap, totalVolume: c.total_volume,
    priceChange24h: c.price_change_24h ?? 0, priceChangePercent24h: c.price_change_percentage_24h ?? 0,
    sparkline7d: c.sparkline_in_7d?.price ?? [],
    image: c.image,
  }))
}

export async function getCryptoHistorical(id: string, days: number): Promise<CryptoHistorical[]> {
  const res = await fetch(
    `${BASE}/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
    { headers: HEADERS, next: { revalidate: 300 } },
  )
  if (!res.ok) throw new Error(`CoinGecko ohlc ${id}: ${res.status}`)
  const data = await res.json()
  return data.map((d: number[]) => ({
    timestamp: d[0], open: d[1], high: d[2], low: d[3], close: d[4],
  }))
}

export async function getCryptoGlobal(): Promise<CryptoGlobal> {
  const res = await fetch(`${BASE}/global`, { headers: HEADERS, next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`CoinGecko global: ${res.status}`)
  const data = await res.json()
  const d = data.data
  return {
    totalMarketCap: d.total_market_cap?.usd ?? 0,
    totalVolume24h: d.total_volume?.usd ?? 0,
    btcDominance: d.market_cap_percentage?.btc ?? 0,
    ethDominance: d.market_cap_percentage?.eth ?? 0,
    marketCapChange24h: d.market_cap_change_percentage_24h_usd ?? 0,
  }
}
