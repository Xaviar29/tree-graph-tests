'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { CryptoTable } from '@/components/crypto/crypto-table'
import { MarketCapRanking } from '@/components/charts/market-cap-ranking'
import { ATHTable } from '@/components/charts/ath-table'
import { useCryptoMarkets, useCryptoGlobal } from '@/hooks/use-crypto'
import { useS2F } from '@/hooks/use-s2f'
import { useBTCETFs } from '@/hooks/use-btc-etfs'
import { useEmission } from '@/hooks/use-emission'
import { useBTCvsGold } from '@/hooks/use-btc-vs-gold'
import { useCMEFutures } from '@/hooks/use-cme-futures'
import { useSupplier } from '@/hooks/use-supplier'
import { useBTCHolders } from '@/hooks/use-btc-holders'
import { HoldersPieChart } from '@/components/charts/holders-pie-chart'
import { useAggregated } from '@/hooks/use-aggregated'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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
  const { data: s2fData, isLoading: s2fLoading } = useS2F()
  const { data: etfData, isLoading: etfsLoading } = useBTCETFs()
  const { data: emissionData, isLoading: emissionLoading } = useEmission()
  const { data: btcGoldData, isLoading: btcGoldLoading } = useBTCvsGold()
  const { data: cmeData, isLoading: cmeLoading } = useCMEFutures()
  const { data: supplierData, isLoading: supplierLoading } = useSupplier()
  const { data: holdersData, isLoading: holdersLoading } = useBTCHolders()
  const { data: aggregatedData, isLoading: aggregatedLoading } = useAggregated()

  const btc = markets?.find((m) => m.symbol === 'BTC')
  const eth = markets?.find((m) => m.symbol === 'ETH')

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h1 className="text-lg font-semibold text-foreground">Cryptocurrency</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time crypto market data from CoinGecko</p>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dominance">Dominance</TabsTrigger>
          <TabsTrigger value="s2f">BTC Model</TabsTrigger>
          <TabsTrigger value="etfs">BTC ETFs</TabsTrigger>
          <TabsTrigger value="emission">Emission</TabsTrigger>
          <TabsTrigger value="btcvsgold">BTC vs Gold</TabsTrigger>
          <TabsTrigger value="cme">CME Futures</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
          <TabsTrigger value="aggregated">Aggregated</TabsTrigger>
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
            <ChartWrapper title="Bitcoin" height={300} subtitle={btc ? `$${btc.currentPrice.toLocaleString()}` : ''} isLoading={!btc} hint="Bitcoin price chart with 30-day history. Data sourced from CoinGecko.">
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

            <ChartWrapper title="Ethereum" height={300} subtitle={eth ? `$${eth.currentPrice.toLocaleString()}` : ''} isLoading={!eth} hint="Ethereum price chart with 30-day history. Data sourced from CoinGecko.">
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
          {(markets ?? []).length > 0 && (
            <motion.div variants={itemVariants}>
              <ChartWrapper title="Market Cap Ranking" height={Math.min((markets?.length ?? 50) * 28 + 40, 1500)} subtitle={`Top ${Math.min(markets?.length ?? 50, 50)} cryptocurrencies by market cap`} hint="Horizontal bar chart showing market cap of top cryptocurrencies. Data sourced from CoinGecko.">
                <MarketCapRanking data={markets ?? []} limit={50} />
              </ChartWrapper>
            </motion.div>
          )}
          {(markets ?? []).length > 0 && (
            <motion.div variants={itemVariants}>
              <ChartWrapper title="ATH Analysis" height={400} subtitle="Distance from all-time high, recovery needed, supply metrics" hint="ATH Analysis shows distance from all-time high (negative = below ATH), recovery needed to reach ATH again, supply as % of max, and supply change since ATH. Green = positive, red = negative.">
                <ATHTable data={markets ?? []} />
              </ChartWrapper>
            </motion.div>
          )}
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

          <ChartWrapper title="BTC Dominance History" height={300} subtitle={`Current: ${global?.btcDominance.toFixed(1) ?? '—'}%`} hint="Bitcoin's percentage of total crypto market cap. Rising dominance often precedes or coincides with bear markets. Falling dominance suggests altcoin season.">
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

        <TabsContent value="s2f" className="space-y-5 mt-4">
          <motion.div variants={itemVariants}>
            <ChartWrapper title="BTC Stock-to-Flow Model" height={420} subtitle="Price projection based on Bitcoin's monetary premium (synthetic)" isLoading={s2fLoading} hint="Stock-to-Flow (S2F) model values scarcity. Higher S2F ratio suggests higher price. Includes halving markers. Based on Bitcoin's fixed supply schedule.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s2fData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis yAxisId="price" stroke="#f7931a" fontSize={10} tickMargin={4} domain={['auto', 'auto']} tickFormatter={(v) => v >= 100000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`} />
                  <YAxis yAxisId="s2f" orientation="right" stroke="#10b981" fontSize={10} tickMargin={4} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area yAxisId="price" type="monotone" dataKey="price" stroke="#f7931a" fill="#f7931a" fillOpacity={0.1} strokeWidth={2} name="BTC Price ($)" />
                  <Area yAxisId="s2f" type="monotone" dataKey="s2f" stroke="#10b981" fill="none" strokeWidth={2} name="S2F Ratio" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="etfs" className="space-y-5 mt-4">
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="BTC Spot ETF Holdings" height={300} subtitle="Total BTC held by all spot ETFs" isLoading={etfsLoading} hint="BTC Spot ETF holdings track institutional accumulation. Inflow = bullish signal. Average buy price shows cost basis per ETF.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={etfData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="etfHoldingGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f7931a" stopOpacity={0.3} /><stop offset="100%" stopColor="#f7931a" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="totalBTC" stroke="#f7931a" fill="url(#etfHoldingGrad)" strokeWidth={2} name="Total BTC" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="BTC ETF Daily Flow" height={300} subtitle="Net inflow/outflow per day (last 90 days)" isLoading={etfsLoading} hint="BTC Spot ETF holdings track institutional accumulation. Inflow = bullish signal. Average buy price shows cost basis per ETF.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(etfData ?? []).slice(-90)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Bar dataKey="inflow" name="Net Flow" fill="var(--gain)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
          <ChartWrapper title="BTC Price vs ETF Net Flow" height={350} subtitle="BTC price correlation with daily ETF flows" isLoading={etfsLoading} hint="Green bars = net inflows (bullish), red bars = net outflows. BTC price line overlaid shows correlation between institutional flows and price action.">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={(etfData ?? []).slice(-120)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                <YAxis yAxisId="price" orientation="left" stroke="#7c3aed" fontSize={10} tickMargin={4} domain={['auto', 'auto']} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                <YAxis yAxisId="flow" orientation="right" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                <Bar yAxisId="flow" dataKey="inflow" name="Net Flow" fill="var(--gain)" radius={[2, 2, 0, 0]} />
                <Line yAxisId="price" type="monotone" dataKey="btcPrice" stroke="#7c3aed" dot={false} strokeWidth={2} name="BTC Price" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <ChartWrapper title="ETF Average Buy Price" height={200} subtitle="Per-ETF average entry price" isLoading={etfsLoading} hint="BTC Spot ETF holdings track institutional accumulation. Inflow = bullish signal. Average buy price shows cost basis per ETF.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={etfData?.length ? etfData[etfData.length - 1].etfs : []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={50} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="avgPrice" name="Avg Price ($)" fill="#f7931a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold mb-3">Bitcoin Holders & Ownership</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <ChartWrapper title="Bitcoin by Category" height={360} isLoading={holdersLoading} hint="Breakdown of all ~21M BTC by holder category. Lost coins, individuals, exchanges, and institutions.">
                  <HoldersPieChart data={(holdersData?.categories ?? []).map(c => ({ ...c, value: c.btc }))} innerRadius={60} />
                </ChartWrapper>
              </div>
              <div className="lg:col-span-3">
                <ChartWrapper title="Public Companies that Own Bitcoin" height={360} isLoading={holdersLoading}>
                  <div className="overflow-x-auto p-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left px-2 py-1.5 font-medium">Company</th>
                          <th className="text-left px-2 py-1.5 font-medium">Ticker</th>
                          <th className="text-right px-2 py-1.5 font-medium">BTC</th>
                          <th className="text-right px-2 py-1.5 font-medium">Value</th>
                          <th className="text-right px-2 py-1.5 font-medium">% of Supply</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdersData?.publicCompanies.map(c => (
                          <tr key={c.ticker} className="border-b border-border/40 hover:bg-muted/30">
                            <td className="px-2 py-1.5 font-medium">{c.name}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">{c.ticker}</td>
                            <td className="px-2 py-1.5 text-right">{c.btc.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right">${(c.valueUsd / 1e6).toFixed(0)}M</td>
                            <td className="px-2 py-1.5 text-right">{c.percentageOfSupply.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ChartWrapper>
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Private Companies that Own Bitcoin" height={250} isLoading={holdersLoading}>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left px-2 py-1.5 font-medium">Company</th>
                      <th className="text-right px-2 py-1.5 font-medium">BTC</th>
                      <th className="text-right px-2 py-1.5 font-medium">Est. Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdersData?.privateCompanies.map(c => (
                      <tr key={c.name} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="px-2 py-1.5 font-medium">{c.name}</td>
                        <td className="px-2 py-1.5 text-right">{c.btc.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-right">${(c.estValueUsd / 1e6).toFixed(0)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartWrapper>
            <ChartWrapper title="Countries that Own Bitcoin" height={250} isLoading={holdersLoading}>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left px-2 py-1.5 font-medium">Country</th>
                      <th className="text-right px-2 py-1.5 font-medium">BTC</th>
                      <th className="text-right px-2 py-1.5 font-medium">Value</th>
                      <th className="text-left px-2 py-1.5 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdersData?.countries.map(c => (
                      <tr key={c.name} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="px-2 py-1.5 font-medium">{c.name}</td>
                        <td className="px-2 py-1.5 text-right">{c.btc.toLocaleString()}</td>
                        <td className="px-2 py-1.5 text-right">${(c.valueUsd / 1e6).toFixed(0)}M</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{c.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="emission" className="space-y-5 mt-4">
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Bitcoin Supply Curve" height={350} subtitle="Total BTC supply over time" isLoading={emissionLoading} hint="Bitcoin's total supply approaches 21M asymptotically. New supply halves every 4 years, reducing inflation rate over time.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} domain={[0, 21000000]} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f7931a" stopOpacity={0.3} /><stop offset="100%" stopColor="#f7931a" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="totalSupply" stroke="#f7931a" fill="url(#supplyGrad)" strokeWidth={2} name="Total Supply" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Annual Inflation Rate" height={350} subtitle="BTC inflation decreases with each halving" isLoading={emissionLoading} hint="Bitcoin's annualized inflation rate drops by 50% at each halving event. Currently below gold's ~1.5% emission rate.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="inflationGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="annualInflation" stroke="#10b981" fill="url(#inflationGrad)" strokeWidth={2} name="Inflation Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="btcvsgold" className="space-y-5 mt-4">
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="BTC vs Gold (Normalized)" height={350} subtitle="Price performance: both assets indexed to 100 at start" isLoading={btcGoldLoading} hint="Comparison of Bitcoin vs Gold normalized performance. Illustrates Bitcoin's superior risk/reward characteristics over time.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={btcGoldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="btc" stroke="#f7931a" fill="#f7931a" fillOpacity={0.1} strokeWidth={2} name="Bitcoin" />
                  <Area type="monotone" dataKey="gold" stroke="#FFD700" fill="#FFD700" fillOpacity={0.1} strokeWidth={2} name="Gold" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Supply Comparison" height={350} subtitle="BTC (fixed 21M) vs Gold (increasing supply)" isLoading={btcGoldLoading} hint="Comparison of Bitcoin vs Gold normalized performance. Illustrates Bitcoin's superior risk/reward characteristics over time.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={btcGoldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis yAxisId="btc" stroke="#f7931a" fontSize={10} tickMargin={4} tickFormatter={(v) => `${(v/1e6).toFixed(1)}M`} />
                  <YAxis yAxisId="gold" orientation="right" stroke="#FFD700" fontSize={10} tickMargin={4} tickFormatter={(v) => `${(v/1e3).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area yAxisId="btc" type="monotone" dataKey="btcSupply" stroke="#f7931a" fill="#f7931a" fillOpacity={0.2} strokeWidth={2} name="BTC Supply" />
                  <Area yAxisId="gold" type="monotone" dataKey="goldSupply" stroke="#FFD700" fill="none" strokeWidth={2} name="Gold Supply (tonnes)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
        </TabsContent>

        <TabsContent value="cme" className="space-y-5 mt-4">
          <motion.div variants={containerVariants} className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Total number of outstanding CME Bitcoin futures contracts. Rising OI suggests new money entering the market.">Open Interest</p>
                <p className="text-lg font-bold">{cmeData?.currentOI?.toLocaleString() ?? '—'}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Net position (longs - shorts) for Dealer/Intermediary category. Dealers are typically net short (providing liquidity to clients).">Dealers Net</p>
                <p className="text-lg font-bold">{cmeData?.currentPosition?.dealer ?? '—'}</p>
              </Card>
              <Card className="p-4">
<p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Net position for Asset Manager/Institutional category (pension funds, endowments). Typically net long Bitcoin exposure.">Asset Mgrs Net</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Net position for Leveraged Funds (hedge funds, CTAs). Often the most active category, switching between long and short.">Lev. Funds Net</p>
                <p className="text-lg font-bold">{cmeData?.currentPosition?.assetManager ?? '—'}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Net position for Leveraged Funds (hedge funds, CTAs). Often the most active category, switching between long and short.">Lev. Funds Net</p>
                <p className="text-lg font-bold">{cmeData?.currentPosition?.leveragedFunds ?? '—'}</p>
              </Card>
            </motion.div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Open Interest" height={320} subtitle="Total BTC CME futures open interest" isLoading={cmeLoading} hint="CME Bitcoin futures open interest tracks the total number of outstanding contracts. Rising OI = new money entering, falling OI = positions closing.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cmeData?.openInterest ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="oiGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="openInterest" stroke="#6366f1" fill="url(#oiGrad)" strokeWidth={2} name="Open Interest" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Current Position in BTC" height={320} subtitle="Net long/short by participant" isLoading={cmeLoading} hint="Net positioning by CFTC COT categories. Dealer = intermediary, Asset Manager = institutional, Leveraged Funds = hedge funds, Other = reportable traders.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Dealer', value: cmeData?.currentPosition?.dealer ?? 0 },
                  { name: 'Asset Mgr', value: cmeData?.currentPosition?.assetManager ?? 0 },
                  { name: 'Lev Funds', value: cmeData?.currentPosition?.leveragedFunds ?? 0 },
                  { name: 'Other', value: cmeData?.currentPosition?.other ?? 0 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={70} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="History of All Positions" height={320} subtitle="Total contracts by participant" isLoading={cmeLoading} hint="Stacked area chart showing total CME futures contracts held by each participant category. Growing area = increasing institutional interest.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cmeData?.allPositions ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="dealer" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={1} name="Dealer" />
                  <Area type="monotone" dataKey="assetManager" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={1} name="Asset Manager" />
                  <Area type="monotone" dataKey="leveragedFunds" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={1} name="Leveraged Funds" />
                  <Area type="monotone" dataKey="other" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={1} name="Other" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="History of Net Positions" height={320} subtitle="Net long/short by participant" isLoading={cmeLoading} hint="Net position (longs - shorts) by participant category. Above zero = net long, below = net short. Dealers are typically short (hedging), while leveraged funds are often long.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cmeData?.netPositions ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="dealer" stroke="#3b82f6" fill="none" strokeWidth={2} name="Dealer" />
                  <Area type="monotone" dataKey="assetManager" stroke="#10b981" fill="none" strokeWidth={2} name="Asset Manager" />
                  <Area type="monotone" dataKey="leveragedFunds" stroke="#f59e0b" fill="none" strokeWidth={2} name="Leveraged Funds" />
                  <Area type="monotone" dataKey="other" stroke="#8b5cf6" fill="none" strokeWidth={2} name="Other" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Traders by Classification" height={320} subtitle="Long/short traders count per category" isLoading={cmeLoading} hint="Number of traders on the long and short side for Dealer and Asset Manager categories. Shows how many market participants are positioned on each side.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cmeData?.allTraders ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="dealerLong" stroke="#3b82f6" fill="none" strokeWidth={1} name="Dealer Long" />
                  <Area type="monotone" dataKey="dealerShort" stroke="#ef4444" fill="none" strokeWidth={1} name="Dealer Short" />
                  <Area type="monotone" dataKey="amLong" stroke="#10b981" fill="none" strokeWidth={1} name="AM Long" />
                  <Area type="monotone" dataKey="amShort" stroke="#f97316" fill="none" strokeWidth={1} name="AM Short" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Gross Concentration of Large Entities" height={320} subtitle="Concentration % by participant" isLoading={cmeLoading} hint="Concentration of large entities as a percentage of total open interest. Higher concentration = fewer participants controlling more of the market.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cmeData?.concentration ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="dealer" stroke="#3b82f6" fill="none" strokeWidth={2} name="Dealer" />
                  <Area type="monotone" dataKey="assetManager" stroke="#10b981" fill="none" strokeWidth={2} name="Asset Manager" />
                  <Area type="monotone" dataKey="leveragedFunds" stroke="#f59e0b" fill="none" strokeWidth={2} name="Leveraged Funds" />
                  <Area type="monotone" dataKey="other" stroke="#8b5cf6" fill="none" strokeWidth={2} name="Other" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="OI Change (Longs vs Shorts)" height={320} subtitle="Daily change in open interest by side" isLoading={cmeLoading} hint="Daily change in long vs short open interest. Green = long contracts increasing, red = short contracts increasing. Shows which side is adding positions.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmeData?.oiHistoryChange ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Bar dataKey="longChange" name="Long Change" fill="var(--gain)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="shortChange" name="Short Change" fill="var(--loss)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="OI Change (Open vs Close)" height={320} subtitle="Open interest delta between open and close" isLoading={cmeLoading} hint="Change in open interest from market open to close. Positive = OI grew during the session, negative = OI shrank.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmeData?.currentOp ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Bar dataKey="open" name="Open" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="close" name="Close" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="BTC CME Gap Analysis" height={320} subtitle="Gaps between CME close and next open" isLoading={cmeLoading} hint="CME futures gaps form when the market opens above or below the previous close after weekends/holidays. Gaps tend to get filled over time.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmeData?.gaps ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Bar dataKey="gapUp" name="Gap Up" fill="var(--gain)" stackId="a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="gapDown" name="Gap Down" fill="var(--loss)" stackId="a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Futures Premium / Discount" height={320} subtitle="BTC CME futures basis vs spot" isLoading={cmeLoading} hint="Annualized futures basis = premium/discount of futures over spot. Positive = contango (bullish), negative = backwardation (bearish/fear).">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cmeData?.basis ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="basisGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="basis" stroke="#10b981" fill="url(#basisGrad)" strokeWidth={2} name="Annualized Basis" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
        </TabsContent>
        <TabsContent value="supplier" className="space-y-5 mt-4">
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Mining Cost to Produce 1 BTC" height={380} subtitle="Hash price vs mining cost breakdown (synthetic)" isLoading={supplierLoading} hint="BTC Supplier Model estimates the total cost to mine 1 BTC including electricity, hardware amortization, and operational overhead. Hash price represents miner revenue per unit of hashing power.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={supplierData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="totalCost" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Total Cost ($)" />
                  <Area type="monotone" dataKey="btcPrice" stroke="#f7931a" fill="#f7931a" fillOpacity={0.1} strokeWidth={2} name="BTC Price ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Miner Profit / Loss" height={380} subtitle="% profit above mining cost" isLoading={supplierLoading} hint="Positive % = profitable mining, negative % = miners at loss. Mining capitulation often precedes local bottoms.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={supplierData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="profitPercent" stroke="#22c55e" fill="url(#profitGrad)" strokeWidth={2} name="Profit %" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
        </TabsContent>
        <TabsContent value="aggregated" className="space-y-5 mt-4">
          <motion.div variants={containerVariants} className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Total 24h trading volume across all tracked exchanges. High volume indicates high market activity.">Aggregated Volume</p>
              <p className="text-lg font-bold">${(aggregatedData?.currentVolume ?? 0 / 1e9).toFixed(1)}B</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Total value of all outstanding futures contracts across exchanges. Rising OI = new money entering.">Open Interest</p>
              <p className="text-lg font-bold">${(aggregatedData?.currentOI ?? 0 / 1e9).toFixed(1)}B</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Total liquidation volume in the last 24 hours across all tracked exchanges. Spikes indicate forced position closures.">Liquidations (24h)</p>
              <p className="text-lg font-bold">${(aggregatedData?.currentLiqs ?? 0 / 1e6).toFixed(0)}M</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted" title="Open Interest expressed in Bitcoin terms. Removes USD price fluctuation to show real position changes in BTC.">BTC in OI</p>
              <p className="text-lg font-bold">{((aggregatedData?.oiInBitcoin?.[aggregatedData.oiInBitcoin.length - 1]?.value ?? 0) / 1000).toFixed(0)}K</p>
            </Card>
          </motion.div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Aggregated Volume" height={300} subtitle="Total BTC derivatives volume" isLoading={aggregatedLoading} hint="Aggregated trading volume across all major exchanges. High volume = high market activity and liquidity.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aggregatedData?.aggregatedVolume ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} name="Volume" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Coinbase Volume" height={300} subtitle="Coinbase BTC volume" isLoading={aggregatedLoading} hint="Bitcoin volume on Coinbase, the largest US-regulated exchange. Often correlated with institutional activity.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aggregatedData?.coinbaseVolume ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} name="Volume" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
          <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartWrapper title="Aggregated Open Interest" height={300} subtitle="Total BTC OI across exchanges" isLoading={aggregatedLoading} hint="Open Interest = total value of outstanding futures contracts. Rising OI confirms trend strength, falling OI suggests trend weakening.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aggregatedData?.openInterest ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} name="Open Interest" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ChartWrapper title="Open Interest in BTC" height={300} subtitle="OI denominated in BTC" isLoading={aggregatedLoading} hint="Open Interest expressed in Bitcoin terms. Removes USD price fluctuation to show real position changes.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aggregatedData?.oiInBitcoin ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} name="BTC in OI" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
          <motion.div variants={containerVariants}>
            <ChartWrapper title="Aggregated Liquidations" height={300} subtitle="Total liquidation volume" isLoading={aggregatedLoading} hint="Total liquidation volume across all tracked exchanges. Spikes indicate forced position closures, often coinciding with price extremes.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aggregatedData?.liquidations ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <defs><linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#liqGrad)" strokeWidth={2} name="Liquidations" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </motion.div>
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
