import { ema } from './breadth'

export interface DailyADData {
  date: string
  advancing: number
  declining: number
}

export interface McClellanResult {
  oscillator: number
  summationIndex: number
  ema19: number
  ema39: number
  timestamp: string
}

function netAdvances(data: DailyADData[]): number[] {
  return data.map((d) => d.advancing - d.declining)
}

export function calculateMcClellan(dailyData: DailyADData[]): McClellanResult {
  const net = netAdvances(dailyData)
  const now = new Date().toISOString()

  if (net.length < 39) {
    return { oscillator: 0, summationIndex: 0, ema19: 0, ema39: 0, timestamp: now }
  }

  const ema19Vals = ema(net, 19)
  const ema39Vals = ema(net, 39)

  const latestEma19 = ema19Vals[ema19Vals.length - 1]
  const latestEma39 = ema39Vals[ema39Vals.length - 1]

  const oscillator = latestEma19 - latestEma39

  const minLen = Math.min(ema19Vals.length, ema39Vals.length)
  let summationIndex = 0
  for (let i = 0; i < minLen; i++) {
    summationIndex += ema19Vals[ema19Vals.length - minLen + i] - ema39Vals[ema39Vals.length - minLen + i]
  }

  return {
    oscillator: Math.round(oscillator * 100) / 100,
    summationIndex: Math.round(summationIndex * 100) / 100,
    ema19: Math.round(latestEma19 * 100) / 100,
    ema39: Math.round(latestEma39 * 100) / 100,
    timestamp: now,
  }
}

export function calculateMcClellanOscillator(
  oscillator: number,
  prevSummationIndex: number,
): number {
  return prevSummationIndex + oscillator
}
