'use client'

import { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { TrenDiffChart } from '@/components/charts/trendiff-chart'
import { RiskCalculator } from '@/components/charts/risk-calculator'
import { CandlestickChart } from '@/components/charts/candlestick-chart'
import { BotSignals } from '@/components/charts/bot-signals'
import { BacktestEngine } from '@/components/charts/backtest-engine'
import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import type { OHLCV } from '@/types/market.types'

function generateTrenDiffData(symbol: string) {
  const data: { date: string; value: number; trend: number; signal: 'buy' | 'sell' | null }[] = []
  const now = new Date()
  let price = symbol === 'BTC' ? 65000 : symbol === 'ETH' ? 3500 : 150
  let trend = price
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    price *= 1 + (Math.random() - 0.5) * 0.025
    trend = trend * 0.94 + price * 0.06
    const crossAbove = price > trend && data.length > 0 && data[data.length - 1].value <= data[data.length - 1].trend
    const crossBelow = price < trend && data.length > 0 && data[data.length - 1].value >= data[data.length - 1].trend
    const signal = crossAbove ? 'buy' : crossBelow ? 'sell' : null
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(price),
      trend: Math.round(trend),
      signal,
    })
  }
  return data
}

function generateHistoricalData(symbol: string): OHLCV[] {
  const data: OHLCV[] = []
  const now = Math.floor(Date.now() / 1000)
  const basePrice = symbol === 'BTC' ? 65000 : symbol === 'ETH' ? 3500 : 150
  let price = basePrice
  for (let i = 364; i >= 0; i--) {
    const timestamp = now - i * 86400
    const volatility = price * 0.02
    const open = price
    const close = price * (1 + (Math.random() - 0.5) * 0.04)
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    price = close
    data.push({ timestamp, open, high, low, close, volume: Math.round(Math.random() * 10000 + 1000) })
  }
  return data
}

export default function ToolsPage() {
  const [tab, setTab] = useState('trendiff')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam) setTab(tabParam)
  }, [])
  const [symbol, setSymbol] = useState('BTC')
  const [histSymbol, setHistSymbol] = useState('BTC')
  const trenDiffData = useMemo(() => generateTrenDiffData(symbol), [symbol])
  const histData = useMemo(() => generateHistoricalData(histSymbol), [histSymbol])

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Tools & Indicators</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Technical analysis tools, risk calculator, and historical data explorer</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="trendiff">TrenDiff Indicator</TabsTrigger>
          <TabsTrigger value="riskcalc">Risk Calculator</TabsTrigger>
          <TabsTrigger value="historical">Historical Chart</TabsTrigger>
          <TabsTrigger value="bots">Bot Signals</TabsTrigger>
          <TabsTrigger value="backtest">Backtest Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="trendiff" className="space-y-5 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Symbol:</span>
            {['BTC', 'ETH', 'SOL'].map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                  symbol === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <ChartWrapper title={`TrenDiff — ${symbol}`} subtitle="Trend strength: green smoothed line. Cross above = buy, cross below = sell. Signal badges below chart." hint="TrenDiff identifies trend direction and strength using EMA-based calculations. When price crosses above the smoothed trend line = buy signal. Cross below = sell signal. More signals = stronger trend.">
            <TrenDiffChart data={trenDiffData} symbol={symbol} />
          </ChartWrapper>
        </TabsContent>

        <TabsContent value="riskcalc" className="space-y-5 mt-4">
          <ChartWrapper title="Risk Calculator" height={400} subtitle="Position sizing based on account balance and risk tolerance" hint="Position sizing calculator based on account balance and risk tolerance. Follows the 1% risk rule for proper money management.">
            <RiskCalculator />
          </ChartWrapper>
        </TabsContent>

        <TabsContent value="historical" className="space-y-5 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Symbol:</span>
            {['BTC', 'ETH', 'SOL'].map((s) => (
              <button
                key={s}
                onClick={() => setHistSymbol(s)}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                  histSymbol === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <ChartWrapper title={`Historical Price — ${histSymbol}`} subtitle="1 year daily candlestick data">
            <CandlestickChart data={histData} />
          </ChartWrapper>
        </TabsContent>
        <TabsContent value="bots" className="space-y-5 mt-4">
          <BotSignals />
        </TabsContent>
        <TabsContent value="backtest" className="space-y-5 mt-4">
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <BacktestEngine />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
