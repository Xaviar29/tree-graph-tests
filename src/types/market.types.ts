export interface Quote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  week52High: number
  week52Low: number
  marketCap?: number
  marketState: 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'
}

export interface OHLCV {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TimeSeriesPoint {
  timestamp: number
  value: number
}
