# Playwright E2E Tests

Tests for navigation, buttons, forms, and responsiveness.

## Run tests

```bash
# Run all tests (starts dev server automatically)
npm run test

# Run with UI mode
npm run test:ui

# Run in headed browser (see the browser)
npm run test:headed

# Run a single file
npx playwright test tests/navigation.spec.ts

# Run with specific project (browser)
npx playwright test --project=chromium
```

## Test structure

- **navigation.spec.ts** – Home, login, contact, privacy; link navigation; auth redirects
- **buttons.spec.ts** – Hero CTAs, login/contact submit buttons
- **forms.spec.ts** – Login form (email/password, invalid credentials), contact form fields
- **responsiveness.spec.ts** – Mobile, tablet, desktop, wide viewports
- **example.spec.ts** – Smoke test (app loads)

## Config

`playwright.config.ts` uses `baseURL: http://localhost:3000` and starts `npm run dev` when running tests (unless `PLAYWRIGHT_BASE_URL` is set or a server is already running).
