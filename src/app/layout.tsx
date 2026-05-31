import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/shared/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PWAPrompt } from '@/components/shared/pwa-prompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MarketPulse',
  description: 'Real-time market intelligence dashboard with breadth, sentiment, and sector analysis',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <QueryProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </QueryProvider>
        <PWAPrompt />
      </body>
    </html>
  )
}
