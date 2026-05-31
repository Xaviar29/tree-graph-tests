'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { Card } from '@/components/ui/card'

interface BacktestParams {
  initialCapital: number
  riskPerTrade: number
  riskRewardRatio: number
  winRate: number
  commission: number
  tradesPerMonth: number
  months: number
}

const DEFAULT_PARAMS: BacktestParams = {
  initialCapital: 10000,
  riskPerTrade: 1,
  riskRewardRatio: 2,
  winRate: 50,
  commission: 0,
  tradesPerMonth: 20,
  months: 12,
}

function runSimulation(params: BacktestParams, sims = 3000) {
  const results: { finalCap: number; ret: number; dd: number; equity: { m: number; c: number }[] }[] = []
  for (let s = 0; s < sims; s++) {
    let cap = params.initialCapital
    let peak = cap
    let maxDD = 0
    const equity: { m: number; c: number }[] = []
    for (let m = 0; m < params.months; m++) {
      for (let t = 0; t < params.tradesPerMonth; t++) {
        const win = Math.random() < params.winRate / 100
        const risk = cap * (params.riskPerTrade / 100)
        const pnl = win ? risk * params.riskRewardRatio - params.commission : -risk - params.commission
        cap += pnl
        if (cap > peak) peak = cap
        maxDD = Math.max(maxDD, (peak - cap) / peak)
      }
      equity.push({ m: m + 1, c: cap })
    }
    results.push({ finalCap: cap, ret: (cap - params.initialCapital) / params.initialCapital * 100, dd: maxDD * 100, equity })
  }
  return results
}

export function BacktestEngine() {
  const [params, setParams] = useState<BacktestParams>(DEFAULT_PARAMS)

  const results = useMemo(() => runSimulation(params, 3000), [params])

  const stats = useMemo(() => {
    const caps = results.map(r => r.finalCap)
    const rets = results.map(r => r.ret)
    const dds = results.map(r => r.dd)
    const probProfit = results.filter(r => r.finalCap > params.initialCapital).length / results.length
    const avgEq = Array.from({ length: params.months }, (_, m) => ({
      month: m + 1,
      avg: results.reduce((s, r) => s + r.equity[m].c, 0) / results.length,
    }))
    const profitBins = Array.from({ length: 16 }, (_, i) => {
      const lo = -400 + i * 50
      return { range: `${lo}%`, count: results.filter(r => r.ret >= lo && r.ret < lo + 50).length }
    })
    const pnlBins = Array.from({ length: 10 }, (_, i) => {
      const lo = i * 10
      return { range: `${lo}%`, count: results.filter(r => r.dd >= lo && r.dd < lo + 10).length }
    })
    return {
      avgFinal: Math.round(caps.reduce((s, v) => s + v, 0) / results.length),
      avgRet: Math.round(rets.reduce((s, v) => s + v, 0) / results.length * 100) / 100,
      avgDD: Math.round(dds.reduce((s, v) => s + v, 0) / results.length * 100) / 100,
      probProfit: Math.round(probProfit * 10000) / 100,
      maxDD: Math.round(Math.max(...dds) * 100) / 100,
      sampleEq: results.filter((_, i) => i % 60 === 0).slice(0, 50).map(r => r.equity),
      avgEq,
      profitBins,
      pnlBins,
    }
  }, [results, params.initialCapital, params.months])

  const set = (key: keyof BacktestParams, v: number) => setParams(p => ({ ...p, [key]: v }))

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-sm font-semibold text-foreground">Monte Carlo Backtest Simulator</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {([{k:'initialCapital',l:'Init Capital',min:100,max:1e6,step:1e3},{k:'riskPerTrade',l:'Risk %',min:.1,max:10,step:.1},{k:'riskRewardRatio',l:'R:R',min:.5,max:10,step:.5},{k:'winRate',l:'Win Rate %',min:10,max:90,step:1},{k:'commission',l:'Comm $',min:0,max:50,step:.5},{k:'tradesPerMonth',l:'Trades/Mo',min:1,max:200,step:1},{k:'months',l:'Months',min:1,max:60,step:1}] as {k:keyof BacktestParams;l:string;min:number;max:number;step:number}[]).map(({k,l,min,max,step}) => (
          <div key={k} className="bg-muted/30 border border-border rounded-lg p-2">
            <label className="text-[10px] text-muted-foreground block mb-1">{l}</label>
            <input type="number" value={params[k]} min={min} max={max} step={step}
              onChange={e => set(k, parseFloat(e.target.value) || min)}
              className="w-full bg-background text-xs text-foreground border border-border rounded px-2 py-1" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[{l:'Avg Final',v:`$${stats.avgFinal.toLocaleString()}`},{l:'Avg Return',v:`${stats.avgRet}%`,c:stats.avgRet>=0?'text-gain':'text-loss'},{l:'Avg Drawdown',v:`${stats.avgDD}%`,c:'text-loss'},{l:'Prob Profit',v:`${stats.probProfit}%`,c:stats.probProfit>60?'text-gain':'text-warning'}].map(({l,v,c}) => (
          <Card key={l} className="p-2 text-center">
            <div className="text-[10px] text-muted-foreground">{l}</div>
            <div className={`text-sm font-semibold ${c || 'text-foreground'}`}>{v}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Equity Curves (50 samples)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
              <XAxis dataKey="month" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip />
              {stats.sampleEq.map((eq, i) => (
                <Line key={i} data={eq} type="monotone" dataKey="c" stroke="#6366f1" strokeWidth={0.4} opacity={0.12} dot={false} isAnimationActive={false} />
              ))}
              <Line data={stats.avgEq} type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceLine y={params.initialCapital} stroke="#9ca3af" strokeDasharray="4 4" opacity={0.3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Return Distribution</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.profitBins} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
              <XAxis dataKey="range" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" opacity={0.6} radius={[1,1,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-3">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Drawdown Probability</h4>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={stats.pnlBins} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
            <XAxis dataKey="range" tick={{ fontSize: 8 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="count" fill="#ef4444" opacity={0.5} radius={[1,1,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[9px] text-muted-foreground">Based on 3,000 Monte Carlo simulations. Simulated performance does not guarantee future results.</p>
    </div>
  )
}
