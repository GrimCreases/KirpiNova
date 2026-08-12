# Deploy KirpiNova Web with Contabo and Coolify

This deploys KirpiNova as a production-built web application with encrypted cloud accounts, PostgreSQL persistence, private attachment storage, and SMTP account email.

## 1. Prepare the VPS

Use a fresh **Ubuntu 24.04 LTS** installation. In Contabo:

1. Add your SSH public key.
2. Record the public IPv4 address.
3. Install operating-system security updates.
4. Confirm ports 22, 80, and 443 are reachable.
5. Keep Coolify management ports restricted after assigning it a protected domain.

Do not install XAMPP. Coolify and Docker provide the runtime and reverse proxy.

## 2. Install Coolify

Follow <https://coolify.io/docs/get-started/installation/>. Open the installer URL immediately and create the first administrator account.

Before deploying KirpiNova, assign Coolify a domain, enable HTTPS, enable deployment notifications, and configure both VPS snapshots and off-server backups.

## 3. Put the source in Git

Create a private Git repository and push this project. Never commit `.env`, API keys, database passwords, recovery keys, or exported `.knv` archives.

## 4. Create the application

1. Create a project and Production environment in Coolify.
2. Choose **New Resource → Private Repository**.
3. Connect the repository and production branch.
4. Choose **Dockerfile** as the build pack.
5. Keep the Dockerfile path as `/Dockerfile`.
6. Set the internal port to `3000`.
7. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS address.
8. Set the health-check path to `/api/health`.
9. Add every credential from `.env.example` as a protected Coolify environment variable; keep `RUN_MIGRATIONS_ON_START=true`.
10. Deploy. The container applies pending migrations under a PostgreSQL advisory lock before the web server starts.

## 5. Connect the domain

Create an A record such as:

```text
app.yourdomain.com  A  YOUR_CONTABO_IPV4
```

Add the HTTPS domain in Coolify and enable its managed TLS certificate. Do not publish KirpiNova over plain HTTP.

## 6. Verify

- KirpiNova loads over HTTPS.
- `/api/health` returns `"status":"ok"`.
- Light and dark modes work.
- Every migrated workspace opens.
- Refreshing preserves browser-local changes.
- An encrypted `.knv` archive restores in a separate browser profile.
- Coolify reports the container as healthy.

## 7. Current data boundary

Workspace records are encrypted in the browser before the cloud vault is written to PostgreSQL. The server stores opaque ciphertext. Attachments are encrypted in the browser and stored in a private S3-compatible bucket. Browser-local repositories remain the active working cache and encrypted archive source.

Before inviting real users, verify PostgreSQL migrations, S3 CORS and lifecycle rules, HTTPS, backup restoration, session-cookie behavior, and encrypted vault/attachment round trips in the production environment.

## 8. Updates

Push a verified release to the production branch and deploy it through Coolify. Retain the previous successful deployment for rollback. Keep automatic startup migrations enabled, verify `/api/ready` after every deployment, retain the previous successful release for rollback, and test both database and object-storage restoration regularly.
