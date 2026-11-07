# StudyOS Backend

Standalone Convex + Better Auth backend package for the existing StudyOS React/Vite application. This package contains no replacement UI. It targets the active frontend described in the handoff, but can be merged into an existing repository after reviewing `BACKEND_INTEGRATION.md`.

## Important status

This is implementation source, not a deployed service. Real authentication, OAuth, mail delivery, private data access and persistence become operational only after installing dependencies, generating Convex files, configuring environment values, and deploying. No fake sessions or hardcoded database responses are included. Generated `_generated` files are intentionally omitted.

## Quick start

1. Extract/merge the package root into the existing repository. Review any existing `convex/` directory and combine files carefully rather than overwriting unrelated work.
2. Run `npm install` (or use the project's package manager) from the package root.
3. Run `npx convex dev` and complete Convex account/project setup. Keep the process running; it generates `convex/_generated`.
4. Configure server secrets and URLs as described in `ENVIRONMENT_SETUP.md`. Set `BETTER_AUTH_SECRET` to a cryptographically random value and `SITE_URL` to the frontend origin.
5. Start the Vite app with `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL`, and `VITE_SITE_URL` configured. Wire the provider following `BACKEND_INTEGRATION.md`.
6. Configure Google OAuth redirect URI to the Convex site URL ending in `.convex.site`, at `/api/auth/callback/google`.
7. Run `npm test` for pure tree/progress unit tests. Deploy with `npx convex dev`/`npx convex deploy` only after reviewing environment and security settings.

The currently published component peer requirements observed during packaging are `@convex-dev/better-auth` 0.13.x requiring Better Auth `>=1.7.16 <1.8.0`, and Convex `^1.25.0`; the package uses `^1.7.16`, `^0.13.0`, and `^1.25.0`. The current React guide at `https://labs.convex.dev/better-auth/framework-guides/react` showed an older Better Auth pin that conflicts with the installed component's peer range. The package follows the registry peer range; re-check compatibility when installing later versions.

## API and security

Application functions are under `convex/`. Every private function gets the owner from `ctx.auth.getUserIdentity()` and does not accept a client-supplied `userId`. Every related record is checked against its owning user and syllabus. File URL retrieval first authorizes the attachment and returns a URL as a bearer capability; treat it as private and do not log or publish it.

See `BACKEND_INTEGRATION.md` for the complete frontend call contract and `ENVIRONMENT_SETUP.md` for secret placement.
