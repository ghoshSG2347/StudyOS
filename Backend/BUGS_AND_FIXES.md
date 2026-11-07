# StudyOS — Bugs & Fixes Log

## Critical Issues Identified and Resolved

### 1. [P0 Critical] Workspace Showed Hardcoded Demo Data Instead of Saved Syllabus
- **Location:** `Frontend/LandingPage/src/pages/WorkspacePage.tsx`
- **Root Cause:**
  1. `WorkspacePage.tsx` was written entirely as an isolated local demonstration prototype using static arrays (`initialSyllabuses`) and local `useState`.
  2. `createFromImport` ignored the user's pasted syllabus text or uploaded file, and instead invoked `extractedTree()` which returned fixed static demo nodes.
  3. `confirmImport` updated only local component state (`setSyllabuses(...)`) with a timeout and notice message stating "added to your list in this demo session".
  4. None of the workspace actions (creating a workspace, importing, toggling node completion, adding/renaming/deleting nodes, editing notes) called Convex backend mutations.
  5. On page refresh, the component reset back to the hardcoded `initialSyllabuses`.
- **Fix:**
  1. Added Convex live query integration using `useQuery(api.syllabuses.list)` and `useQuery(api.syllabuses.getTree)`.
  2. Added Convex mutation integration:
     - `createSyllabusMutation(api.syllabuses.create)`
     - `renameSyllabusMutation(api.syllabuses.rename)`
     - `deleteSyllabusMutation(api.syllabuses.deleteSyllabus)`
     - `createNodeMutation(api.nodes.create)`
     - `renameNodeMutation(api.nodes.rename)`
     - `toggleCompleteMutation(api.nodes.toggleComplete)`
     - `deleteNodeMutation(api.nodes.deleteNode)`
     - `saveNoteMutation(api.notes.save)`
  3. Implemented `parseSyllabusText()` to dynamically parse real syllabus input (handling markdown headers `#`, indentation levels, unit/chapter keywords, numbered items `1.1`, and bullet points) into structured `StudyNode` hierarchies.
  4. Connected `confirmImport` to call `api.syllabuses.create` with the generated `initialTree`, persisting real hierarchical data to the Convex database.
  5. Connected notes tab to `api.notes.getByNode` and `api.notes.save` with auto-save debouncing.
  6. Preserved clean separation: demo routes (`/workspace/demo`) continue to function independently without requiring backend authentication.

---

### 2. [P1] Non-Reactive Better Auth Session State in Frontend
- **Location:** `Frontend/LandingPage/src/hooks/useAuthSession.ts`
- **Root Cause:**
  - `useAuthSession` previously performed a one-off `auth().getSession()` call inside `useEffect` on initial mount.
  - When users signed in or registered, the hook did not receive signals from Better Auth's reactive store, causing routing components (`ProtectedRoute`, `AuthShell`) to see stale unauthenticated state until a manual hard refresh.
- **Fix:**
  - Integrated `authClient.useSession()` directly from `better-auth/react`.
  - Better Auth's nanostores signal triggers reactive re-renders immediately upon sign-in, sign-up, or sign-out.

---

### 3. [P1] "Failed to Fetch" & Provider Errors During Google Authentication
- **Location:** Backend Convex environment & OAuth credentials configuration
- **Root Cause:**
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` were initially missing or incorrectly authorized in the Google Cloud Console.
  - The Convex site URL (`https://quaint-poodle-413.ap-southeast-2.convex.site`) redirect URI `https://quaint-poodle-413.ap-southeast-2.convex.site/api/auth/callback/google` needed to be registered as an Authorized Redirect URI in Google Cloud.
- **Fix:**
  - Validated Google OAuth configuration on Convex backend.
  - Enhanced error handling in `Frontend/LandingPage/src/lib/auth.ts` to surface clear actionable messages if OAuth credentials or network connectivity fails.

---

### 4. [P1] Sign-Up "Something Went Wrong" Transient Failure
- **Location:** `Frontend/LandingPage/src/lib/auth.ts`
- **Root Cause:**
  - After `signUp.email()`, the adapter was issuing a second immediate `getSession()` call before the cross-domain cookie was completely propagated into `localStorage`, throwing `session_failed`.
- **Fix:**
  - Updated `signUpWithPassword` to directly use `res.data.user` returned by `authClient.signUp.email()`, eliminating the race condition.

---

### 5. [P2] Strict Demo Mode Forced via Environment Variable
- **Location:** `Frontend/LandingPage/.env`
- **Root Cause:**
  - `VITE_DEMO_MODE=true` was set by default, causing workspace route accesses to redirect unauthenticated users to the demo sandbox rather than the real authentication flow.
- **Fix:**
  - Set `VITE_DEMO_MODE=false` in `.env` to enforce production authentication on `/workspace`.

---

### 6. [P2] TypeScript Path Resolution for Generated Backend API
- **Location:** `Frontend/LandingPage/vite.config.ts`, `Frontend/LandingPage/tsconfig.app.json`
- **Root Cause:**
  - The frontend application is located in `Frontend/LandingPage` while the Convex schema and generated API definitions live in `Backend/convex`.
  - Direct deep relative imports (`../../../../Backend/convex/_generated/api`) were brittle.
- **Fix:**
  - Configured `@convex-api` alias in both `vite.config.ts` and `tsconfig.app.json` pointing to `Backend/convex/_generated/api`.

