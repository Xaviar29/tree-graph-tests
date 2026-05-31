import { NeuralNetwork } from './neural-network'
import { calcSMA, calcRSI, calcATR, calcMACD, calcBollinger, type OHLCV } from './indicators'
import type { StrategySignal } from './index'

interface Experience {
  state: number[]
  action: number
  reward: number
  nextState: number[]
  done: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function argmax(arr: number[]): number {
  let maxIdx = 0
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[maxIdx]) maxIdx = i
  return maxIdx
}

export class DQNAgent {
  network: NeuralNetwork
  targetNetwork: NeuralNetwork
  epsilon: number
  learningRate: number
  gamma: number
  replayBuffer: Experience[]
  bufferSize: number
  batchSize: number
  trainStep: number
  updateTargetEvery: number

  constructor(inputSize = 8, hiddenSize = 16, outputSize = 3) {
    this.network = new NeuralNetwork(inputSize, hiddenSize, outputSize)
    this.targetNetwork = this.network.copy()
    this.epsilon = 0.5
    this.learningRate = 0.01
    this.gamma = 0.9
    this.replayBuffer = []
    this.bufferSize = 500
    this.batchSize = 64
    this.trainStep = 0
    this.updateTargetEvery = 50
  }

  getQValues(state: number[]): number[] {
    return this.network.forward(state)
  }

  selectAction(state: number[]): number {
    if (Math.random() < this.epsilon) return Math.floor(Math.random() * 3)
    const q = this.getQValues(state)
    return argmax(q)
  }

  store(state: number[], action: number, reward: number, nextState: number[], done: boolean): void {
    this.replayBuffer.push({ state, action, reward, nextState, done })
    if (this.replayBuffer.length > this.bufferSize) this.replayBuffer.shift()
  }

  train(): number {
    if (this.replayBuffer.length < this.batchSize) return 0
    const batch = shuffle(this.replayBuffer).slice(0, this.batchSize)

    const inputs: number[][] = []
    const targets: number[][] = []

    for (const exp of batch) {
      const qPred = this.getQValues(exp.state)
      const qNext = this.targetNetwork.forward(exp.nextState)
      const maxNextQ = exp.done ? 0 : Math.max(...qNext)
      const target = qPred[exp.action]
      const tdTarget = exp.reward + this.gamma * maxNextQ

      const targetQ = [...qPred]
      targetQ[exp.action] = tdTarget
      inputs.push(exp.state)
      targets.push(targetQ)
    }

    this.network.trainBatch(inputs, targets, this.learningRate)
    this.trainStep++

    if (this.trainStep % this.updateTargetEvery === 0) {
      this.targetNetwork = this.network.copy()
    }

    const avgQ = inputs
      .map((s, i) => this.network.forward(s)[argmax(targets[i])])
      .reduce((a, b) => a + b, 0) / inputs.length

    return avgQ
  }

  decayEpsilon(factor = 0.95, min = 0.05): void {
    this.epsilon = Math.max(min, this.epsilon * factor)
  }
}

function extractFeatures(
  i: number, closes: number[],
  sma20: (number | null)[],
  sma50: (number | null)[],
  rsi: (number | null)[],
  bb: ReturnType<typeof calcBollinger>,
  atr: (number | null)[],
  macdHist: (number | null)[],
  volSma: (number | null)[],
  candles: OHLCV[],
): number[] {
  const c = closes[i]
  const priceSma20 = c / (sma20[i] ?? c)
  const priceSma50 = c / (sma50[i] ?? c)
  const rsiNorm = (rsi[i] ?? 50) / 100
  const mom5 = i >= 5 ? (c - closes[i - 5]) / closes[i - 5] : 0
  const vola = (atr[i] ?? 0) / (c || 1)
  const bbPos = (c - (bb.lower[i] ?? c)) / ((bb.upper[i] ?? c) - (bb.lower[i] ?? c) || 1)
  const volR = i < candles.length ? (candles[i]?.volume ?? 0) / (volSma[i] ?? candles[i]?.volume ?? 1) : 1
  const mNorm = Math.tanh((macdHist[i] ?? 0) / (c || 1) * 100)

  const feats = [priceSma20, priceSma50, rsiNorm, mom5, vola, bbPos, volR, mNorm]
  for (let j = 0; j < feats.length; j++) {
    if (!isFinite(feats[j])) feats[j] = 0
    if (Math.abs(feats[j]) > 10) feats[j] = Math.sign(feats[j]) * 10
  }
  return feats
}

function computeForwardReturns(closes: number[], horizon: number): number[] {
  return closes.map((_, i) => {
    const fwd = Math.min(i + horizon, closes.length - 1)
    return (closes[fwd] - closes[i]) / closes[i]
  })
}

export function qlStrategy(closes: number[], candles: OHLCV[]): StrategySignal[] {
  const HORIZON = 4
  const LEVERAGE = 5
  const EPOCHS = 8
  const WARMUP = 50
  const TRAIN_RATIO = 0.8

  const sma20 = calcSMA(closes, 20)
  const sma50 = calcSMA(closes, 50)
  const rsi = calcRSI(closes)
  const bb = calcBollinger(closes)
  const atr = calcATR(candles)
  const { histogram } = calcMACD(closes)
  const volSma = calcSMA(candles.map(c => c.volume), 20)

  const features: number[][] = []
  for (let i = 0; i < closes.length; i++) {
    features.push(extractFeatures(i, closes, sma20, sma50, rsi, bb, atr, histogram, volSma, candles))
  }

  const fwdReturns = computeForwardReturns(closes, HORIZON)
  const trainEnd = Math.floor(closes.length * TRAIN_RATIO)

  const trainingFwd = fwdReturns.slice(WARMUP, trainEnd - HORIZON)
  const baseline = trainingFwd.reduce((a, b) => a + b, 0) / Math.max(trainingFwd.length, 1)

  const agent = new DQNAgent(8, 16, 3)

  for (let epoch = 0; epoch < EPOCHS; epoch++) {
    for (let i = WARMUP; i < trainEnd - HORIZON; i++) {
      const state = features[i]
      const action = agent.selectAction(state)
      const fwdR = fwdReturns[i]
      const excessR = action === 0 ? fwdR - baseline
        : action === 1 ? -(fwdR - baseline)
        : -Math.abs(fwdR - baseline) * 0.5
      const reward = excessR * LEVERAGE * 100 - Math.abs(fwdR) * 15
      const nextState = features[Math.min(i + HORIZON, trainEnd - 1)]
      agent.store(state, action, reward, nextState, i + HORIZON >= trainEnd - HORIZON)

      if (i % 4 === 0) agent.train()
    }
    agent.decayEpsilon(0.9, 0.05)
  }

  const signals: StrategySignal[] = []
  for (let i = 0; i < closes.length; i++) {
    if (i < WARMUP) {
      signals.push({ action: 'hold', confidence: 0, reason: 'insufficient data' })
      continue
    }
    const feat = features[i]
    if (feat.some(f => !isFinite(f))) {
      signals.push({ action: 'hold', confidence: 0, reason: 'invalid state' })
      continue
    }

    const q = agent.getQValues(feat)
    const bestAction = argmax(q)

    const qSpread = Math.max(...q) - Math.min(...q)
    const confidence = Math.min(95, Math.max(10, Math.round(30 + qSpread * 15)))

    const actions = ['buy', 'sell', 'hold'] as const
    signals.push({
      action: actions[bestAction],
      confidence,
      reason: `DQN(Qb=${q[0].toFixed(1)} Qs=${q[1].toFixed(1)} Qh=${q[2].toFixed(1)} ε=${agent.epsilon.toFixed(2)})`,
    })
  }

  return signals
}
