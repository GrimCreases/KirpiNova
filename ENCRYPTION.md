# KirpiNova encrypted cloud vault

KirpiNova encrypts workspace content in the browser before it is sent to the server.

## Vault envelope version 1

- Cipher: AES-256-GCM
- Key derivation: PBKDF2-HMAC-SHA-256
- Iterations: 600,000
- Salt: 16 random bytes per vault
- IV: 12 random bytes per saved revision
- Authenticated additional data: `kirpinova-cloud-vault-v1`
- Server envelope limit: 16 MiB

The vault passphrase and derived key remain in the open browser tab. They are not included in API requests, cookies, browser storage, logs, or PostgreSQL.

PostgreSQL stores only the serialized encrypted envelope, its format version, byte size, revision number, owner identifier, and timestamps.

## Synchronization safety

Every upload includes the revision last downloaded by that browser. PostgreSQL updates the vault only when that expected revision still matches. If another device saved first, the API returns HTTP 409 and the browser stops uploading rather than overwriting newer ciphertext.

Automatic conflict merging is intentionally deferred until encrypted operation-level synchronization is designed. The current safe behavior requires the user to reload and unlock the newest vault.

## Recovery boundary

KirpiNova cannot recover a forgotten vault passphrase. Encrypted `.knv` archives and a future printable recovery key are the recovery mechanisms. Login-password reset must never silently replace or bypass vault encryption.

## Current limitations

- PostgreSQL integration requires deployment verification in Coolify.
- Attachment metadata lives inside the encrypted cloud vault; attachment ciphertext is stored separately in the configured private S3-compatible bucket. Encrypted `.knv` archives currently cover workspace data, not the separate attachment blobs.
- Cross-device conflict UI currently reports that attention is required but does not offer an interactive merge.
- A formal cryptography review is required before public launch.
