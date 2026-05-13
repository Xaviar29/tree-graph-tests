'use client'

import { useSectorsPerformance, useSectorsRRG } from '@/hooks/use-sectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TreemapChart } from '@/components/charts/treemap-chart'
import { RRGChart } from '@/components/charts/rrg-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { formatChange } from '@/lib/utils'

export default function SectorsPage() {
  const { 
    data: performanceData, 
    isLoading: isLoadingPerformance, 
    error: errorPerformance, 
    refetch: refetchPerformance 
  } = useSectorsPerformance()

  const {
    data: rrgData,
    isLoading: isLoadingRRG,
    error: errorRRG,
    refetch: refetchRRG
  } = useSectorsRRG()

  if (errorPerformance || errorRRG) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <ErrorState 
          message={(errorPerformance || errorRRG)?.message || 'Error al cargar sectores'} 
          onRetry={() => {
            if (errorPerformance) refetchPerformance()
            if (errorRRG) refetchRRG()
          }} 
        />
      </div>
    )
  }

  // Map data to Treemap structure
  const treemapData = performanceData?.map(item => ({
    name: item.sector.name,
    symbol: item.sector.symbol,
    size: item.weight,
    value: item.quote.changePercent,
    fill: item.sector.color,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sectores (S&P 500)</h2>
          <p className="text-muted-foreground">
            Análisis de rendimiento y rotación relativa de los 11 sectores del S&P 500.
          </p>
        </div>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide">
          <TabsTrigger value="performance" className="min-w-fit">Rendimiento (Treemap)</TabsTrigger>
          <TabsTrigger value="rrg" className="min-w-fit">Relative Rotation Graph (RRG)</TabsTrigger>
          <TabsTrigger value="list" className="min-w-fit">Vista Detallada</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Calor Sectorial</CardTitle>
              <CardDescription>
                Tamaño de los bloques basado en el peso aproximado dentro del S&P 500.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPerformance ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <TreemapChart data={treemapData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rrg">
          <Card>
            <CardHeader>
              <CardTitle>RRG - Relative Rotation Graph</CardTitle>
              <CardDescription>
                Muestra la fuerza y momento relativo de los sectores frente al S&P 500 (SPY).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isLoadingRRG ? (
                <Skeleton className="h-[600px] w-full max-w-[800px]" />
              ) : (
                rrgData && <RRGChart data={rrgData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingPerformance ? (
              Array.from({ length: 11 }).map((_, i) => (
                <Skeleton key={i} className="h-[120px] w-full" />
              ))
            ) : (
              performanceData?.map(item => (
                <Card key={item.sector.symbol}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {item.sector.name} ({item.sector.symbol})
                    </CardTitle>
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.sector.color }} 
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${item.quote.price.toFixed(2)}</div>
                    <p className={`text-xs ${item.quote.change >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                      {formatChange(item.quote.change)} ({formatChange(item.quote.changePercent)}%)
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Peso S&P 500: ~{item.weight.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
