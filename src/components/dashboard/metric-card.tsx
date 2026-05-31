'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/charts/sparkline'
import { MetricCardSkeleton } from '@/components/shared/shimmer-skeleton'
import { motion } from 'framer-motion'

type SessionType = 'PRE' | 'REGULAR' | 'AFTER' | 'CLOSED'

interface MetricCardProps {
  name: string
  price: number
  change: number
  changePercent: number
  sparklineData?: number[]
  marketState?: SessionType
  high52w?: number
  low52w?: number
  isLoading?: boolean
  isSelected?: boolean
  onClick?: () => void
  animationDelay?: number
}

function getSessionBadge(session: SessionType): { label: string; className: string } {
  switch (session) {
    case 'PRE':
      return { label: 'PRE', className: 'bg-warning/20 text-warning border-warning/30' }
    case 'REGULAR':
      return { label: 'REG', className: 'bg-gain/20 text-gain border-gain/30' }
    case 'AFTER':
      return { label: 'AFTER', className: 'bg-orange-500/20 text-orange-500 border-orange-500/30' }
    case 'CLOSED':
    default:
      return { label: 'CLOSED', className: 'bg-muted text-muted-foreground border-border' }
  }
}

export function MetricCard({
  name,
  price,
  change,
  changePercent,
  sparklineData,
  marketState = 'CLOSED',
  high52w,
  low52w,
  isLoading,
  isSelected,
  onClick,
  animationDelay = 0,
}: MetricCardProps) {
  if (isLoading) {
    return <MetricCardSkeleton />
  }

  const isUp = change >= 0
  const isNeutral = change === 0
  const accentColor = isNeutral ? 'border-muted' : isUp ? 'border-gain' : 'border-loss'
  const textColor = isNeutral ? 'text-muted-foreground' : isUp ? 'text-gain' : 'text-loss'

  const badge = getSessionBadge(marketState)

  const magnitudePercent = useMemo(() => {
    const maxChange = 2
    const normalized = Math.min(Math.abs(changePercent) / maxChange, 1)
    return normalized * 100
  }, [changePercent])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animationDelay }}
      className={cn('relative')}
    >
      <div
        className={cn(
          'relative rounded-xl border bg-card p-4 cursor-pointer',
          'transition-all duration-200 ease-out',
          'hover:scale-[1.02] hover:shadow-lg hover:shadow-foreground/5',
          isSelected ? '!border-l-[7px] !border-primary shadow-lg shadow-primary/20' : `border-l-[3px] ${accentColor}`,
          !isSelected && 'hover:border-foreground/20',
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">{name}</p>
              {marketState && (
                <span
                  className={cn(
                    'shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border',
                    badge.className,
                  )}
                >
                  {badge.label}
                </span>
              )}
            </div>

            <p className="mt-1 font-mono text-xl font-semibold text-foreground tracking-tight">
              {price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className={cn('font-mono text-sm font-medium', textColor)}>
                {isUp ? '+' : ''}
                {change.toFixed(2)}
              </span>
              <span className={cn('font-mono text-sm', textColor)}>
                ({isUp ? '+' : ''}
                {changePercent.toFixed(2)}%)
              </span>
            </div>

            {high52w !== undefined && low52w !== undefined && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>52W Low</span>
                  <span>52W High</span>
                </div>
                <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-loss to-gain rounded-full"
                    style={{
                      width: `${((price - low52w) / (high52w - low52w)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-2 bg-foreground rounded-full"
                    style={{
                      left: `${((price - low52w) / (high52w - low52w)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-loss">{low52w.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-gain">{high52w.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${magnitudePercent}%` }}
                transition={{ duration: 0.5, delay: animationDelay + 0.1 }}
                className={cn('h-full rounded-full', isUp ? 'bg-gain/60' : 'bg-loss/60')}
              />
            </div>
          </div>

          {sparklineData && sparklineData.length > 0 && (
            <div className="shrink-0 w-24">
              <Sparkline data={sparklineData} height={40} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}