'use client'

import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card } from '@/components/ui/card'
import { useBots } from '@/hooks/use-bots'

const BOT_NAMES = ['QPolarisBot', 'OrionBot', 'LyraBot', 'SiriusBot', 'QVegaBot']
const SYMBOLS = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA']

export function BotSignals() {
  const [symbol, setSymbol] = useState('BTC')
  const [selectedBot, setSelectedBot] = useState('VegaBot')

  const { data: botsData, isLoading, error } = useBots(symbol)

  const bots = useMemo(() => botsData ?? [], [botsData])

  const activeBot = bots.find(b => b?.name === selectedBot)

  const bestBot = useMemo(() =>
    bots.reduce((best, b) => !best || b.overview.effectiveness > best.overview.effectiveness ? b : best, bots[0]),
  [bots])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-muted-foreground">Asset:</span>
        {SYMBOLS.map(s => (
          <button
            key={s}
            onClick={() => { setSymbol(s); setSelectedBot('VegaBot') }}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              symbol === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">
        Real signals based on {symbol} 4h OHLCV from CoinGecko. Strategies adapted from open-source trading systems.
        {activeBot && <span className="ml-1 text-brand">Current signal: <strong>{activeBot.signal.action.toUpperCase()}</strong> ({activeBot.signal.confidence}% confidence) — {activeBot.signal.reason}</span>}
      </p>

      {error && !isLoading && bots.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">Failed to load bot data. Using synthetic fallback...</div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading && bots.length === 0 ? (
          BOT_NAMES.map(name => (
            <Card key={name} className="p-3">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-16" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </Card>
          ))
        ) : (
          bots.map(bot => {
            const isBest = bot?.name === bestBot?.name
            const isSelected = bot?.name === selectedBot
            return (
              <Card
                key={bot.name}
                onClick={() => setSelectedBot(bot.name)}
                className={`p-3 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'border-2 border-[var(--gain)] bg-[var(--gain)]/5' : 'border hover:border-brand/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold">{bot.name}</h3>
                    {isBest && <span className="text-[9px] font-semibold text-gain bg-gain/10 px-1 rounded">BEST</span>}
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    bot.signal.status === 'ACTIVE' ? 'bg-gain/20 text-gain' : 'bg-yellow-400/20 text-yellow-600'
                  }`}>
                    {bot.signal.status}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground mb-1">{bot.label}</p>
                {bot.signal.onTrade ? (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mb-1">
                    <span className="text-muted-foreground col-span-2">{bot.signal.action.toUpperCase()} · x{bot.signal.leverage}</span>
                    <span className="text-muted-foreground">Entry</span>
                    <span className="text-right font-semibold">${bot.signal.entryPrice?.toLocaleString() ?? '—'}</span>
                    <span className="text-muted-foreground">SL</span>
                    <span className="text-right font-semibold text-loss">${bot.signal.stopLoss?.toLocaleString() ?? '—'}</span>
                    <span className="text-muted-foreground">TP</span>
                    <span className="text-right font-semibold text-gain">${bot.signal.takeProfit?.toLocaleString() ?? '—'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 h-8 text-[10px] text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-yellow-400 animate-pulse" />
                    Waiting...
                  </div>
                )}
                <div className="pt-1.5 border-t text-[9px] text-muted-foreground flex justify-between">
                  <span>Win {bot.overview.effectiveness}%</span>
                  <span>PnL {bot.overview.totalPnl > 0 ? '+' : ''}${bot.overview.totalPnl.toLocaleString()}</span>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {activeBot && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">{activeBot.name} — Progression ({symbol})</h3>
              <p className="text-[10px] text-muted-foreground">{activeBot.strategyDescription}</p>
            </div>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span>Sharpe: <strong className="text-foreground">{activeBot.stats.sharpe}</strong></span>
              <span>Max DD: <strong className="text-loss">{activeBot.stats.maxDrawdown}%</strong></span>
              <span>Avg Hold: <strong className="text-foreground">{activeBot.stats.avgHoldingPeriod}h</strong></span>
            </div>
          </div>
          <Card className="p-3">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activeBot.progression.dates.map((d, i) => ({
                date: d, profit: activeBot.progression.profits[i] ?? null, loss: activeBot.progression.losses[i] ?? null,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} labelStyle={{ color: 'var(--foreground)' }} />
                <Area type="monotone" dataKey="profit" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} name="Win %" dot={false} connectNulls />
                <Area type="monotone" dataKey="loss" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} name="Loss %" dot={false} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left px-2 py-1 font-medium">Date</th>
                  <th className="text-left px-2 py-1 font-medium">Action</th>
                  <th className="text-right px-2 py-1 font-medium">Entry</th>
                  <th className="text-right px-2 py-1 font-medium">Exit</th>
                  <th className="text-right px-2 py-1 font-medium">PnL</th>
                  <th className="text-right px-2 py-1 font-medium">ROI</th>
                  <th className="text-left px-2 py-1 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {activeBot.trades.slice(0, 20).map((t, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="px-2 py-1 text-muted-foreground">{t.date}</td>
                    <td className="px-2 py-1">
                      <span className={`font-medium ${t.action === 'buy' ? 'text-gain' : 'text-loss'}`}>{t.action.toUpperCase()}</span>
                    </td>
                    <td className="px-2 py-1 text-right">${t.entryPrice.toLocaleString()}</td>
                    <td className="px-2 py-1 text-right">{t.exitPrice ? `$${t.exitPrice.toLocaleString()}` : '—'}</td>
                    <td className={`px-2 py-1 text-right font-medium ${(t.pnl || 0) > 0 ? 'text-gain' : 'text-loss'}`}>
                      {(t.pnl || 0) > 0 ? '+' : ''}${Math.abs(t.pnl || 0).toLocaleString()}
                    </td>
                    <td className={`px-2 py-1 text-right font-medium ${(t.roi || 0) > 0 ? 'text-gain' : 'text-loss'}`}>
                      {(t.roi || 0) > 0 ? '+' : ''}{t.roi}%
                    </td>
                    <td className="px-2 py-1 text-muted-foreground max-w-[120px] truncate" title={t.reason}>{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
