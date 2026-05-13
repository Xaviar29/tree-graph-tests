'use client'

import { useRef, useEffect } from 'react'
import { useResizeObserver } from '@/hooks/use-resize-observer'

interface LiquidationHeatmapProps {
  grid: number[][]
  priceBins: number[]
  currentPrice?: number
  width?: number
  height?: number
}

function getColor(value: number): [number, number, number] {
  if (value <= 0) return [15, 23, 42]
  if (value < 0.2) return [30, 64, 175]
  if (value < 0.4) return [30, 136, 229]
  if (value < 0.6) return [0, 200, 200]
  if (value < 0.8) return [255, 193, 7]
  return [239, 68, 68]
}

export function LiquidationHeatmap({ grid, priceBins, currentPrice, width: initialWidth, height: initialHeight }: LiquidationHeatmapProps) {
  const [containerRef, { width: observedWidth, height: observedHeight }] = useResizeObserver<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const width = observedWidth || initialWidth || 500
  const height = observedHeight || initialHeight || 400

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || grid.length === 0 || width <= 0 || height <= 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const rows = grid.length
    const cols = grid[0]?.length ?? 0
    const cellW = width / cols
    const cellH = height / rows

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const [r, g, b] = getColor(grid[y][x])
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5) // +0.5 to avoid gaps
      }
    }

    if (currentPrice && priceBins.length > 1) {
      const idx = priceBins.reduce((best, p, i) =>
        Math.abs(p - currentPrice) < Math.abs(priceBins[best] - currentPrice) ? i : best, 0)
      const x = (idx / priceBins.length) * width
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }, [grid, priceBins, currentPrice, width, height])

  if (grid.length === 0) {
    return (
      <div ref={containerRef} className="flex items-center justify-center bg-slate-900/50 rounded-lg min-h-[300px] w-full">
        <p className="text-sm text-muted-foreground">No liquidation data available</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] flex justify-center items-center overflow-hidden bg-slate-950 rounded-lg">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="block rounded-lg shadow-inner" 
      />
    </div>
  )
}
