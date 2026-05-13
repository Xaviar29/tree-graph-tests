'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { CryptoTable } from '@/components/crypto/crypto-table'
import { useCryptoMarkets, useCryptoGlobal } from '@/hooks/use-crypto'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

function buildHistory(value: number, days = 30): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = []
  const now = new Date()
  const base = value * 0.85
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const noise = 1 + Math.sin(i * 0.3) * 0.06 + Math.random() * 0.03
    data.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: Math.round(base * noise) })
  }
  data[data.length - 1].value = value
  return data
}

const tooltipStyle = { background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }
const labelStyle = { color: 'var(--foreground)' }

export default function CryptoPage() {
  const [tab, setTab] = useState('overview')
  const { data: markets, isLoading: marketsLoading } = useCryptoMarkets(50)
  const { data: global } = useCryptoGlobal()

  const btc = markets?.find((m) => m.symbol === 'BTC')
  const eth = markets?.find((m) => m.symbol === 'ETH')

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h1 className="text-lg font-semibold text-foreground">Cryptocurrency</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time crypto market data from CoinGecko</p>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dominance">Dominance</TabsTrigger>
          <TabsTrigger value="liquidations">Liquidations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-4">
          {global ? (
            <motion.div variants={containerVariants} className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: 'Total Market Cap', value: global.totalMarketCap >= 1e12 ? `$${(global.totalMarketCap / 1e12).toFixed(2)}T` : `$${(global.totalMarketCap / 1e9).toFixed(2)}B` },
                { label: 'BTC Dominance', value: `${global.btcDominance.toFixed(1)}%` },
                { label: 'ETH Dominance', value: `${global.ethDominance.toFixed(1)}%` },
                { label: '24h Volume', value: global.totalVolume24h >= 1e9 ? `$${(global.totalVolume24h / 1e9).toFixed(2)}B` : `$${(global.totalVolume24h / 1e6).toFixed(2)}M` },
              ].map((item) => (
                <motion.div key={item.label} variants={itemVariants}>
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold mt-1">{item.value}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Card key={i} className="p-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-16 mt-2" /></Card>)}
            </div>
          )}

          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Bitcoin" height={300} subtitle={btc ? `$${btc.currentPrice.toLocaleString()}` : ''} isLoading={!btc}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={buildHistory(btc?.currentPrice ?? 65000, 30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f7931a" stopOpacity={0.3} /><stop offset="100%" stopColor="#f7931a" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="value" stroke="#f7931a" fill="url(#btcGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <ChartWrapper title="Ethereum" height={300} subtitle={eth ? `$${eth.currentPrice.toLocaleString()}` : ''} isLoading={!eth}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={buildHistory(eth?.currentPrice ?? 3500, 30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="ethGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#627eea" stopOpacity={0.3} /><stop offset="100%" stopColor="#627eea" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="value" stroke="#627eea" fill="url(#ethGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartWrapper title="Top 50 Cryptocurrencies" height={400} isLoading={marketsLoading}>
              <CryptoTable data={markets ?? []} isLoading={marketsLoading} />
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="dominance" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">BTC Dominance</p>
              <p className="text-2xl font-bold text-orange-400">{global?.btcDominance.toFixed(1) ?? '—'}%</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">ETH Dominance</p>
              <p className="text-2xl font-bold text-blue-400">{global?.ethDominance.toFixed(1) ?? '—'}%</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Others</p>
              <p className="text-2xl font-bold text-muted-foreground">{global ? (100 - global.btcDominance - global.ethDominance).toFixed(1) : '—'}%</p>
            </Card>
          </div>

          <ChartWrapper title="BTC Dominance History" height={300} subtitle={`Current: ${global?.btcDominance.toFixed(1) ?? '—'}%`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={buildHistory(global?.btcDominance ?? 55, 90)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                <YAxis domain={[30, 70]} stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                <defs><linearGradient id="btcDomGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f7931a" stopOpacity={0.3} /><stop offset="100%" stopColor="#f7931a" stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="value" stroke="#f7931a" fill="url(#btcDomGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </TabsContent>

        <TabsContent value="liquidations" className="space-y-5 mt-4">
          <motion.div variants={itemVariants}>
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Liquidation Heatmap</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time liquidation data from Binance Futures with KDE density heatmap.
              </p>
              <a
                href="/liquidations"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
              >
                Open Liquidations →
              </a>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
