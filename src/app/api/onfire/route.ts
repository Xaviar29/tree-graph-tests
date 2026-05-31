import { NextResponse } from 'next/server'
import { createRng, dailySeed } from '@/lib/random'

interface OnFireAsset {
  symbol: string; name: string; category: string; score: number;
  priceChange24h: number; volume24h: number; volatility: number
}

const ASSETS: Record<string, { name: string; category: string }> = {
  'BTC': { name: 'Bitcoin', category: 'crypto' },
  'ETH': { name: 'Ethereum', category: 'crypto' },
  'SOL': { name: 'Solana', category: 'crypto' },
  'XRP': { name: 'XRP', category: 'crypto' },
  'ADA': { name: 'Cardano', category: 'crypto' },
  'DOGE': { name: 'Dogecoin', category: 'crypto' },
  'AVAX': { name: 'Avalanche', category: 'crypto' },
  'DOT': { name: 'Polkadot', category: 'crypto' },
  'LINK': { name: 'Chainlink', category: 'crypto' },
  'MATIC': { name: 'Polygon', category: 'crypto' },
  'UNI': { name: 'Uniswap', category: 'crypto' },
  'ATOM': { name: 'Cosmos', category: 'crypto' },
  'LTC': { name: 'Litecoin', category: 'crypto' },
  'BCH': { name: 'Bitcoin Cash', category: 'crypto' },
  'FIL': { name: 'Filecoin', category: 'crypto' },
  'NEAR': { name: 'NEAR Protocol', category: 'crypto' },
  'APT': { name: 'Aptos', category: 'crypto' },
  'ARB': { name: 'Arbitrum', category: 'crypto' },
  'OP': { name: 'Optimism', category: 'crypto' },
  'INJ': { name: 'Injective', category: 'crypto' },
  'TIA': { name: 'Celestia', category: 'crypto' },
  'SEI': { name: 'Sei', category: 'crypto' },
  'SUI': { name: 'Sui', category: 'crypto' },
  'PEPE': { name: 'Pepe', category: 'crypto' },
  'AAVE': { name: 'Aave', category: 'crypto' },
  'CRV': { name: 'Curve DAO', category: 'crypto' },
  'MKR': { name: 'Maker', category: 'crypto' },
  'FXS': { name: 'Frax Share', category: 'crypto' },
  'RUNE': { name: 'THORChain', category: 'crypto' },
  'STX': { name: 'Stacks', category: 'crypto' },
  'FET': { name: 'Fetch.ai', category: 'crypto' },
  'AGIX': { name: 'SingularityNET', category: 'crypto' },
  'GRT': { name: 'The Graph', category: 'crypto' },
  'SAND': { name: 'The Sandbox', category: 'crypto' },
  'MANA': { name: 'Decentraland', category: 'crypto' },
  'AXS': { name: 'Axie Infinity', category: 'crypto' },
  'APE': { name: 'ApeCoin', category: 'crypto' },
  'EOS': { name: 'EOS', category: 'crypto' },
  'TRX': { name: 'Tron', category: 'crypto' },
  'VET': { name: 'VeChain', category: 'crypto' },
  'ICP': { name: 'Internet Computer', category: 'crypto' },
  'HBAR': { name: 'Hedera', category: 'crypto' },
  'ALGO': { name: 'Algorand', category: 'crypto' },
  'XLM': { name: 'Stellar', category: 'crypto' },
  'FTM': { name: 'Fantom', category: 'crypto' },
  'KAS': { name: 'Kaspa', category: 'crypto' },
  'ROSE': { name: 'Oasis Network', category: 'crypto' },
  'MINA': { name: 'Mina Protocol', category: 'crypto' },

  'AAPL': { name: 'Apple', category: 'stocks' },
  'TSLA': { name: 'Tesla', category: 'stocks' },
  'NVDA': { name: 'NVIDIA', category: 'stocks' },
  'MSFT': { name: 'Microsoft', category: 'stocks' },
  'AMZN': { name: 'Amazon', category: 'stocks' },
  'GOOGL': { name: 'Alphabet', category: 'stocks' },
  'META': { name: 'Meta', category: 'stocks' },
  'AMD': { name: 'AMD', category: 'stocks' },
  'SPY': { name: 'S&P 500', category: 'stocks' },
  'QQQ': { name: 'Nasdaq 100', category: 'stocks' },
  'TLT': { name: '20+ Year Treasury', category: 'stocks' },
  'GLD': { name: 'Gold ETF', category: 'stocks' },

  'EURUSD': { name: 'EUR/USD', category: 'forex' },
  'GBPUSD': { name: 'GBP/USD', category: 'forex' },
  'USDJPY': { name: 'USD/JPY', category: 'forex' },
  'AUDUSD': { name: 'AUD/USD', category: 'forex' },
  'USDCAD': { name: 'USD/CAD', category: 'forex' },
  'NZDUSD': { name: 'NZD/USD', category: 'forex' },
  'USDCHF': { name: 'USD/CHF', category: 'forex' },

  'GOLD': { name: 'Gold', category: 'commodities' },
  'SILVER': { name: 'Silver', category: 'commodities' },
  'WTI': { name: 'WTI Crude', category: 'commodities' },
  'NG': { name: 'Natural Gas', category: 'commodities' },
  'COPPER': { name: 'Copper', category: 'commodities' },
}

export async function GET(request: Request) {
  const rng = createRng(dailySeed('onfire'))
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'

  const assets: OnFireAsset[] = Object.entries(ASSETS)
    .filter(([_, info]) => category === 'all' || info.category === category)
    .map(([symbol, info]) => {
      const volatility = rng.range(0.05, 0.45)
      const priceChange = rng.range(-0.06, 0.06)
      const volume = Math.round(rng.range(1e8, 5e9))
      const score = Math.round(
        (Math.abs(priceChange) / 0.12) * 40 +
        (volatility / 0.45) * 30 +
        rng.range(0, 30)
      )
      return {
        symbol,
        name: info.name,
        category: info.category,
        score: Math.min(100, score),
        priceChange24h: Math.round(priceChange * 10000) / 100,
        volume24h: volume,
        volatility: Math.round(volatility * 100) / 100,
      }
    })
    .sort((a, b) => b.score - a.score)

  return NextResponse.json({ success: true, data: assets, meta: { source: 'synthetic-onfire' } })
}
