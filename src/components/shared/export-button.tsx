'use client'

import { Button } from '@/components/ui/button'
import { Download, FileDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface ExportButtonProps {
  onExportPNG?: () => Promise<void>
  onExportCSV?: () => void
}

export function ExportButton({ onExportPNG, onExportCSV }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handlePNG = async () => {
    if (!onExportPNG) return
    setExporting(true)
    try { await onExportPNG() } finally { setExporting(false); setOpen(false) }
  }

  const hasOptions = onExportPNG || onExportCSV

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        title="Export"
        disabled={exporting}
        onClick={() => hasOptions ? setOpen(!open) : undefined}
      >
        <Download className={`h-3.5 w-3.5 ${exporting ? 'animate-spin' : ''}`} />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-32 z-50 rounded-md border bg-popover p-1 shadow-md">
          {onExportPNG && (
            <button
              onClick={handlePNG}
              disabled={exporting}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export PNG
            </button>
          )}
          {onExportCSV && (
            <button
              onClick={() => { onExportCSV(); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
        </div>
      )}
    </div>
  )
}
