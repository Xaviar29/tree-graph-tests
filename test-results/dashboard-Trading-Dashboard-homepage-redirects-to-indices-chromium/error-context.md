# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Trading Dashboard >> homepage redirects to indices
- Location: e2e\dashboard.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Indices"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')

```

```yaml
- complementary:
  - text: TradingDiff
  - button
  - navigation:
    - link "Overview":
      - /url: /
    - link "Indices":
      - /url: /indices
    - link "Breadth":
      - /url: /breadth
    - link "Sentiment":
      - /url: /sentiment
    - link "Sectors":
      - /url: /sectors
    - link "Commodities":
      - /url: /commodities
    - link "Forex":
      - /url: /forex
    - link "Crypto":
      - /url: /crypto
    - link "Liquidations":
      - /url: /liquidations
  - paragraph: v1.0.0 — API OK
- banner:
  - link "TradingDifferent":
    - /url: /
  - navigation:
    - link "Indices":
      - /url: /indices
    - link "Breadth":
      - /url: /breadth
    - link "Sentiment":
      - /url: /sentiment
    - link "Sectors":
      - /url: /sectors
    - link "Commodities":
      - /url: /commodities
    - link "Forex":
      - /url: /forex
    - link "Crypto":
      - /url: /crypto
    - link "Liquidations":
      - /url: /liquidations
  - button "Search (Ctrl+K)"
  - button "Presentation mode"
  - button
  - button
- main:
  - text: "After-Hours 10:22:00 PM VIX: 18.5 F&G: 62 (Greed) S&P: +0.58% Live Data"
  - paragraph: S&P 500
  - text: AFTER
  - paragraph: 7,444.25
  - text: +43.29 (+0.58%) 52W Low 52W High
  - paragraph: Nasdaq
  - text: AFTER
  - paragraph: 26,402.34
  - text: +314.14 (+1.20%) 52W Low 52W High
  - paragraph: Dow Jones
  - text: AFTER
  - paragraph: 49,693.20
  - text: "-67.36 (-0.14%) 52W Low 52W High"
  - paragraph: DAX
  - text: CLOSED
  - paragraph: 24,136.81
  - text: +181.88 (+0.76%) 52W Low 52W High
  - paragraph: Nikkei
  - text: CLOSED
  - paragraph: 63,272.11
  - text: +529.54 (+0.84%) 52W Low 52W High
  - paragraph: FTSE 100
  - text: CLOSED
  - paragraph: 10,325.35
  - text: +60.03 (+0.58%) 52W Low 52W High
  - heading "S&P 500" [level=3]
  - text: +0.58%
  - paragraph: 1y · 1d interval
  - button "1D"
  - button "5D"
  - button "1M"
  - button "3M"
  - button "6M"
  - button "1Y"
  - button "5Y"
  - button "Export"
  - text: "O: 7,409.12 H: 7,460.04 L: 7,375.13 Chg: +43.29 (+0.58%) SMA50 SMA200 Volume"
  - table:
    - row:
      - cell
      - cell:
        - link "Charting by TradingView":
          - /url: https://www.tradingview.com/?utm_medium=lwc-link&utm_campaign=lwc-chart&utm_source=localhost/indices
          - img
      - cell
    - row:
      - cell
      - cell
      - cell
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Trading Dashboard', () => {
  4  |   test('homepage redirects to indices', async ({ page }) => {
  5  |     await page.goto('/')
  6  |     await expect(page).toHaveURL('/indices')
> 7  |     await expect(page.locator('h1')).toContainText('Indices')
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  8  |   })
  9  | 
  10 |   test('breadth page loads and shows metrics', async ({ page }) => {
  11 |     await page.goto('/breadth')
  12 |     await expect(page.locator('h1')).toContainText('Market Breadth')
  13 |     await expect(page.getByText('Advance / Decline')).toBeVisible()
  14 |   })
  15 | 
  16 |   test('sentiment page loads with gauges', async ({ page }) => {
  17 |     await page.goto('/sentiment')
  18 |     await expect(page.locator('h1')).toContainText('Market Sentiment')
  19 |     await expect(page.getByText('Fear & Greed')).toBeVisible()
  20 |     await expect(page.getByText('VIX')).toBeVisible()
  21 |   })
  22 | 
  23 |   test('crypto page has three tabs', async ({ page }) => {
  24 |     await page.goto('/crypto')
  25 |     await expect(page.locator('h1')).toContainText('Cryptocurrency')
  26 |     await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
  27 |     await expect(page.getByRole('tab', { name: 'Dominance' })).toBeVisible()
  28 |     await expect(page.getByRole('tab', { name: 'Liquidations' })).toBeVisible()
  29 |   })
  30 | 
  31 |   test('liquidations page loads with controls', async ({ page }) => {
  32 |     await page.goto('/liquidations')
  33 |     await expect(page.locator('h1')).toContainText('Liquidation Heatmap')
  34 |     await expect(page.getByText('BTC')).toBeVisible()
  35 |     await expect(page.getByText('ETH')).toBeVisible()
  36 |   })
  37 | 
  38 |   test('global search opens with Ctrl+K', async ({ page }) => {
  39 |     await page.goto('/indices')
  40 |     await page.keyboard.press('Control+k')
  41 |     await expect(page.getByPlaceholder('Search pages...')).toBeVisible()
  42 |     await page.getByPlaceholder('Search pages...').fill('crypto')
  43 |     await page.getByText('Crypto').click()
  44 |     await expect(page).toHaveURL('/crypto')
  45 |   })
  46 | 
  47 |   test('sidebar navigation works', async ({ page }) => {
  48 |     await page.goto('/indices')
  49 |     await page.getByRole('link', { name: 'Breadth' }).first().click()
  50 |     await expect(page).toHaveURL('/breadth')
  51 |   })
  52 | 
  53 |   test('presentation mode toggles sidebar', async ({ page }) => {
  54 |     await page.goto('/indices')
  55 |     const sidebar = page.locator('aside')
  56 |     await expect(sidebar).toBeVisible()
  57 |     await page.getByTitle('Presentation mode').click()
  58 |   })
  59 | 
  60 |   test('header tab navigation', async ({ page }) => {
  61 |     await page.goto('/breadth')
  62 |     await page.getByRole('link', { name: 'Sentiment' }).click()
  63 |     await expect(page).toHaveURL('/sentiment')
  64 |   })
  65 | 
  66 |   test('theme toggle works', async ({ page }) => {
  67 |     await page.goto('/indices')
  68 |     const html = page.locator('html')
  69 |     const initialClass = await html.getAttribute('class')
  70 |     await page.getByRole('button', { name: /switch to/i }).first().click()
  71 |   })
  72 | })
  73 | 
```