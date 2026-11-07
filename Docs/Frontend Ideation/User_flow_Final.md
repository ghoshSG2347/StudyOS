# StudyOS --- Complete Signed-In Workspace User-Flow & UI Specification

**Specification status:** Product-flow specification based on the
finalized StudyOS workspace discussion and the approved UI mockup shown
on 26 October 2026.

> **Terminology update:** The product uses **Syllabus List** as the name
> of the saved-syllabus catalogue/sidebar. Do not use **Syllabuses** as
> the UI label.

------------------------------------------------------------------------

## 1. Purpose

StudyOS is a syllabus-first study workspace. Its primary job is to let a
student:

1.  create or import a syllabus,
2.  review and correct the proposed hierarchy,
3.  save it as a named syllabus workspace,
4.  switch between current and past syllabuses,
5.  manually control the actual syllabus tree,
6.  track completion,
7.  optionally attach notes/materials, and
8.  optionally use AI assistance around the selected syllabus content.

The product must remain focused on syllabus organization rather than
becoming a generic AI dashboard.

The central product distinction is:

> **Import creates a proposed tree. Syllabus List stores and lists named
> syllabus workspaces. The Full Syllabus Workspace is where the student
> owns and manages the actual saved tree.**

These are separate experiences and must not be collapsed into one
generic screen.

------------------------------------------------------------------------

# 2. Confirmed Product Principles

## 2.1 Student control comes first

Imported structure is only a proposal until the student confirms it.

The student must be able to correct:

-   names,
-   nesting,
-   duplicate items,
-   missing items,
-   unwanted items,
-   ordering,
-   and other structural mistakes supported by the implementation.

AI or document extraction must never silently become the permanent
source of truth.

## 2.2 Manual creation must always work

A student must be able to build a syllabus without:

-   uploading a file,
-   OCR,
-   AI extraction,
-   or any other automated parsing.

## 2.3 The hierarchy is flexible

The default academic pattern is:

**Subject → Chapter → Topic → Subtopic → deeper descendants**

This is a convention, not a hardcoded maximum depth.

Do not introduce a separate hierarchy-selection wizard merely because
different documents use different terminology. Ordinary tree editing
should handle those differences.

## 2.4 Syllabuses are independent workspaces

Each saved syllabus has its own:

-   identity,
-   name,
-   tree,
-   completion state,
-   associated notes/materials,
-   and other supported content.

Switching to another syllabus must not mix or overwrite data.

For example:

-   `3rd Semester CSE`
-   `2nd Semester CSE`
-   `Class 11 Mathematics`

are separate workspaces.

## 2.5 AI is optional

AI may help with:

-   explanations,
-   questions,
-   selected-topic assistance,
-   or other explicitly implemented supporting functions.

AI is not required for:

-   creating a syllabus,
-   editing the tree,
-   tracking completion,
-   switching syllabuses,
-   or managing basic resources.

------------------------------------------------------------------------

# 3. Approved Visual Direction

The approved mockup establishes the core information architecture and
visual direction.

The reference contains three major states:

-   **A --- Import Syllabus**
-   **B --- Syllabus List**
-   **C --- Full Student-Controlled Syllabus Workspace**

The mockup should be treated as the visual reference for layout and
information architecture, not as literal content that must be
reproduced.

The example image contains a few generated-text imperfections. Those
must not be copied into the implementation.

## 3.1 Visual character

The interface should feel like a warm, carefully designed study
workspace with the organizational clarity of a code editor.

It should not look like:

-   a generic analytics dashboard,
-   a neon AI interface,
-   a gaming UI,
-   or a collection of oversized productivity cards.

## 3.2 Light-theme palette

  Purpose                       Color
  ----------------------------- -----------
  Main background               `#F3F0E7`
  Explorer/sidebar background   `#EAE7DD`
  Main content surface          `#F8F5ED`
  Primary text                  `#293047`
  Secondary text                `#77796F`
  Selected item background      `#E1E0F0`
  Primary accent                `#6268C9`
  Completed state               `#64866D`
  In-progress accent            `#B58A4B`
  Borders                       `#DCD8CC`
  Hover background              `#E4E1D7`
  Tooltip background            `#293047`
  Tooltip text                  `#F8F5ED`

## 3.3 Visual rules

Use:

-   clear typography,
-   readable labels,
-   comfortable spacing,
-   restrained borders,
-   subtle corner radii,
-   consistent small icons,
-   clear selected states,
-   clear hover states,
-   strong hierarchy between sidebar and content.

Avoid:

-   pure-white application backgrounds,
-   electric-blue/neon accents,
-   excessive gradients,
-   decorative glassmorphism,
-   huge empty dashboard cards,
-   permanent labels beside every icon,
-   excessively tiny text,
-   visually noisy tree controls.

A dark theme may be supported separately, but this specification
primarily defines the light workspace.

------------------------------------------------------------------------

# 4. Signed-In Application Shell

After authentication, the student enters the StudyOS workspace.

The shell has three primary regions:

1.  **Absolute-left Activity Bar**
2.  **Secondary Sidebar**
3.  **Main Content Area**

The secondary sidebar changes according to the selected activity.

------------------------------------------------------------------------

# 5. Activity Bar

The Activity Bar is narrow and primarily icon-based.

It contains:

1.  **Syllabus List**
2.  **Import Syllabus**
3.  **Library**
4.  **Settings**
5.  **Profile**

Settings and Profile belong near the bottom.

## 5.1 Activity-bar behavior

Each activity:

-   has a distinct icon,
-   has a selected/active state,
-   shows a tooltip on hover/focus when the icon is not
    self-explanatory,
-   opens its own content area,
-   does not destroy the currently active syllabus,
-   does not silently reset unsaved data.

## 5.2 Syllabus List

Clicking **Syllabus List** opens the compact catalogue of saved syllabus
workspaces.

It is not the full syllabus tree.

## 5.3 Import Syllabus

Clicking **Import Syllabus** opens the dedicated import workflow.

It does not immediately save anything.

## 5.4 Library

Clicking **Library** opens the separate resource area.

Library must not become another representation of the active syllabus
tree.

The detailed Library information architecture is intentionally outside
this specification.

## 5.5 Settings

Opens global application settings.

Settings are not syllabus-specific.

## 5.6 Profile

Opens account/profile actions.

Profile is not syllabus-specific.

------------------------------------------------------------------------

# 6. Secondary Sidebar Modes

The secondary sidebar changes according to the active activity.

### Syllabus List mode

Shows:

-   `Syllabus List` heading,
-   `+` creation button,
-   compact saved-syllabus rows.

### Full Syllabus Workspace mode

Shows:

-   active syllabus identity,
-   expandable Explorer tree,
-   node selection,
-   completion indicators,
-   contextual node actions.

### Library mode

Shows Library navigation appropriate to the implemented resource system.

The compact Syllabus List and the full Explorer are deliberately
different.

> **Syllabus List = catalogue of workspaces.**
>
> **Explorer = tree of the currently active workspace.**

------------------------------------------------------------------------

# 7. Syllabus List

## 7.1 Purpose

The **Syllabus List** is the catalogue of all saved syllabus workspaces.

It is the place where the student can:

-   see saved syllabuses,
-   switch between current and past syllabuses,
-   create a new syllabus,
-   rename a syllabus,
-   delete a syllabus.

It should remain compact.

It must not display the complete nested tree of every saved syllabus.

## 7.2 Sidebar header

At the top of the secondary sidebar:

**Syllabus List**

and a small:

**+**

button.

## 7.3 Syllabus row

Each saved syllabus row contains:

-   small consistent syllabus/document icon,
-   user-defined syllabus name,
-   contextual `⋯` menu,
-   selected state when active.

The `⋯` menu can remain hidden until hover/focus to keep the list clean.

Optional lightweight progress may be shown only if it does not make the
catalogue visually noisy.

## 7.4 Example list

``` text
Syllabus List                         +
──────────────────────────────────────
▧ 3rd Semester CSE              ⋯
  Python Fundamentals           ⋯
  Class 11 Mathematics          ⋯
  2nd Semester CSE              ⋯
```

These are example names only.

## 7.5 Selecting a syllabus

When the student clicks a syllabus:

1.  The row becomes selected.
2.  The corresponding syllabus becomes the active workspace.
3.  Its Explorer tree loads in the secondary sidebar.
4.  Its main content loads.
5.  Its completion state loads.
6.  Its associated notes/materials load where applicable.
7.  The active syllabus name appears in the workspace header.
8.  No data from another syllabus is merged into it.

## 7.6 Long lists

If many syllabuses exist:

-   the list scrolls,
-   the header remains accessible,
-   the selected row remains visually identifiable,
-   the list must not expand the entire application horizontally.

No advanced filtering is required by this specification.

------------------------------------------------------------------------

# 8. Syllabus List `+` Creation Menu

Clicking `+` opens a compact creation menu containing:

1.  **Import syllabus**
2.  **Create manually**
3.  **Start with an empty workspace**

All three paths require a syllabus name.

The options describe different entry intentions, not three unrelated
data models.

## 8.1 Import syllabus

Opens the Import Syllabus workflow.

## 8.2 Create manually

Creates a saved syllabus with an empty tree and opens the full
workspace.

## 8.3 Start with an empty workspace

Also creates a saved syllabus with an empty tree and opens the full
workspace.

At present, **Create manually** and **Start with an empty workspace**
may share the same underlying behavior. Do not invent an artificial
technical distinction.

------------------------------------------------------------------------

# 9. Syllabus Naming

A syllabus name is required during every creation path.

Creation paths:

-   file import,
-   pasted-text import,
-   manual creation,
-   empty workspace creation.

The name is independent from the source filename.

Example:

``` text
Source file:
MAKAUT_CSE_Sem3_Syllabus_2026.pdf

Syllabus name:
3rd Semester CSE
```

The student controls the permanent display name.

## 9.1 Validation

Reject:

-   blank names,
-   whitespace-only names.

Show an inline, understandable validation message.

A name that is merely similar to another syllabus may be allowed unless
the persistence layer imposes a uniqueness rule.

Do not silently rename a syllabus to resolve a duplicate.

If the actual backend requires unique names, the UI must explain that
requirement before saving.

------------------------------------------------------------------------

# 10. Import Syllabus --- Entry Screen

The approved mockup's Screen A establishes this as a dedicated page.

The page contains:

-   `Import Syllabus` title,
-   required `Syllabus Name` field,
-   source/input area,
-   review/extraction workflow,
-   editable proposed structure after extraction.

The Import Syllabus screen is a temporary creation workflow.

It is not the saved workspace.

## 10.1 Entry points

The page opens when:

-   the student clicks **Import Syllabus** in the Activity Bar, or
-   the student chooses **Import syllabus** from the Syllabus List `+`
    menu.

## 10.2 Initial controls

Show:

### Syllabus Name

Required text field.

### Input method

Provide:

1.  **Upload a file**
2.  **Paste syllabus text**
3.  **Create manually**

The UI can use tabs, segmented controls, or another compact pattern,
provided the three paths remain obvious.

The selected method controls the input area.

------------------------------------------------------------------------

# 11. Import Method A --- Upload a File

## 11.1 Upload state

The student:

1.  enters a syllabus name,
2.  selects Upload a file,
3.  chooses a supported file,
4.  sees the selected filename,
5.  may replace the file,
6.  continues to extraction/review.

The UI may support drag-and-drop if implemented.

## 11.2 Supported formats

Advertise only formats actually supported by the implementation.

Potential formats include:

-   PDF,
-   DOCX,
-   TXT,
-   images/scans.

If OCR is supported, scanned documents may be processed through OCR.

Do not advertise a format merely because it would be convenient for the
UI.

## 11.3 Selected-file state

Once a file is selected, display:

-   file icon,
-   filename,
-   optional file size,
-   remove/replace control.

The original filename is informational.

It does not automatically become the syllabus name.

## 11.4 Upload validation

Handle:

-   unsupported format,
-   missing file,
-   file-size limit,
-   upload failure,
-   corrupt file,
-   unreadable document,
-   extraction failure,
-   OCR failure if applicable.

Messages should state:

1.  what went wrong,
2.  whether the current input is still usable,
3.  what the student can do next.

Example:

> This file could not be read. Try another file or paste the syllabus
> text instead.

Do not claim that extraction succeeded when it did not.

------------------------------------------------------------------------

# 12. File Extraction Loading State

After the student continues:

1.  Upload/processing begins.
2.  The UI enters a loading state.
3.  The student sees that the structure is being prepared.
4.  The controls that could duplicate the operation are disabled or
    otherwise protected.
5.  The interface eventually moves to Review Extracted Structure.

The loading state should communicate progress without pretending to know
an exact percentage unless the backend provides one.

Suggested state:

``` text
Preparing your syllabus…

Reading the supplied content and building a proposed structure.
```

If processing fails, remain in a recoverable state.

Possible recovery actions:

-   Retry,
-   Replace file,
-   Paste text,
-   Switch to manual creation.

------------------------------------------------------------------------

# 13. Import Method B --- Paste Syllabus Text

## 13.1 Input state

When Paste syllabus text is selected:

-   show a large text area,
-   allow normal paste and typing,
-   keep the syllabus name field visible,
-   provide a Review structure action.

## 13.2 Empty input validation

If the text area contains no meaningful content:

-   do not begin extraction,
-   show an inline validation message,
-   keep the user on the page.

Example:

> Paste some syllabus content before continuing.

## 13.3 Extraction

When the student continues:

1.  supplied text is processed,
2.  a proposed hierarchy is generated,
3.  the Review Extracted Structure state opens.

The system must preserve the distinction between supplied text and the
generated proposal.

------------------------------------------------------------------------

# 14. Import Method C --- Create Manually

Manual creation bypasses extraction.

Flow:

1.  Student selects Create manually.
2.  Student enters a syllabus name.
3.  Student confirms creation.
4.  System creates a saved syllabus with an empty tree.
5.  Full Syllabus Workspace opens.
6.  Empty-state guidance asks the student to add the first item.

There is no fake extraction step.

There is no Review Extracted Structure step because no structure was
extracted.

------------------------------------------------------------------------

# 15. Review Extracted Structure

This is the most important intermediate state in the import workflow.

> **The tree on this page is provisional. It is not yet the permanent
> syllabus workspace.**

The student must explicitly confirm it.

## 15.1 Page structure

Display:

-   page title: **Review extracted structure**,
-   syllabus name,
-   source information,
-   expandable tree,
-   contextual editing controls,
-   Back action,
-   **Confirm & Add to Syllabus List** primary action.

The exact button may retain the approved mockup wording **Confirm & Add
to Syllabuses** if required by an existing implementation, but the
product's current UI terminology should use **Syllabus List** wherever
the catalogue is named.

Recommended final wording:

**Confirm & Add to Syllabus List**

## 15.2 Example preview

``` text
Review extracted structure

Data Structures
  Arrays
  Linked Lists
  Trees

Digital Electronics
  Logic Gates
  Flip-Flops

Mathematics
  Matrices
  Differential Equations
```

This is only an example.

The actual tree depends on the supplied content and extraction result.

------------------------------------------------------------------------

# 16. Review Tree Editing

Every relevant node should support contextual actions.

Supported actions, depending on implementation:

-   Rename,
-   Delete,
-   Add child,
-   Reorder,
-   Move.

Controls should appear through:

-   hover,
-   keyboard focus,
-   or an ellipsis/context menu.

Do not permanently place several buttons beside every node.

## 16.1 Rename

Student selects Rename.

The node becomes editable inline or opens a compact edit control.

Student can:

-   type a replacement name,
-   press Enter to save,
-   press Escape to cancel.

Reject empty names.

## 16.2 Delete

Student selects Delete.

If the node has descendants, the UI should clearly communicate that
deleting it affects its descendants.

Use confirmation where the impact is destructive.

Do not silently delete a large subtree.

## 16.3 Add child

Student selects Add child.

A new child is created under the selected node.

The child name must be provided.

If the implementation creates a temporary unnamed row, it must force the
student to either name it or cancel.

## 16.4 Reorder/move

If supported by the implementation, the student can change sibling order
or move nodes within the hierarchy.

The review screen should preserve the same hierarchy model as the
eventual saved workspace.

------------------------------------------------------------------------

# 17. Review Hierarchy Rules

Default conceptual hierarchy:

``` text
Subject
  Chapter
    Topic
      Subtopic
        Deeper descendant
```

However:

-   the depth is not fixed,
-   names are not hardcoded,
-   the imported document does not need to use exactly these labels,
-   students can restructure the proposal.

Do not add a separate hierarchy-selection wizard.

Ordinary editing is the mechanism for resolving unusual structures.

------------------------------------------------------------------------

# 18. Back Navigation from Review

Back should allow the student to change:

-   syllabus name,
-   input source,
-   input method.

The application should preserve review edits where practical.

If navigating backward will discard review changes, show a warning
first.

Never silently discard user edits.

Example warning:

> Your changes to the extracted structure have not been saved. Go back
> and discard them?

Actions:

-   Continue editing
-   Go back and discard

------------------------------------------------------------------------

# 19. Confirming an Import

When the student clicks **Confirm & Add to Syllabus List**:

1.  validate the syllabus name,
2.  validate that the tree is saveable,
3.  persist the reviewed tree,
4.  create a new syllabus identity,
5.  add it to the Syllabus List,
6.  open the new Full Syllabus Workspace.

The system must not overwrite an existing syllabus automatically.

## 19.1 Success condition

Only show success after the save operation actually succeeds.

The new workspace should show:

-   selected syllabus in Syllabus List,
-   its tree in Explorer,
-   its name in the workspace header,
-   its selected/root state,
-   its completion state.

## 19.2 Save failure

If saving fails:

-   stay on the review screen,
-   preserve the proposed tree where possible,
-   explain that saving did not complete,
-   provide Retry.

Do not navigate away and imply success.

------------------------------------------------------------------------

# 20. Full Syllabus Workspace

The Full Syllabus Workspace is the student's actual saved environment.

This is Screen C in the approved mockup.

It is where the student:

-   navigates the tree,
-   edits the tree,
-   tracks completion,
-   views notes,
-   views materials,
-   optionally asks AI about selected content.

## 20.1 Layout

The workspace has:

1.  Activity Bar
2.  Explorer sidebar
3.  Main content area

The Syllabus List remains available as a separate activity for switching
between workspaces.

------------------------------------------------------------------------

# 21. Explorer Sidebar

The Explorer shows the complete tree of the currently active syllabus.

Example:

``` text
3rd Semester CSE
  Data Structures
    Arrays
      Array Traversal
      Searching
    Linked Lists
      Singly/Doubly Linked List
    Trees

  Digital Electronics
    Logic Gates
    Flip-Flops

  Mathematics
```

This is illustrative.

The actual tree is user-controlled.

## 21.1 Explorer node presentation

Each node may contain:

-   expand/collapse control if it has children,
-   node icon,
-   node name,
-   completion indicator,
-   contextual action trigger.

The selected node receives a clear selected background.

## 21.2 Tree behavior

Nodes can be:

-   expanded,
-   collapsed,
-   selected.

The tree should remember expansion state where practical.

Do not force the student to keep every branch expanded.

------------------------------------------------------------------------

# 22. Node Context Actions

The actual saved tree supports contextual actions.

Depending on node state and implementation:

-   Add child,
-   Rename,
-   Delete,
-   Reorder/move,
-   Add/upload material,
-   Open notes,
-   Ask AI.

Keep these actions compact.

The primary tree should remain readable even when many nodes exist.

------------------------------------------------------------------------

# 23. Main Content Area

Selecting a node opens its content view.

The main area should contain:

-   breadcrumb,
-   node title,
-   completion status,
-   progress information where relevant,
-   primary child checklist when the node has descendants,
-   optional tabs/views for:
    -   Checklist,
    -   Notes,
    -   Materials,
    -   Ask AI.

The approved mockup shows these as compact views rather than separate
application-level dashboards.

------------------------------------------------------------------------

# 24. Breadcrumb

The breadcrumb identifies the selected node's position.

Example:

``` text
3rd Semester CSE > Data Structures > Arrays
```

For deeper structures:

``` text
3rd Semester CSE > Data Structures > Arrays > Searching
```

The breadcrumb should help orient the student without duplicating the
entire tree.

If breadcrumb items are clickable, they should select the corresponding
node.

------------------------------------------------------------------------

# 25. Completion Status

The selected node displays completion information.

Example:

``` text
Completion status · 100%
Progress calculated from descendants
```

The exact wording can be adapted to the UI.

Completion should remain lightweight.

The purpose is to answer:

> What have I completed?

not to turn the product into a gamification system.

------------------------------------------------------------------------

# 26. Completion Logic

## 26.1 Leaf completion

A leaf node has the underlying completion state.

Example:

``` text
☐ Array Traversal
☑ Searching
☐ Sorting
```

## 26.2 Parent progress

Parent progress is derived from descendants.

If a parent contains three relevant leaf nodes and two are complete:

``` text
2 / 3 complete
≈ 67%
```

## 26.3 Avoid double counting

A parent and its children must not all independently count toward the
same total.

Use descendant leaf items as the underlying progress units unless the
implementation explicitly establishes another model.

## 26.4 Parent complete state

A parent is fully complete only when all relevant descendant leaves are
complete.

If only some are complete, the parent may display an
indeterminate/partial state.

## 26.5 Structural edits

When nodes are:

-   added,
-   removed,
-   moved,
-   or renamed,

the displayed progress must be recalculated appropriately.

Renaming alone should not destroy completion state.

Adding an incomplete leaf can lower a parent's percentage because the
denominator changed.

Deleting a completed leaf can change the percentage because the
underlying set changed.

------------------------------------------------------------------------

# 27. Checklist View

The Checklist is the default practical view for a selected node with
descendants.

It shows direct child items or the appropriate descendant-level
checklist for the selected node.

Example:

``` text
Checklist (4)

☑ Array Traversal
☐ Searching
☑ Linked Lists
☐ Trees
```

The exact contents depend on the selected node.

Checking/unchecking an item should update:

-   the item's completion state,
-   parent progress,
-   relevant ancestor progress.

The UI should update without requiring a full page reload.

------------------------------------------------------------------------

# 28. Notes View

Notes are optional.

A student may attach or write notes associated with a selected
syllabus/node where the implementation supports it.

Notes should not be mandatory for every node.

The main workspace should not force a Notes panel open if the student
only wants completion tracking.

The detailed note editor behavior is implementation-dependent unless
separately specified.

------------------------------------------------------------------------

# 29. Materials View

Materials/resources are optional.

A student may associate supported resources with a node.

Examples from the broader product discussion include:

-   Word documents,
-   Markdown,
-   PowerPoint files,
-   PDFs,
-   photos.

However, the UI must advertise only file types actually supported by the
implementation.

A resource can belong to a higher-level node even if it covers multiple
subtopics.

For example:

``` text
Derivatives
  Materials:
    derivatives-notes.pdf
```

The system must not require the student to split one document into
individual topics.

AI scanning of uploaded notes is not mandatory.

Do not automatically process every uploaded material through AI unless
that behavior is explicitly implemented.

------------------------------------------------------------------------

# 30. Ask AI View

Ask AI is an optional contextual tool.

The approved mockup shows an **Ask AI** action in the selected-node
workspace.

The AI context should be based on the selected syllabus/node and
whatever supporting data the actual implementation can reliably provide.

The UI should not imply that AI has access to material it has not
actually been given.

AI should not replace the core tree controls.

The core workspace must remain useful if AI is unavailable.

------------------------------------------------------------------------

# 31. Empty Syllabus Workspace

An empty syllabus is valid.

This occurs after:

-   Create manually,
-   Start with an empty workspace,
-   or any other legitimate creation path that produces no initial
    nodes.

The screen must not appear broken.

Show a focused empty state.

Example:

``` text
Your syllabus starts here

Add your first subject, chapter, or other item to begin
building your study tree.

[ Add first subject ]
```

The student may be allowed to choose a different first-node type if the
implementation supports it.

Manual creation must not require AI.

------------------------------------------------------------------------

# 32. Creating Nodes in the Full Workspace

The student should be able to create the tree directly.

Typical flow:

1.  select a parent node,
2.  choose Add child,
3.  enter a name,
4.  save,
5.  new node appears under the parent,
6.  node becomes selectable.

For an empty syllabus:

1.  click Add first subject,
2.  enter name,
3.  create,
4.  node appears,
5.  node is selected.

The application should provide immediate feedback after successful
creation.

------------------------------------------------------------------------

# 33. Renaming Nodes

Renaming a node changes its display name while preserving its identity
and associated content.

Flow:

1.  select node,
2.  open contextual menu,
3.  choose Rename,
4.  edit,
5.  confirm.

Escape/Cancel leaves the original name unchanged.

Blank names are invalid.

Renaming must not:

-   reset completion,
-   remove notes,
-   remove materials,
-   create a new unrelated node.

------------------------------------------------------------------------

# 34. Deleting Nodes

Deleting a node is destructive.

If the node has descendants:

-   explain that descendants are affected,
-   require confirmation where appropriate.

If the node has associated notes/materials:

-   explain the actual deletion consequence implemented by the backend,
-   do not promise recovery unless recovery exists.

After deletion:

-   update the Explorer,
-   update the selected state,
-   update parent progress,
-   show an appropriate neighboring node or parent when practical.

Never leave the UI pointing at a deleted node.

------------------------------------------------------------------------

# 35. Moving and Reordering Nodes

If supported, the student can reorganize the actual saved tree.

The behavior should remain consistent with the import review tree.

Examples:

-   move a topic to another chapter,
-   reorder chapters,
-   reorder topics.

Structural changes must preserve associated data where the target
relationship remains valid.

If a move is destructive or ambiguous, require confirmation.

------------------------------------------------------------------------

# 36. Switching Between Current and Past Syllabuses

The Syllabus List is the mechanism for switching.

There is no separate "Current" versus "Past" dashboard required by this
specification.

A semester can remain in the same Syllabus List.

Example:

``` text
Syllabus List

3rd Semester CSE
2nd Semester CSE
1st Semester CSE
Class 11 Mathematics
```

Selecting an older syllabus opens it exactly as its own workspace.

No old syllabus should disappear merely because a new one is created.

Creating `4th Semester CSE` must not replace `3rd Semester CSE`.

------------------------------------------------------------------------

# 37. Rename Syllabus

The Syllabus List row's `⋯` menu contains:

**Rename**

Flow:

1.  open row menu,
2.  click Rename,
3.  enter new name,
4.  confirm.

The updated name must appear in:

-   Syllabus List,
-   active workspace header,
-   relevant breadcrumbs or titles.

The underlying syllabus identity remains the same.

Its:

-   tree,
-   progress,
-   notes,
-   materials

remain associated with the same workspace.

------------------------------------------------------------------------

# 38. Delete Syllabus

The row's `⋯` menu contains:

**Delete**

Delete must not be immediate.

## 38.1 Confirmation dialog

Identify the syllabus clearly.

Example:

``` text
Delete “2nd Semester CSE”?

This will remove the syllabus and any associated data
according to your current StudyOS storage policy.

[ Cancel ] [ Delete syllabus ]
```

The exact data-loss wording must match the actual implementation.

Do not promise:

-   Trash,
-   Undo,
-   recovery,
-   version history

unless implemented.

## 38.2 After deletion

If other syllabuses remain:

-   show the Syllabus List,
-   optionally select another valid syllabus.

If no syllabuses remain:

-   show the Syllabus List empty state.

Never leave the application in a broken active-workspace state.

------------------------------------------------------------------------

# 39. Empty Syllabus List

If the account has no saved syllabuses:

``` text
Syllabus List

No syllabuses yet

Create your first syllabus by importing a document
or building one manually.

[ Create syllabus ]
```

The Activity Bar's Import Syllabus action remains available.

The empty state should not imply that the user must use AI.

------------------------------------------------------------------------

# 40. Loading States

Loading states should exist at the boundaries where data is genuinely
being retrieved or processed.

Important loading states include:

-   initial workspace loading,
-   Syllabus List loading,
-   selected syllabus loading,
-   import file processing,
-   pasted-text processing,
-   saving an import,
-   saving tree edits,
-   deleting a syllabus,
-   deleting a node.

## 40.1 Loading principles

Do:

-   preserve layout where practical,
-   show clear status,
-   prevent duplicate destructive actions,
-   keep already-known content visible where safe.

Do not:

-   show fake percentage progress,
-   claim completion before completion,
-   replace the entire application with a generic spinner for a small
    operation.

------------------------------------------------------------------------

# 41. Error States

Errors must be actionable and understandable.

## 41.1 Import errors

Possible causes:

-   unsupported file,
-   oversized file,
-   unreadable document,
-   OCR failure,
-   extraction failure,
-   empty extracted content.

Recovery should include whichever options the implementation actually
supports.

## 41.2 Save errors

If a save fails:

-   keep the user's local review state where possible,
-   explain that the save did not complete,
-   provide Retry,
-   do not navigate to the supposedly saved workspace.

## 41.3 Tree-edit errors

If adding/renaming/deleting fails:

-   do not visually pretend the operation succeeded,
-   restore or preserve the last known valid state,
-   show a concise error,
-   allow Retry.

------------------------------------------------------------------------

# 42. Unsaved Changes

The application must distinguish:

### Import-review changes

Changes made to the proposed extracted tree before confirmation.

### Saved workspace changes

Changes made to the actual syllabus after confirmation.

The review tree is not the saved syllabus until confirmation succeeds.

If the student leaves an import-review page with unsaved structural
edits and the edits cannot be preserved, show a warning.

Do not silently discard work.

For ordinary saved-workspace edits, the exact autosave/manual-save
strategy is implementation-dependent. The UI must never claim that a
change is persisted if the persistence operation has not completed.

------------------------------------------------------------------------

# 43. Duplicate or Similar Syllabus Names

The product should not silently overwrite an existing syllabus because
the names are similar.

Examples:

``` text
3rd Semester CSE
3rd Semester CSE - Updated
3rd Semester CSE 2026
```

may all coexist unless the backend explicitly enforces unique names.

If uniqueness is required, show a clear validation message and request a
different name.

Do not silently modify the student's chosen name.

------------------------------------------------------------------------

# 44. Source File vs. Syllabus Identity

The uploaded source file and saved syllabus are separate concepts.

Example:

``` text
Source:
MAKAUT_CSE_Sem3_Syllabus_2026.pdf

Saved syllabus:
3rd Semester CSE
```

The source may be retained as metadata/reference if the implementation
supports it.

The syllabus must remain usable after import even if the source filename
is not displayed everywhere.

------------------------------------------------------------------------

# 45. Library Boundary

Library is intentionally separate from the syllabus catalogue.

The product should not:

-   put syllabus workspaces inside Library,
-   make Library the main tree editor,
-   require every syllabus item to have a resource,
-   force uploaded resources into a single global location.

The detailed Library information architecture is not finalized in this
document.

Only the navigation boundary is required.

------------------------------------------------------------------------

# 46. Settings and Profile Boundary

Settings and Profile are global.

Do not place global account actions inside:

-   node menus,
-   syllabus menus,
-   import review controls.

Do not make Settings a child of a syllabus.

------------------------------------------------------------------------

# 47. End-to-End Journey A --- Import a Document

``` text
Sign in
  ↓
StudyOS Workspace
  ↓
Import Syllabus
  ↓
Enter syllabus name
  ↓
Upload file
  ↓
Processing/loading
  ↓
Review extracted structure
  ↓
Edit tree if necessary
  ↓
Confirm & Add to Syllabus List
  ↓
Persist new syllabus
  ↓
Full Syllabus Workspace
```

Detailed behavior:

1.  Student signs in.
2.  Student clicks Import Syllabus.
3.  Student enters `3rd Semester CSE`.
4.  Student uploads a supported PDF.
5.  System processes the document.
6.  Loading state is shown.
7.  Proposed tree appears.
8.  Student notices an incorrect topic.
9.  Student renames/deletes/adds/restructures as needed.
10. Student confirms.
11. Save succeeds.
12. `3rd Semester CSE` appears in Syllabus List.
13. The new syllabus becomes active.
14. Explorer displays the saved tree.
15. Student begins checking off completed topics.

------------------------------------------------------------------------

# 48. End-to-End Journey B --- Paste Text

``` text
Import Syllabus
  ↓
Name syllabus
  ↓
Paste syllabus text
  ↓
Review structure
  ↓
Edit proposal
  ↓
Confirm
  ↓
Syllabus List
  ↓
Full Syllabus Workspace
```

The paste flow is equivalent to file import after the input stage.

The text itself is not the final tree.

------------------------------------------------------------------------

# 49. End-to-End Journey C --- Create Manually

``` text
Syllabus List
  ↓
+
  ↓
Create manually
  ↓
Name syllabus
  ↓
Create
  ↓
Empty Full Syllabus Workspace
  ↓
Add first subject
  ↓
Build tree
```

No extraction stage exists.

------------------------------------------------------------------------

# 50. End-to-End Journey D --- Start with Empty Workspace

``` text
Syllabus List
  ↓
+
  ↓
Start with an empty workspace
  ↓
Name syllabus
  ↓
Create
  ↓
Empty Full Syllabus Workspace
```

The underlying empty-tree behavior may be the same as Create manually.

------------------------------------------------------------------------

# 51. End-to-End Journey E --- Reopen an Existing Syllabus

``` text
Syllabus List
  ↓
Select “2nd Semester CSE”
  ↓
Explorer loads its tree
  ↓
Main content loads selected node
  ↓
Student continues studying
```

The selected syllabus's data must remain isolated from all other
syllabuses.

------------------------------------------------------------------------

# 52. End-to-End Journey F --- Rename a Syllabus

``` text
Syllabus List
  ↓
⋯
  ↓
Rename
  ↓
Edit name
  ↓
Save
  ↓
Syllabus List + Workspace header update
```

No tree or completion data is recreated.

------------------------------------------------------------------------

# 53. End-to-End Journey G --- Delete a Syllabus

``` text
Syllabus List
  ↓
⋯
  ↓
Delete
  ↓
Confirmation
  ↓
Cancel OR Delete
  ↓
Syllabus removed if confirmed
  ↓
Syllabus List / Empty state
```

The application must always land in a valid state.

------------------------------------------------------------------------

# 54. End-to-End Journey H --- Edit the Saved Tree

``` text
Open syllabus
  ↓
Select node
  ↓
Context menu
  ↓
Add / Rename / Delete / Move
  ↓
Tree updates
  ↓
Progress recalculates if necessary
```

This is separate from import review.

The student owns the saved tree after confirmation.

------------------------------------------------------------------------

# 55. State Matrix

  -------------------------------------------------------------------------
  State                         Saved?       Tree editable? Main
                                                            destination
  --------------- -------------------- -------------------- ---------------
  Import entry                      No    No saved tree yet Import Syllabus

  File processing                   No                   No Import loading

  Paste                             No                   No Import loading
  processing                                                

  Review                            No     Yes, provisional Review page
  extracted                                                 
  structure                                                 

  Confirming               In progress          Temporarily Save operation
  import                                          protected 

  Saved imported                   Yes                  Yes Full Workspace
  syllabus                                                  

  Manually                         Yes                  Yes Full Workspace
  created empty                                             
  syllabus                                                  

  Empty workspace                  Yes                  Yes Full Workspace

  Existing                         Yes                  Yes Full Workspace
  syllabus                                                  
  selected                                                  

  Syllabus List      No saved syllabus                  N/A Empty Syllabus
  empty                                                     List
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# 56. Information Architecture Summary

``` text
STUDYOS
│
├── Activity Bar
│   ├── Syllabus List
│   ├── Import Syllabus
│   ├── Library
│   ├── Settings
│   └── Profile
│
├── Syllabus List
│   ├── Saved syllabus A
│   ├── Saved syllabus B
│   ├── Saved syllabus C
│   └── +
│       ├── Import syllabus
│       ├── Create manually
│       └── Start with an empty workspace
│
├── Import Syllabus
│   ├── Name
│   ├── Upload file
│   ├── Paste text
│   ├── Review extracted structure
│   └── Confirm
│
├── Full Syllabus Workspace
│   ├── Explorer
│   │   ├── Node
│   │   ├── Node
│   │   └── Node
│   │
│   └── Main Content
│       ├── Breadcrumb
│       ├── Node title
│       ├── Completion
│       ├── Checklist
│       ├── Notes
│       ├── Materials
│       └── Ask AI
│
├── Library
│
├── Settings
│
└── Profile
```

------------------------------------------------------------------------

# 57. Approved Mockup Mapping

The finalized reference mockup maps to the specification as follows.

## Screen A --- Import Syllabus

The mockup shows:

-   Activity Bar,
-   Import Syllabus title,
-   Syllabus Name,
-   Source File Info,
-   Review extracted structure,
-   expandable tree,
-   contextual Rename/Delete,
-   Back,
-   confirmation action.

Implementation must preserve this information architecture.

## Screen B --- Syllabus List

The mockup shows:

-   Syllabus List sidebar,
-   `+`,
-   saved syllabus rows,
-   selected row,
-   row `⋯` menu,
-   Rename,
-   Delete.

Implementation must use **Syllabus List** as the UI label.

## Screen C --- Full Student-Controlled Syllabus Workspace

The mockup shows:

-   Activity Bar,
-   Explorer,
-   active syllabus,
-   expanded hierarchy,
-   node controls,
-   breadcrumb,
-   Ask AI,
-   completion status,
-   progress,
-   Checklist,
-   Notes,
-   Materials,
-   Ask AI views.

This is the canonical saved-workspace state.

------------------------------------------------------------------------

# 58. What Must Not Be Added Automatically

Do not add the following to this user flow without a separate product
decision:

-   exam scheduling,
-   revision calendars,
-   streaks,
-   badges,
-   leaderboards,
-   gamified points,
-   adaptive mastery scores,
-   teacher dashboards,
-   classroom roles,
-   automatic AI processing of every resource,
-   mandatory AI interaction,
-   automatic saving of an imported tree without review,
-   fixed maximum tree depth,
-   a separate hierarchy-selection wizard,
-   complex Library functionality,
-   recovery/Trash/version history unless implemented.

The application should remain a focused syllabus workspace.

------------------------------------------------------------------------

# 59. Implementation-Dependent Areas

The following are intentionally not claimed as already implemented.

The coding implementation must define or confirm:

-   exact supported upload formats,
-   maximum file sizes,
-   OCR provider/behavior,
-   extraction model/provider,
-   persistence layer,
-   authentication mechanism,
-   autosave vs explicit save behavior,
-   resource storage,
-   deletion semantics,
-   whether uploaded source files are retained,
-   exact Library structure,
-   exact Notes editor,
-   exact Materials viewer,
-   exact AI provider,
-   AI context construction,
-   move/reorder interaction,
-   backend validation,
-   offline behavior,
-   recovery/version history.

The UI must reflect the real implementation rather than inventing
capabilities.

------------------------------------------------------------------------

# 60. Product-Level Acceptance Criteria

A coding agent should consider the core flow complete only when all of
the following are true.

## Navigation

-   [ ] Activity Bar contains Syllabus List, Import Syllabus, Library,
    Settings, and Profile.
-   [ ] Syllabus List is visibly distinct from Explorer.
-   [ ] Clicking Syllabus List opens the saved-syllabus catalogue.
-   [ ] Clicking a saved syllabus opens its Full Syllabus Workspace.
-   [ ] Switching syllabuses does not mix data.

## Creation

-   [ ] Student can import a supported file.
-   [ ] Student can paste syllabus text.
-   [ ] Student can create a syllabus manually.
-   [ ] Student can start an empty workspace.
-   [ ] Every creation path requires a syllabus name.

## Import

-   [ ] Imported content produces a provisional tree.
-   [ ] Review screen is separate from the saved workspace.
-   [ ] Student can edit the proposal.
-   [ ] Student must explicitly confirm before the tree becomes a saved
    syllabus.
-   [ ] Failed saves do not claim success.

## Syllabus List

-   [ ] Saved syllabuses appear in a compact list.
-   [ ] Student can select a syllabus.
-   [ ] Student can rename a syllabus.
-   [ ] Student can delete a syllabus after confirmation.
-   [ ] Empty Syllabus List state exists.
-   [ ] New syllabuses do not overwrite existing syllabuses.

## Full Workspace

-   [ ] Explorer displays the active syllabus tree.
-   [ ] Nodes can be selected.
-   [ ] Nodes can be added.
-   [ ] Nodes can be renamed.
-   [ ] Nodes can be deleted safely.
-   [ ] Structural editing is not limited to a rigid fixed depth.
-   [ ] Completion controls exist.
-   [ ] Parent progress derives from descendants.
-   [ ] Checklist, Notes, Materials, and Ask AI are available where
    implemented.
-   [ ] Empty syllabus workspace has a useful empty state.

## Reliability

-   [ ] Loading states exist where processing takes time.
-   [ ] Errors are understandable and actionable.
-   [ ] Destructive actions have appropriate confirmation.
-   [ ] Unsaved import-review edits are not silently discarded.
-   [ ] The interface never claims persistence before persistence
    succeeds.

------------------------------------------------------------------------

# 61. Final Design Principle

The entire StudyOS workspace should communicate one simple mental model:

> **Import the syllabus → review the proposed tree → save it as a named
> workspace → open it → own and manage the tree.**

The student should never wonder whether they are:

-   editing a temporary import proposal,
-   browsing saved syllabus workspaces,
-   or editing the actual saved syllabus.

These states must remain visually and behaviorally distinct.

The approved UI mockup establishes the intended foundation:

**Import Syllabus → Syllabus List → Full Student-Controlled Syllabus
Workspace**

That is the core StudyOS experience.
