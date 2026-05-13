# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Trading Dashboard >> header tab navigation
- Location: e2e\dashboard.spec.ts:60:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'Sentiment' }) resolved to 2 elements:
    1) <a href="/sentiment" class="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 text-muted-foreground hover:bg-accent hover:text-accent-foreground">…</a> aka getByRole('complementary').getByRole('link', { name: 'Sentiment' })
    2) <a href="/sentiment" class="whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground">Sentiment</a> aka getByRole('banner').getByRole('link', { name: 'Sentiment' })

Call log:
  - waiting for getByRole('link', { name: 'Sentiment' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: TradingDiff
        - button [ref=e7]:
          - img [ref=e9]
      - navigation [ref=e11]:
        - link "Overview" [ref=e12] [cursor=pointer]:
          - /url: /
          - img [ref=e13]
          - generic [ref=e15]: Overview
        - link "Indices" [ref=e16] [cursor=pointer]:
          - /url: /indices
          - img [ref=e17]
          - generic [ref=e20]: Indices
        - link "Breadth" [ref=e21] [cursor=pointer]:
          - /url: /breadth
          - img [ref=e23]
          - generic [ref=e25]: Breadth
        - link "Sentiment" [ref=e26] [cursor=pointer]:
          - /url: /sentiment
          - img [ref=e27]
          - generic [ref=e30]: Sentiment
        - link "Sectors" [ref=e31] [cursor=pointer]:
          - /url: /sectors
          - img [ref=e32]
          - generic [ref=e35]: Sectors
        - link "Commodities" [ref=e36] [cursor=pointer]:
          - /url: /commodities
          - img [ref=e37]
          - generic [ref=e41]: Commodities
        - link "Forex" [ref=e42] [cursor=pointer]:
          - /url: /forex
          - img [ref=e43]
          - generic [ref=e45]: Forex
        - link "Crypto" [ref=e46] [cursor=pointer]:
          - /url: /crypto
          - img [ref=e47]
          - generic [ref=e49]: Crypto
        - link "Liquidations" [ref=e50] [cursor=pointer]:
          - /url: /liquidations
          - img [ref=e51]
          - generic [ref=e53]: Liquidations
      - paragraph [ref=e57]: v1.0.0 — API OK
    - generic [ref=e58]:
      - banner [ref=e59]:
        - link "TradingDifferent" [ref=e60] [cursor=pointer]:
          - /url: /
        - navigation [ref=e61]:
          - link "Indices" [ref=e62] [cursor=pointer]:
            - /url: /indices
          - link "Breadth" [ref=e63] [cursor=pointer]:
            - /url: /breadth
          - link "Sentiment" [ref=e64] [cursor=pointer]:
            - /url: /sentiment
          - link "Sectors" [ref=e65] [cursor=pointer]:
            - /url: /sectors
          - link "Commodities" [ref=e66] [cursor=pointer]:
            - /url: /commodities
          - link "Forex" [ref=e67] [cursor=pointer]:
            - /url: /forex
          - link "Crypto" [ref=e68] [cursor=pointer]:
            - /url: /crypto
          - link "Liquidations" [ref=e69] [cursor=pointer]:
            - /url: /liquidations
        - generic [ref=e70]:
          - button "Search (Ctrl+K)" [ref=e71]:
            - img
          - button "Presentation mode" [ref=e72]:
            - img
          - button [ref=e73]:
            - img
          - button [ref=e74]:
            - img
      - main [ref=e75]:
        - generic [ref=e77]:
          - generic [ref=e79]:
            - heading "Market Breadth" [level=1] [ref=e80]
            - paragraph [ref=e81]: How many stocks are participating in the move — breadth confirms or warns against price action
          - generic [ref=e103]:
            - generic [ref=e104]:
              - generic [ref=e107]:
                - heading "Advance-Decline Line" [level=3] [ref=e109]
                - paragraph [ref=e110]: "AD Line: — · Net: +0"
              - application [ref=e114]
            - generic [ref=e120]:
              - generic [ref=e123]:
                - heading "Advancers vs Decliners" [level=3] [ref=e125]
                - paragraph [ref=e126]: "Today: 0 advancing · 0 declining · — ratio"
              - application [ref=e130]:
                - generic [ref=e142]:
                  - generic [ref=e143]:
                    - generic [ref=e145]: Advancing
                    - generic [ref=e147]: Declining
                  - generic [ref=e148]:
                    - generic [ref=e150]: "0"
                    - generic [ref=e152]: "1"
                    - generic [ref=e154]: "2"
                    - generic [ref=e156]: "3"
                    - generic [ref=e158]: "4"
          - generic [ref=e159]:
            - generic [ref=e160]:
              - generic [ref=e163]:
                - heading "McClellan Oscillator" [level=3] [ref=e165]
                - paragraph [ref=e166]: "Osc: — · EMA19: — · EMA39: —"
              - application [ref=e170]
            - generic [ref=e176]:
              - generic [ref=e179]:
                - heading "Summation Index" [level=3] [ref=e181]
                - paragraph [ref=e182]: —
              - application [ref=e186]
          - generic [ref=e193]:
            - heading "% Stocks Above Moving Averages" [level=3] [ref=e198]
            - generic [ref=e201]:
              - list [ref=e203]:
                - listitem [ref=e204]:
                  - img "SMA 200 legend icon" [ref=e205]
                  - text: SMA 200
                - listitem [ref=e207]:
                  - img "SMA 50 legend icon" [ref=e208]
                  - text: SMA 50
              - application [ref=e210]
          - generic [ref=e217]:
            - heading "New Highs vs New Lows" [level=3] [ref=e222]
            - application [ref=e226]:
              - generic [ref=e238]:
                - generic [ref=e239]:
                  - generic [ref=e241]: New Highs
                  - generic [ref=e243]: New Lows
                - generic [ref=e244]:
                  - generic [ref=e246]: "0"
                  - generic [ref=e248]: "1"
                  - generic [ref=e250]: "2"
                  - generic [ref=e252]: "3"
                  - generic [ref=e254]: "4"
  - alert [ref=e255]
  - generic [ref=e256]: New Highs
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
> 62 |     await page.getByRole('link', { name: 'Sentiment' }).click()
     |                                                         ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'Sentiment' }) resolved to 2 elements:
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