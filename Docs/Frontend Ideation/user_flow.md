# StudyOS --- User Flows (Student Perspective)

> **Purpose:** Describes what students do in StudyOS, from opening the
> link through study sessions and returning later. It defines proposed
> student types, their goals, step-by-step journeys, what they may
> ignore, and what the product must get right.
>
> **Companion files:** `Pages.md` describes page content, layout,
> states, and navigation. `Buttons.md` defines individual controls and
> their behavior. References such as `[3.20]` refer to numbered controls
> in `Buttons.md`; references such as *Pages 3.7* refer to `Pages.md`.
>
> **Source of truth:** `Pages.md` (updated 25 October 2026) governs page
> structure, navigation, sign-in routing, and page states. `Buttons.md`
> governs control-level behavior where it does not conflict with
> `Pages.md`. If this file conflicts with either companion file, follow
> `Pages.md` for page/navigation behavior and `Buttons.md` for control
> behavior, then update this file to match.
>
> **Product scope:** Follows `StudyOS.md` v1. This document
> distinguishes the **core v1 launch path** from
> **configuration-dependent/optional v1 capabilities** and **later
> work**. No exam mode, revision scheduler, study planner, mastery
> scores, gamification, or classroom roles.
>
> **Honesty note:** The personas below are proposed design hypotheses,
> not research findings. No student interviews have been completed.
> Validate them with real students after a working build exists (Part
> 11).
>
> **Last updated:** 25 October 2026

------------------------------------------------------------------------

## 0. The One Idea Every Student Shares

Whatever the student type, the central loop is:

``` text
Open link → Sign up/in → Get a syllabus into a tree → Open a node → Tick a topic complete
                                                         └─ (optionally) attach files / write notes / ask AI
```

The tree and checklist are the product. Files, notes, and AI are
optional extras. A student who only creates a tree and ticks topics is a
complete, valid StudyOS user.

### Student types covered

  -----------------------------------------------------------------------
  \#                Type              Short name        Core need
  ----------------- ----------------- ----------------- -----------------
  A                 Small syllabus:   **The Manual      Quickly build a
                    tuition, one      Tracker**         small tree by
                    competitive exam,                   hand and tick it
                    or short course                     off

  B                 Semester/finals   **The Semester    Import a
                    student with many Planner**         syllabus, keep
                    subjects                            semesters
                                                        separate, and
                                                        track subject
                                                        progress

  C                 Notes-first       **The Collector** Keep files,
                    student                             photos, and
                                                        written notes
                                                        beside the right
                                                        topic

  D                 AI-curious        **The             Get an
                    student           Helper-Seeker**   explanation or
                                                        practice when
                                                        stuck, only when
                                                        they choose

  E                 Returning student **The Returner**  Pick up where
                                                        they left off

  F                 Phone-first       **The Mobile      Use the same core
                    student           Student**         experience on a
                                                        small screen
  -----------------------------------------------------------------------

One real student may fit multiple types. For example, a B.Tech student
may be a Semester Planner, a Collector, and a Helper-Seeker at different
times.

**Evidence boundary:** These types help guide design and testing. They
must not be described as validated market segments or research findings
until actual research supports that claim.

------------------------------------------------------------------------

# PART 1 --- THE SHARED FIRST JOURNEY

## Step 1. Opens the link

**Page:** Landing (*Pages 1*).

The student may arrive through a friend's message, a classmate, a
college group, or search. They are asking: "What is this, and is it for
me?"

  -----------------------------------------------------------------------
  Question                            What the page should show
  ----------------------------------- -----------------------------------
  What is it?                         Headline: "Your syllabus, as a tree
                                      you actually use."

  What do I get?                      Three concise benefits: track
                                      completion, keep files and notes
                                      together, use AI when chosen

  Does it look real?                  A truthful product preview showing
                                      the tree, three-state checkboxes,
                                      and chapter tracker

  Do I need AI or files?              Clearly state that both are
                                      optional

  Is my data safe?                    A short, accurate privacy
                                      statement: workspace data is tied
                                      to the account; AI use is optional
  -----------------------------------------------------------------------

**Student actions:** Clicks **Get started** `[1.4]` if new, or **Sign
in** `[1.2]` if they already have an account.

**Potential drop-off:** Confusing copy, a fake-looking dashboard, too
many feature cards, or forcing sign-in before explaining the product.
Keep the landing page short and show the actual interface rather than an
invented product state.

## Step 2. Creates an account

**Page:** Sign up (*Pages 2.1*).

  -----------------------------------------------------------------------
  Path                    Student action          Expected result
  ----------------------- ----------------------- -----------------------
  Google                  Clicks **Continue with  A real configured OAuth
                          Google** `[2.2]`,       flow
                          selects an account, and creates/authenticates
                          returns                 the account

  Email                   Enters email and        Better Auth
                          password, clicks        creates/authenticates
                          **Create account**      the account
                          `[2.3]`                 
  -----------------------------------------------------------------------

The Google button is shown **only when Google OAuth is configured and
usable**. Otherwise, show the email path without a broken decorative
button.

**Failure states:** - Google flow cancelled: return to sign-up with a
clear cancellation message. - Google unavailable/configuration failure:
explain that Google sign-in is unavailable and offer email sign-up. -
Email already registered: explain that an account exists and link to
Sign in. - Invalid email or weak password: show a field-level message. -
Prevent repeated submissions from creating duplicate accounts or
duplicate requests.

Do not expose secrets or provider configuration details to the student.

## Step 3. Optional first-time setup

**Page:** First-time setup (*Pages 2.4*).

The student may enter a display name, choose a category (**School ·
Board · Competitive exam · Other**), and enter a class, course, or exam
name. They can choose **Continue** or **Skip for now**.

  -----------------------------------------------------------------------
  Student type                        Possible choice
  ----------------------------------- -----------------------------------
  Manual Tracker                      School or Competitive exam;
                                      e.g. "Class 12" or "JEE"

  Semester Planner                    Other; e.g. "B.Tech CSE, Year 1"

  Collector                           May skip

  Impatient student                   Skips without losing access to the
                                      core product
  -----------------------------------------------------------------------

These fields may personalize AI replies if that capability is
configured. They must not block tree creation or tracking.

**Routing state:** The account needs an explicit persistent setup state,
such as `pending`, `completed`, or `skipped`. After Continue or Skip,
store the corresponding state. On later logins, do not show setup again
for accounts marked `completed` or `skipped`. If setup is still
`pending`, route to `/setup` before opening the workspace. Refreshing or
signing in on another device must not reset this state.

## Step 4. First arrival in an empty workspace

**Page:** Welcome / empty Library state (*Pages 3.3*).

The student sees the workspace navigation, an empty **Syllabuses** list,
and a clear message such as:

> No syllabus yet. Import one, or start with a single subject. Uploading
> files is optional.

The two main choices are:

1.  **Import syllabus** --- useful for students who already have
    syllabus text or a supported file.
2.  **Create manually** --- useful for students who want to enter a few
    subjects and topics.

The decision should be simple: "Do I already have my syllabus as text or
a supported file, or will I type a few topics?"

------------------------------------------------------------------------

# PART 2 --- FLOW A: THE MANUAL TRACKER

## Who they are

A student with a small syllabus: tuition, coaching chapters, a
competitive-exam chapter list, or a short certification. Example: Riya,
a Class 12 student tracking Physics and Chemistry topics before a weekly
test.

## What they want

-   See what they need to cover without learning a complicated tool.
-   Build a small tree in a few minutes.
-   Tick topics and see progress update.

## What they may ignore

AI, file uploads, practice, and notes. These must not be required.

## Step-by-step flow

  --------------------------------------------------------------------------
  \#                Student action     Screen/control    Expected product
                                                         behavior
  ----------------- ------------------ ----------------- -------------------
  A1                Clicks **Create    Library/dialog    Opens the
                    manually** `[3.9]`                   create-syllabus
                                                         dialog

  A2                Enters "Class 12   Dialog            Creates one empty
                    Tuition" and                         syllabus and opens
                    clicks **Create**                    its
                                                         Explorer/Overview

  A3                Clicks **+ Add     Tree              Adds a row in edit
                    subject** `[3.16]`                   mode

  A4                Types "Physics"    Tree              Saves the subject;
                    and presses Enter                    the row appears in
                                                         the tree

  A5                Chooses **Add      Tree              Adds a child row in
                    child** `[3.27]`                     edit mode
                    from the row's add                   
                    menu `[3.22]`                        

  A6                Types              Tree              Saves the chapter
                    "Electrostatics"                     
                    and presses Enter                    

  A7                Adds "Coulomb's    Tree              Creates leaf topics
                    Law", "Electric                      with completion
                    Field", and                          controls
                    "Gauss's Law" as                     
                    child topics                         

  A8                Repeats the        Tree              Adds another
                    process for                          subject and its
                    Chemistry                            chapters/topics

  A9                Uses **Add         Tree              Creates a sibling
                    sibling** `[3.28]`                   at the correct
                    for additional                       hierarchy level
                    chapters/topics                      

  A10               Ticks a topic      Tree checkbox     Saves completion
                    `[3.20]`                             and updates
                                                         ancestor
                                                         state/progress
                                                         without a full-page
                                                         reload

  A11               Opens a chapter    Chapter page      Shows a checklist
                                       (*Pages 3.7*)     of its topics;
                                                         topics can be
                                                         ticked directly
                                                         here `[3.55]`

  A12               Completes all      Checklist/tree    Parent state
                    topics in a                          becomes complete;
                    chapter                              **Mark all
                                                         complete** `[3.52]`
                                                         is an optional
                                                         shortcut

  A13               Opens Syllabus     Overview          Sees overall and
                    Overview (*Pages                     subject progress,
                    3.5*)                                such as "42%
                                                         complete · 31 of 74
                                                         topics done"
  --------------------------------------------------------------------------

### Progress calculation rule

Progress is based on **completed leaf topics**, not on counting subjects
or chapters as additional completed items. For a non-empty syllabus:

`progress = completed leaf topics ÷ total leaf topics × 100`

Display rounding consistently. For example, 31 completed topics out of
74 total is approximately 41.9%, displayed as **42%**. Parent checkboxes
are derived from descendant topic states: unchecked if none are
complete, partial if some are complete, and checked if all are complete.
A parent bulk action must have clearly defined behavior and update
descendant leaves consistently.

For an empty syllabus, show **"No topics yet"** rather than a misleading
0% progress ring. A syllabus with subjects but no leaf topics must
follow the same empty-topic rule.

## What success looks like

-   The tree resembles the student's actual syllabus.
-   Typing and adding nodes is fast.
-   Ticking a topic visibly changes the progress figure.
-   The student can quickly identify unticked topics.

## Requirements derived from this flow

1.  Add-child and add-sibling must support keyboard-first entry: type,
    Enter, continue. Do not require a dialog for every node.
2.  Completion and parent states update promptly and persist safely.
3.  Empty topic pages make it clear that materials and notes are
    optional.
4.  Rename and reorder actions make mistakes cheap to fix (e.g. F2 and
    Move up/down `[3.31, 3.33]`, if specified in `Buttons.md`).
5.  Bulk creation by pasting a list is a **later candidate**, not a v1
    requirement unless added to the approved product spec.

**Success moment:** The student ticks a topic and sees their subject
progress move. No streak, badge, or score is needed.

------------------------------------------------------------------------

# PART 3 --- FLOW B: THE SEMESTER PLANNER

## Who they are

A university or board student with multiple subjects and a syllabus
supplied as text or a PDF. Example: a B.Tech CSE student managing First
Year and Second Year syllabuses with subjects such as DSA, Digital
Electronics, Operating Systems, and Physics.

## What they want

-   Bring in a syllabus without retyping it all.
-   Keep each semester or year as a separate syllabus.
-   See subject-wise completion.
-   Attach material to the appropriate subject, chapter, or topic.

## Step-by-step flow: importing

  -----------------------------------------------------------------------
  \#                Student action    Screen/control    Expected product
                                                        behavior
  ----------------- ----------------- ----------------- -----------------
  B1                Clicks **Import   Library           Opens Import
                    syllabus**                          (*Pages 3.4*)
                    `[3.8]`                             

  B2                Chooses **Paste   Import page       Offers only input
                    text** `[3.41]`                     formats with a
                    or **Upload                         working, tested
                    file** `[3.40]`                     text-extraction
                                                        path

  B3                Pastes syllabus   Text box          Enables **Scan**
                    text                                `[3.43]` when
                                                        input is valid

  B4                Clicks **Scan**   Import page       Shows progress
                                                        and creates a
                                                        draft tree

  B5                Reviews the draft Review tree       Clearly labels it
                                                        as a draft that
                                                        must be checked
                                                        before saving

  B6                Renames headings, Review tree       Allows correction
                    deletes                             using supported
                    duplicates, moves                   tree-editing
                    topics, or adds                     controls
                    missing entries                     
                    `[3.45a]`                           

  B7                Enters "First     Import page       Creates a new
                    Year Syllabus"                      syllabus, opens
                    and clicks **Save                   it in Explorer,
                    to workspace**                      and shows its
                    `[3.45b]`                           Overview

  B8                Repeats for       Import            Adds a second
                    "Second Year      page/Library      separate syllabus
                    Syllabus"                           without changing
                                                        the first
  -----------------------------------------------------------------------

**If scanning fails:** Show "We couldn't read text from this file."
Offer **Paste text instead** or **Create manually**. Never invent topics
from a filename or silently present an unreadable file as successfully
imported.

**If saving fails:** Preserve the draft tree and entered syllabus name
for recovery, show a plain-language error, and offer Retry. Repeated
clicks must not create duplicate syllabuses; use a reliable idempotency
or equivalent duplicate-prevention strategy.

**File capabilities are distinct:** upload, preview, text extraction,
OCR, and semantic analysis are separate capabilities. A file being
uploadable does not mean its contents can be extracted or analyzed. The
Upload file tab lists only file types for which import extraction is
implemented and tested.

## Step-by-step flow: studying across the term

  -----------------------------------------------------------------------
  \#                Student action    Screen/control    Expected product
                                                        behavior
  ----------------- ----------------- ----------------- -----------------
  B9                Opens the Library Library           Opens that
                    and selects                         syllabus in
                    "First Year                         Explorer and
                    Syllabus"                           shows its
                                                        Overview

  B10               Selects           Tree              Subject page
                    "Operating                          shows chapters
                    Systems"                            and their
                                                        progress (*Pages
                                                        3.6*)

  B11               Opens "Process    Tree              Chapter page
                    Scheduling"                         shows its topic
                                                        checklist and
                                                        Materials area
                                                        (*Pages 3.7*)

  B12               Ticks topics      Chapter checklist Progress updates
                    covered in class                    promptly and
                                                        persists

  B13               Drops a lecture   Tree/drop target  Attaches the file
                    PDF onto the                        to the chapter as
                    chapter `[3.58]`                    a whole

  B14               Opens "Round      Topic page        The worksheet
                    Robin" and                          remains attached
                    attaches a                          to that topic
                    worksheet                           

  B15               Reviews the tree  Tree/Overview     Sees which topics
                    before finals                       remain incomplete
                                                        without readiness
                                                        predictions

  B16               Optionally uses   Node tabs         Follows Flow D
                    Practice or Ask                     only when that
                    AI                                  capability is
                                                        configured
  -----------------------------------------------------------------------

## Requirements derived from this flow

1.  Import must be review-before-save.
2.  Paste-text import should be a dependable path; file extraction is
    offered only when implemented and tested.
3.  An account can own multiple syllabuses, each with its own tree and
    progress.
4.  Files may attach at any supported node level; large files need not
    be split into topic-sized pieces.
5.  Progress means completion, not mastery or exam readiness.
6.  StudyOS does not prescribe what to study today; the student decides.

**Success moment:** The student turns messy syllabus text into a
reviewable tree, fixes it, and tracks completion over the term.

------------------------------------------------------------------------

# PART 4 --- FLOW C: THE COLLECTOR (MATERIALS AND NOTES)

## Who they are

A student collecting teacher PDFs, slides, whiteboard photos,
screenshots, and pasted snippets. Their main problem is finding the
right material beside the right topic.

## What they want

-   Keep materials beside the relevant syllabus node.
-   Store a file without being forced to analyze it.
-   Optionally add short notes.

## Step-by-step flow

  -------------------------------------------------------------------------
  \#                Student action    Screen/control    Expected product
                                                        behavior
  ----------------- ----------------- ----------------- -------------------
  C1                Opens an existing Explorer          Shows the tree
                    syllabus                            

  C2                Drops a PDF onto  Tree              Uploads and
                    a tree row                          attaches it to that
                                                        node, if the target
                                                        is supported; the
                                                        row shows an
                                                        attachment
                                                        indicator

  C3                Chooses **Upload  Node menu         Opens the file
                    file** `[3.29]`                     picker
                    from the node                       
                    menu                                

  C4                Selects one or    File picker       Uploads each
                    more photos                         selected file and
                                                        confirms success
                                                        only after both the
                                                        stored file and its
                                                        database record are
                                                        saved

  C5                Chooses **Add     Dialog            Saves a titled text
                    text** `[3.30]`                     material
                    and pastes an                       
                    explanation                         

  C6                Opens the node's  Node page         Lists materials
                    Materials tab                       with honest
                                                        type/status
                                                        information, size
                                                        where relevant, and
                                                        dates `[3.65–3.72]`

  C7                Opens a file row  Tree/materials    Opens File Preview
                                                        (*Pages 3.10*) for
                                                        supported previews;
                                                        otherwise offers
                                                        Download

  C8                Renames the       File Preview      Updates the display
                    display title                       title while
                    `[3.70]`                            preserving the
                                                        original
                                                        filename/metadata

  C9                Moves a file to   Move dialog       Moves it within the
                    another node                        same syllabus,
                    `[3.71]`                            subject to
                                                        ownership and
                                                        destination checks

  C10               Types in Notes    Notes tab         Autosaves with
                                                        truthful states
                                                        such as Saving...
                                                        and Saved `[3.84]`

  C11               Deletes a file    Confirmation      Deletes the file
                    `[3.72]`          dialog            record and stored
                                                        object only after
                                                        confirmation and
                                                        successful
                                                        authorization
  -------------------------------------------------------------------------

## Optional: Analyze a material

This is a **configuration-dependent/optional capability**, not part of
the core tracking path. It appears only when a working analysis path
exists for the selected file type.

1.  Opens the file and explicitly clicks **Analyze** `[3.79]`.
2.  The system processes the material only after that action---not on
    upload.
3.  Results appear as **Possible related topics**, clearly marked as
    suggestions.
4.  The student can choose **Open suggested topic** or **Dismiss**
    `[3.81–3.83]`.
5.  Nothing moves, attaches, or changes without an explicit student
    action.

If content cannot be read (for example, a scanned PDF without OCR),
explain the limitation and offer manual text entry where useful.

## Requirements derived from this flow

1.  Upload is storage only; it never triggers AI or analysis by itself.
2.  Statuses distinguish uploaded, extraction supported/failed, preview
    supported/unsupported, and OCR unavailable where applicable. Never
    imply every file can be read.
3.  Drag-and-drop, a menu action, and an accessible button should
    provide equivalent ways to attach files where supported.
4.  Materials can attach at any node level supported by the product.
5.  Show an accurate permission/privacy notice. Issue file access only
    after verifying the current user's ownership and authorization.
6.  Notes are optional. Prevent an older autosave from overwriting a
    newer edit; surface save failures and retain the text for retry
    where safely possible.

**Success moment:** The student opens a topic and finds the relevant
slides, whiteboard photo, and their own notes together.

------------------------------------------------------------------------

# PART 5 --- FLOW D: THE HELPER-SEEKER (OPTIONAL AI)

## Who they are

Any student who gets stuck on a topic and wants brief help. They may use
AI for a minute and then return to studying.

## What they want

-   An explanation connected to the selected topic.
-   A simpler explanation or example if needed.
-   Optional practice and feedback.
-   No AI interaction that takes over the product.

## Step-by-step flow

  -----------------------------------------------------------------------
  \#                Student action    Screen/control    Expected product
                                                        behavior
  ----------------- ----------------- ----------------- -----------------
  D1                Selects           Tree              Opens the topic
                    "Deadlock"                          page

  D2                Opens Ask AI or   Ask AI tab        Shows context
                    the configured                      such as "Asking
                    shortcut                            about: Operating
                    `[3.100]`                           Systems ›
                                                        Deadlock"; sends
                                                        no request yet

  D3                Clicks            Ask AI            Sends one
                    **Explain**                         explicit request
                    `[3.90]`                            with the topic
                                                        and available
                                                        relevant user
                                                        context

  D4                Clicks            Ask AI            Requests a
                    **Simplify**                        simpler
                    `[3.91]`                            explanation

  D5                Clicks **Give an  Ask AI            Requests an
                    example**                           example or worked
                    `[3.92]`                            example

  D6                Types a question  Message box       Shows the reply
                    and clicks                          in the
                    **Send** `[3.93]`                   conversation for
                                                        that node

  D7                Enables **Use my  Toggle            Lets the student
                    materials**                         select which
                    `[3.94]`                            material to
                                                        include; explains
                                                        that selected
                                                        content is sent
                                                        to the AI
                                                        provider; off by
                                                        default

  D8                Clicks **Generate Ask AI            Produces a
                    notes** `[3.95]`                    separate draft
                                                        with **Insert
                                                        into notes**,
                                                        **Edit first**,
                                                        and **Discard**
                                                        `[3.87–3.89]`;
                                                        never silently
                                                        overwrites
                                                        existing notes

  D9                Opens Practice    Practice          Generates a short
                    and clicks                          question set for
                    **Generate                          the selected
                    practice**                          topic
                    `[3.101]`                           

  D10               Answers and       Practice          Gives feedback on
                    clicks **Submit                     correctness,
                    answer**                            missing points,
                    `[3.104]`                           and possible
                                                        improvement

  D11               Decides whether   Checkbox          Only the
                    the topic is                        student's
                    complete                            explicit action
                                                        changes
                                                        completion
  -----------------------------------------------------------------------

## When AI is unavailable

Hide shortcuts that are defined to appear only when AI is configured.
Explain that AI is unavailable and that the tree, files, and notes still
work. Do not disable unrelated core functionality.

## When AI fails

For timeouts, rate limits, or invalid responses, show a plain-language
error and Retry `[3.97]` when appropriate. Preserve the student's typed
question or draft input where safe. Avoid duplicate requests from
repeated clicks.

## Requirements derived from this flow

1.  No AI request on routine actions such as tree navigation, ticking,
    note saving, or uploading.
2.  Send only the context required for the explicit request; do not send
    the whole account by default.
3.  Do not claim an answer came from the student's files unless the
    relevant file content was actually processed and sent.
4.  Keep generated notes separate until the student chooses to insert
    them.
5.  Practice feedback is a study aid, not a mastery score; it never
    changes completion state.

**Success moment:** The student understands a topic a little better and
chooses for themselves whether to tick it complete.

------------------------------------------------------------------------

# PART 6 --- FLOW E: THE RETURNER

## E1. Next day, same device

  -----------------------------------------------------------------------
  \#                      Student action          Expected behavior
  ----------------------- ----------------------- -----------------------
  E1.1                    Opens the link          Landing page; if the
                                                  session is valid,
                                                  navigation may offer
                                                  **Open workspace**

  E1.2                    Opens the workspace or  Apply the routing order
                          signs in                below

  E1.3                    Uses **Back to          Shows the
                          Library** from an       Library/Welcome state;
                          opened syllabus         the syllabus remains
                                                  unchanged

  E1.4                    Ticks more topics       Previously saved
                                                  progress is restored
  -----------------------------------------------------------------------

**Workspace routing order (consistent with `Pages.md`):**

1.  If the account's setup state is `pending` (never completed or
    skipped), route to `/setup`.
2.  Otherwise, if the last-used syllabus still exists and belongs to
    this user, open it in Explorer on its Overview.
3.  Otherwise, show Welcome/Library with no fabricated "Continue" card
    or progress.

The setup state and last-used syllabus must be account-persisted, not
inferred only from local browser storage.

## E2. Different device

  -----------------------------------------------------------------------
  \#                      Student action          Expected behavior
  ----------------------- ----------------------- -----------------------
  E2.1                    Opens the link on a new Landing page
                          device                  

  E2.2                    Signs in with the same  The same account
                          account                 workspace loads

  E2.3                    Opens the syllabus      Tree, saved completion,
                                                  materials, and notes
                                                  are loaded from the
                                                  account

  E2.4                    Loses connection        Shows "You're offline.
                                                  Changes may not be
                                                  saved." V1 does not
                                                  promise offline editing
                                                  or automatic
                                                  synchronization

  E2.5                    Edits the same notes on If the version is
                          two devices             stale, explain the
                                                  conflict and offer a
                                                  safe reload/recovery
                                                  option; never silently
                                                  overwrite newer content
  -----------------------------------------------------------------------

Do not claim data is synchronized until the server confirms the relevant
save.

## E3. Session expired

Show a clear session-ended message with a **Sign in** action `[3.124]`;
avoid an infinite spinner.

If edits were unsaved, explain that they may not have reached the
server. Preserve them locally only where safe and technically supported;
label them as unsaved and never claim they were saved. After
re-authentication, return to the prior location only when a safe return
destination exists and authorization is checked again.

A signed-out visitor opening a private topic URL is sent to Sign in and
may return to that URL after authentication **only if the target belongs
to their account**. Other users' resources must not be disclosed.

## E4. Forgot how they signed up

-   A Google-only account should use **Continue with Google**.
-   If they try email sign-in for a Google-only account, show a clear,
    non-revealing explanation of the supported sign-in method.
-   Wrong email/password should use a neutral message such as "Incorrect
    email or password."
-   Show **Forgot password?** only when password reset and email
    delivery are configured and tested.

## E5. New semester

1.  From Library, choose **Import syllabus** or **Create manually**.
2.  Create "Second Year Syllabus"; retain the older syllabus.
3.  **Duplicate** `[3.13]` may be used if implemented and tested; the
    duplicated structure should reset progress only if that is the
    explicitly confirmed behavior.

## E6. Finishing and leaving

-   **Sign out** `[3.7]` returns to Landing without deleting data.
-   **Delete syllabus** `[3.14, 3.120]` requires confirmation that
    accurately describes the affected tree, materials, and notes.
-   **Delete account** `[3.115]` is shown only if account deletion and
    its data-retention/deletion behavior are implemented and tested. It
    must never be a decorative or nonfunctional control.

## E7. Moving between pages and syllabuses

Distinguish the **Library navigation icon/panel** from **Back to
Library**:

  -----------------------------------------------------------------------
  \#                      Student action          Expected behavior
  ----------------------- ----------------------- -----------------------
  E7.1                    Clicks the Library icon Opens/shows the Library
                          while viewing a topic   panel for choosing a
                                                  syllabus; the main
                                                  topic page remains in
                                                  place if specified by
                                                  `Pages.md`

  E7.2                    Selects another         Opens that syllabus in
                          syllabus in the Library Explorer and shows its
                                                  Overview

  E7.3                    Clicks **← Back to      Leaves the selected
                          Library** in the        Explorer view and shows
                          Explorer header         the Library/Welcome
                                                  state; no syllabus is
                                                  deleted or modified

  E7.4                    Opens Import or         Shows that page while
                          Settings                preserving the open
                                                  syllabus and expanded
                                                  tree context where
                                                  supported

  E7.5                    Uses browser            URL and displayed page
                          Back/Forward            remain synchronized;
                                                  unsaved edits are not
                                                  silently discarded

  E7.6                    Leaves a page with      Warns before discarding
                          unsaved notes or an     unsaved work and
                          import draft            distinguishes local
                                                  draft content from
                                                  server-saved content
  -----------------------------------------------------------------------

If `Pages.md` specifies a different precise transition, update this
table to match it rather than implementing two competing behaviors.

------------------------------------------------------------------------

# PART 7 --- FLOW F: THE MOBILE STUDENT

## Who they are

A student who opens StudyOS on a phone during a commute, between
classes, or during a short study break.

## What they want

Tick topics, check progress, and occasionally attach a photo or file
without fighting a desktop-style layout.

## Flow

  -----------------------------------------------------------------------
  \#                      Student action          Expected behavior
  ----------------------- ----------------------- -----------------------
  F1                      Opens the link on a     Landing page uses a
                          phone                   stacked responsive
                                                  layout

  F2                      Signs in                Uses the same real
                                                  authentication flow as
                                                  desktop

  F3                      Opens the workspace     Tree occupies the
                                                  primary screen rather
                                                  than sitting beside a
                                                  narrow content pane

  F4                      Ticks a topic           Completion and progress
                                                  update

  F5                      Taps a topic name       Topic page opens
                                                  full-screen with **←
                                                  Back to tree**

  F6                      Taps Upload file and    Attaches the selected
                          chooses                 item to the chosen
                          camera/gallery/file     supported node

  F7                      Opens the menu          Drawer provides
                                                  Library, Import, and
                                                  Settings

  F8                      Taps **← Back to tree** Returns to the same
                                                  tree context and
                                                  position where
                                                  supported
  -----------------------------------------------------------------------

**Requirements:** comfortable tap targets; no hover-only actions; row
actions such as **＋** and **⋯** are reachable by tap or an accessible
alternative; tree and detail view do not compete for narrow screen
space; drag-and-drop is never the only way to act.

------------------------------------------------------------------------

# PART 8 --- EDGE CASES AND FAILURE FLOWS

  -----------------------------------------------------------------------------
  Situation               What the student sees         Recovery/action
  ----------------------- ----------------------------- -----------------------
  Tab closes during       No attachment falsely appears Re-upload if the file
  upload                  as saved                      was not stored

  Upload fails, is too    Plain-language reason         Retry or choose another
  large, or unsupported                                 file

  Import file is          "We couldn't read text from   Paste text or create
  unreadable              this file."                   manually

  Import produces a wrong Draft warning                 Edit or discard before
  tree                                                  saving

  Parent action would     Confirmation naming the       Confirm or cancel
  un-complete many topics number of affected topics     

  Deletes a chapter       Confirmation accurately       Confirm or cancel
                          describing affected           
                          descendants/materials/notes   

  Attempts to move a node Invalid destination disabled  Choose a valid
  under itself or a                                     destination
  descendant                                            

  Notes save fails        "Couldn't save"; text remains Retry save
                          in editor                     

  AI unavailable, times   Clear message; retry only     Continue without AI or
  out, or rate-limits     where appropriate             retry

  Another tab deleted the "This item no longer exists." Return to
  current item                                          parent/Overview

  Opens another user's    Resource is not disclosed;    No access
  URL                     use not-found behavior        

  Offline                 "You're offline. Changes may  Wait for connection; no
                          not be saved."                promise of offline
                                                        editing

  Save conflict           Explains that content changed Reload or use the
                          elsewhere                     offered recovery path

  Session expires while   Session-ended prompt; unsaved Sign in again; preserve
  editing                 state clearly identified      edits only where safely
                                                        supported

  Submit button clicked   One logical operation; no     Continue from the
  twice                   duplicate                     single result
                          syllabus/upload/account       

  Leaves with unsaved     Warning before discarding;    Stay, save, or
  changes                 saved and unsaved states      deliberately discard
                          distinguished                 

  Opens Ask AI when not   AI shortcut hidden where      Continue using core
  configured              specified; clear availability features
                          message if visiting the tab   

  Selected node is        Return to parent or Syllabus  Continue from valid
  deleted                 Overview, as appropriate      location

  Previewed file is       Return to owning node's       Continue without the
  deleted                 Materials tab if it still     deleted file
                          exists                        

  Empty syllabus          "No topics yet," not a        Add the first
                          misleading 0% ring            subject/topic

  Setup state cannot be   Do not guess that setup was   Show a recoverable
  loaded                  completed                     error or follow the
                                                        safe routing behavior
                                                        in `Pages.md`

  Upload storage succeeds No false success; avoid       Clean up or recover
  but record creation     dangling/inaccessible         consistently on the
  fails (or vice versa)   attachment                    server

  Save response is        Show saving/pending state     Do not claim "Saved"
  delayed                                               until confirmed
  -----------------------------------------------------------------------------

------------------------------------------------------------------------

# PART 9 --- JOURNEY MATRIX: WHO USES WHAT

Legend: ● core use · ◐ sometimes · ○ rarely or never. These are **design
hypotheses**, not measured usage statistics.

  -------------------------------------------------------------------------------------------
  Feature               A Manual B Semester C Collector D Helper-Seeker E Returner   F Mobile
                         Tracker    Planner                                        
  ------------------- ---------- ---------- ----------- --------------- ---------- ----------
  Landing + sign-up            ●          ●           ●               ●          ◐          ●

  Continue with                ●          ●           ●               ●          ●          ●
  Google                                                                           

  Setup                        ◐          ◐           ○               ◐          ○          ○
  (category/course)                                                                

  Create manually              ●          ◐           ◐               ◐          ◐          ◐

  Import syllabus              ○          ●           ◐               ◐          ◐          ◐
  (paste/file)                                                                     

  Multiple syllabuses          ○          ●           ◐               ◐          ●          ◐

  Tree editing                 ●          ●           ◐               ○          ◐          ◐

  Tick topics / see            ●          ●           ◐               ◐          ●          ●
  progress                                                                         

  Chapter checklist            ●          ●           ◐               ○          ●          ●

  Upload files at any          ○          ●           ●               ◐          ◐          ◐
  supported level                                                                  

  Add text material            ○          ◐           ●               ◐          ○          ◐

  Notes                        ○          ◐           ●               ◐          ○          ◐

  Analyze material             ○          ◐           ◐               ○          ○          ○

  Ask AI                       ○          ◐           ○               ●          ○          ◐

  Generate notes               ○          ○           ◐               ●          ○          ○
  draft                                                                            

  Practice + feedback          ○          ◐           ○               ●          ○          ◐

  Settings / sign out          ◐          ◐           ◐               ◐          ●          ◐
  -------------------------------------------------------------------------------------------

**What the matrix suggests:** - The tree, completion checkbox, and
progress are core and should be reliable before optional features. -
Files and notes matter most to some students and are useful to others,
but are secondary to the tracker. - AI and Practice should not be
required for the product to function.

------------------------------------------------------------------------

# PART 10 --- BUILD PRIORITIES AND RELEASE SCOPE

Priorities describe implementation order. They do **not** automatically
mean every feature belongs in the first public release.

## P0 --- Core v1 launch path

These are the capabilities required for the first usable release:

1.  Sign-up/sign-in and safe account-specific access.
2.  Empty workspace and syllabus creation.
3.  Manual tree creation, rename, move/reorder, and deletion with
    appropriate safeguards.
4.  Topic completion, derived parent checkbox states, and consistent
    progress based on leaf topics.
5.  Syllabus Overview, subject page, chapter page, and topic page states
    defined in `Pages.md`.
6.  Persistence of syllabus trees and completion state.
7.  Multiple syllabuses and a usable Library.
8.  Basic responsive/mobile access to the core tracker.
9.  Honest loading, error, save, and empty states.

**Google OAuth is part of the launch path only if it is configured and
tested.** If unavailable, the email authentication path must still work
and the Google button must not be shown.

## P1 --- Optional/configuration-dependent v1 capabilities

Add these only when each path is implemented, tested, and accurately
represented in the UI:

-   Paste-text syllabus import with draft review and save recovery.
-   File-based import for formats with a working, tested text extractor.
-   File upload and download at supported node levels.
-   PDF/image preview where supported.
-   Text materials and notes with safe persistence/autosave.
-   AI Explain/Simplify/Example, generated-notes drafts, and
    Practice/feedback, when an AI provider and backend are configured.
-   Analyze material, only for supported file types and a working
    analysis path.
-   Password reset, Google OAuth, account deletion, or other
    auth/account features only when their complete flows are configured
    and tested.

A capability that is not ready must be hidden or clearly
unavailable---not represented by a button that appears to work.

## P2 --- Later work / not required for v1

-   OCR for photos and scanned PDFs, unless specifically implemented and
    validated before release.
-   Bulk creation by pasting a list of node names.
-   Exam mode, "Teach me"/adaptive modes, study sessions, revision
    scheduling, study planning, XP/streaks/badges/leaderboards,
    predicted marks, mastery scores, prerequisite graphs,
    teacher/parent/classroom roles, LMS integrations, and public
    syllabus sharing.

Do not let P1 or P2 work block delivery of the P0 tracker.

------------------------------------------------------------------------

# PART 11 --- VALIDATING THE FLOWS WITH REAL STUDENTS

No student testing has been completed for these personas. After a
working build exists, ask 5--8 students with varied study habits to
attempt tasks while an observer watches quietly.

1.  "Create a syllabus with two subjects and a few chapters." *(time to
    first usable tree)*
2.  "Import this syllabus text and fix anything wrong." *(draft-review
    clarity)*
3.  "Mark two topics done. What changed in the chapter and overall
    progress?" *(understanding of completion/progress)*
4.  "Attach this PDF to a chapter and a photo to a topic." *(attachment
    behavior)*
5.  "Find the PDF again tomorrow after signing in on another device."
    *(persistence and discoverability)*
6.  "Try Ask AI to explain a topic, if you want to." *(whether AI feels
    optional and understandable)*

Observe where participants hesitate, which controls they miss, whether
file states are understood, and whether they expect to begin somewhere
other than the tree.

**Metrics to record, not claim as results in advance:** - Time to first
subject/tree. - Whether users correctly understand a checkbox/progress
change. - Upload success by supported file type. - Time spent correcting
an import draft. - Whether users can find a saved material again. - AI
requests per session, interpreted descriptively rather than as proof of
learning.

Do not claim improved grades, improved learning outcomes, originality,
or market demand from these usability tasks. Those claims require
appropriate evidence.

------------------------------------------------------------------------

# PART 12 --- OUT OF SCOPE FOR V1

There are no v1 flows for:

-   Exam mode.
-   "Teach me" or adaptive "I don't understand" modes.
-   Study sessions or a study-for-my-exam planner.
-   Revision scheduler.
-   XP, streaks, badges, or leaderboards.
-   Predicted marks, mastery scores, or readiness claims.
-   Prerequisite graphs.
-   Teacher, parent, or classroom roles.
-   LMS integrations.
-   Public syllabus sharing.

If students request these during validation, record the request as
feedback for a later scope decision. Do not silently add them to v1.
