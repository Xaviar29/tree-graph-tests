'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WatchlistItem {
  symbol: string
  label: string
  addedAt: number
}

interface WatchlistState {
  items: WatchlistItem[]
  add: (symbol: string, label: string) => void
  remove: (symbol: string) => void
  has: (symbol: string) => boolean
  toggle: (symbol: string, label: string) => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [
        { symbol: '^GSPC', label: 'S&P 500', addedAt: Date.now() },
        { symbol: '^VIX', label: 'VIX', addedAt: Date.now() },
      ],
      add: (symbol, label) => set((s) => ({
        items: s.items.some((i) => i.symbol === symbol) ? s.items : [...s.items, { symbol, label, addedAt: Date.now() }],
      })),
      remove: (symbol) => set((s) => ({ items: s.items.filter((i) => i.symbol !== symbol) })),
      has: (symbol) => get().items.some((i) => i.symbol === symbol),
      toggle: (symbol, label) => {
        const has = get().has(symbol)
        if (has) get().remove(symbol)
        else get().add(symbol, label)
      },
    }),
    { name: 'td-watchlist' },
  ),
)
