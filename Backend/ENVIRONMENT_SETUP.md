# StudyOS Backend — Environment Setup Guide

This guide walks you through setting up the StudyOS backend for local development and production deployment.

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.x LTS | v24.x confirmed working |
| npm | 9.x+ | Bundled with Node.js |
| Convex CLI | Latest | Installed as a dev dependency |
| Git | Any | For cloning |

> **Tip:** Use `node --version` and `npm --version` to confirm versions before starting.

---

## 1. Install Dependencies

From the **project root** (the folder that contains `Backend/` and `Frontend/`):

```bash
npm --prefix Backend install
```

This installs all backend dependencies (Convex, Better Auth, Vitest, etc.) into `Backend/node_modules/`.

---

## 2. Create a Convex Project

You need a free Convex account and a project to run this backend.

1. Visit [https://dashboard.convex.dev](https://dashboard.convex.dev) and sign in (GitHub or Google).
2. Click **New Project** and give it a name (e.g., `studyos-dev`).
3. Note your **deployment URL** — it looks like `https://happy-animal-123.convex.cloud`.

Alternatively, running `npx convex dev` (Step 4) will offer to create a project for you interactively.

---

## 3. Set Required Server-Side Environment Variables

Convex environment variables are set **server-side** via the Convex CLI or dashboard — they are **never** placed in a `.env` file (that is frontend-only).

### Required Variables

#### `BETTER_AUTH_SECRET`

A cryptographically random secret used to sign authentication tokens. Must be at least 32 characters.

```bash
# Generate a suitable value:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Then set it:
npx convex env set BETTER_AUTH_SECRET "your-generated-value" --prod   # production
npx convex env set BETTER_AUTH_SECRET "your-generated-value"          # dev (default)
```

> **CAUTION:** Never commit this value to source control or share it. Rotating it invalidates all existing sessions.

#### `SITE_URL`

The browser-facing origin of your frontend application. Used by Better Auth for CORS and redirect validation.

```bash
# Local development:
npx convex env set SITE_URL "http://localhost:5173"

# Production (replace with your actual domain):
npx convex env set SITE_URL "https://app.studyos.example.com"
```

#### `CONVEX_SITE_URL`

Your Convex deployment's `.convex.site` URL. Used internally for server-to-server calls.

```bash
# Format: https://<your-deployment-name>.convex.site
npx convex env set CONVEX_SITE_URL "https://happy-animal-123.convex.site"
```

Find this URL in the Convex dashboard under **Settings → URL & Deploy Key**.

---

### Optional Variables

#### Google OAuth (for social login)

```bash
npx convex env set GOOGLE_CLIENT_ID     "your-google-client-id"
npx convex env set GOOGLE_CLIENT_SECRET "your-google-client-secret"
```

**Setup steps:**
1. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth 2.0 Client ID (Web application).
3. Add Authorized Redirect URIs:
   - **Dev:** `https://<your-deployment>.convex.site/api/auth/callback/google`
   - **Prod:** `https://<your-deployment>.convex.site/api/auth/callback/google`
4. Copy the Client ID and Secret into the env vars above.

If these are not set, Google sign-in is unavailable; email/password authentication still works.

#### Password Reset Webhook

StudyOS does not send emails directly. If you want password reset emails, provide a webhook endpoint that handles sending them.

```bash
npx convex env set PASSWORD_RESET_WEBHOOK_URL   "https://your-email-service.example.com/webhook"
npx convex env set PASSWORD_RESET_WEBHOOK_TOKEN "your-secret-bearer-token"
```

**Webhook contract:**

The backend will POST the following JSON body to `PASSWORD_RESET_WEBHOOK_URL`:

```json
{
  "to":       "user@example.com",
  "name":     "User Display Name",
  "resetUrl": "https://app.studyos.example.com/reset-password?token=..."
}
```

With the HTTP header:

```
Authorization: Bearer <PASSWORD_RESET_WEBHOOK_TOKEN>
```

If `PASSWORD_RESET_WEBHOOK_URL` is not set, password reset requests succeed silently (no email is sent). Suitable for development.

#### AI Provider

```bash
npx convex env set AI_PROVIDER "your-ai-provider-key-or-identifier"
```

If not set, the AI node-question feature returns a "feature unavailable" error. All other backend features work normally.

---

## 4. Start Local Development

Run the following **two commands in separate terminals**, both from the project root:

**Terminal 1 — Backend (Convex dev server):**

```bash
cd Backend
npx convex dev
```

On first run, `npx convex dev` will:
- Prompt you to log in to Convex (opens browser).
- Ask you to select or create a project.
- Generate `convex/_generated/` (required for TypeScript to work).
- Watch for file changes and hot-reload the backend.

Leave this running throughout development.

**Terminal 2 — Frontend:**

```bash
cd Frontend/LandingPage
npm install
npm run dev
```

> **Important:** The active frontend application is `Frontend/LandingPage`. The `Frontend/Authentication/` and `Frontend/Workspace/` directories are legacy prototypes and are **not** the active application.

---

## 5. Frontend Environment Variables

Create a file at `Frontend/LandingPage/.env.local` (create it if it doesn't exist):

```env
# Your Convex deployment URL (from the Convex dashboard or npx convex dev output)
VITE_CONVEX_URL=https://happy-animal-123.convex.cloud

# Your Convex .convex.site URL (same deployment, different subdomain)
VITE_CONVEX_SITE_URL=https://happy-animal-123.convex.site
```

These are the only frontend environment variables needed. Do **not** put secrets here — they are exposed to the browser.

---

## 6. Verify Setup

After both servers are running:

1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Navigate to the sign-up page and create an account.
3. Confirm you can sign in and access the workspace.

If anything fails, check the Convex dashboard logs at [https://dashboard.convex.dev](https://dashboard.convex.dev) → your project → **Logs**.

---

## 7. Running Tests

Tests run entirely locally using an in-memory mock — **no Convex deployment or network access required**.

```bash
npm --prefix Backend test
```

Expected output: **47 tests passing** across 6 test suites.

To run a single suite:

```bash
npm --prefix Backend test -- tests/nodes.test.ts
```

---

## 8. TypeScript Type Checking

TypeScript type checking requires the generated types from `convex/_generated/`. These are **only** created after running `npx convex dev` or `npx convex codegen`.

```bash
# After npx convex dev has generated the types:
npm --prefix Backend run typecheck
```

TypeScript checking will fail with ~93 "Cannot find module '_generated/server'" errors if you have not run `npx convex dev` first. This is expected and is not a code bug.

---

## 9. Production Deployment

### Deploy the backend

```bash
cd Backend
npx convex deploy
```

This pushes the backend to your production Convex deployment. Set environment variables for production separately (they are independent of dev variables):

```bash
npx convex env set BETTER_AUTH_SECRET "..." --prod
npx convex env set SITE_URL           "https://app.studyos.example.com" --prod
npx convex env set CONVEX_SITE_URL    "https://happy-animal-123.convex.site" --prod
# ... other optional vars as needed
```

### Build and deploy the frontend

```bash
cd Frontend/LandingPage
npm run build
# Deploy the dist/ folder to your static host (Vercel, Netlify, Cloudflare Pages, etc.)
```

Ensure `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` are set in your static host's build environment using your **production** deployment URLs.

---

## 10. Environment Variable Reference

### Server-Side (set via `npx convex env set`)

| Variable | Required | Description |
|---|---|---|
| `BETTER_AUTH_SECRET` | ✅ Yes | Token signing secret (≥32 chars random) |
| `SITE_URL` | ✅ Yes | Frontend browser origin (e.g., `http://localhost:5173`) |
| `CONVEX_SITE_URL` | ✅ Yes | Convex `.convex.site` URL for internal calls |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `PASSWORD_RESET_WEBHOOK_URL` | Optional | Endpoint to receive password reset webhook |
| `PASSWORD_RESET_WEBHOOK_TOKEN` | Optional | Bearer token for webhook authorization |
| `AI_PROVIDER` | Optional | AI provider configuration for node questions |

### Client-Side (in `Frontend/LandingPage/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_CONVEX_URL` | ✅ Yes | Convex deployment URL (`.convex.cloud`) |
| `VITE_CONVEX_SITE_URL` | ✅ Yes | Convex site URL (`.convex.site`) |

---

## 11. Troubleshooting

### "Cannot find module './_generated/server'"
Run `npx convex dev` first to generate the types directory.

### "No CONVEX_DEPLOYMENT set"
You have not linked a Convex project. Run `npx convex dev` and log in when prompted.

### Google sign-in fails with "redirect_uri_mismatch"
The redirect URI in your Google Cloud Console does not match. Add `https://<your-deployment>.convex.site/api/auth/callback/google` to Authorized Redirect URIs.

### "BETTER_AUTH_SECRET not set"
Set the secret via `npx convex env set BETTER_AUTH_SECRET "..."`. It must be set before the backend starts.

### Tests fail to run
Make sure you have installed dependencies: `npm --prefix Backend install`. No deployment is needed for tests.

### Frontend shows "Demo Mode" or hardcoded data
The frontend is currently in demo mode (all state is local). Backend integration requires implementing the Convex provider and auth adapter in `Frontend/LandingPage/`. See `BACKEND_INTEGRATION.md` for the full integration guide.
