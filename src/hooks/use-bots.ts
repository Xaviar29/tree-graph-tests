import { useQuery } from '@tanstack/react-query'

export interface BotSignal {
  status: string; action: string; confidence: number; reason: string
  leverage: number; entryPrice: number | null; takeProfit: number | null; stopLoss: number | null
  onTrade: boolean
}
export interface TradeRecord { date: string; action: 'buy' | 'sell'; entryPrice: number; exitPrice?: number; pnl?: number; roi?: number; reason: string; closed: boolean }
export interface BotOverview { tradesWon: number; tradesLoss: number; totalTrades: number; avgWin: number; avgLoss: number; totalPnl: number; effectiveness: number }
export interface BotProgression { profits: number[]; losses: number[]; dates: string[] }
export interface BotStats { sharpe: number; maxDrawdown: number; avgHoldingPeriod: number; winRate: number }
export interface BotData {
  name: string; label: string; signal: BotSignal; trades: TradeRecord[]
  overview: BotOverview; progression: BotProgression; stats: BotStats
  strategyDescription: string
}

export function useBots(symbol: string) {
  return useQuery({
    queryKey: ['tools', 'bots', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/tools/bots?symbol=${symbol}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch bot data')
      return (json.data ?? []) as BotData[]
    },
    refetchInterval: 60_000,
    retry: 2,
    staleTime: 30_000,
  })
}
