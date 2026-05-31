export interface LiquidationEvent {
  symbol: string
  side: 'LONG' | 'SHORT'
  price: number
  quantity: number
  notional: number
  timestamp: number
  exchange: 'binance' | 'bybit' | 'bitmex' | 'deribit' | 'hyperliquid'
}

interface ForceOrderData {
  e: string
  E: number
  o: {
    s: string
    S: 'BUY' | 'SELL'
    p: string
    q: string
    ap: string
    m: boolean
  }
}

class LiquidationBuffer {
  private events: LiquidationEvent[] = []
  private maxSize = 1000
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isConnected = false

  private getNotional(price: string, quantity: string): number {
    return parseFloat(price) * parseFloat(quantity)
  }

  private handleMessage(data: ForceOrderData) {
    const ev: LiquidationEvent = {
      symbol: data.o.s,
      side: data.o.S === 'SELL' ? 'LONG' : 'SHORT',
      price: parseFloat(data.o.p),
      quantity: parseFloat(data.o.q),
      notional: this.getNotional(data.o.ap, data.o.q),
      timestamp: data.E,
      exchange: 'binance',
    }
    this.events.push(ev)
    if (this.events.length > this.maxSize) this.events = this.events.slice(-this.maxSize)
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    try {
      this.ws = new WebSocket('wss://fstream.binance.com/ws/!forceOrder@arr')
      this.ws.onopen = () => { this.isConnected = true }
      this.ws.onmessage = (msg) => {
        try { this.handleMessage(JSON.parse(msg.data)) } catch {}
      }
      this.ws.onclose = () => {
        this.isConnected = false
        this.reconnectTimer = setTimeout(() => this.connect(), 5000)
      }
      this.ws.onerror = () => { this.ws?.close() }
    } catch {}
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this.isConnected = false
  }

  getStatus() { return { connected: this.isConnected, count: this.events.length } }

  getRecent(symbol?: string, limit = 50): LiquidationEvent[] {
    let filtered = symbol ? this.events.filter((e) => e.symbol === symbol) : [...this.events]
    return filtered.reverse().slice(0, limit)
  }

  getAll(): LiquidationEvent[] { return [...this.events] }

  getSummary(symbol?: string) {
    const filtered = symbol ? this.events.filter((e) => e.symbol === symbol) : this.events
    let longNotional = 0, shortNotional = 0, longCount = 0, shortCount = 0
    for (const e of filtered) {
      if (e.side === 'LONG') { longNotional += e.notional; longCount++ }
      else { shortNotional += e.notional; shortCount++ }
    }
    const max = filtered.reduce((m, e) => e.notional > m ? e.notional : m, 0)
    return { longNotional, shortNotional, longCount, shortCount, total: filtered.length, maxLiquidation: max }
  }

  getHourly(symbol?: string) {
    const filtered = symbol ? this.events.filter((e) => e.symbol === symbol) : this.events
    const hourly: Record<string, { long: number; short: number; count: number }> = {}
    for (const e of filtered) {
      const hour = new Date(e.timestamp).toISOString().slice(0, 13)
      if (!hourly[hour]) hourly[hour] = { long: 0, short: 0, count: 0 }
      if (e.side === 'LONG') hourly[hour].long += e.notional
      else hourly[hour].short += e.notional
      hourly[hour].count++
    }
    return Object.entries(hourly).sort().map(([hour, d]) => ({ hour, ...d }))
  }
}

export const liquidationBuffer = new LiquidationBuffer()
