import { test, expect } from '@playwright/test'

test.describe('Trading Dashboard', () => {
  test('homepage redirects to indices', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/indices')
    await expect(page.locator('h1')).toContainText('Indices')
  })

  test('breadth page loads and shows metrics', async ({ page }) => {
    await page.goto('/breadth')
    await expect(page.locator('h1')).toContainText('Market Breadth')
    await expect(page.getByText('Advance / Decline')).toBeVisible()
  })

  test('sentiment page loads with gauges', async ({ page }) => {
    await page.goto('/sentiment')
    await expect(page.locator('h1')).toContainText('Market Sentiment')
    await expect(page.getByText('Fear & Greed')).toBeVisible()
    // Use first() to avoid strict mode violation if multiple VIX mentions exist
    await expect(page.getByText('VIX', { exact: true }).first()).toBeVisible()
  })

  test('crypto page has three tabs', async ({ page }) => {
    await page.goto('/crypto')
    await expect(page.locator('h1')).toContainText('Cryptocurrency')
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Dominance' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Liquidations' })).toBeVisible()
  })

  test('liquidations page loads with controls', async ({ page }) => {
    await page.goto('/liquidations')
    await expect(page.locator('h1')).toContainText('Liquidation Heatmap')
    await expect(page.getByText('BTC')).toBeVisible()
    await expect(page.getByText('ETH')).toBeVisible()
  })
  
  test('sectors page shows treemap and rrg', async ({ page }) => {
    await page.goto('/sectors')
    await expect(page.locator('h1')).toContainText('Sectores')
    await expect(page.getByText('Rendimiento (Treemap)')).toBeVisible()
    await page.getByText('Relative Rotation Graph (RRG)').click()
    await expect(page.locator('svg')).toBeVisible()
  })

  test('commodities page shows gold and oil', async ({ page }) => {
    await page.goto('/commodities')
    await expect(page.locator('h1')).toContainText('Materias Primas')
    await expect(page.getByText('Gold (GC=F)')).toBeVisible()
    await expect(page.getByText('WTI Crude (CL=F)')).toBeVisible()
  })

  test('forex page shows major pairs', async ({ page }) => {
    await page.goto('/forex')
    await expect(page.locator('h1')).toContainText('Divisas')
    await expect(page.getByText('DXY')).toBeVisible()
    await expect(page.getByText('EUR/USD')).toBeVisible()
  })

  test('global search opens with Ctrl+K', async ({ page }) => {
    await page.goto('/indices')
    await page.keyboard.press('Control+k')
    await expect(page.getByPlaceholder('Search pages...')).toBeVisible()
    await page.getByPlaceholder('Search pages...').fill('crypto')
    await page.getByText('Crypto').first().click()
    await expect(page).toHaveURL('/crypto')
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/indices')
    // Use title for collapsed sidebar or text for expanded
    const link = page.locator('aside nav a').filter({ hasText: 'Breadth' }).first()
    await link.click()
    await expect(page).toHaveURL('/breadth')
  })

  test('presentation mode toggles sidebar', async ({ page }) => {
    await page.goto('/indices')
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    await page.getByTitle(/presentation mode/i).click()
    // Sidebar should be hidden in presentation mode
    // toBeHidden() handles visibility and transitions better
    await expect(sidebar).toBeHidden()
  })

  test('header tab navigation', async ({ page }) => {
    await page.goto('/breadth')
    await page.locator('header nav a').filter({ hasText: 'Sentiment' }).click()
    await expect(page).toHaveURL('/sentiment')
  })

  test('theme toggle works', async ({ page }) => {
    await page.goto('/indices')
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class') || ''
    await page.getByTitle(/switch to/i).first().click()
    const newClass = await html.getAttribute('class') || ''
    // Check that class changed (e.g. from 'dark' to '' or vice versa)
    expect(newClass).not.toBe(initialClass)
  })
})
