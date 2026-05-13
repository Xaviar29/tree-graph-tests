import { NextResponse } from 'next/server'
import { getQuote } from '@/lib/providers/yahoo-finance'
import { FOREX_SYMBOLS, FOREX_LABELS } from '@/lib/constants'
import { ApiResponse } from '@/types/api.types'
import { Quote } from '@/types/market.types'

export async function GET() {
  try {
    const quotes = await getQuote([...FOREX_SYMBOLS])
    
    // Add custom labels
    const forex: Quote[] = quotes.map(quote => ({
      ...quote,
      name: FOREX_LABELS[quote.symbol] || quote.name,
    }))

    const response: ApiResponse<Quote[]> = {
      success: true,
      data: forex,
      meta: {
        cachedAt: new Date().toISOString(),
        source: 'yahoo-finance',
        ttlMs: 60000,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Forex error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forex' },
      { status: 500 }
    )
  }
}
