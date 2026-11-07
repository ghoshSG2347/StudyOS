/**
 * Regression tests for the academic syllabus parser.
 *
 * Run from project root:
 *   npx --prefix Backend vitest run src/lib/syllabus-parser/__tests__/parser.test.ts
 *
 * This file has NO external test-runner imports — it uses the Backend vitest
 * which is already installed as a devDependency.
 */

import { describe, it, expect } from 'vitest';

// ── Import from source files directly (avoid barrel re-exports) ───────────────
import { normalizeRawText } from '../normalizer';
import { detectCourses } from '../courseDetector';
import { buildCourseHierarchy, validateTree } from '../hierarchyBuilder';
import { parseAcademicSyllabus } from '../index';
import type { ParsedStudyNode } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function allNodeNames(nodes: ParsedStudyNode[]): string[] {
  const names: string[] = [];
  function walk(items: ParsedStudyNode[]) {
    for (const n of items) {
      names.push(n.name);
      walk(n.children);
    }
  }
  walk(nodes);
  return names;
}

function containsAny(names: string[], patterns: RegExp[]): string[] {
  return names.filter((n) => patterns.some((p) => p.test(n)));
}

// ─── Shared fixture text ──────────────────────────────────────────────────────

/** Minimal but representative HU191 block — the critical regression case. */
const HU191_BLOCK = `
Communication and Presentation Skill
Course Code: HU191
Contact Hours (L:T:P): 0:0:3
Total Contact Hours: 36
Credits: 1.5

Course Content
Module 1: Introduction Theories of Communication and Soft Skills
benefits and application
b. Introduction to Workplace Communication (Principles and Practice)
c. Non-Verbal communication and its application

Module 2: Active Listening
What is Active Listening? Its significance
Listening barriers
Clarifying
Inferencing
Evaluating
Note-taking

Module 3: Speaking Skills
Differences between reading and speaking skill
c. Differences between hearing and listening

Module 4: Writing and Reading Comprehension
Writing skills - Introduction
Reading comprehension techniques

Module 5: Presentation Skills
Elements of effective presentation
Practice with feedback

Text Books:
1. J. Dan Rothman, "Presentation Skills", Cengage Learning, 2nd Edition, 2015.
2. Raman Sharma, "Technical Communication", Oxford University Press, 2nd Edition, 2016.
3. Lesikar and Petit, "Business Communication", Tata McGraw-Hill, 10th Edition, 2007.
4. Madhukar Gogate, "Effective Presentation Skills", Nirali Prakashan, 2010.
5. Sethi & King, "Organisational Behaviour", Tata McGraw-Hill, 2010.

Reference Books:
1. R. L. Birdwhistell, "Introduction to Kinesics", University of Louisville Press, 1952.
2. E. Hall, "The Silent Language", Doubleday, New York, 1959.
3. L. P. Hartley, "The Go Between", Heinemann, London, 1953.
4. R. Quirk, "The Use of English", Longman, London, 1962.
5. S. P. Dhir, "Communication in Business", Jaico Publication, 2000.
6. T. Bhardwaj & M. Bhardwaj, "Communicative Skills", Regal Publ., 2004.
7. G. Desai, "Organisational Behaviour", Himalaya Publishing House, 2003.
8. Lesikar and Petit, "Business Communication", Tata McGraw-Hill, 10th Edition, 2007.
`.trim();

const CS101_BLOCK = `
Introduction to Programming and Problem Solving
Course Code: CS101
Credits: 3
Contact Hours (L:T:P): 3:0:0
Total Contact Hours: 36

Course Content
Module 1: Basics of Computing & Number Representation
History and generations of computers
Classification: Digital, Analog, Hybrid
Computer architecture: Input/Output units, Memory, CPU

Module 2: Programming Fundamentals
Algorithm, flowchart, and pseudocode
Variables, Data Types, Operators

Module 3: Control Structures
if-else, switch-case
Loops: for, while, do-while

Text Books:
1. Balagurusamy, "Programming in C", Tata McGraw-Hill, 8th Ed., 2019.
2. Brian Kernighan and Dennis Ritchie, "The C Programming Language", Prentice Hall, 2nd Edition.

Reference Books:
1. Herbert Schildt, "C: The Complete Reference", McGraw-Hill, 2000.
`.trim();

// ─── Stage 1: Normalizer tests ────────────────────────────────────────────────

describe('Stage 1 — Normalizer', () => {
  it('removes page numbers', () => {
    const input = 'Module 1: Basics\nPage 3 of 10\nHistory of computers';
    const result = normalizeRawText(input);
    expect(result).not.toMatch(/page\s+\d+\s+of\s+\d+/i);
    expect(result).toContain('Module 1: Basics');
    expect(result).toContain('History of computers');
  });

  it('joins wrapped continuation lines', () => {
    const input = 'Einstein A and B coefficients and\nequations';
    const result = normalizeRawText(input);
    expect(result.trim()).toBe('Einstein A and B coefficients and equations');
  });

  it('joins semiconductor laser split across lines', () => {
    const input = 'Semiconductor\nlaser';
    const result = normalizeRawText(input);
    expect(result.trim()).toBe('Semiconductor laser');
  });

  it('does NOT join module headings onto previous line', () => {
    const input = 'Introduction\nModule 1: Basics of Computing';
    const result = normalizeRawText(input);
    expect(result).toContain('Module 1: Basics of Computing');
    // "Introduction" should remain on its own line
    const lines = result.split('\n').map(l => l.trim()).filter(Boolean);
    expect(lines[0]).toBe('Introduction');
    expect(lines[1]).toBe('Module 1: Basics of Computing');
  });

  it('does NOT join numbered topic onto previous line', () => {
    const input = 'Some context\n1.01 Laser properties';
    const result = normalizeRawText(input);
    const lines = result.split('\n').map(l => l.trim()).filter(Boolean);
    expect(lines.some(l => l.startsWith('1.01 Laser'))).toBe(true);
  });

  it('removes repeated university headers (3+ occurrences)', () => {
    const repeatedHeader = 'R25 (B. Tech CSE) Curriculum';
    const input = Array(4).fill(repeatedHeader).join('\n') + '\nModule 1: Topic';
    const result = normalizeRawText(input);
    // Header should be stripped (frequency-based)
    const occurrences = (result.match(/R25 \(B\. Tech CSE\)/g) || []).length;
    expect(occurrences).toBe(0);
  });
});

// ─── Stage 2: Course detector — section-state machine ────────────────────────

describe('Stage 2 — Course Detector: section state machine', () => {
  it('separates content from textbooks for HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses.length).toBe(1);
    const course = courses[0];

    // treeLines must contain modules
    const treeText = course.treeLines.join('\n');
    expect(treeText).toMatch(/Module 1/i);
    expect(treeText).toMatch(/Module 5/i);

    // treeLines must NOT contain textbook entries
    expect(treeText).not.toMatch(/Rothman/);
    expect(treeText).not.toMatch(/Cengage/);
    expect(treeText).not.toMatch(/Raman Sharma/);
    expect(treeText).not.toMatch(/Oxford University Press/);
  });

  it('places textbooks in metadata for HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    const meta = courses[0].metadata;
    expect(meta.textbooks).toBeDefined();
    expect(meta.textbooks!.length).toBe(5);
    expect(meta.referenceBooks).toBeDefined();
    expect(meta.referenceBooks!.length).toBe(8);
  });

  it('places textbooks in metadata for CS101', () => {
    const courses = detectCourses(CS101_BLOCK, 'CS101');
    const meta = courses[0].metadata;
    expect(meta.textbooks).toBeDefined();
    expect(meta.textbooks!.length).toBe(2);
    expect(meta.referenceBooks!.length).toBe(1);
  });

  it('extracts credits and contact hours', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    const meta = courses[0].metadata;
    expect(meta.credits).toBe('1.5');
    expect(meta.totalContactHours).toBe('36');
  });

  it('detects course code from explicit "Course Code:" line', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses[0].code).toBe('HU191');
  });

  it('does NOT classify HU191 as a lab course', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses[0].isLab).toBe(false);
  });

  it('classifies CS191 as a lab course', () => {
    const block = 'Introduction to Programming and Problem Solving Lab\nCourse Code: CS191\nCourse Content\nExp 1: Hello World program\n';
    const courses = detectCourses(block);
    expect(courses[0].isLab).toBe(true);
  });
});

// ─── Stage 3: Hierarchy builder ──────────────────────────────────────────────

describe('Stage 3 — Hierarchy Builder', () => {
  it('creates 5 chapter nodes for HU191 modules', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    expect(tree.length).toBe(5);
    expect(tree[0].name).toMatch(/Module 1/i);
    expect(tree[4].name).toMatch(/Module 5/i);
  });

  it('no textbook/reference entry appears in HU191 tree node names', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    const names = allNodeNames(tree);

    const forbidden = containsAny(names, [
      /Rothman/i,
      /Cengage/i,
      /Oxford University Press/i,
      /Tata McGraw/i,
      /Raman Sharma/i,
      /Lesikar/i,
      /Sethi.*King/i,
      /Birdwhistell/i,
      /Kinesics/i,
      /Doubleday/i,
      /Heinemann/i,
      /Longman/i,
      /\b19[0-9]{2}\b/,  // publication years
      /\b20[0-9]{2}\b/,  // publication years
    ]);

    expect(forbidden).toEqual([]);
  });

  it('creates 3 chapter nodes for CS101 modules', () => {
    const courses = detectCourses(CS101_BLOCK, 'CS101');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    expect(tree.length).toBe(3);
  });

  it('no textbook/reference entry in CS101 tree', () => {
    const courses = detectCourses(CS101_BLOCK, 'CS101');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    const names = allNodeNames(tree);
    const forbidden = containsAny(names, [/Balagurusamy/i, /Kernighan/i, /Schildt/i, /McGraw/i]);
    expect(forbidden).toEqual([]);
  });

  it('lab course: numbered items become topics under existing chapter', () => {
    const labLines = [
      'Module 1: Classical Physics Experiments',
      '1. Verification of Ohm\'s Law',
      '2. Measurement of Refractive Index',
      '3. Study of RC Circuit',
    ];
    const tree = buildCourseHierarchy(labLines, true);
    expect(tree.length).toBe(1);
    expect(tree[0].children.length).toBe(3);
  });

  it('does not create empty nodes or Course Curriculum fallback for content-rich input', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    const names = allNodeNames(tree);
    expect(names).not.toContain('Course Curriculum');
    expect(names).not.toContain('Core Concepts');
  });
});

// ─── Stage 4: Validation pass ────────────────────────────────────────────────

describe('Stage 4 — Validation Pass', () => {
  it('removes bibliography entries that slipped through', () => {
    const fakeNodes: ParsedStudyNode[] = [
      {
        id: '1', name: 'Valid Topic', type: 'topic', completed: false,
        children: [
          { id: '2', name: 'J. Dan Rothman, "Presentation Skills", Cengage, 2015', type: 'subtopic', completed: false, children: [] },
        ],
      },
    ];
    const { tree, flagged } = validateTree(fakeNodes);
    expect(flagged.length).toBe(1);
    expect(tree[0].children.length).toBe(0);
  });

  it('removes lines containing publication years from bibliography context', () => {
    const fakeNodes: ParsedStudyNode[] = [
      {
        id: '1', name: 'Author Name, "Book Title", Wiley, 2018', type: 'topic',
        completed: false, children: [],
      },
    ];
    const { tree, flagged } = validateTree(fakeNodes);
    expect(flagged.length).toBe(1);
    expect(tree.length).toBe(0);
  });

  it('keeps valid academic topic names', () => {
    const fakeNodes: ParsedStudyNode[] = [
      { id: '1', name: 'Newton\'s Laws of Motion', type: 'topic', completed: false, children: [] },
      { id: '2', name: 'Semiconductor laser', type: 'topic', completed: false, children: [] },
    ];
    const { tree, flagged } = validateTree(fakeNodes);
    expect(flagged.length).toBe(0);
    expect(tree.length).toBe(2);
  });
});

// ─── Stage 5: Full pipeline (parseAcademicSyllabus) ─────────────────────────

describe('Stage 5 — Full Pipeline', () => {
  it('HU191: 5 modules in tree, no bibliography in tree', () => {
    const result = parseAcademicSyllabus(HU191_BLOCK, 'HU191');
    expect(result.courses.length).toBe(1);
    const course = result.courses[0];

    expect(course.tree.length).toBe(5);

    const names = allNodeNames(course.tree);
    const forbidden = containsAny(names, [
      /Rothman/i, /Cengage/i, /Oxford/i, /Tata McGraw/i, /Raman Sharma/i,
      /Lesikar/i, /Birdwhistell/i, /Kinesics/i, /Doubleday/i,
    ]);
    expect(forbidden).toEqual([]);
  });

  it('HU191: textbooks & references remain in metadata', () => {
    const result = parseAcademicSyllabus(HU191_BLOCK, 'HU191');
    const meta = result.courses[0].metadata;
    expect(meta.textbooks!.length).toBe(5);
    expect(meta.referenceBooks!.length).toBe(8);
  });

  it('HU191: code is HU191, not a lab', () => {
    const result = parseAcademicSyllabus(HU191_BLOCK, 'HU191');
    const course = result.courses[0];
    expect(course.code).toBe('HU191');
    expect(course.isLab).toBe(false);
  });

  it('CS101: 3 modules in tree, no Balagurusamy in tree', () => {
    const result = parseAcademicSyllabus(CS101_BLOCK, 'CS101');
    const names = allNodeNames(result.courses[0].tree);
    expect(result.courses[0].tree.length).toBe(3);
    expect(containsAny(names, [/Balagurusamy/i, /Kernighan/i])).toEqual([]);
  });

  it('Multi-course document detects two courses', () => {
    const combined = HU191_BLOCK + '\n\n' + CS101_BLOCK;
    const result = parseAcademicSyllabus(combined, 'R25 Syllabus');
    expect(result.courses.length).toBe(2);
  });

  it('tree contains no CO-PO mapping content', () => {
    const textWithCOPO = HU191_BLOCK + '\nCO-PO Mapping\nCO1-PO1: 2\nCO2-PO2: 3\n';
    const result = parseAcademicSyllabus(textWithCOPO, 'HU191');
    const names = allNodeNames(result.courses[0].tree);
    expect(containsAny(names, [/CO\d+-PO/i, /CO-PO/i])).toEqual([]);
  });
});

// ─── Stage 6: isLaboratoryCourse isolation ────────────────────────────────────

describe('Stage 6 — isLaboratoryCourse', () => {
  it.each([
    ['Introduction to Programming and Problem Solving Lab', 'CS191', true],
    ['Engineering Physics Lab', 'PH191', true],
    ['Engineering Graphics & Computer Aided Design Lab', 'ME194', true],
    ['Communication and Presentation Skill', 'HU191', false],
    ['Indian Knowledge System', 'HU102', false],
    ['Environmental Science', 'HU101', false],
    ['Engineering Mathematics-I', 'M101', false],
    ['Introduction to Programming and Problem Solving', 'CS101', false],
    ['Engineering Physics', 'PH101', false],
  ])('%s (%s) → isLab=%s', async (name, code, expected) => {
    const { isLaboratoryCourse } = await import('../classifier');
    expect(isLaboratoryCourse(name, code)).toBe(expected);
  });
});
