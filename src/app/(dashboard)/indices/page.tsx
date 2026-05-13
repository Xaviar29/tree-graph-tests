'use client'

import { MetricCard } from '@/components/dashboard/metric-card'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { CandlestickChart } from '@/components/charts/candlestick-chart'
import { Sparkline } from '@/components/charts/sparkline'
import { MarketOverviewStrip } from '@/components/dashboard/market-overview-strip'
import { useMarketQuote } from '@/hooks/use-market-quote'
import { useMarketHistorical } from '@/hooks/use-market-historical'
import { INDEX_SYMBOLS, INDEX_LABELS } from '@/lib/constants'
import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TIMEFRAMES = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y']

const RANGE_MAP: Record<string, string> = {
  '1D': '1d',
  '5D': '5d',
  '1M': '1mo',
  '3M': '3mo',
  '6M': '6mo',
  '1Y': '1y',
  '5Y': '5y',
}

const INTERVAL_MAP: Record<string, string> = {
  '1D': '1m',
  '5D': '5m',
  '1M': '1h',
  '3M': '1d',
  '6M': '1d',
  '1Y': '1d',
  '5Y': '1wk',
}

export default function IndicesPage() {
  const { data: quotes, isLoading: quotesLoading, dataUpdatedAt } = useMarketQuote([...INDEX_SYMBOLS])
  const [selectedSymbol, setSelectedSymbol] = useState('^GSPC')
  const [timeframe, setTimeframe] = useState('1Y')

  const range = RANGE_MAP[timeframe] || '1y'
  const interval = INTERVAL_MAP[timeframe] || '1d'

  const { data: historical, isLoading: historicalLoading } = useMarketHistorical(
    selectedSymbol,
    range,
    interval,
  )

  const selectedQuote = useMemo(
    () => quotes?.find((q) => q.symbol === selectedSymbol),
    [quotes, selectedSymbol],
  )

  const sp500Quote = useMemo(() => quotes?.find((q) => q.symbol === '^GSPC'), [quotes])

  const quickStats = useMemo(() => {
    if (!selectedQuote) return undefined
    return {
      open: selectedQuote.open,
      high: selectedQuote.dayHigh,
      low: selectedQuote.dayLow,
      change: selectedQuote.change,
      changePercent: selectedQuote.changePercent,
    }
  }, [selectedQuote])

  const sparklineDataMap = useMemo(() => {
    const map: Record<string, number[]> = {}
    INDEX_SYMBOLS.forEach((sym) => {
      const quoteData = quotes?.find((q) => q.symbol === sym)
      if (quoteData) {
        const price = quoteData.price
        const change = quoteData.change
        const direction = change >= 0 ? 1 : -1
        const now = Date.now()
        const points = 20
        const basePrice = price - change
        map[sym] = Array.from({ length: points }, (_, i) => {
          const progress = i / (points - 1)
          const noise = (Math.random() - 0.5) * change * 0.3
          return basePrice + change * progress * direction + noise
        })
        map[sym][points - 1] = price
      }
    })
    return map
  }, [quotes])

  const legendItems = [
    { label: 'SMA50', color: 'var(--chart-1)' },
    { label: 'SMA200', color: 'var(--chart-2)' },
    { label: 'Volume', color: 'var(--chart-3)' },
  ]

  return (
    <div className="space-y-4">
      <MarketOverviewStrip
        vix={18.5}
        fearGreed={62}
        sp500Change={sp500Quote?.changePercent}
        session={
          selectedQuote?.marketState === 'PRE'
            ? 'PRE'
            : selectedQuote?.marketState === 'POST'
              ? 'AFTER'
              : selectedQuote?.marketState === 'CLOSED'
                ? 'CLOSED'
                : 'REGULAR'
        }
        lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {INDEX_SYMBOLS.map((sym, index) => {
          const quote = quotes?.find((q) => q.symbol === sym)
          return (
            <MetricCard
              key={sym}
              name={INDEX_LABELS[sym] || sym}
              price={quote?.price ?? 0}
              change={quote?.change ?? 0}
              changePercent={quote?.changePercent ?? 0}
              sparklineData={sparklineDataMap[sym]}
              marketState={
                quote?.marketState === 'PRE'
                  ? 'PRE'
                  : quote?.marketState === 'POST'
                    ? 'AFTER'
                    : quote?.marketState === 'CLOSED'
                      ? 'CLOSED'
                      : 'REGULAR'
              }
              high52w={quote?.week52High}
              low52w={quote?.week52Low}
              isLoading={quotesLoading}
              isSelected={selectedSymbol === sym}
              onClick={() => setSelectedSymbol(sym)}
              animationDelay={index * 0.05}
            />
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSymbol}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          <ChartWrapper
            title={INDEX_LABELS[selectedSymbol] || selectedSymbol}
            subtitle={`${range} · ${interval} interval`}
            isLoading={historicalLoading}
            timeframes={TIMEFRAMES}
            activeTimeframe={timeframe}
            onTimeframeChange={setTimeframe}
            exportable
            quickStats={quickStats}
            legendItems={legendItems}
            height={520}
          >
            {historical && historical.length > 0 ? (
              <CandlestickChart
                data={historical}
                showVolume
                showSMA
                height={440}
                symbol={selectedSymbol}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </ChartWrapper>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}