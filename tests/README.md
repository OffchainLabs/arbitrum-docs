# E2E Testing for Arbitrum Documentation

This directory contains end-to-end tests for the Arbitrum documentation site using Playwright.

## Running the Tests

### Prerequisites
- Ensure the development server is running: `npm run dev`
- Or let Playwright start it automatically (configured in `playwright.config.ts`)

### Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests for specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test tests/e2e/docs-content.spec.ts
```

## Test Coverage

The `docs-content.spec.ts` test file covers:

- ✅ **Homepage loads successfully** - Verifies page loads and displays expected "Welcome to Arbitrum" content
- ✅ **SEO and metadata** - Checks page title, meta description, and favicon are properly set
- ✅ **Responsive design** - Tests layout works across desktop, tablet, and mobile viewports 
- ✅ **Navigation buttons** - Verifies "View Documentation" and "Quick Start" buttons are functional
- ✅ **Semantic HTML structure** - Checks for proper main landmarks and heading hierarchy
- ✅ **Tailwind CSS styling** - Validates that Tailwind classes are applied and working correctly
- ✅ **Content structure** - Verifies logical content organization and complete sections
- ✅ **Visual styling** - Tests gradient text effects and other visual elements
- ✅ **Performance and loading** - Measures page load time and checks for console errors

These tests focus on the **actual working functionality** of the site rather than assuming documentation routes work. The current site has a functional homepage with proper styling, navigation, and performance.

## Test Reports

After running tests, reports are generated in:
- `playwright-report/` - HTML report
- `test-results/` - JSON and XML reports

## Configuration

Tests are configured in `playwright.config.ts` with:
- Multiple browser testing (Chromium, Firefox, WebKit)
- Mobile device testing
- Automatic dev server startup
- Screenshot and video capture on failures
- Trace collection for debugging