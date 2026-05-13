'use client'

import { Activity, Gauge, TrendingUp, Clock, Sunrise, Sun, Sunset, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

type SessionType = 'PRE' | 'REGULAR' | 'AFTER' | 'CLOSED'

interface MarketOverviewStripProps {
  vix?: number
  fearGreed?: number
  sp500Change?: number
  session?: SessionType
  lastUpdated?: Date
}

function getSessionIcon(session: SessionType) {
  switch (session) {
    case 'PRE':
      return <Sunrise className="h-3 w-3" />
    case 'REGULAR':
      return <Sun className="h-3 w-3" />
    case 'AFTER':
      return <Sunset className="h-3 w-3" />
    case 'CLOSED':
      return <Moon className="h-3 w-3" />
  }
}

function getSessionColor(session: SessionType): string {
  switch (session) {
    case 'PRE':
      return 'text-warning'
    case 'REGULAR':
      return 'text-gain'
    case 'AFTER':
      return 'text-orange-500'
    case 'CLOSED':
      return 'text-muted-foreground'
  }
}

function getSessionLabel(session: SessionType): string {
  switch (session) {
    case 'PRE':
      return 'Pre-Market'
    case 'REGULAR':
      return 'Regular'
    case 'AFTER':
      return 'After-Hours'
    case 'CLOSED':
      return 'Closed'
  }
}

function getFearGreedColor(value: number): string {
  if (value <= 25) return 'text-loss'
  if (value <= 45) return 'text-orange-500'
  if (value <= 55) return 'text-muted-foreground'
  if (value <= 75) return 'text-gain'
  return 'text-gain font-bold'
}

function getFearGreedLabel(value: number): string {
  if (value <= 25) return 'Extreme Fear'
  if (value <= 45) return 'Fear'
  if (value <= 55) return 'Neutral'
  if (value <= 75) return 'Greed'
  return 'Extreme Greed'
}

export function MarketOverviewStrip({
  vix,
  fearGreed,
  sp500Change,
  session = 'CLOSED',
  lastUpdated,
}: MarketOverviewStripProps) {
  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-card/50 border-b text-xs">
      <div className={cn('flex items-center gap-1.5', getSessionColor(session))}>
        {getSessionIcon(session)}
        <span className="font-medium">{getSessionLabel(session)}</span>
      </div>

      <div className="h-3 w-px bg-border" />

      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          {lastUpdated
            ? lastUpdated.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : '--:--:--'}
        </span>
      </div>

      {vix !== undefined && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-accent-cyan" />
            <span className="text-muted-foreground">VIX:</span>
            <span
              className={cn(
                'font-mono font-medium',
                vix > 20 ? 'text-loss' : vix > 15 ? 'text-warning' : 'text-gain',
              )}
            >
              {vix.toFixed(1)}
            </span>
          </div>
        </>
      )}

      {fearGreed !== undefined && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">F&G:</span>
            <span className={cn('font-mono font-medium', getFearGreedColor(fearGreed))}>
              {fearGreed.toFixed(0)}
            </span>
            <span className="text-muted-foreground text-[10px]">
              ({getFearGreedLabel(fearGreed)})
            </span>
          </div>
        </>
      )}

      {sp500Change !== undefined && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">S&P:</span>
            <span
              className={cn(
                'font-mono font-medium',
                sp500Change >= 0 ? 'text-gain' : 'text-loss',
              )}
            >
              {sp500Change >= 0 ? '+' : ''}
              {sp500Change.toFixed(2)}%
            </span>
          </div>
        </>
      )}

      <div className="ml-auto">
        <span className="text-muted-foreground/50 text-[10px]">Live Data</span>
      </div>
    </div>
  )
}