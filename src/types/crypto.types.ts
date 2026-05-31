export interface CryptoMarket {
  id: string
  symbol: string
  name: string
  currentPrice: number
  marketCap: number
  totalVolume: number
  priceChange24h: number
  priceChangePercent24h: number
  sparkline7d: number[]
  image?: string
  athPrice?: number
  athDate?: string
  athPercentage?: number
  athMarketCap?: number
  maxSupply?: number
  circulatingSupply?: number
  totalSupply?: number
  athSupply?: number
}

export interface CryptoGlobal {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  marketCapChange24h: number
}

export interface CryptoHistorical {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
}
