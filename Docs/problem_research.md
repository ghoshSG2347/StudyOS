# Evidence-Driven Hackathon Problem Discovery & Problem Statement Research
## Theme: EdTech + Generative AI
### Research date: 24 October 2026
### Target context: Student-facing software MVP; India-compatible, low-cost, web-first
### Assumptions: 2–4 student developers, 24–48 hour build window, AI-assisted coding, ~8 GB RAM, no dedicated GPU, limited budget

---

# 1. Executive Summary

## Research scope

This research evaluates the proposed direction **“Personalized syllabus-to-learning assistant”** within **EdTech + Generative AI**. The initial concept was: turn a syllabus into a topic graph, generate practice questions, track progress, and explain answers with source references.

The research question was deliberately narrower than “can AI tutor students?” because that market is already crowded. The investigation asked:

> **What specific student problem remains when a student has a syllabus, scattered study materials, and access to generic AI tools, but cannot reliably determine what has actually been covered, what is still unsupported by their materials, and which topics they can demonstrate rather than merely recognize?**

## Central problem discovered

Students can increasingly generate summaries, quizzes, explanations, and study plans from their own documents. However, the reviewed ecosystem does not consistently provide a **student-controlled, evidence-traceable audit between the syllabus, the student's learning materials, and demonstrated topic mastery**.

Existing tools demonstrate important pieces of this workflow:

- Google Gemini Notebook can ground answers in uploaded sources and provide inline citations, as well as generate study guides and mind maps.
- Quizlet provides AI-generated practice tests, study guides, flashcards, and homework help.
- Khanmigo provides guided AI tutoring rather than simply returning answers.
- Adaptive-learning systems such as Squirrel Ai use knowledge structures and learner data to personalize paths.
- Research systems and emerging products use knowledge graphs to map concepts and mastery.

But the reviewed solutions do not clearly demonstrate the complete student-side workflow of:

**syllabus → evidence mapping → uncovered/weakly supported topics → retrieval assessment → evidence-backed mastery state → next study action.**

This gap is narrower and more defensible than the original “AI study assistant” concept.

## Selected problem

### **Syllabus-to-Evidence Learning Gap Auditor**

A student uploads a syllabus and their own study materials such as lecture slides, notes, PDFs, or reading lists. The system builds a topic graph from the syllabus, maps relevant passages from the student's materials to each topic, identifies topics that are missing or weakly supported, then uses short source-grounded retrieval questions to test whether the student can demonstrate understanding. Each topic receives a transparent state such as **Covered by material**, **Needs evidence**, **Needs practice**, or **Demonstrated**, with citations back to the source material.

The important distinction is that the product is not primarily a chatbot. It is an **audit-and-action system for learning coverage and evidence**.

## Why this candidate was selected

1. **It preserves the strong part of the original idea:** a syllabus becomes a structured learning map.
2. **It avoids the weakest form of GenAI novelty:** “upload PDF and chat with it.”
3. **It has a concrete input/output loop:** upload syllabus + materials + answers → receive topic-level evidence and actionable gaps.
4. **The output can be verified:** citations point to source passages; topic status is tied to explicit evidence or assessment results.
5. **It is technically meaningful but feasible:** document parsing, semantic retrieval, graph construction, evidence scoring, question generation, answer evaluation, and progress state can be implemented without a GPU.
6. **It has a strong demo:** a judge can upload a new syllabus and a deliberately incomplete bundle of notes and immediately see missing coverage, then answer a generated question and watch the topic state change.
7. **It is more defensible than the original concept after competitor research:** syllabus-first AI tutors and generic personalized study platforms already exist, so the research narrows the problem to evidence and coverage auditing.

## Core evidence

UNESCO's guidance says educational GenAI should be approached with attention to human agency, privacy, safety, equity, and pedagogical design rather than treated as an automatically trustworthy tutor. The same guidance notes that educational institutions need to validate GenAI tools and that privacy protections matter. [1]

Research in learning science supports retrieval practice as a useful mechanism for learning and for revealing what requires additional effort; a major review reports benefits across material types and learner ages, while a 2024 systematic review in health-professions education found distributed/retrieval practice beneficial across many included experiments, while also emphasizing heterogeneity and study-quality limitations. [2][3]

At the same time, LLM factuality remains a real technical concern. Research in *Nature* and *Nature Machine Intelligence* documents hallucination/factuality problems in language models, making source grounding and visible evidence particularly relevant in an educational product. [4][5]

---

# 2. Theme and Domain Map

| Subdomain | Typical users/stakeholders | Existing workflow | Common pain points | Available inputs | Existing solution categories | Research direction |
|---|---|---|---|---|---|---|
| Syllabus management | Students, teachers, institutions | Read PDF/document and manually break into units | Flat structure, unclear dependencies | PDF, DOCX, text | LMS, document tools, AI parsers | Structured curriculum graph |
| Study-material organization | Students | Collect slides, PDFs, notes, links | Fragmentation, duplication, missing topics | PDFs, notes, URLs | Cloud drives, NotebookLM, note apps | Material-to-topic evidence mapping |
| AI tutoring | Students | Ask questions one at a time | Generic answers, hallucination risk, weak curriculum context | Natural-language question | Chatbots, AI tutors | Curriculum-grounded assistance |
| Practice/assessment | Students, teachers | Find or create questions | Manual question creation; weak personalization | Notes, syllabus, past papers | Quizlet, LMS quiz tools | Topic-targeted retrieval |
| Progress tracking | Students, teachers | Mark chapters complete or track scores | “Completed” does not necessarily mean mastery | Quiz answers, activity logs | LMS analytics, adaptive platforms | Evidence-based mastery |
| Adaptive learning | Students, institutions | Use diagnostic/performance data | Data and infrastructure requirements | Response history, assessments | Adaptive learning systems | Lightweight student-side adaptation |
| Source verification | Students, teachers | Check textbooks/notes manually | AI explanations may be unsupported | Documents and citations | Retrieval-augmented systems | Passage-level provenance |
| Curriculum alignment | Teachers, institutions | Compare curriculum and materials manually | Coverage gaps and alignment errors | Syllabus, learning outcomes, materials | Curriculum mapping/KG systems | Automated coverage auditing |

## Domain interpretation

The research indicates that **“personalized learning” is not itself an underserved problem**. Commercial and research systems already use adaptive paths, knowledge graphs, diagnostic tests, practice, and tutoring. For example, Squirrel Ai describes a closed learning cycle involving assessment, personalized learning paths, practice, testing, and tutoring, while research platforms such as Uedu describe course knowledge graphs and student mastery tracking. [6][7]

The more promising hackathon problem is therefore the **verification layer between curriculum requirements, available evidence, and demonstrated learning**.

---

# 3. Research Methodology

## Research approach

Research was conducted on 24 October 2026 using:

1. Official guidance and product documentation.
2. Peer-reviewed research and PubMed-indexed literature.
3. Official product pages for major competing education tools.
4. Current product pages and public project documentation for emerging competitors.
5. Research and technical documentation concerning educational knowledge graphs and mastery tracking.
6. A skeptical originality review searching specifically for syllabus-first AI tutors, curriculum graphs, coverage mapping, mastery tracking, source-grounded study systems, and adaptive learning.

## Source hierarchy

The strongest evidence was given to:

- UNESCO guidance.
- Peer-reviewed journal literature.
- PubMed-indexed reviews and experiments.
- Official documentation from Google, Quizlet, Khan Academy, and competing platforms.
- Academic/research project documentation.
- Public product pages and GitHub repositories.

Marketing claims made by vendors are treated as **vendor-reported**, not independent evidence of effectiveness.

## Research limitations

- No student interviews were conducted for this report.
- No controlled experiment was conducted to establish that the proposed product improves exam outcomes.
- Product feature comparisons rely on publicly documented capabilities available at research time.
- Some emerging products have limited independent validation.
- Absence of a documented feature is **not** proof that a competitor cannot perform it.
- The proposed differentiation is therefore described as a **reviewed capability gap**, not guaranteed market uniqueness.
- The final MVP should be evaluated through reproducible input/output tests rather than claims of educational efficacy.

---

# 4. Real-World Problem Landscape

## 4.1 The student's actual workflow

A typical student studying a course does not work from one perfectly structured database.

A plausible workflow is:

1. Receive a syllabus as a PDF, document, portal page, or message.
2. Find lecture slides, class notes, textbook chapters, videos, previous-year questions, and personal notes.
3. Search different resources for individual topics.
4. Ask an AI assistant when confused.
5. Generate or find practice questions.
6. Mark topics as completed.
7. Revisit topics when exams approach.

The core weakness is that these activities are usually **not connected by an auditable representation of the curriculum**.

A student may have:

- studied something that is not explicitly in the syllabus;
- a syllabus topic that appears in notes but only superficially;
- multiple resources covering the same topic;
- a syllabus topic with no material at all;
- a prerequisite concept that the current material assumes;
- a topic marked “done” despite poor retrieval performance.

The problem is not simply lack of content. It is **lack of trustworthy alignment between what must be learned, what the student has access to, and what the student can demonstrate.**

## 4.2 Why generic AI does not fully solve it

Generative AI can explain a concept, generate a quiz, and summarize documents. However, fluent generation is not the same as reliable educational grounding.

Research documents hallucination and factuality challenges in LLMs. [4][5]

Google's Gemini Notebook is an important example of a stronger approach: users can upload sources, ask questions grounded in those sources, and receive inline citations. It also creates study guides and other artifacts. [8][9]

This demonstrates that source grounding is technically and commercially useful. But source-grounded Q&A does not automatically answer:

- Which syllabus topics are represented in my uploaded material?
- Which topics have no evidence?
- Which topics are only weakly covered?
- Which prerequisite relationships are supported by the syllabus versus inferred by AI?
- Which topics have I actually demonstrated through retrieval?
- What should I practice next because the evidence is weak?

## 4.3 Learning science supports an evidence-producing loop

Retrieval practice is not just another content format. A major review describes retrieval practice as a mechanism that supports later recall and can provide information about what needs additional effort. [2]

A 2024 systematic review of distributed and retrieval practice in health-professions education included 56 eligible studies and reported that 43 demonstrated significant benefits of distributed practice and/or retrieval practice over controls or comparison groups, while noting heterogeneity and limitations in study quality. [3]

Therefore, a credible MVP should not define “progress” only as a user clicking **Complete**. It should collect a small amount of observable evidence through retrieval questions.

This report does **not** claim that the proposed product will improve grades. It proposes a testable mechanism: topic status should be updated using observable evidence rather than self-reported completion alone.

## 4.4 Why the problem is becoming more important

GenAI increases the amount of educational content a student can generate. That reduces the cost of producing summaries and questions, but can also increase the amount of unverified material.

UNESCO's guidance emphasizes human-centred use, validation, privacy, and pedagogical considerations in educational GenAI. [1]

The emerging challenge is therefore shifting from:

> “Can AI create learning material?”

toward:

> “Can students reliably understand whether generated or collected learning material actually supports the curriculum and whether they can demonstrate the target concepts?”

That second problem is more suitable for a hackathon because it requires a measurable system rather than a generic conversational interface.

---

# 5. Evidence and Source Register

| Claim or Finding | Evidence | Source and Date | URL | Confidence | Limitations |
|---|---|---|---|---|---|
| GenAI in education requires human-centred, safe and meaningful use, including privacy and pedagogical validation | UNESCO guidance explicitly discusses privacy, ethical validation, human agency and educational design | UNESCO, 7 Sep 2023; page updated 16 Jan 2026 | https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research | High | Policy guidance, not proof of a specific product's efficacy |
| LLMs can generate false or unsupported outputs | Peer-reviewed research on hallucination and factuality | Farquhar et al., *Nature*, 2024 | https://www.nature.com/articles/s41586-024-07421-0 | High | General LLM finding, not education-specific |
| LLM factuality is a major research challenge | Review/perspective on fact-checking opportunities | Menczer et al., *Nature Machine Intelligence*, 2024 | https://www.nature.com/articles/s42256-024-00881-z | High | Does not evaluate the proposed architecture |
| Retrieval practice supports learning and can indicate what needs more effort | Annual Review of Psychology | McDermott, 2021 | https://pubmed.ncbi.nlm.nih.gov/33006925/ | High | General learning evidence; not proof of this product |
| Distributed/retrieval practice showed benefits in many included health-professions experiments | Systematic review, 56 eligible studies and 63 experiments | Trumble et al., 2024 | https://pubmed.ncbi.nlm.nih.gov/37615780/ | High | Domain-specific evidence; heterogeneous studies |
| Interspersed retrieval can improve final assessment performance | Five experiments plus meta-analysis | Don et al., 2024 | https://pubmed.ncbi.nlm.nih.gov/39556402/ | High | Specific experimental settings |
| Google Gemini Notebook can ground answers in uploaded sources and provide citations | Official Google documentation | Google, current documentation accessed Oct 2026 | https://support.google.com/gemininotebook/answer/16164461 | High | Vendor documentation |
| Google Gemini Notebook supports study guides, mind maps and multiple source types | Official Google documentation | Google, current documentation accessed Oct 2026 | https://support.google.com/gemininotebook/answer/16215270 | High | Vendor documentation |
| Quizlet already provides AI practice tests, study guides, flashcards and homework help | Official Quizlet product documentation | Quizlet, current page accessed Oct 2026 | https://quizlet.com/features/ai-study-tools | High | Vendor description; efficacy not independently established here |
| Khanmigo is designed as a guided AI tutor rather than simply giving answers | Official Khan Academy page | Khan Academy, current page accessed Oct 2026 | https://www.khanacademy.org/khan-labs | High | Vendor description |
| Squirrel Ai uses adaptive learning paths, diagnostic assessment and mastery-oriented practice | Official product documentation | Squirrel Ai, current pages accessed Oct 2026 | https://squirrelai.com/ | Medium | Vendor-reported capabilities and claims |
| Uedu describes a course knowledge graph and student mastery graph | Public technical methodology | Uedu, current documentation accessed Oct 2026 | https://uiuc.uedu.tw/doc/knowledge-graph | Medium | Platform documentation; independent validation not established |
| CourseKG demonstrates an educational knowledge graph for precision teaching | Peer-reviewed open-access paper | Li et al., *Applied Sciences*, 2024 | https://doi.org/10.3390/app14072710 | High | Research prototype rather than general consumer platform |
| Existing emerging products explicitly market syllabus-first personalized learning | Current product pages show syllabus-driven paths and adaptive learning | LEARN-X, CourseShark, Gyani AI and others, accessed Oct 2026 | https://www.learn-x.co/ ; https://www.courseshark.io/ ; https://ai.gyaniversity.com/ | Medium | Product claims; rapidly changing market |

---

# 6. Existing Solutions and Gap Analysis

## 6.1 Major solution categories

### Google Gemini Notebook

**What it does well**

- Accepts multiple source types.
- Grounds answers in uploaded sources.
- Provides inline citations.
- Generates study guides, briefings, mind maps and related artifacts. [8][9]

**Verified limitation relevant to this problem**

Its documented core is source-grounded research and thinking assistance. The reviewed documentation does not present it as a dedicated syllabus-coverage auditor that produces a curriculum-level coverage state and mastery evidence state.

**Remaining need**

A student still needs a way to compare the source corpus against the required syllabus and then distinguish source coverage from demonstrated understanding.

---

### Quizlet AI Study Tools

**What it does well**

- AI practice tests.
- Study guides.
- Flashcards.
- PDF summarization.
- AI homework help.
- Personalized practice features. [10]

**Verified limitation relevant to this problem**

The public product description focuses on generating and delivering study activities rather than providing a transparent syllabus-to-source evidence audit.

**Remaining need**

A student needs to know not merely that a quiz exists, but which curriculum requirement the question tests, what source evidence supports it, and which syllabus areas have no adequate study material.

---

### Khanmigo

**What it does well**

Khanmigo is positioned as an AI tutor that guides students toward answers instead of simply giving them the answer. It is integrated with Khan Academy's educational content library. [11]

**Verified limitation relevant to this problem**

Its strongest value proposition is guided tutoring within the Khan Academy ecosystem, not auditing arbitrary student-owned course materials against arbitrary university or school syllabi.

**Remaining need**

A student using their own institution's syllabus and materials needs curriculum-specific evidence mapping.

---

### Squirrel Ai

**What it does well**

Squirrel Ai describes an adaptive system using diagnostics, personalized learning paths, targeted practice, testing and tutoring. Its technology documentation also describes knowledge graphs, learner models and prediction/recommendation components. [6]

**Verified limitation relevant to this problem**

This is a sophisticated adaptive-learning platform rather than a lightweight student-owned evidence auditor. Its documented approach depends on a much larger learning infrastructure and data environment.

**Remaining need**

A low-cost, student-controlled version of curriculum/material/mastery auditing that can work from the student's own documents without requiring an institutional adaptive-learning ecosystem.

---

### Uedu knowledge graph

**What it does well**

Uedu documents a course knowledge graph built from instructor materials and a student knowledge graph based on interactions with an AI teaching assistant. Concepts can have relationships and mastery states. [7]

**Verified limitation relevant to this problem**

The documented workflow is oriented toward an instructor/course platform and dialogue-derived mastery. It is evidence that the broader technical concept is already being explored, not evidence that the proposed idea is entirely new.

**Remaining need**

The hackathon opportunity is narrower: student-side auditing of **arbitrary syllabus + arbitrary personal study-material bundles**, with explicit source evidence and assessment evidence.

---

## 6.2 Comparison table

| Existing Solution | What It Does Well | Verified Limitation | Remaining User Need | Evidence |
|---|---|---|---|---|
| Google Gemini Notebook | Source-grounded Q&A, citations, study guides, mind maps | Not documented as a syllabus coverage/mastery auditor | Curriculum coverage + evidence state + demonstrated mastery | Google documentation [8][9] |
| Quizlet AI | Practice tests, flashcards, study guides, homework help | Focus is study generation/practice rather than syllabus evidence auditing | Topic-to-source mapping and explicit uncovered-topic detection | Quizlet [10] |
| Khanmigo | Guided tutoring and learning support | Strongly tied to Khan Academy content ecosystem | Arbitrary institutional syllabus + personal materials | Khan Academy [11] |
| Squirrel Ai | Diagnostic/adaptive learning and personalized paths | Larger platform/data infrastructure | Lightweight student-owned auditing workflow | Squirrel Ai [6] |
| Uedu | Course and student knowledge graphs | Instructor/course-centric documented workflow | Self-service student evidence audit | Uedu [7] |
| CourseKG research | Knowledge graph for precision teaching | Research system, not a general student product | Practical lightweight implementation | CourseKG [12] |
| Emerging syllabus-first tools | Syllabus extraction, learning paths, quizzes, tracking | Market is increasingly crowded | Stronger differentiation than “syllabus + chatbot” | LEARN-X, CourseShark, Gyani AI |
| Proposed Auditor | Syllabus + personal materials + evidence + retrieval state | Requires careful extraction/evaluation | Transparent answer to “what am I actually covered on?” | Proposed design |

## Critical originality conclusion

The original concept **“personalized syllabus-to-learning assistant” is not sufficiently differentiated by itself**.

Current products already market:

- syllabus upload,
- knowledge graphs,
- personalized paths,
- quizzes,
- study plans,
- tutoring,
- progress tracking.

Therefore, a hackathon team presenting the original concept unchanged could reasonably receive the judge objection:

> “Why isn't this just NotebookLM/Quizlet/Khanmigo plus a syllabus parser?”

The research supports redesigning the problem around **auditable coverage and demonstrated evidence**, rather than claiming that AI tutoring itself is novel.

---

# 7. Candidate Problem Shortlist

## Candidate 1 — Generic Syllabus-to-Personal Tutor

### Problem

Students have syllabi but must manually turn them into a study plan, practice set and tutoring workflow.

### Primary user

College or senior-school student.

### Scenario

Student uploads a syllabus and asks the system to create a personalized course.

### Evidence

Syllabus-first and personalized AI learning products already exist, including Gyani AI, LEARN-X, CourseShark and other emerging platforms. [13][14][15]

### Existing workaround

Students use AI chatbots, search engines, notes, LMS platforms and quiz apps.

### Verified gap

Weak. The basic problem is already heavily commercialized and represented in hackathon projects.

### Potential outcome

A personalized learning plan and topic dashboard.

### Input

Syllabus.

### Output

Topic graph, study plan, quizzes, explanations.

### Main technical challenge

Document parsing and adaptive recommendation.

### Main risk

Low defensibility and high “AI wrapper” perception.

### Minimum demonstration

Upload a syllabus and receive a generated plan.

### Verdict

**Reject as final problem.**

---

## Candidate 2 — Source-Grounded AI Study Companion

### Problem

Students want explanations and practice based specifically on their own notes and textbooks rather than generic web knowledge.

### Primary user

Student.

### Scenario

Upload notes/PDFs and ask questions.

### Evidence

Google Gemini Notebook explicitly provides source-grounded answers with inline citations, and Quizlet supports AI study tools based on uploaded material. [8][10]

### Existing workaround

NotebookLM/Gemini Notebook, ChatGPT-style tools, Quizlet and other document Q&A systems.

### Verified gap

The basic problem is already strongly addressed.

### Potential outcome

Cited explanations and generated practice.

### Main technical challenge

RAG and citation extraction.

### Main risk

Easy for judges to compare directly with existing mature products.

### Verdict

**Reject.**

---

## Candidate 3 — Adaptive Retrieval-Based Study Planner

### Problem

Students often know what they intend to study but do not know what to practice next or how frequently to revisit concepts.

### Primary user

Self-directed student.

### Scenario

Student answers topic questions; the system estimates weak areas and schedules future retrieval.

### Evidence

Retrieval practice has strong learning-science support, while adaptive systems such as Squirrel Ai already implement assessment-driven personalized learning. [2][3][6]

### Existing workaround

Anki, Quizlet, manual revision schedules and adaptive platforms.

### Verified gap

A low-cost curriculum-specific implementation is plausible, but the basic idea is not new.

### Potential outcome

A topic-level revision queue driven by performance.

### Main technical challenge

Mastery estimation and scheduling.

### Main risk

A weakly validated “mastery score” could look scientific without actually being reliable.

### Verdict

**Potential component, not strongest standalone problem.**

---

## Candidate 4 — Syllabus–Material Coverage Auditor

### Problem

Students have a syllabus and many study resources but lack a reliable way to determine which syllabus requirements are actually supported by their materials and which are missing or only weakly covered.

### Primary user

Student studying from mixed personal and institutional materials.

### Scenario

Upload syllabus + lecture slides + notes + textbook excerpts. The system maps evidence to syllabus topics.

### Evidence

Knowledge-graph research demonstrates that educational concepts can be extracted and related from course information and materials. Google demonstrates source-grounded document analysis. However, the reviewed consumer tools do not clearly document this exact student-side coverage-audit workflow. [7][8][12]

### Existing workaround

Manual comparison of syllabus against notes, search, highlighting and spreadsheets.

### Verified gap

Meaningful and specific.

### Potential outcome

A coverage map showing:

- well-supported topics,
- weakly supported topics,
- uncovered topics,
- source citations,
- duplicate/overlapping material.

### Input

Syllabus + study materials.

### Output

Evidence-linked topic graph and coverage report.

### Main technical challenge

Topic extraction, semantic matching, evidence scoring, provenance.

### Minimum demonstration

Upload a syllabus and deliberately incomplete notes. System identifies missing topics and shows supporting passages for covered topics.

### Verdict

**Top candidate.**

---

## Candidate 5 — Evidence-Based Syllabus Mastery Auditor

### Problem

A student can mark a topic complete even when they cannot retrieve or apply its key concepts.

### Primary user

Student.

### Scenario

After coverage mapping, the system generates short source-grounded questions for each topic and updates the topic state based on responses.

### Evidence

Retrieval practice can support learning and can provide feedback about what needs additional effort. LLMs also require factuality controls. [2][4]

### Existing workaround

Quizlet, flashcards, practice tests, manual self-testing.

### Verified gap

Stronger when combined with Candidate 4: assessment is linked to explicit syllabus topics and source evidence rather than being a disconnected quiz.

### Potential outcome

A transparent distinction between:

- material available,
- material studied,
- retrieval demonstrated.

### Input

Syllabus + materials + student answers.

### Output

Evidence-backed topic state and next-action recommendation.

### Main technical challenge

Answer evaluation, mastery-state design, source provenance.

### Minimum demonstration

Student answers questions from two topics; one correct and one weak; system updates topic states and recommends targeted review.

### Verdict

**Best when merged with Candidate 4.**

---

# 8. Candidate Scoring and Selection

## Weighted scoring framework

Weights follow the requested general hackathon framework and are **not presented as official SIH or any specific event's judging weights**.

| Criterion | Weight |
|---|---:|
| Problem severity and clarity | 12% |
| Evidence quality and research depth | 10% |
| Innovation and defensible differentiation | 15% |
| Technical depth | 12% |
| Feasibility within available time | 12% |
| Working MVP and demonstration potential | 12% |
| User/societal/industrial impact | 10% |
| Practical adoption and scalability | 7% |
| UX and ease of understanding | 5% |
| Sustainability and future development | 5% |
| **Total** | **100%** |

### Scores

| Candidate | Severity | Evidence | Innovation | Technical | Feasibility | Demo | Impact | Adoption | UX | Sustainability | Weighted Score |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1. Generic Syllabus Tutor | 8 | 8 | 3 | 7 | 9 | 9 | 7 | 8 | 9 | 8 | **6.95/10** |
| 2. Source-Grounded Study Companion | 7 | 9 | 3 | 7 | 9 | 9 | 7 | 8 | 9 | 8 | **7.00/10** |
| 3. Adaptive Retrieval Planner | 8 | 9 | 6 | 8 | 7 | 8 | 8 | 7 | 8 | 9 | **7.65/10** |
| 4. Syllabus–Material Coverage Auditor | 9 | 9 | 8 | 9 | 8 | 10 | 9 | 8 | 9 | 9 | **8.80/10** |
| 5. Evidence-Based Mastery Auditor | 9 | 9 | 8 | 9 | 7 | 10 | 9 | 8 | 9 | 9 | **8.65/10** |

## Top three

### 1. Syllabus–Material Coverage Auditor — 8.80/10

Best balance of a clear problem, defensible gap, meaningful technical work and immediate demo value.

### 2. Evidence-Based Mastery Auditor — 8.65/10

Technically strong and educationally meaningful, but mastery inference can become scientifically questionable if the MVP overclaims what a few AI-graded questions can establish.

### 3. Adaptive Retrieval Planner — 7.65/10

Evidence-backed learning mechanism and useful personalization, but existing adaptive-learning and spaced-repetition systems reduce novelty.

## Final selection

### **Merge Candidates 4 + 5 into one focused problem: Syllabus-to-Evidence Learning Gap Auditor**

The final system should first answer:

> **“Does my study material actually cover what my syllabus requires?”**

Then answer:

> **“Can I demonstrate the important concepts, rather than simply marking them complete?”**

This sequence is stronger than starting with a chatbot.

---

# 9. Detailed Analysis of the Selected Problem

## 9.1 Problem context

The modern student can obtain more educational content than ever before. The problem is increasingly one of **alignment and verification**, not simply access.

A syllabus describes required course scope. Study materials contain information. Practice questions produce evidence about recall or understanding. These artifacts are often separated.

The proposed problem is to connect them into a transparent chain:

**Requirement → Source Evidence → Practice Evidence → Current State → Next Action**

## 9.2 Primary user

The primary user is a self-directed student who has:

- a syllabus;
- several study materials;
- limited time;
- a need to prepare for an assessment;
- access to a laptop/browser;
- no specialized infrastructure.

The MVP does not require institution-wide deployment.

## 9.3 Secondary stakeholders

Potential future stakeholders include:

- teachers;
- teaching assistants;
- coaching organizations;
- academic support teams;
- curriculum designers.

These should not be the primary MVP because institutional integrations dramatically increase complexity.

## 9.4 Current workflow

A typical workflow is:

1. Open syllabus.
2. Copy or identify topic names.
3. Search notes/slides/textbooks.
4. Read material.
5. Mark topic as complete.
6. Search for questions.
7. Practice.
8. Decide subjectively whether the topic is understood.

The missing artifact is a **traceable topic-level evidence state**.

## 9.5 Specific failure

A topic can appear “complete” while one of the following is true:

- no study material covers it;
- the material only mentions it;
- the student has not practiced it;
- the student cannot retrieve the answer;
- the source evidence is ambiguous;
- the topic depends on a prerequisite the student has not demonstrated.

The MVP should not pretend to solve all of these perfectly. It should explicitly distinguish them.

## 9.6 Root causes

### Fragmented information

Syllabus, notes, slides and questions usually exist in separate files.

### Flat curriculum representation

A syllabus is often represented as a list of headings rather than an operational graph of topics and evidence.

### Self-reported completion

Students commonly use completion as a proxy for mastery, but completion does not itself demonstrate retrieval.

### Generative abundance

AI makes it cheap to generate more explanations and questions, increasing the need to organize and verify them.

### Lack of provenance

A generated explanation may sound convincing without making it obvious which source supports it.

## 9.7 Consequences

Potential consequences include:

- time spent studying already-covered material while missing other topics;
- discovering coverage gaps late;
- poor prioritization;
- unverified AI-generated explanations;
- false confidence from passive reading;
- repeated manual comparison of notes against syllabus.

These are plausible operational consequences. The report does not claim a measured percentage reduction from the proposed tool.

## 9.8 Existing alternatives

Existing alternatives are individually strong:

- source-grounded notebook systems;
- AI tutors;
- quiz platforms;
- adaptive learning;
- manual spreadsheets;
- flashcards;
- LMS progress tracking.

The proposed system does not compete by claiming those tools are bad. It connects a specific sequence that is not clearly the primary workflow of the reviewed consumer products.

---

# 10. Originality and Differentiation Audit

## 10.1 What is established

The following ideas are clearly established:

- AI tutoring.
- AI-generated quizzes.
- Source-grounded document Q&A.
- Syllabus parsing.
- Knowledge graphs.
- Adaptive learning.
- Student mastery tracking.
- Personalized study plans.

Therefore, none of these should be claimed as novel.

## 10.2 What appears underexplored in the reviewed market

The more specific combination is:

> **A student-owned, syllabus-first evidence auditor that maps arbitrary personal study materials to curriculum requirements, explicitly identifies unsupported/weakly supported topics, and then uses source-grounded retrieval evidence to distinguish material coverage from demonstrated learning.**

The claim is deliberately limited to **“not clearly demonstrated by the reviewed solutions”**, not “no one has ever built this.”

## 10.3 Technical differentiation

The system can represent each topic with two independent evidence dimensions:

### Content evidence

> “Do my uploaded materials contain enough relevant evidence for this syllabus topic?”

### Learning evidence

> “Has the student demonstrated the concept through a retrieval task?”

This avoids collapsing both questions into a single AI-generated “mastery score.”

## 10.4 Suggested state model

Each topic can have a state such as:

| State | Meaning |
|---|---|
| `UNMAPPED` | Syllabus topic extracted but not yet matched to material |
| `MATERIAL_GAP` | No sufficiently relevant source passage found |
| `WEAK_EVIDENCE` | Some related material exists but coverage is insufficient/uncertain |
| `READY_TO_PRACTICE` | Source evidence exists and practice can be generated |
| `PRACTICE_WEAK` | Student's recent retrieval response indicates need for review |
| `DEMONSTRATED` | Student passed the configured evidence threshold |
| `REVIEW` | Previously demonstrated topic should be revisited |

These states are **product states**, not claims of psychological mastery.

## 10.5 Differentiation rule

The team should never say:

> “Our AI knows exactly what the student has mastered.”

Instead say:

> “Our system maintains a transparent evidence state based on curriculum mapping, source coverage and observed practice responses.”

That is technically more defensible.

---

# 11. User Interaction and Input-Output Specification

## 11.1 User

A student preparing for a course exam.

## 11.2 Required inputs

### Input A — syllabus

Supported MVP formats:

- PDF;
- DOCX;
- TXT/Markdown;
- pasted text.

The syllabus is parsed into:

- units;
- topics;
- subtopics;
- learning outcomes where explicitly present.

### Input B — study materials

MVP supports:

- PDF;
- TXT/Markdown;
- DOCX;
- pasted notes.

Optional later support:

- URLs;
- slides;
- images/OCR.

### Input C — practice response

The user answers a generated short-answer or multiple-choice question.

## 11.3 Validation

The system should check:

- whether the syllabus contains enough text to extract topics;
- whether uploaded documents are readable;
- whether files exceed configured size limits;
- whether a topic has usable evidence;
- whether the question is actually associated with a topic;
- whether the user's response is empty or malformed.

Unsupported documents should produce an explicit error rather than a fabricated result.

## 11.4 Processing pipeline

### Step 1 — Parse syllabus

Extract structured topics.

### Step 2 — Normalize topics

Normalize wording while retaining the original syllabus phrase.

Example:

- Original: “Principles of Object Oriented Programming”
- Canonical label: “Object-Oriented Programming Principles”

The original wording remains available for provenance.

### Step 3 — Build topic graph

Represent:

- unit → topic;
- topic → subtopic;
- explicit prerequisite relationships when stated;
- source evidence → topic.

The system should avoid inventing prerequisite relationships when the syllabus does not support them.

### Step 4 — Chunk study materials

Split documents into retrievable passages while preserving:

- filename;
- page/section where available;
- chunk identifier.

### Step 5 — Match evidence

Use embeddings or hybrid lexical/semantic retrieval to identify passages relevant to each topic.

### Step 6 — Score coverage

A simple MVP score can combine:

- semantic similarity;
- number of independent supporting passages;
- explicit topic-name matches;
- optional LLM verification.

The score should be presented as an **evidence score**, not as a scientifically validated percentage of “learning.”

### Step 7 — Generate questions

For topics with adequate evidence, generate a short retrieval question using only the retrieved source passages.

### Step 8 — Evaluate answer

For the MVP, use structured grading:

- exact/semantic matching for objective questions;
- rubric-based LLM grading for short answers;
- citation to the source passages used to construct the question.

### Step 9 — Update state

Update the topic state using the answer result.

### Step 10 — Recommend next action

Prioritize topics by:

1. missing source evidence;
2. weak practice performance;
3. syllabus importance where explicitly available;
4. recency of demonstrated practice.

## 11.5 Expected output

A dashboard should show:

- curriculum graph;
- coverage status;
- source citations;
- practice status;
- recommended next topic.

Example:

```text
UNIT 2 — Data Structures

✓ Arrays
  Material: Strong
  Practice: Demonstrated
  Sources: Lecture_03.pdf p.4–8

⚠ Linked Lists
  Material: Weak
  Practice: Not attempted
  Sources: Notes.pdf p.12

✕ Circular Linked Lists
  Material: No supporting evidence found
  Practice: Blocked
  Action: Find/add material

→ Recommended next action:
   Review Linked Lists, then attempt a retrieval question.
```

---

# 12. Reproducible Demonstration

## Demonstration input

Upload a deliberately incomplete syllabus/material pair.

### Syllabus

```text
Data Structures

Unit 1
1. Arrays
2. Linked Lists
3. Stacks

Unit 2
4. Queues
5. Trees
6. Graphs
```

### Study material bundle

```text
Lecture 1 — Arrays
Lecture 2 — Linked Lists
Lecture 3 — Stacks
Lecture 4 — Queues

No material for Trees or Graphs.
```

## Expected processing

The system extracts six syllabus topics and matches the four available lecture documents.

## Expected output

```text
Covered:
Arrays
Linked Lists
Stacks
Queues

Missing evidence:
Trees
Graphs
```

Each covered topic should show the source file and page/chunk.

## Second interaction

The user selects **Linked Lists**.

The system generates a question grounded in the uploaded Linked Lists material.

Example:

```text
Explain why insertion at the head of a singly linked list can be O(1),
and identify the information required to perform it.
```

The user answers.

## Expected state change

Before:

```text
Linked Lists
Material: Strong
Practice: Not attempted
State: READY_TO_PRACTICE
```

After a satisfactory answer:

```text
Linked Lists
Material: Strong
Practice: Demonstrated
State: DEMONSTRATED
```

If the answer is weak:

```text
Linked Lists
Material: Strong
Practice: Weak
State: PRACTICE_WEAK
Action: Review cited passage and retry.
```

## Edge case

Upload a syllabus containing a topic that has no corresponding material.

Expected behavior:

- Do not generate a source-grounded question pretending that the material exists.
- Mark the topic `MATERIAL_GAP`.
- Explain that the system cannot produce a grounded question from absent evidence.
- Allow the student to add a source and re-run mapping.

## Verification method

A judge can verify:

1. The topic graph contains exactly the supplied topics.
2. Missing topics are genuinely absent from the supplied material.
3. A cited passage for a covered topic actually contains relevant information.
4. Changing the material changes the coverage result.
5. Changing the student's answer changes the practice state.
6. Generated questions cite the source evidence used to create them.

## Evaluation metric

For the hackathon MVP, measure:

- topic extraction accuracy against a manually created ground-truth list;
- coverage classification precision/recall on a small manually labeled document set;
- citation validity rate;
- practice-state consistency against a predefined rubric;
- end-to-end processing time.

These are **evaluation targets**, not pre-existing results.

---

# 13. Technical Depth and Feasibility

## 13.1 Core technical challenge

The hard part is not generating text.

The hard part is maintaining a reliable relationship:

**syllabus topic ↔ source passage ↔ generated question ↔ student response ↔ current evidence state**

This creates a useful engineering challenge involving:

- document parsing;
- chunking;
- embeddings;
- retrieval;
- graph representation;
- provenance;
- structured LLM output;
- evaluation;
- state management.

## 13.2 Proposed architecture

```text
                 ┌────────────────────┐
                 │      Web Client    │
                 │ Upload / Graph / QA │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │     API Server     │
                 │ Auth + Orchestration│
                 └─────────┬──────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
      ┌────────────┐ ┌────────────┐ ┌──────────────┐
      │ Doc Parser │ │ Topic/Graph│ │ Practice     │
      │ PDF/DOCX   │ │ Builder    │ │ Generator    │
      └─────┬──────┘ └─────┬──────┘ └──────┬───────┘
            │              │               │
            └──────────────┼───────────────┘
                           ▼
                  ┌──────────────────┐
                  │ Retrieval Layer  │
                  │ Embeddings +     │
                  │ Metadata filters │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Evidence Store   │
                  │ Sources / Chunks │
                  │ Topics / States  │
                  └──────────────────┘
```

## 13.3 Suggested stack

### Frontend

- React + Vite or Next.js.
- Tailwind CSS.
- React Flow for topic graph.
- A lightweight chart library for progress.

### Backend

Recommended for this team:

- Python.
- FastAPI.
- Pydantic.
- PyMuPDF or another mature PDF parser.
- python-docx for DOCX extraction.

### Database

- SQLite for the hackathon.
- Optional PostgreSQL/Supabase for deployment.

### Retrieval

Two practical choices:

**Option A — simplest**
- SQLite + stored embeddings.
- Cosine similarity computed in Python.

**Option B — hosted**
- Supabase/Postgres with vector support if the team is comfortable with it.

For a 24–48 hour MVP, Option A minimizes infrastructure risk.

### AI

Use a low-cost/free-tier model through an accessible provider when possible.

AI tasks:

1. syllabus structure extraction;
2. semantic topic normalization;
3. evidence verification;
4. grounded question generation;
5. short-answer grading.

Do not use AI for operations that can be deterministic.

## 13.4 Deterministic versus AI responsibilities

### Deterministic

- file validation;
- text extraction;
- chunk IDs;
- metadata;
- database state;
- score aggregation;
- state transitions;
- UI rendering.

### AI-assisted

- extracting ambiguous topic structures;
- semantic normalization;
- question generation;
- answer evaluation;
- natural-language explanation.

This split improves reliability and makes the system easier to debug.

## 13.5 Why a trivial implementation is insufficient

A simple chatbot would fail the central problem because it does not establish:

- complete syllabus coverage;
- source evidence;
- missing-topic detection;
- persistent topic states;
- reproducible assessment;
- measurable changes after new input.

The MVP must have a real data model and state transitions.

## 13.6 Minimal viable graph

A graph does not need to be mathematically sophisticated.

Nodes:

```text
Unit
Topic
Subtopic
Source
PracticeAttempt
```

Edges:

```text
CONTAINS
SUPPORTED_BY
TESTED_BY
PREREQUISITE_OF
```

Each evidence edge should store:

- source ID;
- page/section;
- retrieval score;
- optional verification status.

## 13.7 Smallest credible MVP

### Must work

1. Upload syllabus.
2. Extract topics.
3. Upload study PDFs/text.
4. Match materials to topics.
5. Show covered/missing topics with citations.
6. Generate a grounded question for one selected topic.
7. Accept an answer.
8. Update the topic's practice state.

### Defer

- voice tutor;
- OCR;
- YouTube ingestion;
- LMS integrations;
- multi-user classrooms;
- advanced knowledge tracing;
- predictive exam scores;
- automatic prerequisite discovery without evidence;
- institution-wide analytics.

---

# 14. Impact and Evaluation Plan

## 14.1 Proposed impact

The intended benefit is **better study prioritization and verification**, not guaranteed grade improvement.

A successful tool should make it easier for a student to answer:

1. What am I required to learn?
2. Which of those topics are supported by my current material?
3. Where is the supporting evidence?
4. Which topics have I actually practiced?
5. Which topic should I work on next?

## 14.2 Metrics

### Metric 1 — Topic extraction accuracy

**Measures:** Whether extracted syllabus topics match a manually prepared ground truth.

**Method:** Manually annotate 20–50 topics and compare system output.

**Limitation:** Topic boundaries can be subjective.

### Metric 2 — Evidence mapping precision

**Measures:** Fraction of passages classified as supporting a topic that human reviewers agree are relevant.

**Method:** Human-label a small sample.

### Metric 3 — Evidence mapping recall

**Measures:** Fraction of known relevant passages that the retrieval layer finds.

### Metric 4 — Citation validity

**Measures:** Whether each displayed citation actually supports the associated claim.

### Metric 5 — Practice-state agreement

**Measures:** Agreement between a predefined answer rubric and the automated state.

### Metric 6 — End-to-end latency

**Measures:** Time from upload to first usable coverage map.

## 14.3 Baseline

A practical baseline is:

> Student manually compares the syllabus against a folder of study documents.

For the hackathon, measure:

- number of manual steps;
- time to identify missing topics;
- number of missed topics.

The team should not claim an improvement until this is actually measured.

## 14.4 Proposed success conditions

A credible hackathon success condition is:

- the system processes a fresh syllabus and material bundle;
- it correctly identifies the deliberately inserted material gaps;
- it provides valid citations for covered topics;
- it refuses to fabricate evidence for missing topics;
- it generates questions from retrieved evidence;
- the topic state changes after a fresh student response.

These demonstrate functionality without pretending to establish educational efficacy.

---

# 15. Risk and Failure Analysis

## 15.1 Hallucinated explanations

### Risk

The LLM can generate incorrect content.

### Mitigation

- Use retrieved source passages as context.
- Require structured citations.
- Show source excerpts.
- Never generate “covered” evidence from model knowledge alone.
- Add a “source insufficient” state.

### Fallback

If evidence confidence is low, show:

> “Insufficient source evidence to generate a grounded explanation.”

---

## 15.2 Incorrect topic extraction

### Risk

The model may merge or split syllabus topics incorrectly.

### Mitigation

- Preserve original syllabus text.
- Allow manual topic editing.
- Show extracted structure before finalizing.
- Use deterministic headings when available.

### Fallback

Allow the user to edit topic labels.

---

## 15.3 False mastery

### Risk

One correct answer does not prove mastery.

### Mitigation

Use terms such as `DEMONSTRATED` rather than claiming psychological mastery. Require multiple attempts in a future version.

### Fallback

Display:

> “Evidence from recent practice — not a clinical or psychometric mastery assessment.”

---

## 15.4 Poor semantic retrieval

### Risk

A relevant passage may not be retrieved.

### Mitigation

Use hybrid retrieval:

- lexical matching;
- embeddings;
- topic aliases.

### Fallback

Allow the user to manually attach a source passage to a topic.

---

## 15.5 API failure

### Risk

The external LLM provider may be unavailable or rate-limited.

### Mitigation

- Keep deterministic document parsing and coverage logic independent.
- Cache generated artifacts.
- Provide a small preloaded demo dataset for presentation only.

### Important distinction

The preloaded demo is a fallback demonstration, not evidence that the system works on arbitrary inputs.

---

## 15.6 Privacy

### Risk

Students may upload private notes, academic records or copyrighted material.

### Mitigation

- Process locally where possible.
- Minimize stored documents.
- Delete uploaded files after processing when persistence is unnecessary.
- Explain retention.
- Do not train models on user data.
- Avoid uploading sensitive institutional data in the hackathon demo.

UNESCO explicitly emphasizes data privacy in educational GenAI governance. [1]

---

## 15.7 Copyright

### Risk

Users may upload textbooks or other copyrighted documents.

### Mitigation

- State that users should only upload materials they have permission to process.
- Avoid redistributing source documents.
- Store only the minimum needed excerpts/metadata.

Google's documentation also cautions users about rights when uploading sources. [9]

---

# 16. Hackathon Judging Assessment

## 1. Problem understanding

**Potential: Very strong**

The problem is easy to demonstrate: a syllabus says what must be learned, materials show what is available, and practice shows what has been demonstrated.

**Judge concern:** Is this merely organization?

**Defense:** The system creates a verifiable evidence chain rather than only displaying files.

---

## 2. Innovation and novelty

**Potential: Strong**

The novelty should be framed as the specific workflow and evidence model, not AI tutoring.

**Judge concern:** Similar knowledge-graph products exist.

**Defense:** Acknowledge them. Explain the narrower student-owned evidence-auditing problem.

---

## 3. Technical complexity

**Potential: Strong**

Document ingestion, semantic retrieval, graph modeling, provenance, grounded generation and state transitions provide genuine engineering depth.

**Judge concern:** “Isn't this just RAG?”

**Defense:** RAG is one component. The core system is the persistent curriculum/evidence state and its transitions.

---

## 4. Technical feasibility

**Potential: Very strong**

The system can run without a GPU and can use SQLite, FastAPI and hosted/free-tier LLM access.

**Judge concern:** LLM APIs may fail.

**Defense:** Core parsing, storage, retrieval and state logic remain functional independently.

---

## 5. Architecture and system design

**Potential: Strong**

Clear separation between ingestion, retrieval, graph state, generation and evaluation.

**Judge concern:** Overengineering.

**Defense:** Keep the graph minimal and use SQLite.

---

## 6. Implementation quality

**Potential: Depends on team**

The MVP must work on fresh uploads rather than only a prepared dataset.

**Judge test:** Upload a new syllabus during the demo.

---

## 7. User experience

**Potential: Very strong**

A visual coverage graph plus source evidence creates an immediate visual explanation.

**Design requirement:** Avoid a generic chatbot-first UI. Make the evidence map the primary interface.

---

## 8. Social/industrial impact

**Potential: Strong**

Students can use it without institutional infrastructure.

**Limitation:** No evidence yet that it improves grades.

**Correct claim:** It aims to reduce manual study-gap detection and improve transparency of study evidence.

---

## 9. Scalability

**Potential: Strong**

The conceptual model can extend to many courses.

**Limitation:** Large-scale document processing and institutional data introduce new infrastructure and privacy requirements.

---

## 10. Practical adoption

**Potential: Strong**

Input requirements are simple: syllabus + existing materials.

**Judge concern:** Students already use ChatGPT/NotebookLM.

**Defense:** Demonstrate the missing-topic audit and persistent evidence state.

---

## 11. Sustainability

**Potential: Strong**

The architecture can move from a hackathon SQLite prototype to PostgreSQL/vector storage.

**Risk:** API cost.

**Mitigation:** Smaller models, caching, local retrieval, batch processing.

---

## 12. Business/operational viability

**Potential: Moderate-to-strong**

Potential users include students and institutions.

**Limitation:** Pricing and market validation have not been researched deeply enough to claim a business model.

---

## 13. Future scope

Strong possible extensions:

- teacher verification;
- multiple courses;
- LMS integrations;
- past-paper alignment;
- spaced retrieval scheduling;
- multilingual study materials;
- collaborative course knowledge graphs.

These are future scope, not MVP commitments.

---

## 14. Presentation clarity

**Potential: Excellent**

The concept can be summarized as:

> **“Don't just track what you studied. Prove what your syllabus is covered by, and what you can demonstrate.”**

This is a presentation hook, not the formal problem statement.

---

## 15. Demo quality

**Potential: Excellent**

The best demo sequence:

1. Upload syllabus.
2. Upload incomplete notes.
3. Show red/missing topics.
4. Click a covered topic.
5. Show exact source evidence.
6. Generate a grounded question.
7. Answer incorrectly.
8. Show the topic becoming “Needs practice.”
9. Answer correctly.
10. Show state changing.
11. Add a new source.
12. Watch the previously missing topic become supported.

The dynamic change is critical.

---

## 16. Q&A defensibility

Strong answers:

**“How is this different from NotebookLM?”**

> NotebookLM is excellent at source-grounded research and Q&A. Our problem is narrower: auditing whether arbitrary student-owned materials cover an explicit syllabus, then linking that evidence to observed practice.

**“How do you know someone mastered a topic?”**

> We don't claim to measure psychological mastery. We maintain a transparent evidence state based on recent retrieval performance.

**“Why use AI?”**

> AI is useful for semantic topic extraction, evidence verification, question generation and short-answer evaluation. Deterministic components handle provenance and state transitions.

**“What if the AI hallucinates?”**

> A topic cannot be marked as source-covered without retrieved evidence. Low-confidence evidence is surfaced as uncertain rather than silently converted into a claim.

---

## 17. Team collaboration

A 2–4 person team can divide work:

### Person 1 — Frontend

- upload flow;
- graph;
- dashboard;
- practice interface.

### Person 2 — Backend

- FastAPI;
- database;
- file processing;
- state model.

### Person 3 — AI/RAG

- topic extraction;
- embeddings;
- retrieval;
- question generation;
- answer evaluation.

### Person 4 — Integration/QA

- test dataset;
- citations;
- edge cases;
- deployment;
- demo preparation.

---

## 18. Documentation quality

The project should document:

- data model;
- evidence states;
- source provenance;
- limitations;
- test inputs;
- evaluation methodology;
- API/provider dependencies.

This makes the project more defensible than a visually polished chatbot.

---

# 17. MVP Boundary and Success Conditions

## Must have

### 1. Syllabus ingestion

Accept a real user-uploaded syllabus.

### 2. Topic extraction

Produce an editable topic tree.

### 3. Material ingestion

Accept at least PDF and TXT/Markdown.

### 4. Evidence mapping

Map source passages to topics and show citations.

### 5. Gap detection

Show missing and weakly supported topics.

### 6. Grounded practice

Generate a question from retrieved evidence.

### 7. Practice state

Update the topic state based on the answer.

### 8. Fresh-input demonstration

The system must work on a syllabus/material set not hard-coded into the application.

## Nice to have

- React Flow knowledge graph.
- Multiple question types.
- Spaced revision.
- multilingual explanations;
- OCR;
- past-paper alignment;
- exportable study report.

## Explicitly out of scope

- predicting exam marks;
- claiming clinical/psychological learning diagnosis;
- institution-wide LMS integration;
- automated curriculum accreditation;
- guaranteed learning gains;
- universal prerequisite inference;
- autonomous educational decision-making for minors;
- training a custom foundation model.

## MVP acceptance tests

### Test A — Topic extraction

Input: known syllabus.

Pass condition: extracted topics match manually prepared ground truth within an agreed tolerance.

### Test B — Missing material

Remove two topic documents.

Pass condition: the system identifies the two intentionally missing areas.

### Test C — Citation

Select a covered topic.

Pass condition: every evidence card points to a real source passage containing relevant information.

### Test D — Grounded question

Generate a question.

Pass condition: the question can be answered from the cited evidence.

### Test E — State transition

Submit a strong and weak answer.

Pass condition: the topic state changes according to the configured rubric.

### Test F — New input

Upload a different syllabus.

Pass condition: the application does not rely on hard-coded topic names.

---

# 18. Assumptions, Unknowns, and Unverified Claims

| Item | Status | What remains unknown | How to resolve |
|---|---|---|---|
| Students need curriculum-to-material coverage visibility | Research-supported inference | Magnitude of demand among target students | Student interviews/survey |
| Retrieval practice is useful | Research-supported | Exact benefit for this specific workflow | Controlled pilot |
| LLMs can hallucinate | Verified research finding | Error rate of selected model | Benchmark with adversarial questions |
| Reviewed consumer tools do not clearly document the exact proposed workflow | Market-review finding | Hidden/unadvertised capabilities | Product testing |
| Coverage score reflects actual source adequacy | Hypothesis | Human agreement | Annotated benchmark |
| Practice state approximates useful learning evidence | Design hypothesis | Predictive validity | Repeated assessments |
| Students will upload their own materials | Adoption assumption | Willingness and friction | Usability study |
| Free/low-cost APIs will be available | Dependency assumption | Provider limits may change | Keep provider abstraction and local fallback |
| The system can scale to institutional deployment | Future hypothesis | Privacy, cost and integration complexity | Pilot with real institution |
| The approach improves grades | Unverified | No evidence in this report | Controlled educational study |

---

# 19. References

## [1] UNESCO — Guidance for Generative AI in Education and Research

Miao, F., & Holmes, W. (2023). *Guidance for generative AI in education and research*. UNESCO. Published 7 September 2023; page updated 16 January 2026.

https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research

Key use: educational GenAI governance, human-centred design, privacy, ethical validation.

---

## [2] McDermott — Practicing Retrieval Facilitates Learning

McDermott, K. B. (2021). “Practicing Retrieval Facilitates Learning.” *Annual Review of Psychology*, 72, 609–633.

DOI: https://doi.org/10.1146/annurev-psych-010419-051019

PubMed: https://pubmed.ncbi.nlm.nih.gov/33006925/

Key use: retrieval practice and learning.

---

## [3] Trumble et al. — Systematic Review of Distributed and Retrieval Practice

Trumble, E., Lodge, J., Mandrusiak, A., & Forbes, R. (2024). “Systematic review of distributed practice and retrieval practice in health professions education.” *Advances in Health Sciences Education*, 29, 689–714.

DOI: https://doi.org/10.1007/s10459-023-10274-3

PubMed: https://pubmed.ncbi.nlm.nih.gov/37615780/

Key use: systematic evidence and limitations of retrieval/distributed practice.

---

## [4] Farquhar et al. — Detecting Hallucinations in Large Language Models Using Semantic Entropy

Farquhar, S., Kossen, J., Kuhn, L., et al. (2024). “Detecting hallucinations in large language models using semantic entropy.” *Nature*, 630, 625–630.

https://www.nature.com/articles/s41586-024-07421-0

Key use: LLM hallucination/factuality risk.

---

## [5] Menczer et al. — Factuality Challenges in the Era of Large Language Models

Menczer, F., Miguez, R., Nakov, P., et al. (2024). “Factuality challenges in the era of large language models and opportunities for fact-checking.” *Nature Machine Intelligence*, 6, 852–863.

https://www.nature.com/articles/s42256-024-00881-z

Key use: factuality and verification challenges.

---

## [6] Squirrel Ai — AI Learning Platform and Adaptive Learning

Official product and technology documentation.

https://squirrelai.com/

https://squirrelai.com/how-it-works/

https://squirrelai.com/technology/

Key use: competitor research on diagnostic/adaptive learning, knowledge graphs and personalized pathways.

---

## [7] Uedu — Knowledge Graph Analysis Methodology

Uedu public technical documentation.

https://uiuc.uedu.tw/doc/knowledge-graph

Key use: course knowledge graphs, concept relationships and student mastery tracking.

---

## [8] Google — Gemini Notebook

Official Google Notebook documentation.

https://support.google.com/gemininotebook/answer/16164461

Key use: source-grounded Q&A, inline citations and study artifacts.

---

## [9] Google — Gemini Notebook Source Types and Limitations

Official Google documentation.

https://support.google.com/gemininotebook/answer/16215270

Key use: supported source formats, source grounding and upload constraints.

---

## [10] Quizlet — AI-Powered Study Tools

Official Quizlet product documentation.

https://quizlet.com/features/ai-study-tools

Key use: competitor research on AI-generated practice tests, study guides, flashcards and homework help.

---

## [11] Khan Academy — Khanmigo

Official Khan Academy / Khan Labs documentation.

https://www.khanacademy.org/khan-labs

Key use: competitor research on guided AI tutoring.

---

## [12] CourseKG — An Educational Knowledge Graph Based on Course Information for Precision Teaching

Li, Y., Liang, Y., Yang, R., Qiu, J., Zhang, C., & Zhang, X. (2024). “CourseKG: An Educational Knowledge Graph Based on Course Information for Precision Teaching.” *Applied Sciences*, 14(7), 2710.

DOI: https://doi.org/10.3390/app14072710

Key use: academic evidence that course knowledge graphs can structure educational concepts and support precision teaching.

---

## [13] Gyani AI

Official product page.

https://ai.gyaniversity.com/

Key use: evidence that syllabus-specific AI tutoring, study tools, quizzes and study planning are already commercialized.

---

## [14] LEARN-X

Official product page.

https://www.learn-x.co/

Key use: evidence that syllabus-first semantic graphs and adaptive learning are already being marketed.

---

## [15] CourseShark

Official product page.

https://www.courseshark.io/

Key use: evidence that syllabus-driven GenAI tutoring, personalized courses and academic analytics are already being developed.

---

## [16] EduGraph

Official product page.

https://www.edugraph.io/

Key use: evidence that open-source/AI education systems are already working on competency extraction, curriculum mapping, knowledge graphs and grounded educational AI.

---

# Final Problem Statement

Students increasingly use AI tools, lecture slides, PDFs, notes, and online resources to prepare for courses, but they still lack a reliable way to determine whether their available study material actually covers the requirements of their syllabus and whether they can demonstrate the concepts they have marked as complete. Develop a system that maps syllabus requirements to supporting learning evidence, identifies missing or weakly supported topics, and uses verifiable practice evidence to guide students toward the areas that require further study.

# Final Problem Description

Students often study from fragmented collections of syllabi, lecture slides, notes, textbooks, practice material, and AI-generated resources. Existing AI tools can summarize documents, answer questions, generate quizzes, or provide tutoring, while adaptive-learning systems can personalize study paths. However, these capabilities do not necessarily give a student a transparent answer to two connected questions: **“Is my syllabus actually covered by the material I have?”** and **“Have I demonstrated the concepts I consider complete?”**

The challenge is to build a student-facing system that accepts a real syllabus and the learner's own study materials, extracts the curriculum structure, maps relevant source evidence to each topic, and clearly identifies missing or weakly supported areas. The system should then allow the learner to practice selected topics using questions grounded in the available source material and update the topic's evidence state from the resulting response.

A successful solution should make its reasoning inspectable through source references and should distinguish source coverage from demonstrated practice rather than claiming perfect mastery. It should operate on new user-provided inputs, handle missing or unsupported material honestly, and provide an actionable next step for the learner. The solution should be feasible on ordinary student hardware and should not depend on proprietary institutional data.
