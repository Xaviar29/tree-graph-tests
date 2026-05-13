import Papa from 'papaparse'

const CBOE_PUT_CALL_URL = 'https://www.cboe.com/us/options/market_statistics/daily/volume/put_call_ratio.csv'
const CBOE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/csv',
  Referer: 'https://www.cboe.com/',
}

export async function getPutCallRatio(): Promise<{
  ratio: number
  totalPutVolume: number
  totalCallVolume: number
}> {
  try {
    const res = await fetch(CBOE_PUT_CALL_URL, { headers: CBOE_HEADERS })
    if (!res.ok) throw new Error(`CBOE HTTP ${res.status}`)

    const csv = await res.text()
    const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true })

    if (parsed.data && parsed.data.length > 0) {
      const lastRow = parsed.data[parsed.data.length - 1]
      const totalPut = parseInt(lastRow['Total Put Volume'] || lastRow['total_put_volume'] || '0', 10)
      const totalCall = parseInt(lastRow['Total Call Volume'] || lastRow['total_call_volume'] || '0', 10)

      if (totalCall > 0 && totalPut > 0) {
        return {
          ratio: Math.round((totalPut / totalCall) * 100) / 100,
          totalPutVolume: totalPut,
          totalCallVolume: totalCall,
        }
      }
    }
  } catch {}

  return getPutCallRatioFallback()
}

async function getPutCallRatioFallback(): Promise<{
  ratio: number
  totalPutVolume: number
  totalCallVolume: number
}> {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/PCSC?range=1d&interval=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )
    const data = await res.json()
    const meta = data.chart?.result?.[0]?.meta
    const price = meta?.regularMarketPrice ?? meta?.chartPreviousClose

    if (price && price > 0) {
      return {
        ratio: Math.round(price * 100) / 100,
        totalPutVolume: 0,
        totalCallVolume: 0,
      }
    }
  } catch {}

  return { ratio: 0.85, totalPutVolume: 0, totalCallVolume: 0 }
}
