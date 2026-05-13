'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { LastUpdated } from '@/components/dashboard/last-updated'
import { TimeframeSelector } from '@/components/dashboard/timeframe-selector'
import { ExportButton } from '@/components/shared/export-button'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface QuickStats {
  open: number
  high: number
  low: number
  change: number
  changePercent: number
}

interface LegendItem {
  label: string
  color: string
  visible?: boolean
}

interface ChartWrapperProps {
  title: string
  subtitle?: string
  isLoading?: boolean
  error?: Error | null
  lastUpdated?: Date
  timeframes?: string[]
  activeTimeframe?: string
  onTimeframeChange?: (tf: string) => void
  exportable?: boolean
  children: React.ReactNode
  className?: string
  height?: number
  onRetry?: () => void
  quickStats?: QuickStats
  legendItems?: LegendItem[]
  dataSource?: string
  hint?: string
  onExportCSV?: () => void
}

export function ChartWrapper({
  title,
  subtitle,
  isLoading,
  error,
  lastUpdated,
  timeframes,
  activeTimeframe,
  onTimeframeChange,
  exportable,
  children,
  className,
  height: initialHeight,
  onRetry,
  quickStats,
  legendItems,
  dataSource,
  hint,
  onExportCSV,
}: ChartWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const hasQuickStats = quickStats !== undefined
  const isUp = quickStats ? quickStats.change >= 0 : true
  const isNeutral = quickStats ? quickStats.change === 0 : true

  const handleExportPNG = useCallback(async () => {
    if (!chartRef.current) return
    const dataUrl = await toPng(chartRef.current, { backgroundColor: 'var(--background)', pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = dataUrl
    link.click()
  }, [title])

  // Adjust height for mobile
  const height = initialHeight

  return (
    <div ref={chartRef} className={cn('rounded-xl border bg-card text-card-foreground overflow-hidden', className)}>
      <div className="px-3 sm:px-4 pt-4 pb-3 border-b bg-card/50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">{title}</h3>
              {hint && (
                <ShadcnTooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-64 text-xs">{hint}</TooltipContent>
                </ShadcnTooltip>
              )}
              {quickStats && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded shrink-0',
                    isNeutral && 'bg-muted text-muted-foreground',
                    !isNeutral && isUp && 'bg-gain/10 text-gain',
                    !isNeutral && !isUp && 'bg-loss/10 text-loss',
                  )}
                >
                  {isNeutral ? <Minus className="h-3 w-3" /> : isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isUp ? '+' : ''}
                  {quickStats.changePercent.toFixed(2)}%
                </span>
              )}
            </div>
            {subtitle && <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            {timeframes && activeTimeframe && onTimeframeChange && (
              <TimeframeSelector timeframes={timeframes} active={activeTimeframe} onChange={onTimeframeChange} />
            )}
            <div className="flex items-center gap-2">
              {exportable && (
                <ExportButton onExportPNG={handleExportPNG} onExportCSV={onExportCSV} />
              )}
              {lastUpdated && <div className="hidden xs:block"><LastUpdated date={lastUpdated} /></div>}
            </div>
          </div>
        </div>

        {hasQuickStats && (
          <div className="mt-3 flex items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">O:</span>
              <span className="font-mono font-medium">{quickStats.open.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">H:</span>
              <span className="font-mono font-medium text-gain">{quickStats.high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">L:</span>
              <span className="font-mono font-medium text-loss">{quickStats.low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-3 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5 sm:ml-0">
              <span className="text-muted-foreground">Chg:</span>
              <span className={cn('font-mono font-medium', isNeutral && 'text-muted-foreground', !isNeutral && isUp && 'text-gain', !isNeutral && !isUp && 'text-loss')}>
                {isUp ? '+' : ''}{quickStats.change.toFixed(2)} ({isUp ? '+' : ''}{quickStats.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}

        {legendItems && legendItems.length > 0 && (
          <div className="mt-2 flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            {legendItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
            {dataSource && (
              <p className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/30 shrink-0">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                {dataSource}
              </p>
            )}
          </div>
        )}
      </div>

      <div style={height ? { minHeight: 300, maxHeight: height } : undefined}>
        {isLoading ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="w-full h-full min-h-[300px]"><Skeleton className="h-full w-full rounded-lg" /></div>
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={onRetry} />
        ) : (
          <div className="relative w-full h-full">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
