import { NextResponse } from 'next/server'
import { createRng, dailySeed } from '@/lib/random'

interface GapPoint { date: string; gapUp: number; gapDown: number }
interface BasisPoint { date: string; futuresPrice: number; spotPrice: number; basis: number }
interface OIPoint { date: string; openInterest: number; long: number; short: number }
interface PositionPoint { date: string; dealer: number; assetManager: number; leveragedFunds: number; other: number }
interface TraderPoint { date: string; dealerLong: number; dealerShort: number; amLong: number; amShort: number; lfLong: number; lfShort: number; otherLong: number; otherShort: number }
interface ConcPoint { date: string; dealer: number; assetManager: number; leveragedFunds: number; other: number }
interface OIChangePoint { date: string; longChange: number; shortChange: number }
interface OpClosePoint { date: string; open: number; close: number }

function generateDates(rng: ReturnType<typeof createRng>, days: number) {
  const dates: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
  }
  if (dates.length < 2) dates.push(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
  return dates
}

function smooth(rng: ReturnType<typeof createRng>, prev: number, vol: number, mean: number) {
  return prev + (rng.next() - 0.5) * vol + (mean - prev) * 0.02
}

export async function GET() {
  const rng = createRng(dailySeed('cme'))
  const dates = generateDates(rng, 180)
  const cotDates = generateDates(rng, 90)

  let oi = 25000, sp = 65000
  let nL = 5000, nS = 3000
  let dL = 3000, dS = 2000, aL = 4000, aS = 1500, lL = 2500, lS = 3500, oL = 1500, oS = 1200

  const openInterest: OIPoint[] = []
  const gaps: GapPoint[] = []
  const basis: BasisPoint[] = []

  for (const date of dates) {
    oi = Math.max(10000, smooth(rng, oi, 2000, 25000))
    sp = Math.max(30000, smooth(rng, sp, 2000, 65000))
    nL = Math.max(1000, smooth(rng, nL, 800, 5000))
    nS = Math.max(500, smooth(rng, nS, 600, 3000))
    openInterest.push({ date, openInterest: Math.round(oi), long: Math.round(nL), short: Math.round(nS) })

    const gu = rng.next() > 0.85 ? Math.round(rng.range(100, 600)) : 0
    const gd = rng.next() > 0.88 ? Math.round(rng.range(50, 450)) : 0
    gaps.push({ date, gapUp: gu, gapDown: gd })

    const ab = rng.range(-0.15, 0.15)
    basis.push({ date, futuresPrice: Math.round(sp * (1 + ab / 12)), spotPrice: Math.round(sp), basis: Math.round(ab * 10000) / 100 })
  }

  const allPositions: PositionPoint[] = []
  const netPositions: PositionPoint[] = []
  for (const date of cotDates) {
    dL = Math.max(500, smooth(rng, dL, 400, 3000)); dS = Math.max(300, smooth(rng, dS, 300, 2000))
    aL = Math.max(800, smooth(rng, aL, 500, 4000)); aS = Math.max(300, smooth(rng, aS, 300, 1500))
    lL = Math.max(500, smooth(rng, lL, 400, 2500)); lS = Math.max(800, smooth(rng, lS, 400, 3500))
    oL = Math.max(300, smooth(rng, oL, 200, 1500)); oS = Math.max(200, smooth(rng, oS, 200, 1200))
    allPositions.push({ date, dealer: dL + dS, assetManager: aL + aS, leveragedFunds: lL + lS, other: oL + oS })
    netPositions.push({ date, dealer: dL - dS, assetManager: aL - aS, leveragedFunds: lL - lS, other: oL - oS })
  }

  const allTraders: TraderPoint[] = cotDates.map((date, i) => ({
    date, dealerLong: Math.round(30 + Math.sin(i * 0.2) * 10), dealerShort: Math.round(25 + Math.sin(i * 0.15) * 8),
    amLong: Math.round(80 + Math.sin(i * 0.1) * 20), amShort: Math.round(40 + Math.sin(i * 0.12) * 12),
    lfLong: Math.round(50 + Math.sin(i * 0.25) * 15), lfShort: Math.round(70 + Math.sin(i * 0.2) * 18),
    otherLong: Math.round(20 + Math.sin(i * 0.18) * 8), otherShort: Math.round(15 + Math.sin(i * 0.22) * 6),
  }))

  const concentration: ConcPoint[] = cotDates.map((date, i) => ({
    date, dealer: Math.round(15 + Math.sin(i * 0.1) * 5), assetManager: Math.round(25 + Math.sin(i * 0.15) * 8),
    leveragedFunds: Math.round(20 + Math.sin(i * 0.2) * 7), other: Math.round(10 + Math.sin(i * 0.12) * 3),
  }))

  const oiHistoryChange: OIChangePoint[] = dates.slice(-60).map(date => ({
    date, longChange: Math.round(rng.range(-1000, 1000)), shortChange: Math.round(rng.range(-750, 750)),
  }))

  const currentOp: OpClosePoint[] = dates.slice(-30).map(date => ({
    date, open: Math.round(rng.range(-1500, 1500)), close: Math.round(rng.range(-1250, 1250)),
  }))

  return NextResponse.json({
    success: true,
    data: {
      gaps, basis, openInterest, allPositions, netPositions, allTraders,
      concentration, oiHistoryChange, currentOp,
      currentOI: Math.round(oi),
      currentPosition: { dealer: dL - dS, assetManager: aL - aS, leveragedFunds: lL - lS, other: oL - oS },
      currentTraders: { dealer: Math.round(dL + dS), assetManager: Math.round(aL + aS), leveragedFunds: Math.round(lL + lS), other: Math.round(oL + oS) },
    },
    meta: { source: 'synthetic-cot' },
  })
}
