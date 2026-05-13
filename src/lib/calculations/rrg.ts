import { OHLCV } from '@/types/market.types'
import { RRGDataPoint } from '@/types/sectors.types'

/**
 * Calculates a simple moving average
 */
function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
      continue
    }
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j]
    }
    result.push(sum / period)
  }
  return result
}

/**
 * Calculates JdK RS-Ratio and RS-Momentum approximations
 * RS = Sector / Benchmark
 * RS-Ratio = 100 * (RS / SMA(RS, 14))
 * RS-Momentum = 100 * (RS-Ratio / SMA(RS-Ratio, 14))
 *
 * We need at least 14 + 14 = 28 data points to get the first valid momentum.
 */
export function calculateRRG(
  sectorData: OHLCV[],
  benchmarkData: OHLCV[],
  period: number = 14
): RRGDataPoint[] {
  if (sectorData.length !== benchmarkData.length) {
    // Attempt to align by timestamp if lengths mismatch, but usually they are the same
    // For simplicity, assume they are aligned or we truncate to the shortest
    const minLen = Math.min(sectorData.length, benchmarkData.length)
    sectorData = sectorData.slice(sectorData.length - minLen)
    benchmarkData = benchmarkData.slice(benchmarkData.length - minLen)
  }

  const rs: number[] = []
  const timestamps: number[] = []

  for (let i = 0; i < sectorData.length; i++) {
    const sClose = sectorData[i].close
    const bClose = benchmarkData[i].close
    timestamps.push(sectorData[i].timestamp)
    if (bClose !== 0) {
      rs.push(sClose / bClose)
    } else {
      rs.push(rs.length > 0 ? rs[rs.length - 1] : 1)
    }
  }

  const smaRS = calculateSMA(rs, period)
  const rsRatio: number[] = []

  for (let i = 0; i < rs.length; i++) {
    if (isNaN(smaRS[i])) {
      rsRatio.push(NaN)
    } else {
      rsRatio.push(100 * (rs[i] / smaRS[i]))
    }
  }

  const smaRSRatio = calculateSMA(rsRatio, period)
  const rrgPoints: RRGDataPoint[] = []

  for (let i = 0; i < rsRatio.length; i++) {
    if (isNaN(rsRatio[i]) || isNaN(smaRSRatio[i])) {
      // Not enough data
      continue
    }
    const rsMomentum = 100 * (rsRatio[i] / smaRSRatio[i])
    rrgPoints.push({
      timestamp: timestamps[i],
      rsRatio: rsRatio[i],
      rsMomentum,
    })
  }

  return rrgPoints
}

export function getRRGQuadrant(rsRatio: number, rsMomentum: number): 'Leading' | 'Weakening' | 'Lagging' | 'Improving' {
  if (rsRatio >= 100 && rsMomentum >= 100) return 'Leading' // Top Right
  if (rsRatio >= 100 && rsMomentum < 100) return 'Weakening' // Bottom Right
  if (rsRatio < 100 && rsMomentum < 100) return 'Lagging' // Bottom Left
  return 'Improving' // Top Left (rsRatio < 100 && rsMomentum >= 100)
}
