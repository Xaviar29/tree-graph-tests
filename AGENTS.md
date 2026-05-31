<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MARKETPULSE — GUÍA PARA AGENTS

> **PROYECTO PRINCIPAL.** Salvo que se indique lo contrario, todo el trabajo se realiza sobre este proyecto. `trading-dashboard/` es un proyecto legacy/archivado.

## Stack
- Next.js 16.2.6 + TypeScript + Tailwind v4 + shadcn/ui
- lightweight-charts v5, Recharts v3
- TanStack Query v5, Zustand v5
- Upstash Redis, Supabase, Sentry, Stripe

## Cómo hacer deploy a producción
```powershell
cd G:\utils\programming\python\code\antigravity\tradingdifferent\MarketPulse
npm run build
vercel --prod --yes
```

## URLs
- Producción: https://marketpulse-delta-six.vercel.app
- GitHub: pendiente de crear repo

## Secciones (10 en sidebar)

| Sección | Ruta | Estado |
|---------|------|--------|
| Overview | `/` | ✅ Dashboard con widgets resumen |
| Indices | `/indices` | ✅ Candlestick + MetricCards |
| Breadth | `/breadth` | ✅ A/D, McClellan, %MA, NH/NL |
| Sentiment | `/sentiment` | ✅ F&G, VIX, Put/Call |
| Sectors | `/sectors` | ✅ Treemap, RRG |
| Commodities | `/commodities` | ✅ 6 commodities charts |
| Forex | `/forex` | ✅ Forex + DataTable |
| Crypto | `/crypto` | ✅ **8 tabs**: Overview, Dominance, BTC Model, BTC ETFs, Emission, BTCvsGold, CME Futures, Supplier, Liquidations |
| Liquidations | `/liquidations` | ✅ **7 tabs**: Heatmap, Simple Map, Profile, HF Chart, Hyperliquid, Exchanges |
| On Fire | `/onfire` | ✅ Grid heatmap con scoring 0-100 |
| Tools | `/tools` | ✅ **5 tabs**: TrenDiff, Risk Calculator, Historical Chart, Bot Signals, Backtest Simulator |

## Data Sources — Alpaca Markets

Alpaca Markets API configurada con Paper Trading account.

| Tipo | Primario | Fallback | Archivo |
|------|----------|----------|---------|
| **Stock/ETF quotes** | Yahoo Finance (composite) | Alpaca IEX (`/v2/stocks/snapshots`) | `yahoo-finance.ts` |
| **Stock/ETF históricos** | Yahoo Finance v8 | Alpaca Bars (`/v2/stocks/{symbol}/bars`) | `yahoo-finance.ts` |
| **Crypto OHLCV** (BTC, ETH, LTC) | **Alpaca Crypto Bars** (`/v2/crypto/{symbol}/bars`) | CoinGecko OHLC | `coingecko.ts` |
| **Crypto market cap, dominance, ranking** | CoinGecko | — | `coingecko.ts` |
| **VIX, Fear & Greed, Put/Call** | CNN/CBOE/Yahoo | — | `sentiment/*` |
| **Forex** | Yahoo Finance | — | `yahoo-finance.ts` |
| **Commodities** | Yahoo Finance | — | `yahoo-finance.ts` |
| **Liquidations** | Binance+Bybit+BitMEX WS | — | `binance-ws.ts`, `bybit-ws.ts`, `bitmex-ws.ts` |
| **Economic Calendar** | FRED API | — | `economic-calendar` |
| **Geopolitical Timeline** | GDELT API | — | `geopolitical-timeline` |
| **S2F, ETFs, Emission, BTCvsGold, CME, Supplier, Holders** | Sintético (modelo) | — | `api/crypto/*` |

## API routes

| Ruta | Propósito |
|------|-----------|
| `/api/crypto` | CoinGecko markets/global/historical (OHLCV via Alpaca para BTC/ETH) |
| `/api/crypto/liquidity-depth` | Binance Depth |
| `/api/crypto/whale-positions` | Hyperliquid allMids |
| `/api/crypto/volume-conviction` | Binance Klines + conviction calc |
| `/api/crypto/technical-indicators` | Binance Klines + RSI/MACD |
| `/api/crypto/economic-calendar` | FRED 15 series US |
| `/api/crypto/geopolitical-timeline` | GDELT DOC API |
| `/api/crypto/open-interest` | Bybit V5 REST |
| `/api/crypto/s2f` | BTC Stock-to-Flow model (synthetic) |
| `/api/crypto/etfs` | BTC ETF holdings + flow + price (synthetic) |
| `/api/crypto/emission` | Bitcoin supply curve + inflation |
| `/api/crypto/btc-vs-gold` | BTC vs Gold comparison (synthetic) |
| `/api/crypto/cme-futures` | CME gap + premium/discount (synthetic) |
| `/api/crypto/supplier` | BTC mining cost / supplier model (synthetic) |
| `/api/crypto/holders` | BTC holders categories, companies, countries |
| `/api/liquidations/*` | Multi-exchange WS (Binance, Bybit, BitMEX) |
| `/api/market/quote` | Yahoo Finance → Alpaca fallback |
| `/api/market/historical` | Yahoo Finance → Alpaca fallback |
| `/api/breadth/*` | Yahoo Finance S&P 500 + Supabase |
| `/api/sentiment/*` | CNN, CBOE, Yahoo |
| `/api/sectors/*` | Yahoo Finance |
| `/api/commodities` | Yahoo Finance |
| `/api/forex` | Yahoo Finance |
| `/api/onfire` | Synthetic |
| `/api/tools/bots` | CoinGecko + Alpaca (via coingecko.ts) |

## WebSocket Connections (server-side)
| Exchange | Endpoint | Topics | Status |
|----------|----------|--------|--------|
| Binance | `wss://fstream.binance.com/ws/!forceOrder@arr` | Force orders | ✅ Implemented |
| Bybit | `wss://stream.bybit.com/v5/public/linear` | Liquidation | ✅ Implemented |
| BitMEX | `wss://ws.bitmex.com/realtime` | Liquidation, Instrument | ✅ Implemented |

## Providers
| Archivo | Propósito |
|---------|-----------|
| `alpaca-markets.ts` | Alpaca Markets data API (fallback quotes/bars, primary crypto) |
| `yahoo-finance.ts` | Yahoo Finance v8 quotes/historical → Alpaca fallback |
| `coingecko.ts` | CoinGecko markets/global/historical → Alpaca primary for BTC/ETH OHLCV |
| `binance-ws.ts` | Binance Futures WebSocket (liquidations) |
| `bybit-ws.ts` | Bybit V5 WebSocket (liquidations) |
| `bitmex-ws.ts` | BitMEX WebSocket (liquidations, instrument) |
| `cnn-fear-greed.ts` | CNN Fear & Greed Index |
| `cboe.ts` | CBOE Put/Call Ratio |
| `vix.ts` | Yahoo Finance VIX (^VIX) |

## Notas
- Salvo que se indique lo contrario, trabajar sobre este proyecto (MarketPulse), no sobre trading-dashboard
- Yahoo Finance v8: `query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- Alpaca Data API: `https://data.alpaca.markets/v2/stocks/snapshots?symbols=...`
- Alpaca Crypto: `https://data.alpaca.markets/v2/crypto/{symbol}/bars`
- Datos sintéticos usan Mulberry32 PRNG (seed por fecha) en `lib/random.ts`
- La landing page (marketing) está en `src/app/page.tsx`
- El dashboard overview está en `src/app/(dashboard)/page.tsx`
- Ver `planning.md` para estado detallado
- Ver `docs/superpowers/specs/2026-05-14-marketpulse-sections-design.md` para el diseño completo
