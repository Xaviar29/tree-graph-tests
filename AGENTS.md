<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TRADING DIFFERENT — GUÍA PARA AGENTS

## Stack
- Next.js 16.2.6 + TypeScript + Tailwind v4 + shadcn/ui
- lightweight-charts v5, Recharts v3
- TanStack Query v5, Zustand v5
- Upstash Redis, Supabase, Sentry

## Cómo hacer deploy a producción

Siempre que hagas cambios importantes, ejecuta estos pasos:

```bash
cd G:\utils\programming\python\code\antigravity\tradingdifferent\trading-dashboard

# 1. Verificar que compila
npm run build

# Si hay errores, fixearlos antes de deployar

# 2. Commit + push a GitHub
git add -A
git commit -m "descripción de los cambios"
git push

# 3. Deploy a Vercel (la API key está en planning.md sección Vercel)
$env:VERCEL_TOKEN="<token-de-vercel>"
vercel --token $env:VERCEL_TOKEN --prod --yes
```

El deploy tarda ~45s. La URL de producción es:
https://trading-dashboard-omega-lemon.vercel.app

## Variable de entorno Vercel
La API key de Vercel está en `$env:VERCEL_TOKEN`. Si expira, reemplazarla.

## Servicios externos
- **Vercel**: https://vercel.com/javi-s-projects3/trading-dashboard
- **GitHub**: https://github.com/Xaviar29/tree-graph-tests
- **Upstash Redis**: Consola Upstash (caché + rate limiting)
- **Supabase**: Tabla `breadth_history` (AD Line persistente)
- **Sentry**: https://sentry.io/orgs/javi-s-projects3/
- **Railway**: Python worker para KDE heatmap (pendiente deploy)

## Reglas importantes
- NO subir .env.local a GitHub (contiene secrets)
- NO incluir API keys en código o documentación
- Ejecutar `npm run build` antes de cualquier deploy
- Verificar que la build tenga 0 errores TypeScript
