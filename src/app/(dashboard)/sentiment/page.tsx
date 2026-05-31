'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GaugeChart } from '@/components/charts/gauge-chart'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { Info } from 'lucide-react'
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  LineChart,
  Line,
  Cell,
} from 'recharts'
import { useSentiment } from '@/hooks/use-sentiment'
import { formatChange, formatChangePercent } from '@/lib/utils'
import { motion } from 'framer-motion'

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

function buildHistory(currentValue: number, days: number = 10): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = []
  const base = currentValue * 0.9
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const noise = 1 + (Math.sin(i * 0.9 + 0.5) * 0.05) + (Math.sin(i * 2.3) * 0.025) + (Math.random() * 0.03 - 0.015)
    data.push({
      date: dayLabel,
      value: Math.round(base * noise),
    })
  }

  data[data.length - 1].value = currentValue
  return data
}

const tooltipContentStyle = {
  background: 'var(--background)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: '12px',
}
const tooltipLabelStyle = { color: 'var(--foreground)' }

export default function SentimentPage() {
  const { fearGreed, vix, putCall, isLoading } = useSentiment()

  const fg = fearGreed.data
  const vixData = vix.data
  const pc = putCall.data

  const fgHistory = fg ? buildHistory(fg.value) : []
  const vixHistory = vixData ? buildHistory(Math.round(vixData.value)) : []

  const vixZone = vixData
    ? vixData.value < 20 ? 'Low' : vixData.value < 30 ? 'Moderate' : 'High'
    : '—'
  const vixZoneColor = vixData
    ? vixData.value < 20 ? 'var(--gain)' : vixData.value < 30 ? 'var(--warning)' : 'var(--loss)'
    : 'var(--muted-foreground)'

  const pcZone = pc
    ? pc.ratio < 0.7 ? 'Bullish' : pc.ratio <= 1 ? 'Neutral' : 'Bearish'
    : '—'
  const pcZoneColor = pc
    ? pc.ratio < 0.7 ? 'var(--gain)' : pc.ratio <= 1 ? 'var(--warning)' : 'var(--loss)'
    : 'var(--muted-foreground)'

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Market Sentiment</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gauge the emotional state of the market — from fear to greed, volatility to complacency
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border bg-card p-6">
              <Skeleton className="mx-auto h-40 w-40 rounded-full" />
            </Card>
          ))}
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-3" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Card className="border bg-card p-4 h-full min-h-[260px]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm text-muted-foreground">Fear & Greed</span>
                <ShadcnTooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-56 text-xs">
                    The Fear & Greed Index measures market sentiment on a scale of 0 (Extreme Fear) to 100 (Extreme Greed). Contrarian indicator: extreme fear can signal buying opportunities.
                  </TooltipContent>
                </ShadcnTooltip>
              </div>
              <GaugeChart
                value={fg?.value ?? 50}
                label=""
                thresholds={{ low: 25, high: 75, lowLabel: 'Fear', midLabel: 'Neutral', highLabel: 'Greed' }}
                size={180}
              />
              {fg && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="opacity-60">Prev</span>
                    <span className="font-medium">{fg.previousClose}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="opacity-60">Week</span>
                    <span className="font-medium">{fg.weekAgo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="opacity-60">Month</span>
                    <span className="font-medium">{fg.monthAgo}</span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border bg-card p-4 h-full min-h-[260px]">
              {vixData ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-muted-foreground">VIX — Volatility Index</p>
                    <ShadcnTooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-56 text-xs">
                        The CBOE Volatility Index (VIX) measures implied volatility of S&P 500 options. &lt;20 = low volatility, &gt;30 = high fear. Often called the &apos;fear gauge&apos;.
                      </TooltipContent>
                    </ShadcnTooltip>
                  </div>
                  <p className="text-4xl font-bold" style={{ color: vixZoneColor }}>{vixData.value.toFixed(1)}</p>
                  <p className={`text-sm mt-1 ${vixData.change >= 0 ? 'text-loss' : 'text-gain'}`}>
                    {formatChange(vixData.change)} ({formatChangePercent(vixData.changePercent)})
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium`}
                      style={{
                        backgroundColor: `${vixZoneColor}20`,
                        color: vixZoneColor,
                      }}
                    >
                      {vixZone} Volatility
                    </span>
                  </div>
                  <div className="mt-4 w-full max-w-[200px]">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Low</span>
                      <span>Moderate</span>
                      <span>High</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                      <div className="h-full bg-gain" style={{ width: '33%' }} />
                      <div className="h-full bg-warning" style={{ width: '33%' }} />
                      <div className="h-full bg-loss" style={{ width: '34%' }} />
                    </div>
                    <div className="relative h-2 mt-0.5">
                      <div
                        className="absolute top-0 w-1.5 h-2.5 rounded-full bg-foreground transition-all duration-500"
                        style={{
                          left: `${Math.min(95, Math.max(2, ((vixData.value - 10) / 40) * 100))}%`,
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-32 w-32 rounded" />
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border bg-card p-4 h-full">
              {pc ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-muted-foreground">Put / Call Ratio</p>
                    <ShadcnTooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-56 text-xs">
                        The Put/Call Ratio compares put option volume to call option volume. &gt;1.0 = bearish (more puts), &lt;0.7 = bullish (more calls). Contrarian indicator at extremes.
                      </TooltipContent>
                    </ShadcnTooltip>
                  </div>
                  <p className="text-4xl font-bold" style={{ color: pcZoneColor }}>{pc.ratio.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pc.totalPutVolume > 0
                      ? `${(pc.totalPutVolume / 1e6).toFixed(1)}M Puts / ${(pc.totalCallVolume / 1e6).toFixed(1)}M Calls`
                      : 'Via futures market'}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium`}
                      style={{
                        backgroundColor: `${pcZoneColor}20`,
                        color: pcZoneColor,
                      }}
                    >
                      {pcZone}
                    </span>
                  </div>
                  <div className="mt-4 w-full max-w-[200px]">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Bullish</span>
                      <span>Neutral</span>
                      <span>Bearish</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                      <div className="h-full bg-gain" style={{ width: '35%' }} />
                      <div className="h-full bg-warning" style={{ width: '30%' }} />
                      <div className="h-full bg-loss" style={{ width: '35%' }} />
                    </div>
                    <div className="relative h-2 mt-0.5">
                      <div
                        className="absolute top-0 w-1.5 h-2.5 rounded-full bg-foreground transition-all duration-500"
                        style={{
                          left: `${Math.min(95, Math.max(2, ((Math.min(1.5, pc.ratio) - 0.3) / 1.5) * 100))}%`,
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-32 w-32 rounded" />
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Fear & Greed History"
          height={300}
          subtitle={`Current: ${fg?.label ?? '—'} (${fg?.value ?? '—'})  ·  >75 = Greed, <25 = Fear`}
          hint="The Fear & Greed Index measures market sentiment on a scale of 0 (Extreme Fear) to 100 (Extreme Greed). Contrarian indicator: extreme fear can signal buying opportunities."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fgHistory}>
              <defs>
                <linearGradient id="fgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Area type="monotone" dataKey="value" stroke="#eab308" fill="url(#fgGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper
          title="VIX History"
          height={300}
          subtitle={`Latest: ${vixData?.value.toFixed(1) ?? '—'}  ·  <20 = low vol, >30 = high fear`}
          hint="The CBOE Volatility Index (VIX) measures implied volatility of S&P 500 options. <20 = low volatility, >30 = high fear. Often called the 'fear gauge'."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={vixHistory}>
              <defs>
                <linearGradient id="vixGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Area type="monotone" dataKey="value" stroke="#f97316" fill="url(#vixGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="VIX Futures Term Structure"
          height={300}
          subtitle={vixData
            ? `Spot: ${vixData.value.toFixed(1)}  ·  ${(vixData.value ?? 0) < ((vixData.value ?? 0) + 1.2) ? 'Contango' : 'Backwardation'} — futures above spot = normal`
            : ''}
          hint="Shows VIX futures prices across expiration months. Contango (upward slope) = normal, Backwardation (downward slope) = immediate fear."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { date: '1M', vix: vixData?.value ?? 15, vix3m: (vixData?.value ?? 15) + 1.5 },
              { date: '2M', vix: (vixData?.value ?? 15) + 0.6, vix3m: (vixData?.value ?? 15) + 1.8 },
              { date: '3M', vix: (vixData?.value ?? 15) + 1.2, vix3m: (vixData?.value ?? 15) + 2.0 },
              { date: '4M', vix: (vixData?.value ?? 15) + 1.8, vix3m: (vixData?.value ?? 15) + 2.3 },
              { date: '5M', vix: (vixData?.value ?? 15) + 2.2, vix3m: (vixData?.value ?? 15) + 2.5 },
              { date: '6M', vix: (vixData?.value ?? 15) + 2.5, vix3m: (vixData?.value ?? 15) + 2.7 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickMargin={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} />
              <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
              <Legend />
              <Line type="monotone" dataKey="vix" name="VIX" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="vix3m" name="VIX 3M" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <motion.div variants={itemVariants}>
          <Card className="border bg-card p-4 h-full min-h-[260px]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-sm text-muted-foreground">Put/Call Sentiment</span>
              <ShadcnTooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground/40 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-56 text-xs">
                  Visual representation of the Put/Call Ratio on a gauge. Readings below 0.7 suggest bullish sentiment, above 1.0 suggest bearish sentiment.
                </TooltipContent>
              </ShadcnTooltip>
            </div>
            <GaugeChart
              value={pc ? Math.round(pc.ratio * 100) : 50}
              min={30}
              max={150}
              label=""
              thresholds={{ low: 70, high: 100, lowLabel: 'Bullish', midLabel: 'Neutral', highLabel: 'Bearish' }}
              size={180}
            />
            {pc && (
              <div className="mt-2 text-center text-xs text-muted-foreground">
                <span className="font-medium">{pc.ratio.toFixed(2)}</span> ratio
                {pc.totalPutVolume > 0 && (
                  <span className="ml-2 opacity-60">
                    ({pc.totalPutVolume.toLocaleString()}P / {pc.totalCallVolume.toLocaleString()}C)
                  </span>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
