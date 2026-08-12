# Production Verification Checklist

KirpiNova's code-level release gates are automated by `npm run check`. The remaining checks require the real Coolify deployment and external service credentials; do not place those secrets in Git.

## Required deployment inputs

- Production HTTPS origin for `NEXT_PUBLIC_APP_URL`
- Production PostgreSQL `DATABASE_URL` and TLS settings
- Private S3-compatible endpoint, region, bucket, access-key ID, and secret
- Bucket CORS restricted to the production KirpiNova origin
- A disposable user-owned Gemini API key for receipt smoke testing
- An email-delivery provider and sender identity for verification-email delivery (provider integration remains the final service milestone)

## Go-live verification

1. Set `NEXT_PUBLIC_PREVIEW_MODE=false` and `AUTH_DEV_RETURN_TOKENS=false`.
2. Build the Docker image through Coolify and run all three database migrations.
3. Verify `/api/health` reports the packaged version and `/api/ready` confirms PostgreSQL access.
4. Register and verify a fresh account; confirm the session cookie is Secure, HttpOnly, and SameSite=Lax.
5. Create a vault, save representative Task, Finance, Document, Journal, People, Settings, subscription, and insight data, then confirm encrypted sync from a second browser.
6. Upload, view, replace, and delete an encrypted Document attachment.
7. Scan at least three receipts sequentially, including one unreadable image; verify editable blank failure drafts, custom categories, click-to-enlarge, encrypted receipt viewing, discard cleanup, and transaction deletion cleanup.
8. Download an encrypted `.knv` archive, restore it in a clean browser profile, confirm it synchronizes to cloud, then exercise cloud reset only after the archive is proven restorable.
9. Turn the network off and confirm only the neutral offline page is cached—never account pages or API responses.
10. Verify CSP, HSTS, frame denial, MIME sniffing prevention, and cross-site mutation rejection at the public domain.
11. Restore PostgreSQL and object-storage backups into a non-production environment and verify vault and attachment recovery.
12. Retain the last successful Coolify deployment for rollback.

## Current local evidence

- TypeScript, migration validation, automated tests, and production Next.js build pass.
- Dependency audit reports zero known vulnerabilities.
- The UI anti-pattern detector reports no findings.
- Live Frankfurter/ECB endpoint smoke test passes.
- Docker execution is not available on the current development PC, so container behavior remains part of the Coolify verification above.