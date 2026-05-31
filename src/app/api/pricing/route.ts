import { NextResponse } from 'next/server'

const PLANS = [
  { id: 'free', name: 'Free', price: 0, features: ['All market data', 'Basic charts', 'Crypto overview', '60s refresh'] },
  { id: 'premium', name: 'Premium', price: 999, priceLabel: '$9.99/mo', features: ['Everything in Free', 'Real-time liquidations', 'Smart alerts (5)', 'Personal watchlist', 'CSV export'] },
  { id: 'pro', name: 'Pro', price: 2999, priceLabel: '$29.99/mo', features: ['Everything in Premium', 'Unlimited alerts', 'API access (1000 req/h)', 'Multi-exchange data', 'Historical data export'] },
]

export async function GET() {
  return NextResponse.json({ success: true, data: PLANS })
}
