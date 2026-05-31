import { NextResponse } from 'next/server'

interface S2FPoint { date: string; price: number; s2f: number; halving?: boolean }

function generateS2FData(): S2FPoint[] {
  const data: S2FPoint[] = []
  const halvings = [
    new Date('2012-11-28'), new Date('2016-07-09'),
    new Date('2020-05-11'), new Date('2024-04-20'),
    new Date('2028-03-15'),
  ]
  const now = new Date()
  for (let year = 2010; year <= 2030; year++) {
    for (let month = 0; month < 12; month++) {
      const d = new Date(year, month, 1)
      if (d > now) break
      const yearsSinceGenesis = (d.getTime() - new Date('2009-01-03').getTime()) / (365.25 * 86400000)
      const totalSupply = 20999999 * (1 - Math.exp(-0.0005 * yearsSinceGenesis * 365))
      const yearlyIssuance = totalSupply * 0.017
      const s2f = totalSupply / (yearlyIssuance || 1)
      const price = Math.exp(10 + 0.8 * Math.log(Math.max(s2f, 1))) * (1 + Math.sin(d.getTime() * 0.0001) * 0.3)
      data.push({
        date: d.toISOString().slice(0, 7),
        price: Math.round(price),
        s2f: Math.round(s2f * 10) / 10,
        halving: halvings.some(h => h.getFullYear() === year && h.getMonth() === month),
      })
    }
  }
  return data
}

export async function GET() {
  const data = generateS2FData()
  return NextResponse.json({ success: true, data, meta: { source: 'synthetic-s2f' } })
}
