# MarketPulse — Plan de Implementación

> **Marca:** MarketPulse
> **Tagline:** "Feel the rhythm of the markets"
> **Colores:** Azul marino + Verde esmeralda (#10b981)
> **Stack:** Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui
> **Base:** trading-dashboard (fork con rebranding + mejoras)
> **Spec:** `docs/superpowers/specs/2026-05-14-marketpulse-sections-design.md`

---

## Sidebar — 10 secciones

```
📊 Overview       /              ← Dashboard with summary widgets
📈 Indices        /indices       ← ✓ existente
📊 Breadth        /breadth       ← ✓ existente
🎯 Sentiment      /sentiment     ← ✓ existente
🪙 Crypto         /crypto        ← 7 tabs (2 existentes + 5 nuevas)
🔥 Liquidations   /liquidations  ← 7 tabs (2 existentes + 5 nuevas)
🔥 On Fire        /onfire        ← ★ NUEVA sección
🧰 Tools          /tools         ← ★ NUEVA sección (3 tabs)
📦 Commodities    /commodities   ← ✓ existente
💱 Forex          /forex         ← ✓ existente
🏭 Sectors        /sectors       ← ✓ existente
```

---

## FASE 0: Branding & Setup ✅ COMPLETADO

- [x] Crear carpeta MarketPulse y copiar base desde trading-dashboard
- [x] Instalar dependencias, package.json rebrandeado
- [x] Tema visual (globals.css): azul marino + verde esmeralda
- [x] Logo SVG, favicon, landing page con hero/features/pricing/footer
- [x] Sidebar y header rebrandeados
- [x] AGENTS.md reescrito, metadata actualizada
- [x] Build verificado — 0 errores TypeScript

---

## FASE 1: Core Sections ✅ COMPLETADO

### 1.1 Landing Page
- [x] Hero, features grid, pricing cards (Free/Premium/Pro), footer

### 1.2 Secciones base (heredadas de trading-dashboard)
- [x] Indices (/indices) — Candlestick + MetricCards
- [x] Breadth (/breadth) — A/D, McClellan, %MA, NH/NL
- [x] Sentiment (/sentiment) — F&G, VIX, Put/Call gauges
- [x] Sectors (/sectors) — Treemap, RRG, performance
- [x] Commodities (/commodities) — Commodity charts
- [x] Forex (/forex) — Forex pairs + DataTable
- [x] Crypto (/crypto) — 2 tabs: Overview + Dominance
- [x] Liquidations (/liquidations) — Heatmap + exchanges
- [x] PWA: manifest, service worker, install prompt

---

## FASE 2: TradingDifferent Charts — Crypto 🪙 EN PROGRESO

Añadir todas las charts de tradingdifferent.com a la sección Crypto (7 tabs total).

### 2.1 Tabs existentes
- [x] Overview — market cap, BTC.D, ETH.D, top 50
- [x] Dominance — BTC/ETH/Others + BTC.D history

### 2.2 BTC Model (S2F) — ✅ COMPLETADO
- [x] Stock-to-Flow chart: precio real vs modelo
- [x] Proyección 5 años
- [x] API route: GET /api/crypto/s2f
- [x] Chart: Recharts AreaChart dual-axis

### 2.3 BTC ETFs — ✅ COMPLETADO
- [x] BTC Spot ETF Holdings (total BTC por día)
- [x] BTC Spot ETF: Average Buy Price por ETF
- [x] BTC Spot ETF: Flow by Day (inflow/outflow)
- [x] API route: GET /api/crypto/etfs
- [x] Charts: Recharts LineChart + BarChart

### 2.4 Emission Rate — ✅ COMPLETADO
- [x] Bitcoin supply curve + inflation rate overlay
- [x] Halving markers en timeline
- [x] API route: GET /api/crypto/emission
- [x] Chart: Recharts AreaChart + LineChart

### 2.5 BTC vs Gold — ✅ COMPLETADO
- [x] BTC price vs Gold price (normalizado)
- [x] Supply evolution comparison
- [x] API route: GET /api/crypto/btc-vs-gold
- [x] Chart: Recharts LineChart dual-axis

### 2.6 CME Futures — ✅ COMPLETADO
- [x] BTC/ETH CME gap analysis
- [x] Premium/Discount chart (basis)
- [x] API route: GET /api/crypto/cme-futures
- [x] Charts: Recharts BarChart + AreaChart

---

## FASE 3: TradingDifferent Charts — Liquidations 🔥 EN PROGRESO

Añadir todas las charts de liquidaciones de tradingdifferent.com (7 tabs total).

### 3.1 Tabs existentes
- [x] Heatmap — KDE density heatmap
- [x] Exchanges — Binance/Bybit status selector

### 3.2 Simple Map — ✅ COMPLETADO
- [x] Simplified liquidation density bars (1D horizontal)
- [x] Color-coded price levels
- [x] Componente: LiquidationSimpleMap
- [x] API route: GET /api/liquidations/simple-map

### 3.3 Profile — ✅ COMPLETADO
- [x] Per-position liquidation detail
- [x] Visual: horizontal liquidation clusters
- [x] Tabla detallada con side/price/qty/notional/time
- [x] Componente: LiquidationProfile

### 3.4 HF Chart — ✅ COMPLETADO
- [x] High Frequency time-series chart (lightweight-charts)
- [x] 1-minute candles of liquidation events
- [x] Volume-weighted price levels
- [x] Componente: HighFreqChart
- [x] API route: GET /api/liquidations/high-freq

### 3.5 Hyperliquid DEX — ✅ COMPLETADO
- [x] Liquidation heatmap for Hyperliquid DEX (synthetic data)
- [x] API route: GET /api/liquidations/hyperliquid
- [x] Tab reusing LiquidationHeatmap component

---

## FASE 4: On Fire 🔥 ✅ COMPLETADO

### 4.1 Página: /onfire
- [x] On Fire Heatmap: grid de assets con score 0-100
- [x] Algoritmo: volume spike + price change 24h + volatility
- [x] Filter por categoría: Crypto, Stocks, Forex, Commodities
- [x] Auto-refresh 5 min
- [x] Sortable por score, volume, change
- [x] Componente: OnFireHeatmap (CSS grid heatmap)
- [x] API route: GET /api/onfire?category=crypto

---

## FASE 5: Tools 🧰 ✅ COMPLETADO

### 5.1 Página: /tools — 3 tabs
- [x] Tab container con shadcn Tabs

### 5.2 TrenDiff Indicator
- [x] Trend strength indicator con zonas coloreadas
- [x] Señales buy/sell basadas en EMA crossover
- [x] Selector de símbolo + timeframe
- [x] Componente: TrenDiffChart

### 5.3 Risk Calculator
- [x] Inputs: balance, risk %, entry, stop loss, take profit
- [x] Outputs: position size, R:R ratio, max loss
- [x] Persistencia en localStorage
- [x] Componente: RiskCalculator

### 5.4 Historical Chart
- [x] Explorador histórico (mock data, synthetic candles)
- [x] Candlestick + volume
- [x] Componente: reutiliza CandlestickChart

---

## FASE 6: Overview Dashboard 📊 ✅ COMPLETADO

### 6.1 Página: / dentro de (dashboard)
- [x] Quick stats strip (MarketOverviewStrip)
- [x] 6 summary widgets: Indices, Breadth, Sentiment, Crypto, On Fire, Tools
- [x] Quick links grid a todas las secciones
- [x] Animaciones framer-motion

---

## FASE 7: Features Exclusivas 🏆 PENDIENTE

### 7.1 High Frequency Bot Tracking
- [x] Binance WS + Bybit WS + unified service
- [x] Exchange selector + status
- [ ] Extender → Deribit WS
- [ ] Extender → Hyperliquid WS

### 7.2 Alertas Mejoradas
- [x] Motor de alertas (heredado)
- [ ] UI de gestión (tabla + toggle)
- [ ] Notificaciones push (service worker)

---

## FASE 8: Monetización 💰 EN PROGRESO

### 8.1 Stripe
- [x] stripe.js, cliente server-side
- [x] API routes: checkout, webhook, pricing
- [x] Pricing buttons conectados
- [ ] Crear precios en Stripe Dashboard
- [ ] Configurar .env.local con Stripe keys

### 8.2 Afiliados
- [ ] Enlaces a Binance, Bybit, Coinbase, Kraken
- [ ] Tracking de clicks
- [ ] Página "Exchange Benefits"

---

## FASE 9: Polaco & Producción ✨ PENDIENTE

### 9.1 SEO
- [ ] Meta tags dinámicos, sitemap.xml, robots.txt
- [ ] Glosario financiero (/glossary)

### 9.2 Blog
- [ ] Estructura de blog + RSS feed

### 9.3 Testing
- [ ] Playwright E2E tests
- [ ] Stripe test mode
- [ ] Lighthouse audit

### 9.4 Deploy
- [ ] Vercel project setup
- [ ] Dominio personalizado
- [ ] Sentry monitoring
- [ ] Analytics

---

## Implementación — Orden y prioridad

| Phase | Sección | Prioridad |
|-------|---------|-----------|
| 2 | Crypto: tabs 3-7 (Model, ETFs, Emission, BTCvsGold, CME) | Alta |
| 3 | Liquidations: tabs 3-6 (Simple Map, Profile, HF, Hyperliquid) | Alta |
| 4 | On Fire page + API | Alta |
| 5 | Tools page (TrenDiff, Risk Calc, Historical Chart) | Media |
| 6 | Overview dashboard | Media |
| 7 | Deribit WS, Hyperliquid WS | Baja |
| 8 | Stripe precios reales, UI alertas | Baja |
| 9 | SEO, Blog, Tests, Deploy | Baja |

## Estado General

```
FASE 0: Branding          [100%] ✅✅✅✅✅✅✅✅✅✅
FASE 1: Core Sections     [100%] ✅✅✅✅✅✅✅✅✅✅
FASE 2: Crypto Charts     [100%] ✅✅✅✅✅✅✅✅✅✅
FASE 3: Liq Charts        [100%] ✅✅✅✅✅✅✅✅✅✅
FASE 4: On Fire           [100%] ✅✅✅✅✅✅✅✅✅✅
FASE 5: Tools             [100%] ✅✅✅✅✅✅✅✅✅✅
FASE 6: Overview          [100%] ✅✅✅✅✅✅✅✅✅✅
FASE 7: Exclusives        [ 40%] ✅✅⬜⬜⬜⬜⬜⬜⬜⬜
FASE 8: Monetización      [ 60%] ✅✅✅✅✅✅⬜⬜⬜⬜
FASE 9: Producción        [  0%] ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
```
