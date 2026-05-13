'use client'

import { useForex } from '@/hooks/use-forex'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/error-state'
import { formatChange } from '@/lib/utils'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Quote } from '@/types/market.types'

const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'name',
    header: 'Par',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'symbol',
    header: 'Símbolo',
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Precio</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'))
      return <div className="text-right font-medium">{price.toFixed(4)}</div>
    },
  },
  {
    accessorKey: 'change',
    header: () => <div className="text-right">Cambio</div>,
    cell: ({ row }) => {
      const change = parseFloat(row.getValue('change'))
      const isPositive = change >= 0
      return (
        <div className={`text-right ${isPositive ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
          {isPositive ? '+' : ''}{change.toFixed(4)}
        </div>
      )
    },
  },
  {
    accessorKey: 'changePercent',
    header: () => <div className="text-right">%</div>,
    cell: ({ row }) => {
      const changePercent = parseFloat(row.getValue('changePercent'))
      const isPositive = changePercent >= 0
      return (
        <div className={`text-right ${isPositive ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      )
    },
  },
]

export default function ForexPage() {
  const { data, isLoading, error, refetch } = useForex()

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <ErrorState message={error.message || 'Error al cargar forex'} onRetry={() => refetch()} />
      </div>
    )
  }

  // Find DXY for a highlight card
  const dxy = data?.find(q => q.symbol === 'DX-Y.NYB')
  const pairs = data?.filter(q => q.symbol !== 'DX-Y.NYB') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Forex</h2>
          <p className="text-muted-foreground">
            Mercado de divisas y cruces mayores frente al Dólar.
          </p>
        </div>
      </div>

      {dxy && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">U.S. Dollar Index (DXY)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-4">
              <div className="text-4xl font-bold">{dxy.price.toFixed(2)}</div>
              <div className={`text-lg font-medium ${dxy.change >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                {formatChange(dxy.change)} ({formatChange(dxy.changePercent)}%)
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Índice que mide el valor del dólar estadounidense con relación a una canasta de monedas extranjeras.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pares Mayores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={pairs} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
