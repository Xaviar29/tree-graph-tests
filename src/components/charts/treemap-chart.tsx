'use client'

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { formatPrice } from '@/lib/utils'

interface TreemapData {
  name: string
  size: number
  changePct: number // change percent
  fill: string
  symbol: string
  [key: string]: any
}

interface TreemapChartProps {
  data: TreemapData[]
}

const COLORS = {
  gain: '#10b981', // green
  loss: '#ef4444', // red
  neutral: '#3b82f6', // blue
}

// Custom Content for Treemap Node
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomizedContent = (props: any) => {
  const { x, y, width, height, changePct, symbol } = props

  if (width <= 0 || height <= 0) return null

  // Determine color based on change percent
  const isGain = changePct > 0
  const isLoss = changePct < 0
  
  // Calculate opacity based on magnitude of change (0 to 3%)
  const magnitude = Math.min(Math.abs(changePct) / 3, 1)
  const baseColor = isGain ? '16, 185, 129' : isLoss ? '239, 68, 68' : '59, 130, 246'
  const opacity = 0.2 + (magnitude * 0.8) // min 20% opacity, max 100%
  const fill = `rgba(${baseColor}, ${opacity})`

  // Dynamic font sizing
  const symbolFontSize = Math.min(Math.max(width / 6, 10), 16)
  const valueFontSize = Math.min(Math.max(width / 8, 8), 12)

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#141414"
        strokeWidth={1.5}
      />
      {width > 30 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (height > 40 ? -4 : 4)}
          textAnchor="middle"
          fill="#fff"
          fontSize={symbolFontSize}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {symbol}
        </text>
      )}
      {width > 45 && height > 45 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={valueFontSize}
          style={{ pointerEvents: 'none' }}
        >
          {changePct > 0 ? '+' : ''}{changePct.toFixed(2)}%
        </text>
      )}
    </g>
  )
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-lg shadow-xl">
        <p className="font-bold text-white mb-1">{data.name} ({data.symbol})</p>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Today</span>
          <span className={data.changePct >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}>
            {data.changePct > 0 ? '+' : ''}{data.changePct.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Weight (Approx)</span>
          <span className="text-white">{data.size.toFixed(1)}%</span>
        </div>
      </div>
    )
  }
  return null
}

export function TreemapChart({ data }: TreemapChartProps) {
  // Add a root node since Recharts Treemap expects nested data sometimes, 
  // or just an array of items if dataKey="size" is set
  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#141414"
        content={<CustomizedContent />}
        isAnimationActive={true}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  )
}
