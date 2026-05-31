import type { Quote, OHLCV } from '@/types/market.types'

const APCA_API_KEY_ID = process.env.ALPACA_API_KEY || ''
const APCA_API_SECRET_KEY = process.env.ALPACA_API_SECRET || ''
const APCA_DATA_URL = 'https://data.alpaca.markets/v2'

interface AlpacaSnapshot {
  symbol: string
  latestTrade?: { p: number; s: number; t: string; x: string }
  latestQuote?: { ap: number; as: number; bp: number; bs: number; t: string }
  minuteBar?: { o: number; h: number; l: number; c: number; v: number; t: string }
  dailyBar?: { o: number; h: number; l: number; c: number; v: number; t: string }
  prevDailyBar?: { o: number; h: number; l: number; c: number; v: number; t: string }
}

interface AlpacaBar {
  t: string
  o: number
  h: number
  l: number
  c: number
  v: number
  n: number
  vw: number
}

function headers() {
  return {
    'APCA-API-KEY-ID': APCA_API_KEY_ID,
    'APCA-API-SECRET-KEY': APCA_API_SECRET_KEY,
    Accept: 'application/json',
  }
}

function isConfigured(): boolean {
  return !!APCA_API_KEY_ID && !!APCA_API_SECRET_KEY
}

function canFallback(symbol: string): boolean {
  return /^[A-Z0-9.]{1,20}$/.test(symbol) && 
    !symbol.startsWith('^') &&
    !symbol.includes('=')
}

async function fetchSnapshots(symbols: string[]): Promise<Map<string, AlpacaSnapshot>> {
  if (!isConfigured() || symbols.length === 0) return new Map()

  const stockSymbols = symbols.filter(canFallback)
  if (stockSymbols.length === 0) return new Map()

  const map = new Map<string, AlpacaSnapshot>()
  const BATCH_SIZE = 100

  for (let i = 0; i < stockSymbols.length; i += BATCH_SIZE) {
    const batch = stockSymbols.slice(i, i + BATCH_SIZE)
    const url = `${APCA_DATA_URL}/stocks/snapshots?symbols=${batch.join(',')}`
    try {
      const res = await fetch(url, { headers: headers() })
      if (!res.ok) continue
      const data = await res.json()
      for (const symbol of batch) {
        if (data[symbol]) {
          map.set(symbol, { symbol, ...data[symbol] })
        }
      }
    } catch {
      continue
    }
    if (i + BATCH_SIZE < stockSymbols.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  return map
}

function parseQuote(symbol: string, snap: AlpacaSnapshot): Quote | null {
  const dailyBar = snap.dailyBar
  const prevBar = snap.prevDailyBar
  if (!dailyBar || !prevBar) return null

  const price = dailyBar.c
  const previousClose = prevBar.c
  const change = price - previousClose
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

  return {
    symbol,
    name: symbol,
    price,
    change,
    changePercent,
    volume: dailyBar.v,
    previousClose,
    open: dailyBar.o,
    dayHigh: dailyBar.h,
    dayLow: dailyBar.l,
    week52High: 0,
    week52Low: 0,
    marketState: 'REGULAR',
  }
}

export async function getQuote(symbols: string[]): Promise<Quote[]> {
  const snapshots = await fetchSnapshots(symbols)
  return symbols.map((symbol) => {
    const snap = snapshots.get(symbol)
    if (!snap) {
      return {
        symbol, name: symbol, price: 0, change: 0, changePercent: 0,
        volume: 0, previousClose: 0, open: 0, dayHigh: 0, dayLow: 0,
        week52High: 0, week52Low: 0, marketState: 'CLOSED' as const,
      }
    }
    return parseQuote(symbol, snap) ?? {
      symbol, name: symbol, price: 0, change: 0, changePercent: 0,
      volume: 0, previousClose: 0, open: 0, dayHigh: 0, dayLow: 0,
      week52High: 0, week52Low: 0, marketState: 'CLOSED' as const,
    }
  })
}

interface OrderbookLevel {
  price: number
  volume: number
}

interface Orderbook {
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
}

export async function getCryptoOrderbook(symbol: string = 'BTCUSD'): Promise<Orderbook | null> {
  if (!isConfigured()) return null

  const url = `${APCA_DATA_URL}/crypto/${symbol}/orderbook`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return null

  const data = await res.json()
  const bids: OrderbookLevel[] = (data.bids || []).map((b: any) => ({
    price: parseFloat(b.p),
    volume: parseFloat(b.s),
  }))
  const asks: OrderbookLevel[] = (data.asks || []).map((a: any) => ({
    price: parseFloat(a.p),
    volume: parseFloat(a.s),
  }))

  return {
    bids: bids.sort((a, b) => b.price - a.price),
    asks: asks.sort((a, b) => a.price - b.price),
  }
}

function alpacaTimeframe(range: string, interval: string): string {
  if (interval === '1d' || interval === '1D') return '1Day'
  if (interval === '1wk') return '1Week'
  if (interval === '1mo') return '1Month'
  if (interval === '1h' || interval === '60m') return '1Hour'
  if (interval === '15m') return '15Min'
  if (interval === '5m') return '5Min'
  if (interval === '1m') return '1Min'
  return '1Day'
}

function alpacaStartDate(range: string): string {
  const now = new Date()
  switch (range) {
    case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case '5d': return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case '1mo': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case '3mo': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case '6mo': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case '2y': return new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case '5y': return new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    default: return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

export async function getBars(
  symbol: string,
  range: string = '1y',
  interval: string = '1d',
): Promise<OHLCV[]> {
  if (!isConfigured() || !canFallback(symbol)) return []

  const timeframe = alpacaTimeframe(range, interval)
  const start = alpacaStartDate(range)
  const limit = range === '1d' ? 390 : 500

  const url = `${APCA_DATA_URL}/stocks/${encodeURIComponent(symbol)}/bars?timeframe=${timeframe}&start=${start}&limit=${limit}&adjustment=split`

  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return []

  const data = await res.json()
  const bars: AlpacaBar[] = data.bars || []

  return bars.map((b) => ({
    timestamp: Math.floor(new Date(b.t).getTime() / 1000),
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
    volume: b.v,
  }))
}

export async function getCryptoBars(
  symbol: string,
  timeframe: string = '1Day',
  limit: number = 365,
): Promise<OHLCV[]> {
  if (!isConfigured()) return []

  const apiSymbol = symbol.toUpperCase()
  const url = `${APCA_DATA_URL}/crypto/${apiSymbol}/bars?timeframe=${timeframe}&limit=${limit}`

  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return []

  const data = await res.json()
  const bars: AlpacaBar[] = data.bars || []

  return bars.map((b) => ({
    timestamp: Math.floor(new Date(b.t).getTime() / 1000),
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
    volume: b.v,
  }))
}
