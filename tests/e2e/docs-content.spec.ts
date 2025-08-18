import { test, expect } from '@playwright/test';

test.describe('Arbitrum Documentation Site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('homepage loads successfully and shows expected content', async ({ page }) => {
    // Verify the page loads without errors
    await expect(page).toHaveTitle(/Arbitrum/);
    
    // Verify main content area exists
    await expect(page.locator('main')).toBeVisible();
    
    // Check for the welcome message
    await expect(page.locator('main')).toContainText(/Welcome to Arbitrum/i);
    
    // Verify description text
    await expect(page.locator('main')).toContainText(/complete documentation for building, deploying, and operating on Arbitrum/i);
    
    // Check for navigation buttons
    await expect(page.locator('a[href="/docs"]')).toContainText(/View Documentation/i);
    await expect(page.locator('a[href*="quickstart"]')).toContainText(/Quick Start/i);
  });

  test('has proper metadata and SEO elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Arbitrum Docs/);
    
    // Verify meta description exists (check in head)
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /complete guide to Arbitrum development/i);
    
    // Check for favicon
    const favicon = page.locator('link[rel*="icon"]');
    await expect(favicon).toHaveAttribute('href', /logo\.svg/);
  });

  test('responsive design works on different viewports', async ({ page }) => {
    // Test desktop viewport first (default)
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Welcome to Arbitrum/i);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Welcome to Arbitrum/i);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Welcome to Arbitrum/i);
  });

  test('navigation buttons are accessible and functional', async ({ page }) => {
    // Test View Documentation button
    const viewDocsButton = page.locator('a[href="/docs"]');
    await expect(viewDocsButton).toBeVisible();
    await expect(viewDocsButton).toHaveAttribute('href', '/docs');
    
    // Test Quick Start button
    const quickStartButton = page.locator('a[href*="quickstart"]');
    await expect(quickStartButton).toBeVisible();
    await expect(quickStartButton).toHaveAttribute('href', /quickstart/);
    
    // Verify buttons have proper styling classes
    await expect(viewDocsButton).toHaveClass(/bg-primary/);
    await expect(quickStartButton).toHaveClass(/border-border/);
  });

  test('page has proper semantic HTML structure', async ({ page }) => {
    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Welcome to Arbitrum/i);
    
    // Verify there's a proper body structure
    await expect(page.locator('body')).toHaveClass(/flex flex-col min-h-screen/);
  });

  test('Tailwind CSS classes are working', async ({ page }) => {
    // Check that Tailwind classes are applied correctly
    const mainElement = page.locator('main');
    await expect(mainElement).toHaveClass(/container/);
    await expect(mainElement).toHaveClass(/mx-auto/);
    
    // Check button styling
    const primaryButton = page.locator('a[href="/docs"]');
    await expect(primaryButton).toHaveClass(/bg-primary/);
  });

  test('content structure is logical and complete', async ({ page }) => {
    // Verify the main content container
    const contentContainer = page.locator('main .max-w-4xl');
    await expect(contentContainer).toBeVisible();
    
    // Check for title section
    await expect(page.locator('h1')).toContainText('Welcome to');
    await expect(page.locator('span.bg-gradient-to-r')).toContainText('Arbitrum');
    
    // Check for description paragraph
    await expect(page.locator('p.text-xl')).toContainText(/complete documentation/i);
    
    // Verify call-to-action buttons section
    const buttonSection = page.locator('.flex.flex-col.sm\\:flex-row');
    await expect(buttonSection).toBeVisible();
  });

  test('gradients and visual styling work correctly', async ({ page }) => {
    // Check for gradient text on "Arbitrum"
    const gradientText = page.locator('span.bg-gradient-to-r');
    await expect(gradientText).toBeVisible();
    await expect(gradientText).toHaveClass(/bg-clip-text/);
    await expect(gradientText).toHaveClass(/text-transparent/);
  });

  test('page performance and loading', async ({ page }) => {
    // Navigate and measure basic loading
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    
    // Wait for main content to be visible
    await expect(page.locator('main')).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    // Basic performance check - page should load in reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
    
    // Verify no console errors (basic check)
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload to catch any console errors
    await page.reload();
    await expect(page.locator('main')).toBeVisible();
    
    // Allow for some expected Next.js warnings but no critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning:') && !error.includes('404')
    );
    expect(criticalErrors.length).toBe(0);
  });
});