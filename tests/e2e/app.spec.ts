import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await expect(page).toHaveTitle(/Infinite Canvas/)
})

test('displays app content', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await expect(page.getByText('Infinite Canvas Diagram')).toBeVisible()
})