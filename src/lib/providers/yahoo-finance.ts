import type { Quote, OHLCV } from '@/types/market.types'
import * as alpaca from './alpaca-markets'

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json',
}

const BASE = 'https://query1.finance.yahoo.com'

interface ChartMeta {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  regularMarketVolume?: number
  chartPreviousClose?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  regularMarketTime?: number
  currentTradingPeriod?: {
    pre: { start: number; end: number }
    regular: { start: number; end: number }
    post: { start: number; end: number }
  }
}

interface YahooChartResult {
  chart: {
    result?: Array<{
      meta: ChartMeta
      timestamp?: number[]
      indicators: {
        quote?: Array<{
          open?: number[]
          high?: number[]
          low?: number[]
          close?: number[]
          volume?: number[]
        }>
      }
    }>
    error?: { code: string; description: string }
  }
}

async function fetchChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<YahooChartResult['chart']> {
  const url = `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`

  const res = await fetch(url, { headers: YAHOO_HEADERS })

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000))
    const retryRes = await fetch(url, { headers: YAHOO_HEADERS })
    if (!retryRes.ok) throw new Error(`Yahoo chart failed: ${retryRes.status}`)
    return (await retryRes.json()).chart
  }

  if (!res.ok) throw new Error(`Yahoo chart failed: ${res.status}`)

  const data: YahooChartResult = await res.json()
  if (data.chart.error) throw new Error(data.chart.error.description)
  return data.chart
}

function parseQuoteFromMeta(symbol: string, meta: ChartMeta, chartResult: YahooChartResult['chart']['result'] | undefined): Quote {
  const now = Math.floor(Date.now() / 1000)
  const period = meta.currentTradingPeriod
  let marketState: Quote['marketState'] = 'CLOSED'

  if (period) {
    if (now >= period.regular.start && now <= period.regular.end) marketState = 'REGULAR'
    else if (now >= period.pre.start && now <= period.pre.end) marketState = 'PRE'
    else if (now >= period.post.start && now <= period.post.end) marketState = 'POST'
  }

  let open = 0
  const firstResult = chartResult?.[0]
  if (firstResult?.indicators.quote?.[0]?.open?.[0]) {
    open = firstResult.indicators.quote[0].open[0]
  }

  const price = meta.regularMarketPrice ?? 0
  const previousClose = meta.chartPreviousClose ?? 0
  const change = price - previousClose
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

  return {
    symbol,
    name: meta.shortName || meta.longName || symbol,
    price,
    change,
    changePercent,
    volume: meta.regularMarketVolume ?? 0,
    previousClose,
    open,
    dayHigh: meta.regularMarketDayHigh ?? 0,
    dayLow: meta.regularMarketDayLow ?? 0,
    week52High: meta.fiftyTwoWeekHigh ?? 0,
    week52Low: meta.fiftyTwoWeekLow ?? 0,
    marketState,
  }
}

async function runWithConcurrency<T>(
  items: string[],
  fn: (item: string) => Promise<T>,
  concurrency: number = 15,
): Promise<T[]> {
  const results: T[] = []
  const queue = [...items]

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()!
      try {
        const result = await fn(item)
        results.push(result)
      } catch {
        // worker continues even if one item fails
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

export async function getQuote(symbols: string[]): Promise<Quote[]> {
  try {
    const chartResults = await runWithConcurrency(symbols, (s) => fetchChart(s, '1d', '1d'), 15)

    const quoteMap = new Map<string, Quote>()

    for (const chart of chartResults) {
      const result = chart.result?.[0]
      if (!result) continue
      const symbol = result.meta.symbol
      quoteMap.set(symbol, parseQuoteFromMeta(symbol, result.meta, chart.result))
    }

    const quotes = symbols.map((symbol) => {
      const q = quoteMap.get(symbol)
      if (!q) {
        return {
          symbol,
          name: symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          previousClose: 0,
          open: 0,
          dayHigh: 0,
          dayLow: 0,
          week52High: 0,
          week52Low: 0,
          marketState: 'CLOSED' as const,
        }
      }
      return q
    })

    return quotes
  } catch {
    return alpaca.getQuote(symbols)
  }
}

export async function getHistorical(
  symbol: string,
  range: string = '1y',
  interval: string = '1d',
): Promise<OHLCV[]> {
  try {
    const chart = await fetchChart(symbol, range, interval)
    return parseChartData(chart)
  } catch {
    return alpaca.getBars(symbol, range, interval)
  }
}

function parseChartData(chart: YahooChartResult['chart']): OHLCV[] {
  const result = chart.result?.[0]
  if (!result) return []

  const timestamps = result.timestamp || []
  const quote = result.indicators.quote?.[0]
  if (!quote) return []

  return timestamps
    .map((ts, i) => ({
      timestamp: ts,
      open: quote.open?.[i] ?? 0,
      high: quote.high?.[i] ?? 0,
      low: quote.low?.[i] ?? 0,
      close: quote.close?.[i] ?? 0,
      volume: quote.volume?.[i] ?? 0,
    }))
    .filter((o) => o.open !== 0 && o.close !== 0)
}

export async function getMultipleHistorical(
  symbols: string[],
  range: string = '1y',
  interval: string = '1d',
): Promise<Map<string, OHLCV[]>> {
  const results = await Promise.allSettled(
    symbols.map((s) => getHistorical(s, range, interval)),
  )

  const map = new Map<string, OHLCV[]>()
  symbols.forEach((s, i) => {
    const r = results[i]
    map.set(s, r.status === 'fulfilled' ? r.value : [])
  })

  return map
}
