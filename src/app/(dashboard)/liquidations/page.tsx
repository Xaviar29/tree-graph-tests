'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { LiquidationHeatmap } from '@/components/charts/liquidation-heatmap'
import { useLiquidationsRecent, useLiquidationsSummary, useLiquidationsHourly, useLiquidationHeatmap } from '@/hooks/use-liquidations'
import { motion } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']

const tooltipStyle = { background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }
const labelStyle = { color: 'var(--foreground)' }

export default function LiquidationsPage() {
  const [symbol, setSymbol] = useState('BTCUSDT')

  const { data: recent, isLoading: recentLoading } = useLiquidationsRecent(symbol)
  const { data: summary } = useLiquidationsSummary(symbol)
  const { data: hourly } = useLiquidationsHourly(symbol)
  const { data: heatmap } = useLiquidationHeatmap(symbol)

  const longPct = summary ? (summary.longNotional / (summary.longNotional + summary.shortNotional) * 100) : 50

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Liquidation Heatmap</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time liquidation events from Binance Futures</p>
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
        <ChartWrapper title="Liquidation Density Heatmap" height={420} subtitle="KDE density: price (x) vs notional (y). White dashed line = current price">
          <div className="p-2">
            <LiquidationHeatmap
              grid={heatmap?.grid ?? []}
              priceBins={heatmap?.price_bins ?? []}
              currentPrice={recent?.[0]?.price}
              width={500}
              height={380}
            />
          </div>
        </ChartWrapper>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper title="Liquidations by Hour" height={300} isLoading={!hourly}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(hourly ?? []).slice(-24)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={9} tickFormatter={(v) => v.slice(11, 16)} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
              <Bar dataKey="long" name="Long" stackId="a" fill="var(--loss)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="short" name="Short" stackId="a" fill="var(--gain)" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Recent Liquidations" height={300} isLoading={recentLoading}>
          <div className="overflow-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell className={`text-xs font-medium ${e.side === 'LONG' ? 'text-loss' : 'text-gain'}`}>{e.side}</TableCell>
                    <TableCell className="text-xs">${e.price.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{e.quantity.toFixed(4)}</TableCell>
                    <TableCell className="text-xs">${(e.notional / 1e3).toFixed(0)}K</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
                {(recent ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-xs text-muted-foreground text-center py-8">Waiting for liquidation events...</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ChartWrapper>
      </motion.div>
    </motion.div>
  )
}
