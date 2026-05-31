'use client'

import { useState } from 'react'
import { useOnFire } from '@/hooks/use-onfire'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

function scoreColor(score: number): string {
  if (score >= 80) return 'bg-red-500/90'
  if (score >= 60) return 'bg-orange-500/80'
  if (score >= 40) return 'bg-yellow-500/70'
  if (score >= 20) return 'bg-blue-500/60'
  return 'bg-slate-600/50'
}

function scoreTextColor(score: number): string {
  return score >= 60 ? 'text-white' : 'text-foreground'
}

export default function OnFirePage() {
  const [category, setCategory] = useState('all')
  const { data: assets, isLoading } = useOnFire(category)
  const maxScore = Math.max(...(assets ?? []).map((a) => a.score), 1)

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">On Fire Heatmap</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Assets ranked by momentum — volume spikes + price action + volatility</p>
        </div>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="forex">Forex</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="text-xs text-muted-foreground/60 italic">
        Score formula: price momentum (40%) + volatility (30%) + volume activity (30%). Auto-refreshes every 5 min.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {(assets ?? []).map((asset, i) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
            >
              <Card className={`p-3 ${scoreColor(asset.score)} transition-all hover:scale-105 cursor-default border-0`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold ${scoreTextColor(asset.score)}`}>{asset.symbol}</p>
                  <span className={`text-[10px] opacity-70 ${scoreTextColor(asset.score)}`}>{asset.category}</span>
                </div>
                <p className={`text-[10px] mt-0.5 opacity-80 ${scoreTextColor(asset.score)}`}>{asset.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${scoreTextColor(asset.score)}`}>{asset.score}</span>
                  <span className={`text-[10px] opacity-60 ${scoreTextColor(asset.score)}`}>/ 100</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-[11px] font-medium ${
                    asset.priceChange24h > 0 ? 'text-gain' : asset.priceChange24h < 0 ? 'text-loss' : ''
                  } ${scoreTextColor(asset.score)} opacity-90`}>
                    {asset.priceChange24h > 0 ? '+' : ''}{asset.priceChange24h}%
                  </span>
                  <span className={`text-[10px] opacity-60 ${scoreTextColor(asset.score)}`}>
                    {(asset.volume24h / 1e9).toFixed(1)}B vol
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
