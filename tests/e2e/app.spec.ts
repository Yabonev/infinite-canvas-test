import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/')

  await expect(page).toHaveTitle(/Infinite Canvas/)
})

test('displays app content', async ({ page }) => {
  await page.goto('http://localhost:5173/')

  await expect(page.getByText('Infinite Canvas Diagram')).toBeVisible()
})

test('keyboard navigation - create and navigate elements', async ({ page }) => {
  await page.goto('http://localhost:5173/')

  // Wait for canvas to be ready
  await page.waitForSelector('canvas')

  // Create first class element
  await page.keyboard.press('c')
  await page.waitForTimeout(100)

  // Check that element was created (status should show selected element)
  await expect(page.getByText(/Selected: class_/)).toBeVisible()

  // Create second class element (connected)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(100)

  // Should have two elements now
  await expect(page.getByText('Elements: 2')).toBeVisible()

  // Navigate between elements with Tab
  await page.keyboard.press('Tab')
  await page.waitForTimeout(100)

  // Focus on selected element
  await page.keyboard.press('f')
  await page.waitForTimeout(700) // Wait for animation

  // Test spatial navigation (should work even with one element)
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(100)

  // Test zoom controls
  await page.keyboard.press('Control+=')
  await page.waitForTimeout(100)

  await page.keyboard.press('Control+-')
  await page.waitForTimeout(100)

  // Test zoom to fit
  await page.keyboard.press('Control+0')
  await page.waitForTimeout(100)

  // Test go home
  await page.keyboard.press('Home')
  await page.waitForTimeout(100)

  // Test mode switching
  await page.keyboard.press('s') // Select mode
  await page.waitForTimeout(100)
  await expect(page.getByText('Mode: select')).toBeVisible()

  await page.keyboard.press('n') // Create mode
  await page.waitForTimeout(100)
  await expect(page.getByText('Mode: create')).toBeVisible()
})

test('element deletion', async ({ page }) => {
  await page.goto('http://localhost:5173/')

  await page.waitForSelector('canvas')

  // Create element
  await page.keyboard.press('c')
  await page.waitForTimeout(100)
  await expect(page.getByText('Elements: 1')).toBeVisible()

  // Delete element
  await page.keyboard.press('Delete')
  await page.waitForTimeout(100)
  await expect(page.getByText('Elements: 0')).toBeVisible()
  await expect(page.getByText('Selected: None')).toBeVisible()
})

test('vim-style navigation', async ({ page }) => {
  await page.goto('http://localhost:5173/')

  await page.waitForSelector('canvas')

  // Create element
  await page.keyboard.press('c')
  await page.waitForTimeout(100)

  // Test vim keys (should work same as arrows)
  await page.keyboard.press('h') // left
  await page.keyboard.press('l') // right
  await page.keyboard.press('k') // up
  await page.keyboard.press('j') // down
  await page.waitForTimeout(100)

  // Should still have the element selected
  await expect(page.getByText(/Selected: class_/)).toBeVisible()
})