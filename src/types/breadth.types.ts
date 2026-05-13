export interface BreadthData {
  totalAdvancing: number
  totalDeclining: number
  totalUnchanged: number
  adRatio: number
  advanceDeclineLine: number
  percentAboveSma50: number
  percentAboveSma200: number
  newHighs: number
  newLows: number
  timestamp: string
}

export interface McClellanData {
  oscillator: number
  summationIndex: number
  ema19: number
  ema39: number
  timestamp: string
  note?: string
}

export interface BreadthHistoryPoint {
  date: string
  advancing: number
  declining: number
  adLine: number
}

export interface McClellanHistoryPoint {
  date: string
  oscillator: number
  summationIndex: number
}
