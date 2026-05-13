import { NextResponse } from 'next/server'
import { getMultipleHistorical, getHistorical } from '@/lib/providers/yahoo-finance'
import { SECTOR_SYMBOLS, SECTOR_LABELS } from '@/lib/constants'
import type { SectorRRG } from '@/types/sectors.types'
import type { ApiResponse } from '@/types/api.types'
import { calculateRRG, getRRGQuadrant } from '@/lib/calculations/rrg'

// Colors for sectors
const SECTOR_COLORS: Record<string, string> = {
  'XLK': '#3b82f6', // blue-500
  'XLF': '#10b981', // emerald-500
  'XLV': '#ec4899', // pink-500
  'XLY': '#f59e0b', // amber-500
  'XLC': '#8b5cf6', // violet-500
  'XLI': '#64748b', // slate-500
  'XLP': '#84cc16', // lime-500
  'XLE': '#ef4444', // red-500
  'XLU': '#0ea5e9', // sky-500
  'XLRE': '#d946ef',// fuchsia-500
  'XLB': '#f97316', // orange-500
}

export async function GET() {
  try {
    // RRG traditionally uses weekly data. We fetch 1 year of daily data to have enough for smoothing.
    // 1 year = ~252 trading days. We can calculate RRG on daily data using a longer period,
    // or resample. Let's calculate daily RRG using period=14 for SMA, which gives a shorter-term RRG,
    // or period=50 for a medium-term RRG. Let's use period=20 for a 1-month smoothing.
    const benchmarkData = await getHistorical('SPY', '1y', '1d')
    const sectorsMap = await getMultipleHistorical([...SECTOR_SYMBOLS], '1y', '1d')
    
    const rrgResults: SectorRRG[] = []

    for (const symbol of SECTOR_SYMBOLS) {
      const sectorData = sectorsMap.get(symbol) || []
      if (sectorData.length === 0 || benchmarkData.length === 0) continue

      // Calculate RRG with a 20-day period
      const rrgPoints = calculateRRG(sectorData, benchmarkData, 20)
      
      if (rrgPoints.length > 0) {
        // Get the last 15 points for the tail (approx 3 weeks of daily data)
        const tail = rrgPoints.slice(-15)
        const current = tail[tail.length - 1]
        
        rrgResults.push({
          sector: {
            symbol,
            name: SECTOR_LABELS[symbol] || symbol,
            color: SECTOR_COLORS[symbol] || '#888888',
          },
          tail,
          current,
          quadrant: getRRGQuadrant(current.rsRatio, current.rsMomentum),
        })
      }
    }

    const response = {
      success: true,
      data: rrgResults,
      meta: { cachedAt: new Date().toISOString(), source: 'yahoo-finance', ttlMs: 60000 },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sectors RRG error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sectors RRG' },
      { status: 500 }
    )
  }
}
