export interface OHLCV { time: number; open: number; high: number; low: number; close: number; volume: number }

export function calcSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    let sum = 0
    for (let j = 0; j < period; j++) sum += data[i - j]
    result.push(sum / period)
  }
  return result
}

export function calcEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  const k = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    if (i === period - 1) { result.push(ema); continue }
    ema = data[i] * k + ema * (1 - k)
    result.push(ema)
  }
  return result
}

export function calcRSI(data: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [null]
  let gains = 0, losses = 0
  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
    if (i < period) { result.push(null); continue }
    const avgGain = gains / period, avgLoss = losses / period
    if (avgLoss === 0) { result.push(100); continue }
    const rs = avgGain / avgLoss
    result.push(100 - 100 / (1 + rs))
    const prevGain = Math.max(0, data[i - period + 1] - data[i - period])
    gains -= prevGain / period
    const prevLoss = Math.max(0, data[i - period] - data[i - period + 1])
    losses -= prevLoss / period
  }
  return result
}

export function calcMACD(data: number[]): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const ema12 = calcEMA(data, 12)
  const ema26 = calcEMA(data, 26)
  const macd: (number | null)[] = []
  const signal: (number | null)[] = []
  const histogram: (number | null)[] = []
  const validMacd: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (ema12[i] === null || ema26[i] === null) { macd.push(null); signal.push(null); histogram.push(null); continue }
    const m = ema12[i]! - ema26[i]!
    macd.push(m)
    validMacd.push(m)
    if (validMacd.length < 9) { signal.push(null); histogram.push(null); continue }
    const s = validMacd.slice(-9).reduce((a, b) => a + b, 0) / 9
    signal.push(s)
    histogram.push(m - s)
  }
  return { macd, signal, histogram }
}

export function calcBollinger(data: number[], period = 20, multiplier = 2) {
  const sma = calcSMA(data, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null) { upper.push(null); lower.push(null); continue }
    let sumSq = 0
    for (let j = 0; j < period && i - j >= 0; j++) sumSq += Math.pow(data[i - j] - sma[i]!, 2)
    const std = Math.sqrt(sumSq / period)
    upper.push(sma[i]! + multiplier * std)
    lower.push(sma[i]! - multiplier * std)
  }
  return { sma: sma as number[], upper, lower }
}

export function calcATR(candles: OHLCV[], period = 14): (number | null)[] {
  const result: (number | null)[] = [null]
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close),
    )
    if (i < period) { result.push(null); continue }
    const atr = result[i - 1] === null ? tr : ((result[i - 1]! * (period - 1) + tr) / period)
    result.push(atr)
  }
  return result
}
