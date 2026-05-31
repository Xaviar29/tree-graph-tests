'use client'

import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, type Time } from 'lightweight-charts'

interface HFCandle { time: number; open: number; high: number; low: number; close: number; volume: number }

export function HighFreqChart({ data, symbol }: { data: HFCandle[]; symbol?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return
    const chart = createChart(containerRef.current, {
      height: 400,
      layout: { background: { color: 'transparent' }, textColor: '#888' },
      grid: { vertLines: { color: '#1a1a2e' }, horzLines: { color: '#1a1a2e' } },
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.3 } },
    })
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00D4AA', downColor: '#FF4757', borderUpColor: '#00D4AA', borderDownColor: '#FF4757',
      wickUpColor: '#00D4AA', wickDownColor: '#FF4757',
    })
    candlestickSeries.setData(data as unknown as { time: Time; open: number; high: number; low: number; close: number }[])

    const histogramSeries = chart.addSeries(HistogramSeries, {
      color: '#2a2a4a', priceFormat: { type: 'volume' }, priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    histogramSeries.setData(data.map((d) => ({ time: d.time as Time, value: d.volume, color: '#2a2a4a' })))

    chart.timeScale().fitContent()
    return () => { chart.remove() }
  }, [data])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[400px] text-xs text-muted-foreground">No data available</div>
  }

  return <div ref={containerRef} className="w-full" />
}
