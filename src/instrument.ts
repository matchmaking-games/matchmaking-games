import * as Sentry from "@sentry/react";

const dsn =
  import.meta.env.MODE === "production"
    ? "https://fa8a7b09738dbd499c497be04933fed3@o4510984304918528.ingest.us.sentry.io/4510984306688000"
    : "https://e51266dd8e067a78aea1e3d28c0d2841@o4510984304918528.ingest.us.sentry.io/4510984328577024";

Sentry.init({
  dsn,
  environment: import.meta.env.MODE,
  sendDefaultPii: false,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost"],
});
