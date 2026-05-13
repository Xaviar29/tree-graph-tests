import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const WIKI_URL = 'https://en.wikipedia.org/w/api.php?action=parse&page=List_of_S%26P_500_companies&format=json&prop=text&section=1'

async function fetchSP500() {
  const res = await fetch(WIKI_URL)
  const data = await res.json()

  const html = data.parse.text['*']
  const tableMatch = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/i)
  if (!tableMatch) throw new Error('Could not find wikitable')

  const rows = tableMatch[0].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
  const symbols = []

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].match(/<td[^>]*>[\s\S]*?<\/td>/gi)
    if (!cells || cells.length < 1) continue

    const tickerMatch = cells[0].match(/<a[^>]*>([^<]+)<\/a>/)
    if (!tickerMatch) continue

    let sym = tickerMatch[1].trim().replace(/\./g, '-')
    if (sym) symbols.push(sym)
  }

  return symbols
}

fetchSP500()
  .then((symbols) => {
    const outPath = join(__dirname, '..', 'src', 'data', 'sp500-symbols.json')
    writeFileSync(outPath, JSON.stringify(symbols, null, 2), 'utf-8')
    console.log(`Written ${symbols.length} symbols to ${outPath}`)
  })
  .catch((err) => {
    console.error('Failed:', err.message)
    process.exit(1)
  })
