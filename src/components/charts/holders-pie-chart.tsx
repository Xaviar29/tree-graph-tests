'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Slice {
  name: string
  value: number
  percentage: number
  color: string
}

interface Props {
  data: Slice[]
  title?: string
  innerRadius?: number
}

export function HoldersPieChart({ data, innerRadius = 0 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={140}
          paddingAngle={1}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any, props: any) => [
            `${Number(value).toLocaleString()} BTC (${props.payload.percentage}%)`,
            name,
          ]}
          contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => {
            const item = data.find(d => d.name === value)
            return `${value} (${item?.percentage.toFixed(1)}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
