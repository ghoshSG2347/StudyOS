# StudyOS — Frontend & Backend Integration Architecture

## 1. Overview

The StudyOS client is a modern React 19 / TypeScript application built with Vite, Tailwind CSS, and Lucide icons.
The integration bridge connects the UI with:
1. **Convex Client Runtime:** Provides real-time reactive data subscriptions (`useQuery`) and server mutations (`useMutation`).
2. **Better Auth Cross-Domain Client:** Manages authentication sessions across the local frontend (`http://localhost:5173`) and the Convex cloud site (`https://quaint-poodle-413.ap-southeast-2.convex.site`).

---

## 2. Directory Structure & Path Aliasing

```
StudyOS/
├── Backend/
│   ├── convex/
│   │   ├── _generated/       <-- Auto-generated Convex API bindings
│   │   ├── schema.ts
│   │   ├── auth.ts
│   │   ├── http.ts
│   │   └── ...
│   └── tests/
├── Frontend/LandingPage/
│   ├── src/
│   │   ├── components/       <-- UI & Auth presentation components
│   │   ├── hooks/            <-- useAuthSession, useProfile, useTheme
│   │   ├── lib/              <-- auth.ts (Better Auth client adapter)
│   │   ├── pages/            <-- LandingPage, OnboardingPage, WorkspacePage
│   │   ├── main.tsx          <-- ConvexBetterAuthProvider root
│   │   └── App.tsx           <-- Router & ProtectedRoute boundaries
│   ├── vite.config.ts        <-- @/ and @convex-api path aliases
│   └── tsconfig.app.json     <-- TypeScript paths configuration
└── docs/                     <-- PROTECTED DIRECTORY (Untouched)
```

Path alias mapping in `vite.config.ts`:
```ts
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '@convex-api': path.resolve(__dirname, '../../Backend/convex/_generated/api'),
  },
}
```

---

## 3. Authentication Integration

### Client Setup (`Frontend/LandingPage/src/main.tsx`)
```tsx
import { ConvexReactClient } from 'convex/react';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { authClient } from './lib/auth';

const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://quaint-poodle-413.ap-southeast-2.convex.cloud';
export const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <App />
    </ConvexBetterAuthProvider>
  </StrictMode>
);
```

### Authentication Adapter (`Frontend/LandingPage/src/lib/auth.ts`)
```tsx
export const authClient = createAuthClient({
  baseURL: convexSiteUrl,
  plugins: [convexClient(), crossDomainClient()],
});
```
- Operates in cross-domain mode: session credentials and tokens are maintained securely in `localStorage` by `crossDomainClient` and passed in the `Better-Auth-Cookie` header.
- Compatible with strict browser third-party cookie restrictions.

---

## 4. Workspace Data Integration (`WorkspacePage.tsx`)

### Mode Switching
- **Authenticated Route (`/workspace`, `/workspace/:syllabusId`):**
  - Calls `useQuery(api.syllabuses.list)` to fetch the user's private workspaces.
  - Calls `useQuery(api.syllabuses.getTree, { syllabusId })` to stream the active workspace tree.
  - Calls `useQuery(api.notes.getByNode, { nodeId })` to load persisted study notes.
  - Persists edits using `api.syllabuses.*`, `api.nodes.*`, and `api.notes.save`.
- **Demo Route (`/workspace/demo`, `/workspace/demo/:syllabusId`):**
  - Activated only on explicit demo URLs or when `IS_DEMO_MODE` is enabled.
  - Operates completely in-memory using `initialDemoSyllabuses`, providing a sandboxed preview without touching the database.

### Syllabus Text Parsing Engine
The `parseSyllabusText(rawText)` engine converts arbitrary syllabus text into typed hierarchies:
1. Detects heading levels (`#`, `##`, `###`).
2. Detects Unit/Module/Chapter markers.
3. Detects numbered sections (`1.`, `1.1`, `1.1.2`).
4. Detects indented bullet points.
5. Emits normalized `StudyNode[]` structures ready for live review and backend insertion.

---

## 5. End-to-End User Verification Checklist

| Scenario | Expected Result | Verified Status |
|---|---|---|
| User registers account | Session token issued, redirected to onboarding/workspace | Tested & Verified |
| User signs in with password | Returns 200, session stored, workspace unlocked | Tested & Verified |
| User signs in with Google | OAuth flow redirects to Google consent, then workspace | Tested & Verified |
| User creates empty syllabus | Record added to Convex `syllabuses` table | Tested & Verified |
| User pastes syllabus text | Text parsed into hierarchical outline for review | Tested & Verified |
| User confirms syllabus import | `api.syllabuses.create` saves syllabus and nodes to Convex | Tested & Verified |
| User refreshes workspace | Exact saved syllabus loads from Convex (no demo data) | Tested & Verified |
| User toggles node checkbox | `api.nodes.toggleComplete` updates node completion | Tested & Verified |
| User writes note on node | `api.notes.save` persists note text with debouncing | Tested & Verified |
| User signs out | Session token cleared, redirected to public landing page | Tested & Verified |

