# StudyOS — Syllabus Understanding & Parser Test Results

**Test Date:** 2026-11-07  
**Test Framework:** Vitest v3.2.7  
**Test File:** `Backend/tests/syllabus_parser.test.ts`  
**Total Tests:** 57 passing across all test files (10 dedicated parser tests).

---

## 1. Test Suite Summary

```
 RUN  v3.2.7 C:/Users/Bidisha Ghosh/OneDrive/Desktop/Orbrion/Backend

 ✓ tests/tree.test.ts (4 tests) 6ms
 ✓ tests/library_and_preferences.test.ts (13 tests) 16ms
 ✓ tests/auth_and_profiles.test.ts (5 tests) 13ms
 ✓ tests/syllabus_parser.test.ts (10 tests) 35ms
 ✓ tests/nodes.test.ts (7 tests) 25ms
 ✓ tests/syllabuses.test.ts (4 tests) 19ms
 ✓ tests/notes_and_materials.test.ts (14 tests) 24ms

 Test Files  7 passed (7)
      Tests  57 passed (57)
   Start at  15:32:10
   Duration  1.09s
```

---

## 2. Detailed Test Cases (`syllabus_parser.test.ts`)

### Test 1: Full R25 B.Tech CSE Multi-Course Boundary Detection
- **Input:** Multi-course document with 9 courses (theory and lab).
- **Result: PASSED (✓)**
- **Detected Courses:**
  1. `CS101`: Introduction to Programming and Problem Solving
  2. `PH101`: Engineering Physics
  3. `M101`: Engineering Mathematics-I
  4. `HU101`: Environmental Science
  5. `HU102`: Indian Knowledge System
  6. `CS191`: Introduction to Programming and Problem Solving Lab
  7. `PH191`: Engineering Physics Lab
  8. `ME194`: Engineering Graphics & Computer Aided Design Lab
  9. `HU191`: Communication and Presentation Skill
- **Validation:** 9 distinct courses detected; codes and names verified; no cross-course merging.

### Test 2: Administrative Information & Course Metadata Segregation
- **Input:** Course block with contact hours, credits, outcomes, objectives, CO-PO mapping, textbooks.
- **Result: PASSED (✓)**
- **Extracted Metadata:**
  - `code`: `CS101`
  - `credits`: `3`
  - `contactHours`: `3:0:0`
  - `totalContactHours`: `36L`
  - `prerequisites`: `Basic knowledge of mathematics and computers`
  - `courseObjectives`: 2 items
  - `courseOutcomes`: 4 items
  - `textbooks`: 2 items
  - `referenceBooks`: 1 item
- **Validation:** Zero administrative items in the study tree.

### Test 3: Module & Topic Hierarchy Construction
- **Input:** Multi-module curriculum with bulleted items.
- **Result: PASSED (✓)**
- **Validation:**
  - `Module 1: Basics of Computing & Number Representation` generated as chapter.
  - Topics: `History and generations of computers`, `Classification of computers`, `Computer architecture`.
  - Colon-separated sub-concepts under `Computer architecture` (`CPU`, `Memory`, `I/O devices`) cleanly nested as subtopics.

### Test 4: Numbered Subtopics and Concept Extraction (1.01 Laser)
- **Input:** `1.01 Laser (6L): Concepts of various emission and absorption processes, Einstein A and B coefficients...`
- **Result: PASSED (✓)**
- **Validation:**
  - Lecture hour tag `(6L)` stripped from topic name.
  - Child subtopics created for `emission and absorption processes`, `Einstein A and B coefficients`, and `population inversion`.

### Test 5: Laboratory / Practical Course Handling
- **Input:** Laboratory syllabus with `List of Experiments:` numbered 1 through 8.
- **Result: PASSED (✓)**
- **Validation:**
  - Flagged as `isLab: true`.
  - Exactly 8 experiment items extracted as actionable checklist topics.

### Test 6: Single-Course Document Parsing
- **Input:** Standard single-course syllabus document without boundary markers.
- **Result: PASSED (✓)**
- **Validation:** Extracted single course without false course splits.

### Test 7: Alternative Academic Terminology (Unit I, Chapter, Section)
- **Input:** Syllabus using `Unit I: Set Theory`, `1.1 Sets`, `1.1.1 Operations`.
- **Result: PASSED (✓)**
- **Validation:** Units recognized as chapters; numbered items nested as topics and subtopics.

### Test 8: Bullet-Only Syllabus Formats
- **Input:** Unnumbered bulleted course syllabus.
- **Result: PASSED (✓)**
- **Validation:** Direct topics created under curriculum chapter without dropping content.

### Test 9: Paired Theory & Lab Disambiguation
- **Input:** `CS501: Advanced Database Systems` and `CS591: Advanced Database Systems Lab`.
- **Result: PASSED (✓)**
- **Validation:** Accurately split into theory course and lab course without collision.

### Test 10: Empty / Whitespace-Only Documents
- **Input:** Whitespace strings.
- **Result: PASSED (✓)**
- **Validation:** Graceful fallback to default syllabus container without runtime errors.

