import { calcSMA, calcRSI, calcATR, type OHLCV } from './indicators'
import type { StrategySignal } from './index'

function argmax(arr: number[]): number {
  let maxIdx = 0
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[maxIdx]) maxIdx = i
  return maxIdx
}

function discreteTrend(price: number, sma: number | null): number {
  if (sma === null || sma === 0) return 0
  return price >= sma ? 1 : 0
}

function discreteRSI(rsi: number | null): number {
  if (rsi === null) return 1
  if (rsi < 30) return 0
  if (rsi > 70) return 2
  return 1
}

function discreteMomentum(mom: number): number {
  return mom >= 0 ? 1 : 0
}

function discreteVolatility(atr: number | null, price: number): number {
  if (atr === null || price === 0) return 1
  const ratio = atr / price
  if (ratio < 0.01) return 0
  if (ratio > 0.03) return 2
  return 1
}

function discretePosition(pos: 'flat' | 'long' | 'short'): number {
  if (pos === 'flat') return 0
  if (pos === 'long') return 1
  return 2
}

function encodeState(
  trend: number, rsi: number, mom: number, vol: number, pos: number
): number {
  return ((trend * 3 + rsi) * 2 + mom) * 3 + vol * 3 + pos
}

function computeForwardReturns(closes: number[], horizon: number): number[] {
  return closes.map((_, i) => {
    const fwd = Math.min(i + horizon, closes.length - 1)
    return (closes[fwd] - closes[i]) / closes[i]
  })
}

export function tabularQLStrategy(closes: number[], candles: OHLCV[]): StrategySignal[] {
  const HORIZON = 4
  const LEVERAGE = 5
  const EPOCHS = 15
  const WARMUP = 50
  const TRAIN_RATIO = 0.8

  const sma20 = calcSMA(closes, 20)
  const sma50 = calcSMA(closes, 50)
  const rsi = calcRSI(closes)
  const atr = calcATR(candles)

  const momentum5: number[] = closes.map((c, i) =>
    i >= 5 ? (c - closes[i - 5]) / closes[i - 5] : 0
  )

  const fwdReturns = computeForwardReturns(closes, HORIZON)
  const trainEnd = Math.floor(closes.length * TRAIN_RATIO)

  const trainingFwd = fwdReturns.slice(WARMUP, trainEnd - HORIZON)
  const baseline = trainingFwd.length > 0
    ? trainingFwd.reduce((a, b) => a + b, 0) / trainingFwd.length
    : 0

  const NUM_STATES = 108
  const NUM_ACTIONS = 3

  let Q: number[][] = Array.from({ length: NUM_STATES }, () =>
    Array.from({ length: NUM_ACTIONS }, () => (Math.random() - 0.5) * 0.1)
  )

  let epsilon = 0.5
  const alpha = 0.15
  const gamma = 0.9

  function selectAction(state: number): number {
    if (Math.random() < epsilon) return Math.floor(Math.random() * NUM_ACTIONS)
    return argmax(Q[state])
  }

  for (let epoch = 0; epoch < EPOCHS; epoch++) {
    let pos: 'flat' | 'long' | 'short' = 'flat'

    for (let i = WARMUP; i < trainEnd - HORIZON; i++) {
      const trend = discreteTrend(closes[i], sma20[i])
      const rsiD = discreteRSI(rsi[i])
      const momD = discreteMomentum(momentum5[i])
      const volD = discreteVolatility(atr[i], closes[i])
      const posD = discretePosition(pos)
      const state = encodeState(trend, rsiD, momD, volD, posD)

      const action = selectAction(state)
      const fwdR = fwdReturns[i]
      const excessR = action === 0 ? fwdR - baseline
        : action === 1 ? -(fwdR - baseline)
        : -Math.abs(fwdR - baseline) * 0.3
      const reward = excessR * LEVERAGE * 100 - Math.abs(fwdR) * 10

      const nextTrend = discreteTrend(closes[Math.min(i + HORIZON, trainEnd - 1)], sma20[Math.min(i + HORIZON, trainEnd - 1)])
      let nextPos: 'flat' | 'long' | 'short' = pos
      if (action === 0) nextPos = 'long'
      else if (action === 1) nextPos = 'short'
      else nextPos = 'flat'
      const nextPosD = discretePosition(nextPos)
      const nextState = encodeState(nextTrend, rsiD, momD, volD, nextPosD)

      const maxNextQ = Math.max(...Q[nextState])
      Q[state][action] += alpha * (reward + gamma * maxNextQ - Q[state][action])

      pos = nextPos
    }

    epsilon = Math.max(0.05, epsilon * 0.85)
  }

  const signals: StrategySignal[] = []
  let currentPos: 'flat' | 'long' | 'short' = 'flat'

  for (let i = 0; i < closes.length; i++) {
    if (i < WARMUP) {
      signals.push({ action: 'hold', confidence: 0, reason: 'insufficient data' })
      continue
    }

    const trend = discreteTrend(closes[i], sma20[i])
    const rsiD = discreteRSI(rsi[i])
    const momD = discreteMomentum(momentum5[i])
    const volD = discreteVolatility(atr[i], closes[i])
    const posD = discretePosition(currentPos)
    const state = encodeState(trend, rsiD, momD, volD, posD)

    const qValues = Q[state]
    const bestAction = argmax(qValues)

    const qSpread = Math.max(...qValues) - Math.min(...qValues)
    const confidence = Math.min(95, Math.max(10, Math.round(30 + qSpread * 25)))

    const actions = ['buy', 'sell', 'hold'] as const
    const action = actions[bestAction]

    if (action === 'buy') currentPos = 'long'
    else if (action === 'sell') currentPos = 'short'
    else currentPos = 'flat'

    signals.push({
      action,
      confidence,
      reason: `TQL(Qb=${qValues[0].toFixed(2)} Qs=${qValues[1].toFixed(2)} Qh=${qValues[2].toFixed(2)} ε=${epsilon.toFixed(2)})`,
    })
  }

  return signals
}
