import { NextResponse } from 'next/server'

const FRED_API_KEY = process.env.FRED_API_KEY || ''
const FRED_BASE = 'https://api.stlouisfed.org/fred'

// FRED series IDs for key economic indicators
const ECONOMIC_SERIES: Record<string, { name: string; importance: 'high' | 'medium' | 'low' }> = {
  FEDFUNDS: { name: 'Fed Funds Rate', importance: 'high' },
  CPIAUCSL: { name: 'CPI YoY', importance: 'high' },
  PAYEMS: { name: 'Nonfarm Payrolls', importance: 'high' },
  UNRATE: { name: 'Unemployment Rate', importance: 'high' },
  GDP: { name: 'GDP QoQ', importance: 'high' },
  ICSA: { name: 'Initial Jobless Claims', importance: 'high' },
  HOUST: { name: 'Housing Starts', importance: 'medium' },
  INDPRO: { name: 'Industrial Production', importance: 'medium' },
  PPIACO: { name: 'PPI YoY', importance: 'medium' },
  RSXFS: { name: 'Retail Sales', importance: 'medium' },
  UMCSENT: { name: 'Consumer Sentiment', importance: 'medium' },
  M2SL: { name: 'M2 Money Supply', importance: 'medium' },
  T10YIE: { name: '10Y Breakeven Inflation', importance: 'low' },
  DGS10: { name: '10Y Treasury Yield', importance: 'medium' },
}

interface EconomicEvent {
  date: string
  label: string
  impact: 'positive' | 'negative' | 'neutral'
  forecast: string
  previous: string
  actual?: string
  value?: number
  prevValue?: number
}

async function fetchFREDSeries(seriesId: string): Promise<{ date: string; value: number }[]> {
  const url = `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=14`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = await res.json()
  return (data.observations ?? [])
    .filter((o: any) => o.value !== '.')
    .map((o: any) => ({ date: o.date, value: parseFloat(o.value) }))
}

function determineImpact(seriesId: string, prevValue: number, currentValue: number): 'positive' | 'negative' | 'neutral' {
  // Higher is generally positive for: PAYEMS, GDP, HOUST, INDPRO, RSXFS, UMCSENT, ICSA (lower claims = better)
  const positiveWhenUp = ['PAYEMS', 'GDP', 'HOUST', 'INDPRO', 'RSXFS', 'UMCSENT']
  const positiveWhenDown = ['ICSA', 'UNRATE']
  if (Math.abs(currentValue - prevValue) < 0.1) return 'neutral'
  if (positiveWhenUp.includes(seriesId)) return currentValue > prevValue ? 'positive' : 'negative'
  if (positiveWhenDown.includes(seriesId)) return currentValue < prevValue ? 'positive' : 'negative'
  return currentValue > prevValue ? 'positive' : 'negative'
}

export async function GET() {
  const events: EconomicEvent[] = []

  if (!FRED_API_KEY) {
    return NextResponse.json({
      success: false,
      data: [],
      error: 'FRED_API_KEY not configured',
      meta: { source: 'none' },
    })
  }

  try {
    const results = await Promise.allSettled(
      Object.entries(ECONOMIC_SERIES).map(async ([seriesId, info]) => {
        const observations = await fetchFREDSeries(seriesId)
        if (observations.length < 2) return null
        const current = observations[0]
        const previous = observations[1]
        const impact = determineImpact(seriesId, previous.value, current.value)
        return {
          date: current.date,
          label: info.name,
          impact,
          forecast: '',
          previous: previous.value.toLocaleString(),
          actual: current.value.toLocaleString(),
          value: current.value,
          prevValue: previous.value,
        }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        events.push(result.value)
      }
    }

    return NextResponse.json({
      success: true,
      data: events.sort((a, b) => b.date.localeCompare(a.date)),
      meta: { source: 'fred', seriesCount: Object.keys(ECONOMIC_SERIES).length },
    })
  } catch {
    return NextResponse.json({
      success: false,
      data: [],
      error: 'FRED API error',
      meta: { source: 'error' },
    })
  }
}
