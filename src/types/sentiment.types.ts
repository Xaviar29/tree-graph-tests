export interface FearGreedData {
  value: number
  label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
  previousClose: number
  weekAgo: number
  monthAgo: number
  timestamp: string
}

export interface PutCallData {
  ratio: number
  totalPutVolume: number
  totalCallVolume: number
  timestamp: string
}

export interface VixData {
  value: number
  change: number
  changePercent: number
  timestamp: string
}

export interface SentimentHistoryPoint {
  date: string
  value: number
}
