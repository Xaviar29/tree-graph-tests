'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="rounded-xl border bg-card p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold">Install MarketPulse</p>
            <p className="text-xs text-muted-foreground mt-1">Add to your home screen for the best experience</p>
          </div>
          <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={async () => {
            if (!deferredPrompt) return
            deferredPrompt.prompt()
            const result = await deferredPrompt.userChoice
            if (result.outcome === 'accepted') setShow(false)
            setDeferredPrompt(null)
          }}
        >
          Install
        </Button>
      </div>
    </div>
  )
}
