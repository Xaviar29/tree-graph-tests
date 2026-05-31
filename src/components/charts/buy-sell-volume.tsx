'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface BuySellData {
  date: string
  buyVolume: number
  sellVolume: number
  buySellRatio: number
}

interface Props {
  data: BuySellData[]
  height?: number
}

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#0f1115] border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className="text-green-400">Buy: ${(d.buyVolume / 1e9).toFixed(2)}B</div>
      <div className="text-red-400">Sell: ${(d.sellVolume / 1e9).toFixed(2)}B</div>
      <div className="text-gray-400 mt-1">Ratio: {d.buySellRatio.toFixed(3)}</div>
    </div>
  )
}

export function BuySellVolumeChart({ data, height = 120 }: Props) {
  if (data.length === 0) return null
  return (
    <div className="w-full">
      <h4 className="text-[10px] font-semibold text-muted-foreground mb-1">Buy/Sell Volume</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<TooltipContent />} />
          <ReferenceLine y={0} stroke="#333" />
          <Bar dataKey="buyVolume" fill="#10b981" opacity={0.5} stackId="vol" />
          <Bar dataKey="sellVolume" fill="#ef4444" opacity={0.5} stackId="vol" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-green-500/60" /> Buy</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded bg-red-500/60" /> Sell</span>
      </div>
    </div>
  )
}
