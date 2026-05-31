import { calcSMA, calcEMA, calcRSI, calcMACD, calcBollinger, calcATR, type OHLCV as _OHLCV } from './indicators'
import { qlStrategy } from './dqn'
import { tabularQLStrategy } from './tabular-ql'
export { qlStrategy, tabularQLStrategy }
export type OHLCV = _OHLCV

export interface StrategySignal {
  action: 'buy' | 'sell' | 'hold'
  confidence: number
  reason: string
}

export interface TradeRecord {
  date: string
  action: 'buy' | 'sell'
  entryPrice: number
  exitPrice?: number
  pnl?: number
  roi?: number
  reason: string
  closed: boolean
}

// PolarisBot: Trend Following (MA crossover + ADX-like trend strength)
export function polarisStrategy(closes: number[], candles: OHLCV[]): StrategySignal[] {
  const sma20 = calcSMA(closes, 20)
  const sma50 = calcSMA(closes, 50)
  const sma200 = calcSMA(closes, 200)
  const signals: StrategySignal[] = []

  for (let i = 0; i < closes.length; i++) {
    if (i < 1 || !sma20[i] || !sma50[i]) { signals.push({ action: 'hold', confidence: 0, reason: 'insufficient data' }); continue }

    const prev20 = sma20[i - 1]!, curr20 = sma20[i]!
    const prev50 = sma50[i - 1]!, curr50 = sma50[i]!

    if (prev20 <= prev50 && curr20 > curr50 && curr50 > (sma200[i] || 0)) {
      signals.push({ action: 'buy', confidence: 80, reason: 'Golden cross + uptrend' })
    } else if (prev20 >= prev50 && curr20 < curr50 && curr50 < (sma200[i] || Infinity)) {
      signals.push({ action: 'sell', confidence: 75, reason: 'Death cross + downtrend' })
    } else if (curr20 > curr50 && closes[i] > curr20) {
      signals.push({ action: 'buy', confidence: 45, reason: 'Price above fast MA in uptrend' })
    } else if (curr20 < curr50 && closes[i] < curr20) {
      signals.push({ action: 'sell', confidence: 40, reason: 'Price below fast MA in downtrend' })
    } else {
      signals.push({ action: 'hold', confidence: 30, reason: 'No clear trend' })
    }
  }
  return signals
}

// OrionBot: Mean Reversion (RSI + Bollinger Bands)
export function orionStrategy(closes: number[], candles: OHLCV[]): StrategySignal[] {
  const rsi = calcRSI(closes)
  const bb = calcBollinger(closes)
  const atr = calcATR(candles)
  const signals: StrategySignal[] = []

  for (let i = 0; i < closes.length; i++) {
    if (!rsi[i] || !bb.upper[i] || !bb.lower[i]) { signals.push({ action: 'hold', confidence: 0, reason: 'insufficient data' }); continue }

    const r = rsi[i]!

    if (r < 25 && closes[i] <= bb.lower[i]!) {
      signals.push({ action: 'buy', confidence: 85, reason: 'RSI oversold + touch lower band' })
    } else if (r > 75 && closes[i] >= bb.upper[i]!) {
      signals.push({ action: 'sell', confidence: 80, reason: 'RSI overbought + touch upper band' })
    } else if (r < 30) {
      signals.push({ action: 'buy', confidence: 55, reason: 'RSI oversold zone' })
    } else if (r > 70) {
      signals.push({ action: 'sell', confidence: 50, reason: 'RSI overbought zone' })
    } else {
      signals.push({ action: 'hold', confidence: 25, reason: 'RSI neutral' })
    }
  }
  return signals
}

// LyraBot: Momentum + MACD
export function lyraStrategy(closes: number[], candles: OHLCV[]): StrategySignal[] {
  const { macd, signal, histogram } = calcMACD(closes)
  const rsi = calcRSI(closes)
  const signals: StrategySignal[] = []

  for (let i = 0; i < closes.length; i++) {
    const m = macd[i], s = signal[i], h = histogram[i], r = rsi[i]
    if (m === null || s === null || h === null || r === null) {
      signals.push({ action: 'hold', confidence: 0, reason: 'insufficient data' })
      continue
    }

    const prevMacd = i > 0 ? macd[i - 1] : null
    const prevSignal = i > 0 ? signal[i - 1] : null

    if (prevMacd !== null && prevSignal !== null && prevMacd <= prevSignal && m > s && h > 0 && r > 30) {
      signals.push({ action: 'buy', confidence: 82, reason: 'MACD bullish cross + momentum' })
    } else if (prevMacd !== null && prevSignal !== null && prevMacd >= prevSignal && m < s && h < 0 && r < 70) {
      signals.push({ action: 'sell', confidence: 78, reason: 'MACD bearish cross + momentum' })
    } else if (m > s && h > 0) {
      signals.push({ action: 'buy', confidence: 40, reason: 'MACD bullish' })
    } else if (m < s && h < 0) {
      signals.push({ action: 'sell', confidence: 35, reason: 'MACD bearish' })
    } else {
      signals.push({ action: 'hold', confidence: 20, reason: 'MACD flat' })
    }
  }
  return signals
}

// SiriusBot: Volume + Price Breakout
export function siriusStrategy(closes: number[], candles: OHLCV[]): StrategySignal[] {
  const sma20 = calcSMA(closes, 20)
  const volSMA = calcSMA(candles.map(c => c.volume), 20)
  const bb = calcBollinger(closes)
  const signals: StrategySignal[] = []

  for (let i = 0; i < closes.length; i++) {
    if (!sma20[i] || !volSMA[i] || !bb.upper[i] || !bb.lower[i]) {
      signals.push({ action: 'hold', confidence: 0, reason: 'insufficient data' })
      continue
    }

    const volRatio = candles[i].volume / volSMA[i]!

    if (closes[i] > bb.upper[i]! && volRatio > 1.5 && closes[i] > sma20[i]!) {
      signals.push({ action: 'buy', confidence: 88, reason: 'High volume breakout above upper band' })
    } else if (closes[i] < bb.lower[i]! && volRatio > 1.5 && closes[i] < sma20[i]!) {
      signals.push({ action: 'sell', confidence: 83, reason: 'High volume breakdown below lower band' })
    } else if (volRatio > 2 && closes[i] > sma20[i]!) {
      signals.push({ action: 'buy', confidence: 50, reason: 'Volume spike in uptrend' })
    } else if (volRatio > 2 && closes[i] < sma20[i]!) {
      signals.push({ action: 'sell', confidence: 45, reason: 'Volume spike in downtrend' })
    } else {
      signals.push({ action: 'hold', confidence: 15, reason: 'Normal volume, no breakout' })
    }
  }
  return signals
}

// VegaBot: ML-inspired ensemble (combines all strategies)
export function vegaStrategy(closes: number[], candles: OHLCV[]): StrategySignal[] {
  const polaris = polarisStrategy(closes, candles)
  const orion = orionStrategy(closes, candles)
  const lyra = lyraStrategy(closes, candles)
  const sirius = siriusStrategy(closes, candles)
  const signals: StrategySignal[] = []

  for (let i = 0; i < closes.length; i++) {
    const votes = { buy: 0, sell: 0, hold: 0 }
    const confidences = { buy: 0, sell: 0, hold: 0 }
    const reasons: string[] = []

    for (const strat of [polaris[i], orion[i], lyra[i], sirius[i]]) {
      if (strat) {
        votes[strat.action]++
        confidences[strat.action] += strat.confidence
        if (strat.confidence > 40) reasons.push(strat.reason)
      }
    }

    let action: 'buy' | 'sell' | 'hold' = 'hold'
    if (votes.buy > votes.sell && votes.buy >= votes.hold) action = 'buy'
    else if (votes.sell > votes.buy && votes.sell >= votes.hold) action = 'sell'

    const avgConf = votes[action] > 0 ? Math.round(confidences[action] / votes[action]) : 0
    signals.push({
      action,
      confidence: Math.min(95, avgConf + votes[action] * 5),
      reason: reasons.length > 0 ? reasons.slice(0, 2).join('; ') : 'ensemble consensus',
    })
  }
  return signals
}

export const STRATEGIES: Record<string, {
  name: string
  label: string
  strategy: (closes: number[], candles: OHLCV[]) => StrategySignal[]
}> = {
  QPolarisBot: { name: 'QPolarisBot', label: 'DQN Reinforcement Learning', strategy: qlStrategy },
  PolarisBot: { name: 'PolarisBot', label: 'Trend Following', strategy: polarisStrategy },
  OrionBot: { name: 'OrionBot', label: 'Mean Reversion', strategy: orionStrategy },
  LyraBot: { name: 'LyraBot', label: 'MACD Momentum', strategy: lyraStrategy },
  SiriusBot: { name: 'SiriusBot', label: 'Volume Breakout', strategy: siriusStrategy },
  VegaBot: { name: 'VegaBot', label: 'ML Ensemble', strategy: vegaStrategy },
  QVegaBot: { name: 'QVegaBot', label: 'Tabular Q-Learning', strategy: tabularQLStrategy },
}
