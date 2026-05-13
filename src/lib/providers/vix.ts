import { getQuote } from '@/lib/providers/yahoo-finance'
import { CACHE_TTL } from '@/lib/constants'

export async function getVIX(): Promise<{
  value: number
  change: number
  changePercent: number
}> {
  const quotes = await getQuote(['^VIX'])
  const vix = quotes[0]

  return {
    value: vix.price,
    change: vix.change,
    changePercent: vix.changePercent,
  }
}
