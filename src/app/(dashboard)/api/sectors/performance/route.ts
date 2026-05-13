import { NextResponse } from 'next/server'
import { getQuote } from '@/lib/providers/yahoo-finance'
import { SECTOR_SYMBOLS, SECTOR_LABELS } from '@/lib/constants'
import type { SectorPerformance } from '@/types/sectors.types'
import type { ApiResponse } from '@/types/api.types'

// Approximate SP500 weights for the sectors (as of early 2024 for visual representation)
const SECTOR_WEIGHTS: Record<string, number> = {
  'XLK': 29.5, // Tech
  'XLF': 13.0, // Financials
  'XLV': 12.5, // Health Care
  'XLY': 10.5, // Consumer Discretionary
  'XLC': 8.5,  // Communication Services
  'XLI': 8.5,  // Industrials
  'XLP': 6.0,  // Consumer Staples
  'XLE': 4.0,  // Energy
  'XLU': 2.5,  // Utilities
  'XLRE': 2.5, // Real Estate
  'XLB': 2.5,  // Materials
}

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
    const quotes = await getQuote([...SECTOR_SYMBOLS])
    
    const performance: SectorPerformance[] = quotes.map(quote => ({
      sector: {
        symbol: quote.symbol,
        name: SECTOR_LABELS[quote.symbol] || quote.symbol,
        color: SECTOR_COLORS[quote.symbol] || '#888888',
      },
      quote,
      weight: SECTOR_WEIGHTS[quote.symbol] || 5,
    }))

    // Sort by performance (change percent descending)
    performance.sort((a, b) => b.quote.changePercent - a.quote.changePercent)

    const response = {
      success: true,
      data: performance,
      meta: { cachedAt: new Date().toISOString(), source: 'yahoo-finance', ttlMs: 60000 },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sectors performance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sectors performance' },
      { status: 500 }
    )
  }
}
