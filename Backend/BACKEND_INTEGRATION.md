# StudyOS Backend — Frontend Integration Reference

**Audience:** Frontend developers integrating `Frontend/LandingPage` with the Convex backend.  
**Active frontend:** `Frontend/LandingPage` (React 18 + Vite + React Router v6)  
**Backend:** Convex + Better Auth via `@convex-dev/better-auth`

---

## 1. Architecture Overview

```
Browser (React SPA)
  │
  ├── Better Auth Client (authClient)
  │     └── POST /api/auth/* → Convex .convex.site HTTP routes
  │
  └── Convex React Client (convex)
        └── WebSocket / HTTP → Convex .convex.cloud
              ├── Application queries / mutations / actions
              └── Better Auth component tables (managed internally)
```

Authentication and application data flow through two separate but coordinated channels:

- **authClient** handles sign-in, sign-up, session tokens, and password reset against the Better Auth server routes hosted on the Convex site URL.
- **ConvexReactClient** handles all application data (syllabuses, nodes, notes, files, preferences) using authenticated Convex function calls. The session token from Better Auth is forwarded automatically by the `ConvexBetterAuthProvider`.

---

## 2. Required Frontend Dependencies

Add to `Frontend/LandingPage/package.json`:

```json
{
  "dependencies": {
    "convex": "^1.25.0",
    "@convex-dev/better-auth": "^0.13.0",
    "better-auth": "^1.7.16"
  }
}
```

> **Important:** Verify compatibility with existing `react: ^18.3.1`. The `@convex-dev/better-auth@0.13.0` component requires Better Auth `>=1.7.16 <1.8.0` and Convex `^1.25.0`. Do not upgrade Better Auth to `1.8.x` without checking component peer requirements.

---

## 3. Provider Setup (`src/main.tsx`)

Replace the existing `root.render(...)` call with:

```tsx
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!, { expectAuth: true });

const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_SITE_URL!,
  plugins: [convexClient(), crossDomainClient()],
});

root.render(
  <ConvexBetterAuthProvider client={convex} authClient={authClient}>
    <App />
  </ConvexBetterAuthProvider>
);
```

The existing `Frontend/LandingPage/src/lib/auth.ts` has an `AuthAdapter` interface. Replace the `notConfiguredAdapter` with calls to `authClient` after provider setup.

---

## 4. Authentication Adapter Implementation

Replace `notConfiguredAdapter` in `src/lib/auth.ts`:

```ts
import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_SITE_URL!,
  plugins: [convexClient(), crossDomainClient()],
});

export const betterAuthAdapter: AuthAdapter = {
  async getSession() {
    const { data } = await authClient.getSession();
    if (!data?.session) return null;
    return { userId: data.user.id, email: data.user.email, name: data.user.name };
  },
  async signInWithPassword({ email, password }) {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new AuthError("invalid_credentials", error.message);
    const session = await this.getSession();
    if (!session) throw new AuthError("session_failed");
    return session;
  },
  async signUpWithPassword({ email, password, name }) {
    const { error } = await authClient.signUp.email({ email, password, name: name ?? email });
    if (error) throw new AuthError("account_exists", error.message);
    const session = await this.getSession();
    if (!session) throw new AuthError("session_failed");
    return session;
  },
  async signInWithGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/auth/onboarding" });
  },
  async resetPassword(email) {
    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },
  async signOut() {
    await authClient.signOut();
  },
};
```

Then change the `auth()` function in `src/lib/auth.ts` to return `betterAuthAdapter`.

### Session Hook Pattern

Replace `useAuthSession` with:

```ts
export function useAuthSession() {
  const { data: session, isPending } = authClient.useSession();
  return {
    state: isPending ? "loading" : session ? "authenticated" : "unauthenticated",
    session: session
      ? { userId: session.user.id, email: session.user.email, name: session.user.name }
      : null,
  };
}
```

---

## 5. Convex API Function Reference

All functions require authentication. Unauthenticated calls throw `ConvexError` with `code: "UNAUTHENTICATED"`. Ownership violations throw `code: "FORBIDDEN"`.

After running `npx convex dev`, import generated API references:

```ts
import { api } from "../convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
```

### 5.1 Profiles

```ts
const profile = useQuery(api.profiles.get, {});
// Returns: ProfileDoc & { avatarUrl: string | null } | null

const generateAvatarUpload = useMutation(api.profiles.generateAvatarUploadUrl);
// Returns: { uploadUrl: string, uploadIntentId: Id<"uploadIntents"> }

const completeOnboarding = useMutation(api.profiles.completeOnboarding);
await completeOnboarding({
  fullName: "Alice Chen",                    // required; 1-200 chars
  avatarStorageId: storageId,                // optional; requires uploadIntentId
  uploadIntentId: intentId,                  // required when avatarStorageId is set
  institute: "Tech University",              // optional
  educationLevel: "College / University",   // optional: "School" | "College / University"
  collegeDetails: { courseOrBranch: "CSE", currentSemester: "3rd" },
  schoolDetails: { currentClass: "Class 12" },
});

const updateProfile = useMutation(api.profiles.update);
await updateProfile({
  fullName: "Alice Updated",
  clearAvatar: true,  // set true to remove existing avatar
  // other fields same as completeOnboarding
});
```

Profile type:
```ts
type ProfileDoc = {
  _id: Id<"profiles">; userId: string; fullName: string; email: string;
  avatarStorageId?: Id<"_storage">; avatarUrl: string | null;
  institute?: string;
  educationLevel?: "School" | "College / University";
  schoolDetails?: { currentClass: string };
  collegeDetails?: { courseOrBranch: string; currentSemester: string };
  completedOnboarding: boolean; createdAt: number; updatedAt: number;
};
```

### 5.2 Syllabuses

```ts
const syllabuses = useQuery(api.syllabuses.list, { includeArchived: false });
// Returns array with totalLeaves, completedLeaves, percentComplete per syllabus

const treeData = useQuery(api.syllabuses.getTree, { syllabusId });
// Returns: { syllabus, tree: TreeNode[], totalLeaves, completedLeaves, percentComplete }

// Create empty
const id = await useMutation(api.syllabuses.create)({ name: "My Syllabus", source: "file.pdf" });

// Create with imported tree
const id = await useMutation(api.syllabuses.create)({
  name: "Imported Physics",
  source: "Physics_2026.pdf",
  initialTree: [
    { name: "Module 1", type: "subject", children: [
      { name: "Chapter 1", type: "chapter", children: [] }
    ]}
  ]
});

await useMutation(api.syllabuses.rename)({ syllabusId, name: "New Name" });
await useMutation(api.syllabuses.setArchived)({ syllabusId, isArchived: true });
await useMutation(api.syllabuses.duplicate)({ syllabusId, name: "Copy Name" });
await useMutation(api.syllabuses.deleteSyllabus)({ syllabusId });
```

### 5.3 Nodes

```ts
// Node types (semantic labels; arbitrary nesting depth is supported)
type NodeType = "subject" | "chapter" | "topic" | "subtopic" | "item";

const children = useQuery(api.nodes.getChildren, { syllabusId, parentId });

await useMutation(api.nodes.create)({
  syllabusId, parentId, name: "Chapter 1", type: "chapter",
  position: "after", anchorId,  // optional positioning
});

await useMutation(api.nodes.rename)({ nodeId, name: "New Name" });
const nextState = await useMutation(api.nodes.toggleComplete)({ nodeId }); // leaf only
await useMutation(api.nodes.move)({ nodeId, newParentId, position: "after", anchorId });
await useMutation(api.nodes.reorder)({ nodeId, newIndex: 2 });
await useMutation(api.nodes.deleteNode)({ nodeId }); // cascades to all descendants
```

TreeNode type (from getTree):
```ts
type TreeNode = {
  _id: string; name: string; type: NodeType; parentId?: string;
  order: number; completed: boolean; children: TreeNode[];
  totalLeaves: number; completedLeaves: number; percentComplete: number;
};
```

### 5.4 Notes

```ts
const note = useQuery(api.notes.getByNode, { nodeId });
// Returns: { _id, nodeId, content, updatedAt } | null

await useMutation(api.notes.save)({ nodeId, content: "My notes..." }); // max 500,000 chars
await useMutation(api.notes.remove)({ nodeId });
```

Saving with empty/whitespace content deletes the note.

### 5.5 Materials (Attachments)

Allowed: PDF, DOCX, TXT, Markdown, PPT/PPTX, JPEG, PNG, WebP. Max: **25 MB**

```ts
// Step 1: Get upload URL and intent
const { uploadUrl, intentId } = await useMutation(api.materials.generateUploadUrl)({});

// Step 2: Upload file bytes
const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
const { storageId } = await res.json();

// Step 3: Save metadata
const materialId = await useMutation(api.materials.saveAttachment)({
  nodeId, storageId, uploadIntentId: intentId,
  fileName: file.name, fileSize: file.size, mimeType: file.type,
});

const list = useQuery(api.materials.listByNode, { nodeId });
const urlData = useQuery(api.materials.getFileUrl, { materialId }); // { url, fileName, mimeType }
await useMutation(api.materials.deleteAttachment)({ materialId });
```

### 5.6 Library

Allowed MIME types: Same as materials plus EPUB, DOC, CSV, JSON. Max: **50 MB**

```ts
const resources = useQuery(api.library.list, {});
const { uploadUrl, uploadIntentId } = await useMutation(api.library.generateUploadUrl)({});

await useMutation(api.library.create)({
  title: "DS Textbook", storageId, uploadIntentId,
  kind: "textbook", tags: ["cs", "algorithms"],
});

await useMutation(api.library.update)({ resourceId, title: "Updated", tags: ["new"] });
const url = useQuery(api.library.getFileUrl, { resourceId });
await useMutation(api.library.deleteResource)({ resourceId });
```

### 5.7 Preferences

```ts
const prefs = useQuery(api.preferences.get, {}); // { theme, compactMode }
await useMutation(api.preferences.update)({ theme: "dark", compactMode: true });
```

### 5.8 AI (Unavailable)

```ts
const { available, reason } = await useAction(api.ai.availability)({});
// always returns { available: false }
```

---

## 6. File Upload Workflow Summary

| Resource | Generate URL | Upload | Save | Limits |
|---|---|---|---|---|
| Avatar | `profiles.generateAvatarUploadUrl` | POST bytes | `profiles.update` | 2 MB, image/* |
| Materials | `materials.generateUploadUrl` | POST bytes | `materials.saveAttachment` | 25 MB, see MIME list |
| Library | `library.generateUploadUrl` | POST bytes | `library.create` | 50 MB, see MIME list |

Upload URL is single-use. Intent expires after 15 minutes. Always upload and save in sequence without user interruption.

---

## 7. Error Handling

```ts
import { ConvexError } from "convex/values";

try {
  await someMutation(args);
} catch (error) {
  if (error instanceof ConvexError) {
    const { code, message } = error.data as { code: string; message: string };
    // code: UNAUTHENTICATED | FORBIDDEN | INVALID_INPUT | INVALID_OPERATION | NOT_FOUND | AI_UNAVAILABLE
  }
}
```

---

## 8. Frontend-to-Backend Feature Mapping

| Frontend feature | Backend function(s) | Integration action |
|---|---|---|
| Sign up | `authClient.signUp.email()` | Replace `notConfiguredAdapter.signUpWithPassword` |
| Sign in | `authClient.signIn.email()` | Replace `notConfiguredAdapter.signInWithPassword` |
| Google OAuth | `authClient.signIn.social({ provider: "google" })` | Replace `signInWithGoogle` |
| Sign out | `authClient.signOut()` | Replace `signOut` |
| Session check | `authClient.useSession()` | Replace `notConfiguredAdapter.getSession()` |
| Onboarding check | `api.profiles.get` | Check `completedOnboarding` after sign-in |
| Profile onboarding | `api.profiles.completeOnboarding` | Replace localStorage `saveProfile()` |
| Profile view | `api.profiles.get` | Replace `useProfile()` localStorage hook |
| Profile edit | `api.profiles.update` | Replace `updateProfile()` |
| Avatar upload | `generateAvatarUploadUrl` + `update` | Replace base64 localStorage approach |
| Avatar clear | `profiles.update({ clearAvatar: true })` | New capability (not in current demo) |
| Syllabus list | `api.syllabuses.list` | Replace `initialSyllabuses` hardcoded array |
| Syllabus create | `api.syllabuses.create` | Replace `createEmpty()` local function |
| Syllabus import | `api.syllabuses.create` with `initialTree` | Replace `window.setTimeout` mock |
| Syllabus rename | `api.syllabuses.rename` | Replace modal local state update |
| Syllabus delete | `api.syllabuses.deleteSyllabus` | Replace array filter in local state |
| Tree view | `api.syllabuses.getTree` | Replace `tree` local state |
| Node add | `api.nodes.create` | Replace `startAddingItem` / `saveInlineEdit` |
| Node rename | `api.nodes.rename` | Replace inline edit local state |
| Node delete | `api.nodes.deleteNode` | Replace `removeTreeNode` |
| Node complete | `api.nodes.toggleComplete` | Replace `toggleComplete` local function |
| Notes | `api.notes.*` | Replace `notes` Record<string,string> local state |
| Materials tab | `api.materials.*` | Currently shows "not connected in demo" |
| Library | `api.library.*` | Currently shows "not connected in demo" |
| Theme/Settings | `api.preferences.*` | Replace `localStorage` theme key |

---

## 9. Environment Variables

Frontend `.env.local`:
```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
```

Demo mode (existing):
```env
VITE_DEMO_MODE=false   # keep false for production
```

---

## 10. Demo Mode Preservation

The `IS_DEMO_MODE` flag and `/workspace/demo` routes remain fully functional and require no backend. The integration only applies to protected routes. Demo and authenticated routes can coexist.
