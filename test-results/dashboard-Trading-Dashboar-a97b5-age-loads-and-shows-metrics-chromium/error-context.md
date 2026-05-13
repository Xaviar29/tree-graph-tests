# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Trading Dashboard >> breadth page loads and shows metrics
- Location: e2e\dashboard.spec.ts:10:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Advance / Decline')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Advance / Decline')

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
  - heading "Market Breadth" [level=1]
  - paragraph: How many stocks are participating in the move — breadth confirms or warns against price action
  - heading "Advance-Decline Line" [level=3]
  - paragraph: "AD Line: — · Net: +0"
  - application
  - heading "Advancers vs Decliners" [level=3]
  - paragraph: "Today: 0 advancing · 0 declining · — ratio"
  - application: Advancing Declining 0 1 2 3 4
  - heading "McClellan Oscillator" [level=3]
  - paragraph: Insufficient history — needs more trading days
  - application: May 1 May 3 May 5 May 7 May 9 May 11 May 13 0 1 2 3 4
  - heading "Summation Index" [level=3]
  - paragraph: "SI: 0 · Positive = long-term bullish breadth"
  - application: May 1 May 3 May 5 May 7 May 9 May 11 May 13 0 1 2 3 4
  - heading "% Stocks Above Moving Averages" [level=3]
  - list:
    - listitem:
      - img "SMA 200 legend icon"
      - text: SMA 200
    - listitem:
      - img "SMA 50 legend icon"
      - text: SMA 50
  - application
  - heading "New Highs vs New Lows" [level=3]
  - application: New Highs New Lows 0 1 2 3 4
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
  7  |     await expect(page.locator('h1')).toContainText('Indices')
  8  |   })
  9  | 
  10 |   test('breadth page loads and shows metrics', async ({ page }) => {
  11 |     await page.goto('/breadth')
  12 |     await expect(page.locator('h1')).toContainText('Market Breadth')
> 13 |     await expect(page.getByText('Advance / Decline')).toBeVisible()
     |                                                       ^ Error: expect(locator).toBeVisible() failed
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