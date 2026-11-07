# StudyOS — Product, Problem, and Technical Solution Specification

> **Document type:** Product requirements + implementation specification  
> **Product name:** StudyOS  
> **Status:** Consolidated v1 specification  
> **Product context:** Student-facing, web-first application; India-compatible and cost-conscious  
> **Last updated:** 24 October 2026

---

## 0. Executive Definition

**StudyOS is a personal syllabus-to-study workspace.** It lets a student turn a syllabus into an editable, expandable tree; track completion with a checklist; attach study material to any node; write personal notes per node; and optionally use contextual AI tools for explanations, notes, practice questions, and answer feedback.

The product is deliberately simple at its center:

**Open StudyOS → sign in/sign up → open your account-linked workspace → select a node → use only the tools relevant to that node.**

The syllabus tree is the primary interface, not an AI chat screen. A student should be able to use the central features without an AI key and without uploading any material. Uploads and AI analysis are optional.

### One-sentence product promise

> Keep your syllabus, completion checklist, study files, notes, and optional AI help organized around one editable tree that belongs to your StudyOS account.

### Core product rules

1. **Tree first.** The default workspace prioritizes the syllabus tree and completion overview.
2. **Select before tools appear.** Material, Notes, AI, and Practice tools become relevant when a student selects a node. Do not show every tool everywhere.
3. **Student-controlled structure.** Imported syllabus structure is a starting point; the student can edit, move, add, remove, and rename nodes.
4. **Attach at any level.** A material can belong to a subject, chapter, topic, subtopic, or custom node. Students do not have to split a large file into topic-sized files.
5. **No forced upload.** The syllabus tree and checklist work even when no file is attached.
6. **No automatic AI scanning.** Uploading a file stores it. Analysis runs only after the student explicitly asks for it.
7. **AI is optional.** AI failure or absence must not prevent tree editing, completion tracking, file organization, or notes.
8. **Account-owned cloud workspace.** A signed-in student’s workspace is tied to their StudyOS account and should load on another supported device after authentication.
9. **No false claims.** Similarity or AI output must not be represented as a scientifically validated coverage percentage or a guarantee of mastery.
10. **Keep the MVP focused.** StudyOS is not a full adaptive-learning engine, learning-management system, generic chatbot, or automatic study planner.

---

# 1. Problem Statement

Students preparing for school, board, college, and competitive examinations often manage their syllabus, class notes, PDFs, presentations, screenshots, personal notes, and practice material in separate places. They may know what they need to study but lack one clear, editable workspace that represents the syllabus as a hierarchy, makes unfinished areas visible, and keeps the relevant files and notes close to each topic.

General-purpose storage tools can hold files, checklist apps can track tasks, and AI tools can explain topics or generate practice. However, students must still assemble these separate workflows themselves. A student may have a folder of notes without knowing which syllabus node it belongs to, a checklist that is disconnected from the actual syllabus structure, or an AI conversation that is disconnected from the topic and materials being studied.

**The problem StudyOS addresses is fragmented syllabus organization and study workflow.** Build a student-owned web workspace that turns an imported or manually created syllabus into an editable tree, tracks completion consistently, lets students attach material and notes at any level, and exposes optional AI features in the context of a selected node—without making AI essential to the core product.

## 1.1 Problem description

A typical learner may:

1. receive a syllabus as a PDF, document, image, or text;
2. manually copy its headings into folders, a spreadsheet, or a task app;
3. save class notes, slides, textbook extracts, screenshots, and other resources in separate folders;
4. mark topics complete in a different system;
5. write personal notes in a notebook or document that is not linked to a syllabus node;
6. open an AI tool separately when they need an explanation, a simplified description, practice questions, or feedback;
7. repeat this organization work for multiple subjects or exams.

Each individual activity has existing tools, but the student has to maintain the connections between them. StudyOS makes the syllabus hierarchy the shared organizational structure. A selected node becomes the place to find its completion state, attached materials, personal notes, and optional tools.

## 1.2 Target audiences

StudyOS supports both broad categories:

- **School and board students:** organize subjects, chapters, topics, and subtopics for a class or board syllabus.
- **Competitive-exam students:** organize exam-specific subjects and topics, such as JEE, NEET, UPSC, or another examination. These examples are use cases, not a promise that StudyOS contains official preloaded syllabi for them.

The data model must not assume one fixed curriculum or a fixed number of hierarchy levels. Students should be able to create their own labels and structure.

## 1.3 What the problem research does—and does not—establish

The supplied research document, `problem_research(5).md`, originally examined a narrower **Syllabus-to-Evidence Learning Gap Auditor** concept. It concluded that generic AI tutoring and syllabus-based study planning are crowded categories, and that a source-coverage and practice-evidence workflow would be more defensible than “upload a PDF and chat with it.” It also explicitly noted that no student interviews or controlled efficacy study had been conducted, and that lack of a documented competitor feature is not proof that a competitor cannot provide it.

The final StudyOS product described here is an intentional scope change from that original auditor. **StudyOS v1 does not implement the formal evidence-provenance and topic-mastery state system proposed in the research report.** It uses the report as problem context, but its current differentiator is the connected, student-controlled syllabus workspace and optional contextual tools—not a claim that the product can prove coverage or mastery.

Do not claim that StudyOS is the first product of its kind, that it guarantees better grades, or that it accurately knows what a student has mastered. Those claims have not been established.

---

# 2. Product Vision and Scope

## 2.1 Product vision

Make the student’s syllabus the organizing structure for their study life. A syllabus should not remain a static PDF or a list copied into a task manager. It should become a tree the student can navigate, edit, track, and use as a home for related materials and notes.

## 2.2 Product model

```text
StudyOS website
├── Public landing page
├── Sign in / Sign up
│   ├── Email and password
│   └── Continue with Google
└── Signed-in personal workspace
    ├── Syllabus tree
    │   ├── Subjects
    │   ├── Chapters / Units
    │   ├── Topics
    │   └── Subtopics / custom levels
    ├── Completion checklist and derived progress
    └── Selected-node workspace
        ├── Materials
        ├── Notes
        ├── AI Topic Assistant (optional)
        └── Practice (optional)
```

## 2.3 Core capabilities included in v1

1. Public landing page.
2. Email/password sign-up and sign-in through Better Auth.
3. Continue with Google through Better Auth social sign-in.
4. Student-specific workspace stored in Convex.
5. Create a syllabus manually or import a supported syllabus file and review/edit the generated tree.
6. Add, edit, rename, move, reorder, expand, collapse, and delete nodes.
7. Completion checklist with automatically calculated parent progress.
8. Attach a file or pasted text to any node.
9. Store and manage a student’s files and attachment metadata.
10. Per-node student notes.
11. Optional, explicit material analysis that suggests which syllabus areas a material may relate to.
12. Optional AI Topic Assistant with selected-node context.
13. Optional AI-generated notes.
14. Optional topic-specific practice generation.
15. Optional answer evaluation and feedback.
16. Level/exam-aware AI context where the student has provided those preferences.
17. Provider-independent AI layer and a graceful AI-disabled state.
18. Cloud persistence so a student’s workspace is associated with their account.

## 2.4 Explicitly not included in v1

The following features were removed or deferred during product discussions and must not quietly reappear in the implementation:

- formal source-provenance/evidence audit engine;
- formal topic learning-state or mastery-state model;
- syllabus-to-evidence graph beyond the editable folder-like tree;
- source-citation infrastructure for every AI claim;
- automatic analysis of every upload;
- mandatory PDF or material uploads;
- a general-purpose, always-open chatbot as the primary interface;
- study-session management;
- an “I don’t understand” adaptive mode;
- standalone progressive-explanation engine;
- prerequisite graph or prerequisite inference;
- dedicated “Teach Me” mode;
- exam mode;
- intelligent revision or spaced-revision scheduler;
- “study for my exam” planning engine;
- XP, streaks, badges, leaderboards, or gamification;
- predicted marks, performance forecasts, or guaranteed learning outcomes;
- institution/classroom/teacher/parent administration;
- LMS integrations;
- custom foundation-model training;
- mandatory local LLM installation;
- multi-agent architecture;
- a separate Python/FastAPI backend in the initial stack.

Features may be reconsidered later, but v1 should not be built as if they already exist.

---

# 3. Roles and User Perspectives

## 3.1 Product roles in v1

StudyOS has one primary application role: **the student/account owner**. The interface also has a public-visitor state before sign-in. Internal maintainers operate the service, but there is no teacher, parent, classroom, or institutional role in the student product.

| Role / state | What they can do | What they cannot do |
|---|---|---|
| Public visitor | View the landing page, read the product overview, open Sign in or Sign up | Read or modify any student workspace |
| New student / unauthenticated | Create an account by email/password or continue with Google; recover access through the configured auth flow | Access workspace records before authentication |
| Authenticated student | Create and manage their own syllabus tree, completion, attachments, notes, material analyses, AI chats, and practice history; change personal learning context; sign out | Read or mutate another account’s data |
| Service maintainer (operational only) | Configure deployment, provider secrets, logs, security and support processes | Should not need routine access to students’ private study content; no staff dashboard is part of v1 |

### Authorization rule

The frontend must never be the authority for data ownership. Every Convex query, mutation, action, file-access path, and deletion operation that reads or changes student-owned data must authenticate the caller and verify ownership of the requested record and its related records.

## 3.2 First-time visitor perspective

### Screen 1 — Landing page

The visitor opens the StudyOS website and sees a focused explanation of the product. The landing page should quickly communicate:

- their syllabus can become an editable tree;
- they can track completion;
- they can keep materials and notes attached to relevant nodes;
- AI assistance is optional;
- their workspace is saved to their account after sign-in.

Primary actions:

- **Get started / Create account** → Sign up.
- **Sign in** → Sign in page.

The landing page must not require an account to view. It does not need to show a public demo workspace unless one is intentionally added later.

### Screen 2 — Sign up

The student can choose:

1. **Continue with Google**; or
2. sign up using email and password.

The Google button must perform real Google OAuth through Better Auth; it must not be a decorative button or a fake client-side state change. Google OAuth requires correct provider configuration, secrets, and authorized callback URLs for the deployed environment.

For email/password sign-up, validate required fields and password confirmation if the form includes it, then show actionable errors from the auth flow. The email-verification policy must be implemented explicitly. Do not display “check your email” unless an email-delivery provider and verification flow are actually configured.

### Screen 3 — First-time setup

After successful authentication, the student enters a short setup flow. Keep this optional and short. Suggested fields:

- display name (if not already present);
- study category: School / Board / Competitive exam / Other;
- class, academic level, or exam name (optional);
- preferred language (optional, if supported by the chosen AI provider).

These fields personalize the experience and AI prompts; they should not prevent the student from entering the workspace. A student must be able to edit them later. Do not collect unnecessary personal information.

### Screen 4 — Empty workspace

A new account has no syllabus nodes yet. Display a clear next step, not an empty dashboard with many disabled controls:

- **Import a syllabus**; or
- **Create manually**.

Explain that they can skip importing and start with one subject. Explain that file uploads are optional.

## 3.3 Returning student perspective

1. The student opens StudyOS.
2. If they have a valid session, route them to their personal workspace; otherwise show the public landing page.
3. On sign-in—email/password or Google—load the workspace belonging to that authenticated user.
4. Render the syllabus tree and completion percentages from persisted Convex records.
5. The student opens a node to see its relevant controls.
6. Updates are persisted to Convex. Convex’s reactive data model can keep connected clients up to date when subscriptions are used; cross-device availability still requires a working connection and successful authentication.
7. On another device, the same account should load the same account-owned workspace. Do not promise offline-first support in v1.

## 3.4 Student creates a syllabus manually

1. Click **Create manually**.
2. Enter a syllabus/workspace title if needed.
3. Add a top-level Subject node.
4. Add Chapter/Unit, Topic, Subtopic, or custom child nodes.
5. Rename nodes to match the actual syllabus.
6. Reorder nodes into the student’s preferred sequence.
7. Mark leaf topics complete as they finish them.
8. Select a node to add files, notes, or optional AI tools.

Manual creation must not be blocked by an AI provider being disabled.

## 3.5 Student imports a syllabus

1. Click **Import a syllabus**.
2. Select a supported syllabus file or paste syllabus text.
3. StudyOS extracts text and proposes a tree.
4. Display a **review-before-save** screen.
5. The student edits incorrect, duplicated, or missing headings; moves nodes where necessary; and confirms the structure.
6. Save the tree to Convex.

An AI model may help infer ambiguous hierarchy if an AI provider is available, but the result is a draft, not an unquestionable source of truth. If extraction fails or the document contains no readable text, explain the issue and allow manual entry or paste-text fallback. Never fabricate a full syllabus from a filename.

## 3.6 Student attaches study material

1. Select any node in the tree.
2. Open **Materials**.
3. Choose Upload file or Add text.
4. Confirm the file/name and, if useful, add a short description.
5. Save. The attachment appears under that node.
6. The student can open/preview where supported, download, rename its display title, move it to another node, or delete it.
7. If they want topic suggestions or content analysis, they explicitly click **Analyze material**.

A student may attach a complete book excerpt or a large chapter file at a parent node. They do not need to split the file into children. A file attached to a parent is not automatically copied into every descendant; it remains attached at the chosen node. Material analysis may suggest which descendants it appears relevant to, but it must not silently reorganize the tree or duplicate files.

## 3.7 Student writes notes

1. Select a node.
2. Open **Notes**.
3. Write/edit notes in the node’s note editor.
4. Notes are saved to the account workspace.
5. When the same node is reopened on another session/device, the saved notes load.

Generated AI notes, if requested, appear as a **draft**. The student can edit or discard the draft; generation must not overwrite personal notes without an explicit confirmation.

## 3.8 Student uses optional AI tools

1. Select a node, such as `Differentiation`.
2. Open **AI**.
3. Choose a simple action or type a short request, e.g. “Explain derivatives”, “Simplify this”, or “Give me an example”.
4. StudyOS supplies the chosen node label and the student’s configured academic/exam context to the AI provider.
5. If the student chooses to use attached materials, selected material text may also be included after an explicit action. Do not upload all of the student’s files automatically.
6. Show the reply in the current node’s context and, if chat history is persisted, associate it with that node.
7. If AI is unavailable, show a clear unavailable/disabled state and keep all non-AI features usable.

The syllabus is context, not an absolute boundary on general knowledge. The AI may answer using general knowledge where appropriate, but it must not claim that general knowledge came from the student’s own files. v1 does not provide a formal citation/provenance system.

## 3.9 Student practices and submits an answer

1. Select a node.
2. Open **Practice**.
3. Choose question count/type if those controls are implemented; otherwise use safe defaults and disclose them.
4. Generate a set for the selected topic, with the academic/exam context available to the provider.
5. Answer a question.
6. Request evaluation and receive feedback on what was correct, incomplete, or incorrect.
7. Keep the practice set/attempt in the student’s account if history persistence is enabled.

Practice feedback does **not** automatically check or uncheck the syllabus completion checkbox. Checklist progress and AI evaluation are separate concepts. The student remains in control of completion.

## 3.10 Student signs out or returns

- Sign out through Better Auth.
- Protected workspace routes stop displaying private data when signed out.
- Sign-in returns the student to their own workspace, not another user’s or a shared global workspace.
- Session expiry, auth errors, and network errors must produce clear handling rather than an infinite spinner.

---

# 4. Information Architecture and Screens

## 4.1 Required routes/screens

| Screen | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page and entry to authentication |
| `/sign-up` | Public | Email/password sign-up and Continue with Google |
| `/sign-in` | Public | Email/password sign-in and Continue with Google |
| `/forgot-password` | Public, if recovery flow is configured | Account recovery; do not show a nonfunctional form |
| `/workspace` | Authenticated | Main tree and overview; redirects to setup/empty state if no tree exists |
| `/settings` | Authenticated | Name, study category, class/exam context, account/session controls, AI preference if provided |

The selected-node experience may be implemented as a route, a panel, or an internal view. The user must not lose the tree position when opening a node tool.

## 4.2 Landing page requirements

Content hierarchy:

1. Product name and concise promise.
2. One primary CTA: Get started.
3. Secondary CTA: Sign in.
4. A simple product preview illustrating a tree and a selected-node workspace.
5. Brief explanation of checklist, materials, notes, and optional AI.
6. A short privacy note: workspace data is tied to the user’s account; AI use is optional.

Design direction: clear, polished, quiet, and study-focused. Avoid neon/hacker visuals, decorative fake system-status labels, or a landing page overloaded with feature cards. Do not imply StudyOS includes official syllabus libraries, guaranteed exam results, or full AI functionality before those exist.

## 4.3 Main workspace layout

Default state should focus on the tree. A practical layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ StudyOS        Workspace title                 Profile / menu │
├───────────────────┬──────────────────────────────────────────┤
│ Syllabus tree     │ Overview / empty-state guidance            │
│                   │                                            │
│ ▾ Mathematics 45% │ Select a topic to view its workspace       │
│   ▾ Algebra 80%   │                                            │
│     ☑ Quadratics  │                                            │
│     ☑ Complex No. │                                            │
│     ☐ Sequences   │                                            │
│   ▾ Calculus 10%  │                                            │
│     ☑ Limits      │                                            │
│     ☐ Different.  │                                            │
│     ☐ Integration │                                            │
└───────────────────┴──────────────────────────────────────────┘
```

This is illustrative, not a fixed pixel specification. On smaller screens, the tree and selected-node content can become separate navigation views. Ensure there is a clear back-to-tree action.

## 4.4 Selected-node workspace

When a student selects `Differentiation`, display the node title and its status, then show only relevant actions or tabs:

```text
Differentiation                         ☐ Not completed

[Materials] [Notes] [AI] [Practice]

Current view: Materials
- Differentiation class notes.pdf
- My worked examples.png
- Add material
- Analyze material (explicit action)
```

All four tools must not open automatically. The student chooses which one to use.

## 4.5 Tree behavior

- Expand/collapse branches.
- Add a child or sibling.
- Rename a node.
- Move/reorder a node.
- Delete a node with confirmation and clear consequences.
- Indicate whether a node has attached material, notes, or optional practice history without cluttering every row with large action buttons.
- Preserve tree order and expansion state where practical.
- Use accessible buttons and labels; do not make drag-and-drop the only way to reorder nodes.

---

# 5. Functional Requirements

## 5.1 Syllabus tree and node editing

A node is a user-controlled organizational item. The schema must support flexible nesting and must not rely on exactly four levels.

Each node must support:

- stable ID;
- owning workspace/account reference;
- parent ID (null for root node);
- label/title;
- node type or user-defined type;
- sibling order;
- creation/update timestamps;
- optional completion state for leaves;
- optional display metadata.

Required operations:

- create root node;
- create child node;
- rename node;
- edit type if types are used;
- move to another parent;
- reorder siblings;
- delete a node or subtree with confirmation;
- expand/collapse in the frontend;
- import a syllabus into a reviewable tree draft.

### Tree validation

- Prevent a node from being moved beneath itself or one of its descendants.
- Prevent cross-workspace moves.
- Ensure parent IDs refer to valid nodes in the same workspace.
- Handle node deletion consistently for notes, attachments, material-analysis results, and practice records.
- If subtree deletion is selected, explain that descendants are included. Delete associated attachment records and storage objects according to the chosen deletion policy.

## 5.2 Completion checklist and progress calculation

The checklist is a simple to-do system; it does not represent verified mastery.

### Recommended rule

- **Leaf nodes:** the student may toggle completed/not completed.
- **Parent nodes with children:** completion indicator and percentage are derived from descendants; the parent is not independently marked complete while its children are incomplete.
- A parent may display a partial/indeterminate state when some descendants are complete.
- Never make a parent appear 100% complete while visibly incomplete descendants remain.

### Progress formula

For any node with descendant leaves:

`completionPercent = completedDescendantLeaves / totalDescendantLeaves * 100`

Round only for display. Preserve the count as the underlying data if useful. If a node has no descendants, treat it as a leaf. If there are no leaf descendants in a malformed/empty branch, display 0% or no percentage consistently; never divide by zero.

Example:

```text
Mathematics 45%
├── Algebra 80%
│   ├── ☑ Quadratic Equations
│   ├── ☑ Complex Numbers
│   └── ☐ Sequences & Series
└── Calculus 10%
    ├── ☑ Limits
    ├── ☐ Differentiation
    └── ☐ Integration
```

These values are illustrative only. Calculations must be derived from stored leaf states, not hard-coded.

### Completion constraints

- Toggling a leaf updates derived ancestor percentages.
- Moving a node causes both its old parent and new parent progress to recalculate.
- Adding/deleting a leaf updates affected percentages.
- Progress must be consistent after refresh and on a second authenticated session.
- A practice answer must not silently change completion.

## 5.3 Material attachments

A material can be attached to any node. It does not need to correspond to a leaf topic.

### Intended material formats

The product should allow students to attach or add:

- PDF;
- DOCX;
- TXT;
- Markdown (`.md`);
- PowerPoint (`.ppt`, `.pptx`);
- images such as JPG/JPEG and PNG;
- photographs and screenshots;
- pasted or directly entered plain text.

Additional formats may be supported later. A file being uploadable does not automatically mean the application can extract its text or analyze its contents.

### Important format distinction

Convex File Storage supports storing files of different types, but it is only the storage layer. **StudyOS must implement and test its own text extraction and analysis for each format.** PDF/DOCX/PPTX/image analysis cannot be claimed merely because the file upload succeeded.

The UI should distinguish these states where applicable:

- Uploaded and stored;
- Preview/download available;
- Text extraction supported;
- Text extraction failed;
- OCR/analysis not available for this file;
- Analysis requested;
- Analysis completed;
- Analysis failed.

### Attachment metadata

Store at least:

- attachment ID;
- workspace ID;
- owning user ID or ownership derived via workspace;
- node ID;
- Convex storage ID (not a publicly shareable URL as the source of truth);
- original filename;
- display title (if editable);
- MIME type/extension;
- size in bytes;
- upload timestamp;
- optional description;
- extraction capability/status;
- analysis timestamp/status if analyzed.

### Attachment operations

- upload;
- add pasted text;
- open or preview where supported;
- download;
- rename display title;
- move attachment to another node in the same workspace;
- delete attachment and, when it is no longer referenced, its stored file;
- inspect processing status;
- manually request analysis.

### Privacy and uploaded content

Uploaded academic material may be private or copyrighted. Explain that the student should only upload material they have permission to store and process. Do not redistribute source files. Before sending extracted material to an external AI provider, disclose that the content will be processed by that configured provider and make the action explicit.

## 5.4 Material analysis (optional, on-demand)

The student may ask StudyOS to analyze one or more materials attached to a node. The aim is lightweight organization assistance, not the original research report’s formal evidence auditor.

### Possible output

For example, the student selects `Complete Calculus Notes.pdf` attached at `Calculus` and chooses **Analyze material**. StudyOS can suggest:

```text
Possible related topics
- Limits — likely relevant content detected
- Differentiation — likely relevant content detected
- Integration — no likely match detected; check manually
```

This is a best-effort suggestion. It must not imply that a topic is completely covered, that the student learned it, or that the material is sufficient for the full syllabus.

### Required behavior

- Never run analysis automatically on upload.
- Run only after an explicit click/confirmation.
- Use deterministic text matching first where adequate; use optional AI to assist with ambiguous topic/material relationships if configured.
- Display results as suggestions the student can review.
- Do not change the syllabus tree or move attachments without confirmation.
- Do not create a formal evidence score, mastery score, provenance graph, or permanent topic-learning state.
- If no text can be extracted, tell the user why and offer a valid fallback such as adding text manually or using OCR where implemented.
- If AI is disabled, the feature should either offer whatever deterministic analysis is available or display a clear message explaining that the requested analysis needs AI. It must not pretend to have completed AI analysis.

### OCR and photographs

Images and screenshots can be attached as materials. To analyze their text, implement OCR as a real feature. OCR results may contain errors, especially with handwriting, angled images, low resolution, shadows, or mixed layouts. Keep the original image available and indicate that extracted text may need correction. Do not treat OCR output as exact transcription by default.

Scanned PDFs may require an OCR step too; ordinary text extraction may return little or no text. Detect this condition and report it rather than silently returning an empty successful analysis.

## 5.5 Student-owned notes

Every node may have its own editable notes.

Requirements:

- notes are attached to the selected node;
- save and reload with the account workspace;
- use a simple editor in v1 (plain text or basic Markdown); avoid a complex document editor unless needed;
- show saving/saved/error status;
- prevent an older in-flight save from overwriting a newer edit;
- allow blank notes;
- note deletion/clearing must be explicit;
- generated AI notes are drafts and must not overwrite student-authored notes without consent.

If no note exists for a node, show an empty editor or a clear “Add notes” action. Do not require students to create notes to mark a node complete.

## 5.6 AI Topic Assistant (optional)

The AI Topic Assistant is a contextual tool inside a selected node, not the primary homepage.

### Typical student requests

- “Explain derivatives.”
- “Explain this more simply.”
- “Give an example.”
- “What is the difference between these two concepts?”
- “Show a worked example.”
- “Clarify this part of my notes.”

Students should not need to learn prompt engineering. Provide a small set of useful actions plus a normal text input.

### Context sent with a request

Only include context relevant to the user’s request and available for that request:

- current node title/path;
- subject/syllabus context;
- saved academic level/exam preference, if supplied;
- current conversation messages needed for continuity;
- attached material text only when the student has chosen to use it or explicitly requested material-grounded help.

Do not send every file, every note, or the whole syllabus tree on every request. Minimize cost and data exposure.

### Level/exam-aware responses

If the user selected “School/Board” and a class/level, the assistant should use suitable terminology and difficulty. If the user selected a competitive exam such as JEE, NEET, or UPSC, the assistant should be configured for that context where appropriate. Do not claim official alignment to a specific exam syllabus unless the exact syllabus has been supplied or verified.

### Honest scope

The syllabus helps contextualize the response; it does not block all general knowledge. If StudyOS uses general model knowledge, it must not say the answer is taken from the student’s uploaded material unless that material was actually provided and used. v1 does not require formal citations for all claims.

## 5.7 AI-generated notes (optional)

- The student selects a node and requests notes.
- The student may choose a concise style/level if available.
- If selected, relevant attached material can be used as context.
- The output is a draft that the student reviews and edits.
- The student chooses whether to save it into the node’s notes or a separate generated-notes item.
- Existing personal notes must not be silently replaced.
- AI unavailability must not affect manual note editing.

## 5.8 Practice generation (optional)

- Practice is initiated from a selected node.
- The generated questions should be associated with that node and the stored practice set should retain its question text and basic metadata.
- The student can answer in the UI.
- Where possible, provide a small choice of question types or counts; avoid adding an elaborate exam mode.
- Generation requires AI or a genuinely implemented local/template-based alternative. If unavailable, state this clearly.
- Practice should not scan or analyze the student’s files automatically. The student can explicitly choose a material to use as context.

## 5.9 Answer evaluation (optional)

- Evaluate the student’s submitted answer against the generated question and any explicit grading guidance.
- Provide useful feedback: what was correct, what was missing, and how to improve.
- Do not claim that one answer proves long-term mastery.
- Do not automatically change checklist state.
- Store attempts if practice history persistence is part of the enabled v1 flow.
- Clearly handle provider errors and malformed responses.

## 5.10 Authentication and account continuity

Better Auth is responsible for authentication/session flows. Convex is the application data backend. The Better Auth + Convex integration must be configured according to the current official React (Vite SPA) instructions.

Supported entry methods:

- email/password sign-up and sign-in;
- Continue with Google.

Required behavior:

- unauthenticated users cannot read or mutate protected workspace data;
- new user accounts get access to their own workspace, not shared data;
- returning user loads the same workspace;
- Google OAuth works in both local development and the deployed environment with correct callback allowlists;
- sign-out clears the authenticated application state;
- authentication failures are visible and recoverable;
- secrets are only stored in the relevant server/Convex environment, not bundled into frontend source;
- email verification and password reset UI are implemented only when their underlying delivery/configuration exists.

## 5.11 Cloud sync and persistence

Persist account-owned records to Convex, including:

- tree nodes and their order;
- completion state;
- attachment metadata and storage references;
- notes;
- material-analysis results;
- AI chat history, if chat history is retained;
- generated practice sets and attempts;
- editable study preferences.

Cloud persistence means the data is tied to the authenticated account, not that the application is guaranteed to work offline. Handle network loss and save errors explicitly. Use Convex reactive queries for views that benefit from automatic update propagation; do not poll on every keystroke unnecessarily.

---

# 6. UX and Interaction Rules

## 6.1 The tree is the home screen

The landing page introduces the product. After authentication, the workspace opens directly to the student’s syllabus tree or the one-time setup/empty state. Do not route every user to an AI chat window or a statistics dashboard.

## 6.2 Progressive visibility, not feature overload

Default workspace:

- tree;
- clear Add/Import actions when appropriate;
- calculated progress;
- a selected-node prompt if no node is selected.

Once a node is selected:

- Materials;
- Notes;
- AI;
- Practice.

These tools may be tabs or a compact node toolbar. Their contents should open only when selected.

## 6.3 Empty states

Every empty state should say what the user can do next:

- no syllabus → Import or Create manually;
- empty folder/node → Add material or add child node;
- no notes → Write notes;
- no AI provider → AI unavailable; tree, files, and notes still work;
- analysis cannot read file → explain extraction/OCR requirement;
- no practice history → Generate practice if configured.

## 6.4 Error states

Show plain-language errors for:

- file too large or unsupported;
- upload interrupted;
- malformed syllabus or no readable text;
- save failed;
- expired session;
- AI timeout/rate limit/provider error;
- extraction/OCR failure;
- invalid tree operation;
- deleted or unavailable attachment.

Allow safe retries when appropriate. Do not report success until the corresponding mutation or provider request succeeds.

## 6.5 Accessibility and responsive behavior

- Core navigation must work by keyboard, not only mouse/drag.
- Use semantic buttons, form labels, and visible focus states.
- Do not encode completion solely through color; use checkbox/icon/text.
- Ensure tree controls have accessible names and appropriate expansion state.
- At narrow screen widths, keep selected-node tools usable without requiring a large desktop tree to remain open beside them.
- Avoid animation that delays common actions or reduces usability.

---

# 7. Technical Stack — Final Direction

## 7.1 Selected stack

| Layer | Choice | Responsibility | Notes |
|---|---|---|---|
| Frontend | React + TypeScript + Vite | Landing page, auth forms, syllabus tree, node tools, uploads, notes editor | A single-page app is sufficient; official Convex + Better Auth documentation includes a React/Vite SPA integration path. |
| Styling | Tailwind CSS (preferred) | Layout, responsive design, accessible states, consistent components | Use a small reusable component system rather than styling every screen independently. |
| Backend/data platform | Convex | Queries, mutations, actions, real-time data subscriptions, application data, file-storage integration | TypeScript-first backend; no separate FastAPI service initially. |
| Authentication | Better Auth | Email/password, session management, Google social sign-in | Use the official `@convex-dev/better-auth` integration and follow its current setup guide. |
| Database | Convex database | Student workspaces, nodes, notes, material metadata, preferences, analysis and practice records | Every user-owned operation must validate identity and ownership. |
| File storage | Convex File Storage initially | Store uploaded documents/images and retain storage IDs in attachment records | Storage support does not mean that file contents are automatically parsed. Consider a different storage layer later if private expiring file URLs or larger-scale needs require it. |
| AI access | Provider adapter behind server-side Convex actions | Optional topic help, note generation, practice generation, answer evaluation, optional material analysis | API keys must never be exposed in the browser. AI may be disabled. |
| AI providers | Configurable provider, e.g. Gemini or OpenRouter; MockProvider for development/tests | Generate optional AI responses | Confirm current model availability, terms, rate limits, and pricing before deployment; do not hard-code a claim that a provider is permanently free. |
| Document processing | TypeScript-compatible parsers and explicit OCR component/step as needed | Extract syllabus text, process plain text and supported file formats | Choose and benchmark concrete libraries before implementation. Do not claim format support until each parser path is tested. |
| Deployment | Static frontend hosting + Convex deployment | Public website and backend | Provider/environment configuration must be separate for local development and production. |
| Python/FastAPI | Not part of the initial stack | Potential future specialist processing service only if justified | Do not add it merely for “AI” or because Python is common in ML. |

## 7.2 Why React + TypeScript + Vite

- React is suitable for the tree and selected-node interaction model.
- TypeScript keeps frontend and Convex application code within one language family.
- Vite is a straightforward SPA build setup.
- The official Convex + Better Auth documentation provides a React/Vite integration guide. This avoids selecting a stack based on guesswork.

## 7.3 Why Convex

Convex provides the application’s TypeScript backend functions, database, reactive queries, and file-storage integration. This fits account-linked workspace data that should persist and update across sessions. It also reduces the need to operate a separate API server for the initial application.

Convex is a hosted service as commonly used. An open-source codebase or component does not mean that every hosted usage level is permanently free. Verify the current hosting limits and pricing before public deployment.

## 7.4 Why Better Auth

Better Auth handles authentication rather than requiring StudyOS to create its own password/session system. Its maintained Convex integration connects Better Auth to Convex. Email/password and Google OAuth should be configured through Better Auth’s documented APIs, rather than implementing password handling manually.

**Important:** Do not use an outdated generic Convex auth example that conflicts with the Better Auth integration. Follow the current React/Vite path and pin compatible dependency versions.

## 7.5 Google sign-in setup requirement

The visible button label should be **Continue with Google**. Functionality requires:

1. create/configure a Google OAuth client;
2. configure client ID and client secret in the appropriate backend environment;
3. set the correct site/base URLs and trusted origins;
4. register the exact authorized callback URI required by the deployed Convex site URL;
5. register the corresponding local callback for the dev environment if using a separate OAuth setup;
6. test first-time Google sign-up, returning Google sign-in, cancellation, and OAuth errors.

For the Convex React/Vite SPA guide, the callback URI example uses the Convex site URL and `/api/auth/callback/google`. Use the actual callback URL shown by the current integration/deployment, not the example deployment hostname.

## 7.6 Environment and secret handling

Values such as `BETTER_AUTH_SECRET`, Google client secrets, AI provider keys, and server-only configuration belong in Convex environment variables or the proper secret manager—not in source code or a `VITE_*` variable that is bundled to the browser.

Frontend variables may contain public deployment URLs. They must not contain provider secrets.

Maintain separate local development and production configuration. Never commit `.env` files containing secrets. Provide a `.env.example` containing names and safe placeholders only.

---

# 8. High-Level Architecture

```text
Browser (React + TypeScript + Vite)
│
├── Public landing page
├── Better Auth client
│   ├── Email/password
│   └── Google OAuth
├── Authenticated workspace UI
│   ├── Tree editor
│   ├── Checklist / calculated progress
│   ├── Attachment manager
│   ├── Notes editor
│   ├── Material analysis UI
│   ├── Optional AI assistant
│   └── Optional practice UI
│
└── Convex React client / authenticated provider
    │
    ▼
Convex backend
├── Better Auth integration component / HTTP routes
├── Authenticated queries and mutations
├── Syllabus tree operations
├── Completion/progress calculations
├── Attachment metadata and storage access
├── Notes operations
├── Material extraction / analysis actions
├── AI provider adapter actions (optional)
├── Practice generation and attempt persistence
└── Account/workspace ownership checks
    │
    ├── Convex database
    ├── Convex File Storage
    └── Configured external AI provider, only when called
```

## 8.1 Deterministic application logic versus AI

### Deterministic/core operations

- authentication status checks;
- workspace ownership checks;
- tree CRUD, reordering, and move validation;
- completion state and derived percentages;
- attachment metadata and file lifecycle;
- notes save/load;
- file extension/MIME/size validation;
- persistence, timestamps, and audit-relevant operational logs;
- explicit processing state transitions;
- UI rendering and error display.

### Optional AI-assisted operations

- explaining a selected topic;
- simplifying an explanation or generating examples;
- drafting notes;
- generating practice questions;
- evaluating submitted answers;
- resolving ambiguous topic/material relationships during material analysis;
- optional syllabus hierarchy suggestions when deterministic parsing is insufficient.

Do not call an LLM to toggle checkboxes, calculate progress, rename a file, persist notes, or perform any other operation that should be deterministic.

## 8.2 Proposed folder structure

The following is a suggested organization, not a pre-existing repository requirement:

```text
studyos/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── auth/
│   │   ├── tree/
│   │   ├── workspace/
│   │   ├── materials/
│   │   ├── notes/
│   │   ├── ai/
│   │   └── practice/
│   ├── features/
│   ├── lib/
│   │   ├── auth-client.ts
│   │   ├── convex-client.ts
│   │   └── validation.ts
│   ├── routes/ or pages/
│   └── main.tsx
├── convex/
│   ├── _generated/          # generated by Convex tooling; do not hand-maintain
│   ├── schema.ts
│   ├── convex.config.ts
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── http.ts
│   ├── workspaces.ts
│   ├── syllabusNodes.ts
│   ├── attachments.ts
│   ├── notes.ts
│   ├── materialAnalysis.ts
│   ├── ai.ts
│   ├── practice.ts
│   └── lib/
├── tests/
├── .env.example
├── package.json
└── README.md
```

Do not manually create or edit generated Convex files that the CLI owns. Adjust module names as the implementation evolves, while preserving separation of responsibilities.

---

# 9. Data Model

The following is a logical model for implementation. Exact Convex validators and indexes should be written in TypeScript and tested against the selected integration versions. Better Auth’s own tables/schema belong to its integration; do not duplicate its internal user/session implementation unnecessarily.

## 9.1 `workspaces`

For v1, use one personal workspace per account unless implementation testing shows a strong need for workspace switching. It can contain many subjects and syllabus trees.

Suggested fields:

- `ownerId` — authenticated user reference/ID derived from trusted identity;
- `title` — e.g. “My Study Workspace”;
- `createdAt`;
- `updatedAt`;
- optional onboarding/setup flags.

Enforce one workspace per owner in application logic and, where available, through an appropriate index/uniqueness strategy. Never accept an unverified `ownerId` from the browser as proof of ownership.

## 9.2 `syllabusNodes`

Suggested fields:

- `workspaceId`;
- `parentId` — nullable for roots;
- `label`;
- `nodeType` — e.g. subject, chapter, unit, topic, subtopic, custom;
- `sortOrder`;
- `isCompleted` for leaf nodes, or a consistent implementation equivalent;
- `createdAt`;
- `updatedAt`;
- optional source/import metadata used only to support the import-review workflow.

Do not store a calculated parent percentage as the source of truth unless there is a measured performance reason. Prefer computing it from descendant leaf states or carefully maintaining a cached value with tests that cover every tree mutation.

## 9.3 `attachments`

Suggested fields:

- `workspaceId`;
- `nodeId`;
- `storageId` — Convex storage ID;
- `originalFilename`;
- `displayTitle`;
- `mimeType`;
- `extension`;
- `sizeBytes`;
- `description` (optional);
- `uploadedAt`;
- `extractionStatus`;
- `analysisStatus`;
- `lastAnalyzedAt` (optional);
- `extractionError` or a safe error code (optional).

File access must validate that the user owns the workspace, the attachment belongs to the workspace, and the selected node belongs to the same workspace. Do not assume a client-supplied attachment ID is authorized.

## 9.4 `nodeNotes`

Suggested fields:

- `workspaceId`;
- `nodeId`;
- `content`;
- `format` (plain text or Markdown);
- `createdAt`;
- `updatedAt`.

Recommended approach: one current notes document per node for the MVP. If notes are absent, no row is required until the first save. If version history is later introduced, store it explicitly rather than overwriting the current note unpredictably.

## 9.5 `userPreferences`

Suggested fields:

- `ownerId`;
- `displayName` (if not managed directly by Better Auth profile data);
- `studyCategory`;
- `academicLevel` or `class` (optional);
- `examName` (optional);
- `preferredLanguage` (optional);
- created/updated timestamps.

Keep optional fields nullable. The student must be able to leave them unset.

## 9.6 `materialAnalyses`

Suggested fields:

- `workspaceId`;
- `nodeId` or `attachmentIds` that were explicitly analyzed;
- `requestedBy`;
- `status`;
- `createdAt` / `completedAt`;
- a compact analysis result, such as suggested related node IDs and a short explanation;
- `provider`/model metadata if an external provider was used;
- error information safe for user display.

This table stores lightweight analysis history; it must not quietly become a formal evidence-provenance engine. Avoid fabricated numerical “coverage” or “mastery” scores.

## 9.7 `aiThreads` / `aiMessages` (if chat history is retained)

Suggested relationship:

- thread belongs to a workspace and selected node;
- message belongs to a thread;
- role is constrained to the accepted roles used by the AI interface;
- store timestamps and optional provider/model metadata;
- never store provider secrets.

Define retention and deletion behavior. If a student deletes a node, decide whether to delete its AI history or preserve it in an explicitly detached history; the simpler v1 choice is to delete node-scoped history with the node after clear confirmation.

## 9.8 `practiceSets` and `practiceAttempts` (if practice history is retained)

A practice set may store:

- `workspaceId`;
- `nodeId`;
- generated question text;
- question type;
- optional answer guidance/rubric;
- generation timestamp and provider/model metadata.

An attempt may store:

- `practiceSetId` and/or question ID;
- submitted answer;
- evaluation feedback;
- timestamp.

Do not rely on an LLM response as an unvalidated object. Validate required fields and acceptable lengths before writing records.

## 9.9 Better Auth records

Better Auth owns the authentication mechanism and related records through the maintained Convex integration. Use the identity/session methods supported by that integration. Avoid storing a raw password or attempting to reproduce session management inside StudyOS tables.

## 9.10 Data ownership invariants

For every data operation:

1. authenticate the caller;
2. determine the owner from trusted auth identity;
3. load the workspace/parent record;
4. verify ownership;
5. verify related IDs belong to the same workspace;
6. validate operation-specific constraints;
7. write or return data.

Do not trust `ownerId`, `workspaceId`, `nodeId`, or `storageId` values simply because the client sent them.

---

# 10. File Storage, Extraction, and Material Processing

## 10.1 Upload lifecycle

A typical Convex file upload flow uses an authenticated mutation to generate an upload URL, the browser posts file bytes to the URL, and a subsequent mutation stores the returned storage ID with attachment metadata. The current Convex documentation should be followed for the exact API/version.

Expected lifecycle:

1. Validate the selected node and user ownership.
2. Validate file size and permitted type.
3. Generate an upload URL using a server-side Convex mutation after authentication/ownership checks.
4. Upload bytes to Convex File Storage.
5. Save the storage ID and metadata in the attachment table.
6. Display success only after metadata persistence succeeds.
7. If a stage fails, allow cleanup/retry and avoid creating a broken attachment card.

## 10.2 Private file-access consideration

Convex documentation states that a URL returned by `storage.getUrl()` can be accessed by anyone who has that URL; it is a bearer URL, not an authorization check on every subsequent request. Therefore:

- validate ownership before returning any URL;
- do not place file URLs in public pages, logs, analytics, or AI prompts unnecessarily;
- do not assume that possession of an ID itself grants permission;
- understand the risk of a user forwarding a generated URL;
- if expiring links or stricter access revocation are required, evaluate an alternative such as the documented Cloudflare R2 approach or an authenticated byte-serving route where its limits fit.

The storage strategy must be chosen with this behavior understood, not hidden behind the word “private.”

## 10.3 Text extraction strategy

A file extension list is not an extraction implementation. Create a separate extractor path for each supported format and test real examples:

| Type | Storage/attachment | Intended extraction path | Required fallback |
|---|---|---|---|
| Pasted/plain text | Yes | Use supplied text | Validate empty input and length |
| TXT / Markdown | Yes | Read text content | Encoding/error message |
| PDF with embedded text | Yes | PDF text extraction | Empty/unreadable-text detection |
| Scanned PDF | Yes | OCR step if enabled | Say OCR is needed/unavailable; do not report successful blank analysis |
| DOCX | Yes | Extract document paragraphs/text | Report unsupported/malformed file |
| PPT / PPTX | Yes | Extract slide text using a compatible parser | Report unsupported/malformed file; avoid claiming full layout understanding |
| JPG/JPEG / PNG / photos/screenshots | Yes | OCR when requested and implemented | Keep original image; flag OCR uncertainty |

Use libraries that work in the chosen Vite/Convex runtime, verify their licence and maintenance status, and test bundles/runtime limits. The exact library choice is an implementation decision, not established in this document.

## 10.4 Extraction and analysis should be separate

- **Upload** stores the original file.
- **Extraction** turns a supported file into text, where implemented.
- **Analysis** uses the extracted content to suggest associations with syllabus topics.

Keep these separate so the app does not secretly consume AI tokens or start expensive processing when the user only wanted to organize a file.

## 10.5 Processing limits

Set and document:

- maximum upload size;
- supported MIME types/extensions;
- maximum text length sent to an AI provider;
- timeout and retry policy;
- OCR limits;
- status for unsupported files.

Actual numeric limits should be selected after checking the current hosting plan and library/provider constraints. Do not invent arbitrary published limits or promise that arbitrarily large files will work.

---

# 11. AI Architecture and Cost Controls

## 11.1 Provider-independent interface

Keep the user-facing StudyOS features separate from a specific AI API:

```text
AIProvider
├── GeminiProvider       # optional implementation
├── OpenRouterProvider   # optional implementation
├── LocalProvider        # possible future implementation, not required
└── MockProvider         # tests/development/demo fixtures
```

This describes an adapter boundary, not a requirement to implement all providers immediately. Implement one real provider only when configuration and budget permit it. A MockProvider should return deterministic sample responses in tests and should clearly be a mock in the development environment.

## 11.2 AI request categories

All AI actions should be explicit and correspond to one product feature:

- `explain_topic`;
- `simplify_explanation`;
- `answer_question`;
- `generate_notes`;
- `generate_practice`;
- `evaluate_answer`;
- `analyze_material`;
- optionally `suggest_syllabus_structure` during import.

Use typed inputs and validate outputs before returning them to the frontend or persisting them.

## 11.3 Cost-minimization requirements

Because StudyOS must be viable on a very limited budget:

- No API call on tree expand/collapse.
- No API call on checkbox toggle.
- No API call when saving ordinary notes.
- No AI call just because a file was uploaded.
- No recurring background scan of the workspace.
- Only make AI calls after an explicit AI action.
- Pass only selected-node context and necessary content, not the entire account.
- Truncate/chunk long content under configured limits and communicate when only part was used.
- Cache where safe and useful; never return one user’s cached private answer to another user.
- Use a mock adapter for UI development and automated tests.
- Make AI enabled/disabled status visible.
- Apply rate/length limits and handle provider quotas.
- Keep AI provider secrets on the backend.

## 11.4 AI prompt behavior

System/developer prompts for the provider should include:

- role: educational assistant for the selected node;
- user’s provided academic/exam level when available;
- instruction to answer clearly and avoid unjustified certainty;
- instruction not to misattribute general knowledge to uploaded documents;
- instruction to follow requested response type (explain/simplify/notes/practice/evaluate);
- output schema where structured output is required;
- an explicit statement of any source text provided for that request.

Do not include a hidden or automatic mastery judgement. Avoid saying that StudyOS “knows” whether a student has mastered a topic.

## 11.5 AI-disabled behavior

If no valid API key/provider is configured:

- the landing page still loads;
- sign-in and account-linked persistence still work;
- the syllabus tree and completion calculation still work;
- material storage still works subject to configured limits;
- notes still work;
- deterministic parsing/analysis still works where implemented;
- AI-only actions display a clear disabled/unavailable message;
- UI development uses a MockProvider only when clearly running in development/test mode.

AI must not be required just to create an account or a subject.

## 11.6 Provider errors and untrusted output

- Validate provider response schema and length.
- Treat generated file content, extracted text, and model output as untrusted input.
- Never execute model-generated code or file instructions.
- Do not use model output directly as database IDs or ownership fields.
- Distinguish rate limit, invalid API key, timeout, empty response, and malformed output where feasible.
- Show a safe actionable error and preserve the user’s draft answer/notes.
- Do not claim success if generation failed.

---

# 12. Security, Privacy, and Reliability

## 12.1 Authentication and authorization

- Use Better Auth for account authentication.
- Integrate it with Convex using the maintained component and current framework guide.
- Gate all protected UI routes and, more importantly, all backend data functions.
- Verify ownership for each workspace/node/attachment/note/practice record accessed.
- Do not trust IDs passed from the browser without checking relationships and owner.
- Keep auth and provider secrets in the backend environment.
- Do not write custom password hashing or session logic.

## 12.2 Data minimization

- Collect only necessary profile/preferences.
- Make academic level/exam fields optional.
- Do not collect school credentials or institutional login passwords.
- Do not send uploaded files to an AI provider automatically.
- Send only the material content needed for an explicitly requested action.
- Document which provider receives the content for each AI action.

## 12.3 Account isolation tests

The application must prove that:

- Student A cannot read Student B’s nodes by guessing an ID;
- Student A cannot attach/delete Student B’s file;
- a node cannot reference a parent in another workspace;
- a file URL is not exposed in a public/shared page accidentally;
- signing out prevents cached private UI from being treated as authoritative;
- a background AI action cannot persist results into the wrong user’s workspace.

## 12.4 Deletion rules

Deletion must be consistent:

- deleting an attachment removes its metadata and, if unreferenced, its stored file;
- deleting a node shows whether its descendants and related data will also be removed;
- deleting a workspace/account must have an explicit policy for associated attachments, notes, chat, analysis, and practice records;
- failure to delete a storage object must not be hidden; report or safely retry cleanup.

A full account-deletion flow should be added before public production use. For a prototype, at minimum implement reliable deletion of nodes and attachments.

## 12.5 Copyright and academic integrity

- Ask users to upload only material they have permission to store/process.
- Do not make the application a redistribution service for complete copyrighted books.
- Keep AI help educational and transparent; do not claim official certification or official exam-provider affiliation.
- The product should help students study, not represent AI-generated feedback as a formal grade or institutional assessment.

## 12.6 Reliability

- Every asynchronous operation should have loading, success, and error states.
- Persisted state must survive reloads.
- Avoid optimistic UI changes that cannot roll back after failed mutations.
- Protect against duplicate upload submissions.
- Use stable IDs rather than array positions to identify nodes.
- Use proper indexes for workspace/parent relationships once the schema is known.
- Test tree moves, deletes, and progress recalculation before adding AI features.

---

# 13. Non-Functional Requirements

## 13.1 Usability

- Main concept understandable without documentation.
- A new student can create a first subject without an AI key.
- Tree and completion remain usable without uploads.
- Tools are contextual and not all forced onto one screen.
- Import errors have an easy manual fallback.

## 13.2 Performance

- Initial workspace should load the student’s essential tree and progress without waiting for AI.
- Avoid loading file content into the main tree query.
- Paginate or lazy-load lengthy materials/chat/practice histories if needed.
- Avoid repeated full-tree recomputation on every unrelated state change; use a tested derived calculation or optimized query if scale requires it.
- Do not set numeric performance guarantees until measured.

## 13.3 Maintainability

- Use TypeScript types and Convex validators.
- Keep tree operations separate from material extraction and AI generation.
- Centralize provider selection and response validation.
- Keep schemas/indexes documented.
- Add tests for data ownership and node operations.
- Pin compatible package versions for the Better Auth + Convex integration.

## 13.4 Observability

Log operational information needed to debug failures, such as action type, status, duration, provider, and safe error category. Avoid logging passwords, auth secrets, complete student notes, raw full-file contents, or entire AI conversations unless explicitly needed for a secure debugging process and consent/policy allows it.

---

# 14. MVP Boundaries and Implementation Order

Implementation order should make the product usable early and avoid building AI before the workspace fundamentals work.

## Phase 1 — Foundation and authentication

- Create React + TypeScript + Vite project.
- Add Tailwind CSS and core layout/components.
- Create/connect Convex project.
- Configure Better Auth’s maintained Convex integration using the current React/Vite guide.
- Add email/password sign-up and sign-in.
- Add Continue with Google after OAuth secrets/callbacks are configured.
- Add protected workspace route and user-specific workspace bootstrap.
- Test that signed-out users cannot access workspace data.

**Exit condition:** a student can sign up/sign in, enter a private workspace, sign out, and sign back in to the same account.

## Phase 2 — Syllabus tree and checklist

- Add schema/indexes for workspaces and nodes.
- Add create/edit/delete/move/reorder operations.
- Add expand/collapse controls.
- Add leaf checkbox and parent-derived progress.
- Add empty workspace and manual creation.
- Add tree safety checks and tests.

**Exit condition:** the tree works with AI disabled and survives refresh/sign-in.

## Phase 3 — Syllabus import

- Support paste-text import first.
- Add extraction for selected syllabus file formats.
- Convert parsed headings into an editable draft tree.
- Let the student review and correct the draft before saving.
- Report scan-only/unreadable files explicitly.

**Exit condition:** at least one genuinely supported file/text path imports a new syllabus and never relies on hard-coded example topic names.

## Phase 4 — Attachments and notes

- Add Convex storage upload flow.
- Store attachment metadata and link to any node.
- Add download/preview where supported.
- Add delete/move/rename and safe file URL handling.
- Add node-owned notes with save/load states.

**Exit condition:** a student can attach a file to a parent or leaf, write notes, and reload the same workspace.

## Phase 5 — Explicit material analysis

- Implement text extraction for the formats claimed as analyzable.
- Add OCR only when the real library/path is integrated and tested.
- Add an explicit Analyze action and processing states.
- Add deterministic topic matching; optional AI suggestion only behind provider adapter.
- Show suggestions as uncertain, reviewable output.

**Exit condition:** a student can manually request analysis and the application does not scan files on upload.

## Phase 6 — Optional AI tools

- Add a provider interface and MockProvider.
- Configure one real external provider only when a valid key and terms are available.
- Add node-contextual Ask/Explain/Simplify.
- Add AI-generated note draft flow.
- Add practice generation and answer feedback.
- Add prompt/length limits and provider error handling.
- Keep checkbox state independent from practice feedback.

**Exit condition:** core StudyOS still works when the real AI provider is disabled or failing.

## Phase 7 — Hardening and deployment

- Run account isolation tests.
- Check file access and delete behavior.
- Test Google OAuth on the deployed origin.
- Test upload/extraction edge cases.
- Make all loading/error/empty states understandable.
- Verify deployment configuration and secret handling.
- Review the current Convex plan/quotas and AI provider pricing before opening public access.

---

# 15. Acceptance Criteria and Test Plan

These are testable criteria, not claims that the implementation has already passed.

## 15.1 Landing and authentication

- **AUTH-01:** A public visitor can open the landing page without signing in.
- **AUTH-02:** Sign-up supports email/password using Better Auth.
- **AUTH-03:** Continue with Google initiates real OAuth when credentials are configured.
- **AUTH-04:** Incorrect credentials or provider errors display an error; the UI does not pretend sign-in succeeded.
- **AUTH-05:** A signed-out user cannot access protected workspace data by directly opening a URL.
- **AUTH-06:** A returning user sees their own account-linked workspace.
- **AUTH-07:** User A cannot read User B’s workspace or records.

## 15.2 Tree operations

- **TREE-01:** A student can create subject, chapter/unit, topic, and subtopic nodes.
- **TREE-02:** A student can rename nodes and reorder siblings.
- **TREE-03:** A student can move nodes between parents in the same workspace.
- **TREE-04:** A node cannot be moved beneath itself or a descendant.
- **TREE-05:** A student can delete a node/subtree after confirmation.
- **TREE-06:** Tree structure persists after refresh and reauthentication.
- **TREE-07:** Imported structure is editable before it is saved.
- **TREE-08:** Malformed or unreadable input yields a clear error/manual fallback, not invented topic content.

## 15.3 Completion tracking

- **PROG-01:** A leaf checkbox can be toggled.
- **PROG-02:** Ancestor percentages update when a leaf changes.
- **PROG-03:** Adding/deleting/moving a leaf updates affected ancestor percentages.
- **PROG-04:** A parent cannot misleadingly show 100% while a descendant leaf is incomplete.
- **PROG-05:** Progress is the same after reload and for another session under the same account.
- **PROG-06:** AI practice evaluation does not change completion checkboxes.

## 15.4 Materials

- **MAT-01:** A file can be attached to a subject, chapter, topic, or subtopic.
- **MAT-02:** Multiple attachments can be associated with the same node.
- **MAT-03:** One large file can remain attached to a broad parent node without mandatory splitting.
- **MAT-04:** Upload success is not shown until the storage and metadata flow has succeeded.
- **MAT-05:** Unsupported/unreadable files have explicit status.
- **MAT-06:** The UI does not claim that every uploaded file is text-extractable.
- **MAT-07:** Uploading a file does not automatically trigger AI analysis.
- **MAT-08:** Deleting an attachment removes its metadata and follows the documented storage cleanup policy.
- **MAT-09:** User A cannot retrieve User B’s attachment through guessed IDs or unauthorized URL retrieval.

## 15.5 Notes

- **NOTE-01:** Each node can have independent notes.
- **NOTE-02:** Saving a note persists after refresh.
- **NOTE-03:** Save failures preserve the user’s draft and show an error.
- **NOTE-04:** Generated notes do not overwrite personal notes without explicit confirmation.

## 15.6 Material analysis

- **AN-01:** A user must explicitly start analysis.
- **AN-02:** Analysis results display as suggestions, not formal coverage/mastery claims.
- **AN-03:** If text extraction fails, the app does not report a successful content analysis.
- **AN-04:** AI-disabled mode either provides only implemented deterministic analysis or clearly reports that the requested function needs AI.
- **AN-05:** Suggested node associations do not change the tree or move attachments without confirmation.
- **AN-06:** OCR output is marked as potentially imperfect where applicable.

## 15.7 AI features

- **AI-01:** AI tools are only available/visible in the selected-node context or an intentional equivalent.
- **AI-02:** Student academic/exam context is included when configured, without requiring it.
- **AI-03:** The client does not receive the AI provider secret.
- **AI-04:** No AI call occurs during routine tree navigation, checkbox toggling, or ordinary notes saving.
- **AI-05:** Provider error, timeout, rate limit, or malformed output is handled visibly.
- **AI-06:** The app does not attribute general model knowledge to uploaded files that were not provided to the model.
- **AI-07:** AI-generated notes remain reviewable drafts.
- **AI-08:** Practice feedback never silently updates syllabus completion.

## 15.8 Sync and resilience

- **SYNC-01:** Tree, checklist, files, and notes remain associated with the account after sign-out/sign-in.
- **SYNC-02:** After successful sign-in on another supported device, the same workspace records can be loaded.
- **SYNC-03:** Network and save errors have clear states.
- **SYNC-04:** A stale/failed operation does not display a false success state.

---

# 16. Risks and Mitigations

| Risk | Why it matters | Mitigation in v1 |
|---|---|---|
| Scope creep | Recreates the discarded adaptive learning engine | Enforce the explicit out-of-scope list; tree/checklist/workspace comes first |
| Incorrect syllabus extraction | Imports wrong or missing nodes | Review-before-save, editable tree, manual creation and paste fallback |
| Unsupported file parsing | Uploading may be mistaken for understanding | Separate storage, extraction, and analysis; show capability/status explicitly |
| OCR mistakes | Photos/handwriting may be misread | Preserve original image, mark OCR uncertainty, allow correction |
| Accidental API spending | Automatic scans or excess context drive cost | Explicit AI actions only; no scan on upload; limit context and output |
| AI hallucination | Educational output can sound confident and be wrong | Avoid unsupported claims, allow general help without false source attribution, show AI as optional assistance |
| Weak or misleading progress metrics | Checkbox completion is not mastery | Label it “completion,” not “mastery”; keep practice feedback separate |
| Privacy leakage | Student notes/files may be sensitive | Backend ownership checks, minimal data transfer, safe URL strategy, no public sharing by default |
| Google sign-in failure | OAuth needs exact configuration | Configure local and deployed callback URLs; test both environments |
| Hosted service cost/quotas | Open source does not mean hosted use is unlimited/free | Confirm current Convex/provider limits before launch; keep providers replaceable |
| File URL leakage | Convex storage URLs can act as bearer links | Validate before issuing URLs; do not expose publicly; assess expiring-link needs |
| User loses notes during generation/save | Background requests can race with edits | Draft flow, saving states, avoid overwriting personal content |
| Competition already has similar tools | Cannot claim uniqueness from a feature list alone | Present the product honestly as an integrated, focused workflow; validate with actual student feedback |

---

# 17. Product Success Measures

StudyOS has not yet been tested with students, so these are proposed usability/quality metrics—not achieved results.

## 17.1 Core product metrics

- Time for a first-time user to create a subject and child topic.
- Percentage of test users who can locate a topic and mark it complete without guidance.
- Successful save/load rate for tree mutations and notes.
- Correctness of derived parent progress against a test oracle.
- Upload success rate for each claimed supported format.
- Extraction success rate, measured separately from upload success.
- Number of unauthorized cross-account access tests passed.
- Frequency of file-processing and AI provider errors.
- AI requests per user action/session, to verify cost controls.

## 17.2 Lightweight user validation

After a working build exists, ask school/board and competitive-exam students to complete tasks such as:

1. create a subject with several levels;
2. import or manually create part of a syllabus;
3. attach a large file to a chapter and a smaller file to a topic;
4. add notes to a topic;
5. mark leaves complete and interpret parent progress;
6. use an optional AI action only if they choose to.

Observe where they get confused. Do not claim improved grades or learning outcomes without an appropriate study.

---

# 18. Demonstration Plan

A simple demo should prove the product’s connected workflow rather than overstate its AI.

1. Open the landing page.
2. Sign up or sign in to a test account.
3. Enter the empty workspace.
4. Import a prepared syllabus or create a small tree manually.
5. Fix or reorder one node to show that the tree is editable.
6. Mark two leaf topics complete and show parent progress updating.
7. Attach one document to a chapter and an image to a topic.
8. Open Notes on a selected topic and save a note.
9. Optionally request material analysis and show a cautious suggestion list.
10. Optionally use AI to explain a selected node or generate a practice question.
11. Sign out and sign back in to show account-linked persistence.
12. Demonstrate AI-disabled behavior if useful: the tree, checklist, attachments, and notes remain usable.

Do not make the demo depend on an unconfigured provider, a fabricated OAuth result, or a preloaded hard-coded syllabus presented as user-generated input. If a sample syllabus is used, identify it as sample data.

---

# 19. Decisions Locked for v1 vs Decisions Still Requiring Implementation

## 19.1 Locked product decisions

- Product name: **StudyOS**.
- Website entry: landing page → sign in/sign up → account-linked workspace.
- Continue with Google option is required.
- Primary interface is an expandable, editable tree.
- Supports school/board and competitive-exam organization.
- Completion is checklist-based and parent progress is derived from descendants.
- Materials can be attached to any node; uploads are optional.
- Supported attachment targets include PDF, DOCX, TXT, Markdown, PPT/PPTX, JPG/JPEG, PNG, photos/screenshots, and plain text.
- Student notes are per-node and editable.
- Material analysis is optional and manually requested.
- AI tools are contextual to a selected node and optional.
- AI features include Ask/Explain/Simplify, AI-generated notes, practice generation, and answer evaluation.
- AI context may use academic/exam preferences and relevant material only when appropriate.
- Core application functionality must work without a paid AI API key.
- Preferred stack: React + TypeScript + Vite, Tailwind CSS, Convex, Better Auth.
- No separate Python/FastAPI backend in the initial architecture.
- No formal evidence/provenance engine or topic-mastery state system in v1.

## 19.2 Technical decisions that must be validated during implementation

These are not user-facing product claims; they are work items that require engineering verification:

- exact compatible versions of Convex, `better-auth`, and `@convex-dev/better-auth`;
- deployed and local Google OAuth client/callback configuration;
- email-verification and password-recovery delivery policy;
- file-size limits based on current host/provider/library constraints;
- concrete PDF/DOCX/PPTX extraction libraries that run in the chosen runtime;
- OCR implementation and its performance/quality for photos and scanned PDFs;
- whether Convex file URLs meet the privacy requirements or another storage/access strategy is necessary;
- which AI provider/model is affordable and available at implementation time;
- whether material-analysis suggestions can be produced adequately with deterministic matching alone or need an AI provider;
- current deployment pricing/quotas and limits.

Do not describe any of these as completed until it is configured and tested.

---

# 20. Recommended Implementation Rules for AI Coding Tools / Contributors

Any coding agent or contributor implementing StudyOS must follow these instructions:

1. Treat this file as the current product scope. Do not reintroduce removed features without a separate approved scope change.
2. Build the simplest working tree/checklist/workspace flow before AI.
3. Follow current official Convex + Better Auth React/Vite integration docs. Do not invent authentication APIs or mix conflicting examples.
4. Keep the backend in TypeScript/Convex initially. Do not add FastAPI or a Python service without a specific proven requirement.
5. Validate all mutations and queries on the server, especially ownership and cross-record relationships.
6. Keep provider keys out of frontend code.
7. Keep AI calls explicit, contextual, and optional.
8. Do not scan files automatically upon upload.
9. Do not claim that all stored file types can be parsed until per-format extraction tests pass.
10. Do not use mock responses in production while presenting them as real AI output.
11. Keep student-authored notes separate from AI-generated drafts.
12. Keep checklist completion separate from practice evaluation.
13. Avoid fake progress bars, fake sync status, fake OAuth, fake analysis, or success messages before successful persistence.
14. Make errors and unsupported capabilities visible.
15. Write acceptance tests for tree operations, calculated progress, uploads, ownership boundaries, and sign-in before polishing animations.
16. Keep the visual design calm and clear; do not use a generic chatbot-first layout.
17. Do not include claims of guaranteed grade improvements, psychological mastery detection, official syllabus certification, or market uniqueness.
18. Preserve the student’s ability to edit every imported tree.
19. Keep the workspace accessible by keyboard and usable on smaller screens.
20. When implementation choices are uncertain, document the choice and test it rather than quietly inventing capabilities.

---

# 21. Technical References

The technical details above were checked against the following official documentation during preparation on 24 October 2026. The app must follow the current versions of these sources during implementation, since package APIs and hosting policies can change.

1. **Convex + Better Auth — React (Vite SPA) integration**  
   https://labs.convex.dev/better-auth/framework-guides/react

2. **Better Auth — Convex integration**  
   https://better-auth.com/docs/integrations/convex

3. **Better Auth — OAuth / social providers**  
   https://better-auth.com/docs/concepts/oauth

4. **Convex — File Storage overview and security model**  
   https://docs.convex.dev/file-storage/overview

5. **Convex — Uploading and storing files**  
   https://docs.convex.dev/file-storage/upload-files

6. **Convex — React client overview**  
   https://docs.convex.dev/client/react/overview

7. **Source problem research supplied for this product**  
   `problem_research(5).md` — research on the original “Syllabus-to-Evidence Learning Gap Auditor” problem, competitor landscape, limitations, and proposed original problem statement. The final StudyOS product intentionally narrows/changes that proposal as documented above.

### Notes on evidence and claims

- Official platform docs establish implementation guidance, not that StudyOS has already been implemented correctly.
- Provider prices/free tiers, hosting quotas, supported formats, and package APIs can change; verify at build/deploy time.
- The supplied research report presents a reviewed-market capability gap, not proof of global originality.
- StudyOS’s efficacy, usability, and impact must be measured through actual tests and student feedback.

---

# 22. Final Product Definition

**StudyOS is a simple, account-linked syllabus workspace with optional AI—not an AI app with a syllabus tree bolted onto it.**

A student opens the website, signs in or creates an account (including Continue with Google), and enters a personal workspace. They can create or import a syllabus, edit it into a folder-like tree, mark topics complete, and attach PDFs, documents, slides, text, photos, or screenshots to any node. They can write their own notes for each node. If they choose, they can explicitly analyze material or open contextual AI tools for explanations, generated notes, practice, and answer feedback. Their workspace is associated with their StudyOS account and persists through Convex, while Better Auth manages authentication.

The core product must remain understandable, useful, and usable with AI turned off. Uploading a file does not trigger automatic analysis, checkbox completion is not treated as proof of mastery, and AI-generated content remains assistance that the student can review—not an unquestionable authority.

That is the v1 scope. Everything else is future work until it is deliberately approved, implemented, and tested.
