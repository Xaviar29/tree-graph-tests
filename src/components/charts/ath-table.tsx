'use client'

import type { CryptoMarket } from '@/types/crypto.types'

interface Props {
  data: CryptoMarket[]
}

function smartRound(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  if (v >= 0.001) return `$${v.toFixed(4)}`
  return `$${v.toExponential(2)}`
}

export function ATHTable({ data }: Props) {
  const rows = data
    .filter(c => c.athPrice)
    .map((c) => {
      const athDays = c.athDate
        ? Math.floor((Date.now() - new Date(c.athDate).getTime()) / 86400000)
        : 0
      const distanceFromAth = c.athPrice ? ((c.athPrice - c.currentPrice) / c.athPrice) * 100 : 0
      const recoveryNeeded = c.athPrice ? ((c.athPrice / c.currentPrice) - 1) * 100 : 0
      const currentSupply = c.circulatingSupply ?? 0
      const supplyPercent = c.maxSupply ? Math.min(100, (currentSupply / c.maxSupply) * 100) : undefined
      const supplyChange = c.athSupply
        ? ((currentSupply / c.athSupply) - 1) * 100
        : undefined

      return { ...c, athDays, distanceFromAth, recoveryNeeded, currentSupply, supplyPercent, supplyChange }
    })
    .sort((a, b) => (a.marketCap ?? 0) - (b.marketCap ?? 0))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left px-2 py-1.5 font-medium">#</th>
            <th className="text-left px-2 py-1.5 font-medium">Symbol</th>
            <th className="text-right px-2 py-1.5 font-medium">Price</th>
            <th className="text-right px-2 py-1.5 font-medium">ATH</th>
            <th className="text-right px-2 py-1.5 font-medium">ATH Date</th>
            <th className="text-right px-2 py-1.5 font-medium">Days</th>
            <th className="text-right px-2 py-1.5 font-medium">ATH Mcap</th>
            <th className="text-right px-2 py-1.5 font-medium">From ATH</th>
            <th className="text-right px-2 py-1.5 font-medium">Recover</th>
            <th className="text-right px-2 py-1.5 font-medium">Supply %</th>
            <th className="text-right px-2 py-1.5 font-medium">Supply Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
              <td className="px-2 py-1.5 text-muted-foreground">{rows.indexOf(c) + 1}</td>
              <td className="px-2 py-1.5 font-semibold">{c.symbol}</td>
              <td className="px-2 py-1.5 text-right">{smartRound(c.currentPrice)}</td>
              <td className="px-2 py-1.5 text-right">{c.athPrice ? smartRound(c.athPrice) : '—'}</td>
              <td className="px-2 py-1.5 text-right text-muted-foreground">{c.athDate ? new Date(c.athDate).toLocaleDateString() : '—'}</td>
              <td className="px-2 py-1.5 text-right">{c.athDays.toLocaleString()}</td>
              <td className="px-2 py-1.5 text-right">{c.athMarketCap ? smartRound(c.athMarketCap) : '—'}</td>
              <td className="px-2 py-1.5 text-right">
                <span className={c.distanceFromAth < 0 ? 'text-loss' : 'text-gain'}>
                  {c.distanceFromAth.toFixed(1)}%
                </span>
              </td>
              <td className="px-2 py-1.5 text-right text-muted-foreground">
                {c.recoveryNeeded.toFixed(1)}%
              </td>
              <td className="px-2 py-1.5 text-right">
                {c.supplyPercent !== undefined ? (
                  <div className="flex items-center gap-1 justify-end">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gain" style={{ width: `${c.supplyPercent}%` }} />
                    </div>
                    <span>{c.supplyPercent.toFixed(1)}%</span>
                  </div>
                ) : '—'}
              </td>
              <td className="px-2 py-1.5 text-right text-muted-foreground">
                {c.supplyChange !== undefined ? `${c.supplyChange > 0 ? '+' : ''}${c.supplyChange.toFixed(1)}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
