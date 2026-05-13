'use client'

import { useRef, useEffect } from 'react'
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts'
import type { OHLCV } from '@/types/market.types'
import { COLORS } from '@/lib/constants'

interface CandlestickChartProps {
  data: OHLCV[]
  showVolume?: boolean
  showSMA?: boolean
  height?: number
  symbol?: string
}

export function CandlestickChart({
  data,
  showVolume = true,
  showSMA = true,
  height = 400,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const sma50Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const sma200Ref = useRef<ISeriesApi<'Line'> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: COLORS.TEXT_MUTED,
      },
      grid: {
        vertLines: { color: COLORS.CHART_GRID },
        horzLines: { color: COLORS.CHART_GRID },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: COLORS.BORDER,
      },
      timeScale: {
        borderColor: COLORS.BORDER,
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height,
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

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, height, showVolume, showSMA])

  return <div ref={containerRef} className="w-full" />
}

function calculateSMA(data: OHLCV[], period: number): { timestamp: number; value: number }[] {
  const result: { timestamp: number; value: number }[] = []

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({
      timestamp: data[i].timestamp,
      value: sum / period,
    })
  }

  return result
}
