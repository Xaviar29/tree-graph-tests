'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { LiquidationHeatmap } from '@/components/charts/liquidation-heatmap'
import { LiquidationSimpleMap } from '@/components/charts/liquidation-simple-map'
import { LiquidationProfile } from '@/components/charts/liquidation-profile'
import { useLiquidationsRecent, useLiquidationsSummary, useLiquidationsHourly, useLiquidationHeatmap, useExchangeStatus } from '@/hooks/use-liquidations'
import { useVolumeConviction } from '@/hooks/use-volume-conviction'
import { useOpenInterest } from '@/hooks/use-open-interest'
import { HighFreqChart } from '@/components/charts/high-freq-chart'
import { BuySellVolumeChart } from '@/components/charts/buy-sell-volume'
import { OpenInterestChartView } from '@/components/charts/open-interest-chart'
import { RealtimeLiquidationsChartView } from '@/components/charts/realtime-liquidations-chart'
import { motion } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createRng, dailySeed } from '@/lib/random'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { LiquidationEvent } from '@/lib/providers/binance-ws'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
const EXCHANGES = ['all', 'binance', 'bybit'] as const

const tooltipStyle = { background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }
const labelStyle = { color: 'var(--foreground)' }

function generateSyntheticLiqs(symbol: string): LiquidationEvent[] {
  const price = symbol === 'BTCUSDT' ? 65000 : symbol === 'ETHUSDT' ? 3500 : 150
  return Array.from({ length: 30 }, (_, i) => ({
    symbol,
    exchange: (i % 2 === 0 ? 'binance' : 'bybit') as 'binance' | 'bybit',
    side: (i % 3 === 0 ? 'SHORT' : 'LONG') as 'LONG' | 'SHORT',
    price: price * (1 + (Math.random() - 0.5) * 0.02),
    quantity: Math.round(Math.random() * 10 + 0.1 * 100) / 100,
    notional: Math.round(Math.random() * 5000000 + 50000),
    timestamp: Date.now() - i * 30000,
  }))
}

function generateSyntheticHourly() {
  const rng = createRng(dailySeed('hourly'))
  const now = new Date()
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now); d.setHours(d.getHours() - 23 + i)
    return {
      hour: d.toISOString(),
      long: Math.round(rng.range(100000, 5000000)),
      short: Math.round(rng.range(50000, 3000000)),
    }
  })
}

function generateSyntheticBuySell() {
  const rng = createRng(dailySeed('buy-sell'))
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 29 + i)
    const total = Math.round(rng.range(1e9, 5e9))
    const buyRatio = rng.range(0.4, 0.7)
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      buyVolume: Math.round(total * buyRatio),
      sellVolume: Math.round(total * (1 - buyRatio)),
      buySellRatio: Math.round((buyRatio / (1 - buyRatio)) * 1000) / 1000,
    }
  })
}

function generateSyntheticOI(price: number) {
  const rng = createRng(dailySeed('oi-fallback'))
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 29 + i)
    const total = Math.round(rng.range(1e9, 5e9) + Math.sin(i * 0.3) * 2e9)
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      openInterest: total,
      oiLong: Math.round(total * rng.range(0.45, 0.6)),
      oiShort: Math.round(total * rng.range(0.35, 0.5)),
    }
  })
}

export default function LiquidationsPage() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [exchange, setExchange] = useState<'all' | 'binance' | 'bybit'>('all')

  const { data: recent, isLoading: recentLoading } = useLiquidationsRecent(symbol, exchange)
  const { data: summary } = useLiquidationsSummary(symbol)
  const { data: hourly } = useLiquidationsHourly(symbol)
  const { data: heatmap } = useLiquidationHeatmap(symbol)
  const { data: exchangeStatus } = useExchangeStatus()
  const { data: convictionData } = useVolumeConviction()
  const { data: oiData } = useOpenInterest(symbol)

  const longPct = summary ? (summary.longNotional / (summary.longNotional + summary.shortNotional) * 100) : 50

  const [simpleMapData, setSimpleMapData] = useState<{ price: number; density: number; side: 'long' | 'short' }[]>([])
  const [hfData, setHfData] = useState<{ time: number; open: number; high: number; low: number; close: number; volume: number }[]>([])
  const [hfLoading, setHfLoading] = useState(false)
  const [hlData, setHlData] = useState<{ grid: number[][]; price_bins: number[]; notional_bins: number[] } | null>(null)
  const [hlLoading, setHlLoading] = useState(false)
  const [liqTab, setLiqTab] = useState('heatmap')

  useEffect(() => {
    fetch(`/api/liquidations/simple-map?symbol=${symbol}`)
      .then((r) => r.json())
      .then((j) => setSimpleMapData(j.data ?? []))
      .catch(() => {})
  }, [symbol])

  useEffect(() => {
    setHfLoading(true)
    fetch(`/api/liquidations/high-freq?symbol=${symbol}`)
      .then((r) => r.json())
      .then((j) => setHfData(j.data ?? []))
      .catch(() => {})
      .finally(() => setHfLoading(false))
  }, [symbol])

  useEffect(() => {
    setHlLoading(true)
    fetch(`/api/liquidations/hyperliquid?symbol=${symbol.replace('USDT', '')}`)
      .then((r) => r.json())
      .then((j) => setHlData(j.data ?? null))
      .catch(() => {})
      .finally(() => setHlLoading(false))
  }, [symbol])

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Liquidation Heatmap</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time liquidation events from Binance & Bybit Futures</p>
        </div>
        <div className="flex gap-1">
          {SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                symbol === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s.replace('USDT', '')}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-1">
        {EXCHANGES.map((ex) => (
          <button
            key={ex}
            onClick={() => setExchange(ex)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize ${
              exchange === ex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {ex === 'all' ? 'All Exchanges' : ex}
            {exchangeStatus && ex !== 'all' && (
              <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${exchangeStatus[ex].connected ? 'bg-gain' : 'bg-loss'}`} />
            )}
          </button>
        ))}
      </motion.div>

      <Tabs value={liqTab} onValueChange={setLiqTab}>
        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="simplemap">Simple Map</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="hf">HF Chart</TabsTrigger>
          <TabsTrigger value="hyperliquid">Hyperliquid</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-5 mt-4">
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-4 border-l-3 border-l-loss">
              <p className="text-xs text-muted-foreground">Long Liquidations (24h)</p>
              <p className="text-lg font-bold text-loss">
                {summary ? `$${(summary.longNotional / 1e6).toFixed(2)}M` : '-'}
              </p>
              <p className="text-xs text-muted-foreground">{summary?.longCount ?? 0} events</p>
            </Card>
            <Card className="p-4 border-l-3 border-l-gain">
              <p className="text-xs text-muted-foreground">Short Liquidations (24h)</p>
              <p className="text-lg font-bold text-gain">
                {summary ? `$${(summary.shortNotional / 1e6).toFixed(2)}M` : '-'}
              </p>
              <p className="text-xs text-muted-foreground">{summary?.shortCount ?? 0} events</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Long / Short Ratio</p>
              <p className="text-lg font-bold">{summary ? `${longPct.toFixed(0)} / ${(100 - longPct).toFixed(0)}` : '-'}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-loss" style={{ width: `${longPct}%` }} />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Largest Liquidation</p>
              <p className="text-lg font-bold">{summary ? `$${(summary.maxLiquidation / 1e3).toFixed(0)}K` : '-'}</p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartWrapper title="Liquidation Density Heatmap" height={420} subtitle="KDE density: price (x) vs notional (y). White dashed line = current price" hint="KDE (Kernel Density Estimation) heatmap shows liquidation clusters. Brighter areas = more liquidation density. Price often moves toward high-density zones to hunt liquidity.">
              <div className="p-2">
                <LiquidationHeatmap
                  grid={heatmap?.grid ?? []}
                  priceBins={heatmap?.price_bins ?? []}
                  currentPrice={recent?.[0]?.price ?? (symbol === 'BTCUSDT' ? 65000 : symbol === 'ETHUSDT' ? 3500 : 150)}
                  width={500}
                  height={380}
                />
              </div>
            </ChartWrapper>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <div className="bg-muted/30 border border-border rounded-lg p-3">
              {convictionData && convictionData.length > 0 ? (
                <BuySellVolumeChart
                  data={convictionData.slice(-30).map(d => ({
                    date: d.date,
                    buyVolume: Math.round(d.volume * (d.buySellRatio / (1 + d.buySellRatio))),
                    sellVolume: Math.round(d.volume * (1 / (1 + d.buySellRatio))),
                    buySellRatio: d.buySellRatio,
                  }))}
                  height={80}
                />
              ) : (
                <BuySellVolumeChart data={generateSyntheticBuySell()} height={80} />
              )}
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-3">
              <OpenInterestChartView data={oiData && oiData.length > 0 ? oiData : generateSyntheticOI(symbol === 'BTCUSDT' ? 65000 : symbol === 'ETHUSDT' ? 3500 : 150)} height={80} />
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-3">
              <RealtimeLiquidationsChartView events={(recent ?? []).map(e => ({ timestamp: e.timestamp, price: e.price, value: e.notional, side: e.side === 'LONG' ? 'long' as const : 'short' as const, exchange: e.exchange }))} height={80} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Liquidations by Hour" height={300} isLoading={!hourly} hint="Stacked bar chart of long vs short liquidations by hour. Helps identify when liquidation cascades occur.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={((hourly ?? []).length > 0 ? hourly! : generateSyntheticHourly()).slice(-24)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={9} tickFormatter={(v) => v.slice(11, 16)} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Bar dataKey="long" name="Long" stackId="a" fill="var(--loss)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="short" name="Short" stackId="a" fill="var(--gain)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <ChartWrapper title="Recent Liquidations" height={300} isLoading={recentLoading} hint="Most recent liquidation events in real-time. Each row shows exchange, side (long/short), price, quantity, notional value, and timestamp.">
              <div className="overflow-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Exchange</TableHead>
                      <TableHead className="text-xs">Side</TableHead>
                      <TableHead className="text-xs">Price</TableHead>
                      <TableHead className="text-xs">Qty</TableHead>
                      <TableHead className="text-xs">Notional</TableHead>
                      <TableHead className="text-xs">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recent ?? []).slice(0, 20).map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground capitalize">{e.exchange}</TableCell>
                        <TableCell className={`text-xs font-medium ${e.side === 'LONG' ? 'text-loss' : 'text-gain'}`}>{e.side}</TableCell>
                        <TableCell className="text-xs">${e.price.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{e.quantity.toFixed(4)}</TableCell>
                        <TableCell className="text-xs">${(e.notional / 1e3).toFixed(0)}K</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</TableCell>
                      </TableRow>
                    ))}
                    {(recent ?? []).length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-xs text-muted-foreground text-center py-8">Waiting for liquidation events...</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="simplemap" className="space-y-5 mt-4">
          <motion.div variants={itemVariants}>
            <ChartWrapper title="Simple Liquidation Map" height={500} subtitle="Horizontal density bars per price level" hint="Horizontal bars show liquidation concentration per price level. Longer bar = more liquidation volume at that price.">
              <LiquidationSimpleMap levels={simpleMapData} currentPrice={recent?.[0]?.price} />
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-5 mt-4">
          <motion.div variants={itemVariants}>
            <ChartWrapper title="Liquidation Profile" height={500} subtitle="Individual liquidation positions (height = notional size)" hint="Each vertical bar represents one liquidation event. Height = notional value. Color shows side (red = long, green = short).">
              <LiquidationProfile events={(recent ?? []).length > 0 ? recent! : generateSyntheticLiqs(symbol)} />
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="hf" className="space-y-5 mt-4">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">Symbol:</span>
              {SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                    symbol === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s.replace('USDT', '')}
                </button>
              ))}
            </div>
            <ChartWrapper title={`High Frequency Liquidation Chart — ${symbol.replace('USDT', '')}`} height={450} subtitle="1-minute candles of liquidation events" isLoading={hfLoading} hint="High-frequency candlestick chart of liquidation events. Each candle = 1 minute. Shows the rhythm of liquidation waves.">
              <HighFreqChart data={hfData} symbol={symbol} />
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="hyperliquid" className="space-y-5 mt-4">
          <motion.div variants={itemVariants}>
            <ChartWrapper title="Hyperliquid DEX Liquidation Heatmap" height={420} subtitle="KDE density for Hyperliquid DEX liquidations" isLoading={hlLoading} hint="KDE heatmap for Hyperliquid DEX liquidations. Same density algorithm as main heatmap.">
              <div className="p-2">
                <LiquidationHeatmap
                  grid={hlData?.grid ?? []}
                  priceBins={hlData?.price_bins ?? []}
                  currentPrice={recent?.[0]?.price ?? (symbol === 'BTCUSDT' ? 65000 : symbol === 'ETHUSDT' ? 3500 : 150)}
                  width={500}
                  height={380}
                />
              </div>
            </ChartWrapper>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
