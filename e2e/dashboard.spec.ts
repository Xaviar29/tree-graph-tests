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
    await expect(page.getByText('VIX')).toBeVisible()
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

  test('global search opens with Ctrl+K', async ({ page }) => {
    await page.goto('/indices')
    await page.keyboard.press('Control+k')
    await expect(page.getByPlaceholder('Search pages...')).toBeVisible()
    await page.getByPlaceholder('Search pages...').fill('crypto')
    await page.getByText('Crypto').click()
    await expect(page).toHaveURL('/crypto')
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/indices')
    await page.getByRole('link', { name: 'Breadth' }).first().click()
    await expect(page).toHaveURL('/breadth')
  })

  test('presentation mode toggles sidebar', async ({ page }) => {
    await page.goto('/indices')
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    await page.getByTitle('Presentation mode').click()
  })

  test('header tab navigation', async ({ page }) => {
    await page.goto('/breadth')
    await page.getByRole('link', { name: 'Sentiment' }).click()
    await expect(page).toHaveURL('/sentiment')
  })

  test('theme toggle works', async ({ page }) => {
    await page.goto('/indices')
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class')
    await page.getByRole('button', { name: /switch to/i }).first().click()
  })
})
