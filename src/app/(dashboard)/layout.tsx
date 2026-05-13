'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { GlobalSearch } from '@/components/shared/global-search'
import { AlertEngine } from '@/components/shared/alert-engine'
import { useUIStore } from '@/hooks/use-ui'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { presentationMode } = useUIStore()
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={cn('transition-all duration-300', presentationMode ? 'w-0 overflow-hidden' : '')}>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className={cn(
          'flex-1 overflow-y-auto bg-background transition-all duration-300',
          presentationMode ? 'p-6' : 'p-4',
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <GlobalSearch />
      <AlertEngine />
    </div>
  )
}
