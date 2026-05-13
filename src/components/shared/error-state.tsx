'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-8">
      <AlertCircle className="h-8 w-8 text-red-400" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border text-muted-foreground hover:bg-accent"
        >
          Retry
        </Button>
      )}
    </div>
  )
}
