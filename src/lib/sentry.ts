import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  const tracingIntegration = new BrowserTracing();
  Sentry.init({
    dsn,
    integrations: [tracingIntegration as any],
    tracesSampleRate: 0.2,
  });
}

export const captureException = (error: unknown, context?: Record<string, unknown>) => {
  if (!dsn) {
    console.warn("Sentry DSN not provided; exceptions logged to console.", error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
};
