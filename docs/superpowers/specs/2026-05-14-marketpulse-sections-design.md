# MarketPulse — Design: Complete Sections & Charts

> **Date:** 2026-05-14
> **Status:** Approved by user
> **Goal:** Include ALL charts from tradingdifferent.com in MarketPulse, organized in appropriate sections

---

## 1. Architecture Overview

### Sidebar — 10 sections

```
📊 Overview       /              ← Dashboard with summary widgets
📈 Indices        /indices       ← ✓ existing
📊 Breadth        /breadth       ← ✓ existing
🎯 Sentiment      /sentiment     ← ✓ existing
🪙 Crypto         /crypto        ← ++ extended with 5 new tabs
🔥 Liquidations   /liquidations  ← ++ extended with 4 new tabs
🔥 On Fire        /onfire        ← ★ NEW section
🧰 Tools          /tools         ← ★ NEW section
📦 Commodities    /commodities   ← ✓ existing
💱 Forex          /forex         ← ✓ existing
🏭 Sectors        /sectors       ← ✓ existing
```

### Route changes

| Route | Change |
|-------|--------|
| `/` | Landing page (✓ exists) |
| `/` inside `(dashboard)` | New Overview page with summary widgets |
| `/crypto` | 7 tabs (2 existing + 5 new) |
| `/liquidations` | 7 tabs (2 existing + 5 new) |
| `/onfire` | New page: On Fire Heatmap |
| `/tools` | New page: 3 tabs (TrenDiff, Risk Calc, Historical Chart) |

---

## 2. Crypto Section — 7 Tabs

### 2.1 Overview (✓)
Existing: market cap, BTC.D, ETH.D, volume 24h, BTC chart, ETH chart, DataTable top 50.

### 2.2 Dominance (✓)
Existing: BTC/ETH/Others cards, BTC.D history chart.

### 2.3 BTC Model — Supplier Model (S2F)
- Stock-to-Flow chart with on-chain data
- Lines: actual price vs model price
- 5-year projection
- Data source: CoinGecko + on-chain API (glassnode-style, MVP uses synthetic)
- Chart: Recharts AreaChart dual-axis (price left, S2F right)

### 2.4 BTC ETFs
- **Spot ETF Holdings:** Total BTC held by all ETFs, line chart over time
- **Avg Buy Price:** Weighted average entry price per ETF, bar chart
- **Flow by Day:** Daily net inflow/outflow, bar chart (green inflow, red outflow)
- Data source: Public API (MVP: synthetic with realistic trend)
- Chart: Recharts BarChart + LineChart

### 2.5 Emission Rate
- Bitcoin supply curve (total mined vs time)
- Block reward halving markers
- Annualized inflation rate overlay
- Data source: Hardcoded schedule (4-year halving cycle)
- Chart: Recharts AreaChart (supply) + LineChart (inflation %)

### 2.6 BTC vs Gold
- Dual-axis chart: BTC price vs Gold price (normalized)
- Historical supply evolution comparison
- Emission rate comparison (BTC inflation vs Gold mining)
- Data source: Yahoo Finance (BTC-USD, XAU/USD)
- Chart: Recharts LineChart dual-axis

### 2.7 CME Futures
- BTC CME gap analysis (gap up/down from futures vs spot)
- Premium/Discount chart (futures basis)
- Open Interest tracking
- Data source: Yahoo Finance (BTC=F, ETH=F) + synthetic gap data
- Chart: Recharts BarChart (gaps) + AreaChart (basis)

---

## 3. Liquidations Section — 7 Tabs

### 3.1 Heatmap (✓)
Existing: KDE heatmap with selectable symbol.

### 3.2 Simple Map
- Simplified version of heatmap
- Price zones with color-coded liquidation density bars
- No 2D KDE — just horizontal density bars per price level
- Lighter weight, faster loading
- Data source: Same Binance/Bybit buffer

### 3.3 Profile
- Per-position liquidation detail view
- For a selected liquidation event: side, price, qty, notional, time, exchange
- Visual: horizontal bar showing liquidation clusters
- Table with detailed info
- Data source: Binance/Bybit buffer filtered by event

### 3.4 HF Chart — High Frequency Chart
- Time-series chart of liquidation frequency
- Bin size: 1-minute candles of liquidation events
- Volume-weighted price levels
- Built with lightweight-charts (candlestick-style for liquidations)
- Data source: Binance/Bybit WS buffer aggregated by minute

### 3.5 Hyperliquid
- Liquidation heatmap for Hyperliquid DEX
- Different data source (Hyperliquid WS or REST API)
- Falls back to same KDE algorithm
- Same component structure as main heatmap

### 3.6 Exchanges (✓)
Existing: Exchange selector + status table.

---

## 4. On Fire — NEW Section

### 4.1 Page: `/onfire`
- **On Fire Heatmap:** Grid of assets colored by "on fire" score (0-100)
- Scoring algorithm: volume spike + price change 24h + volatility
- Auto-refresh every 5 minutes
- Filter by category: Crypto, Stocks, Forex, Commodities
- Sortable by score, volume, change
- Chart: Custom CSS grid heatmap with color gradient (cold blue → hot red)

### 4.2 Data source
- CoinGecko for crypto
- Yahoo Finance for stocks/forex/commodities
- Calculation done server-side in API route

### 4.3 API Route
- `GET /api/onfire?category=crypto` → returns assets with scores

---

## 5. Tools — NEW Section

### 5.1 Page: `/tools` — 3 tabs

### 5.2 TrenDiff Indicator
- Proprietary trend strength indicator
- Visual: line chart with colored zones (bullish green, bearish red, neutral gray)
- Selectable symbol + timeframe
- Signal markers (buy/sell signals)
- Data source: Yahoo Finance historical + server-side calculation

### 5.3 Risk Calculator
- Position sizing calculator
- Inputs: account balance, risk %, entry price, stop loss, take profit
- Outputs: position size (units), position size ($), R:R ratio, max loss ($)
- No external data source — pure client-side calculation
- Saves last inputs to localStorage

### 5.4 Historical Chart
- Interactive chart explorer
- Select any symbol, any range
- Candlestick + volume + SMA overlay
- Same as indices chart but with symbol search
- Data source: Yahoo Finance historical

---

## 6. Overview Dashboard

### 6.1 Page: `/` inside `(dashboard)`
- Quick stats strip (market session, VIX, F&G, S&P change) — ✓ existing component
- Grid of 6 summary cards:
  - Indices: S&P 500 + NASDAQ change
  - Breadth: A/D ratio + McClellan
  - Sentiment: F&G gauge mini
  - Crypto: BTC price + dominance
  - Liquidations: 24h total liquidated
  - On Fire: top 3 trending assets
- Each card links to its full section
- Last updated timestamp

---

## 7. Implementation Order

### Phase 1 — Extend existing sections
1. Liquidations: Simple Map tab
2. Liquidations: Profile tab
3. Liquidations: HF Chart tab
4. Liquidations: Hyperliquid tab
5. Crypto: BTC ETFs tab (3 sub-views)
6. Crypto: BTC Model tab
7. Crypto: Emission Rate tab
8. Crypto: BTC vs Gold tab
9. Crypto: CME Futures tab

### Phase 2 — New sections
10. On Fire page + API route
11. Tools page (3 tabs)

### Phase 3 — Dashboard
12. Overview page

---

## 8. Key Decisions

1. **Synthetic data for early phases:** BTC ETFs, Supplier Model, and other data-dependent features will use realistic synthetic data initially, with a clear migration path to real APIs.

2. **No new external dependencies:** All new charts use Recharts (already installed). No new charting libraries needed.

3. **Tab-based navigation for multi-feature sections:** Crypto and Liquidations use shadcn Tabs (already installed) for clean navigation.

4. **On Fire algorithm runs server-side:** The scoring calculation runs in the API route, not client-side, to keep the logic centralized and cacheable.

5. **TrenDiff is a moving average crossover derivative:** For MVP, uses EMA crossovers + RSI divergence as a proxy for the "proprietary" indicator.
