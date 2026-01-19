# Deploying the frontend to Hostinger (static site)

This document describes a simple, reliable way to build and deploy the Vite React frontend to Hostinger (or any static host).

Prerequisites
- Node.js (>=16, prefer 18+)
- npm
- Optional: `dfx`/IC toolchain only if you need `declarations` generated at build time

Recommended local build (avoid `prebuild` lifecycle):

```bash
cd frontend
npm ci
# Use npx to run Vite directly (this bypasses package.json "prebuild" script)
npx vite build
```

What to upload
- After the build completes the static site will be in `frontend/dist/`.
- Upload the *contents* of `frontend/dist/` to your Hostinger site's Document Root (`public_html` or the folder for the domain/subdomain).

.htaccess (SPA routing)
- This repo contains `frontend/public/.htaccess`. Vite copies files from `public/` into `dist/` so `.htaccess` will be present in `dist/`.
- The `.htaccess` ensures client-side routes serve `index.html` instead of producing 404s on page refresh.

Using Hostinger's Git deploy or Auto-deploy
- Set the build command to:

```bash
cd frontend && npx vite build
```

- Set the publish directory to: `frontend/dist`

Notes about `prebuild` and `dfx`
- `frontend/package.json` includes a `prebuild` script that runs `dfx generate backend`. Hostinger CI/auto-deploy likely doesn't have `dfx` installed, so running `npm run build` may fail due to the `prebuild` step.
- Use `npx vite build` (recommended) or ensure `dfx` is available in the build environment and run `dfx generate backend` before `npm run build`.
- If your frontend needs generated canister bindings (`declarations/backend`) at build time, generate them locally with `dfx generate backend` and commit the minimal `declarations` (or use CI that can run `dfx`) — otherwise mock the values or remove the `declarations` import for static-only builds.

NGINX config (if Hostinger uses NGINX)
Add this location block to your server config to support SPA routing:

```
location / {
  try_files $uri $uri/ /index.html;
}
```

Troubleshooting
- 404s on refresh: confirm `.htaccess` was uploaded and `mod_rewrite` is enabled.
- Missing `declarations/backend` errors during build: either run `dfx generate backend` locally and build, or remove/guard the `declarations` import for production builds.

Quick checklist
- [ ] Build locally with `npx vite build` and confirm `dist/` contains `.htaccess`.
- [ ] Upload `dist/` contents to Hostinger Document Root.
- [ ] Verify the site and client-side routing.
