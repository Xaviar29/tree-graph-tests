'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { LiquidationEvent } from '@/lib/providers/binance-ws'

export function LiquidationProfile({ events }: { events: LiquidationEvent[] }) {
  const clusters = events.slice(0, 50)
  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 h-16 items-end">
        {clusters.map((e, i) => {
          const height = Math.min(100, (e.notional / 1e6) * 20)
          return (
            <div
              key={i}
              className={`flex-1 rounded-t cursor-pointer transition-all hover:opacity-80 min-w-[2px] ${
                e.side === 'LONG' ? 'bg-loss/60' : 'bg-gain/60'
              }`}
              style={{ height: `${height}%`, minHeight: 2 }}
              title={`${e.exchange}: $${e.price.toLocaleString()} @ $${(e.notional / 1e3).toFixed(0)}K`}
            />
          )
        })}
        {clusters.length === 0 && (
          <p className="text-xs text-muted-foreground w-full text-center py-4">No liquidation data available</p>
        )}
      </div>
      <div className="overflow-auto max-h-80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Exchange</TableHead>
              <TableHead className="text-xs">Side</TableHead>
              <TableHead className="text-xs">Price</TableHead>
              <TableHead className="text-xs">Qty</TableHead>
              <TableHead className="text-xs">Notional</TableHead>
              <TableHead className="text-xs">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clusters.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs capitalize">{e.exchange}</TableCell>
                <TableCell className={`text-xs font-medium ${e.side === 'LONG' ? 'text-loss' : 'text-gain'}`}>{e.side}</TableCell>
                <TableCell className="text-xs">${e.price.toLocaleString()}</TableCell>
                <TableCell className="text-xs">{e.quantity.toFixed(4)}</TableCell>
                <TableCell className="text-xs">${(e.notional / 1e3).toFixed(0)}K</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
