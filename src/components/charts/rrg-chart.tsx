'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { SectorRRG } from '@/types/sectors.types'
import { useResizeObserver } from '@/hooks/use-resize-observer'

interface RRGChartProps {
  data: SectorRRG[]
  // width/height are now optional since we use ResizeObserver, 
  // but we can keep them in the interface if they are passed from parent.
  width?: number
  height?: number
}

export function RRGChart({ data, width: initialWidth, height: initialHeight }: RRGChartProps) {
  const [containerRef, { width: observedWidth, height: observedHeight }] = useResizeObserver<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Use observed dimensions or initial props (fallback to reasonable defaults)
  const width = observedWidth || initialWidth || 800
  const height = observedHeight || initialHeight || 600

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || width <= 0 || height <= 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Responsive scaling factors
    const isSmall = width < 500
    const margin = { 
      top: isSmall ? 25 : 40, 
      right: isSmall ? 30 : 50, 
      bottom: isSmall ? 50 : 60, 
      left: isSmall ? 45 : 60 
    }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Determine domains (min/max of both ratio and momentum to center around 100)
    let minVal = 100
    let maxVal = 100

    data.forEach(d => {
      d.tail.forEach(t => {
        if (t.rsRatio < minVal) minVal = t.rsRatio
        if (t.rsRatio > maxVal) maxVal = t.rsRatio
        if (t.rsMomentum < minVal) minVal = t.rsMomentum
        if (t.rsMomentum > maxVal) maxVal = t.rsMomentum
      })
    })

    // Add padding to domain - ensuring we always see 100
    const diff = Math.max(Math.abs(100 - minVal), Math.abs(maxVal - 100), 1) // min diff of 1
    const padding = diff * 1.2
    const domain = [100 - padding, 100 + padding]

    // Scales
    const xScale = d3.scaleLinear().domain(domain).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain(domain).range([innerHeight, 0])

    // Defs for gradients
    const defs = svg.append('defs')
    
    // Create gradients for each quadrant
    const gradients = [
      { id: 'grad-improving', color: '#3b82f6' }, // Blue
      { id: 'grad-leading', color: '#10b981' },   // Green
      { id: 'grad-lagging', color: '#ef4444' },   // Red
      { id: 'grad-weakening', color: '#f59e0b' }  // Amber
    ]

    gradients.forEach(g => {
      const grad = defs.append('radialGradient')
        .attr('id', g.id)
        .attr('cx', g.id.includes('leading') || g.id.includes('weakening') ? '100%' : '0%')
        .attr('cy', g.id.includes('improving') || g.id.includes('leading') ? '0%' : '100%')
        .attr('r', '100%')
      
      grad.append('stop').attr('offset', '0%').attr('stop-color', g.color).attr('stop-opacity', 0.15)
      grad.append('stop').attr('offset', '100%').attr('stop-color', g.color).attr('stop-opacity', 0)
    })

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Quadrant Backgrounds with Gradients
    g.append('rect').attr('x', 0).attr('y', 0).attr('width', innerWidth / 2).attr('height', innerHeight / 2).attr('fill', 'url(#grad-improving)')
    g.append('rect').attr('x', innerWidth / 2).attr('y', 0).attr('width', innerWidth / 2).attr('height', innerHeight / 2).attr('fill', 'url(#grad-leading)')
    g.append('rect').attr('x', 0).attr('y', innerHeight / 2).attr('width', innerWidth / 2).attr('height', innerHeight / 2).attr('fill', 'url(#grad-lagging)')
    g.append('rect').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('width', innerWidth / 2).attr('height', innerHeight / 2).attr('fill', 'url(#grad-weakening)')

    // Quadrant Labels
    const labelFontSize = isSmall ? '14px' : '20px'
    const labelProps = { fill: 'rgba(255,255,255,0.15)', fontSize: labelFontSize, fontWeight: '800' }
    
    g.append('text').text('IMPROVING').attr('x', 15).attr('y', 25).attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)
    g.append('text').text('LEADING').attr('x', innerWidth - 15).attr('y', 25).attr('text-anchor', 'end').attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)
    g.append('text').text('LAGGING').attr('x', 15).attr('y', innerHeight - 15).attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)
    g.append('text').text('WEAKENING').attr('x', innerWidth - 15).attr('y', innerHeight - 15).attr('text-anchor', 'end').attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)

    // Crosshairs
    g.append('line').attr('x1', 0).attr('y1', yScale(100)).attr('x2', innerWidth).attr('y2', yScale(100)).attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1)
    g.append('line').attr('x1', xScale(100)).attr('y1', 0).attr('x2', xScale(100)).attr('y2', innerHeight).attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1)

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(isSmall ? 4 : 8).tickSize(-innerHeight).tickPadding(10)
    const yAxis = d3.axisLeft(yScale).ticks(isSmall ? 4 : 8).tickSize(-innerWidth).tickPadding(10)

    const gx = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis)
    const gy = g.append('g').call(yAxis)

    // Style axis lines
    gx.select('.domain').remove()
    gy.select('.domain').remove()
    gx.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)')
    gy.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)')
    gx.selectAll('.tick text').attr('fill', '#888').style('font-size', isSmall ? '9px' : '11px')
    gy.selectAll('.tick text').attr('fill', '#888').style('font-size', isSmall ? '9px' : '11px')

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + (isSmall ? 35 : 45))
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('font-size', isSmall ? '10px' : '13px')
      .attr('font-weight', '500')
      .text('JDk RS-Ratio')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', isSmall ? -35 : -45)
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('font-size', isSmall ? '10px' : '13px')
      .attr('font-weight', '500')
      .text('JDk RS-Momentum')

    // Line generator for tails
    const line = d3.line<{rsRatio: number, rsMomentum: number}>()
      .x(d => xScale(d.rsRatio))
      .y(d => yScale(d.rsMomentum))
      .curve(d3.curveCatmullRom.alpha(0.5))

    // Tooltip behavior
    const showTooltip = (event: any, sector: SectorRRG) => {
      if (!tooltipRef.current) return
      const [x, y] = d3.pointer(event, containerRef.current)
      
      d3.select(tooltipRef.current)
        .style('opacity', 1)
        .style('left', `${x + 15}px`)
        .style('top', `${y - 15}px`)
        .html(`
          <div class="bg-popover border border-border p-2 rounded-md shadow-lg text-xs">
            <div class="font-bold flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full" style="background-color: ${sector.sector.color}"></div>
              ${sector.sector.name} (${sector.sector.symbol})
            </div>
            <div class="text-muted-foreground">
              Ratio: ${sector.current.rsRatio.toFixed(2)}<br/>
              Momentum: ${sector.current.rsMomentum.toFixed(2)}
            </div>
          </div>
        `)
    }

    const hideTooltip = () => {
      if (!tooltipRef.current) return
      d3.select(tooltipRef.current).style('opacity', 0)
    }

    // Draw Data
    data.forEach(sector => {
      if (sector.tail.length === 0) return

      const sectorGroup = g.append('g')
        .attr('class', 'sector-' + sector.sector.symbol)
        .on('mouseenter', (event) => {
          sectorGroup.selectAll('.tail-path').attr('stroke-width', isSmall ? 3 : 4).attr('opacity', 1)
          sectorGroup.selectAll('.current-point').attr('r', isSmall ? 6 : 8)
          showTooltip(event, sector)
        })
        .on('mouseleave', () => {
          sectorGroup.selectAll('.tail-path').attr('stroke-width', isSmall ? 1.5 : 2).attr('opacity', 0.6)
          sectorGroup.selectAll('.current-point').attr('r', isSmall ? 4 : 6)
          hideTooltip()
        })

      // Draw tail path
      sectorGroup.append('path')
        .datum(sector.tail)
        .attr('class', 'tail-path')
        .attr('fill', 'none')
        .attr('stroke', sector.sector.color)
        .attr('stroke-width', isSmall ? 1.5 : 2)
        .attr('opacity', 0.6)
        .attr('d', line)

      // Draw tail points
      sectorGroup.selectAll('.tail-point')
        .data(sector.tail.slice(0, -1))
        .enter()
        .append('circle')
        .attr('class', 'tail-point')
        .attr('cx', d => xScale(d.rsRatio))
        .attr('cy', d => yScale(d.rsMomentum))
        .attr('r', isSmall ? 1 : 2)
        .attr('fill', sector.sector.color)
        .attr('opacity', 0.4)

      // Current point
      const radius = isSmall ? 4 : 6
      sectorGroup.append('circle')
        .attr('class', 'current-point')
        .attr('cx', xScale(sector.current.rsRatio))
        .attr('cy', yScale(sector.current.rsMomentum))
        .attr('r', radius)
        .attr('fill', sector.sector.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', isSmall ? 1 : 2)

      // Label
      sectorGroup.append('text')
        .attr('x', xScale(sector.current.rsRatio) + (isSmall ? 6 : 10))
        .attr('y', yScale(sector.current.rsMomentum) + (isSmall ? 3 : 5))
        .attr('fill', '#fff')
        .attr('font-size', isSmall ? '10px' : '12px')
        .attr('font-weight', '700')
        .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
        .text(sector.sector.symbol)
    })

  }, [data, width, height])

  return (
    <div ref={containerRef} className="relative w-full h-[350px] sm:h-[500px] md:h-[600px] flex justify-center overflow-hidden">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block cursor-crosshair"
      />
      <div 
        ref={tooltipRef} 
        className="pointer-events-none absolute z-50 opacity-0 transition-opacity duration-200"
      />
    </div>
  )
}

