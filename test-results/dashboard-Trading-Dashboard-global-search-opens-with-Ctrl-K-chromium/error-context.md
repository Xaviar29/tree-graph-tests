# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Trading Dashboard >> global search opens with Ctrl+K
- Location: e2e\dashboard.spec.ts:38:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByText('Crypto') resolved to 3 elements:
    1) <span class="font-medium">Crypto</span> aka locator('aside a').filter({ hasText: 'Crypto' })
    2) <a href="/crypto" class="whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground">Crypto</a> aka locator('header').getByText('Crypto')
    3) <span>Crypto</span> aka getByRole('button', { name: 'Crypto' })

Call log:
  - waiting for getByText('Crypto')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: TradingDiff
        - button [ref=e7]:
          - img [ref=e9]
      - navigation [ref=e11]:
        - link [ref=e12] [cursor=pointer]:
          - /url: /
          - img [ref=e13]
          - generic [ref=e15]: Overview
        - link [ref=e16] [cursor=pointer]:
          - /url: /indices
          - img [ref=e18]
          - generic [ref=e21]: Indices
        - link [ref=e22] [cursor=pointer]:
          - /url: /breadth
          - img [ref=e23]
          - generic [ref=e25]: Breadth
        - link [ref=e26] [cursor=pointer]:
          - /url: /sentiment
          - img [ref=e27]
          - generic [ref=e30]: Sentiment
        - link [ref=e31] [cursor=pointer]:
          - /url: /sectors
          - img [ref=e32]
          - generic [ref=e35]: Sectors
        - link [ref=e36] [cursor=pointer]:
          - /url: /commodities
          - img [ref=e37]
          - generic [ref=e41]: Commodities
        - link [ref=e42] [cursor=pointer]:
          - /url: /forex
          - img [ref=e43]
          - generic [ref=e45]: Forex
        - link [ref=e46] [cursor=pointer]:
          - /url: /crypto
          - img [ref=e47]
          - generic [ref=e49]: Crypto
        - link [ref=e50] [cursor=pointer]:
          - /url: /liquidations
          - img [ref=e51]
          - generic [ref=e53]: Liquidations
      - paragraph [ref=e57]: v1.0.0 — API OK
    - generic [ref=e58]:
      - banner [ref=e59]:
        - link [ref=e60] [cursor=pointer]:
          - /url: /
          - text: TradingDifferent
        - navigation [ref=e61]:
          - link [ref=e62] [cursor=pointer]:
            - /url: /indices
            - text: Indices
          - link [ref=e63] [cursor=pointer]:
            - /url: /breadth
            - text: Breadth
          - link [ref=e64] [cursor=pointer]:
            - /url: /sentiment
            - text: Sentiment
          - link [ref=e65] [cursor=pointer]:
            - /url: /sectors
            - text: Sectors
          - link [ref=e66] [cursor=pointer]:
            - /url: /commodities
            - text: Commodities
          - link [ref=e67] [cursor=pointer]:
            - /url: /forex
            - text: Forex
          - link [ref=e68] [cursor=pointer]:
            - /url: /crypto
            - text: Crypto
          - link [ref=e69] [cursor=pointer]:
            - /url: /liquidations
            - text: Liquidations
        - generic [ref=e70]:
          - button [ref=e71]:
            - img
          - button [ref=e72]:
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
              - generic [ref=e86]: Regular
            - generic [ref=e88]:
              - img [ref=e89]
              - generic [ref=e92]: "--:--:--"
            - generic [ref=e94]:
              - img [ref=e95]
              - generic [ref=e97]: "VIX:"
              - generic [ref=e98]: "18.5"
            - generic [ref=e100]:
              - img [ref=e101]
              - generic [ref=e104]: "F&G:"
              - generic [ref=e105]: "62"
              - generic [ref=e106]: (Greed)
            - generic [ref=e107]: Live Data
          - generic [ref=e213]:
            - generic [ref=e214]:
              - generic [ref=e215]:
                - heading [level=3] [ref=e217]: S&P 500
                - paragraph [ref=e218]: 1y · 1d interval
              - generic [ref=e219]:
                - generic [ref=e220]:
                  - button [ref=e221]: 1D
                  - button [ref=e222]: 5D
                  - button [ref=e223]: 1M
                  - button [ref=e224]: 3M
                  - button [ref=e225]: 6M
                  - button [ref=e226]: 1Y
                  - button [ref=e227]: 5Y
                - button [ref=e229]:
                  - img
            - generic [ref=e230]:
              - generic [ref=e233]: SMA50
              - generic [ref=e236]: SMA200
              - generic [ref=e239]: Volume
  - alert [ref=e244]
  - dialog "Search pages" [ref=e248]:
    - heading "Search pages" [level=2] [ref=e249]
    - generic [ref=e250]:
      - generic [ref=e252]:
        - img [ref=e253]
        - textbox "Search pages..." [active] [ref=e256]: crypto
      - button "Crypto" [ref=e258]:
        - img [ref=e259]
        - generic [ref=e261]: Crypto
    - button "Close" [ref=e262]:
      - img
      - generic [ref=e263]: Close
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
> 43 |     await page.getByText('Crypto').click()
     |                                    ^ Error: locator.click: Error: strict mode violation: getByText('Crypto') resolved to 3 elements:
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