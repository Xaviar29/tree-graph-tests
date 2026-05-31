'use client'

interface SimpleMapLevel { price: number; density: number; side: 'long' | 'short' }

export function LiquidationSimpleMap({ levels, currentPrice }: { levels: SimpleMapLevel[]; currentPrice?: number }) {
  const maxDensity = Math.max(...levels.map((l) => l.density), 1)
  return (
    <div className="overflow-y-auto max-h-[500px] space-y-1 p-2">
      {levels.slice(0, 40).map((level, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-24 text-right text-muted-foreground font-mono">${level.price.toLocaleString()}</span>
          <div className="flex-1 h-5 rounded bg-muted relative overflow-hidden">
            <div
              className={`h-full rounded transition-all duration-500 ${
                level.side === 'long' ? 'bg-loss/60' : 'bg-gain/60'
              }`}
              style={{ width: `${(level.density / maxDensity) * 100}%` }}
            />
          </div>
          <span className="w-20 text-muted-foreground text-right">{(level.density / 1e6).toFixed(1)}M</span>
        </div>
      ))}
      {levels.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">No liquidation data available</p>
      )}
    </div>
  )
}
