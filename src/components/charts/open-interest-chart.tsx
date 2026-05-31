'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface OIDataPoint {
  date: string
  openInterest: number
  oiLong?: number
  oiShort?: number
  price?: number
}

interface Props {
  data: OIDataPoint[]
  height?: number
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
      <div className="text-white">OI: {formatCompact(d.openInterest)}</div>
      {d.oiLong != null && <div className="text-green-400">Long: {formatCompact(d.oiLong)}</div>}
      {d.oiShort != null && <div className="text-red-400">Short: {formatCompact(d.oiShort)}</div>}
      {d.oiShort && d.oiShort > 0 && <div className="text-gray-400 mt-1">L/S: {(d.oiLong / d.oiShort).toFixed(2)}</div>}
    </div>
  )
}

export function OpenInterestChartView({ data, height = 120 }: Props) {
  if (data.length === 0) return null
  return (
    <div className="w-full">
      <h4 className="text-[10px] font-semibold text-muted-foreground mb-1">Open Interest</h4>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<TooltipContent />} />
          <defs>
            <linearGradient id="oiFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="openInterest" stroke="#6366f1" strokeWidth={1.5} fill="url(#oiFill)" dot={false} />
          {data[0]?.oiLong != null && (
            <Area type="monotone" dataKey="oiLong" stroke="#10b981" strokeWidth={0.8} fill="none" dot={false} opacity={0.4} />
          )}
          {data[0]?.oiShort != null && (
            <Area type="monotone" dataKey="oiShort" stroke="#ef4444" strokeWidth={0.8} fill="none" dot={false} opacity={0.4} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
