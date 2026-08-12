# Security

## Data boundary

KirpiNova encrypts the account vault in the browser with AES-GCM before it is sent to the server. PostgreSQL stores the encrypted envelope, revision metadata, account identifiers, and authentication records. Attachment bytes are encrypted in the browser before upload to private S3-compatible storage. The server does not receive vault or attachment plaintext.

Browser storage is an active local cache and is not independently encrypted by KirpiNova. Protect the operating-system account and browser profile, lock unattended devices, and use the encrypted `.knv` export when moving data between devices.

## Network access

- Currency conversion calls only KirpiNova's same-origin `/api/exchange-rates` route. The server route calls the fixed Frankfurter endpoint for ECB-derived EUR, TRY, USD, and GBP data. Users cannot supply its destination URL.
- Encrypted attachments use short-lived signed URLs for the configured private S3-compatible origin. Configure bucket CORS for the KirpiNova production origin only.
- Receipt scanning sends only the explicitly selected receipt image, the user's existing Finance category names, and the user-supplied API key to Google Gemini when the user starts a scan. KirpiNova includes no shared API key. The key remains inside the encrypted account workspace and is not written to a separate server-side key store. Saved receipt images use the same browser-side encryption and private attachment storage as Documents.
- Account verification emails are sent through the deployment owner's SMTP service. They contain the account email address and a single-use verification link; they never contain vault data, the vault passphrase, or workspace content. SMTP credentials remain server-side environment variables and are not included in the browser bundle or repository.

## Web controls

State-changing API routes validate Fetch Metadata and Origin headers before acting. Session cookies are HttpOnly, Secure in production, SameSite=Lax, and contain random opaque tokens whose hashes are stored in PostgreSQL. Responses set a restrictive Content Security Policy, deny framing, disable MIME sniffing and DNS prefetching, limit browser permissions, isolate the opener context, and enable HSTS.

Next.js currently requires inline bootstrap scripts, so `script-src` includes `'unsafe-inline'`; development additionally requires `'unsafe-eval'`. No application code uses inline event handlers or `eval`. Revisit nonce-based CSP when the framework deployment path supports it without breaking hydration.

Cloud reset first removes encrypted attachment objects, then deletes their metadata and the encrypted vault in one database transaction. Browser data is cleared only after the server confirms success. Download and verify an encrypted archive before resetting if continuity is required.

The service worker caches only `/offline.html` and `/kirpinova-icon.svg`. It never caches account pages, encrypted vault API responses, attachment URLs, or other `/api` traffic.

## Deployment checklist

Before real-user deployment:

1. Set `NEXT_PUBLIC_APP_URL` to the exact HTTPS production origin.
2. Set `NEXT_PUBLIC_PREVIEW_MODE=false` and `AUTH_DEV_RETURN_TOKENS=false`.
3. Use TLS-verified PostgreSQL where supported and unique high-entropy database credentials.
4. Keep the object-storage bucket private; restrict CORS to the production origin and test encrypted upload/download/delete.
5. Run `npm audit`, `npm run check`, migrations, `/api/health`, and `/api/ready`.
6. Test database and object-storage restoration from backups.
7. Verify CSP and security headers at the public domain after the reverse proxy is active.

Report suspected vulnerabilities privately to the repository owner. Do not include real personal data, vault ciphertext, API keys, or credentials in a public issue.