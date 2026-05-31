'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, Gauge, Bitcoin, Flame, Bell, Zap, BarChart3, PieChart, Package, DollarSign, Wrench, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const features = [
  { icon: BarChart3, title: 'Overview', desc: 'Real-time market dashboard with a bird\'s eye view of all key metrics.', href: '/' },
  { icon: Bitcoin, title: 'Crypto', desc: 'Top 50 coins, BTC/ETH charts, S2F model, BTC ETFs, Emission rate, BTC vs Gold, CME Futures, Aggregated data, Supplier model.', href: '/crypto' },
  { icon: Flame, title: 'On Fire', desc: 'Heatmap scoring 0-100 showing which assets are trending. Filter by crypto, stocks, forex, commodities.', href: '/onfire' },
  { icon: Flame, title: 'Liquidations', desc: 'Real-time liquidation heatmap with KDE density, Simple Map, Profile, HF Chart, Hyperliquid + multi-exchange WebSocket.', href: '/liquidations' },
  { icon: TrendingUp, title: 'Indices', desc: 'S&P 500, NASDAQ, DOW candlestick charts with SMA, MACD, RSI indicators.', href: '/indices' },
  { icon: Activity, title: 'Breadth', desc: 'AD Line, McClellan Oscillator, % above MA50/MA200, New Highs/Lows — know market health.', href: '/breadth' },
  { icon: Gauge, title: 'Sentiment', desc: 'Fear & Greed index, VIX term structure, Put/Call ratio — gauge trader emotion.', href: '/sentiment' },
  { icon: PieChart, title: 'Sectors', desc: 'SPDR sector performance treemap + Relative Rotation Graph (RRG) for rotation analysis.', href: '/sectors' },
  { icon: Package, title: 'Commodities', desc: 'Gold, Silver, WTI Crude, Natural Gas, Copper, Platinum — 6 commodity charts with real data.', href: '/commodities' },
  { icon: DollarSign, title: 'Forex', desc: 'EUR/USD, GBP/USD, USD/JPY and more with interactive DataTable.', href: '/forex' },
  { icon: Wrench, title: 'Tools', desc: 'TrenDiff indicator, Risk Calculator, Historical candlestick chart, Bot Signals.', href: '/tools' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Get notified when VIX spikes, Fear & Greed hits extremes, or liquidations surge. Set custom price and indicator alerts.', href: '#' },
]

const plans = [
  { name: 'Free', price: '$0', features: ['All market data', 'Basic charts', 'Crypto overview', '60s refresh'], cta: 'Get Started', popular: false },
  { name: 'Premium', price: '$9.99', features: ['Everything in Free', 'Real-time liquidations', 'Smart alerts (5)', 'Personal watchlist', 'CSV export'], cta: 'Subscribe', popular: true },
  { name: 'Pro', price: '$29.99', features: ['Everything in Premium', 'Unlimited alerts', 'API access (1000 req/h)', 'Multi-exchange data', 'Historical data export'], cta: 'Go Pro', popular: false },
]

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState('Premium')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [botAlerts, setBotAlerts] = useState<string[]>([])

  const toggleBotAlert = (name: string) => {
    setBotAlerts(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name])
  }
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (stored) setTheme(stored)
  }, [])
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={theme === 'dark' ? '/marketpulse-dark.png' : '/marketpulse.png'} alt="MarketPulse" className="h-6" />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a>
            <Link href="/crypto" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/crypto" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">Launch App</Link>
            <Link href="/crypto" className="px-4 py-1.5 text-sm rounded-lg bg-brand text-brand-foreground font-medium hover:opacity-90 transition-opacity">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold tracking-tight">
            Feel the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-500 to-cyan-400">
              rhythm
            </span>{' '}
            of the markets
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time market data, crypto analytics, liquidation heatmaps, and smart alerts.
            All in one beautiful dashboard.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex items-center justify-center gap-4">
            <Link href="/crypto" className="px-6 py-3 rounded-xl bg-brand text-brand-foreground font-semibold hover:opacity-90 transition-opacity">
              Launch Dashboard
            </Link>
            <a href="#features" className="px-6 py-3 rounded-xl border text-foreground font-semibold hover:bg-accent transition-colors">
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-accent/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to trade smarter</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Link key={f.title} href={f.href} className="block">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-6 rounded-xl border bg-card hover:border-brand/30 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                  <f.icon className="h-8 w-8 text-brand mb-3" />
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="alerts" className="py-20 px-4 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Smart Alerts</h2>
          <p className="text-center text-muted-foreground mb-8">Follow our trading bots in real-time. Get notified when they open positions.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {[
              { name: 'PolarisBot', status: 'ACTIVE', side: 'LONG', leverage: 'x5', entry: '$64,820', tp: '$71,302', sl: '$61,579', winRate: '68%', pnl: '+$12,450', color: 'from-emerald-500 to-teal-600' },
              { name: 'OrionBot', status: 'ACTIVE', side: 'SHORT', leverage: 'x10', entry: '$65,100', tp: '$61,845', sl: '$67,704', winRate: '62%', pnl: '+$8,230', color: 'from-violet-500 to-purple-600' },
              { name: 'LyraBot', status: 'WAITING', side: '—', leverage: 'x3', entry: '—', tp: '—', sl: '—', winRate: '58%', pnl: '+$5,610', color: 'from-blue-500 to-indigo-600' },
              { name: 'SiriusBot', status: 'ACTIVE', side: 'LONG', leverage: 'x25', entry: '$63,400', tp: '$69,740', sl: '$61,498', winRate: '71%', pnl: '+$18,920', color: 'from-rose-500 to-pink-600' },
              { name: 'VegaBot', status: 'ACTIVE', side: 'LONG', leverage: 'x10', entry: '$66,200', tp: '$74,144', sl: '$64,214', winRate: '78%', pnl: '+$35,280', color: 'from-amber-500 to-orange-600' },
            ].map((bot) => (
              <div key={bot.name} className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className={`bg-gradient-to-r ${bot.color} px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{bot.name}</h3>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      bot.status === 'ACTIVE' ? 'bg-green-300 text-green-900' : 'bg-yellow-300 text-yellow-900'
                    }`}>
                      {bot.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/70 mt-0.5">
                    {bot.side !== '—' ? (
                      <>{bot.side} · {bot.leverage} · Win Rate {bot.winRate}</>
                    ) : 'Waiting for setup...'}
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  {bot.side !== '—' ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Entry</span>
                        <span className="font-semibold">{bot.entry}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">TP</span>
                        <span className="font-semibold text-gain">{bot.tp}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">SL</span>
                        <span className="font-semibold text-loss">{bot.sl}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        Analyzing market...
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t flex justify-between text-xs">
                    <span className="text-muted-foreground">Total PnL</span>
                    <span className="font-bold text-gain">{bot.pnl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto mt-8 p-6 rounded-xl border-2 border-brand/30 bg-card">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand" />
              Bot Alert Subscription
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Select bots to receive notifications when they open or close positions:</p>
            <div className="space-y-2 mb-4">
              {[
                { name: 'PolarisBot', desc: 'LONG · x5 · Entry $64,820 · TP $71,302 · SL $61,579', active: true },
                { name: 'OrionBot', desc: 'SHORT · x10 · Entry $65,100 · TP $61,845 · SL $67,704', active: true },
                { name: 'LyraBot', desc: 'WAITING · x3 · Analyzing market...', active: false },
                { name: 'SiriusBot', desc: 'LONG · x25 · Entry $63,400 · TP $69,740 · SL $61,498', active: true },
                { name: 'VegaBot', desc: 'LONG · x10 · Entry $66,200 · TP $74,144 · SL $64,214 · ML Ensemble', active: true },
              ].map((bot) => {
                const isSelected = botAlerts.includes(bot.name)
                return (
                  <div
                    key={bot.name}
                    onClick={() => toggleBotAlert(bot.name)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isSelected ? 'border-brand bg-brand/5' : 'hover:border-brand/30'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-brand bg-brand' : 'border-muted-foreground'
                    }`}>
                      {isSelected && <span className="text-brand-foreground text-[10px] font-bold">✓</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{bot.name}</p>
                      <p className="text-[10px] text-muted-foreground">{bot.desc}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      bot.active ? 'bg-gain/20 text-gain' : 'bg-yellow-400/20 text-yellow-600'
                    }`}>
                      {bot.active ? 'ACTIVE' : 'WAITING'}
                    </span>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => {
                if (botAlerts.length === 0) return
                alert(`Bot alerts activated for: ${botAlerts.join(', ')}

You will receive notifications when:
• A selected bot opens a new position
• A selected bot closes a position
• TP or SL levels are updated`)
              }}
              className="w-full py-2.5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              disabled={botAlerts.length === 0}
            >
              {botAlerts.length > 0 ? `Activate Alerts (${botAlerts.length})` : 'Select at least one bot'}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border bg-card">
              <AlertTriangle className="h-8 w-8 text-brand mb-3" />
              <h3 className="font-semibold mb-2">Price Alerts</h3>
              <p className="text-sm text-muted-foreground mb-4">Set alerts when BTC, ETH, or any asset reaches your target price.</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Single-trigger or range alerts</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Cross-chain price monitoring</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Email + in-app notifications</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border bg-card border-brand/30">
              <Bell className="h-8 w-8 text-brand mb-3" />
              <h3 className="font-semibold mb-2">Indicator Alerts</h3>
              <p className="text-sm text-muted-foreground mb-4">Get notified when Fear & Greed hits extremes, VIX spikes, or liquidations surge.</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Fear & Greed extreme thresholds</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />VIX term structure inversion</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Liquidation cascade detection</li>
              </ul>
              <span className="text-xs text-brand font-semibold mt-3 block">Coming soon</span>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <Activity className="h-8 w-8 text-brand mb-3" />
              <h3 className="font-semibold mb-2">Portfolio Alerts</h3>
              <p className="text-sm text-muted-foreground mb-4">Track your portfolio & watchlist. Get alerts on significant moves.</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Daily P&L summaries</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Drawdown threshold alerts</li>
                <li className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />Watchlist price movers</li>
              </ul>
              <span className="text-xs text-brand font-semibold mt-3 block">Coming soon</span>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/tools?tab=bots" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-brand-foreground font-semibold hover:opacity-90 transition-opacity text-sm">
              View All Bot Signals →
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free, upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedPlan(p.name)}
                className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedPlan === p.name
                    ? 'border-brand bg-brand/5 ring-1 ring-brand'
                    : 'bg-card hover:border-brand/50'
                }`}
              >
                {p.popular && <span className="text-xs font-semibold text-brand mb-2 block">Most Popular</span>}
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-3xl font-bold mt-2">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Zap className="h-3 w-3 text-brand" />{f}</li>
                  ))}
                </ul>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (p.name === 'Free') { window.location.href = '/crypto'; return }
                    fetch('/api/stripe/checkout', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        priceId: p.name === 'Premium' ? 'price_1TWlPaFqgI60XdWch0GsAhfo' : 'price_1TWlRWFqgI60XdWclN1zOhMc',
                        successUrl: window.location.origin + '/crypto',
                        cancelUrl: window.location.origin + '/',
                      }),
                    }).then((r) => r.json()).then((json) => { if (json.data?.url) window.location.href = json.data.url }).catch(() => {})
                  }}
                  className={`mt-6 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedPlan === p.name
                      ? 'bg-brand text-brand-foreground'
                      : 'border text-foreground hover:bg-accent'
                  }`}
                >
                  {p.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 MarketPulse. All rights reserved.</p>
      </footer>
    </div>
  )
}
