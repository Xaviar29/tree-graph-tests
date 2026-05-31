'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface MarketCapItem {
  name: string
  symbol: string
  value: number
  image?: string
  color: string
}

const COLORS = [
  '#f7931a', '#627eea', '#3b82f6', '#8b5cf6', '#06b6d4',
  '#10b981', '#eab308', '#f97316', '#ec4899', '#a855f7',
  '#6366f1', '#14b8a6', '#84cc16', '#22d3ee', '#d946ef',
  '#fb923c', '#38bdf8', '#a78bfa', '#f472b6', '#34d399',
  '#fbbf24', '#f87171', '#818cf8', '#2dd4bf', '#a3e635',
  '#c084fc', '#f472b6', '#22d3ee', '#fb923c', '#4ade80',
  '#facc15', '#e879f9', '#67e8f9', '#fdba74', '#86efac',
  '#d8b4fe', '#f9a8d4', '#6ee7b7', '#fde047', '#fca5a5',
  '#a5b4fc', '#5eead4', '#bef264', '#f0abfc', '#7dd3fc',
]

interface Props {
  data: { name: string; symbol: string; marketCap: number; image?: string }[]
  limit?: number
}

export function MarketCapRanking({ data, limit = 50 }: Props) {
  const chartData = useMemo(() =>
    data.slice(0, limit).map((d, i) => ({
      name: d.symbol.toUpperCase(),
      fullName: d.name,
      value: +(d.marketCap / 1e9).toFixed(2),
      image: d.image,
      color: COLORS[i % COLORS.length],
    })),
  [data, limit])

  return (
    <ResponsiveContainer width="100%" height={limit * 28}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 50, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}B`} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={40} />
        <Tooltip
          formatter={(v: any) => [`$${Number(v).toFixed(2)}B`, 'Market Cap']}
          labelFormatter={(l: any) => chartData.find(d => d.name === l)?.fullName || l}
          contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
