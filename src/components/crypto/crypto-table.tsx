'use client'

import { useState } from 'react'
import {
  flexRender, getCoreRowModel, getSortedRowModel, getPaginationRowModel,
  useReactTable, createColumnHelper,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sparkline } from '@/components/charts/sparkline'
import { cn, formatChangePercent } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { CryptoMarket } from '@/types/crypto.types'

const columnHelper = createColumnHelper<CryptoMarket>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{info.row.original.symbol}</span>
        <span className="text-xs text-muted-foreground hidden md:inline">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('currentPrice', {
    header: 'Price',
    cell: (info) => `$${info.getValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
    sortingFn: 'basic',
  }),
  columnHelper.accessor('priceChangePercent24h', {
    header: '24h %',
    cell: (info) => {
      const v = info.getValue()
      return <span className={cn('font-medium', v >= 0 ? 'text-gain' : 'text-loss')}>{formatChangePercent(v)}</span>
    },
    sortingFn: 'basic',
  }),
  columnHelper.accessor('marketCap', {
    header: 'Market Cap',
    cell: (info) => {
      const v = info.getValue()
      if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
      if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
      return `$${(v / 1e6).toFixed(2)}M`
    },
    sortingFn: 'basic',
  }),
  columnHelper.accessor('totalVolume', {
    header: 'Volume 24h',
    cell: (info) => {
      const v = info.getValue()
      if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
      return `$${(v / 1e6).toFixed(2)}M`
    },
    sortingFn: 'basic',
  }),
  columnHelper.accessor('sparkline7d', {
    header: '7D',
    cell: (info) => <Sparkline data={info.getValue()} height={28} />,
    enableSorting: false,
  }),
]

interface CryptoTableProps {
  data: CryptoMarket[]
  isLoading?: boolean
}

export function CryptoTable({ data, isLoading }: CryptoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      header.column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" />
                      : header.column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" />
                      : <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-xs">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="opacity-50 hover:opacity-100 disabled:opacity-20">First</button>
        <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="opacity-50 hover:opacity-100 disabled:opacity-20">Last</button>
      </div>
    </div>
  )
}
