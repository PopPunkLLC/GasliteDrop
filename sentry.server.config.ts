import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b0164573c739f9744e6bdd019ccf34cf@o4506576341499904.ingest.sentry.io/4506576343990272",
  tracesSampleRate: 1,
  debug: false,
});
