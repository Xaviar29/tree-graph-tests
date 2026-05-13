'use client'

import { format } from 'date-fns'

interface LastUpdatedProps {
  date: Date
}

export function LastUpdated({ date }: LastUpdatedProps) {
  return (
    <span className="text-[10px] text-muted-foreground">
      {format(date, 'HH:mm:ss')}
    </span>
  )
}
