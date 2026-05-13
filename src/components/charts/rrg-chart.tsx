'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { SectorRRG } from '@/types/sectors.types'

interface RRGChartProps {
  data: SectorRRG[]
  width?: number
  height?: number
}

export function RRGChart({ data, width = 800, height = 600 }: RRGChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Margins
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
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

    // Add padding to domain
    const padding = Math.max(Math.abs(100 - minVal), Math.abs(maxVal - 100)) * 1.1
    const domain = [100 - padding, 100 + padding]

    // Scales
    const xScale = d3.scaleLinear().domain(domain).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain(domain).range([innerHeight, 0])

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Draw Quadrants
    // Leading (Top Right), Weakening (Bottom Right), Lagging (Bottom Left), Improving (Top Left)
    
    // Background colors for quadrants
    // Improving (Top Left) - Blueish
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth / 2)
      .attr('height', innerHeight / 2)
      .attr('fill', 'rgba(59, 130, 246, 0.05)')

    // Leading (Top Right) - Greenish
    g.append('rect')
      .attr('x', innerWidth / 2)
      .attr('y', 0)
      .attr('width', innerWidth / 2)
      .attr('height', innerHeight / 2)
      .attr('fill', 'rgba(16, 185, 129, 0.05)')

    // Lagging (Bottom Left) - Redish
    g.append('rect')
      .attr('x', 0)
      .attr('y', innerHeight / 2)
      .attr('width', innerWidth / 2)
      .attr('height', innerHeight / 2)
      .attr('fill', 'rgba(239, 68, 68, 0.05)')

    // Weakening (Bottom Right) - Yellowish
    g.append('rect')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight / 2)
      .attr('width', innerWidth / 2)
      .attr('height', innerHeight / 2)
      .attr('fill', 'rgba(245, 158, 11, 0.05)')

    // Quadrant Labels
    const labelProps = { fill: 'rgba(255,255,255,0.2)', fontSize: '24px', fontWeight: 'bold' }
    g.append('text').text('IMPROVING').attr('x', 20).attr('y', 30).attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)
    g.append('text').text('LEADING').attr('x', innerWidth - 20).attr('y', 30).attr('text-anchor', 'end').attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)
    g.append('text').text('LAGGING').attr('x', 20).attr('y', innerHeight - 20).attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)
    g.append('text').text('WEAKENING').attr('x', innerWidth - 20).attr('y', innerHeight - 20).attr('text-anchor', 'end').attr('fill', labelProps.fill).attr('font-size', labelProps.fontSize).attr('font-weight', labelProps.fontWeight)

    // Draw Crosshairs (100, 100)
    g.append('line')
      .attr('x1', 0).attr('y1', yScale(100))
      .attr('x2', innerWidth).attr('y2', yScale(100))
      .attr('stroke', '#444').attr('stroke-width', 1).attr('stroke-dasharray', '4,4')

    g.append('line')
      .attr('x1', xScale(100)).attr('y1', 0)
      .attr('x2', xScale(100)).attr('y2', innerHeight)
      .attr('stroke', '#444').attr('stroke-width', 1).attr('stroke-dasharray', '4,4')

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisLeft(yScale).ticks(5)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#666')
    
    g.append('g')
      .call(yAxis)
      .attr('color', '#666')

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('fill', '#888')
      .attr('text-anchor', 'middle')
      .text('JdK RS-Ratio (Relative Strength)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -30)
      .attr('fill', '#888')
      .attr('text-anchor', 'middle')
      .text('JdK RS-Momentum')

    // Line generator for tails
    const line = d3.line<{rsRatio: number, rsMomentum: number}>()
      .x(d => xScale(d.rsRatio))
      .y(d => yScale(d.rsMomentum))
      .curve(d3.curveCatmullRom.alpha(0.5))

    // Draw Data
    data.forEach(sector => {
      if (sector.tail.length === 0) return

      // Draw tail
      g.append('path')
        .datum(sector.tail)
        .attr('fill', 'none')
        .attr('stroke', sector.sector.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)
        .attr('d', line)

      // Draw tail points
      g.selectAll('.tail-point-' + sector.sector.symbol)
        .data(sector.tail.slice(0, -1))
        .enter()
        .append('circle')
        .attr('class', 'tail-point-' + sector.sector.symbol)
        .attr('cx', d => xScale(d.rsRatio))
        .attr('cy', d => yScale(d.rsMomentum))
        .attr('r', 2)
        .attr('fill', sector.sector.color)
        .attr('opacity', 0.5)

      // Draw current point
      g.append('circle')
        .attr('cx', xScale(sector.current.rsRatio))
        .attr('cy', yScale(sector.current.rsMomentum))
        .attr('r', 6)
        .attr('fill', sector.sector.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      // Label
      g.append('text')
        .attr('x', xScale(sector.current.rsRatio) + 10)
        .attr('y', yScale(sector.current.rsMomentum) + 5)
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(sector.sector.symbol)
    })

  }, [data, width, height])

  return (
    <div className="w-full flex justify-center overflow-x-auto">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
}
