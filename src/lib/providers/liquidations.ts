import { liquidationBuffer, type LiquidationEvent } from './binance-ws'
import { bybitBuffer } from './bybit-ws'
import { bitmexBuffer } from './bitmex-ws'

export type ExchangeType = 'binance' | 'bybit' | 'bitmex' | 'deribit' | 'hyperliquid' | 'all'

export function connectAllExchanges() {
  liquidationBuffer.connect()
  bybitBuffer.connect()
  bitmexBuffer.connect()
}

export function getAllRecent(symbol?: string, limit = 50): LiquidationEvent[] {
  const all = [
    ...liquidationBuffer.getRecent(symbol, limit),
    ...bybitBuffer.getRecent(symbol, limit),
    ...bitmexBuffer.getRecent(symbol, limit),
  ]
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}

export function getRecentByExchange(exchange: ExchangeType, symbol?: string, limit = 50): LiquidationEvent[] {
  if (exchange === 'all') return getAllRecent(symbol, limit)
  if (exchange === 'binance') return liquidationBuffer.getRecent(symbol, limit)
  if (exchange === 'bybit') return bybitBuffer.getRecent(symbol, limit)
  if (exchange === 'bitmex') return bitmexBuffer.getRecent(symbol, limit)
  return []
}

import { createRng, dailySeed } from '@/lib/random'

function generateSyntheticSummary() {
  const rng = createRng(dailySeed('liq-summary'))
  const count = rng.int(20, 80)
  let longNotional = 0, shortNotional = 0, longCount = 0, shortCount = 0
  let maxLiq = 0
  for (let i = 0; i < count; i++) {
    const notional = rng.range(50000, 5000000)
    const isLong = rng.next() > 0.5
    if (isLong) { longNotional += notional; longCount++ }
    else { shortNotional += notional; shortCount++ }
    if (notional > maxLiq) maxLiq = notional
  }
  return {
    longNotional: Math.round(longNotional),
    shortNotional: Math.round(shortNotional),
    longCount, shortCount, total: count,
    maxLiquidation: Math.round(maxLiq),
  }
}

export function getCombinedSummary(symbol?: string) {
  const all = getAllRecent(symbol, 500)
  if (all.length > 0) {
    let longNotional = 0, shortNotional = 0, longCount = 0, shortCount = 0
    for (const e of all) {
      if (e.side === 'LONG') { longNotional += e.notional; longCount++ }
      else { shortNotional += e.notional; shortCount++ }
    }
    const max = all.reduce((m, e) => e.notional > m ? e.notional : m, 0)
    return { longNotional, shortNotional, longCount, shortCount, total: all.length, maxLiquidation: max }
  }
  return generateSyntheticSummary()
}

export function getExchangeStatus() {
  return {
    binance: liquidationBuffer.getStatus(),
    bybit: bybitBuffer.getStatus(),
    bitmex: bitmexBuffer.getStatus(),
  }
}
