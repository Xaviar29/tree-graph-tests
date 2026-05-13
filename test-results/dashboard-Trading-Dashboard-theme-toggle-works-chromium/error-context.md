# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Trading Dashboard >> theme toggle works
- Location: e2e\dashboard.spec.ts:66:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /switch to/i }).first()

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
          - img [ref=e18]
          - generic [ref=e21]: Indices
        - link "Breadth" [ref=e22] [cursor=pointer]:
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
          - generic [ref=e78]:
            - generic [ref=e79]:
              - img [ref=e80]
              - generic [ref=e85]: After-Hours
            - generic [ref=e87]:
              - img [ref=e88]
              - generic [ref=e91]: 10:22:00 PM
            - generic [ref=e93]:
              - img [ref=e94]
              - generic [ref=e96]: "VIX:"
              - generic [ref=e97]: "18.5"
            - generic [ref=e99]:
              - img [ref=e100]
              - generic [ref=e103]: "F&G:"
              - generic [ref=e104]: "62"
              - generic [ref=e105]: (Greed)
            - generic [ref=e107]:
              - img [ref=e108]
              - generic [ref=e111]: "S&P:"
              - generic [ref=e112]: +0.58%
            - generic [ref=e113]: Live Data
          - generic [ref=e114]:
            - generic [ref=e118] [cursor=pointer]:
              - generic [ref=e119]:
                - paragraph [ref=e120]: S&P 500
                - generic [ref=e121]: AFTER
              - paragraph [ref=e122]: 7,444.25
              - generic [ref=e123]:
                - generic [ref=e124]: "+43.29"
                - generic [ref=e125]: (+0.58%)
              - generic [ref=e127]:
                - generic [ref=e128]: 52W Low
                - generic [ref=e129]: 52W High
            - generic [ref=e138] [cursor=pointer]:
              - generic [ref=e139]:
                - paragraph [ref=e140]: Nasdaq
                - generic [ref=e141]: AFTER
              - paragraph [ref=e142]: 26,402.34
              - generic [ref=e143]:
                - generic [ref=e144]: "+314.14"
                - generic [ref=e145]: (+1.20%)
              - generic [ref=e147]:
                - generic [ref=e148]: 52W Low
                - generic [ref=e149]: 52W High
            - generic [ref=e158] [cursor=pointer]:
              - generic [ref=e159]:
                - paragraph [ref=e160]: Dow Jones
                - generic [ref=e161]: AFTER
              - paragraph [ref=e162]: 49,693.20
              - generic [ref=e163]:
                - generic [ref=e164]: "-67.36"
                - generic [ref=e165]: (-0.14%)
              - generic [ref=e167]:
                - generic [ref=e168]: 52W Low
                - generic [ref=e169]: 52W High
            - generic [ref=e178] [cursor=pointer]:
              - generic [ref=e179]:
                - paragraph [ref=e180]: DAX
                - generic [ref=e181]: CLOSED
              - paragraph [ref=e182]: 24,136.81
              - generic [ref=e183]:
                - generic [ref=e184]: "+181.88"
                - generic [ref=e185]: (+0.76%)
              - generic [ref=e187]:
                - generic [ref=e188]: 52W Low
                - generic [ref=e189]: 52W High
            - generic [ref=e198] [cursor=pointer]:
              - generic [ref=e199]:
                - paragraph [ref=e200]: Nikkei
                - generic [ref=e201]: CLOSED
              - paragraph [ref=e202]: 63,272.11
              - generic [ref=e203]:
                - generic [ref=e204]: "+529.54"
                - generic [ref=e205]: (+0.84%)
              - generic [ref=e207]:
                - generic [ref=e208]: 52W Low
                - generic [ref=e209]: 52W High
            - generic [ref=e218] [cursor=pointer]:
              - generic [ref=e219]:
                - paragraph [ref=e220]: FTSE 100
                - generic [ref=e221]: CLOSED
              - paragraph [ref=e222]: 10,325.35
              - generic [ref=e223]:
                - generic [ref=e224]: "+60.03"
                - generic [ref=e225]: (+0.58%)
              - generic [ref=e227]:
                - generic [ref=e228]: 52W Low
                - generic [ref=e229]: 52W High
          - generic [ref=e236]:
            - generic [ref=e237]:
              - generic [ref=e238]:
                - generic [ref=e239]:
                  - generic [ref=e240]:
                    - heading "S&P 500" [level=3] [ref=e241]
                    - generic [ref=e242]:
                      - img [ref=e243]
                      - text: +0.58%
                  - paragraph [ref=e246]: 1y · 1d interval
                - generic [ref=e247]:
                  - generic [ref=e248]:
                    - button "1D" [ref=e249]
                    - button "5D" [ref=e250]
                    - button "1M" [ref=e251]
                    - button "3M" [ref=e252]
                    - button "6M" [ref=e253]
                    - button "1Y" [ref=e254]
                    - button "5Y" [ref=e255]
                  - button "Export" [ref=e257]:
                    - img
              - generic [ref=e258]:
                - generic [ref=e259]:
                  - generic [ref=e260]: "O:"
                  - generic [ref=e261]: 7,409.12
                - generic [ref=e263]:
                  - generic [ref=e264]: "H:"
                  - generic [ref=e265]: 7,460.04
                - generic [ref=e267]:
                  - generic [ref=e268]: "L:"
                  - generic [ref=e269]: 7,375.13
                - generic [ref=e271]:
                  - generic [ref=e272]: "Chg:"
                  - generic [ref=e273]: +43.29 (+0.58%)
              - generic [ref=e274]:
                - generic [ref=e277]: SMA50
                - generic [ref=e280]: SMA200
                - generic [ref=e283]: Volume
            - table [ref=e287]:
              - row [ref=e288]:
                - cell
                - cell [ref=e289]:
                  - link "Charting by TradingView" [ref=e293] [cursor=pointer]:
                    - /url: https://www.tradingview.com/?utm_medium=lwc-link&utm_campaign=lwc-chart&utm_source=localhost/indices
                    - img [ref=e294]
                - cell [ref=e298]
              - row [ref=e302]:
                - cell
                - cell [ref=e303]
                - cell [ref=e307]
  - button "Open Next.js Dev Tools" [ref=e315] [cursor=pointer]:
    - img [ref=e316]
  - alert [ref=e319]
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
  62 |     await page.getByRole('link', { name: 'Sentiment' }).click()
  63 |     await expect(page).toHaveURL('/sentiment')
  64 |   })
  65 | 
  66 |   test('theme toggle works', async ({ page }) => {
  67 |     await page.goto('/indices')
  68 |     const html = page.locator('html')
  69 |     const initialClass = await html.getAttribute('class')
> 70 |     await page.getByRole('button', { name: /switch to/i }).first().click()
     |                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  71 |   })
  72 | })
  73 | 
```