# Sentry Setup

FleetFlow uses Sentry to capture runtime errors, unhandled exceptions, and API failures.

## Configuration
1. Create a Sentry project and copy the DSN.
2. Set the DSN in your environment file (e.g., `.env.local`):
   ```bash
   VITE_SENTRY_DSN=https://<publicKey>@o<org>.ingest.sentry.io/<project>
   ```
3. Restart the dev server; the client initializes Sentry automatically when the DSN is present.

## Error Tracking
- The `src/lib/sentry.ts` helper configures Sentry + BrowserTracing.
- All uncaught errors are routed through the `ErrorBoundary` component, which reports them with stack details.
- The `useFleetSession` hook captures authentication/refresh failures.
- Future integrations (e.g., fetch wrappers) can import `captureException` to record failures.
