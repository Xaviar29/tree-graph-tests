export const INDEX_SYMBOLS = ['^GSPC', '^IXIC', '^DJI', '^GDAXI', '^N225', '^FTSE'] as const

export const INDEX_LABELS: Record<string, string> = {
  '^GSPC': 'S&P 500',
  '^IXIC': 'Nasdaq',
  '^DJI': 'Dow Jones',
  '^GDAXI': 'DAX',
  '^N225': 'Nikkei',
  '^FTSE': 'FTSE 100',
}

export const CACHE_TTL = {
  REALTIME: 60_000,
  BREADTH: 300_000,
  SENTIMENT: 3_600_000,
  HISTORICAL: 86_400_000,
  ECONOMIC: 86_400_000,
} as const

export const COLORS = {
  UP: '#00D4AA',
  DOWN: '#FF4757',
  UP_BG: 'rgba(0, 212, 170, 0.1)',
  DOWN_BG: 'rgba(255, 71, 87, 0.1)',
  CHART_GRID: '#2A2A2A',
  CHART_BG: '#141414',
  TEXT: '#ffffff',
  TEXT_MUTED: '#AAAAAA',
  BORDER: '#2A2A2A',
} as const

// Sprint 3 Additions
export const SECTOR_SYMBOLS = [
  'XLK', // Technology
  'XLV', // Health Care
  'XLF', // Financials
  'XLY', // Consumer Discretionary
  'XLC', // Communication Services
  'XLI', // Industrials
  'XLP', // Consumer Staples
  'XLE', // Energy
  'XLU', // Utilities
  'XLRE', // Real Estate
  'XLB', // Materials
] as const

export const SECTOR_LABELS: Record<string, string> = {
  'XLK': 'Technology',
  'XLV': 'Health Care',
  'XLF': 'Financials',
  'XLY': 'Cons Discretionary',
  'XLC': 'Comm Services',
  'XLI': 'Industrials',
  'XLP': 'Cons Staples',
  'XLE': 'Energy',
  'XLU': 'Utilities',
  'XLRE': 'Real Estate',
  'XLB': 'Materials',
}

export const COMMODITY_SYMBOLS = [
  'GC=F', // Gold
  'SI=F', // Silver
  'CL=F', // WTI Crude
  'BZ=F', // Brent Crude
  'NG=F', // Natural Gas
  'HG=F', // Copper
] as const

export const COMMODITY_LABELS: Record<string, string> = {
  'GC=F': 'Gold',
  'SI=F': 'Silver',
  'CL=F': 'WTI Crude',
  'BZ=F': 'Brent Crude',
  'NG=F': 'Natural Gas',
  'HG=F': 'Copper',
}

export const FOREX_SYMBOLS = [
  'EURUSD=X',
  'GBPUSD=X',
  'USDJPY=X',
  'AUDUSD=X',
  'USDCAD=X',
  'USDCHF=X',
  'DX-Y.NYB', // DXY
] as const

export const FOREX_LABELS: Record<string, string> = {
  'EURUSD=X': 'EUR/USD',
  'GBPUSD=X': 'GBP/USD',
  'USDJPY=X': 'USD/JPY',
  'AUDUSD=X': 'AUD/USD',
  'USDCAD=X': 'USD/CAD',
  'USDCHF=X': 'USD/CHF',
  'DX-Y.NYB': 'U.S. Dollar Index',
}
