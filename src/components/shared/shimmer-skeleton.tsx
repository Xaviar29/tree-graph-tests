'use client'

import { cn } from '@/lib/utils'

interface ShimmerSkeletonProps {
  className?: string
  variant?: 'card' | 'chart' | 'text' | 'number' | 'badge'
}

export function ShimmerSkeleton({ className, variant = 'text' }: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted rounded',
        {
          'h-20 w-full': variant === 'card',
          'h-96 w-full': variant === 'chart',
          'h-4 w-24': variant === 'text',
          'h-6 w-20': variant === 'number',
          'h-5 w-16': variant === 'badge',
        },
        className,
      )}
    >
      <div className="shimmer" />
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <ShimmerSkeleton variant="text" className="w-20" />
          <ShimmerSkeleton variant="number" className="w-28" />
          <div className="flex gap-2">
            <ShimmerSkeleton variant="number" className="w-16" />
            <ShimmerSkeleton variant="number" className="w-16" />
          </div>
        </div>
        <div className="space-y-2 items-end flex flex-col">
          <ShimmerSkeleton variant="badge" className="w-14" />
          <ShimmerSkeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}