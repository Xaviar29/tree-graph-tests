'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function RiskCalculator() {
  const [balance, setBalance] = useState(10000)
  const [riskPct, setRiskPct] = useState(1)
  const [entry, setEntry] = useState(50000)
  const [stopLoss, setStopLoss] = useState(48000)
  const [takeProfit, setTakeProfit] = useState(55000)

  const riskAmount = balance * (riskPct / 100)
  const riskPerUnit = Math.abs(entry - stopLoss)
  const positionSize = riskPerUnit > 0 ? riskAmount / riskPerUnit : 0
  const positionValue = positionSize * entry
  const rewardPerUnit = Math.abs(takeProfit - entry)
  const rrRatio = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0
  const potentialProfit = positionSize * rewardPerUnit * (takeProfit > entry ? 1 : -1)
  const maxLoss = positionSize * riskPerUnit

  useEffect(() => {
    try { localStorage.setItem('mp-risk-calc', JSON.stringify({ balance, riskPct, entry, stopLoss, takeProfit })) }
    catch {}
  }, [balance, riskPct, entry, stopLoss, takeProfit])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mp-risk-calc')
      if (saved) {
        const d = JSON.parse(saved)
        setBalance(d.balance ?? 10000)
        setRiskPct(d.riskPct ?? 1)
        setEntry(d.entry ?? 50000)
        setStopLoss(d.stopLoss ?? 48000)
        setTakeProfit(d.takeProfit ?? 55000)
      }
    } catch {}
  }, [])

  const inputClass = "h-8 text-xs bg-muted border-muted-foreground/20 focus:border-primary"

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-4 space-y-3">
        <p className="text-xs font-semibold text-foreground">Position Parameters</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground">Account Balance ($)</label>
            <Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Risk (%)</label>
            <Input type="number" value={riskPct} onChange={(e) => setRiskPct(Number(e.target.value))} step={0.1} min={0.1} max={100} className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Entry Price ($)</label>
            <Input type="number" value={entry} onChange={(e) => setEntry(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Stop Loss ($)</label>
            <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Take Profit ($)</label>
            <Input type="number" value={takeProfit} onChange={(e) => setTakeProfit(Number(e.target.value))} className={inputClass} />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <p className="text-xs font-semibold text-foreground">Results</p>
        <div className="space-y-2">
          {[
            { label: 'Risk Amount', value: `$${riskAmount.toFixed(2)}`, color: 'text-loss' },
            { label: 'Position Size', value: `${positionSize.toFixed(4)} units` },
            { label: 'Position Value', value: `$${positionValue.toFixed(2)}` },
            { label: 'R:R Ratio', value: `1:${rrRatio.toFixed(2)}`, color: rrRatio >= 2 ? 'text-gain' : 'text-warning' },
            { label: 'Potential Profit', value: `$${potentialProfit.toFixed(2)}`, color: potentialProfit > 0 ? 'text-gain' : 'text-loss' },
            { label: 'Max Loss', value: `$${maxLoss.toFixed(2)}`, color: 'text-loss' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className={`text-xs font-bold ${item.color ?? 'text-foreground'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
