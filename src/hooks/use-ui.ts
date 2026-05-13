'use client'

import { create } from 'zustand'

interface UIState {
  presentationMode: boolean
  searchOpen: boolean
  togglePresentation: () => void
  setSearchOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  presentationMode: false,
  searchOpen: false,
  togglePresentation: () => set((s) => ({ presentationMode: !s.presentationMode })),
  setSearchOpen: (open) => set({ searchOpen: open }),
}))
