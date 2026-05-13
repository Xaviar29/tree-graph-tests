'use client'

import { Command } from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUIStore } from '@/hooks/use-ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  TrendingUp, Activity, Gauge, PieChart, Package, DollarSign, Bitcoin, Flame,
  Search,
} from 'lucide-react'

const pages = [
  { href: '/indices', label: 'Indices', icon: TrendingUp, keywords: 'sp500 nasdaq dow jones index' },
  { href: '/breadth', label: 'Market Breadth', icon: Activity, keywords: 'advance decline mcclellan breadth' },
  { href: '/sentiment', label: 'Market Sentiment', icon: Gauge, keywords: 'fear greed vix put call sentiment' },
  { href: '/sectors', label: 'Sectors', icon: PieChart, keywords: 'sector rotation rrg performance' },
  { href: '/commodities', label: 'Commodities', icon: Package, keywords: 'gold oil copper commodity' },
  { href: '/forex', label: 'Forex', icon: DollarSign, keywords: 'currency eur usd forex dollar' },
  { href: '/crypto', label: 'Crypto', icon: Bitcoin, keywords: 'bitcoin ethereum cryptocurrency' },
  { href: '/liquidations', label: 'Liquidations', icon: Flame, keywords: 'liquidation heatmap binance' },
]

export function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useUIStore()
  const router = useRouter()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchOpen, setSearchOpen])

  const filtered = query
    ? pages.filter((p) =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.keywords.includes(query.toLowerCase()),
      )
    : pages

  const handleSelect = (href: string) => {
    setSearchOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="p-0 gap-0 max-w-md top-[15%] translate-y-0">
        <DialogTitle className="sr-only">Search pages</DialogTitle>
        <Command className="rounded-lg border-0">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground mr-2" />
            <input
              autoFocus
              placeholder="Search pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground text-center">No pages found</p>
            )}
            {filtered.map((page) => (
              <button
                key={page.href}
                onClick={() => handleSelect(page.href)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <page.icon className="h-4 w-4 text-muted-foreground" />
                <span>{page.label}</span>
              </button>
            ))}
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
