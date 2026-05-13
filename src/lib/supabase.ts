import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  client = createClient(url, key)
  return client
}

export interface BreadthHistoryRow {
  date: string
  advancing: number
  declining: number
  net_advances: number
  ad_line?: number
  oscillator?: number | null
  summation_index?: number | null
}

export async function getBreadthHistory(): Promise<BreadthHistoryRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('breadth_history')
    .select('*')
    .order('date', { ascending: true }) as { data: BreadthHistoryRow[] | null; error: any }
  if (error) {
    console.error('Supabase fetch error:', error.message)
    return []
  }
  return data ?? []
}

export async function upsertBreadthHistory(row: BreadthHistoryRow) {
  const supabase = getSupabase()
  if (!supabase) return
  const { error } = await supabase
    .from('breadth_history')
    .upsert(row as any, { onConflict: 'date' })
  if (error) {
    console.error('Supabase upsert error:', error.message)
  }
}
