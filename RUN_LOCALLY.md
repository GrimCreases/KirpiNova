# Run KirpiNova Web on your PC

This guide runs KirpiNova Web locally on Windows. The interface can be explored without deployment; real account, encrypted vault, and attachment flows require the PostgreSQL and object-storage variables documented in `.env.example`.

## 1. Install Node.js

1. Open [https://nodejs.org](https://nodejs.org).
2. Download the current **LTS** version for Windows.
3. Run the installer.
4. Keep the default installation options selected.
5. Restart PowerShell or Windows Terminal after installation.

Confirm the installation:

```powershell
node --version
npm --version
```

Both commands should print a version number.

## 2. Open the project folder

1. Extract the delivered KirpiNova Web ZIP if you received one.
2. Open the extracted `KirpiNova-Web` folder in File Explorer.
3. Click the address bar, type `powershell`, and press Enter.

PowerShell should open directly in the project folder.

## 3. Install the project packages

Run:

```powershell
npm install
```

The first installation may take several minutes. It creates a `node_modules` folder containing the local development packages.

## 4. Start KirpiNova

Run:

```powershell
npm run dev
```

Wait until PowerShell displays a local address, normally:

```text
http://localhost:3000
```

Open that address in Chrome, Edge, or Firefox.

## 5. Use the preview

The sign-in screen contains preview values. Select **Continue securely** to open the dashboard.

Without external service variables, local use is limited to browser-backed preview data:

- the preview sign-in does not contact a server;
- the dashboard uses representative demonstration data;
- the theme preference is remembered in this browser;
- cloud accounts and encrypted synchronization are implemented but require PostgreSQL configuration;
- encrypted attachments require private S3-compatible object storage;
- live currency conversion uses the credential-free Frankfurter/ECB endpoint.

## 6. Stop the local server

Return to PowerShell and press:

```text
Ctrl + C
```

If PowerShell asks whether to terminate the batch job, type `Y` and press Enter.

## 7. Start it again later

Open PowerShell in the project folder and run:

```powershell
npm run dev
```

You only need to run `npm install` again when the project dependencies change.

## 8. Test the production build

Before deployment, run:

```powershell
npm run check
```

If the check succeeds, start the optimized production version:

```powershell
npm run start
```

Then open [http://localhost:3000](http://localhost:3000).

## Common problems

### “node” or “npm” is not recognized

Node.js is not installed or the terminal was open during installation. Install the Node.js LTS release, close every PowerShell window, and open a new one.

### Port 3000 is already in use

Next.js normally offers another port automatically. Open the address shown in PowerShell. You can also run:

```powershell
npm run dev -- -p 3001
```

Then open [http://localhost:3001](http://localhost:3001).

### The page does not update

Refresh the browser. If necessary, stop the server with `Ctrl + C`, then run `npm run dev` again.

### FORT does not appear

The repository does not yet contain the licensed FORT web-font files. The interface temporarily uses the documented fallback font. Add the approved WOFF2 files during the branding-assets milestone.
