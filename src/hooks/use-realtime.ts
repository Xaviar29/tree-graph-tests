'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseRealtimeOptions {
  interval: number
  onTick: () => void
  enabled?: boolean
}

export function useRealtime({ interval, onTick, enabled = true }: UseRealtimeOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(onTick, interval)
  }, [interval, onTick])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) start()
    else stop()
    return stop
  }, [enabled, start, stop])

  return { start, stop }
}
