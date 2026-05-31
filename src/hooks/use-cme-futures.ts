import { useQuery } from '@tanstack/react-query'

export interface GapPoint { date: string; gapUp: number; gapDown: number }
export interface BasisPoint { date: string; futuresPrice: number; spotPrice: number; basis: number }
export interface OIPoint { date: string; openInterest: number; long: number; short: number }
export interface PositionPoint { date: string; dealer: number; assetManager: number; leveragedFunds: number; other: number }
export interface TraderPoint { date: string; dealerLong: number; dealerShort: number; amLong: number; amShort: number; lfLong: number; lfShort: number; otherLong: number; otherShort: number }
export interface ConcPoint { date: string; dealer: number; assetManager: number; leveragedFunds: number; other: number }
export interface OIChangePoint { date: string; longChange: number; shortChange: number }
export interface OpClosePoint { date: string; open: number; close: number }

export interface CMEData {
  gaps: GapPoint[]
  basis: BasisPoint[]
  openInterest: OIPoint[]
  allPositions: PositionPoint[]
  netPositions: PositionPoint[]
  allTraders: TraderPoint[]
  concentration: ConcPoint[]
  oiHistoryChange: OIChangePoint[]
  currentOp: OpClosePoint[]
  currentOI: number
  currentPosition: { dealer: number; assetManager: number; leveragedFunds: number; other: number }
  currentTraders: { dealer: number; assetManager: number; leveragedFunds: number; other: number }
}

export function useCMEFutures() {
  return useQuery({
    queryKey: ['crypto', 'cme-futures'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/cme-futures')
      const json = await res.json()
      return (json.data ?? { gaps: [], basis: [] }) as CMEData
    },
    refetchInterval: 86_400_000,
  })
}
