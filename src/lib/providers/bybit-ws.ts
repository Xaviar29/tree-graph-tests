import type { LiquidationEvent } from './binance-ws'

class BybitBuffer {
  private events: LiquidationEvent[] = []
  private maxSize = 500
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isConnected = false

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    try {
      this.ws = new WebSocket('wss://stream.bybit.com/v5/public/linear')
      this.ws.onopen = () => {
        this.isConnected = true
        this.ws?.send(JSON.stringify({
          op: 'subscribe',
          args: ['liquidation'],
        }))
      }
      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data)
          if (data.type === 'snapshot' && data.data) {
            for (const item of data.data) {
              this.events.push({
                symbol: item.symbol,
                side: item.side === 'Buy' ? 'LONG' : 'SHORT',
                price: parseFloat(item.price),
                quantity: parseFloat(item.quantity),
                notional: parseFloat(item.price) * parseFloat(item.quantity),
                timestamp: Date.now(),
                exchange: 'bybit',
              })
            }
            if (this.events.length > this.maxSize) this.events = this.events.slice(-this.maxSize)
          }
        } catch {}
      }
      this.ws.onclose = () => {
        this.isConnected = false
        this.reconnectTimer = setTimeout(() => this.connect(), 5000)
      }
      this.ws.onerror = () => this.ws?.close()
    } catch {}
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this.isConnected = false
  }

  getRecent(symbol?: string, limit = 50): LiquidationEvent[] {
    let filtered = symbol ? this.events.filter((e) => e.symbol === symbol) : [...this.events]
    return filtered.reverse().slice(0, limit)
  }

  getAll(): LiquidationEvent[] { return [...this.events] }

  getStatus() { return { connected: this.isConnected, count: this.events.length } }
}

export const bybitBuffer = new BybitBuffer()
