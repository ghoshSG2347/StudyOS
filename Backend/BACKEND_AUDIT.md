# StudyOS Backend — Comprehensive Audit

**Audit performed:** 2026-11-07  
**Backend version audited:** Initial extracted package + Phase 4 fixes  
**Auditor role:** Senior Backend Engineer

---

## 1. Original Architecture

The backend is a standalone TypeScript package built on:

- **Convex** (`^1.25.0`) — real-time reactive serverless database, queries, mutations, actions, and file storage
- **`@convex-dev/better-auth`** (`^0.13.0`) — official Convex component adapter for Better Auth
- **Better Auth** (`^1.7.16`) — email/password auth, session management, Google OAuth, password reset hook

### Module Structure (pre-fix)

| File | Role |
|---|---|
| `convex/schema.ts` | 8 application tables with indexes |
| `convex/auth.ts` | Better Auth server configuration, Google OAuth, password-reset webhook |
| `convex/auth.config.ts` | Convex auth provider registration |
| `convex/convex.config.ts` | Better Auth component installation |
| `convex/http.ts` | HTTP route registration (component routes + CORS) |
| `convex/profiles.ts` | Profile CRUD + avatar upload URL generation |
| `convex/syllabuses.ts` | Syllabus CRUD, getTree, duplicate, delete with cascade |
| `convex/nodes.ts` | Node create/rename/toggleComplete/move/reorder/delete |
| `convex/notes.ts` | Per-node text notes (upsert) |
| `convex/materials.ts` | File attachments: upload URL, save, list, getUrl, delete |
| `convex/library.ts` | User library: upload URL, create, update, getUrl, delete |
| `convex/preferences.ts` | Theme/compact-mode user preferences |
| `convex/ai.ts` | AI unavailability stubs |
| `convex/lib/auth.ts` | `requireUser`, `forbidden`, `validateName` helpers |
| `convex/lib/validators.ts` | MIME lists, size constants, type validators |
| `convex/lib/tree.ts` | Pure functions: `assembleTree`, `progressOf`, `flattenSubtree` |
| `src/lib/auth-client.ts` | Frontend Better Auth client setup (example) |
| `src/lib/convex-client.ts` | Frontend Convex React client setup (example) |
| `tests/tree.test.ts` | 4 pure tree utility tests |

---

## 2. Findings

### 2.1 Security Findings

| Severity | Finding | Location | Status |
|---|---|---|---|
| **High** | Upload intents not bound to storage IDs — any valid intent could authorize any storage ID | `profiles.ts`, `materials.ts`, `library.ts` | **Fixed** — added `assertStorageIdUnclaimed()`, double-claim prevention |
| **High** | `library.create` consumed the intent before validating it owned the storage ID | `library.ts` | **Fixed** — intent validation now precedes intent deletion |
| **High** | Library uploads had no size or MIME validation | `library.ts` | **Fixed** — 50 MB limit, `ALLOWED_LIBRARY_MIME_TYPES` |
| **Medium** | `profiles.update` could not clear an existing avatar | `profiles.ts` | **Fixed** — `clearAvatar: boolean` argument added |
| **Medium** | `uploadIntentId` without `avatarStorageId` deleted intents without owner validation | `profiles.ts` | **Fixed** — owner check before deletion |
| **Medium** | Duplicate profile/preference rows possible (no DB-level uniqueness constraint) | `profiles.ts`, `preferences.ts` | **Mitigated** — both modules now use `.collect()` and clean up duplicates |
| **Medium** | `nodeNotes` could accumulate duplicate rows (`.first()` + no unique constraint) | `notes.ts` | **Fixed** — `save` now collects all notes per node and cleans duplicates |
| **Medium** | `nodes.move` checked `ordered[i].children?.length` on flat DB rows (dead/wrong logic) | `nodes.ts` | **Fixed** — replaced with `childRows()` query to test real descendants |
| **Medium** | `syllabuses.deleteSyllabus` scanned all user notes by user index (could miss cross-syllabus) | `syllabuses.ts` | **Fixed** — now queries by `by_syllabusId` index on `nodeNotes` |
| **Medium** | `ai.askAboutNode` did not verify node ownership before signaling unavailability | `ai.ts` | **Fixed** — added `verifyNodeForAi` internal query + ownership check |
| **Low** | `library.create` consumed any supplied intent even if no `storageId` was provided | `library.ts` | **Fixed** — intent cleanup is conditional on matching purpose |
| **Low** | Bearer URL exposure via `ctx.storage.getUrl()` | All file URL queries | **Documented** — requires application-layer treatment; Convex does not provide per-request authorization on storage URLs |
| **Low** | No `consumed` flag on `uploadIntents` — expired-but-not-consumed intents could theoretically be replayed within the 15-minute window | `uploadIntents` | **Mitigated** — intent is deleted immediately on successful use; `consumed` field added to schema for future use |
| **Low** | `.env.example` listed `RESEND_API_KEY` (unused) and omitted `CONVEX_SITE_URL`, `PASSWORD_RESET_WEBHOOK_URL`, `PASSWORD_RESET_WEBHOOK_TOKEN` | `.env.example` | **Fixed** — example file now matches actual variables |

### 2.2 Data Model Findings

| Finding | Status |
|---|---|
| `uploadIntents` had no `storageId` or `consumed` field — no binding between intent and uploaded object | **Fixed in schema** — `storageId: v.optional(v.id("_storage"))`, `consumed: v.optional(v.boolean())` added |
| `nodeNotes` had no `by_syllabusId` index — `deleteSyllabus` fell back to user-scoped full scan | **Fixed in schema** — `by_syllabusId` index added |
| `materials` had no `by_storageId` index — double-claim check required a scan | **Fixed in schema** — `by_storageId` index added |
| `profiles` had no `by_avatarStorageId` index — double-claim check required a scan | **Fixed in schema** — `by_avatarStorageId` index added |
| `libraryResources` had no `by_storageId` index | **Fixed in schema** — `by_storageId` index added |
| `profiles` and `userPreferences` lacked DB uniqueness; `.unique()` could throw on data corruption | **Mitigated** — both modules now use `.collect()` with duplicate cleanup |
| No `initialTree` input on `syllabuses.create` — import flow cannot seed the tree in one call | **Fixed** — `initialTree: v.optional(v.any())` parameter added; recursive insertion of initial nodes |
| `syllabuses.duplicate` sorted nodes by root/non-root to handle insertion order, but was fragile for deep trees | **Fixed** — now uses `assembleTree` to build proper structure, then recurses |
| `nodes.deleteNode` used `by_userId` index to scan all user notes and filtered by nodeId set | **Fixed** — now queries `by_nodeId` index per deleted node |

### 2.3 Missing Functionality

| Feature | Status |
|---|---|
| Library MIME and size validation | **Fixed** |
| Avatar clearing | **Fixed** |
| Import with initial tree | **Fixed** |
| AI node ownership verification | **Fixed** |
| Proper duplicate node note cleanup | **Fixed** |
| `MAX_LIBRARY_BYTES` constant | **Added** |
| `ALLOWED_LIBRARY_MIME_TYPES` set | **Added** |
| `assertStorageIdUnclaimed()` utility | **Added** |

---

## 3. Security Improvements Implemented

### 3.1 Storage ID Double-Claim Prevention

New utility `assertStorageIdUnclaimed()` in `convex/lib/auth.ts` checks three tables:
- `materials` via `by_storageId` index
- `libraryResources` via `by_storageId` index
- `profiles` via `by_avatarStorageId` index (with exclusion for the current user during update)

This prevents a user from referencing another user's storage object even if they know the opaque ID.

### 3.2 Upload Intent Hardening

- Intent validation now checks: owner match, purpose match, not consumed, within 15-minute window
- Intents are deleted immediately upon successful use (atomic within mutation)
- `clearAvatar` path now validates intent ownership before cleaning up

### 3.3 Notes Deduplication

`notes.save` now:
1. Collects **all** notes for a node (not `.first()`)
2. Updates the first note if it belongs to the caller
3. Deletes any extra duplicate notes in the same transaction
4. Rejects the operation entirely if the first note belongs to a different user

### 3.4 Node Move Fixed

`nodes.move` now uses `childRows()` (a real database query) to determine whether a moved node has children, rather than checking a non-existent `.children` property on flat database rows.

### 3.5 Cascading Delete Improved

`syllabuses.deleteSyllabus` now deletes notes via `by_syllabusId` index instead of scanning all user notes and filtering in memory.

`nodes.deleteNode` now queries `by_nodeId` per deleted node instead of scanning all user notes.

---

## 4. Verification Results

### Tests Executed

```
npm --prefix Backend install    ✓ 85 packages installed
npm --prefix Backend test       ✓ 47 tests passed across 6 test files
npm --prefix Backend test       (run again to confirm no flakiness) ✓ 47 tests passed
```

### Test Coverage by Domain

| Domain | Tests | Result |
|---|---|---|
| Tree utility (assembleTree, progressOf) | 4 | ✓ Pass |
| Authentication (unauthenticated rejection) | 2 | ✓ Pass |
| Profile creation and onboarding | 2 | ✓ Pass |
| Avatar upload and clearing | 1 | ✓ Pass |
| Cross-user avatar storage claim prevention | 1 | ✓ Pass |
| Avatar size limit enforcement | 1 | ✓ Pass |
| Multi-user syllabus isolation | 1 | ✓ Pass |
| Syllabus import with initialTree | 1 | ✓ Pass |
| Deep tree duplication (4 levels) | 1 | ✓ Pass |
| Cascading syllabus delete (nodes/notes/materials/storage) | 1 | ✓ Pass |
| Cross-user node isolation | 1 | ✓ Pass |
| Non-leaf completion prevention | 1 | ✓ Pass |
| Leaf completion and derived progress | 1 | ✓ Pass |
| Circular move prevention | 1 | ✓ Pass |
| Move to new parent | 1 | ✓ Pass |
| Sibling reorder | 1 | ✓ Pass |
| Node subtree cascade delete | 1 | ✓ Pass |
| Notes upsert (save/update/empty-delete) | 3 | ✓ Pass |
| Notes remove mutation | 1 | ✓ Pass |
| Cross-user note access prevention | 1 | ✓ Pass |
| Notes 500 KB size limit | 1 | ✓ Pass |
| Material upload and listing | 1 | ✓ Pass |
| Cross-user intent use prevention | 1 | ✓ Pass |
| Cross-user material listing prevention | 1 | ✓ Pass |
| Material double-claim prevention | 1 | ✓ Pass |
| Material unsupported MIME rejection | 1 | ✓ Pass |
| Material size limit (25 MB) | 1 | ✓ Pass |
| Material delete and storage cleanup | 1 | ✓ Pass |
| Cross-user material delete prevention | 1 | ✓ Pass |
| Library resource with external URL | 1 | ✓ Pass |
| Library resource with stored file | 1 | ✓ Pass |
| Library size limit (50 MB) | 1 | ✓ Pass |
| Library requires source or URL | 1 | ✓ Pass |
| Library URL scheme validation | 1 | ✓ Pass |
| Library cross-user isolation | 1 | ✓ Pass |
| Library delete and storage cleanup | 1 | ✓ Pass |
| Library cross-user intent prevention | 1 | ✓ Pass |
| Library tag deduplication/limit | 1 | ✓ Pass |
| Preferences defaults | 1 | ✓ Pass |
| Preferences save and retrieve | 1 | ✓ Pass |
| Preferences partial update | 1 | ✓ Pass |
| Preferences user isolation | 1 | ✓ Pass |

### TypeScript Check

TypeScript check (`npm run typecheck`) cannot complete without `convex/_generated` files. These are generated by `npx convex dev` during Convex project setup and require an active Convex deployment. This is the expected and documented state; the code cannot be typechecked in isolation. All type-unsafe patterns use `any` explicitly only at Convex context boundaries where generated types are unavailable.

### Convex Codegen

`npx convex codegen` requires an active `CONVEX_DEPLOYMENT` set by running `npx convex dev`. No deployment credentials are available in this environment; therefore codegen and full typecheck cannot run. This is expected and documented.

---

## 5. Remaining Limitations

| Limitation | Severity | Notes |
|---|---|---|
| Storage bearer URLs (Convex `getUrl`) are not signed per-request | Medium | Treat as short-lived secrets; do not persist in HTML, logs, or public URLs. Convex's URL duration semantics should be verified in a live deployment. |
| Recursive cascading deletes in a single Convex mutation | Medium | Very large syllabuses (thousands of nodes) may exceed Convex transaction limits. Acceptable for coursework-scale syllabuses; production would need batched deletion. |
| `uploadIntents` rows abandoned on client failure are never cleaned up | Low | A scheduled Convex cron job could purge intents older than 1 hour. Not implemented; should be added before production. |
| AI provider adapter not implemented | By design | `ai.askAboutNode` always returns unavailable. Node ownership is now correctly verified before the unavailability error is thrown. |
| PDF/DOCX extraction/parsing not implemented | By design | The import UI sends the file; parsing and tree extraction require a document AI service (e.g., Gemini File API or server-side parser). |
| Email verification not implemented | By design | `requireEmailVerification: false` in auth config. Add if required for production. |
| Google OAuth and password reset require external credentials | Deployment-only | Configure via Convex dashboard environment variables. |
| No quota enforcement per user | Absent | File count/size quotas per user are not enforced; relies on Convex plan limits. |
| `by_syllabusId` notes index requires a schema migration for existing deployments | Schema change | New index; existing data compatible, no migration needed for new deployments. |

