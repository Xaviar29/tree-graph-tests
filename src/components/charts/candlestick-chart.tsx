'use client'

import { useRef, useEffect } from 'react'
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts'
import type { OHLCV } from '@/types/market.types'
import { COLORS } from '@/lib/constants'
import { useResizeObserver } from '@/hooks/use-resize-observer'

interface CandlestickChartProps {
  data: OHLCV[]
  showVolume?: boolean
  showSMA?: boolean
  showRSI?: boolean
  showBB?: boolean
  height?: number
  symbol?: string
}

export function CandlestickChart({
  data,
  showVolume = true,
  showSMA = true,
  showRSI = false,
  showBB = false,
  height: initialHeight = 400,
  symbol,
}: CandlestickChartProps) {
  const [containerRef, { width, height: observedHeight }] = useResizeObserver<HTMLDivElement>()
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const sma50Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const sma200Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bbMiddleRef = useRef<ISeriesApi<'Line'> | null>(null)

  // Responsive height adjustment
  const h = observedHeight || initialHeight
  const adjustedHeight = width < 640 ? Math.min(h, 300) : h

  useEffect(() => {
    if (!containerRef.current || width <= 0 || data.length === 0) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: COLORS.TEXT_MUTED,
        fontSize: width < 480 ? 10 : 12,
      },
      grid: {
        vertLines: { color: COLORS.CHART_GRID, style: 1 },
        horzLines: { color: COLORS.CHART_GRID, style: 1 },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: COLORS.BORDER,
        autoScale: true,
      },
      timeScale: {
        borderColor: COLORS.BORDER,
        timeVisible: true,
        secondsVisible: false,
      },
      width,
      height: adjustedHeight,
    })

    chartRef.current = chart

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.UP,
      downColor: COLORS.DOWN,
      borderDownColor: COLORS.DOWN,
      borderUpColor: COLORS.UP,
      wickDownColor: COLORS.DOWN,
      wickUpColor: COLORS.UP,
    })

    candleSeries.setData(
      data.map((d) => ({
        time: d.timestamp as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })),
    )

    candleSeriesRef.current = candleSeries

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })

      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      })

      volumeSeries.setData(
        data.map((d) => ({
          time: d.timestamp as any,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(0,212,170,0.3)' : 'rgba(255,71,87,0.3)',
        })),
      )

      volumeSeriesRef.current = volumeSeries
    }

    if (showSMA && data.length > 50) {
      const sma50 = chart.addSeries(LineSeries, {
        color: '#FFB800',
        lineWidth: 1,
        priceLineVisible: false,
      })
      const sma50Data = calculateSMA(data, 50)
      sma50.setData(sma50Data.map((d) => ({ time: d.timestamp as any, value: d.value })))
      sma50Ref.current = sma50
    }

    if (showSMA && data.length > 200) {
      const sma200 = chart.addSeries(LineSeries, {
        color: '#00B894',
        lineWidth: 1,
        priceLineVisible: false,
      })
      const sma200Data = calculateSMA(data, 200)
      sma200.setData(sma200Data.map((d) => ({ time: d.timestamp as any, value: d.value })))
      sma200Ref.current = sma200
    }

    if (showBB && data.length > 20) {
      const bbData = calculateBollingerBands(data, 20, 2)
      
      const upper = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.4)', lineWidth: 1, priceLineVisible: false })
      const lower = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.4)', lineWidth: 1, priceLineVisible: false })
      const middle = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.2)', lineWidth: 1, priceLineVisible: false, lineStyle: 2 })

      upper.setData(bbData.map(d => ({ time: d.timestamp as any, value: d.upper })))
      lower.setData(bbData.map(d => ({ time: d.timestamp as any, value: d.lower })))
      middle.setData(bbData.map(d => ({ time: d.timestamp as any, value: d.middle })))

      bbUpperRef.current = upper
      bbLowerRef.current = lower
      bbMiddleRef.current = middle
    }

    if (showRSI && data.length > 14) {
      const rsiSeries = chart.addSeries(LineSeries, {
        color: '#A855F7',
        lineWidth: 2,
        priceScaleId: 'rsi',
      })

      rsiSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.1, bottom: 0.7 },
        visible: true,
      })

      const rsiData = calculateRSI(data, 14)
      rsiSeries.setData(rsiData.map(d => ({ time: d.timestamp as any, value: d.value })))
      rsiSeriesRef.current = rsiSeries
    }

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [data, adjustedHeight, width, showVolume, showSMA, showRSI, showBB])

  return (
    <div ref={containerRef} className="w-full relative group" style={{ height: adjustedHeight }}>
      {/* Premium Overlay Legend */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none bg-black/40 backdrop-blur-sm p-2 rounded-md border border-white/5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{symbol || 'Market'}</span>
          {data.length > 0 && (
            <span className={`text-[10px] px-1 rounded ${data[data.length-1].close >= data[data.length-1].open ? 'bg-[var(--gain)]/20 text-[var(--gain)]' : 'bg-[var(--loss)]/20 text-[var(--loss)]'}`}>
              {data[data.length-1].close.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap max-w-[200px]">
          {showSMA && <span className="text-[9px] text-[#FFB800] uppercase font-semibold">SMA 50/200</span>}
          {showBB && <span className="text-[9px] text-blue-400 uppercase font-semibold">BB (20,2)</span>}
          {showRSI && <span className="text-[9px] text-purple-400 uppercase font-semibold">RSI (14)</span>}
        </div>
      </div>
    </div>
  )
}


function calculateSMA(data: OHLCV[], period: number): { timestamp: number; value: number }[] {
  const result: { timestamp: number; value: number }[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) sum += data[i - j].close
    result.push({ timestamp: data[i].timestamp, value: sum / period })
  }
  return result
}

function calculateRSI(data: OHLCV[], period: number = 14): { timestamp: number; value: number }[] {
  const result: { timestamp: number; value: number }[] = []
  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close
    if (diff >= 0) gains += diff
    else losses -= diff
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period
    const rs = avgGain / avgLoss
    result.push({ timestamp: data[i].timestamp, value: 100 - 100 / (1 + rs) })
  }

  return result
}

function calculateBollingerBands(data: OHLCV[], period: number = 20, stdDev: number = 2) {
  const result: { timestamp: number; upper: number; lower: number; middle: number }[] = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const middle = slice.reduce((acc, curr) => acc + curr.close, 0) / period
    const variance = slice.reduce((acc, curr) => acc + Math.pow(curr.close - middle, 2), 0) / period
    const sd = Math.sqrt(variance)
    result.push({
      timestamp: data[i].timestamp,
      upper: middle + stdDev * sd,
      lower: middle - stdDev * sd,
      middle: middle
    })
  }

  return result
}
