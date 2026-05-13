'use client'

import { useEffect } from 'react'
import { useAlertStore } from '@/hooks/use-alerts'
import { useSentiment } from '@/hooks/use-sentiment'

export function AlertEngine() {
  const { rules, notify, requestPermission } = useAlertStore()
  const { fearGreed, vix } = useSentiment()

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  useEffect(() => {
    if (!fearGreed.data || !vix.data) return

    for (const rule of rules) {
      if (!rule.enabled) continue

      const cooldown = rule.lastTriggered ? Date.now() - rule.lastTriggered > 3600_000 : true
      if (!cooldown) continue

      switch (rule.type) {
        case 'VIX_ABOVE':
          if (vix.data.value > rule.threshold) notify(rule, vix.data.value)
          break
        case 'FEAR_GREED_BELOW':
          if (fearGreed.data.value < rule.threshold) notify(rule, fearGreed.data.value)
          break
        case 'FEAR_GREED_ABOVE':
          if (fearGreed.data.value > rule.threshold) notify(rule, fearGreed.data.value)
          break
      }
    }
  }, [fearGreed.data, vix.data, rules, notify])

  return null
}
