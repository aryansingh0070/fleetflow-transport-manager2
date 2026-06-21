# Testing FleetFlow

## Unit / Integration
Run the Vitest suite to validate isolated logic and business workflows:

```bash
npm test
```

For a coverage report:

```bash
npm run test:coverage
```

Integration tests live in `src/tests/integration` and exercise the trip, vehicle, and driver managers with realistic mocking of the operations services. We mock Supabase via the service layer so the UI behaves the same regardless of backend availability.

## End-to-end testing
Playwright is configured via `playwright.config.ts`, and tests run by default against `http://localhost:4173` unless `PLAYWRIGHT_BASE_URL` is overridden.

```bash
npm run test:e2e
```

The E2E suite currently covers authentication flows (login/load, logout stub, session persistence placeholder). Tests skip automatically if the base URL/environment isn’t supplied. Use `DEBUG=pw:api` when running or `npx playwright show-trace` after failure to debug.

The Vitest configuration is defined in `vitest.config.ts` and uses `jsdom` with React Testing Library helpers via `src/tests/setupTests.ts`.
