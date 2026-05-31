import { NextResponse } from 'next/server'
import { getQuote } from '@/lib/providers/yahoo-finance'

interface HolderCategory { name: string; btc: number; percentage: number; color: string }

interface PublicCompany { name: string; ticker: string; btc: number; valueUsd: number; percentageOfSupply: number }
interface PrivateCompany { name: string; btc: number; estValueUsd: number }
interface Country { name: string; btc: number; valueUsd: number; source: string }

interface HoldersData {
  categories: HolderCategory[]
  publicCompanies: PublicCompany[]
  privateCompanies: PrivateCompany[]
  countries: Country[]
  totalBtc: number
}

const COMPANY_TICKERS = ['MSTR', 'MARA', 'TSLA', 'COIN', 'HUT', 'SQ', 'RIOT', 'ADE']

const categories: HolderCategory[] = [
  { name: 'Lost', btc: 3500000, percentage: 16.7, color: '#ef4444' },
  { name: 'Individuals', btc: 5200000, percentage: 24.8, color: '#3b82f6' },
  { name: 'Exchanges', btc: 2300000, percentage: 10.9, color: '#f97316' },
  { name: 'Mining Pools', btc: 1800000, percentage: 8.6, color: '#8b5cf6' },
  { name: 'ETFs (Spot)', btc: 950000, percentage: 4.5, color: '#f7931a' },
  { name: 'Governments', btc: 520000, percentage: 2.5, color: '#10b981' },
  { name: 'Public Companies', btc: 380000, percentage: 1.8, color: '#06b6d4' },
  { name: 'Private Companies', btc: 420000, percentage: 2.0, color: '#ec4899' },
  { name: 'Wallets > 1K BTC', btc: 4100000, percentage: 19.5, color: '#6366f1' },
  { name: 'Other', btc: 1800000, percentage: 8.6, color: '#6b7280' },
]

const FALLBACK_COMPANY_BTC: [string, number, number][] = [
  ['MicroStrategy', 214400, 0.38],
  ['Marathon Digital', 26200, 0.12],
  ['Tesla', 9720, 0.05],
  ['Coinbase', 9000, 0.04],
  ['Hut 8 Mining', 9115, 0.04],
  ['Block Inc', 8037, 0.04],
  ['Riot Platforms', 7446, 0.04],
  ['Bitcoin Group SE', 3591, 0.02],
]

const privateCompanies: PrivateCompany[] = [
  { name: 'Block.one', btc: 164000, estValueUsd: 164000 * 65000 },
  { name: 'Bitmain', btc: 15000, estValueUsd: 15000 * 65000 },
  { name: 'Galaxy Digital', btc: 12000, estValueUsd: 12000 * 65000 },
  { name: 'Stone Ridge', btc: 10000, estValueUsd: 10000 * 65000 },
  { name: 'Xapo', btc: 8000, estValueUsd: 8000 * 65000 },
]

const countries: Country[] = [
  { name: 'USA', btc: 205000, valueUsd: 205000 * 65000, source: 'Seized (various ops)' },
  { name: 'China', btc: 194000, valueUsd: 194000 * 65000, source: 'Seized (PlusToken etc)' },
  { name: 'Ukraine', btc: 46360, valueUsd: 46360 * 65000, source: 'Donations + seized' },
  { name: 'El Salvador', btc: 5960, valueUsd: 5960 * 65000, source: 'Public purchases' },
  { name: 'Finland', btc: 1981, valueUsd: 1981 * 65000, source: 'Seized' },
  { name: 'Bulgaria', btc: 2139, valueUsd: 2139 * 65000, source: 'Seized' },
  { name: 'UK', btc: 3500, valueUsd: 3500 * 65000, source: 'Seized' },
]

const totalBtc = categories.reduce((sum, c) => sum + c.btc, 0)

function buildHoldings(btcPrice: number, companyPrices: Map<string, number>): HoldersData {
  const publicCompanies: PublicCompany[] = FALLBACK_COMPANY_BTC.map(([name, btc, pct], i) => {
    const ticker = COMPANY_TICKERS[i]
    const stockPrice = companyPrices.get(ticker) || 0
    const valueUsd = stockPrice > 0 ? Math.round(btc * stockPrice * 3.03) : Math.round(btc * btcPrice)
    return { name, ticker, btc, valueUsd, percentageOfSupply: pct }
  })

  const updatedPrivateCompanies = privateCompanies.map(c => ({
    ...c,
    estValueUsd: Math.round(c.btc * btcPrice),
  }))

  const updatedCountries = countries.map(c => ({
    ...c,
    valueUsd: Math.round(c.btc * btcPrice),
  }))

  return { categories, publicCompanies, privateCompanies: updatedPrivateCompanies, countries: updatedCountries, totalBtc }
}

export async function GET() {
  try {
    const quotes = await getQuote([...COMPANY_TICKERS, 'BTC-USD'])
    const companyPrices = new Map<string, number>()
    let btcPrice = 65000

    for (const q of quotes) {
      if (q.price > 0) {
        if (q.symbol === 'BTC-USD') {
          btcPrice = q.price
        } else {
          companyPrices.set(q.symbol, q.price)
        }
      }
    }

    const data = buildHoldings(btcPrice, companyPrices)
    return NextResponse.json({ success: true, data, meta: { source: 'yahoo-finance', btcPrice } })
  } catch {
    const data = buildHoldings(65000, new Map())
    return NextResponse.json({ success: true, data, meta: { source: 'synthetic-fallback', btcPrice: 65000 } })
  }
}
