# StudyOS — Test Results & Validation Report

**Test Execution Date:** 2026-11-07  
**Test Harness:** Vitest v3.2.7 (Backend), TypeScript v5 (tsc), Vite v7.3.7  
**Result Summary:** 100% Pass Rate across all suites.

---

## 1. Backend Vitest Test Execution

```
 RUN  v3.2.7 C:/Users/Bidisha Ghosh/OneDrive/Desktop/Orbrion/Backend

 ✓ tests/tree.test.ts (4 tests) 7ms
 ✓ tests/auth_and_profiles.test.ts (5 tests) 9ms
 ✓ tests/nodes.test.ts (7 tests) 12ms
 ✓ tests/library_and_preferences.test.ts (13 tests) 13ms
 ✓ tests/syllabuses.test.ts (4 tests) 15ms
 ✓ tests/notes_and_materials.test.ts (14 tests) 16ms

 Test Files  6 passed (6)
      Tests  47 passed (47)
   Start at  14:58:18
   Duration  3.06s
```

### Detailed Suite Breakdown

#### Suite 1: `tree.test.ts` (Tree Assembly & Progress Calculation)
- [x] Assembles flat nodes into hierarchical tree.
- [x] Computes leaf progress correctly (`totalLeaves`, `completedLeaves`, `percentComplete`).
- [x] Handles empty tree structures without divide-by-zero errors.
- [x] Flattens subtrees in correct topological order.

#### Suite 2: `auth_and_profiles.test.ts` (Authentication & Profile Management)
- [x] Resolves authenticated user identity correctly.
- [x] Enforces education type exclusivity (School vs. College details).
- [x] Prevents cross-user profile modifications.
- [x] Rejects expired or mismatched avatar upload intents.
- [x] Cleans up superseded avatar storage objects upon replacement.

#### Suite 3: `nodes.test.ts` (Node Operations & Hierarchy)
- [x] Creates node with correct ordering and parent assignment.
- [x] Prevents marking non-leaf parent nodes as completed.
- [x] Detects and forbids circular tree moves.
- [x] Reorders sibling nodes cleanly.
- [x] Cascade-deletes node subtrees in reverse topological order.
- [x] Cleans up associated notes and materials on node deletion.
- [x] Rejects unauthorized node modification attempts.

#### Suite 4: `library_and_preferences.test.ts` (Library & Settings)
- [x] Saves and retrieves user-scoped library resources.
- [x] Enforces resource title and URL validation.
- [x] Saves and updates theme and display preferences.
- [x] Retains preference defaults for new users.

#### Suite 5: `syllabuses.test.ts` (Syllabus Lifecycle)
- [x] Creates syllabus and recursively persists `initialTree` nodes.
- [x] Calculates aggregated progress across all tree subjects.
- [x] Duplicates syllabus and clones all underlying nodes with fresh IDs.
- [x] Deletes syllabus, cascade-deleting all nodes, notes, and uploaded files.

#### Suite 6: `notes_and_materials.test.ts` (Notes & Materials)
- [x] Saves single note per node, enforcing 500 KB character limit.
- [x] Deletes note when empty content is submitted.
- [x] Verifies user ownership before returning note content.
- [x] Enforces storage ID ownership and single-use claim rules.
- [x] Rejects file uploads exceeding size limits or invalid MIME types.

---

## 2. Static Typing & Compilation Validation

| Target | Command | Result |
|---|---|---|
| **Backend TypeScript** | `npm --prefix Backend run typecheck` | 0 errors |
| **Frontend TypeScript** | `npm --prefix Frontend/LandingPage run typecheck` | 0 errors |
| **Frontend Production Build** | `npm --prefix Frontend/LandingPage run build` | 1941 modules built successfully (`dist/` generated) |

---

## 3. Live Endpoint Checks

| Endpoint | Method | Input / Test Case | Result |
|---|---|---|---|
| `/api/auth/get-session` | `GET` | Origin: `http://localhost:5173` | Status 200, CORS headers verified |
| `/api/auth/sign-in/email` | `OPTIONS` | Preflight check | Status 204, Credentials allowed |
| `/api/auth/sign-in/email` | `POST` | Valid test credentials | Status 200, Session token issued |
| `/api/auth/sign-up/email` | `POST` | New user payload | Status 200, User created & session token issued |
| `/api/auth/sign-in/social` | `POST` | Google provider | Status 200, OAuth authorization redirect returned |
| WebSocket Cloud Sync | `WSS` | `quaint-poodle-413.ap-southeast-2.convex.cloud` | Connected & Streaming |

