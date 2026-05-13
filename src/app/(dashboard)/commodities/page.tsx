'use client'

import { useCommodities } from '@/hooks/use-commodities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { formatChange } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CommoditiesPage() {
  const { data, isLoading, error, refetch } = useCommodities()

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <ErrorState message={error.message || 'Error al cargar materias primas'} onRetry={() => refetch()} />
      </div>
    )
  }

  // Calculate Gold/Silver ratio if both are available
  const gold = data?.find(q => q.symbol === 'GC=F')
  const silver = data?.find(q => q.symbol === 'SI=F')
  const goldSilverRatio = gold && silver ? gold.price / silver.price : null

  // Prepare chart data for daily performance
  const chartData = data?.map(q => ({
    name: q.name,
    change: q.changePercent,
    symbol: q.symbol,
  })).sort((a, b) => b.change - a.change) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Materias Primas</h2>
          <p className="text-muted-foreground">
            Cotizaciones principales de metales y energía.
          </p>
        </div>
      </div>

      {goldSilverRatio && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ratio Oro / Plata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goldSilverRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Onzas de plata necesarias para comprar una onza de oro.
              Un ratio alto (&gt;80) suele indicar plata infravalorada.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))
        ) : (
          data?.map(quote => (
            <Card key={quote.symbol}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {quote.name} ({quote.symbol})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${quote.price.toFixed(2)}</div>
                <p className={`text-xs ${quote.change >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                  {formatChange(quote.change)} ({formatChange(quote.changePercent)}%)
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Diario</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="change" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
