# TRADING DASHBOARD — PLAN DE IMPLEMENTACIÓN

> **Proyecto:** Clon + mejora de tradingdifferent.com
> **Stack:** Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + lightweight-charts + Recharts
> **Plan maestro:** `docs/request01/request01_final_plan.md`
> **Estado:** Sprint 2 completado — Sprint 1 mejoras visuales aplicadas

---

## SPRINT 1 (Semana 1-2): Fundamentos ✅ COMPLETADO

### Inicialización del proyecto

- [x] Inicializar proyecto Next.js 16 + TypeScript + Tailwind + App Router (`src/` directory)
- [x] Configurar shadcn/ui (New York style, Zinc theme)
- [x] Añadir componentes shadcn/ui: card, tabs, table, badge, skeleton, select, toggle, dropdown-menu, sheet, tooltip, dialog, scroll-area
- [x] Instalar dependencias gráficas: lightweight-charts, recharts, apexcharts, d3
- [x] Instalar estado/datos: @tanstack/react-query, zustand, axios
- [x] Instalar utilidades: date-fns, clsx, tailwind-merge, framer-motion, html-to-image, papaparse

```comentario
Se usó create-next-app@latest (v16.2.6) en lugar de v15 del plan original.
shadcn v4 con Tailwind v4 — API de CSS cambió a OKLCH con @theme.
Proyecto creado en: trading-dashboard/
```

### Layout base

- [x] Root layout (`src/app/layout.tsx`) con QueryProvider + TooltipProvider + Inter font
- [x] Dashboard layout (`src/app/(dashboard)/layout.tsx`) con Sidebar + Header
- [x] Sidebar colapsable (240px → 60px) con 9 secciones de navegación + animaciones
- [x] Header con tabs de navegación + botón refresh + toggle theme
- [x] Redirect `/` → `/indices`

```comentario
Route group (dashboard) agrupa páginas bajo misma layout.
Sidebar mejorada: indicador activo animado con framer-motion layoutId, collapse
suave con transition duration-300, tooltips flotantes en modo colapsado,
badge de estado con punto verde pulsante.
Header usa useTheme hook para dark/light mode con persistencia en localStorage.
```

### Tema dark/light

- [x] Hook `useTheme()` con persistencia en localStorage
- [x] CSS variables en `globals.css` (shadcn genera automáticamente)
- [x] Transición smooth entre modos

```comentario
El tema por defecto es dark. Se almacena en localStorage('theme').
shadcn v4 maneja las variables CSS con OKLCH.
```

### Capa de datos

- [x] `src/lib/constants.ts` — Símbolos de índices, colores, TTLs de caché
- [x] `src/lib/utils.ts` — cn(), formatPrice(), formatChange(), formatVolume()
- [x] `src/lib/cache.ts` — Sistema de caché en memoria con stale-while-revalidate
- [x] `src/lib/providers/yahoo-finance.ts` — Proveedor Yahoo Finance

```comentario
CLAVE: Yahoo Finance v7 quote endpoint (query2.finance.yahoo.com/v7/finance/quote)
ya no funciona — devuelve 401 "User is unable to access this feature".
Solución: Usar v8 chart endpoint (query1.finance.yahoo.com/v8/finance/chart)
que SÍ funciona y devuelve tanto metadatos de cotización como OHLCV.
La función getQuote() ahora llama al chart endpoint con range=1d&interval=1d
y extrae la cotización del meta, calculando change/changePercent desde chartPreviousClose.
```

### Tipos TypeScript

- [x] `src/types/market.types.ts` — Quote, OHLCV, TimeSeriesPoint
- [x] `src/types/api.types.ts` — ApiResponse<T> genérico

```comentario
ApiResponse<T> tiene success, data, meta (cachedAt, source, ttlMs), y error opcional.
Usado consistentemente en todas las API routes.
```

### API Routes

- [x] `GET /api/market/quote?symbols=^GSPC,^IXIC` → Cotizaciones en tiempo real
- [x] `GET /api/market/historical?symbol=^GSPC&range=1y&interval=1d` → OHLCV histórico

```comentario
Ambas rutas usan getCachedOrFetch() con caché en memoria.
Quote: TTL 60s. Historical: TTL 24h.
Validación de parámetros con códigos de error específicos.
Rate limiting pendiente para producción (Upstash).
```

### Hooks de datos

- [x] `useMarketQuote(symbols)` → TanStack Query con refetchInterval 60s
- [x] `useMarketHistorical(symbol, range, interval)` → TanStack Query con refetchInterval 300s
- [x] `useTheme()` → Dark/light mode management
- [x] `useRealtime({ interval, onTick })` → Hook de polling genérico

```comentario
TanStack Query v5 con QueryClientProvider en layout raíz.
StaleTime: 30s, retry: 2, refetchOnWindowFocus: false.
```

### Componentes core

- [x] `ChartWrapper` — HOC con loading (skeleton), error (retry), timeframe selector, export button, last updated
- [x] `ChartWrapper` mejorado — Quick stats row (O/H/L/Chg), badge de cambio %, leyenda SMA/Volumen
- [x] `CandlestickChart` — lightweight-charts con velas, volumen, SMA50, SMA200, crosshair, responsive
- [x] `MetricCard` — Nombre + precio + cambio $/% + sparkline + market state badge
- [x] `MetricCard` mejorado — Borde izquierdo color-coded, badge sesión (PRE/REG/AFTER/CLOSED), sparkline inline, barra magnitud %, slider 52W high/low, hover scale 1.02, entrada animada con stagger
- [x] `Sparkline` — Recharts mini LineChart, color dinámico según tendencia
- [x] `LoadingSkeleton` — Wrapper de Skeleton de shadcn
- [x] `ShimmerSkeleton` — Skeleton con animación shimmer gradient sweep (1.5s infinite)
- [x] `MarketOverviewStrip` — Barra de contexto: sesión mercado, hora, VIX, F&G, cambio S&P
- [x] `ErrorState` — Icono + mensaje + botón retry
- [x] `TimeframeSelector` — Tabs de timeframe (1D, 5D, 1M, 3M, 6M, 1Y, 5Y)
- [x] `LastUpdated` — Timestamp HH:mm:ss formateado
- [x] `ExportButton` — Botón placeholder para descarga PNG

```comentario
CLAVE: lightweight-charts v5 cambió su API — ya no existen chart.addCandlestickSeries(),
chart.addHistogramSeries(), chart.addLineSeries(). Ahora se usa:
  chart.addSeries(CandlestickSeries, options)
  chart.addSeries(HistogramSeries, options)
  chart.addSeries(LineSeries, options)
Los tipos importados son: CandlestickSeries, HistogramSeries, LineSeries (valores, no tipos).

Mejora visual Sprint 1 (2026-05-13): Se añadieron animaciones framer-motion a todos
los componentes del dashboard. MetricCard ahora muestra sparklines generados del quote,
barra de magnitud proporcional al cambio %, slider 52W, y badge de sesión de mercado
con colores semánticos. ChartWrapper incluye fila de estadísticas rápidas y badge
de cambio porcentual animado. MarketOverviewStrip añade contexto de mercado global
con VIX, Fear & Greed, y estado de sesión. Sidebar tiene indicador de página activa
con animación spring, collapse suave, tooltips en modo reducido.
```

### Página Índices

- [x] `src/app/(dashboard)/indices/page.tsx` — Página principal con:
  - [x] MetricCards en grid responsive (1→2→3→6 columnas)
  - [x] MarketOverviewStrip con VIX, F&G, sesión, timestamp
  - [x] Sparkline data generado sintéticamente por quote
  - [x] Slider 52W high/low + badge de sesión en cada card
  - [x] Quick stats OHLCV + badge % en ChartWrapper
  - [x] Transición animada al cambiar índice seleccionado
  - [x] Selección de índice activo al hacer clic en card
  - [x] CandlestickChart con selector de timeframe y leyenda SMA
  - [x] Integración con TanStack Query para datos en tiempo real

```comentario
Layout mejorado: grid responsive en lugar de fila única. MarketOverviewStrip
arriba, luego cards con sparklines inline y slider 52W, luego chart con quick
stats. Transición AnimatePresence al cambiar índice. Sparklines generados
sintéticamente con ruido gaussiano y tendencia basada en change real.
Los MetricCards obtienen quotes via useMarketQuote().
El gráfico principal usa useMarketHistorical() que se actualiza según el timeframe.
Timeframes mapean a ranges/intervals de Yahoo: 1D→1d/1m, 1Y→1y/1d, 5Y→5y/1wk.
```

### Verificación

- [x] Build exitoso (`npx next build`) — 0 errores TypeScript
- [x] API `/api/market/quote` devuelve datos reales de S&P 500 ($7399) y NASDAQ ($26057)
- [x] API `/api/market/historical` devuelve 22 velas OHLCV
- [x] Dev server corriendo en `http://localhost:3000`
- [x] Animaciones framer-motion funcionando en MetricCard, Sidebar, ChartWrapper
- [x] MarketOverviewStrip mostrando datos de sesión, VIX, F&G
- [x] Quick stats OHLCV visibles en ChartWrapper con color-coded high/low
- [x] Shimmer animation en loading states

---

## SPRINT 2 (Semana 3-4): Amplitud + Sentimiento ✅ COMPLETADO

### Amplitud de mercado (Breadth)

- [x] Generar `src/data/sp500-symbols.json` (scraping Wikipedia → JSON estático, 503 símbolos)
- [x] Implementar `src/lib/calculations/breadth.ts`:
  - [x] `calculateAdvanceDecline(symbols)` — Avances/Declives desde Yahoo
  - [x] `calculatePercentAboveMA(symbols, period)` — % sobre SMA50/SMA200
  - [x] `getNewHighsLows()` — New Highs/Lows desde datos históricos
  - [x] Helper `ema(values, period)` y `sma(values, period)`
- [x] Implementar `src/lib/calculations/mcclellan.ts`:
  - [x] EMA19 y EMA39 del ratio A/D
  - [x] Oscilador McClellan
  - [x] McClellan Summation Index
- [x] API Routes:
  - [x] `GET /api/breadth/advance-decline`
  - [x] `GET /api/breadth/mcclellan`
  - [x] `GET /api/breadth/above-ma?period=50`
  - [x] `GET /api/breadth/new-highs-lows`
- [x] Hooks:
  - [x] `useBreadth()` con refetchInterval 300s (5 queries anidadas)
- [x] Página Amplitud (`/breadth`):
  - [x] Row 1: Cards resumen (A/D ratio, %MM50, %MM200, NH/NL, McClellan)
  - [x] Row 2: AreaChart AD Line + BarChart avances/declives
  - [x] Row 3: AreaChart McClellan Oscillator + Summation Index
  - [x] Row 4: AreaChart % sobre SMA50 y SMA200
  - [x] Row 5: BarChart New Highs vs New Lows

```comentario
Se usa script scripts/fetch-sp500.mjs para scrapear Wikipedia vía API → sp500-symbols.json (503 tickers).
El script se puede re-ejecutar periódicamente para actualizar la lista.
Los cálculos de breadth usan Yahoo Finance v8 chart endpoint (mismo workaround que Sprint 1).
El AD Line se mantiene en memoria (variable previousAdLine) — para producción migrar a Supabase.
Los gráficos en la página usan Recharts (AreaChart/BarChart) con datos mock para visualización;
los datos reales se sirven desde las API routes con caché de 5 minutos.
```

### Sentimiento

- [x] Implementar `src/lib/providers/cnn-fear-greed.ts`:
  - [x] `getFearGreedFromCNN()` — desde API de CNN
  - [x] `calculateFearGreedComposite()` — fallback propio con factores (momentum S&P, safe haven, VIX)
- [x] Implementar `src/lib/providers/cboe.ts`:
  - [x] `getPutCallRatio()` — parsear CSV de CBOE con papaparse + fallback Yahoo ^PCSC
- [x] Implementar `src/lib/providers/vix.ts`:
  - [x] `getVIX()` — cotización VIX desde Yahoo Finance
- [x] API Routes:
  - [x] `GET /api/sentiment/fear-greed`
  - [x] `GET /api/sentiment/vix`
  - [x] `GET /api/sentiment/put-call`
- [x] Componente: `GaugeChart` (SVG custom 180° con aguja animada y gradiente)
- [x] Página Sentimiento (`/sentiment`):
  - [x] Row 1: Gauge F&G + VIX card + Put/Call card
  - [x] Row 2: AreaChart F&G histórico + BarChart AAII
  - [x] Row 3: MultiLineChart VIX vs VIX3M (term structure)
- [x] Hook `useSentiment()` con 3 queries anidadas

```comentario
GaugeChart es SVG nativo: arco de 180° con gradiente de rojo a verde, aguja animada,
útil para Fear & Greed y Put/Call. No depende de Recharts.
El fallback propio de Fear & Greed se activa cuando CNN no responde.
CBOE CSV puede fallar por CORS/cambios — el fallback usa Yahoo ^PCSC como respaldo.
```

### Fixes adicionales

- [x] Corregir sidebar: rutas `/dashboard/indices` → `/indices` (route group bug de Sprint 1)

### 🎨 Mejoras visuales Sprint 2 (2026-05-13)

#### GaugeChart (`src/components/charts/gauge-chart.tsx`)
- [x] **Tick marks** en posiciones 0%, 25%, 50%, 75%, 100% con etiquetas numéricas a lo largo del arco
- [x] **Aguja con spring easing** — `cubic-bezier(0.34, 1.56, 0.64, 1)` para transición orgánica
- [x] **Círculo pivote** con relleno de background sobre la aguja para efecto profesional
- [x] Arco activo con transición animada (misma curva spring)
- [x] Contraste mejorado del arco de fondo (opacidad reducida a 0.2)

#### Página Amplitud (`src/app/(dashboard)/breadth/page.tsx`)
- [x] **MetricCards mejorados**:
  - [x] Borde izquierdo color-coded (`border-l-gain/loss/warning`) según tendencia
  - [x] **Barra de progreso** en cards de % sobre SMA50/SMA200 (verde ≥60, amarillo 40-60, rojo ≤40)
  - [x] **Tooltip informativo** (`Info` icon + `TooltipContent` de shadcn) en cada card explicando la métrica
  - [x] Separación de Advancing/Declining en barra verde + rojo
- [x] **Gráficos mejorados**:
  - [x] Advancers vs Decliners: barras verde (`var(--gain)`) y rojo (`var(--loss)`) con `Cell`
  - [x] New Highs vs New Lows: mismo patrón verde/rojo con `Cell`
  - [x] AD Line con gradiente más visible (opacidad 0.35)
  - [x] Summation Index con datos separados del oscilador (serie independiente)
- [x] **Animaciones framer-motion**: `staggerChildren: 0.06` + fade+slide en cards, charts y header
- [x] **Header descriptivo**: `"How many stocks are participating in the move — breadth confirms or warns against price action"`
- [x] **Subtítulos interpretativos** en cada chart: rangos, umbrales y contexto (e.g. `>60% = broad bull, <40% = broad bear`)
- [x] `buildHistory()` con fechas reales (locale `en-US`, `monthShort + day`) y doble sinusoide para datos más realistas

```comentario
Se usó Cell de Recharts para colorear barras individuales en verde/rojo.
Los tooltips usan TooltipTrigger sin asChild (base-ui/react no lo soporta).
Las animaciones usan variants de framer-motion con stagger pattern consistente.
```

#### Página Sentimiento (`src/app/(dashboard)/sentiment/page.tsx`)
- [x] **VIX Card mejorada**:
  - [x] Barra de zonas horizontal tricolor (verde <20, amarillo 20-30, rojo >30) con indicador deslizante animado
  - [x] Badge de zona con color dinámico (`px-2 py-0.5 rounded-full` con tintado `background-color: ${color}20`)
  - [x] Valor del VIX coloreado según la zona activa
  - [x] Formato compacto: `(volumen en M)`
- [x] **Put/Call Card mejorada**:
  - [x] Barra de zonas horizontal (Bullish <0.7, Neutral 0.7-1.0, Bearish >1.0) con indicador deslizante
  - [x] Badge de interpretación con color dinámico
  - [x] Valor del ratio coloreado según zona
- [x] **GaugeChart** con tick marks y mejor animación (compartido con breadth)
- [x] **Animaciones framer-motion**: stagger + fade+slide en todas las cards y charts
- [x] **Header descriptivo**: `"Gauge the emotional state of the market — from fear to greed, volatility to complacency"`
- [x] **Subtítulos interpretativos**: umbrales F&G (`>75 = Greed, <25 = Fear`), VIX (`<20 = low vol, >30 = high fear`), term structure (`Contango / Backwardation`)
- [x] VIX Term Structure: dots visibles en líneas, etiqueta contango/backwardation dinámica

```comentario
Las barras de zona VIX y Put/Call se implementan con divs anidados + posicionamiento absoluto
del indicador deslizante. El color de zona se extrae de las variables CSS var(--gain/loss/warning).
No se añadieron dependencias nuevas — todo es SVG nativo + Tailwind + Recharts existentes.
```

---

## SPRINT 3 (Semana 5-6): Sectores + Commodities + Forex 📋 PENDIENTE

### Sectores

- [ ] API Route: `GET /api/sectors/performance` — 11 ETFs SPDR vía Yahoo
- [ ] Implementar `src/lib/calculations/rrg.ts`:
  - [ ] JdK RS-Ratio y RS-Momentum para cada sector
  - [ ] Clasificación en 4 cuadrantes (Leading, Weakening, Lagging, Improving)
- [ ] API Route: `GET /api/sectors/rrg`
- [ ] Componente: `TreemapChart` (Recharts Treemap + colores dinámicos)
- [ ] Componente: `RRGChart` (D3 Scatter con trayectorias)
- [ ] Página Sectores (3 tabs):
  - [ ] Tab 1: Rendimiento — MetricCards + BarChart + Treemap
  - [ ] Tab 2: RRG — RRGChart con selector de semanas
  - [ ] Tab 3: Detalle sectorial — CandlestickChart por ETF + tabla componentes

```comentario
RRG requiere cálculo secuencial: ratio ETF/SPY → EMA → RS-Ratio → RS-Momentum.
Se necesitan mín. 12 semanas de datos históricos para trayectorias.
```

### Commodities

- [ ] API Route: `GET /api/commodities`
- [ ] Página Commodities:
  - [ ] MetricCards (Oro, Plata, WTI, Brent, Gas, Cobre)
  - [ ] CandlestickChart con selector de commodity
  - [ ] MultiLineChart ratio Oro/Plata
  - [ ] BarChart rendimientos comparativos

### Forex

- [ ] API Route: `GET /api/forex`
- [ ] Componente: `DataTable` (TanStack Table interactiva, ordenable, paginada)
- [ ] Página Forex:
  - [ ] MetricCards (EUR/USD, GBP/USD, USD/JPY, etc.)
  - [ ] CandlestickChart con selector de par
  - [ ] DataTable interactiva
  - [ ] MultiLineChart DXY

---

## SPRINT 4 (Semana 7-8): Cripto + Liquidaciones ✅ COMPLETADO

### Cripto

- [x] Implementar `src/lib/providers/coingecko.ts`:
  - [x] `getCryptoMarkets(limit)` — Top 50 por market cap (CoinGecko free API)
  - [x] `getCryptoHistorical(id, days)` — OHLCV histórico
  - [x] `getCryptoGlobal()` — Market cap total, BTC.D, ETH.D, volumen 24h
- [x] Generar `src/data/crypto-ids.json` — 50 mappings symbol → CoinGecko ID
- [x] API Route: `GET /api/crypto?type=markets|historical|global`
- [x] Hook `useCryptoMarkets()`, `useCryptoGlobal()`, `useCryptoHistorical()` — TanStack Query con polling 60s/300s
- [x] Componente `CryptoTable` — @tanstack/react-table v8 ordenable + paginada + sparklines 7D
- [x] Página Cripto (`/crypto`) — 3 tabs:
  - [x] Tab 1: Overview — 4 MetricCards (market cap, BTC.D, ETH.D, volumen) + BTC chart + ETH chart + DataTable top 50
  - [x] Tab 2: Dominance — 3 cards (BTC/ETH/Others) + BTC.D history chart
  - [x] Tab 3: Liquidations — link estilizado a `/liquidations`
- [x] Animaciones framer-motion (stagger, fade+slide) en toda la página
- [x] Skeleton loading states, colores BTC (#f7931a) y ETH (#627eea)

```comentario
CoinGecko free API no necesita API key para endpoints básicos (rate limit ~30 req/min).
Se usó @tanstack/react-table@latest para tabla ordenable con paginación.
Los charts de BTC/ETH usan buildHistory sintético con tendencia (dato real viene del CoinGecko quote).
Sidebar ya tenía los nav items desde Sprint 1 (pre-configurados para todas las secciones).
```

### Liquidaciones (MEJORA ESTRELLA)

- [x] Implementar `src/lib/providers/binance-ws.ts`:
  - [x] WebSocket cliente a `wss://fstream.binance.com/ws/!forceOrder@arr`
  - [x] RingBuffer de 1000 eventos con auto-reconnect cada 5s
  - [x] Métodos: `getRecent()`, `getSummary()`, `getHourly()`, `getAll()`, `getStatus()`
  - [x] Singleton exportado como `liquidationBuffer`
- [x] API Routes:
  - [x] `GET /api/liquidations/recent?symbol=BTCUSDT&limit=50`
  - [x] `GET /api/liquidations/summary?symbol=BTCUSDT`
  - [x] `GET /api/liquidations/hourly?symbol=BTCUSDT`
  - [x] `GET /api/liquidations/heatmap?symbol=BTCUSDT` (proxy a Python worker + fallback TS)
- [x] Setup Python FastAPI worker (`python-workers/`):
  - [x] `main.py` — FastAPI app con CORS en puerto 8001
  - [x] `routers/liquidation_heatmap.py` — POST /heatmap con KDE gaussian_kde (bw_method=0.3)
  - [x] `requirements.txt` — fastapi, uvicorn, numpy, scipy
- [x] Componente `LiquidationHeatmap` — Canvas 2D con colores gradient (azul → cian → amarillo → rojo) + overlay precio
- [x] Hooks `useLiquidationsRecent()` (5s), `useLiquidationsSummary()` (10s), `useLiquidationsHourly()` (30s), `useLiquidationHeatmap()` (30s)
- [x] Página Liquidaciones (`/liquidations`):
  - [x] Selectores de símbolo (BTC/ETH/SOL)
  - [x] 4 summary cards con border-left color-coded (Long rojo, Short verde, ratio bar, max)
  - [x] Heatmap KDE con fallback TS cuando Python worker no está disponible
  - [x] BarChart liquidaciones por hora (stacked long/short con colores loss/gain)
  - [x] DataTable últimas 20 liquidaciones con side/price/qty/notional/time
- [x] Animaciones framer-motion (stagger + fade+slide)

```comentario
El heatmap tiene dos modos: (1) KDE real con scipy si el worker Python corre en :8001,
(2) fallback en TypeScript con grid bin-based cuando el worker no responde.
Binance WS se conecta bajo demanda (liquidationBuffer.connect() en cada request).
El buffer vive en memoria del servidor Next.js — se pierde al reiniciar.
Para producción: migrar a una cola Redis o base de datos.
```

---

---

## SPRINT 5 (Semana 9-10): Mejoras + Pulido ✅ COMPLETADO

### Mejoras técnicas

- [x] **Exportar gráfico PNG** — `src/components/shared/export-button.tsx`:
  - [x] Integración con `html-to-image` (`toPng` con pixelRatio=2)
  - [x] Dropdown con opciones PNG/CSV
  - [x] Captura del contenedor del chart via ref
  - [x] Download automático con nombre del chart
- [x] **Exportar datos CSV** — botón en ExportButton:
  - [x] Callback `onExportCSV` en ChartWrapper
  - [x] Preparado para integración con `papaparse`
- [x] **Modo Presentación** — `src/hooks/use-ui.ts` (Zustand):
  - [x] Toggle en Header con icono `Presentation`
  - [x] Sidebar colapsa a `w-0` con transición CSS
  - [x] Main padding cambia a `p-6` para más espacio
  - [x] Botón con estilo `secondary` cuando activo
- [x] **Sistema de Alertas** — `src/hooks/use-alerts.ts` (Zustand + persist):
  - [x] 6 tipos: PRICE_ABOVE/BELOW, VIX_ABOVE, FEAR_GREED_BELOW/ABOVE, LIQUIDATION_SPIKE
  - [x] 4 reglas default: VIX>30, F&G<25, F&G>75, Liquidation>$10M
  - [x] `AlertEngine` componente en layout.tsx que evalúa reglas vs datos reales
  - [x] Notificaciones browser (Notification API) con cooldown de 1h
  - [x] Persistencia en localStorage via `zustand/middleware/persist`
  - [x] Permiso solicitado al montar el engine
  - [x] `lastTriggered` tracking para evitar spam
- [x] **Watchlist personal** — `src/hooks/use-watchlist.ts` (Zustand + persist):
  - [x] Store con add/remove/has/toggle
  - [x] 2 items default: ^GSPC (S&P 500), ^VIX
  - [x] Persistencia en localStorage

### Mejoras UX/UI

- [x] **Búsqueda global** — `src/components/shared/global-search.tsx`:
  - [x] shadcn Command (cmdk) + Dialog
  - [x] Atajo Ctrl+K para abrir/cerrar
  - [x] Filtro por nombre y keywords
  - [x] Navegación por teclado
  - [x] 8 páginas del dashboard indexadas
  - [x] Iconos lucide-react por página
- [x] **Animaciones Framer Motion** — en `layout.tsx`:
  - [x] `AnimatePresence mode="wait"` para transiciones entre páginas
  - [x] `motion.div` con fade+slide (opacity 0→1, y 8→0)
  - [x] `exit` animation (opacity 1→0, y 0→-8)
  - [x] duration 0.2s
- [x] **Tooltips enriquecidos** — en `ChartWrapper`:
  - [x] Nuevo prop `hint` con `Info` icon + Tooltip shadcn
  - [x] Usado en breadth MetricCards
- [x] **Indicadores de calidad** — en `ChartWrapper`:
  - [x] Nuevo prop `dataSource` con label "• Yahoo Finance" / "• CoinGecko" / "• Binance WS"
  - [x] Estilo `text-[10px] text-muted-foreground/50`
  - [x] Timestamp (LastUpdated) ya existía
- [x] **Global search** con autocompletado (ver arriba)

### Testing

- [x] **Playwright E2E config** — `playwright.config.ts`:
  - [x] Configuración completa con Chromium
  - [x] WebServer integrado (npm run dev)
- [x] **10 tests E2E** — `e2e/dashboard.spec.ts`:
  - [x] Homepage redirects to /indices
  - [x] Breadth page loads with metrics
  - [x] Sentiment page loads with gauges
  - [x] Crypto page has 3 tabs
  - [x] Liquidations page loads with controls
  - [x] Global search with Ctrl+K works
  - [x] Sidebar navigation
  - [x] Presentation mode toggle
  - [x] Header tab navigation
  - [x] Theme toggle

```comentario
Playwright config usa webServer con reuseExistingServer para desarrollo rápido.
Para correr tests: `npx playwright test` (requiere dev server en :3000).
Los tests son funcionales — verifican navegación, carga de páginas, interacciones básicas.
```

### Configuración de producción

- [x] **Rate limiting con @upstash/ratelimit** — `src/lib/cache.ts`:
  - [x] `withRateLimit(request, handler)` función reusable
  - [x] Sliding window: 30 requests / 30 segundos por IP
  - [x] Headers `X-RateLimit-Remaining` y `X-RateLimit-Reset` en responses
  - [x] 429 response con mensaje cuando se excede el límite
  - [x] Fallback no-op cuando Redis no está configurado
  - [x] Aplicado a las 14 API routes
- [x] **Caché Redis (Upstash)** — `src/lib/cache.ts`:
  - [x] `getCachedOrFetch()` ahora intenta Redis primero, fallback a Map en memoria
  - [x] `setCacheEntry()` escribe en Redis + memoria simultáneamente
  - [x] Keys con prefijo `td:` y TTL automático vía `setex`
  - [x] Conexión lazy (solo cuando hay fetch real)
  - [x] Sin dependencia forzada — funciona sin Redis (fallback transparente)
- [x] **Setup Supabase** — `src/lib/supabase.ts`:
  - [x] Client singleton con `createClient()` lazy
  - [x] `getBreadthHistory()` — SELECT * FROM breadth_history ORDER BY date ASC
  - [x] `upsertBreadthHistory()` — UPSERT con onConflict por date
  - [x] AD Line ahora persiste en Supabase (no se pierde al reiniciar)
  - [x] McClellan Oscillator lee histórico directamente de Supabase
  - [x] Eliminada dependencia de `getCacheEntry/setCacheEntry` para breadth history
- [x] **Setup Vercel** — deploy completado:
  - [x] `vercel.json` con framework nextjs, build command, security headers
  - [x] Proyecto creado: `trading-dashboard` en org `javi-s-projects3`
  - [x] Env vars sincronizadas: UPSTASH_REDIS_*, NEXT_PUBLIC_SUPABASE_*
  - [x] Build exitoso en Vercel (0 errores, 45s build time)
  - [x] Producción: https://trading-dashboard-omega-lemon.vercel.app
  - [x] Dominio Vercel configurado con SSL automático
- [ ] Deploy Python worker en Railway — requiere cuenta Railway
- [ ] Monitorización: Sentry + Vercel Analytics

```comentario
Vercel deploy configurado con todas las environment variables de producción.
El build usa Next.js 16.2.6 con Turbopack. Tiempo de build: ~45s.
Para deploys futuros: `vercel --prod` desde el directorio trading-dashboard/.
```
.env.local tiene UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.
La caché Redis persiste la AD Line y datos de breadth entre reinicios del servidor.
Rate limiting protege todas las API routes contra abuso (30 requests/30s por IP).
```

---

## HERRAMIENTAS CONFIGURADAS

### Superpowers (Plugin OpenCode)
- **Estado:** ✅ Instalado en `~/.config/opencode/node_modules/superpowers`
- **Skills disponibles:** brainstorming, writing-plans, subagent-driven-development, executing-plans, TDD, code review, systematic-debugging, using-git-worktrees
- **Uso:** Metodología de desarrollo con writing-plans para desglose de tareas, subagent-driven-development para ejecución paralela con revisión

### Playwright MCP
- **Estado:** ✅ Configurado en `opencode.json`
- **Comando:** `npx @playwright/mcp@latest`
- **Uso:** Browser automation para E2E tests y análisis de tradingdifferent.com

### registry-directory-mcp
- **Estado:** ✅ Instalado en `~/.config/opencode/registry-directory-mcp` (build local)
- **Uso:** Búsqueda de componentes shadcn/ui en 40+ registros

---

## NOTAS TÉCNICAS PARA PRÓXIMAS FASES

### Decisiones de arquitectura

1. **API Routes vs BFF separado**: Por ahora todo en Next.js Route Handlers. Si la carga crece, mover a Python workers.
2. **Caché**: Map en memoria para desarrollo. Migrar a Upstash Redis en producción.
3. **WebSocket**: No implementado aún. Binance WS para BTC/ETH en Sprint 4.
4. **Base de datos**: Supabase pendiente de configurar (Sprint 5).
5. **Concurrencia**: `getQuote()` usa `runWithConcurrency(..., 15)` para evitar rate limiting de Yahoo. Los arrays de 503 símbolos se dividen en batches de 15.
6. **AD Line almacenada en caché**: Se persiste en `cache.ts` con key `breadth:ad-history` (7 días TTL). Cada día se añade un nuevo registro `{date, netAdvances, advancing, declining}`. Esto permite que la AD Line acumule entre requests y que McClellan tenga histórico.

### Problemas conocidos

1. **Yahoo Finance**: v7 quote endpoint bloqueado. Usar v8 chart endpoint como workaround.
2. **CORS**: Las API routes de Next.js no tienen CORS configurado (no necesario para mismo dominio).
3. **Rate limiting**: Sin límite de requests actualmente (implementar con Upstash antes de producción).
4. **McClellan**: Necesita 39+ días de datos A/D para calcular oscilador. Empieza en 0 hasta que se acumule histórico en caché. Para producción: migrar a Supabase.
5. **Put/Call ratio**: CBOE CSV puede fallar (CORS/bloqueo server-side). Fallback usa Yahoo `PCSC` (sin ^). Si ambos fallan, default 0.85.
6. **Timestamps Yahoo**: La API v8 devuelve Unix timestamps en segundos. lightweight-charts v5 espera segundos. NO dividir por 1000.
7. **Recarga del servidor**: La caché en memoria se pierde al reiniciar Next.js. Esto reinicia AD Line y McClellan.
8. **Shimmer animation**: Animación CSS keyframe para loading states con gradient sweep 1.5s infinite. Definida en `globals.css` con clase `.shimmer`. Soporte dark mode.
9. **Framer Motion layoutId**: Sidebar usa `motion.div layoutId="activeIndicator"` para animar indicador activo entre links con spring physics.

### Estructura de directorios creada

```
trading-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── globals.css                   # Tailwind v4 + shadcn
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Sidebar + Header
│   │   │   ├── page.tsx                  # Redirect a /indices
│   │   │   ├── indices/page.tsx          # Sprint 1: Página índices
│   │   │   ├── breadth/page.tsx          # Sprint 2: Página Amplitud
│   │   │   └── sentiment/page.tsx        # Sprint 2: Página Sentimiento
│   │   └── api/
│   │       ├── market/
│   │       │   ├── quote/route.ts        # Sprint 1
│   │       │   └── historical/route.ts   # Sprint 1
│   │       ├── breadth/
│   │       │   ├── advance-decline/route.ts  # Sprint 2
│   │       │   ├── mcclellan/route.ts        # Sprint 2
│   │       │   ├── above-ma/route.ts         # Sprint 2
│   │       │   └── new-highs-lows/route.ts   # Sprint 2
│   │       └── sentiment/
│   │           ├── fear-greed/route.ts   # Sprint 2
│   │           ├── vix/route.ts          # Sprint 2
│   │           └── put-call/route.ts     # Sprint 2
│   ├── components/
│   │   ├── charts/
│   │   │   ├── chart-wrapper.tsx         # Sprint 1 (mejorado: quick stats, legend, change badge)
│   │   │   ├── candlestick-chart.tsx     # Sprint 1 (fix timestamp)
│   │   │   ├── sparkline.tsx             # Sprint 1
│   │   │   └── gauge-chart.tsx           # Sprint 2
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx               # Sprint 1+2 (fix rutas + animaciones)
│   │   │   ├── header.tsx                # Sprint 1
│   │   │   ├── metric-card.tsx           # Sprint 1 (mejorado: sparklines, sesión, 52W, hover)
│   │   │   ├── market-overview-strip.tsx # Sprint 1 (NUEVO: VIX, F&G, sesión)
│   │   │   ├── timeframe-selector.tsx    # Sprint 1
│   │   │   └── last-updated.tsx          # Sprint 1
│   │   ├── shared/
│   │   │   ├── query-provider.tsx        # Sprint 1
│   │   │   ├── loading-skeleton.tsx      # Sprint 1
│   │   │   ├── shimmer-skeleton.tsx      # Sprint 1 (NUEVO: animación shimmer)
│   │   │   ├── error-state.tsx           # Sprint 1
│   │   │   └── export-button.tsx         # Sprint 1
│   │   └── ui/                           # shadcn/ui (12 componentes)
│   ├── hooks/
│   │   ├── use-market-quote.ts           # Sprint 1
│   │   ├── use-market-historical.ts      # Sprint 1
│   │   ├── use-realtime.ts               # Sprint 1
│   │   ├── use-theme.ts                  # Sprint 1
│   │   ├── use-breadth.ts                # Sprint 2
│   │   └── use-sentiment.ts              # Sprint 2
│   ├── lib/
│   │   ├── cache.ts                      # Sprint 1+2 (get/setCacheEntry)
│   │   ├── constants.ts                  # Sprint 1
│   │   ├── utils.ts                      # Sprint 1
│   │   ├── calculations/
│   │   │   ├── breadth.ts                # Sprint 2 (A/D, %MA, NH/NL)
│   │   │   └── mcclellan.ts              # Sprint 2 (Oscilador, SI)
│   │   └── providers/
│   │       ├── yahoo-finance.ts          # Sprint 1+2 (concurrency)
│   │       ├── cnn-fear-greed.ts         # Sprint 2
│   │       ├── cboe.ts                   # Sprint 2 (fix PCSC)
│   │       └── vix.ts                    # Sprint 2
│   ├── data/
│   │   └── sp500-symbols.json           # Sprint 2 (503 tickers)
│   └── types/
│       ├── market.types.ts               # Sprint 1
│       ├── api.types.ts                  # Sprint 1
│       ├── breadth.types.ts              # Sprint 2
│       └── sentiment.types.ts            # Sprint 2
├── scripts/
│   └── fetch-sp500.mjs                  # Sprint 2 (scraper Wikipedia)
├── planning.md                           # ← Este archivo
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.local
```
