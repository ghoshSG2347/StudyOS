# StudyOS Backend — Implementation Report

**Session date:** 2026-11-07  
**Scope:** Complete backend audit, security hardening, bug fixes, test suite creation, and documentation

---

## Summary

This report records every change made to the StudyOS backend during the audit and completion session. The backend uses Convex (serverless database + functions) with Better Auth for authentication. The frontend (`Frontend/LandingPage`) is currently operating in full demo/local-state mode; this session fixes the backend so it is correct and secure for the upcoming integration phase.

**Before this session:** 4 pure tree-utility tests, no application-level tests, multiple critical security bugs, broken cascading deletes, dead-code in `nodes.move`, no MIME/size validation on uploads.

**After this session:** 47 tests passing across 6 suites, all critical bugs fixed, security hardened, full documentation written.

---

## Files Modified

### `convex/schema.ts`

**Changes:**
- Added `by_avatarStorageId` index on the `profiles` table to allow efficient lookup of a profile by its avatar storage ID (required for `assertStorageIdUnclaimed()` checks).
- Added `consumed` boolean field and `by_consumed` index to `uploadIntents` table so that consumed intents can be identified and prevent cross-user storage ID reuse.
- Added `storageId` field to `uploadIntents` so the resulting storage ID is recorded at intent-creation time and can be validated when the upload is claimed.
- Added `by_storageId` index on `materials` and `library` tables for efficient ownership lookup during `assertStorageIdUnclaimed()` checks.
- Added `by_syllabusId` index on `nodeNotes` to support efficient cascading deletion of all notes when a syllabus is deleted (previously used a full user-scoped scan).
- Added `by_userId_nodeId` index on `nodeNotes` to enforce one-note-per-node uniqueness efficiently.

**Reason:** The previous schema lacked indexes needed for security checks, efficient cascade deletes, and duplicate prevention.

---

### `convex/lib/auth.ts`

**Changes:**
- Added `assertStorageIdUnclaimed(ctx, storageId)` utility function.

**Reason:** Upload intents were not bound to storage IDs, allowing a malicious user to claim another user's uploaded storage ID. The new utility checks the `profiles`, `materials`, and `library` tables to confirm that a given storage ID has not already been associated with another record before allowing it to be claimed. Called in `profiles.ts`, `materials.ts`, and `library.ts` wherever a storage ID is accepted from the client.

---

### `convex/lib/validators.ts`

**Changes:**
- Added `MAX_LIBRARY_BYTES = 50 * 1024 * 1024` (50 MB) constant.
- Added `ALLOWED_LIBRARY_MIME_TYPES` set containing acceptable MIME types: `application/pdf`, `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `text/plain`, `application/msword`, and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

**Reason:** The library had no file size or MIME type validation, making it possible to upload arbitrary files of any size.

---

### `convex/profiles.ts`

**Changes:**
- Added `clearAvatar: v.optional(v.boolean())` argument to the `update` mutation so the frontend can explicitly remove an avatar without replacing it.
- Changed duplicate profile cleanup from `.unique()` (which throws if >1 record exists) to `.collect()` followed by deletion of all extras, preventing crashes when duplicate profile rows exist.
- Fixed avatar intent cleanup to validate that the intent being consumed belongs to the authenticated user (previously trusted the client-supplied intent ID directly).
- Called `assertStorageIdUnclaimed()` before accepting a new avatar storage ID.

---

### `convex/syllabuses.ts`

**Changes:**
- Added `initialTree: v.optional(...)` parameter to the `createSyllabus` mutation to support the frontend's import flow (importing a pre-structured syllabus tree in a single call rather than creating nodes one by one after creation).
- Fixed cascading deletion in `deleteSyllabus` to use the new `by_syllabusId` index on `nodeNotes` instead of scanning all notes for the user. This prevents the previous O(n) full-user scan.
- Fixed the `duplicate` mutation to use `assembleTree` for correct topological ordering when duplicating deep trees, preventing parent nodes from being inserted after their children.

---

### `convex/nodes.ts`

**Changes (critical bug fix):**
- Fixed dead-code bug in the `move` mutation: the previous code checked `ordered[i].children?.length` to detect non-leaf nodes. The `.children` property does **not exist** on flat database rows — it is only present on the assembled in-memory tree type. This meant the check always evaluated to `false`/`undefined`, silently skipping the circular-move guard. Fixed by calling the actual `childRows()` database query to check for descendant nodes.
- Improved TypeScript type safety throughout the file to reduce reliance on `any` casts.

---

### `convex/notes.ts`

**Changes (bug fix):**
- Fixed duplicate note accumulation in the `save` mutation: the previous implementation used `.first()` to find an existing note and would create a new row on every call if two concurrent requests raced past the check. Fixed to use `.collect()` and clean up all but one note row for the same `(userId, nodeId)` pair, with the `by_userId_nodeId` index enforcing efficient lookup.

---

### `convex/materials.ts`

**Changes:**
- Called `assertStorageIdUnclaimed()` before accepting a storage ID for a node material attachment.
- Added `consumed` check on upload intents to prevent the same intent from being claimed twice.
- Validated that the intent being consumed belongs to the authenticated user.

---

### `convex/library.ts`

**Changes:**
- Added file size validation: rejects uploads exceeding `MAX_LIBRARY_BYTES` (50 MB) with a clear `ConvexError`.
- Added MIME type validation: rejects files whose MIME type is not in `ALLOWED_LIBRARY_MIME_TYPES`.
- Called `assertStorageIdUnclaimed()` before accepting a storage ID for a library item.
- Added `consumed` check on upload intents.
- Validated that the intent being consumed belongs to the authenticated user.

---

### `convex/preferences.ts`

**Changes:**
- Changed duplicate preferences cleanup from `.unique()` to `.collect()` with deletion of extras, matching the same pattern applied to `profiles.ts`.

---

### `convex/ai.ts`

**Changes:**
- Added `verifyNodeForAi` internal query that checks node ownership by looking up the node and comparing its syllabus owner to the authenticated user.
- Called `verifyNodeForAi` inside `askAboutNode` before throwing the "feature unavailable" error, ensuring that unauthenticated or cross-user requests are rejected with an authorization error rather than leaking that the node exists.

---

### `.env.example`

**Changes:**
- Removed `RESEND_API_KEY` (not used anywhere in the codebase — Resend is not a dependency).
- Added `CONVEX_SITE_URL` (required for internal server-to-server calls).
- Added `PASSWORD_RESET_WEBHOOK_URL` (endpoint for password reset email delivery).
- Added `PASSWORD_RESET_WEBHOOK_TOKEN` (bearer token for webhook authorization).
- Improved inline comments explaining the purpose and format of each variable.

---

### `vitest.config.ts`

**Changes:**
- Added path alias mocks for `_generated/server`, `_generated/api`, and `_generated/dataModel` pointing to files under `tests/mocks/`.

**Reason:** Convex's `_generated/` directory is only created after running `npx convex dev`. Without path aliases, every test file importing Convex helpers would fail to compile. The mocks allow the entire test suite to run locally without any deployment or network access.

---

## Files Created

### `tests/mocks/server.ts`

Exports mock implementations of Convex server helpers used by the application code: `query`, `mutation`, `action`, `internalQuery`, `internalMutation`, `internalAction`. Each is a passthrough that records the handler for test invocation.

### `tests/mocks/api.ts`

Exports a mock `api` object (representing registered Convex function paths) and a mock `internal` object, so test files can import `api.nodes.list` and similar paths without a real deployment.

### `tests/mocks/dataModel.ts`

Exports a mock `DataModel` TypeScript type used by test harness helpers for type-safe table access.

### `tests/harness.ts`

A `MockConvexDatabase` class providing a full in-memory simulation of the Convex database and storage layer. Features:
- In-memory table storage with auto-generated document IDs.
- `get`, `insert`, `patch`, `delete` operations.
- Index-based queries using `withIndex` with equality and range conditions.
- Mock `storage.getUrl()` returning deterministic fake URLs.
- Mock `auth.getUserIdentity()` returning a configurable test user.
- `runQuery`, `runMutation`, `runAction` wrappers that inject mock context.
- `switchUser(userId)` helper for multi-user authorization tests.

### `tests/tree.test.ts`

Pre-existing file. **Not modified.** Contains 4 pure utility tests for `assembleTree` and `progressOf` from `convex/lib/tree.ts`.

### `tests/auth_and_profiles.test.ts`

5 tests covering:
1. Unauthenticated call to `profiles.get` is rejected.
2. Onboarding creates a profile row.
3. Avatar upload and clear flow.
4. Cross-user storage ID claim is rejected by `assertStorageIdUnclaimed`.
5. File size limit enforced.

### `tests/syllabuses.test.ts`

4 tests covering:
1. Multi-user data isolation (User B cannot see User A's syllabuses).
2. `initialTree` import creates nodes in the correct hierarchy.
3. Deep 4-level tree duplicate produces correct parent-child structure.
4. Cascading delete removes all nodes and notes.

### `tests/nodes.test.ts`

7 tests covering:
1. Cross-user node access is rejected.
2. Non-leaf completion is rejected (only leaf nodes can be marked complete).
3. Progress calculation returns correct percentage.
4. Circular move is correctly rejected (thanks to the dead-code fix).
5. Moving a node to its current parent is rejected.
6. Node reorder updates order fields correctly.
7. Node cascade delete removes all descendant nodes and notes.

### `tests/notes_and_materials.test.ts`

14 tests covering:
- **Notes:** save creates note, update replaces content, duplicate rows cleaned up, cross-user save is rejected, delete removes note.
- **Materials:** upload accepted with valid intent, cross-user intent is rejected, double-claim rejected, invalid MIME type rejected, oversized file rejected, delete removes material, cross-user delete rejected.

### `tests/library_and_preferences.test.ts`

13 tests covering:
- **Library:** add external URL, file upload accepted, size limit enforced, source type validated, URL scheme validated, user isolation, delete removes item, cross-user intent rejected, tag count limit and deduplication enforced.
- **Preferences:** defaults returned when no record exists, save persists preferences, partial update merges correctly, user isolation.

---

### Documentation Created

| File | Description |
|---|---|
| `Backend/BACKEND_AUDIT.md` | Complete architecture overview, findings table (all issues classified by severity), security improvements, test verification table, and remaining limitations |
| `Backend/BACKEND_INTEGRATION.md` | Frontend developer handoff: Convex provider setup, auth adapter implementation, full API reference for all 8 modules, file upload workflow, error handling guide, feature-to-API mapping |
| `Backend/ENVIRONMENT_SETUP.md` | Step-by-step setup: prerequisites, dependency install, Convex project creation, all environment variables with generation instructions, local dev startup, test commands, production deployment, troubleshooting |
| `Backend/IMPLEMENTATION_REPORT.md` | This file |

---

## Test Results (Final Run)

Command: `npm --prefix Backend test`  
Date: 2026-11-07

```
 RUN  v3.2.7

 ✓ tests/tree.test.ts                    (4 tests)   6ms
 ✓ tests/auth_and_profiles.test.ts       (5 tests)   8ms
 ✓ tests/library_and_preferences.test.ts (13 tests) 16ms
 ✓ tests/nodes.test.ts                   (7 tests)  13ms
 ✓ tests/syllabuses.test.ts              (4 tests)  10ms
 ✓ tests/notes_and_materials.test.ts    (14 tests)  12ms

 Test Files  6 passed (6)
      Tests  47 passed (47)
   Duration  810ms
```

---

## Commands Executed

| Command | Result |
|---|---|
| `npm --prefix Backend install` | ✅ 85 packages installed |
| `npm --prefix Backend test` | ✅ 47/47 tests passed |
| `npm --prefix Backend run typecheck` | ❌ Expected failure — `_generated/` missing (requires `npx convex dev`) |
| `npx --prefix Backend convex codegen` | ❌ Expected failure — no `CONVEX_DEPLOYMENT` set |

---

## Security Issues Addressed

| Issue | Severity | Fix |
|---|---|---|
| Upload intents not bound to storage IDs | Critical | `assertStorageIdUnclaimed()` in profiles, materials, library |
| Cross-user storage ID claim possible | Critical | Same fix |
| `nodes.move` circular check was dead code | High | Replaced property access with actual `childRows()` DB query |
| Library had no size/MIME validation | High | Added `MAX_LIBRARY_BYTES` + `ALLOWED_LIBRARY_MIME_TYPES` guards |
| `notes.save` could accumulate duplicates | Medium | Changed to `.collect()` + cleanup pattern |
| `preferences.ts` could crash on duplicate rows | Medium | Changed to `.collect()` + cleanup pattern |
| Cascading delete used unbounded user-scoped scan | Medium | Used `by_syllabusId` index |
| AI function leaked node existence to unauthorized callers | Medium | Added node ownership check before error |
| `.env.example` missing 3 required variables | Low | Rewrote file with all variables |

---

## Known Limitations (Not Fixed in This Session)

The following are accepted limitations documented for future work:

1. **Bearer URL exposure:** Convex storage URLs (`ctx.storage.getUrl()`) are unauthenticated bearer URLs. Any caller with the URL can access the file. Mitigation requires either Convex-signed short-lived URLs (not yet available) or proxying downloads through a Convex HTTP action that re-validates ownership.

2. **Recursive delete depth:** `nodes.deleteSyllabus` and `nodes.deleteNode` recursively delete descendants. For very large trees, this may hit Convex's mutation time or write limits. A chunked or scheduled delete approach would be needed for production scale.

3. **Abandoned upload intents:** Intents created by clients that never complete their upload are never cleaned up. A scheduled Convex cron job could clean up intents older than a threshold.

4. **AI functionality not implemented:** `ai.askAboutNode` throws a "feature unavailable" error. The node ownership check is in place. Full implementation requires an AI provider key and integration code.

5. **PDF parsing not implemented:** Materials and library items can store PDFs, but no text extraction is implemented for AI context.

6. **No email verification:** Better Auth email verification flow is not configured. Users can sign up with any email address without verifying ownership.

7. **Google OAuth requires external credentials:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be configured in the Convex dashboard; they are not available in the local test environment.

8. **Frontend not yet integrated:** `Frontend/LandingPage` is entirely in demo mode. All backend integration work (Convex provider, auth adapter, API calls) must be implemented in the frontend as described in `BACKEND_INTEGRATION.md`.

9. **TypeScript typecheck cannot pass without deployment:** `_generated/` is git-ignored by Convex design. Run `npx convex dev` to generate it before typechecking.
