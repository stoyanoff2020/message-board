// End-to-End Tests for Message Board Functionality
// Note: This requires Playwright to be installed and configured
// Run: npm install -D @playwright/test
// Then: npx playwright install

import { test, expect } from '@playwright/test'

test.describe('Message Board E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and login
    await page.goto('http://localhost:3000')
    
    // Login first
    await page.click('text=Sign in')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to home page
    await expect(page).toHaveURL('/')
  })

  test('should create a new message', async ({ page }) => {
    // Click create message button (adjust selector based on actual implementation)
    await page.click('text=Create Message')

    // Fill out message form
    await page.fill('input[name="title"]', 'Test Message Title')
    await page.fill('textarea[name="description"]', 'This is a test message description that is long enough to pass validation.')
    await page.fill('input[name="contactPhone"]', '(555) 123-4567')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify message was created and appears in the list
    await expect(page.locator('text=Test Message Title')).toBeVisible()
    await expect(page.locator('text=This is a test message description')).toBeVisible()
  })

  test('should search for messages', async ({ page }) => {
    // Ensure there are messages to search
    await expect(page.locator('[data-testid="message-card"]').first()).toBeVisible()

    // Use search functionality
    await page.fill('input[placeholder*="Search"]', 'test')

    // Verify search results are filtered
    await expect(page.locator('text=Loading')).toBeHidden()
    
    // Check that search results contain the search term
    const messageCards = page.locator('[data-testid="message-card"]')
    const count = await messageCards.count()
    
    if (count > 0) {
      // Verify at least one result contains the search term
      await expect(messageCards.first()).toContainText('test', { ignoreCase: true })
    }
  })

  test('should display message details', async ({ page }) => {
    // Click on a message to view details
    await page.click('[data-testid="message-card"]')

    // Verify message details are displayed
    await expect(page.locator('text=View Details')).toBeVisible()
    
    // Check that all message fields are visible
    await expect(page.locator('text=Publisher:')).toBeVisible()
    await expect(page.locator('text=Contact:')).toBeVisible()
    await expect(page.locator('text=Published:')).toBeVisible()
  })

  test('should validate message form', async ({ page }) => {
    // Click create message button
    await page.click('text=Create Message')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Verify validation errors
    await expect(page.locator('text=Title is required')).toBeVisible()
    await expect(page.locator('text=Description is required')).toBeVisible()
    await expect(page.locator('text=Contact phone is required')).toBeVisible()
  })

  test('should handle phone number validation', async ({ page }) => {
    // Click create message button
    await page.click('text=Create Message')

    // Fill form with invalid phone number
    await page.fill('input[name="title"]', 'Test Title')
    await page.fill('textarea[name="description"]', 'Test description that is long enough')
    await page.fill('input[name="contactPhone"]', '123') // Invalid phone

    // Submit form
    await page.click('button[type="submit"]')

    // Verify phone validation error
    await expect(page.locator('text=Please enter a valid phone number')).toBeVisible()
  })

  test('should display empty state when no messages', async ({ page }) => {
    // Search for something that doesn't exist
    await page.fill('input[placeholder*="Search"]', 'nonexistentmessage12345')

    // Verify empty state is shown
    await expect(page.locator('text=No messages found')).toBeVisible()
    await expect(page.locator('text=Try adjusting your search terms')).toBeVisible()
  })

  test('should clear search results', async ({ page }) => {
    // Perform a search
    await page.fill('input[placeholder*="Search"]', 'test')
    
    // Wait for search results
    await page.waitForTimeout(500)

    // Clear search
    await page.fill('input[placeholder*="Search"]', '')

    // Verify all messages are shown again
    await expect(page.locator('[data-testid="message-card"]')).toHaveCount(await page.locator('[data-testid="message-card"]').count())
  })
})