'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface TrenDiffPoint { date: string; value: number; trend: number; signal: 'buy' | 'sell' | null }

export function TrenDiffChart({ data, symbol }: { data: TrenDiffPoint[]; symbol: string }) {
  const signals = useMemo(() => data.filter((d) => d.signal), [data])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-block w-3 h-3 rounded-full bg-gain" /> Buy Signal
        <span className="inline-block w-3 h-3 rounded-full bg-loss ml-3" /> Sell Signal
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} tickMargin={4} />
          <YAxis stroke="var(--muted-foreground)" fontSize={10} tickMargin={4} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }} />
          <Area type="monotone" dataKey="value" stroke="var(--foreground)" fill="var(--foreground)" fillOpacity={0.05} strokeWidth={1.5} name={symbol} />
          <Area type="monotone" dataKey="trend" stroke="#10b981" fill="none" strokeWidth={2.5} name="TrenDiff" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      {signals.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {signals.slice(-10).map((s, i) => (
            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${
              s.signal === 'buy' ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'
            }`}>
              {s.signal === 'buy' ? '\u25B2' : '\u25BC'} {s.date}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
