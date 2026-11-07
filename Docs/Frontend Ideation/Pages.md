# StudyOS --- Pages Specification

> **Purpose:** Defines the pages, visible content, and page behavior in
> StudyOS, from the public landing page through authentication and the
> private workspace.
>
> **Companion files:** `Buttons.md` defines button/control behavior.
> `user_flow.md` defines end-to-end journeys across pages.
>
> **Product scope:** Follows `StudyOS.md` v1. No exam mode,
> gamification, mastery engine, revision scheduler, predicted marks, or
> other removed features.
>
> **Last updated:** 25 October 2026

------------------------------------------------------------------------

## 0. Page Map and Core Interaction Model

``` text
PUBLIC                                  PRIVATE (signed in)
──────────────────────────────          ─────────────────────────────────────
/                 Landing               /workspace       Welcome / Library
/sign-up          Sign up                 /workspace/import Import syllabus
/sign-in          Sign in                 /workspace/s/:syllabusId
/forgot-password  Only if configured                         Syllabus Overview
                                         /workspace/s/:syllabusId/n/:nodeId
                                                             Subject / Chapter / Topic
                                         /workspace/s/:syllabusId/f/:attachmentId
                                                             File preview
                                         /setup           First-time setup
                                         /settings        Settings
```

### 0.1 The three-zone workspace

  -----------------------------------------------------------------------
  Zone                    Role                    Behavior
  ----------------------- ----------------------- -----------------------
  **Activity bar** (far   Top-level navigation:   Remains in the same
  left, approximately     Library, Import,        position. The selected
  56px)                   Settings, Avatar        item may change.

  **Side panel**          Shows either the        Switching between
  (approximately 320px)   Library list or the     Library and Explorer
                          Explorer tree for an    changes its content.
                          open syllabus           The panel can be
                                                  collapsed
                                                  independently.

  **Main area**           Shows the selected page Responds to the
                          or tab                  selected navigation
                                                  destination, node,
                                                  file, or tab.
  -----------------------------------------------------------------------

**Navigation rule:** The student can move between Library, a syllabus,
Import, and Settings without accidentally deleting or discarding data.
The URL reflects the current content page so refresh, deep links, and
browser Back/Forward behave predictably.

### 0.2 State model

The workspace needs to represent at least:

-   `openSyllabusId`: the active syllabus ID, or none.
-   `selection`: no selection, a subject/chapter/topic node, or an
    attachment.
-   `currentDestination`: Welcome, Syllabus Overview, node page, file
    preview, Import, or Settings.
-   `activeTab`: Overview, Materials, Notes, Ask AI, or Practice for
    node pages.
-   `sidePanelState`: Library, Explorer, or collapsed.

The URL is the source of truth for addressable content: the syllabus,
selected node or attachment, and node tab. Panel collapse and other
transient presentation state may remain local UI state.

### 0.3 Consistent navigation rules

-   Clicking **Library** navigates the main area to Welcome and shows
    the Library in the side panel. If the panel is collapsed, it opens.
    Clicking Library again may collapse the panel only when the app is
    already in the Library destination; it must not unexpectedly abandon
    a selected page.
-   Opening a syllabus selects it in the Explorer and shows its Syllabus
    Overview.
-   Clicking **← Back to Library** closes the active syllabus view and
    shows Welcome. It does not delete or modify the syllabus.
-   Clicking **Import** or **Settings** changes the main area but does
    not delete the active syllabus or its tree state. Returning to the
    syllabus restores its context where possible.
-   The tree chevron only expands/collapses a branch; it does not
    navigate the main area.
-   A node checkbox changes completion state; it does not navigate the
    main area.
-   A node name opens that node's page. A file name opens the file
    preview.
-   Browser Back/Forward follows URL navigation. It must not silently
    discard unsaved edits.
-   On every private route, verify the signed-in user owns the
    referenced syllabus and any referenced node or attachment.

------------------------------------------------------------------------

# PART 1 --- LANDING PAGE (`/`)

**Access:** Public. If the visitor has a valid session, show **Open
workspace** instead of Sign in / Get started.

**Goal:** Explain quickly that a syllabus becomes an editable tree with
a completion checklist, while files, notes, and AI are optional extras.

**Visual tone:** Calm, warm, study-focused. Avoid neon-heavy styling,
fake dashboards, fake testimonials, fake user counts, and claims about
guaranteed grades or official syllabi.

## 1.1 Sections, top to bottom

  -----------------------------------------------------------------------
  \#                      Section                 Content
  ----------------------- ----------------------- -----------------------
  1                       Top navigation          StudyOS logo. **Sign
                                                  in** and **Get
                                                  started**, or **Open
                                                  workspace** for
                                                  signed-in users.

  2                       Hero                    Headline such as "Your
                                                  syllabus, as a tree you
                                                  actually use."
                                                  Supporting line about
                                                  tracking completion,
                                                  keeping files and notes
                                                  beside topics, and
                                                  using AI only when
                                                  wanted. Primary **Get
                                                  started** and secondary
                                                  **Sign in**.

  3                       Product preview         A static preview of the
                                                  real interface: sidebar
                                                  tree, completion
                                                  states, and a tracker
                                                  page. Label sample
                                                  content as "Sample
                                                  data" where
                                                  appropriate.

  4                       Three feature blocks    **Track completion**;
                                                  **Keep everything
                                                  together**; **AI when
                                                  you choose**.

  5                       How it works (optional) Three steps: Import or
                                                  create → Tick off and
                                                  attach → Ask only if
                                                  needed.

  6                       Closing call to action  A concise invitation
                                                  and **Create your
                                                  account**.

  7                       Privacy note and footer Explain that the
                                                  workspace is tied to
                                                  the account and AI is
                                                  optional. Include
                                                  Privacy and Terms
                                                  links. Terms should
                                                  remind users to upload
                                                  only material they have
                                                  permission to use.
  -----------------------------------------------------------------------

## 1.2 Do not include

-   Official exam syllabus libraries unless such a feature is actually
    implemented and authorized.
-   Guaranteed grade, rank, or exam-success promises.
-   Fake testimonials, fake user counts, or a public demo workspace
    presented as real user data.
-   "AI-powered" as the main product promise.

## 1.3 States and responsive behavior

-   **Signed out:** Show Sign in and Get started.
-   **Signed in:** Show Open workspace.
-   **Mobile:** Collapse navigation into a menu; stack the product
    preview beneath the hero.
-   All preview data must be clearly sample data and must not expose
    another student's workspace.

------------------------------------------------------------------------

# PART 2 --- AUTHENTICATION AND FIRST-TIME SETUP

Better Auth manages accounts and sessions. Google sign-in must use a
configured, functioning OAuth integration; do not present a decorative
Google button as working authentication.

## 2.1 Sign up (`/sign-up`)

**Layout:** Centered card, StudyOS logo, and **Back to home** link.

  -----------------------------------------------------------------------
  Order                               Content
  ----------------------------------- -----------------------------------
  1                                   Heading: "Create your account"

  2                                   **Continue with Google**, only when
                                      OAuth is configured

  3                                   Divider: "or"

  4                                   Email and password fields;
                                      show/hide password control. Confirm
                                      password only if the implementation
                                      uses it.

  5                                   **Create account**

  6                                   "Already have an account? Sign in"

  7                                   Terms and Privacy note
  -----------------------------------------------------------------------

**States**

-   **Loading:** Disable the submitted action and prevent duplicate
    submissions. Lock fields only if needed to prevent inconsistent
    requests.
-   **Field errors:** Show clear inline messages for invalid email, weak
    password, or password mismatch.
-   **Request errors:** Show a useful message for an existing account,
    network failure, or Google sign-in error/cancellation.
-   **Success:** Send a new account to `/setup`.
-   Do not say "Check your email" unless email delivery and any required
    verification are actually configured.

## 2.2 Sign in (`/sign-in`)

  Order   Content
  ------- --------------------------------------------------------------
  1       Heading: "Welcome back"
  2       **Continue with Google**, only when OAuth is configured
  3       Divider: "or"
  4       Email and password fields with show/hide control
  5       **Sign in**
  6       **Forgot password?**, only when the reset flow is configured
  7       "New here? Create account"

**States and destination**

-   Use one neutral credential error such as "Incorrect email or
    password." Do not reveal which credential was wrong.
-   Show a clear message for network or OAuth failures.
-   After successful sign-in, route as follows:
    1.  If setup has not been completed for this account, open `/setup`.
    2.  Otherwise, if a previously used syllabus still exists and
        belongs to the user, reopen its Overview.
    3.  Otherwise, open `/workspace` Welcome.
-   A user must always land in their own workspace.

## 2.3 Forgot password (`/forgot-password`) --- only if configured

Show a heading, email field, **Send reset link**, and **Back to sign
in**.

After submission, use a neutral response such as: "If an account exists
for that email, we've sent a link." Do not build or expose this page
until the reset flow and email delivery are configured.

## 2.4 First-time setup (`/setup`)

**Goal:** Collect only information useful for optional personalization.
Setup is optional and must never block access to the workspace.

  -----------------------------------------------------------------------
  Order                               Content
  ----------------------------------- -----------------------------------
  1                                   "Tell us a little about your
                                      studies" and "You can skip this and
                                      change it later."

  2                                   Display name, prefilled if Google
                                      provides it

  3                                   Study category chips: School,
                                      Board, Competitive exam, Other

  4                                   Optional class or exam name,
                                      e.g. "B.Tech CSE, Year 1" or "JEE"

  5                                   Preferred language, only if
                                      supported

  6                                   **Continue** and **Skip for now**
  -----------------------------------------------------------------------

Store only the fields needed for this purpose. These fields may
personalize AI replies but do not imply that AI is available.

After Continue or Skip, mark setup as completed or skipped and open the
user's workspace. Do not show setup on every login.

## 2.5 Session behavior

-   Signed-out visitor opens a private route → redirect to `/sign-in`,
    retaining a safe return destination when appropriate.
-   Expired session during use → show a session-ended message and a
    **Sign in** action. Never leave an infinite spinner.
-   If a session expires while edits are unsaved, explain that the edits
    may not have reached the server; preserve them locally where safe
    and possible, and never falsely claim they were saved.
-   All private pages and API requests must enforce authorization on the
    server, not merely hide UI elements.

------------------------------------------------------------------------

# PART 3 --- WORKSPACE (`/workspace`)

The workspace contains the Activity bar, Side panel, and Main area
described in Part 0.

## 3.1 Activity bar

  -----------------------------------------------------------------------
  Item                                Effect
  ----------------------------------- -----------------------------------
  **Library**                         Navigates to Welcome and shows the
                                      Library panel. If already on
                                      Welcome, it may toggle the panel
                                      open/collapsed. It does not delete
                                      or silently discard the active
                                      syllabus.

  **Import**                          Shows the Import page. Preserve the
                                      active syllabus and tree context so
                                      the student can return.

  **Settings**                        Shows the Settings page. Preserve
                                      the active syllabus and tree
                                      context.

  **Avatar**                          Opens a menu containing Settings
                                      and Sign out.
  -----------------------------------------------------------------------

On mobile, the side panel becomes a slide-in drawer or full-screen tree
view. When a node page is open, provide **← Back to tree**.

## 3.2 Routing table: click → result

### A. No syllabus open; Library state

  -----------------------------------------------------------------------
  Student action          Side panel              Main area
  ----------------------- ----------------------- -----------------------
  First successful        Library                 Welcome page
  sign-in with no prior                           
  syllabus                                        

  Return after prior use  Explorer for that       Syllabus Overview
  with a valid last-used  syllabus                
  syllabus                                        

  Click Library while on  Library, opened or      Welcome remains
  Welcome                 collapsed according to  selected
                          panel state             

  Click **Import          Existing panel state    Import page
  syllabus** or Import    preserved               
  icon                                            

  Click **Create          Library remains until   Name dialog; after
  manually**              creation succeeds       creation, Explorer +
                                                  new Syllabus Overview

  Click a syllabus row    Explorer for that       Syllabus Overview
                          syllabus                

  Click Settings          Existing panel state    Settings page
                          preserved               
  -----------------------------------------------------------------------

### B. A syllabus is open; Explorer state

  -----------------------------------------------------------------------
  Student action          Side panel              Main area
  ----------------------- ----------------------- -----------------------
  Click **← Back to       Library                 Welcome page
  Library**                                       

  Click syllabus title or Explorer                Syllabus Overview
  progress ring                                   

  Click subject name      Explorer; subject       Subject page
                          highlighted             

  Click chapter name      Explorer; chapter       Chapter page
                          highlighted             

  Click topic name        Explorer; topic         Topic page
                          highlighted             

  Click attachment name   Explorer; attachment    File preview page
                          highlighted             

  Click row chevron       Branch                  Current main page
                          expands/collapses       remains unchanged

  Click row checkbox      Checkbox and progress   Current main page
                          figures update          remains unchanged

  Click                   Explorer                Corresponding node page
  paperclip/material                              with Materials tab
  shortcut                                        selected

  Click Import            Explorer context        Import page
                          preserved               

  Click Settings          Explorer context        Settings page
                          preserved               

  Delete selected node    Explorer updates        Navigate to surviving
                                                  parent page; if the
                                                  deleted node was a
                                                  subject, show Syllabus
                                                  Overview

  Delete selected         Explorer updates        If previewing that
  attachment                                      attachment, return to
                                                  its owning node's
                                                  Materials tab
  -----------------------------------------------------------------------

### C. Tabs on node pages

Subject, chapter, and topic pages share the same tabs:

  Tab             Main-area content
  --------------- --------------------------------
  **Overview**    Tracker or topic overview
  **Materials**   Attachments and text materials
  **Notes**       Optional notes editor
  **Ask AI**      Optional AI assistant
  **Practice**    Optional practice questions

Open a node on Overview by default. Switching tabs updates the URL query
parameter where appropriate. Switching to another node may preserve the
active tab if that tab is valid for the new node; otherwise, return to
Overview. Only the selected tab's content is active. Do not lose unsaved
edits when switching tabs or nodes.

## 3.3 Welcome page (no syllabus open)

**Shown when:** The user enters the workspace without an active
syllabus, or chooses Back to Library.

  -----------------------------------------------------------------------
  Block                               Content
  ----------------------------------- -----------------------------------
  Heading                             "Welcome back, \[name\]" where a
                                      display name exists

  Continue where you left off         Last-used syllabus name, overall
                                      progress, last-opened date, and
                                      **Continue**

  Start actions                       **Import a syllabus** and **Create
                                      manually**

  Recent list                         Up to five recent syllabuses with
                                      progress

  First-time empty state              "No syllabus yet. Import one, or
                                      start with a single subject.
                                      Uploading files is optional." with
                                      Import and Create manually actions
  -----------------------------------------------------------------------

If no valid last-used syllabus exists, omit the Continue card or provide
a clear empty state. Do not show fabricated dates or progress.

## 3.4 Import syllabus page

**Flow:** Choose input → Scan → Review draft → Save. No syllabus is
created until the student confirms Save.

  -----------------------------------------------------------------------
  Step                                Content
  ----------------------------------- -----------------------------------
  **1. Choose input**                 Tabs for **Paste text** and
                                      **Upload file**. Paste text should
                                      be implemented first if that is the
                                      initial supported path. List only
                                      file formats for which a working
                                      text extractor exists.

  **2. Scan**                         **Scan** is disabled until usable
                                      input exists. Show progress and
                                      **Cancel** while scanning.

  **3. Review draft**                 Editable draft tree supporting
                                      rename, move, delete, and add.
                                      Banner: "This is a draft. Check it
                                      before saving."

  **4. Save**                         Syllabus name field and **Save to
                                      workspace**. On success, create a
                                      new syllabus, open it in Explorer,
                                      and show its Overview.

  **Discard**                         **Discard draft** with confirmation
                                      if there are edits to lose.
  -----------------------------------------------------------------------

**Failure state:** "We couldn't read text from this file." Offer **Paste
text instead** and **Create manually**. Never invent syllabus topics
based only on a file name.

**Empty state:** Explain the accepted input types and offer Create
manually.

**Save failure:** Keep the draft and entered name. Show a plain-language
error and Retry. Do not create duplicate syllabuses on repeated
submissions.

**Important capability distinction:**

-   **Upload/store:** The file can be saved as a material.
-   **Preview:** The application can render or display the file type.
-   **Extract text:** A supported extractor can read its text.
-   **OCR:** An OCR capability is available for image-based content.
-   **Analyze/import:** A configured analysis pipeline can process
    extracted text.

These are separate capabilities. Do not imply that a file can be
imported or analyzed just because it can be uploaded.

## 3.5 Syllabus Overview page

**Shown when:** A syllabus opens, its title/progress ring is selected,
or no individual node is selected within the open syllabus.

  -----------------------------------------------------------------------
  Block                               Content
  ----------------------------------- -----------------------------------
  Title                               Syllabus name, editable through its
                                      menu, with overall progress ring

  Summary                             For example, "42% complete · 31 of
                                      74 topics done", calculated from
                                      actual descendant topics

  Subject cards                       One card per subject with name,
                                      progress bar, percentage, and
                                      completed/total topic count.
                                      Selecting a card opens its Subject
                                      page.

  Actions                             **Add subject**, **Expand all**,
                                      **Collapse all**

  Hint                                When useful: "Select a topic in the
                                      sidebar to see its materials and
                                      notes."

  Empty syllabus                      "This syllabus is empty. Add your
                                      first subject." with **Add
                                      subject**
  -----------------------------------------------------------------------

Progress values must be calculated from saved completion states, not
hard-coded. Define the empty-syllabus progress behavior consistently
(for example, show "No topics yet" instead of a misleading 0% completion
ring).

## 3.6 Subject page

**Example:** Mathematics. Tabs: Overview, Materials, Notes, Ask AI,
Practice.

### Overview tab

  -----------------------------------------------------------------------
  Block                               Content
  ----------------------------------- -----------------------------------
  Header                              Breadcrumb, title, status pill (Not
                                      started / In progress / Complete),
                                      **Mark all complete**, and node
                                      menu

  Progress                            Ring or bar and completed/total
                                      topic count

  Chapters card                       Each chapter row has a derived
                                      three-state checkbox, name, mini
                                      progress bar, and percentage.
                                      Clicking the name opens the Chapter
                                      page.

  Subject materials card              Dropzone, **Upload file**, **Add
                                      text**, and list of files attached
                                      directly to this subject

  Notes row                           Collapsed "Notes (optional)"
                                      summary
  -----------------------------------------------------------------------

Bulk completion behavior and confirmation rules are defined in
`Buttons.md`. The page must reflect the actual saved state after the
operation; if saving fails, show the failure and preserve recoverable
input.

## 3.7 Chapter page

**Example:** Calculus. Same shared tabs and header pattern as the
Subject page.

  -----------------------------------------------------------------------
  Block                               Content
  ----------------------------------- -----------------------------------
  Header                              Breadcrumb such as "Mathematics ›
                                      Calculus", title, status pill,
                                      **Mark all complete**, and node
                                      menu

  Topics card                         Completed/total count, progress
                                      bar, and every topic with a
                                      checkbox, name link, and paperclip
                                      indicator when materials exist

  Chapter materials card              Dropzone and **Upload file** /
                                      **Add text**. List materials
                                      attached directly to the chapter
                                      with type, size, and status where
                                      applicable

  Notes row                           Collapsed "Notes (optional)"
                                      summary
  -----------------------------------------------------------------------

Toggling a topic checkbox updates the tree and visible progress promptly
after the change is accepted. The topic page does not need to open.

**Attachment rule:** A file attached to a chapter remains attached to
that chapter. It is not silently copied to its topics. Material analysis
may suggest related topics, but it must not move or attach anything
automatically.

## 3.8 Topic page

**Example:** Differentiation. A topic is a leaf in the syllabus tree.

### Overview tab

  -----------------------------------------------------------------------
  Block                               Content
  ----------------------------------- -----------------------------------
  Header                              Breadcrumb, topic title, rounded
                                      completion checkbox, status pill
                                      (Not completed / Completed), **Mark
                                      complete / Mark not complete**, and
                                      node menu

  Empty state                         "Nothing added yet, and that's
                                      fine." Explain that the topic can
                                      be used as a simple checklist.
                                      Offer **Upload file**, **Add
                                      text**, and **Write notes**
                                      (optional).

  After content is added              Short summaries such as "2 files",
                                      "1 text", or "Notes: 120 words",
                                      each opening the relevant tab

  Optional shortcut                   **Ask AI about this topic**, only
                                      if AI is configured
  -----------------------------------------------------------------------

A topic can be marked complete without any notes, files, or AI use.
Materials and AI must never automatically change its completion state.

## 3.9 Shared node tabs

### Materials tab

-   Header: **Materials**, **Upload file**, and **Add text**.
-   Dropzone for drag-and-drop where supported.
-   Material list fields: type, title, size where meaningful, date
    added, and capability/status indicators.
-   Possible statuses include Uploaded, Text extraction supported, Text
    extraction failed, OCR unavailable, Analysis requested, Analysis
    completed, and Analysis failed. Only display statuses relevant to
    that material.
-   Row actions may include Open/Preview, Download, Rename, Move,
    Delete, and Analyze material. Enable each action only when its
    prerequisites are satisfied.
-   Empty state: "No materials here. Add a file or paste text. Uploading
    is always optional."
-   Notice: "Only upload material you have permission to store."

**Capability rules:**

-   Unsupported preview formats may still support file management and
    download.
-   Analyze is available only when a supported analysis path exists.
-   If extraction fails, explain that the file may still be stored or
    downloaded.
-   Do not label a file "analyzed" merely because it was uploaded.

### Notes tab

-   Simple editor with a clear save state: **Saving...**, **Saved**,
    **Couldn't save**, or **Unsaved changes**.
-   Empty state: "No notes yet. Write anything you like, or leave this
    blank."
-   **Clear notes** requires confirmation.
-   If an AI draft exists, show **Insert into notes**, **Edit first**,
    and **Discard**.
-   An AI draft never silently overwrites existing notes.
-   On a save failure, preserve the editor contents and offer Retry.
    Never show Saved until persistence is confirmed.

### Ask AI tab --- optional

-   Context line showing the selected node path, e.g. "Asking about:
    Mathematics › Calculus › Differentiation", plus the student's study
    context if provided.
-   Quick actions: **Explain**, **Simplify**, **Give an example**.
-   Message box and **Send**.
-   **Generate notes**, which creates a draft rather than overwriting
    notes.
-   **Use my materials** toggle, off by default, with a clear
    explanation that selected content may be sent to the configured AI
    provider.
-   Conversation controls: **Copy**, **Retry**, **Stop**, **Clear
    conversation**.
-   Honest-scope note: answers may use general knowledge and are not
    guaranteed to come from the student's files.
-   **AI unavailable state:** "AI is not available right now. Your tree,
    files, and notes still work." Disable AI controls without disabling
    core StudyOS functionality.

Do not send material to an AI provider unless the student explicitly
triggers an AI action and any relevant material-use choice is respected.

### Practice tab --- optional

-   **Generate practice**, with question count/type controls only if
    implemented.
-   Optional **Use a material as context** control, available only if a
    supported path exists.
-   Question card with answer field and **Submit answer**.
-   Feedback panel explaining what was correct, what was missing, and
    how to improve.
-   **Next**, **Previous**, **Try again**, **View past sets**, and
    **Delete practice set**, only when the relevant feature is
    implemented.
-   Empty state: "No practice yet. Generate a few questions for this
    topic."
-   Same AI-unavailable behavior as Ask AI.
-   Practice feedback is a study aid. It does not change topic
    completion or claim to measure mastery.

## 3.10 File preview page

**Shown when:** The student opens an attachment from the tree or from a
Materials list.

  -----------------------------------------------------------------------
  Block                               Content
  ----------------------------------- -----------------------------------
  Header                              **← Back to \[owning node\]**,
                                      title, type badge, size and upload
                                      date where available

  File actions                        Download, Rename, Move, Analyze,
                                      and Delete, each enabled only when
                                      supported and authorized

  Preview area                        PDF viewer, image viewer, or text
                                      view for supported formats.
                                      Unsupported formats show a clear
                                      explanation and Download when
                                      available.

  Status panel                        Preview/extraction status, analysis
                                      status, and an OCR quality note
                                      when relevant

  Analysis results                    Display only after the student
                                      explicitly requests Analyze and
                                      results are returned
  -----------------------------------------------------------------------

Analysis results may include possible related topics, a short
explanation, **Open suggested topic**, optional **Attach to this topic
too**, and **Dismiss**. Clearly label these as suggestions---not
syllabus coverage, completion, or mastery. Never attach or move a
material without an explicit student action.

If the text cannot be read, say so and offer **Add text manually** or
another supported fallback.

Deleting the attachment while previewing it returns the student to its
owning node's Materials tab. If the attachment no longer exists, show a
not-found state and a safe return action.

## 3.11 Text material view

For pasted or typed text, show its title and content, with **Edit**,
**Rename**, **Move**, **Delete**, and **Analyze** where supported. Use
the same status, failure, and authorization principles as the file
preview page.

## 3.12 Settings page (`/settings`)

  -----------------------------------------------------------------------
  Section                             Content
  ----------------------------------- -----------------------------------
  Profile                             Display name and **Save**

  Study context                       Optional category (School / Board /
                                      Competitive exam / Other), class or
                                      exam name, and preferred language
                                      if supported

  AI                                  Status "Available" or "Not
                                      available", based on real
                                      configuration. Explain that AI is
                                      optional and runs only when the
                                      student requests an AI action.

  Account                             Signed-in email, **Sign out**, and
                                      **Delete account** only when
                                      account deletion is implemented and
                                      ready for use
  -----------------------------------------------------------------------

Account deletion is destructive and must require a clear confirmation.
Before public launch, account deletion must have a defined, tested
behavior for the account's stored data. Never display a control that
appears functional if it is not implemented.

------------------------------------------------------------------------

# PART 4 --- SHARED STATES AND FAILURE HANDLING

  -----------------------------------------------------------------------
  State                               Required behavior
  ----------------------------------- -----------------------------------
  **Loading**                         Show skeletons or a small spinner.
                                      Never leave a blank screen. Load
                                      the syllabus tree without waiting
                                      for AI or file analysis.

  **Empty**                           Explain what the student can do
                                      next and provide a relevant action.

  **Error**                           Use plain language, preserve the
                                      user's input where possible, and
                                      offer Retry when retrying is safe.

  **Offline / network loss**          Show "You're offline. Changes may
                                      not be saved." Do not show false
                                      Saved states.

  **Unsaved changes**                 Keep current edits where possible.
                                      Warn before an action that would
                                      discard them. Clearly distinguish
                                      local unsaved content from
                                      server-saved content.

  **Unauthorized / expired session**  Redirect to sign-in or show a
                                      session-ended prompt. Server-side
                                      authorization remains mandatory.

  **Not found**                       If a node, syllabus, or attachment
                                      no longer exists, say "This item no
                                      longer exists" and offer a safe
                                      return to the parent or Syllabus
                                      Overview.

  **AI unavailable**                  Disable AI-specific controls and
                                      explain that the tree, materials,
                                      and notes remain usable.

  **Save conflict**                   If another update has made the
                                      saved version stale, avoid silently
                                      overwriting it. Explain the
                                      conflict and offer a safe reload or
                                      recovery path.

  **Repeated submission**             Prevent accidental duplicate
                                      account actions, uploads, or
                                      syllabus creation where practical.
  -----------------------------------------------------------------------

### 4.1 Persistence expectations

-   Show **Saved** only after the server confirms persistence.
-   When a save fails, preserve the current editor/draft state and
    provide Retry.
-   Define unsaved-change handling separately for notes, tree edits, and
    import drafts.
-   Do not promise offline editing or automatic recovery unless those
    capabilities are implemented and tested.

------------------------------------------------------------------------

# PART 5 --- RESPONSIVE BEHAVIOR AND ACCESSIBILITY

  -----------------------------------------------------------------------
  Screen                              Layout
  ----------------------------------- -----------------------------------
  **Desktop (wide)**                  Activity bar, side panel, and main
                                      area visible together.

  **Tablet**                          Side panel may collapse to the icon
                                      rail; main area takes the available
                                      width.

  **Mobile**                          One main view at a time. The tree
                                      is shown as a full-screen view or
                                      drawer; selecting a node opens its
                                      page with **← Back to tree**.
                                      Activity navigation becomes a
                                      bottom bar or drawer.
  -----------------------------------------------------------------------

Additional requirements:

-   Tree drag-and-drop must have a menu or keyboard alternative.
-   All interactive controls must be keyboard reachable and have clear
    focus indicators.
-   Use accessible labels for icon-only buttons and meaningful names for
    form fields.
-   Do not rely on color alone to communicate completion or status.
-   Respect reduced-motion preferences.
-   On small screens, avoid forcing the tree and the node tools into
    cramped side-by-side columns.
-   Dialogs must manage focus, support keyboard use, and return focus to
    the invoking control when closed.

------------------------------------------------------------------------

# PART 6 --- URL AND PAGE SUMMARY

  --------------------------------------------------------------------------------------------
  Route                                        Page                    Access
  -------------------------------------------- ----------------------- -----------------------
  `/`                                          Landing                 Public

  `/sign-up`                                   Sign up                 Public

  `/sign-in`                                   Sign in                 Public

  `/forgot-password`                           Forgot password         Public, only if
                                                                       configured

  `/setup`                                     First-time setup        Signed in; shown once
                                                                       per account

  `/workspace`                                 Welcome / Library state Signed in

  `/workspace/import`                          Import page             Signed in

  `/workspace/s/:syllabusId`                   Syllabus Overview       Signed in, owner only

  `/workspace/s/:syllabusId/n/:nodeId`         Subject / Chapter /     Signed in, owner only
                                               Topic page; `?tab=`     
                                               selects a supported tab 

  `/workspace/s/:syllabusId/f/:attachmentId`   File preview            Signed in, owner only

  `/settings`                                  Settings                Signed in
  --------------------------------------------------------------------------------------------

### URL and authorization rules

-   The URL must represent the current syllabus and selected node or
    attachment where relevant.
-   A node tab may be represented with a query parameter, for example
    `?tab=materials`.
-   Refreshing a valid URL restores the same content page and tab where
    possible.
-   Browser Back/Forward navigates between addressable pages without
    silently discarding unsaved edits.
-   Every private route and API request verifies that the signed-in user
    owns the referenced syllabus, node, and attachment.
-   A guessed or modified ID must never reveal another student's data.
-   Client-side route guards improve user experience but do not replace
    server-side authorization.

------------------------------------------------------------------------

# PART 7 --- QUICK REFERENCE: "I CLICKED X, WHAT CHANGED?"

``` text
Library icon ........... main = Welcome; Library panel shown/opened
Import icon ............ main = Import page; syllabus context preserved
Settings icon .......... main = Settings page; syllabus context preserved
Syllabus row ........... Explorer opens; main = Syllabus Overview
← Back to Library ...... Library panel + Welcome; syllabus is not deleted
Subject name ........... main = Subject page
Chapter name ........... main = Chapter page
Topic name ............. main = Topic page
Attachment name ........ main = File preview
Chevron ................ branch opens/closes; main page unchanged
Checkbox ............... completion and progress update; main page unchanged
Paperclip shortcut ..... owning node page opens on Materials
Node tab ................ only selected tab content changes
Delete selected node ... tree updates; main falls back to surviving parent
Delete previewed file .. returns to owning node's Materials tab
```

------------------------------------------------------------------------

# PART 8 --- OUT OF SCOPE FOR V1

Do not add pages or imply support for:

-   Exam mode
-   "Teach me" or "I don't understand" modes as separate product
    workflows
-   Study sessions
-   Revision scheduler or study planner
-   XP, streaks, badges, or leaderboards
-   Predicted marks
-   Mastery or coverage scores
-   Prerequisite graph
-   Teacher, parent, or classroom pages
-   LMS integrations
-   Public sharing pages

These features should remain out of the v1 interface unless the product
specification is explicitly updated.

------------------------------------------------------------------------

# PART 9 --- IMPLEMENTATION HANDOFF CHECKLIST

Before calling the page implementation complete, verify:

-   [ ] Landing and authentication pages reflect actual configured
    capabilities.
-   [ ] First-time setup is skippable and is not shown on every login.
-   [ ] Returning users reopen a valid last-used syllabus; otherwise
    they see Welcome.
-   [ ] Library, Import, Settings, and Back navigation follow the rules
    in Part 0.
-   [ ] Subject, chapter, and topic pages share a consistent tab model.
-   [ ] Checkbox state and progress totals agree throughout the UI.
-   [ ] Materials are attached to their actual owning node and are not
    silently duplicated.
-   [ ] Upload, preview, extraction, OCR, and analysis capabilities are
    presented separately.
-   [ ] Save failures preserve recoverable edits and never display false
    success.
-   [ ] AI features are optional and do not block core study
    functionality.
-   [ ] Private routes and server requests enforce account ownership.
-   [ ] Desktop, tablet, mobile, keyboard navigation, and focus behavior
    are tested.
-   [ ] No out-of-scope v1 feature is presented as implemented.
