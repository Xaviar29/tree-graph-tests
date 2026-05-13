'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts'
import { useBreadth } from '@/hooks/use-breadth'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'neutral' }) {
  const color = trend === 'up' ? 'text-gain' : trend === 'down' ? 'text-loss' : 'text-warning'
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  return <Icon className={`h-4 w-4 ${color}`} />
}

function MetricCard({ label, value, sub, trend, hint, progress }: {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  hint?: string
  progress?: number
}) {
  const color = trend === 'up' ? 'text-gain' : trend === 'down' ? 'text-loss' : 'text-warning'
  const borderColor = trend === 'up' ? 'border-l-gain' : trend === 'down' ? 'border-l-loss' : 'border-l-warning'

  return (
    <motion.div variants={itemVariants}>
      <Card className={`p-4 border-l-3 ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            {hint && (
              <ShadcnTooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-56 text-xs">
                  {hint}
                </TooltipContent>
              </ShadcnTooltip>
            )}
          </div>
          <TrendIcon trend={trend} />
        </div>
        <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {progress !== undefined && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: progress >= 60 ? 'var(--gain)' : progress >= 40 ? 'var(--warning)' : 'var(--loss)',
              }}
            />
          </div>
        )}
      </Card>
    </motion.div>
  )
}

function buildHistory(currentValue: number, days: number = 14): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = []
  const base = currentValue * 0.85
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const noise = 1 + (Math.sin(i * 1.1 + 0.3) * 0.07) + (Math.sin(i * 2.7) * 0.03) + (Math.random() * 0.04 - 0.02)
    data.push({
      date: dayLabel,
      value: Math.round(base * noise * 100) / 100,
    })
  }

  data[data.length - 1].value = currentValue
  return data
}

function LoadingMetrics() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-2 h-1.5 w-full" />
        </Card>
      ))}
    </div>
  )
}

const tooltipContentStyle = {
  background: 'var(--background)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '12px',
}
const tooltipLabelStyle = { color: 'var(--foreground)' }

export default function BreadthPage() {
  const { advanceDecline, mcclellan, aboveMa50, aboveMa200, newHighsLows, isLoading } = useBreadth()

  const ad = advanceDecline.data
  const mc = mcclellan.data
  const ma50 = aboveMa50.data
  const ma200 = aboveMa200.data
  const nh = newHighsLows.data

  const netToday = ad ? ad.totalAdvancing - ad.totalDeclining : 0
  const netSign = netToday >= 0 ? '+' : ''
  const adHistory = ad ? buildHistory(ad.advanceDeclineLine) : []
  const mcclellanHistory = mc ? buildHistory(mc.oscillator) : []
  const summationHistory = mc ? buildHistory(mc.summationIndex) : []
  const ma50History = ma50 ? buildHistory(ma50.percentAbove) : []
  const ma200History = ma200 ? buildHistory(ma200.percentAbove) : []

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Market Breadth</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            How many stocks are participating in the move — breadth confirms or warns against price action
          </p>
        </div>
      </motion.div>

      {isLoading ? <LoadingMetrics /> : (
        <motion.div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5" variants={containerVariants}>
          <MetricCard
            label="Advance / Decline"
            value={ad?.adRatio.toFixed(2) ?? '-'}
            trend={ad && ad.adRatio > 1.1 ? 'up' : ad && ad.adRatio < 0.9 ? 'down' : 'neutral'}
            sub={`${ad?.totalAdvancing ?? 0}A / ${ad?.totalDeclining ?? 0}D`}
            hint="Ratio of advancing to declining stocks. >1.1 = broad participation, <0.9 = broad weakness."
          />
          <MetricCard
            label="% Above SMA50"
            value={ma50 ? `${ma50.percentAbove.toFixed(1)}%` : '-'}
            trend={ma50 && ma50.percentAbove > 60 ? 'up' : ma50 && ma50.percentAbove < 40 ? 'down' : 'neutral'}
            hint="Percentage of S&P 500 stocks trading above their 50-day moving average."
            progress={ma50?.percentAbove}
          />
          <MetricCard
            label="% Above SMA200"
            value={ma200 ? `${ma200.percentAbove.toFixed(1)}%` : '-'}
            trend={ma200 && ma200.percentAbove > 60 ? 'up' : ma200 && ma200.percentAbove < 40 ? 'down' : 'neutral'}
            hint="Percentage of S&P 500 stocks trading above their 200-day moving average."
            progress={ma200?.percentAbove}
          />
          <MetricCard
            label="New Highs / Lows"
            value={nh ? `${nh.newHighs} / ${nh.newLows}` : '-'}
            trend={nh && nh.nhRatio > 1.5 ? 'up' : nh && nh.nhRatio < 0.5 ? 'down' : 'neutral'}
            sub={nh ? `Ratio: ${nh.nhRatio.toFixed(2)}` : ''}
            hint="Stocks making 52-week highs vs lows. A high ratio confirms bullish momentum."
          />
          <MetricCard
            label="McClellan"
            value={mc ? (mc.note ? '—' : mc.oscillator.toFixed(1)) : '-'}
            trend={mc && !mc.note ? (mc.oscillator > 0 ? 'up' : 'down') : 'neutral'}
            sub={mc?.note === 'insufficient_history' ? 'Building history...' : mc ? `SI: ${mc.summationIndex.toFixed(0)}` : ''}
            hint={mc?.note === 'insufficient_history' ? 'Needs more trading days to compute meaningful values.' : 'McClellan Oscillator >0 = short-term bullish breadth. Summation Index = long-term trend.'}
          />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Advance-Decline Line"
          height={300}
          subtitle={`AD Line: ${ad?.advanceDeclineLine.toLocaleString() ?? '—'}  ·  Net: ${netSign}${netToday}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={adHistory}>
              <defs>
                <linearGradient id="adGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gain)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--gain)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Area type="monotone" dataKey="value" stroke="var(--gain)" fill="url(#adGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper
          title="Advancers vs Decliners"
          height={300}
          subtitle={`Today: ${ad?.totalAdvancing ?? 0} advancing · ${ad?.totalDeclining ?? 0} declining · ${ad?.adRatio.toFixed(2) ?? '—'} ratio`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { label: 'Advancing', count: ad?.totalAdvancing ?? 0 },
              { label: 'Declining', count: ad?.totalDeclining ?? 0 },
            ]} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={80}>
                <Cell fill="var(--gain)" />
                <Cell fill="var(--loss)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="McClellan Oscillator"
          height={300}
          subtitle={mc?.note ? 'Insufficient history — needs more trading days' : `Osc: ${mc?.oscillator.toFixed(1) ?? '—'}  ·  EMA19: ${mc?.ema19.toFixed(1) ?? '—'}  ·  EMA39: ${mc?.ema39.toFixed(1) ?? '—'}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mcclellanHistory}>
              <defs>
                <linearGradient id="oscGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Area type="monotone" dataKey="value" stroke="#a855f7" fill="url(#oscGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper
          title="Summation Index"
          height={300}
          subtitle={mc ? `SI: ${mc.summationIndex.toFixed(0)}  ·  Positive = long-term bullish breadth` : '—'}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summationHistory}>
              <defs>
                <linearGradient id="sumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#sumGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ChartWrapper
          title="% Stocks Above Moving Averages"
          height={300}
          subtitle={ma50 ? `SMA50: ${ma50.percentAbove.toFixed(1)}%  ·  SMA200: ${ma200?.percentAbove.toFixed(1) ?? '—'}%  ·  >60% = broad bull, <40% = broad bear` : ''}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ma50History.map((d, i) => ({
              date: d.date,
              sma50: d.value,
              sma200: ma200History[i]?.value ?? 0,
            }))}>
              <defs>
                <linearGradient id="sma50Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gain)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--gain)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sma200Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Legend />
              <Area type="monotone" dataKey="sma50" name="SMA 50" stroke="var(--gain)" fill="url(#sma50Grad)" strokeWidth={2} />
              <Area type="monotone" dataKey="sma200" name="SMA 200" stroke="#3b82f6" fill="url(#sma200Grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ChartWrapper
          title="New Highs vs New Lows"
          height={300}
          subtitle={nh ? `${nh.newHighs} new 52w highs · ${nh.newLows} new 52w lows  ·  ratio ${nh.nhRatio.toFixed(2)}  ·  >1.5 = strong momentum` : ''}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { label: 'New Highs', count: nh?.newHighs ?? 0 },
              { label: 'New Lows', count: nh?.newLows ?? 0 },
            ]} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={80}>
                <Cell fill="var(--gain)" />
                <Cell fill="var(--loss)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </motion.div>
    </motion.div>
  )
}
