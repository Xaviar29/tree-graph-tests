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

## SPRINT 3 (Semana 5-6): Sectores + Commodities + Forex ✅ COMPLETADO

### Sectores

- [x] API Route: `GET /api/sectors/performance` — 11 ETFs SPDR vía Yahoo
- [x] Implementar `src/lib/calculations/rrg.ts`:
  - [x] JdK RS-Ratio y RS-Momentum para cada sector
  - [x] Clasificación en 4 cuadrantes (Leading, Weakening, Lagging, Improving)
- [x] API Route: `GET /api/sectors/rrg`
- [x] Componente: `TreemapChart` (Recharts Treemap + colores dinámicos)
- [x] Componente: `RRGChart` (D3 Scatter con trayectorias)
- [x] Página Sectores (3 tabs):
  - [x] Tab 1: Rendimiento — MetricCards + BarChart + Treemap
  - [x] Tab 2: RRG — RRGChart con selector de semanas
  - [x] Tab 3: Detalle sectorial — CandlestickChart por ETF + tabla componentes

```comentario
RRG implementado con cálculo secuencial de RS-Ratio y RS-Momentum.
TreemapChart y RRGChart integrados con datos reales de ETFs sectoriales.
Pestaña de rendimiento muestra el heatmap de sectores con Treemap.
```

### Commodities

- [x] API Route: `GET /api/commodities`
- [x] Página Commodities:
  - [x] MetricCards (Oro, Plata, WTI, Brent, Gas, Cobre)
  - [x] CandlestickChart con selector de commodity
  - [x] MultiLineChart ratio Oro/Plata
  - [x] BarChart rendimientos comparativos

### Forex

- [x] API Route: `GET /api/forex`
- [x] Componente: `DataTable` (TanStack Table interactiva, ordenable, paginada)
- [x] Página Forex:
  - [x] MetricCards (EUR/USD, GBP/USD, USD/JPY, etc.)
  - [x] CandlestickChart con selector de par
  - [x] DataTable interactiva
  - [x] MultiLineChart DXY

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
- [x] **Sentry — Monitorización**:
  - [x] `sentry.client.config.ts` — client-side init con tracesSampleRate 0.1
  - [x] `sentry.server.config.ts` — server-side init
  - [x] `src/instrumentation.ts` — register hook para Next.js
  - [x] `next.config.ts` — wrapped con `withSentryConfig`
  - [x] Tunnel `/monitoring` para evitar adblockers
  - [x] Source maps ocultos en producción
  - [x] Automatic Vercel Monitors habilitado
  - [x] SENTRY_DSN y SENTRY_API_KEY en Vercel env vars
  - [x] Vercel Log Drain configurado
- [ ] Deploy Python worker en Railway — requiere cuenta Railway

```comentario
Vercel deploy: https://trading-dashboard-omega-lemon.vercel.app
GitHub repo: https://github.com/Xaviar29/tree-graph-tests
Sentry: https://sentry.io/orgs/javi-s-projects3
Build: Next.js 16.2.6 + Turbopack, ~45s en Vercel
```
Rate limiting protege todas las API routes contra abuso (30 requests/30s por IP).
```

---

---
## SERVICIOS EXTERNOS CONFIGURADOS

### 1. Vercel — Frontend + API Routes (Hosting)
- **URL:** https://trading-dashboard-omega-lemon.vercel.app
- **Dashboard:** https://vercel.com/javi-s-projects3/trading-dashboard
- **Qué es:** Plataforma de hosting para Next.js. Build automático, CDN global, SSL, dominios custom.
- **Deploy:** `vercel --prod` desde `trading-dashboard/` (o automático desde GitHub)
- **API Key:** Configurada en variables de entorno del proyecto
- **Monitoreo:** Vercel Analytics (Settings → Analytics, activar)

### 2. Upstash Redis — Caché Persistente + Rate Limiting
- **URL:** https://console.upstash.com/redis/ (pro-perch-122650)
- **Qué es:** Redis serverless en la nube. Sin conexión persistente, vía REST API.
- **Uso en el proyecto:**
  - `src/lib/cache.ts`: `getCachedOrFetch()` intenta Redis primero, fallback a Map en memoria
  - `setCacheEntry()` escribe en Redis + memoria simultáneamente
  - Keys con prefijo `td:` y TTL automático vía `setex`
  - `withRateLimit()`: sliding window 30 req / 30s por IP en las 14 API routes
- **Beneficio:** La AD Line y datos de breadth ya no se pierden al reiniciar el servidor
- **Plan:** Gratuito (10MB, 10k requests/día)
- **Env vars:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### 3. Supabase — Base de Datos (PostgreSQL)
- **URL:** https://supabase.com/dashboard/projects
- **Qué es:** PostgreSQL serverless con API REST. Alternativa open-source a Firebase.
- **Uso en el proyecto:**
  - Tabla `breadth_history`: persiste AD Line diaria (advancing, declining, net_advances, ad_line, oscillator, summation_index)
  - `src/lib/supabase.ts`: client singleton con `getBreadthHistory()` y `upsertBreadthHistory()`
  - La AD Line y McClellan Oscillator leen/escriben directamente de Supabase
- **Beneficio:** Historial breadth sobrevive reinicios del servidor y se acumula día a día
- **Plan:** Gratuito (500MB DB, 50k rows)
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Sentry — Monitorización de Errores
- **URL:** https://sentry.io/orgs/javi-s-projects3/
- **Qué es:** Sistema de monitoreo que captura errores en producción con stack traces completos.
- **Uso en el proyecto:**
  - `sentry.client.config.ts`: init en cliente con `tracesSampleRate: 0.1`
  - `sentry.server.config.ts`: init en servidor
  - `sentry.edge.config.ts`: init en edge runtime
  - `src/instrumentation.ts`: register hook para Next.js
  - `next.config.ts`: wrapper con `withSentryConfig`
  - Tunnel `/monitoring` para evitar adblockers
  - Source maps ocultos en producción (seguridad)
  - Automatic Vercel Monitors: alertas de rendimiento en dashboard de Vercel
- **Plan:** Gratuito (5k eventos/mes)
- **Env vars:** `SENTRY_DSN`, `SENTRY_API_KEY`
- **Nota:** Para source maps y releases, se necesita un auth token de Sentry. Sin él, Sentry funciona pero no puede asociar errores a releases específicas.

### 5. Railway — Python Worker (KDE Heatmap)
- **URL:** https://railway.app/dashboard
- **Qué es:** Plataforma de hosting para workers Python. Ideal para el KDE heatmap (scipy no corre en Vercel).
- **Uso en el proyecto:** `python-workers/` con FastAPI + scipy
- **Cómo deployar:**
  1. Conectar repo `Xaviar29/tree-graph-tests` a Railway
  2. Configurar root directory = `python-workers/`
  3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  4. Railway te da una URL tipo `https://python-worker.up.railway.app`
  5. Actualizar `PYTHON_WORKER` en `src/app/api/liquidations/heatmap/route.ts`
- **Fallback:** Si el worker no responde, el heatmap usa un cálculo TS simplificado (grid bin-based)
- **Plan:** ~$5 crédito inicial (gratis hasta耗尽)

### 6. GitHub — Control de Versiones
- **URL:** https://github.com/Xaviar29/tree-graph-tests
- **Qué es:** Repositorio Git del proyecto completo.
- **Estructura:** `trading-dashboard/` (Next.js) + `python-workers/` (Python)
- **Token:** Configurado en variables de entorno del proyecto

---

## HERRAMIENTAS DE DESARROLLO

### OpenCode + Superpowers
- **OpenCode:** CLI interactivo para desarrollo asistido por IA
- **Superpowers plugin:** `~/.config/opencode/node_modules/superpowers/`
- **Skills disponibles:**
  - `brainstorming` — Refinamiento de diseño mediante preguntas socráticas
  - `writing-plans` — Creación de planes de implementación detallados
  - `subagent-driven-development` — Subagentes con revisión en 2 etapas
  - `executing-plans` — Ejecución por lotes con checkpoints
  - `test-driven-development` — Ciclo RED-GREEN-REFACTOR
  - `requesting-code-review` — Code review sistemático
  - `verification-before-completion` — Verificación antes de dar por terminado

### Playwright MCP (Browser Automation)
- **Estado:** Configurado en `opencode.json`
- **Comando:** `npx @playwright/mcp@latest`
- **Uso:** Tests E2E y scraping/interacción con sitios web
- **Tests:** 10 tests E2E en `e2e/dashboard.spec.ts`
- **Config:** `playwright.config.ts` con Chromium + webServer integrado

### registry-directory-mcp (shadcn Components)
- **Estado:** Build local en `~/.config/opencode/registry-directory-mcp`
- **Uso:** Búsqueda de componentes shadcn/ui en 40+ registros (Magic UI, Aceternity, etc.)

---

## NOTAS TÉCNICAS ACTUALIZADAS

### Arquitectura

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | Next.js 16 + Tailwind v4 + shadcn/ui | ✅ |
| Estado cliente | TanStack Query v5 + Zustand v5 | ✅ |
| Charts | lightweight-charts v5 + Recharts v3 | ✅ |
| Caché | Upstash Redis (con fallback Map en memoria) | ✅ |
| Rate limiting | @upstash/ratelimit (30 req/30s por IP) | ✅ |
| DB persistente | Supabase (PostgreSQL) | ✅ |
| Errores | Sentry | ✅ |
| Hosting | Vercel | ✅ |
| Worker Python | Railway (FastAPI + scipy) | Pendiente deploy |
| Tests E2E | Playwright | ✅ (10 tests) |

### Decisiones de arquitectura clave

1. **Yahoo Finance v8**: El endpoint v7 quote está bloqueado (401). Se usa `query1.finance.yahoo.com/v8/finance/chart`, extrayendo cotización del `meta` y calculando change desde `chartPreviousClose`.

2. **lightweight-charts v5 API**: Ya no existen `chart.addCandlestickSeries()`, `chart.addHistogramSeries()`, `chart.addLineSeries()`. Ahora se usa `chart.addSeries(CandlestickSeries, options)`, importando `CandlestickSeries`, `HistogramSeries`, `LineSeries` como valores.

3. **shadcn v4 + Tailwind v4**: Usa OKLCH para colores, `@theme` para variables CSS, `@import "tailwindcss"` en lugar de directivas `@tailwind`. No hay `tailwind.config.ts` — la configuración va en `globals.css`.

4. **Route groups**: `(dashboard)` agrupa páginas bajo un layout común sin afectar la URL. Así `/indices` usa el layout con Sidebar + Header.

5. **Caché multi-capa**: `getCachedOrFetch()` intenta: Redis → Map en memoria → stale cache → fetcher. `withRateLimit()` usa Redis + Map como fallback.

6. **Concurrencia Yahoo**: `getQuote()` usa `runWithConcurrency(..., 15)` para evitar rate limiting. Arrays de 503 símbolos divididos en batches de 15.

7. **Binance WS**: WebSocket client singleton que se conecta bajo demanda. Buffer de 1000 eventos en memoria. Se pierde al reiniciar el servidor.

### Problemas conocidos y soluciones

1. **Yahoo Finance v7 bloqueado** — Solución: Usar v8 chart endpoint como workaround.
2. **McClellan necesita 39+ días** — El oscilador empieza en 0 hasta que se acumule historial en Supabase.
3. **Put/Call ratio CBOE** — CBOE CSV puede fallar. Fallback usa Yahoo `^PCSC`. Si ambos fallan, default 0.85.
4. **Timestamps Yahoo v8** — Devuelve Unix timestamps en segundos. lightweight-charts v5 espera segundos. NO dividir por 1000.
5. **Binance WS se pierde al reiniciar** — El buffer de liquidaciones es en memoria. Para producir: migrar a cola Redis.
6. **CNN Fear & Greed inestable** — Endpoint CNN puede fallar. Fallback propio calcula con momentum S&P vs SMA125, safe haven SPY vs TLT, y VIX inverso.
7. **Sentry auth token** — Sin auth token, Sentry no sube source maps ni crea releases. Funciona pero pierde trazabilidad.

### Para producción futura

| Tarea | Prioridad | Dependencia |
|-------|-----------|-------------|
| Deploy Python worker en Railway | Baja | Cuenta Railway |
| Configurar Sentry auth token | Baja | Token de Sentry |
| Dominio custom (tradingdifferent.com) | Baja | DNS + Vercel |
| Migrar Binance buffer a Redis | Media | Upstash Redis ya listo |

---

## ESTRUCTURA COMPLETA DEL PROYECTO

```
trading-dashboard/                          ← Proyecto Next.js
├── .env.local                              ← Credenciales (NO subir a git)
├── .gitignore
├── AGENTS.md                               ← Contexto para asistentes IA
├── components.json                         ← Config shadcn
├── next.config.ts                          ← Next.js + Sentry wrapper
├── package.json
├── playwright.config.ts                    ← Config E2E tests
├── planning.md                             ← Este archivo
├── vercel.json                             ← Config Vercel deploy
├── sentry.client.config.ts                 ← Sentry client-side
├── sentry.server.config.ts                 ← Sentry server-side
├── sentry.edge.config.ts                   ← Sentry edge runtime
│
├── e2e/                                    ← Playwright E2E tests
│   └── dashboard.spec.ts                   ← 10 tests funcionales
│
├── python-workers/                         ← Worker Python (Railway)
│   ├── main.py                             ← FastAPI app (puerto 8001)
│   ├── requirements.txt                    ← fastapi, uvicorn, numpy, scipy
│   └── routers/
│       └── liquidation_heatmap.py          ← KDE endpoint POST /heatmap
│
├── scripts/
│   └── fetch-sp500.mjs                     ← Scraper Wikipedia S&P 500
│
└── src/
    ├── instrumentation.ts                  ← Sentry register hook
    ├── app/
    │   ├── globals.css                     ← Tailwind v4 + shadcn
    │   ├── layout.tsx                      ← Root layout (QueryProvider, TooltipProvider)
    │   │
    │   ├── (dashboard)/                    ← Route group (Sidebar + Header layout)
    │   │   ├── layout.tsx                  ← Dashboard layout (sidebar, search, alerts)
    │   │   ├── page.tsx                    ← Redirect a /indices
    │   │   ├── indices/page.tsx            ← Índices con candlestick charts
    │   │   ├── breadth/page.tsx            ← Amplitud (AD, McClellan, %MA, NH/NL)
    │   │   ├── sentiment/page.tsx          ← Sentimiento (F&G, VIX, Put/Call)
    │   │   ├── sectors/page.tsx            ← Sectores (RRG, treemap, rendimiento)
    │   │   ├── commodities/page.tsx        ← Commodities
    │   │   ├── forex/page.tsx              ← Forex
    │   │   ├── crypto/page.tsx             ← Crypto (3 tabs: Overview, Dominance, Liquidations)
    │   │   ├── liquidations/page.tsx       ← Liquidation Heatmap
    │   │   └── api/                        ← API routes heredadas del template
    │   │       ├── commodities/route.ts
    │   │       ├── sectors/performance/route.ts
    │   │       └── sectors/rrg/route.ts
    │   │
    │   └── api/                            ← API Routes oficiales
    │       ├── market/
    │       │   ├── quote/route.ts          ← Cotizaciones batch Yahoo Finance
    │       │   └── historical/route.ts     ← OHLCV histórico
    │       ├── breadth/
    │       │   ├── advance-decline/route.ts ← A/D desde Supabase
    │       │   ├── mcclellan/route.ts      ← Oscilador desde Supabase
    │       │   ├── above-ma/route.ts       ← % sobre SMA50/SMA200
    │       │   └── new-highs-lows/route.ts ← NH/NL
    │       ├── sentiment/
    │       │   ├── fear-greed/route.ts     ← CNN + fallback propio
    │       │   ├── vix/route.ts            ← Cotización VIX
    │       │   └── put-call/route.ts       ← CBOE CSV + fallback ^PCSC
    │       ├── crypto/
    │       │   └── route.ts                ← CoinGecko (markets/historical/global)
    │       └── liquidations/
    │           ├── recent/route.ts         ← Últimas liquidationes Binance WS
    │           ├── summary/route.ts        ← Resumen 24h
    │           ├── hourly/route.ts         ← Agregación por hora
    │           └── heatmap/route.ts        ← KDE heatmap (proxy Python + fallback TS)
    │
    ├── components/
    │   ├── charts/
    │   │   ├── chart-wrapper.tsx           ← HOC con loading/error/export/source
    │   │   ├── candlestick-chart.tsx       ← lightweight-charts v5
    │   │   ├── sparkline.tsx               ← Recharts mini sparkline
    │   │   ├── gauge-chart.tsx             ← SVG gauge 180° con tick marks
    │   │   ├── liquidation-heatmap.tsx     ← Canvas 2D heatmap
    │   │   ├── rrg-chart.tsx              ← D3 RRG scatter (placeholder)
    │   │   └── treemap-chart.tsx          ← Recharts treemap (placeholder)
    │   ├── crypto/
    │   │   └── crypto-table.tsx           ← TanStack Table ordenable + paginada
    │   ├── dashboard/
    │   │   ├── sidebar.tsx                ← Nav colapsable + tooltips
    │   │   ├── header.tsx                 ← Tabs + search + theme + presentation
    │   │   ├── metric-card.tsx            ← Card con sparkline + 52W + sesión
    │   │   ├── market-overview-strip.tsx   ← Sesión, VIX, F&G
    │   │   ├── timeframe-selector.tsx     ← Tabs 1D/5D/1M/3M/6M/1Y/5Y
    │   │   └── last-updated.tsx           ← Timestamp HH:mm:ss
    │   ├── shared/
    │   │   ├── query-provider.tsx         ← TanStack Query v5
    │   │   ├── loading-skeleton.tsx       ← Skeleton wrapper
    │   │   ├── shimmer-skeleton.tsx       ← Shimmer animation
    │   │   ├── error-state.tsx            ← Error + retry
    │   │   ├── export-button.tsx          ← PNG/CSV con html-to-image
    │   │   ├── global-search.tsx          ← Command palette (Ctrl+K)
    │   │   └── alert-engine.tsx           ← Evalúa alertas vs datos reales
    │   └── ui/                            ← shadcn/ui (19 componentes)
    │
    ├── hooks/
    │   ├── use-market-quote.ts            ← Polling 60s
    │   ├── use-market-historical.ts       ← Polling 300s
    │   ├── use-realtime.ts                ← Hook genérico polling
    │   ├── use-theme.ts                   ← Dark/light localStorage
    │   ├── use-breadth.ts                 ← 5 queries breadth
    │   ├── use-sentiment.ts               ← 3 queries sentimiento
    │   ├── use-crypto.ts                  ← 3 queries CoinGecko
    │   ├── use-liquidations.ts            ← 4 queries Binance WS
    │   ├── use-sectors.ts                 ← Sectores (placeholder)
    │   ├── use-commodities.ts             ← Commodities (placeholder)
    │   ├── use-forex.ts                   ← Forex (placeholder)
    │   ├── use-ui.ts                      ← Zustand: presentation mode + search
    │   ├── use-alerts.ts                  ← Zustand + persist: alert rules
    │   └── use-watchlist.ts              ← Zustand + persist: watchlist
    │
    ├── lib/
    │   ├── cache.ts                       ← Redis + Map + rate limiting
    │   ├── constants.ts                   ← Símbolos, TTLs, colores
    │   ├── supabase.ts                    ← Cliente Supabase + helpers
    │   ├── utils.ts                       ← cn(), formatPrice(), etc.
    │   ├── calculations/
    │   │   ├── breadth.ts                ← A/D, %MA, NH/NL
    │   │   ├── mcclellan.ts              ← Oscilador + Summation Index
    │   │   └── rrg.ts                    ← RS-Ratio + RS-Momentum
    │   └── providers/
    │       ├── yahoo-finance.ts           ← Yahoo Finance v8
    │       ├── cnn-fear-greed.ts          ← CNN + fallback propio
    │       ├── cboe.ts                    ← CBOE CSV + fallback ^PCSC
    │       ├── vix.ts                     ← Cotización VIX
    │       ├── coingecko.ts              ← CoinGecko API
    │       └── binance-ws.ts             ← Binance fstream WebSocket
    │
    ├── data/
    │   ├── sp500-symbols.json            ← 503 tickers S&P 500
    │   └── crypto-ids.json               ← 50 CoinGecko mappings
    │
    └── types/
        ├── api.types.ts                   ← ApiResponse<T>
        ├── market.types.ts                ← Quote, OHLCV
        ├── breadth.types.ts               ← BreadthData, McClellanData
        ├── sentiment.types.ts             ← FearGreed, PutCall, Vix
        ├── crypto.types.ts                ← CryptoMarket, CryptoGlobal
        └── sectors.types.ts              ← SectorInfo, SectorRRG
```
