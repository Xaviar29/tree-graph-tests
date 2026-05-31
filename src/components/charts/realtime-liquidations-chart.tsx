'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

interface LiquidationEvent {
  timestamp: number
  price: number
  value: number
  side: 'long' | 'short'
  exchange: string
}

interface Props {
  events: LiquidationEvent[]
  height?: number
  binMinutes?: number
}

function formatCompact(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return v.toFixed(0)
}

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#0f1115] border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className={d.side === 'long' ? 'text-green-400' : 'text-red-400'}>
        {d.side === 'long' ? 'Longs' : 'Shorts'}: {formatCompact(d.totalValue)}
      </div>
      <div className="text-gray-500">Events: {d.count}</div>
    </div>
  )
}

export function RealtimeLiquidationsChartView({ events, height = 120, binMinutes = 5 }: Props) {
  const chartData = useMemo(() => {
    if (events.length === 0) return []
    const bins = new Map<string, { time: string; totalValue: number; count: number; side: 'long' | 'short' }>()
    for (const e of events) {
      const d = new Date(e.timestamp)
      d.setMinutes(Math.floor(d.getMinutes() / binMinutes) * binMinutes, 0, 0)
      const key = d.toISOString().slice(0, 16)
      const bin = bins.get(key) || { time: key, totalValue: 0, count: 0, side: 'long' as 'long' | 'short' }
      bin.totalValue += e.value
      bin.count++
      bins.set(key, bin)
    }
    return Array.from(bins.values())
      .map(b => ({ ...b, displayValue: b.totalValue }))
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-48)
  }, [events, binMinutes])

  if (chartData.length === 0) return null

  return (
    <div className="w-full">
      <h4 className="text-[10px] font-semibold text-muted-foreground mb-1">Liquidations All Aggregated</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<TooltipContent />} />
          <ReferenceLine y={0} stroke="#333" />
          <Bar dataKey="totalValue" radius={[1, 1, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.side === 'long' ? '#10b981' : '#ef4444'} opacity={0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-green-500/70" /> Long liq</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-red-500/70" /> Short liq</span>
      </div>
    </div>
  )
}
