# StudyOS — Syllabus Import UI & Convex Integration Guide

## 1. Integration Overview

The Syllabus Understanding & Extraction Engine is integrated directly into the StudyOS frontend (`WorkspacePage.tsx`) and backed by the Convex database schema (`schema.ts`, `syllabuses.ts`).

---

## 2. User Journey & Workflow

```
1. Paste text or upload file in the "Import Syllabus" tab
                           ↓
2. Click "Review parsed outline"
                           ↓
3. Engine runs extraction:
   - Detects all courses (e.g. 9 courses)
   - Segregates metadata (Credits, Hours, COs, References)
   - Builds hierarchical outline (Modules → Topics → Subtopics)
                           ↓
4. Review Screen:
   - If multi-course: Switcher pills let user select course (CS101, PH101, etc.)
   - Metadata card displays credits, contact hours, and collapsible references
   - Proposed Tree: User can add topics, rename, or delete items
                           ↓
5. Click "Save syllabus to workspace"
                           ↓
6. Convex mutation `api.syllabuses.create` saves syllabus + nodes + metadata
                           ↓
7. Workspace displays saved syllabus with live real-time sync
```

---

## 3. Schema & API Contract

### Backend Schema (`Backend/convex/schema.ts`)
```ts
syllabuses: defineTable({
  userId: v.string(),
  name: v.string(),
  code: v.optional(v.string()),       // e.g. "CS101"
  metadata: v.optional(v.any()),      // AcademicMetadata (credits, hours, outcomes)
  source: v.optional(v.string()),     // e.g. "Pasted syllabus document"
  isArchived: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_userId_updatedAt", ["userId", "updatedAt"]),
```

### Mutation Signature (`Backend/convex/syllabuses.ts`)
```ts
export const create = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    metadata: v.optional(v.any()),
    source: v.optional(v.string()),
    initialTree: v.optional(v.any()),
  },
  handler: async (ctx, args) => { ... }
});
```

---

## 4. UI Components & Style Integrations

- **Course Switcher Bar (`.course-switcher-bar`):** Surfaces all detected courses when a multi-course curriculum document is uploaded.
- **Course Pills (`.course-pill`):** Displays course code badge and course title. Clicking a pill switches the review tree and metadata instantly.
- **Metadata Card (`.metadata-preview-card`):** Shows code, credit count, contact hours, and total hours badges.
- **Collapsible References (`.metadata-collapsible`):** Provides accessible, structured views of course outcomes (COs), objectives, textbooks, and reference readings.
- **Workspace Materials Tab:** Enriched with course code, credit details, and recommended textbooks for immediate student reference while studying.

