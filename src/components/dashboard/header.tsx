'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RefreshCw, Sun, Moon, Search, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { useUIStore } from '@/hooks/use-ui'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/indices', label: 'Indices' },
  { href: '/breadth', label: 'Breadth' },
  { href: '/sentiment', label: 'Sentiment' },
  { href: '/sectors', label: 'Sectors' },
  { href: '/commodities', label: 'Commodities' },
  { href: '/forex', label: 'Forex' },
  { href: '/crypto', label: 'Crypto' },
  { href: '/liquidations', label: 'Liquidations' },
]

interface HeaderProps {
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { setSearchOpen, togglePresentation, presentationMode } = useUIStore()

  return (
    <header className="flex h-14 items-center border-b bg-card px-4">
      <Link href="/" className="mr-6 text-sm font-bold text-foreground shrink-0">
        TradingDifferent
      </Link>

      <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setSearchOpen(true)}
          title="Search (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant={presentationMode ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={togglePresentation}
          title={presentationMode ? 'Exit presentation' : 'Presentation mode'}
        >
          <Presentation className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}
