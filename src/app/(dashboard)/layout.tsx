'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { GlobalSearch } from '@/components/shared/global-search'
import { AlertEngine } from '@/components/shared/alert-engine'
import { useUIStore } from '@/hooks/use-ui'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { presentationMode } = useUIStore()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:block transition-all duration-300',
        presentationMode ? 'w-0 overflow-hidden opacity-0 pointer-events-none invisible' : 'w-auto opacity-100',
      )}>
        <Sidebar />
      </div>

      {/* Mobile sidebar (sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 [&>button]:hidden" showCloseButton={false}>
          <div className="pt-14">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className={cn(
          'flex-1 overflow-y-auto bg-background transition-all duration-300',
          presentationMode ? 'p-6' : 'p-2 sm:p-4 pb-20 lg:pb-4',
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
