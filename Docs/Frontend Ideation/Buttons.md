# StudyOS — Button Specification

> **Purpose:** A complete list of every button/control in StudyOS, in the order a student meets them: Landing page → Authentication (Better Auth + Continue with Google) → Workspace.
> **Scope rule:** Follows `StudyOS.md` v1. Nothing here may add a removed feature (mastery engine, exam mode, gamification, etc.).
> **Last updated:** 25 October 2026

---

## 0. Global Rules for All Buttons

1. **Real actions only.** A button must do what its label says. No decorative buttons, no fake success states.
2. **Loading state.** Any button that triggers an async action (auth, upload, save, AI) shows a spinner, becomes disabled, and prevents double-clicks until the action finishes.
3. **Success only after success.** Show "Saved", "Uploaded", etc. only after Convex/Better Auth confirms.
4. **Error state.** On failure, show a plain-language message near the button, keep the user's input, and allow retry.
5. **Destructive actions** (delete, clear, sign out of everything) always open a confirmation dialog first.
6. **AI buttons** are only enabled when an AI provider is configured. Otherwise they show a disabled state with the tooltip "AI is not available right now. Everything else still works."
7. **No automatic AI.** Uploading a file, ticking a checkbox, expanding a branch, or saving notes never calls AI.
8. **Keyboard + accessibility.** Every button is a real `<button>` (or link), has an accessible name, a visible focus ring, and works with Enter/Space. Icon-only buttons need an `aria-label` and a tooltip.
9. **Not by colour alone.** Checkbox states use symbols (empty, dash, check), not only colour.
10. **Ownership.** Every button that reads or writes data goes through an authenticated Convex function that verifies the signed-in user owns the record.

**Button types used below**

| Type | Meaning |
|---|---|
| Primary | Main action on a screen (filled indigo) |
| Secondary | Supporting action (outlined) |
| Ghost / icon | Low-emphasis or icon-only |
| Danger | Destructive (red text/outline, always confirmed) |
| Link | Text link that navigates |

---

# PART 1 — LANDING PAGE (`/`)

Public page. No account needed.

| # | Button | Type | Where | What it does | Result / notes |
|---|---|---|---|---|---|
| 1.1 | **StudyOS logo** | Link | Top-left nav | Goes to `/` | If already signed in, goes to `/workspace` |
| 1.2 | **Sign in** | Secondary | Top-right nav | Navigates to `/sign-in` | No data sent |
| 1.3 | **Get started** | Primary | Top-right nav | Navigates to `/sign-up` | Same as hero button |
| 1.4 | **Get started** (hero) | Primary | Hero section | Navigates to `/sign-up` | The single main call to action |
| 1.5 | **Sign in** (hero link) | Link | Hero, under main button | Navigates to `/sign-in` | For returning students |
| 1.6 | **See how it works** (optional) | Ghost | Hero | Smooth-scrolls to the product preview section | Only if the preview section exists; otherwise omit |
| 1.7 | **Create your free account** | Primary | Bottom call-to-action band | Navigates to `/sign-up` | Do not say "free" unless it is true at launch |
| 1.8 | **Privacy** (footer) | Link | Footer | Opens the privacy note/page | Explains workspace is account-tied and AI is optional |
| 1.9 | **Terms** (footer) | Link | Footer | Opens terms page | Include the "upload only material you have permission to use" notice |

**Behaviour when already signed in:** nav shows **Open workspace** instead of Sign in / Get started. It navigates to `/workspace`.

---

# PART 2 — AUTHENTICATION (Better Auth)

Better Auth handles accounts and sessions. Google sign-in is real OAuth through Better Auth, never a fake button.

## 2A. Sign-up page (`/sign-up`)

| # | Button / control | Type | What it does | Success | Failure |
|---|---|---|---|---|---|
| 2.1 | **Back to home** | Link | Goes to `/` | — | — |
| 2.2 | **Continue with Google** | Primary (Google style) | Calls Better Auth social sign-in with provider `google`. Redirects the browser to Google's consent screen, then back through the Better Auth callback | New account created (or existing Google account signed in), session set, redirected to first-time setup (new) or `/workspace` (returning) | User cancels at Google → back on page with "Sign-in was cancelled." Misconfigured callback or secrets → "Google sign-in isn't available right now. Try email instead." |
| 2.3 | **Create account** | Primary | Validates the form, then calls Better Auth email/password sign-up | Account created, session set, redirect to first-time setup | Inline field errors (invalid email, weak password, passwords don't match) or banner (email already registered → offer "Sign in instead") |
| 2.4 | **Show / hide password** (eye icon) | Ghost icon | Toggles password field visibility | — | — |
| 2.5 | **Already have an account? Sign in** | Link | Goes to `/sign-in` | — | — |

**Form rules**
- Required: email, password. Confirm password only if the form includes it.
- Disable **Create account** and show a spinner while the request runs.
- Do not show "Check your email" unless email delivery and verification are actually configured.

## 2B. Sign-in page (`/sign-in`)

| # | Button / control | Type | What it does | Success | Failure |
|---|---|---|---|---|---|
| 2.6 | **Back to home** | Link | Goes to `/` | — | — |
| 2.7 | **Continue with Google** | Primary (Google style) | Same Better Auth Google OAuth flow as 2.2 | Signed in, redirected to `/workspace` | Same error handling as 2.2 |
| 2.8 | **Sign in** | Primary | Calls Better Auth email/password sign-in | Session set, redirected to `/workspace` | "Incorrect email or password." (never reveal which one is wrong) |
| 2.9 | **Show / hide password** | Ghost icon | Toggles password visibility | — | — |
| 2.10 | **Forgot password?** | Link | Goes to `/forgot-password` | — | **Only include if email delivery is configured.** Otherwise hide it. |
| 2.11 | **New here? Create account** | Link | Goes to `/sign-up` | — | — |

## 2C. Forgot password (`/forgot-password`) — only if configured

| # | Button | Type | What it does |
|---|---|---|---|
| 2.12 | **Send reset link** | Primary | Calls the Better Auth password-reset flow, shows a neutral message ("If an account exists, we've sent a link.") |
| 2.13 | **Back to sign in** | Link | Goes to `/sign-in` |

Do not build this screen until an email provider exists.

## 2D. First-time setup (after first sign-up only)

Short, optional, never blocks entry.

| # | Button / control | Type | What it does |
|---|---|---|---|
| 2.14 | **Category chips**: School / Board / Competitive exam / Other | Selectable chips | Chooses study category, saved to preferences |
| 2.15 | **Continue** | Primary | Saves display name, category, class/exam (all optional), then opens `/workspace` |
| 2.16 | **Skip for now** | Link | Skips saving, opens `/workspace`. Fields stay editable later in Settings |

## 2E. Session behaviour (no button, but required)

- Signed-out visitors opening `/workspace` are redirected to `/sign-in`.
- Expired session: show "Your session ended. Please sign in again." with a **Sign in** button, and never leave an infinite spinner.

---

# PART 3 — WORKSPACE (`/workspace`)

Layout: **Activity bar** (far left) → **Side panel** (Library or Explorer) → **Main area** (pages).

## 3A. Activity bar (always visible)

| # | Button | Type | What it does | Notes |
|---|---|---|---|---|
| 3.1 | **Library** (book icon) | Icon | Shows the Library in the side panel (list of syllabuses) | If already active, clicking it **collapses/expands** the side panel |
| 3.2 | **Import** (download-arrow icon) | Icon | Opens the Import syllabus page in the main area | Does not change the side panel |
| 3.3 | **Settings** (gear icon) | Icon | Opens the Settings page | Only **one** Settings icon in the rail |
| 3.4 | **Avatar** ("S") | Icon | Opens the profile menu | See 3B |
| 3.5 | **Collapse / expand side panel** | Icon | Hides or shows the side panel, leaving the icon rail | Remembers the choice per device. On mobile the panel becomes a slide-in drawer opened by a hamburger button |

## 3B. Profile menu (from the avatar)

| # | Item | Type | What it does |
|---|---|---|---|
| 3.6 | **Settings** | Menu item | Opens the Settings page |
| 3.7 | **Sign out** | Menu item | Calls Better Auth sign out, clears the app's private state, redirects to `/` |

Sign out never deletes any data.

## 3C. Side panel — Library state (no syllabus open)

| # | Button | Type | What it does | Result / notes |
|---|---|---|---|---|
| 3.8 | **Import syllabus** | Primary | Opens the Import page | See 3F |
| 3.9 | **Create manually** | Secondary | Opens a small dialog asking for a syllabus name (e.g. "First Year Syllabus"), then creates an empty syllabus and opens it | Name required; **Create** is disabled while empty |
| 3.10 | **Syllabus row** (e.g. "First Year Syllabus 62%") | Row button | Opens that syllabus: the side panel switches to the Explorer tree and the main area shows its Overview | Updates `lastOpenedAt` |
| 3.11 | **Row menu (⋯)** | Ghost icon | Opens a menu for that syllabus | Same as right-click |
| 3.12 | → **Rename** | Menu item | Inline rename; **Enter** saves, **Esc** cancels | — |
| 3.13 | → **Duplicate** | Menu item | Creates a copy of the tree (nodes and completion reset, no files copied unless the student confirms) | Say clearly what is copied |
| 3.14 | → **Delete** | Danger menu item | Opens a confirmation dialog | See 3.45 |

## 3D. Side panel — Explorer state (a syllabus is open)

### Header

| # | Button | Type | What it does |
|---|---|---|---|
| 3.15 | **← Back** | Icon | Returns to the Library state (like "Close Folder"). Unsaved notes are saved first |
| 3.16 | **+ Add subject** | Secondary | Adds a new top-level subject row with the name field in edit mode. **Enter** saves, **Esc** cancels |
| 3.17 | **Progress ring** | Display | Shows overall syllabus completion. Clicking opens the Syllabus Overview page |
| 3.18 | **Header menu (⋯)** | Ghost icon | Opens: Rename syllabus, Collapse all, Expand all, Delete syllabus |

### Tree rows (every subject, chapter, topic)

| # | Control | Type | What it does | Rules |
|---|---|---|---|---|
| 3.19 | **Chevron (▸ / ▾)** | Icon | Expands or collapses children | Shown only if the node has children. Remembers expansion state |
| 3.20 | **Checkbox** | Checkbox | See "Checkbox behaviour" below | Three states: empty, partial (dash), complete (check) |
| 3.21 | **Row label** | Row button | Selects the node and opens its page in the main area | Selected row is highlighted. Does not toggle the checkbox |
| 3.22 | **Row `＋` (appears on hover/focus)** | Ghost icon | Opens a small menu: Add child, Add sibling, Upload file, Add text | — |
| 3.23 | **Row `⋯` (appears on hover/focus)** | Ghost icon | Opens the node menu (same as right-click) | — |
| 3.24 | **Paperclip / note icon on a row** | Indicator | Shows the node has files or notes. Clicking it opens the node's Materials tab | Not a separate feature, just a shortcut |
| 3.25 | **File row** (e.g. `calculus_notes.pdf`) | Row button | Opens the File preview page | Files have **no checkbox** |

**Checkbox behaviour (core rule from the spec)**

| State | Symbol | Meaning |
|---|---|---|
| Empty | ☐ | No topic inside is completed |
| Partial | ▬ (dash) | Some topics inside are completed |
| Complete | ☑ | Every topic inside is completed |

- **Topic (leaf):** clicking toggles complete / not complete.
- **Chapter or subject:** the state is **calculated** from the topics inside it, never stored on its own.
- **Clicking a chapter/subject checkbox** sets **all topics inside** to complete (if not already all complete) or to not complete (if all were complete).
- If that action would **un-complete several topics**, show a confirmation: "Mark 8 topics as not completed?"
- The percentage and the checkbox always agree: 0% = empty, 100% = complete, anything between = partial.
- No AI call, no practice result, and no analysis ever changes a checkbox.

### Node menu (right-click or `⋯` on any tree row)

| # | Item | What it does | Shortcut |
|---|---|---|---|
| 3.26 | **Open** | Opens the node page | Enter |
| 3.27 | **Add child** | Adds a child node under this node (name field in edit mode). Type defaults from the parent level (subject → chapter → topic) and is editable | — |
| 3.28 | **Add sibling** | Adds a node at the same level, right after this one | — |
| 3.29 | **Upload file** | Opens the file picker; attaches the chosen file(s) to this node | — |
| 3.30 | **Add text** | Opens the Add text dialog; saves pasted/typed text as material on this node | — |
| 3.31 | **Rename** | Inline rename | F2 |
| 3.32 | **Move to…** | Opens a dialog with the tree; choose a new parent. The dialog disables the node itself and all its descendants | — |
| 3.33 | **Move up / Move down** | Reorders among siblings (keyboard alternative to drag and drop) | Alt+↑ / Alt+↓ |
| 3.34 | **Expand all / Collapse all** (parents only) | Expands or collapses this branch | — |
| 3.35 | **Delete** (Danger) | Opens confirmation; states how many topics and files will be deleted | Delete |

**Extra tree interactions (not buttons, still required)**
- Drag a node onto another node to move it; drag within siblings to reorder. Always keep the menu-based alternative.
- Drag a file from the computer onto a node to upload it there.
- Keyboard: ↑ ↓ move, → expands, ← collapses, Space toggles the checkbox, Enter opens, F2 renames, Delete deletes.

## 3E. Main area — Welcome page (no syllabus open)

| # | Button | Type | What it does |
|---|---|---|---|
| 3.36 | **Continue: [last syllabus name]** | Primary | Opens the last-opened syllabus |
| 3.37 | **Import a syllabus** | Secondary | Opens the Import page |
| 3.38 | **Create manually** | Secondary | Same as 3.9 |
| 3.39 | **Recent list item** | Row button | Opens that syllabus |

## 3F. Main area — Import syllabus page

Flow: **Choose input → Scan → Review → Save.** Nothing is saved until **Save to workspace**.

| # | Button / control | Type | What it does | Notes |
|---|---|---|---|---|
| 3.40 | **Tab: Upload file** | Tab | Shows the file dropzone | — |
| 3.41 | **Tab: Paste text** | Tab | Shows a large text box | Works first; build this before file scanning |
| 3.42 | **Browse files** | Secondary | Opens the file picker | Accepts only formats that really have a working extractor. Do not list PDF, Word, or photo until each is implemented and tested |
| 3.43 | **Scan** | Primary | Extracts text and builds a **draft** tree | Disabled until a file or text is provided. Shows progress. Never invents topics from a filename |
| 3.44 | **Remove file** (✕) | Ghost icon | Clears the chosen file | — |
| 3.45a | **Edit node** (rename, move, delete, add) in the review tree | Mixed | Lets the student correct the draft | Same tree controls as the Explorer |
| 3.45b | **Save to workspace** | Primary | Asks for/confirms the syllabus name, saves the reviewed tree as a **new syllabus**, then opens it | Success only after Convex confirms |
| 3.45c | **Discard draft** | Danger | Asks to confirm, then throws away the draft | — |
| 3.45d | **Create manually instead** | Link | Opens Create manually | Shown on any scan failure |

**Import failure messages (with buttons)**
- Unreadable or scanned file: "We couldn't read text from this file." → **Paste text instead** · **Create manually**
- If a photo/OCR path is not built yet, the photo option must not appear.

## 3G. Main area — Syllabus Overview page

| # | Button | Type | What it does |
|---|---|---|---|
| 3.46 | **Subject card / bar** | Row button | Opens that subject's page |
| 3.47 | **Add subject** | Secondary | Same as 3.16 |
| 3.48 | **Expand all / Collapse all** | Ghost | Controls the tree in the side panel |

## 3H. Main area — Node pages

Tabs on every node: **Overview · Materials · Notes · Ask AI · Practice**. Opens on **Overview**, not Notes.

### Shared header (all nodes)

| # | Button | Type | What it does |
|---|---|---|---|
| 3.49 | **Breadcrumb links** (Mathematics › Calculus) | Link | Selects that ancestor node |
| 3.50 | **Title checkbox** (topics only) | Checkbox | Toggles the topic complete / not complete |
| 3.51 | **Mark complete / Mark not complete** (topics only) | Primary / Secondary | Same as the checkbox. Label changes with state |
| 3.52 | **Mark all complete** (chapters/subjects) | Secondary | Sets every topic inside to complete, with confirmation if it affects many |
| 3.53 | **Node menu (⋯)** | Ghost icon | Rename, Move to…, Delete |
| 3.54 | **Tab buttons** | Tabs | Switch the visible tool. Only the chosen tab's content loads |

### Overview tab — chapter / subject (tracker view)

| # | Button | Type | What it does |
|---|---|---|---|
| 3.55 | **Topic checkbox** in "Topics in this chapter" | Checkbox | Toggles that topic directly, without opening it. Progress updates instantly |
| 3.56 | **Topic name** | Link | Opens that topic's page |
| 3.57 | **Paperclip icon on a topic** | Icon | Opens that topic's Materials tab |
| 3.58 | **Drop files here or browse** (dropzone) | Dropzone / Secondary | Uploads file(s) to **this chapter** (stays on the chapter; not copied to topics) |
| 3.59 | **Upload file** | Secondary | Opens the file picker for this node |
| 3.60 | **Add text** | Secondary | Opens the Add text dialog for this node |
| 3.61 | **Notes (optional) row** | Expandable row | Expands an inline notes editor. Notes never required |

### Overview tab — topic (leaf), when nothing is added

| # | Button | Type | What it does |
|---|---|---|---|
| 3.62 | **Upload file** card | Card button | Opens file picker (PDF, Word, PowerPoint, photo) |
| 3.63 | **Add text** card | Card button | Opens the Add text dialog |
| 3.64 | **Write notes** card (marked Optional) | Card button | Opens the Notes tab with the editor focused |

After something is added, the matching card becomes a short list of what is attached.

## 3I. Materials tab

| # | Button | Type | What it does | Rules |
|---|---|---|---|---|
| 3.65 | **Upload file** / dropzone | Secondary | Uploads to this node via Convex: generate upload URL → upload bytes → save metadata | Validate type and size first. Show success only after metadata is saved. Block duplicate submits |
| 3.66 | **Add text** | Secondary | Opens a dialog with title + text box. **Save** stores it as a text material | Empty input rejected |
| 3.67 | **Material row** | Row button | Opens the File preview page | — |
| 3.68 | **Open / Preview** | Ghost | Opens the preview if supported | Unsupported types show Download only |
| 3.69 | **Download** | Ghost | Gets a file URL **only after the ownership check**, then downloads | Never expose the URL publicly |
| 3.70 | **Rename title** | Ghost | Edits the display title (original filename unchanged) | — |
| 3.71 | **Move to another node** | Ghost | Opens the tree dialog; moves the attachment within the same syllabus | — |
| 3.72 | **Delete** | Danger | Confirms, then removes metadata and the stored file if no longer referenced | Report any cleanup failure; don't hide it |
| 3.73 | **Analyze material** | Secondary | Explicitly starts analysis of this material | Runs **only on click**. Never on upload |
| 3.74 | **Retry** (on a failed upload/extraction) | Secondary | Retries the failed step | — |

**Status chips beside each material:** Uploaded · Text extraction supported / failed · OCR not available · Analysis requested / completed / failed.

## 3J. File preview page

| # | Button | Type | What it does |
|---|---|---|---|
| 3.75 | **Back to [node name]** | Link | Returns to the node's Materials tab |
| 3.76 | **Download** | Secondary | Same as 3.69 |
| 3.77 | **Rename** | Ghost | Edits display title |
| 3.78 | **Move** | Ghost | Moves to another node |
| 3.79 | **Analyze** | Secondary | Same as 3.73. Results appear as **suggestions** the student can review |
| 3.80 | **Delete** | Danger | Same as 3.72 |

### Analysis results

| # | Button | Type | What it does |
|---|---|---|---|
| 3.81 | **Open suggested topic** | Link | Navigates to the suggested node. Does not change anything |
| 3.82 | **Attach to this topic too** (optional) | Secondary | Only after explicit click; creates the link/copy as defined. Never silent |
| 3.83 | **Dismiss** | Ghost | Hides the suggestions |

Suggestions must never be presented as a coverage score, mastery, or guarantee.

## 3K. Notes tab

| # | Button / control | Type | What it does |
|---|---|---|---|
| 3.84 | **Notes editor** | Text area | Autosaves after a short pause; shows Saving… / Saved / Error |
| 3.85 | **Retry save** | Secondary | Shown if a save failed. The draft text is preserved |
| 3.86 | **Clear notes** | Danger | Confirms, then empties the note (explicit only) |
| 3.87 | **Draft banner: Insert into notes** | Primary | Appears for AI-generated notes. Inserts the draft **only after the student confirms** |
| 3.88 | **Draft banner: Edit first** | Secondary | Opens the draft in the editor for changes before saving |
| 3.89 | **Draft banner: Discard** | Ghost | Throws away the draft |

An older in-flight save must never overwrite a newer edit.

## 3L. Ask AI tab (optional)

AI is off-by-default behaviour: nothing is called until a button is pressed.

| # | Button / control | Type | What it does |
|---|---|---|---|
| 3.90 | **Explain** | Chip | Sends the node name and the student's saved level/exam context, asking for an explanation |
| 3.91 | **Simplify** | Chip | Asks for a simpler version of the last reply |
| 3.92 | **Give an example** | Chip | Asks for a worked example |
| 3.93 | **Message box + Send** | Primary | Sends the typed question with node context |
| 3.94 | **Use my materials** (toggle / picker) | Toggle | Lets the student choose which attached material text may be sent. **Off by default.** Shows a note that the content is processed by the configured provider |
| 3.95 | **Generate notes** | Secondary | Creates a **draft** (see 3.87–3.89). Never overwrites existing notes |
| 3.96 | **Stop** | Secondary | Cancels a running request |
| 3.97 | **Retry** | Secondary | Appears on timeout, rate limit, or provider error |
| 3.98 | **Copy** | Ghost icon | Copies a reply |
| 3.99 | **Clear conversation** | Danger | Confirms, then deletes this node's AI messages |
| 3.100 | **Ask AI about this topic** (small button on other tabs) | Ghost | Jumps to the Ask AI tab with this node as context. Does not send anything by itself |

**When AI is unavailable:** all AI buttons are disabled with "AI is not available right now. Your tree, files, and notes still work."

## 3M. Practice tab (optional)

| # | Button / control | Type | What it does |
|---|---|---|---|
| 3.101 | **Generate practice** | Primary | Creates a question set for this node (uses safe defaults if count/type options aren't built) |
| 3.102 | **Question count / type** (if built) | Select | Chooses how many and what kind |
| 3.103 | **Use a material as context** | Toggle | Explicit opt-in per material; off by default |
| 3.104 | **Answer box + Submit answer** | Primary | Sends the answer for evaluation |
| 3.105 | **Next question / Previous question** | Secondary | Moves within the set |
| 3.106 | **Try again** | Ghost | Clears the current answer box for another attempt |
| 3.107 | **View past sets** | Ghost | Shows stored practice history for this node |
| 3.108 | **Delete practice set** | Danger | Confirms, then deletes it |

**Hard rule:** feedback never ticks or unticks any checkbox. Show a note: "Feedback is a study aid. Your checklist stays in your control."

## 3N. Settings page

| # | Button / control | Type | What it does |
|---|---|---|---|
| 3.109 | **Display name** field + **Save** | Primary | Updates the name |
| 3.110 | **Study category chips** | Chips | School / Board / Competitive exam / Other |
| 3.111 | **Class / exam name** field | Input | Optional. Saved with **Save** |
| 3.112 | **Preferred language** (if supported) | Select | Optional |
| 3.113 | **AI status** | Display | Shows "Available" or "Not available". Not a user toggle unless a real setting exists |
| 3.114 | **Sign out** | Secondary | Same as 3.7 |
| 3.115 | **Delete account** (before public launch) | Danger | Opens a strong confirmation (type to confirm). Deletes all syllabuses, files, notes, AI history, and practice records. Add this before public production use |

## 3O. Dialogs and shared buttons

| # | Dialog | Buttons | What they do |
|---|---|---|---|
| 3.116 | **Create syllabus** | **Create** · **Cancel** | Creates an empty syllabus and opens it |
| 3.117 | **Add text** | **Save** · **Cancel** | Saves text material on the node |
| 3.118 | **Move to…** | **Move here** · **Cancel** | Moves the node/attachment. Blocks moving a node under itself or a descendant; blocks cross-syllabus moves |
| 3.119 | **Delete node/subtree** | **Delete** (danger) · **Cancel** | Says exactly what goes: "This will delete 1 chapter, 8 topics, 3 files, and their notes." |
| 3.120 | **Delete syllabus** | **Delete syllabus** (danger) · **Cancel** | Deletes the syllabus's nodes, files, notes, analyses, AI history, and practice sets |
| 3.121 | **Delete attachment** | **Delete** (danger) · **Cancel** | Removes the file and metadata |
| 3.122 | **Mark many topics not completed** | **Confirm** · **Cancel** | Applies the bulk completion change |
| 3.123 | **Discard unsaved import draft** | **Discard** (danger) · **Keep editing** | — |
| 3.124 | **Session expired** | **Sign in** | Returns to `/sign-in` |
| 3.125 | **Toast actions** | **Undo** (where possible) · **Dismiss** | Undo is only offered if the action can truly be reversed |

---

# PART 4 — Button States Checklist (apply to every button)

| State | Required behaviour |
|---|---|
| Default | Clear label, correct type styling |
| Hover / focus | Visible highlight and focus ring |
| Loading | Spinner + disabled, label may change to "Saving…" |
| Disabled | Greyed out, with a tooltip explaining why |
| Success | Confirmation only after the backend confirms |
| Error | Plain-language message, input preserved, **Retry** available |
| Unavailable feature | Hidden or disabled with an honest message. Never a button that does nothing |

---

# PART 5 — Quick Navigation Map

```text
Landing (/)
├─ Sign in ───────────────► /sign-in
│    ├─ Continue with Google ──► Google consent ► callback ► /workspace
│    ├─ Sign in (email) ───────► /workspace
│    ├─ Forgot password? ──────► /forgot-password   (only if email is configured)
│    └─ Create account ────────► /sign-up
└─ Get started ───────────► /sign-up
     ├─ Continue with Google ──► Google consent ► callback ► setup ► /workspace
     ├─ Create account ────────► setup ► /workspace
     └─ Sign in ───────────────► /sign-in

/workspace
├─ Activity bar: Library · Import · Settings · Avatar (Settings, Sign out)
├─ Library: Import syllabus · Create manually · [syllabus rows ⋯ Rename/Duplicate/Delete]
├─ Explorer: Back · Add subject · tree rows (chevron, checkbox, label, ＋, ⋯) · file rows
└─ Main: Welcome · Import · Overview · Node (Overview/Materials/Notes/Ask AI/Practice) · File preview · Settings
```

---

# PART 6 — Out of Scope (do not add buttons for these in v1)

Exam mode, "Teach me" mode, "I don't understand" mode, study sessions, revision scheduler, study-for-my-exam planner, XP/streaks/badges/leaderboards, predicted marks, mastery or coverage scores, prerequisite graph, teacher/parent/classroom roles, LMS integrations, sharing a syllabus publicly.
