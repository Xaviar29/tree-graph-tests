import { getQuote, getHistorical } from '@/lib/providers/yahoo-finance'
import type { Quote, OHLCV } from '@/types/market.types'
import sp500Symbols from '@/data/sp500-symbols.json'

function ema(values: number[], period: number): number[] {
  const result: number[] = []
  const k = 2 / (period + 1)

  let sum = 0
  for (let i = 0; i < period && i < values.length; i++) sum += values[i]
  result.push(sum / period)

  for (let i = period; i < values.length; i++) {
    result.push(values[i] * k + result[result.length - 1] * (1 - k))
  }

  return result
}

function sma(values: number[], period: number): number {
  if (values.length < period) return 0
  let sum = 0
  for (let i = values.length - period; i < values.length; i++) sum += values[i]
  return sum / period
}

export async function calculateAdvanceDecline(): Promise<{
  advancing: number
  declining: number
  unchanged: number
  adRatio: number
}> {
  const quotes = await getQuote(sp500Symbols)
  let advancing = 0
  let declining = 0
  let unchanged = 0

  for (const q of quotes) {
    if (q.change > 0) advancing++
    else if (q.change < 0) declining++
    else unchanged++
  }

  const adRatio = declining > 0 ? advancing / declining : advancing

  return { advancing, declining, unchanged, adRatio }
}

export async function calculatePercentAboveMA(
  symbols: string[],
  period: number,
): Promise<number> {
  const batchSize = 10
  const allSymbols = symbols.length > 0 ? symbols : sp500Symbols

  const historicalMap = new Map<string, OHLCV[]>()

  const batches: string[][] = []
  for (let i = 0; i < allSymbols.length; i += batchSize) {
    batches.push(allSymbols.slice(i, i + batchSize))
  }

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((sym) => getHistorical(sym, '1y', '1d')),
    )
    batch.forEach((sym, i) => {
      if (results[i].status === 'fulfilled') {
        historicalMap.set(sym, results[i].value)
      }
    })
  }

  let aboveCount = 0
  let totalWithData = 0

  for (const sym of allSymbols) {
    const data = historicalMap.get(sym)
    if (!data || data.length < period) continue

    totalWithData++
    const closes = data.map((d) => d.close)
    const ma = sma(closes, period)
    if (closes[closes.length - 1] > ma) aboveCount++
  }

  return totalWithData > 0 ? (aboveCount / totalWithData) * 100 : 0
}

export interface NewHighsLowsData {
  newHighs: number
  newLows: number
  nhRatio: number
}

export async function calculateNewHighsLows(): Promise<NewHighsLowsData> {
  const quotes = await getQuote(sp500Symbols)

  const historicalMap = new Map<string, OHLCV[]>()
  const batchSize = 10
  const batches: string[][] = []
  for (let i = 0; i < sp500Symbols.length; i += batchSize) {
    batches.push(sp500Symbols.slice(i, i + batchSize))
  }
  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((sym) => getHistorical(sym, '1y', '1d')),
    )
    batch.forEach((sym, i) => {
      if (results[i].status === 'fulfilled') {
        historicalMap.set(sym, results[i].value)
      }
    })
  }

  let newHighs = 0
  let newLows = 0

  for (const q of quotes) {
    const data = historicalMap.get(q.symbol)
    if (!data || data.length === 0) continue

    const closes = data.map((d) => d.close)
    const yearHigh = Math.max(...closes)
    const yearLow = Math.min(...closes)

    if (q.price >= yearHigh && q.change > 0) newHighs++
    if (q.price <= yearLow && q.change < 0) newLows++
  }

  const nhRatio = newLows > 0 ? newHighs / newLows : newHighs

  return { newHighs, newLows, nhRatio }
}

export { sp500Symbols, ema, sma }
