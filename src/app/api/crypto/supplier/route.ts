import { NextResponse } from 'next/server'

interface SupplierPoint {
  date: string
  hashPrice: number
  totalCost: number
  electricityCost: number
  hardwareCost: number
  btcPrice: number
  profitPercent: number
  isProfit: boolean
}

export async function GET() {
  const data: SupplierPoint[] = []
  const now = new Date()

  for (let i = 365; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const daysSinceGenesis = Math.floor((d.getTime() - new Date('2009-01-03').getTime()) / 86400000)
    const halvingEpoch = Math.floor(daysSinceGenesis / (210000 * 10))
    const blockReward = 50 / Math.pow(2, halvingEpoch)
    const networkHashrate = 200e6 * (1 + Math.sin(daysSinceGenesis * 0.001) * 0.3) * (1 + daysSinceGenesis * 0.003)
    const minerRevenue = blockReward * 6 * 24
    const hashPrice = minerRevenue / networkHashrate

    const electricityPerTH = 30
    const hardwareAmortization = 0.05
    const electricityCost = hashPrice * electricityPerTH * 0.8
    const hardwareCost = hashPrice * hardwareAmortization * networkHashrate * 0.01
    const totalCost = electricityCost + hardwareCost + hashPrice * 0.1

    const btcPrice = 65000 * (0.5 + Math.sin(daysSinceGenesis * 0.0005) * 0.3 + daysSinceGenesis * 0.00015)
    const profitPercent = ((btcPrice - totalCost) / totalCost) * 100

    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      hashPrice: Math.round(hashPrice * 1e9) / 1e9,
      totalCost: Math.round(totalCost),
      electricityCost: Math.round(electricityCost),
      hardwareCost: Math.round(hardwareCost),
      btcPrice: Math.round(btcPrice),
      profitPercent: Math.round(profitPercent * 10) / 10,
      isProfit: profitPercent > 0,
    })
  }

  return NextResponse.json({ success: true, data, meta: { source: 'synthetic-supplier-model' } })
}
