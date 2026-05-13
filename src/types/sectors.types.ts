import { Quote } from './market.types'

export interface SectorInfo {
  symbol: string
  name: string
  color: string
}

export interface RRGDataPoint {
  timestamp: number
  rsRatio: number
  rsMomentum: number
}

export interface SectorRRG {
  sector: SectorInfo
  tail: RRGDataPoint[] // Historical points to draw the tail
  current: RRGDataPoint // The most recent point
  quadrant: 'Leading' | 'Weakening' | 'Lagging' | 'Improving'
}

export interface SectorPerformance {
  sector: SectorInfo
  quote: Quote
  weight: number // SP500 approximate weight
}
