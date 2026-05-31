import type { LiquidationEvent } from './binance-ws'

interface BitmexLiquidation {
  symbol: string
  side: 'Buy' | 'Sell'
  price: number
  leavesQty: number
  timestamp: string
}

class BitmexBuffer {
  private events: LiquidationEvent[] = []
  private maxSize = 1000
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null
  private isConnected = false
  private lastMessage = 0

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    try {
      this.ws = new WebSocket('wss://ws.bitmex.com/realtime')
      this.ws.onopen = () => {
        this.isConnected = true
        this.ws?.send(JSON.stringify({ op: 'subscribe', args: ['liquidation', 'instrument'] }))
        this.keepAliveTimer = setInterval(() => {
          if (Date.now() - this.lastMessage > 5000) this.ws?.send('ping')
        }, 5000)
      }
      this.ws.onmessage = (msg) => {
        this.lastMessage = Date.now()
        if (msg.data === 'pong') return
        try {
          const data = JSON.parse(msg.data)
          if (data.table === 'liquidation' && data.data) {
            for (const item of data.data as BitmexLiquidation[]) {
              this.events.push({
                symbol: item.symbol,
                side: item.side === 'Sell' ? 'LONG' : 'SHORT',
                price: item.price,
                quantity: item.leavesQty,
                notional: item.price * item.leavesQty,
                timestamp: new Date(item.timestamp).getTime(),
                exchange: 'bitmex',
              })
            }
            if (this.events.length > this.maxSize) this.events = this.events.slice(-this.maxSize)
          }
        } catch {}
      }
      this.ws.onclose = () => {
        this.isConnected = false
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
        this.reconnectTimer = setTimeout(() => this.connect(), 5000)
      }
      this.ws.onerror = () => this.ws?.close()
    } catch {}
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer)
    this.ws?.close()
    this.ws = null
    this.isConnected = false
  }

  getRecent(symbol?: string, limit = 50): LiquidationEvent[] {
    let filtered = symbol ? this.events.filter(e => e.symbol.includes(symbol)) : [...this.events]
    return filtered.reverse().slice(0, limit)
  }

  getAll(): LiquidationEvent[] { return [...this.events] }
  getStatus() { return { connected: this.isConnected, count: this.events.length } }
}

export const bitmexBuffer = new BitmexBuffer()
