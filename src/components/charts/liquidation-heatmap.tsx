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

function formatPrice(p: number): string {
  if (p >= 1000) return `$${(p / 1000).toFixed(1)}K`
  return `$${p.toFixed(0)}`
}

function formatNotional(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function LiquidationHeatmap({ grid, priceBins, currentPrice, width: initialWidth, height: initialHeight }: LiquidationHeatmapProps) {
  const [containerRef, { width: observedWidth }] = useResizeObserver<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const margin = { top: 10, right: 10, bottom: 40, left: 60 }
  const innerW = (observedWidth || initialWidth || 500) - margin.left - margin.right
  const innerH = (initialHeight || 380) - margin.top - margin.bottom
  const totalW = innerW + margin.left + margin.right
  const totalH = innerH + margin.top + margin.bottom

  const toCtx = (x: number, y: number) => ({ x: x + margin.left, y: y + margin.top })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || grid.length === 0 || innerW <= 0 || innerH <= 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = totalW * 2
    canvas.height = totalH * 2
    canvas.style.width = `${totalW}px`
    canvas.style.height = `${totalH}px`
    ctx.scale(2, 2)

    ctx.clearRect(0, 0, totalW, totalH)

    ctx.fillStyle = 'rgb(15, 23, 42)'
    ctx.fillRect(0, 0, totalW, totalH)

    const rows = grid.length
    const cols = grid[0]?.length ?? 0
    const cellW = innerW / cols
    const cellH = innerH / rows
    const origin = toCtx(0, 0)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const [r, g, b] = getColor(grid[y][x])
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(origin.x + x * cellW, origin.y + y * cellH, cellW + 0.5, cellH + 0.5)
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.strokeRect(origin.x, origin.y, innerW, innerH)

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    const yLabels = 5
    for (let i = 0; i <= yLabels; i++) {
      const yPos = origin.y + (i / yLabels) * innerH
      const notionalVal = (i / yLabels) * 1
      ctx.fillText(formatNotional(notionalVal * 200000), margin.left - 8, yPos + 3)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(origin.x, yPos)
      ctx.lineTo(origin.x + innerW, yPos)
      ctx.stroke()
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const xLabels = 6
    for (let i = 0; i <= xLabels; i++) {
      const xPos = origin.x + (i / xLabels) * innerW
      const priceIdx = Math.floor((i / xLabels) * (priceBins.length - 1))
      ctx.fillText(formatPrice(priceBins[priceIdx] ?? 0), xPos, origin.y + innerH + 8)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(xPos, origin.y)
      ctx.lineTo(xPos, origin.y + innerH)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Price →', origin.x + innerW / 2, origin.y + innerH + 28)

    ctx.save()
    ctx.translate(14, origin.y + innerH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Notional Size →', 0, 0)
    ctx.restore()

    if (currentPrice && priceBins.length > 1) {
      const idx = priceBins.reduce((best, p, i) =>
        Math.abs(p - currentPrice) < Math.abs(priceBins[best] - currentPrice) ? i : best, 0)
      const x = origin.x + (idx / priceBins.length) * innerW
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(x, origin.y)
      ctx.lineTo(x, origin.y + innerH)
      ctx.stroke()

      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`◀ ${formatPrice(currentPrice)} ▶`, x, origin.y - 2)
    }
  }, [grid, priceBins, currentPrice, innerW, innerH, totalW, totalH])

  if (grid.length === 0) {
    return (
      <div ref={containerRef} className="flex items-center justify-center bg-slate-900/50 rounded-lg min-h-[300px] w-full">
        <p className="text-sm text-muted-foreground">No liquidation data available</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] flex justify-center overflow-hidden bg-slate-950 rounded-lg">
      <canvas ref={canvasRef} className="block rounded-lg shadow-inner" />
    </div>
  )
}
