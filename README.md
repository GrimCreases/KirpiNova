# KirpiNova Web

KirpiNova is a private, unified workspace for personal and family organization. This repository contains the web application built with Next.js, TypeScript, PostgreSQL, and client-side encrypted cloud storage.

See [RUN_LOCALLY.md](./RUN_LOCALLY.md) for Windows setup, [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for production deployment, [SECURITY.md](./SECURITY.md) for the security model, and [PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md) for the credential-gated go-live checklist.

## Current release

- Real account registration, login, session rotation, and request throttling
- Client-side encrypted cloud vault stored as an opaque PostgreSQL envelope
- Encrypted attachment upload and download through private S3-compatible storage
- Tasks with subtasks and reminder times
- Calendar, Finance, Documents, Journal, People, and Settings workspaces
- On-device task and document reminder center while KirpiNova is open
- Finance subscriptions with reliable record-to-transaction behavior
- Sequential Gemini 3.1 Flash Lite receipt scanning with editable review drafts and encrypted receipt attachments
- ECB-derived EUR, TRY, USD, and GBP conversion through an allow-listed cached endpoint
- Configurable Finance report currency with consistent Dashboard totals
- Encrypted local archive download and restore, including safe restore-to-cloud synchronization
- Typed-confirmation cloud reset that removes the encrypted vault, encrypted attachments, and browser cache
- Three opt-in Dashboard insights for task completion, expense trends, and journal wellbeing, rendered without external chart code
- Installable PWA manifest with a privacy-safe offline fallback that never caches account or API responses
- Responsive light and dark interfaces

## Verification

Run `npm.cmd run check` on Windows. The command validates TypeScript, database migrations, automated tests, and the production build.

External PostgreSQL, S3-compatible storage, email delivery, and production TLS still require deployment credentials and live-environment verification. Do not commit secrets to this repository.