'use client'

import { cn } from '@/lib/utils'

interface TimeframeSelectorProps {
  timeframes: string[]
  active: string
  onChange: (tf: string) => void
}

export function TimeframeSelector({ timeframes, active, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-0.5 rounded-md bg-muted p-0.5">
      {timeframes.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={cn(
            'rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
            active === tf
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tf}
        </button>
      ))}
    </div>
  )
}
