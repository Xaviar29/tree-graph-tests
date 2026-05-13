'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = '#00D4AA', height = 32 }: SparklineProps) {
  const chartData = useMemo(
    () => data.map((value, index) => ({ index, value })),
    [data],
  )

  if (!data.length) return null

  const first = data[0]
  const last = data[data.length - 1]
  const strokeColor = last >= first ? color : '#FF4757'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
