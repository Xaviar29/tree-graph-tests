import { NextResponse } from 'next/server'
import { getQuote } from '@/lib/providers/yahoo-finance'
import { COMMODITY_SYMBOLS, COMMODITY_LABELS } from '@/lib/constants'
import type { Quote } from '@/types/market.types'

export async function GET() {
  try {
    const quotes = await getQuote([...COMMODITY_SYMBOLS])

    const commodities: Quote[] = quotes.map(quote => ({
      ...quote,
      name: COMMODITY_LABELS[quote.symbol] || quote.name,
    }))

    const response = {
      success: true,
      data: commodities,
      meta: { cachedAt: new Date().toISOString(), source: 'yahoo-finance', ttlMs: 60000 },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Commodities error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commodities' },
      { status: 500 }
    )
  }
}
