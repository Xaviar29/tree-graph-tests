import { NextResponse } from 'next/server'

interface EmissionPoint { date: string; totalSupply: number; annualInflation: number; blockReward: number; halving?: boolean }

export async function GET() {
  const data: EmissionPoint[] = []
  const halvings = [2012, 2016, 2020, 2024, 2028]
  for (let year = 2009; year <= 2034; year++) {
    const yearsSinceGenesis = year - 2009
    const halvingCount = Math.floor(yearsSinceGenesis / 4)
    const blockReward = 50 / Math.pow(2, halvingCount)
    const blocksPerYear = 6 * 24 * 365
    const yearlyIssuance = blockReward * blocksPerYear
    const totalSupply = 20999999 * (1 - Math.pow(0.5, yearsSinceGenesis / 4))
    const annualInflation = (yearlyIssuance / Math.max(totalSupply, 1)) * 100
    data.push({
      date: String(year),
      totalSupply: Math.round(Math.min(totalSupply, 20999999)),
      annualInflation: Math.round(annualInflation * 100) / 100,
      blockReward,
      halving: halvings.includes(year),
    })
  }
  return NextResponse.json({ success: true, data, meta: { source: 'bitcoin-schedule' } })
}
