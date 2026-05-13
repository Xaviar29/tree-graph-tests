# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Trading Dashboard >> sentiment page loads with gauges
- Location: e2e\dashboard.spec.ts:16:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('VIX')
Expected: visible
Error: strict mode violation: getByText('VIX') resolved to 4 elements:
    1) <h3 class="text-base font-semibold text-foreground">VIX History</h3> aka getByRole('heading', { name: 'VIX History' })
    2) <h3 class="text-base font-semibold text-foreground">VIX Futures Term Structure</h3> aka getByRole('heading', { name: 'VIX Futures Term Structure' })
    3) <span class="recharts-legend-item-text">VIX</span> aka getByText('VIX', { exact: true })
    4) <span class="recharts-legend-item-text">VIX 3M</span> aka getByText('VIX 3M')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('VIX')

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
          - img [ref=e22]
          - generic [ref=e24]: Breadth
        - link "Sentiment" [ref=e25] [cursor=pointer]:
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
            - heading "Market Sentiment" [level=1] [ref=e80]
            - paragraph [ref=e81]: Gauge the emotional state of the market — from fear to greed, volatility to complacency
          - generic [ref=e89]:
            - generic [ref=e90]:
              - generic [ref=e93]:
                - heading "Fear & Greed History" [level=3] [ref=e95]
                - paragraph [ref=e96]: "Current: — (—) · >75 = Greed, <25 = Fear"
              - application [ref=e100]
            - generic [ref=e106]:
              - generic [ref=e109]:
                - heading "VIX History" [level=3] [ref=e111]
                - paragraph [ref=e112]: "Latest: — · <20 = low vol, >30 = high fear"
              - application [ref=e116]
          - generic [ref=e122]:
            - generic [ref=e123]:
              - heading "VIX Futures Term Structure" [level=3] [ref=e128]
              - generic [ref=e131]:
                - list [ref=e133]:
                  - listitem [ref=e134]:
                    - img "VIX legend icon" [ref=e135]
                    - text: VIX
                  - listitem [ref=e137]:
                    - img "VIX 3M legend icon" [ref=e138]
                    - text: VIX 3M
                - application [ref=e140]:
                  - generic [ref=e174]:
                    - generic [ref=e175]:
                      - generic [ref=e177]: 1M
                      - generic [ref=e179]: 2M
                      - generic [ref=e181]: 3M
                      - generic [ref=e183]: 4M
                      - generic [ref=e185]: 5M
                      - generic [ref=e187]: 6M
                    - generic [ref=e188]:
                      - generic [ref=e190]: "0"
                      - generic [ref=e192]: "5"
                      - generic [ref=e194]: "10"
                      - generic [ref=e196]: "15"
                      - generic [ref=e198]: "20"
            - generic [ref=e201]:
              - img [ref=e202]:
                - generic [ref=e209]: "30"
                - generic [ref=e212]: "60"
                - generic [ref=e214]: "90"
                - generic [ref=e217]: "120"
                - generic [ref=e219]: "150"
                - generic [ref=e220]: Put/Call Sentiment
              - generic [ref=e221]: 50Bullish
  - alert [ref=e222]
  - generic [ref=e223]: "0"
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
> 20 |     await expect(page.getByText('VIX')).toBeVisible()
     |                                         ^ Error: expect(locator).toBeVisible() failed
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