'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AlertRule {
  id: string
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'VIX_ABOVE' | 'FEAR_GREED_BELOW' | 'FEAR_GREED_ABOVE' | 'LIQUIDATION_SPIKE'
  symbol?: string
  threshold: number
  label: string
  enabled: boolean
  lastTriggered?: number
}

interface AlertState {
  rules: AlertRule[]
  permission: NotificationPermission | null
  addRule: (rule: Omit<AlertRule, 'id' | 'enabled' | 'lastTriggered'>) => void
  removeRule: (id: string) => void
  toggleRule: (id: string) => void
  requestPermission: () => Promise<void>
  notify: (rule: AlertRule, currentValue: number) => void
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      rules: [
        { id: 'vix-high', type: 'VIX_ABOVE', threshold: 30, label: 'VIX > 30 (High Fear)', enabled: true },
        { id: 'fg-low', type: 'FEAR_GREED_BELOW', threshold: 25, label: 'Fear & Greed < 25 (Extreme Fear)', enabled: true },
        { id: 'fg-high', type: 'FEAR_GREED_ABOVE', threshold: 75, label: 'Fear & Greed > 75 (Extreme Greed)', enabled: false },
        { id: 'liq-spike', type: 'LIQUIDATION_SPIKE', threshold: 10_000_000, label: 'Liquidation > $10M', enabled: false },
      ],
      permission: null,
      addRule: (rule) => set((s) => ({
        rules: [...s.rules, { ...rule, id: `${rule.type}-${Date.now()}`, enabled: true }],
      })),
      removeRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      toggleRule: (id) => set((s) => ({
        rules: s.rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r),
      })),
      requestPermission: async () => {
        if (!('Notification' in window)) return
        const perm = await Notification.requestPermission()
        set({ permission: perm })
      },
      notify: (rule, currentValue) => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return
        new Notification(`Alert: ${rule.label}`, {
          body: `Current value: ${currentValue}`,
          icon: '/favicon.ico',
        })
        set((s) => ({
          rules: s.rules.map((r) => r.id === rule.id ? { ...r, lastTriggered: Date.now() } : r),
        }))
      },
    }),
    { name: 'td-alerts' },
  ),
)
