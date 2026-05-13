'use client'

import { useRef, useEffect } from 'react'

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

export function LiquidationHeatmap({ grid, priceBins, currentPrice, width = 500, height = 400 }: LiquidationHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || grid.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rows = grid.length
    const cols = grid[0]?.length ?? 0
    const cellW = width / cols
    const cellH = height / rows

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const [r, g, b] = getColor(grid[y][x])
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH)
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
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-sm text-muted-foreground">No liquidation data available</p>
      </div>
    )
  }

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-auto rounded-lg" />
}
