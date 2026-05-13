'use client'

interface GaugeChartProps {
  value: number
  min?: number
  max?: number
  label: string
  thresholds?: { low: number; high: number; lowLabel: string; midLabel: string; highLabel: string }
  size?: number
  className?: string
}

const defaultThresholds = {
  low: 25,
  high: 75,
  lowLabel: 'Fear',
  midLabel: 'Neutral',
  highLabel: 'Greed',
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  label,
  thresholds = defaultThresholds,
  size = 200,
  className,
}: GaugeChartProps) {
  const cx = size / 2
  const cy = size * 0.62
  const radius = size * 0.32
  const strokeWidth = size * 0.07
  const tickOuterR = radius + strokeWidth / 2 + 6
  const tickInnerR = radius + strokeWidth / 2 + 12
  const labelR = tickInnerR + 14

  const normalized = Math.max(min, Math.min(max, value))
  const fraction = (normalized - min) / (max - min)

  const startAngle = 180
  const endAngle = 0
  const angle = startAngle + (endAngle - startAngle) * fraction

  const toRad = (deg: number) => (deg * Math.PI) / 180

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const sRad = toRad(startDeg)
    const eRad = toRad(endDeg)
    const x1 = cx + r * Math.cos(sRad)
    const y1 = cy + r * Math.sin(sRad)
    const x2 = cx + r * Math.cos(eRad)
    const y2 = cy + r * Math.sin(eRad)
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`
  }

  const needleLen = radius * 0.75
  const needleX = cx + needleLen * Math.cos(toRad(angle))
  const needleY = cy + needleLen * Math.sin(toRad(angle))

  const getColor = () => {
    if (fraction < 0.25) return '#FF4757'
    if (fraction < 0.4) return '#f97316'
    if (fraction < 0.6) return '#FFB800'
    if (fraction < 0.75) return '#00D4AA'
    return '#00B894'
  }

  const color = getColor()

  const tickMarks = [
    { pos: 0, label: min.toString() },
    { pos: 0.25, label: Math.round(min + (max - min) * 0.25).toString() },
    { pos: 0.5, label: Math.round(min + (max - min) * 0.5).toString() },
    { pos: 0.75, label: Math.round(min + (max - min) * 0.75).toString() },
    { pos: 1, label: max.toString() },
  ]

  return (
    <div className={`flex flex-col items-center ${className ?? ''}`}>
      <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`}>
        <defs>
          <linearGradient id="gauge-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4757" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#FFB800" />
            <stop offset="75%" stopColor="#00D4AA" />
            <stop offset="100%" stopColor="#00B894" />
          </linearGradient>
        </defs>

        <path
          d={arcPath(startAngle, endAngle, radius)}
          fill="none"
          stroke="url(#gauge-fill)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.2}
        />

        <path
          d={arcPath(startAngle, angle, radius)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        <circle cx={cx} cy={cy} r={5} fill={color} />
        <circle cx={cx} cy={cy} r={2.5} fill="var(--background)" />

        {tickMarks.map((tick) => {
          const a = startAngle + (endAngle - startAngle) * tick.pos
          const rad = toRad(a)
          const x1 = cx + tickOuterR * Math.cos(rad)
          const y1 = cy + tickOuterR * Math.sin(rad)
          const x2 = cx + tickInnerR * Math.cos(rad)
          const y2 = cy + tickInnerR * Math.sin(rad)
          const lx = cx + labelR * Math.cos(rad)
          const ly = cy + labelR * Math.sin(rad)

          return (
            <g key={tick.pos}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted-foreground)" strokeWidth={1} opacity={0.5} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--muted-foreground)"
                fontSize={size * 0.065}
                opacity={0.6}
              >
                {tick.label}
              </text>
            </g>
          )
        })}

        <text
          x={cx}
          y={cy - radius - strokeWidth - 8}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize={size * 0.085}
        >
          {label}
        </text>
      </svg>

      <div className="mt-0.5 text-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {normalized}
        </span>
        <span className="ml-2 text-sm text-muted-foreground">
          {fraction < (thresholds.low / max) ? thresholds.lowLabel
            : normalized < thresholds.high ? thresholds.midLabel
            : thresholds.highLabel}
        </span>
      </div>
    </div>
  )
}
