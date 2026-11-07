# Problem Understanding — Syllabus-to-Evidence Learning Gap Auditor

## 1. Document Metadata

| Field | Value |
|---|---|
| Project / challenge title | **Syllabus-to-Evidence Learning Gap Auditor** |
| Problem statement ID | Not supplied |
| Organiser / event | Not supplied |
| Domain / track | EdTech + Generative AI, as stated in the supplied research report |
| Analysis date | 24 October 2026 |
| Primary source inspected | `problem_research(3).md` (uploaded research report, 2,122 lines) |
| Additional sources checked for this analysis | UNESCO guidance; current Google Gemini Notebook help pages; Quizlet AI Study Tools; CourseKG paper; PubMed-indexed systematic review of retrieval/distributed practice |
| Status of problem statement | **Proposed problem derived from a research report; not verified as an official organiser-issued problem statement** |
| Target context in supplied report | Student-facing, low-cost, web-first MVP; India-compatible |
| Team/time/hardware context | The supplied report assumes 2–4 developers, a 24–48 hour build window, AI-assisted coding, about 8 GB RAM, no dedicated GPU, and limited budget. These are planning assumptions, not confirmed organiser constraints. |
| Information unavailable | Official event name and rules, PS ID, official judging rubric, mandatory stack, deployment/submission format, API restrictions, verified target-user research, and a supplied real-world dataset |
| Analysis limitation | The research report is the substantive input. The cited market and research claims have not all been independently re-tested. A small current-source check was performed where it materially affects the interpretation, particularly for Gemini Notebook's study features. |

### Evidence labels used throughout

- **Source-stated:** Present in the uploaded research report or a currently checked source.
- **Strongly implied:** Needed to deliver the described workflow, but not phrased as an explicit requirement in an official PS.
- **Analyst recommendation:** A proposed design, priority, metric, or acceptance test intended to make the problem implementable and verifiable.
- **Unknown / confirm:** Not established by the supplied evidence.

**Important distinction:** Priority labels (`P0`–`P3`) below are analyst-assigned implementation priorities. They are not official hackathon requirements or judging weights.

---

## 2. Executive Summary

The proposed problem concerns students who have a syllabus and a collection of notes, slides, PDFs, or other study materials, but cannot easily tell which syllabus topics those materials actually support. A second, related uncertainty remains even when material exists: a student may mark a topic complete without demonstrating that they can recall or explain the important concepts. The proposed solution links a structured syllabus to specific source passages, identifies topics with missing or weak evidence, and then offers short questions grounded in the available material. It records **material coverage** and **practice evidence** as separate states and recommends a next action. The value is a transparent audit trail—not an assertion that AI can measure a student's full psychological mastery or guarantee higher grades.

**One-sentence teammate explanation:** Upload a syllabus and study materials; the tool builds a topic tree, shows which topics have real supporting passages, and lets a student test selected topics using source-grounded practice.

**Non-technical explanation for a judge:** It is a smart checklist that does more than let students tick chapters as complete: it shows where in their notes each syllabus topic is covered, flags topics with no useful evidence, and asks a student to demonstrate the concept before showing a practice status.

**Technical explanation for a developer:** Parse a syllabus into an editable hierarchy; extract and chunk uploaded documents with provenance metadata; retrieve relevant passages for each topic; classify support conservatively; cite evidence; generate questions only from adequate retrieved passages; grade answers against an explicit rubric; and update a topic-level evidence state using deterministic state-transition logic.

### Problem selected

**Syllabus-to-Evidence Learning Gap Auditor:** a student-controlled, syllabus-first workflow that links three different artifacts:

`Syllabus requirement → Source passage → Practice response → Evidence state → Next action`

### Core outcome

The minimum credible outcome is a system that can process a new syllabus and an intentionally incomplete set of learning materials, make topic coverage inspectable, refuse to invent support for absent content, and update a topic's practice state after a user response.

### Main caveat

The uploaded report identifies a potentially useful combination of capabilities, but does not establish that the combination is unique or that students will adopt it. Current Google documentation describes study notebooks with diagnostic quizzes, personalised lessons, and progress tracking; Quizlet also offers AI study generation and practice. Therefore the team must differentiate through a demonstrably stronger **syllabus-to-source evidence audit and transparent state model**, and should validate this by hands-on competitor testing rather than relying on a broad novelty claim.

---

## 3. The Problem in Plain English

A syllabus says what a student is expected to learn. Study materials show what information the student has available. Practice answers offer limited evidence of what the student can currently recall or explain. These pieces are often kept in separate files and apps, so the student has to manually compare them and judge progress.

The practical questions are:

1. **What exactly am I required to learn?**
2. **Which of those topics are covered by the materials I actually have?**
3. **Where is the supporting passage?**
4. **Which topics have no evidence or only weak evidence?**
5. **Have I tried to retrieve or explain the topic, and how did I do?**
6. **What is the most useful next action?**

The proposed tool should answer these questions without treating a fluent AI answer as proof. A topic with no supporting source should not be shown as covered merely because a language model can answer from its general training. Likewise, one correct answer should not be described as definitive proof of mastery.

### What the problem is not

- It is not simply a chatbot for asking questions about PDFs.
- It is not merely a folder/tree interface for organising chapters.
- It is not an AI that guarantees exam scores or diagnoses learning ability.
- It is not a full institutional learning-management system.
- It is not a requirement to train a new foundation model.

### Why a tree alone is insufficient

A hierarchical view of units, chapters, topics and subtopics is useful, but organisation alone does not answer whether material supports each topic. The important additional layer is evidence: a topic should link to relevant source passages and to the results of any practice task. A visually polished tree with manually assigned “complete” ticks would not solve the selected problem.

---

## 4. Problem Context and Root Causes

### 4.1 Current workflow described by the source report

The supplied report describes a typical self-directed workflow: a student opens a syllabus, identifies topics, searches notes or slides, reads material, marks topics complete, finds practice questions, and subjectively decides whether they understand the topic. It argues that the missing artifact is a traceable, topic-level evidence state.

This workflow is a plausible account from the research report, not a measured finding from interviews with a representative student sample. The report explicitly says no student interviews or controlled educational-effectiveness experiment were conducted.

### 4.2 Root causes and supporting status

| Root cause | Explanation | Evidence status |
|---|---|---|
| Fragmented study material | A syllabus, notes, lecture slides, textbook extracts and practice materials may live in separate files or services. | Described in the source report; prevalence for a target cohort remains unmeasured. |
| Flat or non-operational syllabus structure | A syllabus may be a document of headings rather than a topic map connected to learning evidence. | Source report's analysis; actual syllabus formats will vary. |
| Completion used as a proxy | A student may mark a topic complete after reading it, despite not having tried to retrieve the relevant ideas. | Plausible problem mechanism; student-specific behaviour is not quantified in the source. |
| Missing provenance | A generated answer may not make the source supporting each claim obvious. | General LLM factuality risk is supported by the research cited in the source report; exact error rates for the selected model remain unknown. |
| Topic-to-source alignment is manual | Students often have to search for the same concept under different wording across several documents. | Source report's workflow hypothesis; time and error costs must be measured. |
| Content coverage and learning evidence are conflated | Having a passage about a topic is different from being able to explain it. | Central product distinction; the system must preserve these as separate dimensions. |

### 4.3 Symptoms versus underlying problem

**Symptoms:** untracked gaps, repeated manual searching, uncertainty about what to study, and unchecked confidence from passive reading.

**Underlying problem to target:** no reliable, inspectable relationship between the explicit curriculum requirements, the learner's available source material, and the evidence generated by practice.

The proposed system can reduce the work required to discover these relationships, but it cannot infer everything reliably from arbitrary documents. In particular, source retrieval can miss a relevant passage, a syllabus may be ambiguous, and a brief answer may be insufficient to estimate durable learning.

### 4.4 Consequences of doing nothing

Potential consequences described or implied by the report include time spent on already well-supported topics while other topics remain uncovered, late discovery of missing material, poor study prioritisation, unsupported AI explanations, false confidence, and repeated manual comparison. These are credible failure scenarios, but the report does not provide measured baseline rates or quantified savings. The project must not claim it reduces study time or improves grades unless these outcomes are tested.

### 4.5 External factors

- Document quality and structure vary by institution and subject.
- Source language, terminology and formatting affect extraction and retrieval.
- Hosted LLM availability, pricing and rate limits may change.
- A student's uploaded materials may be copyrighted or personally sensitive.
- Educational outcomes depend on far more than one application, including study habits, assessment design and instructional context.

---

## 5. Stakeholders and User Needs

| Stakeholder | Role / interaction | Needs and pain points | Success criteria |
|---|---|---|---|
| Primary: self-directed student | Uploads a syllabus and their own learning materials; reviews topic evidence; answers practice questions. | Wants to find real coverage gaps quickly, understand why a topic is flagged, and choose a next step without manually searching every file. | Can inspect extracted topics, trace coverage claims to passages, identify missing support, and understand the current practice state. |
| Student with incomplete or uneven notes | Uses a syllabus and a deliberately incomplete collection of resources. | May not have material for every topic, and must distinguish “I do not have evidence” from “I do not understand this topic.” | Missing material is clearly flagged; the application does not generate a false source-grounded question for an unsupported topic. |
| Teacher / teaching assistant | Potential future reviewer or material provider. | May want to see curriculum alignment or identify gaps in course materials. | Future use would require review permissions, explainability, and stronger validation. Not required for MVP. |
| Curriculum designer / institution | Potential future stakeholder, not the primary MVP user. | Needs reliable curriculum mapping, controlled data access, and consistency across many learners or courses. | Out of scope without further requirements, privacy design and institutional integration. |
| AI/model provider | Supplies optional extraction, generation or grading capability. | Rate limits, data handling terms, output constraints, availability and cost. | Provider failure must not corrupt stored state or make all deterministic functionality unusable. |
| Hackathon judge / evaluator | Tries the product, reviews evidence and challenges claims. | Needs a reproducible demonstration that is not hard-coded to a prepared syllabus. | Can upload or choose a fresh test case and verify topic extraction, evidence links, missing-topic detection and state changes. |
| People whose content appears in uploads | Authors or rights holders of notes, textbooks or other documents. | Copyright, confidentiality and control over stored material. | Clear handling expectations; source documents are not redistributed, and only necessary data is retained. |

No elaborate personas are required at this stage. The strongest justified target is a student who prepares for a course using a syllabus and several personal or institutional study resources. Institution-wide roles should remain future stakeholders until validated.

---

## 6. Problem Decomposition

The problem is decomposed by the evidence workflow, not by an assumed final software architecture.

| ID | Subproblem | Inputs → outputs | Why it matters / dependencies | Difficulty | Scope classification |
|---|---|---|---|---|---|
| SP-01 | Syllabus intake and structure extraction | Syllabus file/text → units, topics, subtopics, learning outcomes when explicitly present | Defines the required curriculum; all later mapping depends on it. | Medium; syllabus layouts vary. | Core / source-stated in proposed workflow |
| SP-02 | Structure review and correction | Extracted hierarchy → student-confirmed topic tree | Extraction can merge, omit or split topics incorrectly; correction provides a recovery path. | Low–medium. | Strongly implied / recommended |
| SP-03 | Study-material intake | PDFs, DOCX, TXT/Markdown or pasted notes → readable text and metadata | No coverage audit is possible without source text. | Medium; malformed or scanned files complicate parsing. | Core |
| SP-04 | Passage segmentation and provenance | Text → chunks with file, page/section where available, and chunk IDs | Supports retrieval and citations that point to actual evidence. | Medium. | Core |
| SP-05 | Topic-to-evidence matching | Topic + chunks → ranked relevant passages | Central technical problem: find support even when wording differs without overclaiming relevance. | High relative to MVP. | Core |
| SP-06 | Coverage classification | Ranked evidence → missing / weak / adequate / uncertain state | Converts raw retrieval into a useful student-facing conclusion. False positives and false negatives both matter. | High; thresholds require validation. | Core |
| SP-07 | Evidence inspection | Topic state → source passage, location and explanation | Makes the system auditable and lets users challenge results. | Medium. | Core |
| SP-08 | Grounded practice generation | Adequate source evidence + selected topic → question, expected answer/rubric and cited source | Produces observable learning evidence while avoiding unsupported questions. | Medium–high. | Core but can be restricted to one question type in MVP |
| SP-09 | Response evaluation | Question, rubric, source and student response → outcome and feedback | Results can be inconsistent, especially for short-answer grading. | High; constrain the rubric. | Core at small scale |
| SP-10 | Independent state tracking | Coverage evidence + practice history → current topic status | Prevents source coverage from being confused with learning evidence. | Medium; rules should be deterministic. | Core |
| SP-11 | Next-action selection | Gaps, practice outcomes and explicit syllabus importance → suggested next step | Turns audit output into an actionable workflow. | Low–medium if rule-based. | Core-lite / valuable |
| SP-12 | Evaluation and demonstration | Known syllabus/material set + manually labelled expected results → metrics and reproducible demo | Shows the system works beyond a visual mock-up. | Medium. | Essential for credible completion |

### Dependency order

The logical dependency chain is:

`SP-01 → SP-02 → SP-03 → SP-04 → SP-05 → SP-06/SP-07 → SP-08 → SP-09 → SP-10 → SP-11`

Evaluation (SP-12) should be built alongside the pipeline, not postponed until the end. UI work can proceed in parallel against a small agreed data contract, but it should not assume final coverage scores or topic states before the team defines them.

### Parallelisable work

Syllabus parsing and material parsing can be tested independently. A frontend can build around sample JSON while the retrieval and state logic are developed. Question generation can initially use manually prepared source chunks. End-to-end integration is most at risk where identifiers, source offsets, page metadata, and state meanings differ between modules.

---

## 7. Functional Requirements Register

The table converts the supplied proposed problem into testable capabilities. Because no official organiser-issued PS was provided, these are **product requirements derived from the research report**, not official rules.

| ID | Requirement | Source / evidence | Classification | Priority | Verification | Open questions |
|---|---|---|---|---|---|---|
| FR-001 | Accept a user-provided syllabus as a supported file or pasted text. | Research report, §11 and §17. | Proposed core requirement | P0 | Upload a valid supported syllabus and confirm processing starts. | Is a deployed web upload explicitly required by event rules? |
| FR-002 | Extract a hierarchy of units, topics and subtopics, retaining explicit learning outcomes when present. | Research report, syllabus intake specification. | Proposed core requirement | P0 | Compare extraction against a manually annotated syllabus. | What tolerance is acceptable for ambiguous syllabus structure? |
| FR-003 | Preserve original syllabus wording and allow the user to review/correct extracted topics. | Source report's normalization/provenance discussion; editability is a reliability recommendation. | Strongly implied / recommendation | P1 | Change a topic label and verify the original text remains traceable. | Should hierarchy edits be persisted across sessions? |
| FR-004 | Accept study materials in at least PDF and TXT/Markdown; DOCX is also listed in the source report. | Research report, §11 and §17. | Proposed core requirement | P0 | Upload one sample of each implemented format. | Is PDF + TXT sufficient if time is short, or is DOCX expected? |
| FR-005 | Extract document text and retain source metadata, including filename and page/section where available. | Research report, chunking and citation specification. | Proposed core requirement | P0 | Inspect stored chunks and verify cited locations. | How should page locations be represented for non-PDF sources? |
| FR-006 | Split material into retrievable passages with stable chunk identifiers. | Research report, §11.4. | Proposed core requirement | P0 | Re-run processing and verify every evidence link resolves to its stored chunk. | What chunking size/overlap performs acceptably? |
| FR-007 | Match each syllabus topic to candidate supporting passages using lexical and/or semantic retrieval. | Research report, §11.4 and §13. | Proposed core requirement | P0 | Evaluate on manually labelled relevant and irrelevant passages. | Which embedding/model provider is affordable and available? |
| FR-008 | Classify each topic's material evidence as missing, weak/uncertain, or sufficiently supported using documented rules. | Research report, selected problem and state model. | Proposed core requirement | P0 | Test topics with known present, partial and absent evidence. | What evidence threshold and labels will be used? |
| FR-009 | Display evidence citations that open or reveal the actual source passage and location. | Research report, central differentiation and acceptance tests. | Proposed core requirement | P0 | Sample every evidence card and validate relevance and location. | Must citations use page numbers, section headings, or both? |
| FR-010 | Do not claim source coverage or generate a source-grounded question when adequate source evidence is absent. | Research report, edge-case requirements. | Proposed core requirement | P0 | Remove all relevant material and confirm the system returns a gap/insufficient-evidence state. | Is a generic question permitted if explicitly labelled as external/general knowledge? Not required for MVP. |
| FR-011 | Generate a short practice question for a topic with adequate supporting evidence, using the retrieved evidence as context. | Research report, §11 and §17. | Proposed core requirement | P0 | Verify an answer can be found in the cited passage and the question is topic-aligned. | Are multiple-choice and short answer both necessary? |
| FR-012 | Record the student's response and assess it using a defined answer key or rubric. | Research report, answer-evaluation workflow. | Proposed core requirement | P0 | Submit strong and weak test answers and compare with expected rubric outcomes. | Should the MVP start with multiple-choice to reduce grading ambiguity? |
| FR-013 | Keep material coverage and practice outcome as separate evidence dimensions. | Research report, originality and differentiation audit. | Core design rule | P0 | Verify that adding notes changes coverage, while answering a question changes practice state without silently changing source coverage. | Exact UI representation remains open. |
| FR-014 | Update the topic state deterministically from evidence and the practice result, using explicit state-transition rules. | Research report, suggested state model and system requirements. | Proposed core requirement | P0 | Run scripted answer/state-transition tests. | What is the minimum evidence for `DEMONSTRATED`? |
| FR-015 | Recommend a next action based primarily on missing evidence and weak practice; use syllabus importance only when available. | Research report, §11.4. | Proposed core requirement at basic rule level | P1 | Test recommendation ordering on a known topic set. | Should users be able to override the suggested priority? |
| FR-016 | Work on a new syllabus/material pair rather than only hard-coded demo content. | Research report, reproducible demonstration and acceptance test F. | Core acceptance requirement | P0 | Upload an unseen syllabus and confirm topics are not drawn from a fixed list. | Does organiser judging require live uploads or is a fresh test file sufficient? |
| FR-017 | Give explicit errors for unreadable, unsupported, empty or over-limit files. | Research report, validation list. | Strongly implied | P1 | Upload malformed and unsupported samples. | File size limits are not specified. |
| FR-018 | Allow adding a new source and rerunning the coverage mapping for a material-gap topic. | Research report, edge case and demo sequence. | Proposed supporting requirement | P1 | Add a source for a previously missing topic and verify its evidence state is recalculated. | How should stale states be invalidated after source changes? |
| FR-019 | Display the topic tree, material-evidence state, practice state, citation access and next action in a comprehensible interface. | Research report, expected outputs. | Proposed presentation requirement | P1 | Complete the core workflow without developer assistance. | Official UX/accessibility criteria are unknown. |
| FR-020 | Maintain enough session/project state to show current topic evidence and practice history during the demonstration. | Persistent state implied by research report. | Strongly implied | P1 | Refresh or revisit the project according to the chosen persistence design. | Account/login requirements are unknown; do not assume authentication is mandatory. |

### Minimum functional slice

If time becomes critically constrained, preserve FR-001, FR-002, FR-004 through FR-014, and FR-016. A smaller but honest version may support one question type and a limited set of file types. It should not simulate coverage with hard-coded labels or present AI-generated status as verified fact.

---

## 8. Non-Functional Requirements Register

No official numerical quality thresholds were supplied. The targets below are proposed evaluation properties, not official competition requirements.

| ID | Requirement | Source / evidence | Classification | Priority | Verification | Open questions |
|---|---|---|---|---|---|---|
| NFR-001 | Evidence claims must be inspectable and traceable to real source passages. | Core problem definition; source-grounded design. | Proposed core quality requirement | P0 | Manually audit a sample of displayed citations and claims. | What minimum citation-validity rate is acceptable? |
| NFR-002 | The system must fail safely when evidence is absent or too uncertain; uncertainty must not be silently converted to coverage. | Report risk analysis. | Proposed core quality requirement | P0 | Adversarial missing-topic test. | Which labels and confidence thresholds communicate uncertainty clearly? |
| NFR-003 | Topic structure, coverage, and practice states must be understandable to a non-technical student. | Target-user workflow. | Proposed usability requirement | P1 | Brief task-based usability check with at least one person outside the build team, if available. | Are user tests feasible during the event? |
| NFR-004 | Core parsing, provenance, storage and state transitions should not depend entirely on the LLM provider being available. | Report's API-failure mitigation. | Proposed resilience requirement | P1 | Simulate provider failure and verify existing evidence remains viewable. | Which components must have a non-AI fallback? |
| NFR-005 | The MVP should be usable on ordinary student hardware without a dedicated GPU. | Target context and report feasibility rationale. | Assumed constraint / design target | P1 | Test on the team's available hardware and record resource use. | Actual target hardware is not confirmed by organiser. |
| NFR-006 | Keep the operating cost low and make provider/API dependencies visible. | Report's low-cost India-compatible context and limited budget assumption. | Assumed constraint / recommendation | P1 | Estimate cost per document/question and note free-tier limits. | What spend, if any, is allowed? |
| NFR-007 | Upload and retention behaviour must be clear; unnecessary source material should not be retained. | UNESCO guidance cited in source report; privacy risk analysis. | Proposed privacy requirement | P0 | Inspect storage/deletion behaviour and user-facing copy. | Must processing be local, or are hosted services permitted? |
| NFR-008 | Access to uploaded materials and practice records must be scoped to the relevant user/session if multi-user storage is implemented. | Privacy/security inference. | Strongly implied if accounts or shared backend exist | P1 | Attempt cross-session access in tests. | Is authentication in scope? |
| NFR-009 | The application must handle common extraction failures and preserve a recoverable path for user correction. | Source report's input validation and topic-editing recommendations. | Proposed robustness requirement | P1 | Malformed-file, empty-text and wrong-topic tests. | Which formats are mandatory for demo? |
| NFR-010 | Evaluation should be repeatable with a documented test syllabus, material set, labels and answer rubric. | Source report's measurement plan. | Proposed reproducibility requirement | P1 | Run the same benchmark twice and compare deterministic components. | What run-to-run variation is acceptable for LLM outputs? |
| NFR-011 | UI/API behaviour should remain responsive enough for a live demonstration. | Hackathon demo context. | Proposed practical requirement | P2 | Record end-to-end latency on the demo bundle. | No official response-time threshold exists. |
| NFR-012 | The model must not expose private uploaded content in logs or unrelated outputs. | Privacy-by-design recommendation. | Proposed security requirement | P1 | Review logs, prompts, error messages and retention settings. | Provider data-handling terms need review once a provider is chosen. |

### Suggested measurable targets to agree on before testing

These are **proposals**, not source-stated thresholds:

- Use a manually annotated syllabus to report topic extraction precision/recall or exact-match performance.
- Use a labelled passage set to report coverage precision and recall.
- Audit citation validity separately from retrieval similarity score.
- Measure agreement between answer-rubric decisions and automated practice states.
- Record end-to-end processing time for a fixed demo bundle.
- Report failures explicitly rather than excluding them from the results.

Do not publish a score as a validated “learning mastery percentage.”

---

## 9. Inputs, Processing, Outputs and System Boundaries

### 9.1 Inputs

| Input | Purpose | MVP format support proposed in source report | Validation needed |
|---|---|---|---|
| Syllabus | Defines required course scope. | PDF, DOCX, TXT/Markdown, or pasted text. | Readable text; headings/list structure if available; non-empty extraction. |
| Study materials | Evidence for whether a topic is supported. | At least PDF and TXT/Markdown; DOCX also proposed. | Format, file size, extraction success, metadata. |
| Student practice response | Provides observed response evidence for one topic. | Short text or multiple-choice selection. | Non-empty, connected to the correct question/topic, bounded length. |
| Configuration / rubric | Defines the rules used to classify support and evaluate answers. | Internal configuration for MVP. | Versioned and documented; not silently changed between runs. |

**Not required for MVP:** external URLs, video ingestion, OCR for images/scanned slides, LMS integration, or institution-specific datasets. Those may be future extensions only after the core document workflow works.

### 9.2 Preconditions

- The syllabus contains text from which topics can be extracted, or the user can manually provide/edit the topic list.
- Source documents are readable by the implemented parser.
- A selected topic has at least one sufficiently relevant source passage before a source-grounded question is offered.
- The question has an identifiable topic and source context.
- An answer-evaluation rule exists before a response is translated into a practice state.

### 9.3 Logical processing flow

`Upload syllabus → Validate/extract → Review topic tree → Upload materials → Extract/chunk with provenance → Retrieve topic evidence → Classify coverage → Inspect cited passages → Generate grounded practice → Record response → Evaluate rubric → Update practice state → Recommend next action`

The sequence should branch safely when no adequate source is found:

`No adequate evidence → Mark MATERIAL_GAP / insufficient evidence → Explain why → Invite material upload or manual attachment → Re-run mapping`

### 9.4 Outputs

- Editable hierarchy of units, topics and subtopics.
- Material coverage state per topic, with source passage(s), filename, and location where available.
- Explicit missing or uncertain evidence states.
- A grounded question for a topic with sufficient evidence.
- Feedback and an observable practice result based on a defined rubric.
- A separate practice state, such as `NOT_ATTEMPTED`, `PRACTICE_WEAK`, or `DEMONSTRATED`.
- A simple next-action recommendation.
- Enough visible information for a judge to verify how the system arrived at its state.

### 9.5 Postconditions

After successful processing, each extracted topic should retain its relationship to its original syllabus wording. Any material-coverage state should have a resolvable evidence record or an explicit reason that no evidence was found. Every practice attempt should be linked to a topic, question, source context, response and rubric outcome. A state update should follow documented rules.

### 9.6 Failure conditions and expected behaviour

| Failure | Required response |
|---|---|
| Syllabus text cannot be extracted | Explain the failure and offer a supported alternative such as pasted text; do not show a fabricated topic tree. |
| Topic extraction is ambiguous | Mark the structure for review or allow the user to correct it. |
| Study material is unreadable or unsupported | Report the exact file-level failure and continue with other readable sources where possible. |
| No relevant passage found | Show `MATERIAL_GAP` or `INSUFFICIENT_EVIDENCE`; do not generate a falsely grounded question. |
| Retrieval yields weak/ambiguous evidence | Show uncertainty and the candidate evidence; allow manual correction/attachment. |
| AI provider times out or is rate-limited | Preserve existing data, surface an error and retry/fallback without falsely updating state. |
| Answer grading is ambiguous | Show an uncertain/inconclusive result rather than pretending the rubric unambiguously passed or failed. |
| Source material is changed or removed | Invalidate/recompute affected evidence states and prevent stale citations from being presented as current. This behaviour is recommended; exact implementation remains open. |

### 9.7 Feedback loop

A newly uploaded source should trigger remapping for affected topics. A new practice response should update practice evidence but must not by itself change whether source material exists. This separation is essential to the product's logic.

### 9.8 Boundaries

The system audits **the uploaded syllabus and uploaded study corpus**. It cannot prove that the syllabus itself is complete, that the uploaded documents represent every resource the student has, that a student has durable long-term knowledge, or that the system's chosen question fully assesses the topic. These limitations should be visible in product copy and the demo.

---

## 10. Domain-Specific Technical Interpretation

This is an EdTech/software problem with a generative-AI component. It does not inherently require custom model training, advanced adaptive-learning research, or a large-scale educational knowledge graph.

| Concept | Meaning | Why it matters here | What is required / not settled |
|---|---|---|---|
| Syllabus parsing | Convert a document's hierarchy and text into structured curriculum items. | Defines what must be covered and gives every topic a stable identity. | Required. PDF/DOCX parsing and/or a structured extraction model are implementation choices. |
| Topic normalization | Map wording variants to a canonical label while retaining the original phrase. | A syllabus heading and the wording used in notes may differ. | Useful. Must not erase or replace original wording. |
| Knowledge graph / topic tree | Represent entities (units, topics, sources, attempts) and relationships between them. | Makes the relationship between a syllabus topic and its supporting evidence visible. | A simple tree plus source/topic relations is enough. A complex graph database is not required. |
| Document chunking | Split long files into smaller passages for retrieval and citation. | Enables topic-specific search and passage-level evidence. | Required if using passage retrieval. Chunk boundaries and overlap must be tested. |
| Lexical search | Match words/phrases directly. | Helps exact syllabus terms, acronyms and domain-specific names. | One viable technique; can be combined with semantic retrieval. |
| Embeddings / semantic retrieval | Represent text in vectors so related ideas can match despite different wording. | Helps identify conceptually relevant passages. | Recommended option, not a mandated technology. Embedding quality and provider cost are unknown. |
| Hybrid retrieval | Combine lexical and semantic signals. | Reduces dependence on a single similarity method. | A sensible candidate, but benchmark results should decide if complexity is justified. |
| Evidence scoring | Combine retrieval signals and source checks into a coverage state. | Converts search results into readable output. | Must be documented and evaluated. It is not a validated measure of syllabus completeness by default. |
| Retrieval-augmented generation (RAG) | Provide retrieved source passages to an LLM when generating a response. | Helps ground questions/explanations in user material. | Useful for practice generation; citations still need independent checking. RAG does not guarantee truth. |
| Structured outputs | Require model output in a schema, such as topic objects or question/rubric fields. | Makes pipeline integration more robust than free-form text. | Recommended when an LLM is used. Validate the output before storing it. |
| Retrieval practice | Ask a learner to recall or explain information, instead of only rereading it. | Provides an observable response signal and can reveal topics requiring further effort. | Supported by learning-science literature, but one short test does not prove mastery or guarantee grade improvement. |
| Rubric-based answer evaluation | Compare the response with expected ideas or a scoring guide. | Keeps grading more consistent and explains why an answer was judged weak or adequate. | Required if short-answer responses change the practice state. Must permit uncertain cases. |
| State machine | Explicit rules for how statuses change when evidence changes. | Prevents UI labels from being arbitrary or silently contradictory. | Required as a design principle. Exact states and thresholds are analyst decisions. |
| Provenance | Metadata describing where a claim or passage came from. | Lets the user or judge verify a coverage claim and reproduce results. | Required differentiator: preserve file, page/section where possible, and chunk ID. |
| Evaluation benchmark | A set of inputs with manually checked expected outputs. | Provides evidence that extraction/retrieval/state logic work. | Required for credible demonstration; size depends on available time. |

### 10.1 Suggested topic evidence model

The source report proposes states such as `UNMAPPED`, `MATERIAL_GAP`, `WEAK_EVIDENCE`, `READY_TO_PRACTICE`, `PRACTICE_WEAK`, `DEMONSTRATED`, and `REVIEW`. These should be treated as **product states**, not scientific labels describing the student's mind.

A clearer MVP model separates two dimensions:

**Material evidence**
- `UNMAPPED`: extracted topic has not been evaluated against materials.
- `MATERIAL_GAP`: no adequate relevant passage found.
- `WEAK_EVIDENCE`: some relevant passage may exist, but the system cannot confidently claim adequate support.
- `SUPPORTED`: one or more relevant passages were reviewed/accepted as supporting the topic.

**Practice evidence**
- `NOT_ATTEMPTED`: no response exists.
- `PRACTICE_WEAK`: recent response did not meet the configured rubric.
- `DEMONSTRATED`: response met the configured rubric for the specific question/attempt.
- `REVIEW`: a prior practice result exists but the review policy says it is due again.

This two-axis design avoids forcing a topic into a single label that hides important differences. For example, a topic can be `SUPPORTED + NOT_ATTEMPTED`, or `MATERIAL_GAP + NOT_ATTEMPTED`. `DEMONSTRATED` should mean only that the current configured practice criterion was met, not that the learner has durable mastery.

### 10.2 Deterministic versus AI-assisted responsibilities

**Prefer deterministic code for:** file validation, source IDs, chunk metadata, database writes, citation resolution, aggregation of known scores, state transitions, error handling and rendering.

**AI may assist with:** ambiguous topic extraction, semantic normalization, evidence summarisation/verification, question generation and short-answer feedback.

Do not use an LLM where a deterministic rule is sufficient. Do not let unvalidated free-text model output directly change persistent state.

### 10.3 Hardest technical challenge

The hardest part is not drawing a graph or generating a fluent question. It is maintaining a reliable relationship between **a topic, a genuinely relevant passage, a question answerable from that passage, a defensible evaluation rule, and the status shown to the user**. Every link can fail independently. The system should expose evidence and uncertainty rather than hiding these failures behind a single score.

---

## 11. Data and Evidence Requirements

### 11.1 Available input data

The uploaded report provides example text for a Data Structures syllabus with six topics and an intentionally incomplete set of lecture materials covering only four of those topics. This is a **synthetic demonstration scenario**, not a real-world benchmark dataset. No actual corpus of students' syllabi, learning materials, or responses was supplied with the report.

### 11.2 Data required by the MVP

| Data item | Required fields / metadata | Why needed | Availability |
|---|---|---|---|
| Syllabus text | Original text; detected unit/topic hierarchy; source file and location if feasible | Defines expected coverage and makes extraction review possible. | Must be provided by the demo user or created for testing. |
| Extracted topic table | Topic ID, original label, canonical label if used, parent ID, original ordering, extraction status | Provides stable structure for mapping and UI. | Must be generated by system. |
| Study source record | Source ID, filename/title, format, processing status | Identifies uploaded material. | Must be generated from uploads. |
| Source chunk | Chunk ID, source ID, text, page/section when available, extraction offsets if feasible | Provides evidence and citation targets. | Must be generated by parser. |
| Topic–evidence links | Topic ID, chunk ID, retrieval features/scores, verification status, final classification | Stores why a topic is marked supported or uncertain. | Must be generated and reviewable. |
| Practice question | Question ID, topic ID, prompt, source chunk IDs, expected answer or rubric, generation status | Binds question to both topic and source evidence. | Generated only when adequate evidence exists. |
| Practice attempt | Attempt ID, question ID, answer, rubric result, feedback, timestamp | Supplies observed practice evidence and state transitions. | Generated from user interaction. |
| Ground-truth benchmark labels | Expected syllabus topics; relevant/irrelevant passages; missing topics; expected answer-rubric outcomes | Allows evaluation independent of the model's own output. | Must be manually prepared for at least a small test set. |

### 11.3 Data quality risks

- Scanned PDFs may contain no extractable text.
- Tables, formulae, code snippets, diagrams and multi-column layouts may be corrupted by extraction.
- Topic titles may be ambiguous or nested inconsistently.
- One passage may only mention a topic without explaining it.
- Relevant material may use synonyms or abbreviations not present in the syllabus.
- Duplicate files or overlapping notes can inflate naive support counts.
- Long documents can exceed model context or slow processing.
- A generated answer key may be incomplete or inconsistent with the source.

### 11.4 Evaluation data strategy

Use two distinct test sets:

1. **Controlled smoke-test dataset:** the report's six-topic Data Structures example, with four supported topics and two intentionally missing topics. This checks the end-to-end logic and demo behaviour.
2. **Small human-labelled benchmark:** several syllabus topics and excerpts where a reviewer labels which passages are genuinely relevant, weak, or absent. This helps measure false coverage and missed coverage rather than merely proving the application works on one carefully prepared example.

Synthetic data is acceptable for demonstrating a clearly labelled prototype and testing state changes. It is not evidence of real student demand or educational effectiveness.

### 11.5 Suggested metrics

| Metric | Definition | What it reveals | Limitation |
|---|---|---|---|
| Topic extraction precision / recall | Agreement between extracted topics and manually annotated topics. | Whether the syllabus structure is being represented correctly. | Topic boundaries may be subjective; report exact matching rules. |
| Evidence mapping precision | Fraction of passages labelled supportive that a reviewer agrees genuinely support the topic. | False-positive coverage claims. | Requires human-labelled passages. |
| Evidence mapping recall | Fraction of known relevant passages the retrieval system finds. | Missed coverage. | Depends on the definition and completeness of the labelled corpus. |
| Missing-topic detection | Correctly flagged missing topics divided by known missing topics, alongside false alarms. | Whether the system identifies intentionally absent content. | A toy test set can overstate performance. |
| Citation validity | Fraction of sampled citations that resolve and support the associated claim. | Whether claims are traceable and actually grounded. | Citation resolution and citation relevance should be measured separately. |
| Question grounding | Fraction of generated questions answerable from the cited passage and actually associated with the selected topic. | Whether practice is truly source-grounded. | Does not establish question pedagogical quality by itself. |
| Practice-state agreement | Agreement between automated state decisions and a predefined answer rubric reviewed by a human. | Consistency of grading/state changes. | A small benchmark does not validate an educational assessment instrument. |
| End-to-end latency | Time from upload to first usable coverage map, and time to generate/grade a question. | Live-demo practicality. | No official threshold supplied; report test conditions. |
| Manual baseline comparison | Time and missed gaps when a person manually checks syllabus versus a document folder. | Whether the tool plausibly reduces manual effort. | Needs a fair protocol and multiple examples before generalising. |

### 11.6 Privacy, permission and licensing

Study materials may include copyrighted textbooks, personal notes, or sensitive educational information. The product should make retention behaviour clear, minimise storage, avoid redistributing full source documents, and avoid sending private material to external services unless the user understands and accepts that handling. The report cites UNESCO's guidance on human-centred educational GenAI, privacy and validation; the official UNESCO page was checked and was last updated on 16 January 2026. [S1]

No privacy jurisdiction, retention period, or institutional data policy is specified in the problem input. These require confirmation if the application moves beyond a local hackathon prototype.

---

## 12. Constraints, Assumptions and Unknowns

### 12.1 Explicitly provided context

The uploaded research report states a target context of an India-compatible, low-cost, web-first, student-facing MVP and assumes 2–4 student developers, a 24–48 hour build window, AI-assisted coding, approximately 8 GB RAM, no dedicated GPU, and limited budget. These are explicitly stated **within the research report**, but they are not confirmed as official organiser constraints.

No official requirements for language, framework, cloud platform, mandatory AI model, data provider, deployment, submission artefact, or scoring weights were supplied.

### 12.2 Inferred constraints

| Inferred constraint | Reasoning | Impact if wrong |
|---|---|---|
| A simple workflow is more important than broad platform scope. | The target is a short hackathon build and the problem's main value is the evidence chain. | If judges expect a full institutional product, scope and integration requirements would need revision. |
| A low-compute implementation is preferred. | Report assumes no dedicated GPU and low budget. | Local embedding/model choices may change if strong GPU/cloud resources are available. |
| The evidence model must work with arbitrary-enough inputs. | The core claim is that students can upload their own syllabus and materials. | If only one curated course is allowed, performance may be easier but product generality must be described honestly. |
| Source provenance is a first-class requirement. | The proposed gap is evidence-traceable audit, not generic chat. | If this is removed, differentiation weakens substantially. |
| The first version should use a small set of document formats. | Parser robustness across all file types would exceed a 24–48 hour budget. | Additional required formats may change effort and feasibility. |
| An external AI API may be available. | Research report suggests low-cost/free-tier models. | If all hosted AI is disallowed, use deterministic/topic-matching fallbacks or revise AI functionality. |

### 12.3 Working assumptions

| Assumption | Provisional choice | Impact if false | How to resolve |
|---|---|---|---|
| Primary user | Individual student preparing for a course assessment. | Teacher/institution workflows add collaboration, permissions and reporting complexity. | Ask target users and check challenge framing. |
| Scope of one project | One syllabus/course per workspace in MVP. | Multi-course management adds relationships, navigation and storage complexity. | Validate only if multi-course support is explicitly expected. |
| Supported input | PDF + text is the minimum defensible slice; DOCX is valuable if time permits. | If a required syllabus is scanned or DOCX-only, the MVP may fail the demo. | Inspect expected demo files before implementation. |
| Practice mode | Begin with one constrained type, preferably objective questions or rubric-based short answers. | Multiple question types increase testing needs. | Pick based on judge expectations and response-evaluation reliability. |
| Status model | Separate content evidence and practice evidence rather than one “mastery score.” | A single combined score could conceal missing material or poor practice. | Retain two dimensions unless user testing proves a clearer model. |
| Benchmark | A small manually labelled set can be built during preparation. | Without labels, accuracy claims cannot be supported. | Prepare test fixtures and expected outcomes. |
| Provider | Hosted low-cost model is a candidate, not a commitment. | Costs, rate limits or terms may make it unsuitable. | Check live pricing/terms when provider is selected. |
| Student benefits | Tool aims to improve visibility and prioritisation, not guaranteed grades. | Strong educational claims would need a controlled study. | Keep claims limited until validated. |

### 12.4 Unresolved questions

- Does the organiser have an actual official PS, rubric, or implementation constraint separate from the uploaded research report?
- Which language(s) and syllabus structures must work?
- Must the demonstration support scanned PDFs or image-only documents?
- Are external LLM/embedding APIs and cloud storage permitted?
- Is a live deployment URL required, or is a local demo acceptable?
- What file sizes and processing times are expected?
- What user data may be retained, and are accounts/authentication expected?
- What does the event consider a valid demonstration of “AI” or innovation, if anything is mandated by the track?

---

## 13. Existing Solutions and Identified Gap

### 13.1 What the supplied report concluded

The report identifies several mature solution categories: source-grounded document Q&A, AI-generated quizzes and study guides, guided AI tutoring, adaptive-learning platforms, and educational knowledge graphs. It rejected the generic “syllabus-to-personal tutor” and “source-grounded study companion” as weakly differentiated and selected the narrower combination of syllabus coverage auditing plus practice evidence.

The proposed distinction is not any single feature. It is the connected workflow:

`student-owned syllabus + study material → topic-level evidence audit → transparent gap state → cited retrieval practice → separate practice state`

### 13.2 Current-source check and its effect on the gap claim

A current official Google help page describes **study notebooks** with diagnostic quizzes, personalised lessons, proficiency/progress tracking, and the ability to create study materials from course sources. This documentation makes the overlap with an AI study assistant stronger than a narrower comparison based only on source-grounded Q&A. [S2]

Quizlet's official page currently documents AI-generated practice tests, study guides, PDF summarisation, flashcards and homework help. [S3]

CourseKG is a 2024 research paper on constructing an educational knowledge graph from course information for precision teaching. It establishes that educational knowledge graphs are an existing research direction, not a novel claim for this project. [S4]

A systematic review of distributed and retrieval practice in health-professions education included 56 eligible studies and 63 experiments; 43 reported significant benefits from distributed practice and/or retrieval practice over comparisons, with heterogeneity and study-quality limitations discussed by the review. This supports retrieval practice as a plausible mechanism, but does not prove this application improves outcomes. [S5]

UNESCO's guidance stresses human-centred use, privacy protection, and validation of GenAI in education. It supports the proposed safety posture, not the efficacy of this particular product. [S1]

### 13.3 Competitor/gap table

| Solution / category | Documented strength | Implication for this project | Evidence limit |
|---|---|---|---|
| Gemini Notebook / study notebooks | Source-grounded notebook workflows; current help also describes diagnostic quizzes, personalised lessons and progress tracking. | The team must not position itself as the first product to combine source Q&A, quizzes and progress. Test whether the exact syllabus-to-material audit, passage-level gap classification and transparent dual state model offer a better workflow. | Public docs do not prove every hidden or possible capability; verify by hands-on tests using the same input bundle. |
| Quizlet AI Study Tools | Practice tests, study guides, PDFs, flashcards and AI homework help. | Generic quiz generation or study material generation is not defensible differentiation. | Official product descriptions are not independent evidence of efficacy. |
| Khanmigo / guided AI tutoring | The supplied report describes it as guided tutoring linked to the Khan Academy content ecosystem. | Tutoring interaction alone is not the core project. The target is student-owned curriculum/material alignment. | Current feature details should be checked again if it becomes a direct competitor in the demo. |
| Adaptive-learning platforms such as Squirrel Ai | The supplied report describes diagnostics, adaptive paths, targeted practice and tutoring. | Adaptive recommendation itself is an established product category; avoid claiming it as new. | Vendor-published descriptions are not independent effectiveness evidence. |
| Uedu knowledge graph and CourseKG research | Course/student graph or educational knowledge-graph modelling. | Topic graphs and mastery graphs are established concepts; keep the graph minimal and focus on evidence relationships. | Product/research scope differs from a consumer-facing student-owned audit. |
| Manual folder + checklist/spreadsheet | Cheap and familiar; students can compare material manually. | A fair baseline is necessary. The app must show an efficiency or traceability advantage, not merely reproduce a folder tree. | No baseline timing study was supplied. |

### 13.4 What is and is not established about novelty

**Established:** syllabus parsing, AI tutoring, document Q&A, quiz generation, knowledge graphs, progress tracking, retrieval practice and adaptive learning all exist independently in products or research.

**Potentially differentiating, but not yet proven unique:** a student-controlled system whose primary object is an auditable mapping from arbitrary syllabus topics to passages in arbitrary uploaded study materials, with missing/weak evidence handled conservatively and practice evidence maintained as a separate dimension.

**Not established:** that no competitor offers this exact workflow; that the market is large; that students will adopt the product; that the system produces better grades; or that any claimed percentage of time savings is real.

### 13.5 Research to perform before claiming differentiation

1. Test current Gemini Notebook study notebooks and Quizlet using the same syllabus plus incomplete notes bundle.
2. Record whether each tool explicitly lists uncovered syllabus topics, cites relevant passages per topic, distinguishes material availability from answer evidence, and updates a topic state after a user response.
3. Evaluate friction, source traceability, false coverage and result export—not just feature names.
4. Interview a few target students about how they currently discover syllabus gaps; this validates pain and usability, not market size.
5. Describe the result as a specific workflow difference, not a blanket claim that competitors cannot perform it.

---

## 14. Expected Outcome and Definition of Done

### 14.1 Minimum valid completion

A minimum valid build should:

1. Accept a real syllabus in at least one implemented format.
2. Extract a topic hierarchy and show it to the user.
3. Accept at least PDF and text-based study material, consistent with the source report's minimum.
4. Retrieve relevant passages for syllabus topics and retain source references.
5. Display supported, weak/uncertain and missing-material states.
6. Refuse to claim source coverage when relevant evidence is absent.
7. Generate one grounded question for a supported topic.
8. Accept a student response and update the practice state using a declared rule.
9. Work on a fresh input bundle, not only hard-coded topics.
10. Include a reproducible test case and a concise limitations statement.

### 14.2 Competition-ready completion

In addition to the minimum:

- Allow editing/correcting the extracted topic tree.
- Show the exact cited passage and file/page location.
- Separate material state from practice state in both data and UI.
- Recalculate affected evidence when a new source is added.
- Include a small manually labelled benchmark and report precision/recall and citation validity.
- Handle unsupported, empty and malformed documents gracefully.
- Demonstrate at least one false-positive/uncertain case as well as the ideal case.
- Keep the experience clear enough for a judge to verify results without a long explanation.
- Provide an API/provider failure fallback for core stored results.

### 14.3 Optional extensions after core verification

- More question types.
- Revision scheduling / spaced retrieval.
- multilingual study materials and explanations.
- Past-paper alignment.
- exportable topic/evidence report.
- OCR for scanned materials.
- Multi-course workspaces or teacher review.

These must not be allowed to jeopardise the end-to-end evidence workflow.

### 14.4 Proposed acceptance tests

| Test | Setup | Pass condition | Type |
|---|---|---|---|
| AT-01: topic extraction | Known syllabus with manual topic list. | Extracted structure agrees with the ground truth according to an agreed annotation rule; missing and extra topics are counted. | Proposed; source report specifies this class of test. |
| AT-02: known missing topics | Six-topic Data Structures syllabus; materials intentionally cover four topics. | Trees and Graphs are flagged as lacking evidence; the four other topics show only evidence that truly exists in the uploaded material. | Proposed; based directly on report demonstration. |
| AT-03: citation validity | Select each covered topic and inspect evidence card. | Citation resolves to actual uploaded source and the passage supports the specific topic claim. | Proposed; source report requires real passage citations. |
| AT-04: question grounding | Generate a question for a supported topic. | A reviewer can answer it from the cited passage; question is mapped to the selected topic. | Proposed. |
| AT-05: absent-source safety | Remove all relevant source passages for one topic. | System blocks source-grounded practice or clearly reports insufficient evidence; it does not fabricate a citation. | Proposed; directly aligned with source report's edge case. |
| AT-06: state separation | Add a new source, then separately submit a practice answer. | Source change affects material evidence; answer change affects practice evidence; one does not silently overwrite the other. | Analyst recommendation. |
| AT-07: rubric/state transition | Use a predefined strong answer and weak answer. | State transition matches the documented answer rubric. Ambiguous outputs are handled explicitly. | Proposed; source report requires a strong/weak-answer test. |
| AT-08: new-input generalisation | Upload a syllabus not used during development. | Topic list is derived from new input; no hard-coded demo topic list appears. | Proposed; source report requires a fresh-input demonstration. |
| AT-09: malformed file | Upload a corrupted, empty or unsupported document. | Explicit recoverable error appears and unaffected files remain usable. | Analyst recommendation. |
| AT-10: provider unavailable | Disable/fail the generation provider after a coverage map exists. | Stored graph and evidence remain readable; system does not claim success for failed generation. | Analyst recommendation based on report's API-risk section. |

### 14.5 Observable demonstration sequence

1. Upload a syllabus with six topics.
2. Upload an intentionally incomplete study bundle.
3. Show the topic hierarchy and four evidence-supported areas plus two missing areas.
4. Open one supported topic and inspect the exact cited passage.
5. Generate a question whose answer is grounded in that passage.
6. Submit an answer that fails the predefined rubric and show `PRACTICE_WEAK` or equivalent.
7. Submit a satisfactory response and show `DEMONSTRATED` for that specific attempt/rubric.
8. Add material for a previously missing topic and re-run mapping; show the material state change while keeping practice state unattempted.
9. Upload or select a second fresh syllabus to prove the feature is not hard-coded.

The final state changes are more meaningful than a static dashboard screenshot.

---

## 15. Evaluation Criteria and Success Metrics

### 15.1 Official criteria status

No official event rubric, weights or judging rules were supplied. The uploaded research report contains its own weighted candidate-scoring framework, but explicitly says those weights are general analysis weights and **not official event weights**. They must not be presented as organiser criteria.

### 15.2 Proposed technical evaluation dimensions

| Dimension | Evidence to show | Measurement approach | What it does not prove |
|---|---|---|---|
| Correct syllabus representation | Topic tree against annotated source. | Topic precision/recall, counts of omissions and duplicates. | That all syllabi can be parsed perfectly. |
| Coverage audit quality | Correctly supported, weak and missing topic labels. | Precision/recall on a labelled set; confusion matrix. | That the material comprehensively teaches the topic. |
| Citation/provenance quality | Source passage for each evidence claim. | Resolution rate and human judgement of relevance. | That a citation automatically makes a generated conclusion correct. |
| Grounded question quality | Question and cited source passage. | Answerability, topic alignment and absence of unsupported claims reviewed by a human. | That the question fully assesses understanding. |
| Practice assessment consistency | Strong/weak answer fixtures and rubric. | Agreement with human rubric; inspect uncertain cases. | Psychometric validity or durable mastery. |
| State consistency | State changes following source and answer changes. | Automated transition tests. | Educational effectiveness. |
| Practical usability | Student can complete workflow and explain statuses. | Small task-based test; completion errors and qualitative notes. | Generalised adoption or market demand. |
| Efficiency against manual baseline | Time/steps to identify known gaps manually and with the tool. | Same syllabus/material bundle, documented protocol. | Broad time savings for all students. |
| Reliability | Handling of malformed inputs/provider failures. | Edge-case test pass rate and failure logs. | Production-scale reliability. |

### 15.3 Success criteria for the hackathon MVP

The source report recommends a credible demonstration rather than unsupported claims of educational impact. A successful prototype should process fresh inputs, correctly surface deliberately inserted material gaps, show relevant citations, avoid fabricating absent evidence, generate a question from retrieved material and update a practice state after a response.

Before the demo, the team should agree on a small number of explicit thresholds, for example an acceptable minimum topic-extraction agreement and citation-validity rate. Those thresholds should be labeled as **team-defined test targets** and reported with test-set size. Do not select thresholds after seeing results simply to make the demo appear successful.

### 15.4 Learning outcomes and impact claims

Retrieval practice has research support as a learning strategy, but its effects depend on context, practice design and assessment. The cited systematic review focused on health-professions education and describes study heterogeneity and limitations. [S5] The product should claim that it *aims* to make gaps and practice evidence more visible. It should not claim to improve grades, diagnose mastery or produce a percentage increase in retention without an appropriate study.

---

## 16. Risks, Failure Modes and Mitigations

Likelihood and impact are qualitative judgements for planning, not calculated probabilities.

| Risk | Likelihood | Impact | Early warning signs | Mitigation | Fallback |
|---|---|---|---|---|---|
| False-positive coverage | Medium–high | High | A topic is marked supported by a passage that merely mentions the term. | Conservative thresholds, passage preview, human-labelled benchmark, distinguish mention from meaningful support. | Mark uncertain and let user attach/correct evidence. |
| Missed relevant passage | Medium–high | Medium–high | Manual reviewer finds useful content the retriever did not surface. | Hybrid lexical/semantic retrieval, aliases, metadata filters, user-visible search/manual attach. | Allow manual topic–passage association and rerun. |
| Bad syllabus extraction | Medium | High | Topics merged, nested incorrectly or omitted. | Preserve original text, deterministic heading/list parsing where possible, let user edit before mapping. | Pasted text/manual topic correction. |
| Hallucinated question or feedback | Medium | High | Question cannot be answered from cited passage or includes unsupported claims. | Generate only from retrieved evidence; require source IDs; validate outputs; human review fixtures. | Return “insufficient source evidence” or use a deterministic template question. |
| False claim of mastery | Medium | High | One short correct response is presented as lasting mastery. | Use narrow language such as `DEMONSTRATED`; separate practice and material state; explain rubric. | Show “passed this practice check” instead of mastery terminology. |
| Inconsistent LLM grading | Medium–high | Medium–high | Same answer gets different grades or feedback doesn't match the rubric. | Constrained rubrics, structured output, objective checks where possible, uncertain state for borderline cases. | Use multiple-choice or exact-answer checks in MVP. |
| Provider outage/rate limit | Medium | Medium–high | Timeouts, partial runs, missing question output. | Keep parsing/storage/state logic decoupled; cache successful outputs; avoid repeated unnecessary calls. | Present preloaded data only as a clearly labelled demo fallback; keep upload pipeline available where possible. |
| API cost exceeds budget | Medium | Medium | Costs spike with long documents or repeated generation. | Limit document/page size, batch requests, cache embeddings and model outputs, expose provider config. | Reduce supported document size or use a lower-cost/provider-independent fallback. |
| File parser failure | Medium | High for affected input | Empty extracted text, wrong pages, broken tables/formulae. | Validate extraction quantity and preview text; test the actual demo files. | Ask for pasted text or supported text export. |
| Privacy or copyright mishandling | Medium | High | Raw documents remain stored/logged unexpectedly or are sent to a third party without clear disclosure. | Minimise retention, disclose provider handling, avoid unnecessary logs, do not redistribute uploads, use permitted sample data. | Use public/created demo documents and session-scoped storage. |
| Stale citations after source edits | Medium | Medium | Evidence card points to an old chunk after re-upload or removal. | Version source IDs and invalidate dependent evidence when source content changes. | Require explicit “reprocess” with visible state refresh. |
| UI overstates confidence | Medium | High | A single bright “mastery %” hides uncertainty. | Use dual evidence dimensions, clear labels, source excerpts and confidence/uncertainty explanations. | Show raw evidence and state definitions rather than composite score. |
| Novelty challenge from judges | High | Medium–high | Judge compares directly with Gemini study notebooks or Quizlet. | Test competitors using the same scenario; demonstrate uncovered-topic audit, citation inspection and state separation. | Position the work as a focused workflow/integration prototype rather than claiming category novelty. |
| Team integration delay | Medium–high | High under 24–48 hours | Frontend and backend use incompatible topic/source schemas. | Agree early on IDs, response contracts, state enums and a single test fixture. | Build end-to-end with a narrow mocked interface, then replace modules incrementally. |
| Demo relies on curated data | Medium | High | Prepared demo works but fresh upload fails. | Make fresh-input test a release gate. | Use a second known syllabus to prove generalisation; disclose any limitations. |

### Fundamental feasibility warning

There is no apparent fundamental scientific obstacle to a small evidence-auditing prototype. The central risk is **reliability**, not raw compute: semantic matching, evidence adequacy and short-answer grading are imperfect. If the system cannot provide valid citations and avoid false support on the test set, a complex graph or polished UI will not rescue the core claim.

---

## 17. Feasibility Assessment

### Overall classification

**Feasible with significant constraints** for a narrow 24–48 hour MVP under the source report's assumed conditions. A robust general-purpose product for arbitrary syllabi, scanned documents, every subject and reliable mastery inference is not established as feasible within that window.

### Assessment by dimension

| Dimension | Assessment | Rationale |
|---|---|---|
| Core document workflow | Feasible with scope limits | PDF/text extraction and a simple hierarchy are manageable if format support is restricted. |
| Topic-to-passage retrieval | Feasible but quality-sensitive | Lexical and semantic retrieval are available techniques; thresholding and validation are the hard part. |
| Graph/tree visualisation | Feasible | A standard tree view is sufficient; advanced graph layout is optional. |
| Grounded question generation | Feasible with evidence constraints | A hosted model can generate simple questions from provided passages, but outputs require checks. |
| Answer grading | Feasible for a constrained rubric | Multiple-choice/objective answers are easier; open-ended grading adds inconsistency and needs careful limitation. |
| State management | Feasible | A small relational model and deterministic status rules are enough. |
| No dedicated GPU | Feasible if heavy generation/embedding is hosted or the model choices are lightweight | The source report assumes ordinary hardware; provider costs and access still need checking. |
| Privacy/security | Manageable for prototype, important to specify | Minimal retention and careful test data reduce exposure. A multi-user deployment requires more design. |
| Educational efficacy | Unproven | No controlled experiment with this product is provided. |
| Market novelty/adoption | Uncertain | Competitor capability overlap exists; no target-user interviews or comparative hands-on benchmark are supplied. |

### What would materially change this assessment?

- If OCR, multilingual parsing, scanned handwritten notes, or multiple institutional LMS integrations are mandatory, feasibility worsens.
- If hosted AI services are prohibited and local model inference is required on low-memory hardware, scope and quality trade-offs become more significant.
- If the event only requires a concept pitch, less code may be needed; if it requires a live, fresh-input demo, the pipeline and edge-case testing are essential.
- If verified user research reveals the problem is not painful or current tools already address it adequately, product viability and differentiation need reconsideration even if the software is technically feasible.

---

## 18. Scope Boundaries and Priorities

### Required core scope

- One syllabus/course workspace.
- Syllabus intake and topic extraction.
- Basic editing/review of extracted topics where feasible.
- Study-material intake for a small supported format set.
- Passage extraction and source metadata.
- Topic-to-passage mapping.
- Missing, weak and supported evidence states.
- Visible source citation/passage preview.
- One source-grounded question type.
- A predefined answer rubric or answer-key check.
- Separate practice state.
- A basic next action.
- Fresh-input test and reproducible benchmark.

### Supporting functionality

- Reprocess evidence after a new source is uploaded.
- File-level extraction diagnostics.
- Persist state for the demo session.
- Small test/benchmark report.
- Transparent explanation of labels and limitations.

### Optional enhancements

- Rich interactive graph view.
- Multiple question types and difficulty settings.
- Spaced repetition/revision scheduling.
- Exportable report.
- OCR, URLs, videos, past-paper ingestion.
- Multilingual interface or content generation.
- Accounts and cross-device sync.
- Teacher collaboration and institution-wide analytics.

### Out of scope unless official rules say otherwise

- Predicting grades or exam marks.
- Claiming to diagnose cognitive or psychological mastery.
- Proving that the syllabus is complete or pedagogically correct.
- Automatic accreditation or curriculum compliance decisions.
- Universal prerequisite inference.
- Building a complete learning management system.
- Institutional identity/roster integration.
- Training a foundation model.
- Guaranteeing educational gains.

### Do not build before validating

- A single composite “mastery score” that merges material and practice evidence.
- A chatbot-first interface that displaces the evidence audit.
- Automated prerequisite edges that are not supported by the syllabus or cited materials.
- A complex graph database if a simple topic hierarchy and relational links are sufficient.
- Expensive multi-agent orchestration or multiple model calls for every chunk.
- Broad file-format claims without extraction tests.

### Scope-creep rule

Any new feature should be delayed unless it makes one of the central acceptance tests pass more reliably or removes a demonstrated user barrier. A complete, auditable six-topic example is stronger than a large unfinished study platform.

---

## 19. Team and Integration Implications

The source report assumes a 2–4 person team, but the actual team composition is unconfirmed. The following is a possible work split, not a requirement to assign specific people.

| Work area | Responsibilities | Inputs | Outputs | Can test independently? | Main integration risk |
|---|---|---|---|---|---|
| Syllabus parsing / topic model | Extract hierarchy, preserve original phrases, support corrections. | Syllabus files/text. | Stable topic objects with IDs and parent relationships. | Yes, using a manually annotated syllabus. | Different parent/topic semantics between parser and UI. |
| Material ingestion / provenance | Parse files, extract text, chunk passages, record metadata. | Uploaded sources. | Source and chunk records. | Yes, with known PDF/text fixtures. | Page offsets, duplicate chunk IDs or unavailable page metadata. |
| Retrieval / evidence classification | Match topics to passages and classify evidence conservatively. | Topic objects and chunk records. | Topic-evidence links, status and reason. | Yes, against labelled passage fixtures. | Scoring thresholds and field names not agreed early. |
| Practice / assessment | Generate topic-grounded question, define rubric, evaluate response. | Topic evidence and cited chunks. | Question, expected answer/rubric, attempt and evaluation outcome. | Yes, with fixed examples and answer pairs. | Question not answerable from cited text; grading schema mismatch. |
| Interface / experience | Upload workflow, topic tree, evidence panel, practice UI, status explanation. | Agreed JSON/API contract. | User-visible workflow. | Yes, with mocked data. | UI represents one ambiguous status instead of two dimensions. |
| Integration / QA / demo | API integration, test set, state-transition tests, deployment and demo script. | All modules and agreed fixtures. | Working end-to-end scenario and limitations. | Partly; must test integrated workflow. | Late discovery of incompatibilities or reliance on hard-coded topic names. |

### Integration contract to agree early

Before parallel work expands, define:

- Stable IDs for topics, sources, chunks, questions and attempts.
- The exact fields for topic hierarchy and source location.
- The allowed material-evidence states and practice-evidence states.
- Whether a source record is versioned when re-uploaded.
- API responses for parse failure, no evidence, weak evidence and provider failure.
- A common demonstration syllabus and its expected topic/evidence labels.

The UI can start from mock data, but those shared contracts should be close to the actual output shape. Build one vertical slice early: one syllabus topic → one source passage → one citation → one question → one answer → one state update. This will reveal integration issues before the entire system is built.

---

## 20. Questions for the Organisers

The organiser and official event are not identified in the supplied material. These questions are therefore candidates to send only if the problem is being submitted to a real event; they are not assumptions about existing rules.

| Priority | Question | Why the answer matters |
|---|---|---|
| **Blocking** | Is there an official problem statement, event brief or rubric beyond the attached research report? | The attached report's final statement is a researcher's proposed problem, not verified official wording. The project should not claim official endorsement or compliance without the actual source. |
| **Blocking** | Are there mandatory deliverables (live URL, deployed backend, repository, pitch deck, report, source code, demo video) and a fixed submission deadline? | Determines the minimum acceptable completion and integration/deployment work. |
| **High impact** | Are external LLM/embedding APIs, cloud services and third-party platforms allowed? Are there any API-key or cost restrictions? | The proposed pipeline may rely on hosted generation or embeddings; restrictions could change implementation and feature scope. |
| **High impact** | Are there prescribed document formats, syllabus datasets, languages or benchmark inputs? | These determine parser strategy and what a valid fresh-input demo must support. |
| **High impact** | Is the judging rubric published, including any official criteria weights? | Prevents the team from treating the research report's informal candidate-scoring weights as official judging criteria. |
| **High impact** | Does the event require real user validation or only a functional prototype and technical demonstration? | Changes the amount of time allocated to interviews, usability testing and evaluation. |
| **Useful** | Is offline operation required, or is an internet connection acceptable? | Affects model/API dependency and fallback behaviour. |
| **Useful** | Are there constraints around storing, uploading or processing copyrighted educational material or student data? | Determines retention, hosting, privacy messaging and safe demo data. |
| **Useful** | Are judges expected to upload their own files during evaluation? | If yes, robust upload parsing and fresh-input handling become a critical acceptance gate. |

### Questions to resolve internally if organiser contact is unavailable

1. Which single document format pair can the team support reliably within its actual time budget?
2. What counts as “sufficient evidence” for a topic, and how will borderline cases be labelled?
3. What exactly causes a practice state to become `DEMONSTRATED`?
4. What is the planned fallback if the model API is unavailable?
5. How will citations be manually checked and reported?

---

## 21. Implementation Readiness Checklist

This section assesses readiness for solution design. It does not prescribe the final stack or complete architecture.

### Understanding and evidence

- [x] A specific central problem has been selected from the supplied research report.
- [x] The target user is described at an appropriate level without inventing detailed personas.
- [x] The report's final problem statement and demo scenario are available.
- [x] Existing solution categories and the core differentiation hypothesis are identified.
- [x] The limitation that the uploaded report is not an official organiser-issued PS is recorded.
- [x] Current official documentation was checked where it materially changes the competitor interpretation.
- [ ] Actual target students have been interviewed or tested.
- [ ] The selected competitors have been hands-on tested with the same syllabus/material case.
- [ ] The official event rubric/rules have been obtained.

### Requirements and testability

- [x] Proposed functional requirements have stable IDs.
- [x] Non-functional requirements and verification approaches are defined.
- [x] Material evidence and practice evidence are separate.
- [x] Missing-source and provider-failure behaviours are described.
- [x] A reproducible six-topic demo case is specified.
- [ ] Coverage-state thresholds are selected and documented.
- [ ] Practice answer rubric is selected and tested.
- [ ] Minimum numeric team-defined success thresholds are approved before evaluation.

### Data and technical investigation

- [x] Required data entities and metadata are identified.
- [x] A labelled benchmark approach is specified.
- [x] Synthetic demo data is distinguished from real-world evidence.
- [ ] The exact demonstration files have been inspected with the intended parsers.
- [ ] Retrieval options have been benchmarked against a labelled sample.
- [ ] Current AI provider terms, costs, rate limits and data-handling practices have been checked for the chosen service.
- [ ] File size, context length and latency limits have been tested.

### Design decisions that are safe to make now

- Preserve the original syllabus wording and the evidence source metadata.
- Keep material coverage separate from practice outcome.
- Do not claim coverage without a relevant source passage.
- Do not claim durable mastery from one practice response.
- Use deterministic state-transition logic and inspectable acceptance tests.
- Keep the MVP narrow and prove the end-to-end workflow before adding optional capabilities.

### Decisions to delay until evidence is available

- Final tech stack and hosting choice, unless the event mandates one.
- Choice of AI/embedding provider.
- Exact coverage threshold and composite scoring, if any.
- Whether authentication and multi-course storage are necessary.
- Claims of uniqueness, market size, time saved or grade improvement.
- OCR, multi-language support, LMS integration and sophisticated spaced repetition.

### Recommended next actions

1. Obtain the actual official event brief and rubric, or explicitly proceed as an independent project if none exists.
2. Create a small annotated syllabus/material benchmark, including supported, weak and missing topics.
3. Test current relevant tools against the same scenario to refine—not assume—the differentiation.
4. Define the evidence states, answer rubric and minimum acceptance thresholds before coding the entire workflow.
5. Prototype the single vertical slice and evaluate citation validity and false-positive coverage first.

---

## 22. Final Problem Interpretation

1. **The actual problem to solve:** Students who study from fragmented notes and documents lack an easy, auditable way to compare what their syllabus requires with what their current materials support, and to distinguish having material from demonstrating a concept in practice.

2. **Who benefits:** Primarily self-directed students preparing for a course assessment. Teachers and institutions are possible future users but are not required for the MVP.

3. **Required outcome:** A working tool that turns a real syllabus into a structured topic hierarchy, maps uploaded materials to topics, identifies missing or uncertain support, and lets the student practise supported topics using cited source evidence.

4. **Core capabilities:** syllabus intake and extraction; material parsing and chunking; topic-to-passage matching; visible citations; conservative missing/weak/adequate evidence states; source-grounded practice; rubric-based response evaluation; separated material/practice states; and a next-action recommendation.

5. **Hardest technical challenge:** Reliably linking each topic to genuinely relevant passages, generating a question answerable from those passages, evaluating the student's response consistently, and preserving a transparent state that does not overstate certainty.

6. **Most consequential constraints:** the assumed short build window and limited compute/budget; variable document quality; AI-provider cost/availability; the need for valid provenance; and overlap with existing study products. These project constraints are partly assumptions in the supplied research report, not official rules.

7. **Evidence needed to prove the solution works:** A fresh syllabus/material upload; manually verified topic extraction; correct detection of deliberately missing topics; source passages that genuinely support displayed coverage; questions answerable from their citations; state changes matching a predefined rubric; and repeatable results on a small labelled benchmark.

8. **Most important unresolved question:** Does the current competitor landscape leave a sufficiently meaningful student problem in the exact syllabus-to-source evidence audit workflow, given that some current tools already offer study quizzes and progress tracking? This should be answered by direct comparative testing and lightweight user research, not by claiming competitors lack features based on unreviewed documentation.

9. **Concise definition of success:** A student can upload a previously unseen syllabus and its study materials, see which syllabus topics are supported or missing with verifiable passages, practise a supported topic, and observe an honest evidence-state update—without the system fabricating source support or claiming that a single answer proves lasting mastery.

### Final problem statement

Students often prepare for courses using a fragmented collection of syllabi, lecture slides, notes and other study materials. They may have no reliable way to tell which syllabus requirements are supported by the materials they possess, where the supporting passages are located, or whether they have demonstrated a concept rather than simply marking it complete. Build a student-facing system that extracts a syllabus into a reviewable topic hierarchy, maps the learner's uploaded study materials to those topics, identifies missing or weak evidence with inspectable source references, and provides short practice questions grounded in adequate evidence. The system must keep source coverage separate from practice performance, communicate uncertainty honestly, work on new user-provided inputs, and recommend a useful next action. Its success should be demonstrated through verifiable input/output tests, not unsupported claims of guaranteed learning gains or market uniqueness.

---

## 23. Sources and Evidence

### Primary project source

**[P0] Uploaded research report — `problem_research(3).md`**

- Research title: *Evidence-Driven Hackathon Problem Discovery & Problem Statement Research*.
- Theme: EdTech + Generative AI.
- Research date stated in file: 24 October 2026.
- The file contains the candidate-selection rationale, candidate scoring, input/output specification, proposed architecture, demo case, acceptance tests, risks, feasibility notes and a reference list.
- It explicitly presents its weighted scoring as a general framework rather than official event weights and states that no student interviews or controlled product-efficacy experiment were conducted.
- The file's concluding problem statement is used as the substantive source for this analysis, but it is not verified as an organiser-issued PS.

### Independently checked sources used to qualify the analysis

**[S1] UNESCO — Guidance for Generative AI in Education and Research**  
https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research  
The official page describes a human-centred approach, privacy protection and the need to validate educational GenAI. The page indicates publication on 7 September 2023 and a last update of 16 January 2026. This supports safety and governance recommendations, not product efficacy.

**[S2] Google Gemini Apps Help — Organise your projects with notebooks / Study notebooks**  
https://support.google.com/gemini/answer/16972047?hl=en-IN  
The official page accessed for this analysis describes study notebooks, diagnostic quizzes, personalised lessons and progress/proficiency tracking. This materially affects competitor differentiation: the proposed product should not claim that study quizzes and progress tracking are absent from current competitor tools. The more specific audit workflow requires direct comparative validation.

**[S3] Quizlet — AI-Powered Tools: Practice Tests, Study Guides, Flashcards & More**  
https://quizlet.com/features/ai-study-tools  
The official product page describes AI-generated practice tests, study guides, PDF summarisation, flashcards and AI homework help. These documented offerings show that generic AI study assistance is not a defensible novelty claim by itself.

**[S4] Li et al. (2024) — CourseKG: An Educational Knowledge Graph Based on Course Information for Precision Teaching**  
https://doi.org/10.3390/app14072710  
The paper was published in *Applied Sciences*, 14(7), 2710, on 23 March 2024. It proposes a course-information-based educational knowledge graph. It establishes prior work in the area; it does not establish that the proposed student-owned audit is either unique or effective.

**[S5] Trumble et al. (2024) — Systematic review of distributed practice and retrieval practice in health professions education**  
https://pubmed.ncbi.nlm.nih.gov/37615780/  
The review included 56 eligible studies and 63 experiments; 43 reported significant benefits of distributed practice and/or retrieval practice against controls or comparisons. The authors also discuss heterogeneity and study-quality limitations. It provides contextual support for including retrieval practice, not proof that this application improves academic results.

### Additional references listed by the uploaded research report

The following URLs appear in the uploaded report's evidence register. They were not all independently revalidated during this document synthesis, so use them as leads for further investigation rather than treating every feature comparison as freshly confirmed.

- Farquhar et al. (2024), “Detecting hallucinations in large language models using semantic entropy,” *Nature*: https://www.nature.com/articles/s41586-024-07421-0
- Menczer et al. (2024), “Factuality challenges in the era of large language models and opportunities for fact-checking,” *Nature Machine Intelligence*: https://www.nature.com/articles/s42256-024-00881-z
- McDermott (2021), “Practicing Retrieval Facilitates Learning,” *Annual Review of Psychology*: https://doi.org/10.1146/annurev-psych-010419-051019
- Squirrel Ai product and technology documentation: https://squirrelai.com/ and https://squirrelai.com/technology/
- Uedu knowledge-graph methodology: https://uiuc.uedu.tw/doc/knowledge-graph
- Google Gemini Notebook source/notes documentation cited by the report: https://support.google.com/gemininotebook/answer/16164461 and https://support.google.com/gemininotebook/answer/16215270
- Khan Academy / Khanmigo information cited by the report: https://www.khanacademy.org/khan-labs
- Gyani AI: https://ai.gyaniversity.com/
- LEARN-X: https://www.learn-x.co/
- CourseShark: https://www.courseshark.io/
- EduGraph: https://www.edugraph.io/

### Evidence limitations to retain when communicating the project

- The market gap is based on a review of documented capabilities and remains provisional.
- Product documentation can change; features that are not documented may still exist.
- Vendor pages establish what a product advertises, not independent evidence that it works as described or improves learning.
- Learning-science findings support investigating retrieval practice but do not establish efficacy for this tool or this target population.
- The proposed MVP has no verified benchmark results until the team runs and reports tests.
- No official event rubric, mandatory stack, or organiser-issued problem statement was available in the supplied input.

---

## Final Quality-Control Review

- [x] Official organiser requirements have not been fabricated; the proposal/source status is explicit.
- [x] Source-derived claims, inferences and recommendations are labelled separately.
- [x] The competitor gap is phrased cautiously, including the newly checked Gemini Notebook capability overlap.
- [x] Functional and non-functional requirements have IDs, priorities and verification methods.
- [x] Input, processing, output, postconditions and failure paths are described.
- [x] A data/benchmark plan is included without pretending that a real dataset was supplied.
- [x] Technical concepts are explained in accessible language and technologies remain implementation choices.
- [x] Acceptance tests cover fresh inputs, citations, missing evidence, practice grading and state changes.
- [x] Educational efficacy and market uniqueness are not claimed without evidence.
- [x] Privacy, copyright, hallucination, retrieval and integration risks are addressed.
- [x] The final problem interpretation matches the detailed requirements and scope boundaries.
