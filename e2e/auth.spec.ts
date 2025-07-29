// End-to-End Tests for Authentication Flow
// Note: This requires Playwright to be installed and configured
// Run: npm install -D @playwright/test
// Then: npx playwright install

import { test, expect } from '@playwright/test'

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000')
  })

  test('should register a new user', async ({ page }) => {
    // Navigate to register page
    await page.click('text=Sign up')
    await expect(page).toHaveURL('/register')

    // Fill out registration form
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify successful registration (adjust based on actual behavior)
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should login existing user', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign in')
    await expect(page).toHaveURL('/login')

    // Fill out login form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify successful login
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Logout')).toBeVisible()
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign in')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Verify validation errors are shown
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should handle login errors', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign in')

    // Fill out form with invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify error message is shown
    await expect(page.locator('text=Invalid login credentials')).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    // First login
    await page.click('text=Sign in')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Verify logged in
    await expect(page.locator('text=Logout')).toBeVisible()

    // Logout
    await page.click('text=Logout')

    // Verify logged out
    await expect(page).toHaveURL('/login')
    await expect(page.locator('text=Sign in')).toBeVisible()
  })
})