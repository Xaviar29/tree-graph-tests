const CNN_URL = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata'
const CNN_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json',
  Referer: 'https://money.cnn.com/',
}

interface FearGreedJson {
  fear_and_greed: {
    score: number
    previous_close: number
    previous_1_week: number
    previous_1_month: number
  }
}

export async function getFearGreedFromCNN(): Promise<{
  value: number
  label: string
  previousClose: number
  weekAgo: number
  monthAgo: number
}> {
  const res = await fetch(CNN_URL, { headers: CNN_HEADERS })
  if (!res.ok) throw new Error(`CNN Fear & Greed failed: ${res.status}`)

  const data: FearGreedJson = await res.json()
  const score = Math.round(data.fear_and_greed.score)

  const label =
    score <= 25 ? 'Extreme Fear'
    : score <= 40 ? 'Fear'
    : score <= 60 ? 'Neutral'
    : score <= 75 ? 'Greed'
    : 'Extreme Greed'

  return {
    value: score,
    label,
    previousClose: Math.round(data.fear_and_greed.previous_close),
    weekAgo: Math.round(data.fear_and_greed.previous_1_week),
    monthAgo: Math.round(data.fear_and_greed.previous_1_month),
  }
}

// Fallback self-calculated Fear & Greed when CNN is unavailable
export async function calculateFearGreedComposite(): Promise<{
  value: number
  label: string
}> {
  const factors = await Promise.allSettled([
    getStockMomentum(),
    getSafeHavenDemand(),
    getVIXInverse(),
  ])

  let validScores = 0
  let totalScore = 0

  for (const f of factors) {
    if (f.status === 'fulfilled' && f.value !== null) {
      totalScore += f.value
      validScores++
    }
  }

  const score = validScores > 0 ? Math.round(totalScore / validScores) : 50
  const label =
    score <= 25 ? 'Extreme Fear'
    : score <= 40 ? 'Fear'
    : score <= 60 ? 'Neutral'
    : score <= 75 ? 'Greed'
    : 'Extreme Greed'

  return { value: score, label }
}

async function getStockMomentum(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=1y&interval=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )
    const data = await res.json()
    const closes = data.chart.result?.[0]?.indicators?.quote?.[0]?.close
    if (!closes || closes.length < 125) return null

    const current = closes[closes.length - 1]
    const ma125 = closes.slice(-125).reduce((a: number, b: number) => a + b, 0) / 125
    const ratio = current / ma125
    return Math.min(100, Math.max(0, ((ratio - 0.85) / 0.3) * 100))
  } catch {
    return null
  }
}

async function getSafeHavenDemand(): Promise<number | null> {
  try {
    const [spyRes, tltRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=3mo&interval=1d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/TLT?range=3mo&interval=1d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }),
    ])

    const spyData = await spyRes.json()
    const tltData = await tltRes.json()

    const spyClose = spyData.chart.result?.[0]?.indicators?.quote?.[0]?.close
    const tltClose = tltData.chart.result?.[0]?.indicators?.quote?.[0]?.close
    if (!spyClose || !tltClose) return null

    const spyPerf = (spyClose[spyClose.length - 1] / spyClose[0] - 1) * 100
    const tltPerf = (tltClose[tltClose.length - 1] / tltClose[0] - 1) * 100
    const ratio = spyPerf - tltPerf

    return Math.min(100, Math.max(0, 50 - ratio * 2))
  } catch {
    return null
  }
}

async function getVIXInverse(): Promise<number | null> {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?range=1mo&interval=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )
    const data = await res.json()
    const closes = data.chart.result?.[0]?.indicators?.quote?.[0]?.close
    if (!closes || closes.length === 0) return null

    const vix = closes[closes.length - 1]
    return Math.min(100, Math.max(0, 100 - vix * 2))
  } catch {
    return null
  }
}
