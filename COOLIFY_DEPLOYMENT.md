# Deploy KirpiNova Web with Contabo and Coolify

This deploys the current KirpiNova web preview as a production-built container. It does not yet enable real accounts, PostgreSQL persistence, or cloud synchronization.

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
9. Deploy.

## 5. Connect the domain

Create an A record such as:

```text
app.yourdomain.com  A  YOUR_CONTABO_IPV4
```

Add the HTTPS domain in Coolify and enable its managed TLS certificate. Do not publish KirpiNova over plain HTTP.

## 6. Verify

- The preview loads over HTTPS.
- `/api/health` returns `"status":"ok"`.
- Light and dark modes work.
- Every migrated workspace opens.
- Refreshing preserves browser-local changes.
- An encrypted `.knv` archive restores in a separate browser profile.
- Coolify reports the container as healthy.

## 7. Current data boundary

Records still live in each visitor's browser. Deployment does not move them to the VPS. Authentication, encrypted cloud envelopes, PostgreSQL, attachments, and synchronization are upcoming milestones.

Do not invite real users or store important personal information until those security milestones are complete.

## 8. Updates

Push a verified release to the production branch and deploy it through Coolify. Retain the previous successful deployment for rollback. Database migration and backup checks will be added with PostgreSQL.
