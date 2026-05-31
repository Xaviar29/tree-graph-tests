'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Gauge,
  PieChart,
  Package,
  DollarSign,
  Bitcoin,
  Flame,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/crypto', label: 'Crypto', icon: Bitcoin },
  { href: '/onfire', label: 'On Fire', icon: Flame },
  { href: '/liquidations', label: 'Liquidations', icon: Flame },
  { href: '/indices', label: 'Indices', icon: TrendingUp },
  { href: '/breadth', label: 'Breadth', icon: Activity },
  { href: '/sentiment', label: 'Sentiment', icon: Gauge },
  { href: '/sectors', label: 'Sectors', icon: PieChart },
  { href: '/commodities', label: 'Commodities', icon: Package },
  { href: '/forex', label: 'Forex', icon: DollarSign },
  { href: '/tools', label: 'Tools', icon: Wrench },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <img src={theme === 'dark' ? '/marketpulse-dark.png' : '/marketpulse.png'} alt="" className="h-5 w-5" />
              <span className="text-sm font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                MarketPulse
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex justify-center flex-1"
            >
              <img src={theme === 'dark' ? '/marketpulse-dark.png' : '/marketpulse.png'} alt="" className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent',
            collapsed && 'mx-auto',
          )}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </motion.div>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />

              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'font-medium',
                      isActive && 'text-primary',
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-gain animate-pulse" />
              <p className="text-[10px] text-muted-foreground/70">
                v1.0.0 — API OK
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-gain animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  )
}