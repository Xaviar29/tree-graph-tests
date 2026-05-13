'use client'

import { useEffect, useState, useRef, type RefObject } from 'react'

interface Dimensions {
  width: number
  height: number
}

export function useResizeObserver<T extends HTMLElement>(): [RefObject<T>, Dimensions] {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const observeTarget = elementRef.current
    if (!observeTarget) return

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return
      
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })

    resizeObserver.observe(observeTarget)

    // Set initial size
    const { width, height } = observeTarget.getBoundingClientRect()
    setDimensions({ width, height })

    return () => {
      resizeObserver.unobserve(observeTarget)
      resizeObserver.disconnect()
    }
  }, [])

  return [elementRef as RefObject<T>, dimensions]
}
