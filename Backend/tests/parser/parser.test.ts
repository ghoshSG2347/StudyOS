/**
 * Regression tests for the academic syllabus parser (all stages).
 * Run via: npm --prefix Backend test
 */

import { describe, it, expect } from 'vitest';
import { normalizeRawText } from './normalizer';
import { detectCourses } from './courseDetector';
import { buildCourseHierarchy, validateTree } from './hierarchyBuilder';
import type { ParsedStudyNode } from './types';
import { isLaboratoryCourse } from './classifier';

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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

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

// ─── Stage 1: Normalizer ──────────────────────────────────────────────────────

describe('Stage 1 — Normalizer', () => {
  it('removes page numbers', () => {
    const input = 'Module 1: Basics\nPage 3 of 10\nHistory of computers';
    const result = normalizeRawText(input);
    expect(result).not.toMatch(/page\s+\d+\s+of\s+\d+/i);
    expect(result).toContain('Module 1');
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

  it('does NOT join Module heading onto previous line', () => {
    const input = 'Introduction\nModule 1: Basics of Computing';
    const result = normalizeRawText(input);
    const lines = result.split('\n').map(l => l.trim()).filter(Boolean);
    expect(lines[0]).toBe('Introduction');
    expect(lines.some(l => l.startsWith('Module 1'))).toBe(true);
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
    const occurrences = (result.match(/R25/g) || []).length;
    expect(occurrences).toBe(0);
  });
});

// ─── Stage 2: Course Detector ─────────────────────────────────────────────────

describe('Stage 2 — Course Detector: section state machine', () => {
  it('treeLines contains HU191 modules', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses.length).toBe(1);
    const treeText = courses[0].treeLines.join('\n');
    expect(treeText).toMatch(/Module 1/i);
    expect(treeText).toMatch(/Module 5/i);
  });

  it('treeLines does NOT contain textbook entries for HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    const treeText = courses[0].treeLines.join('\n');
    expect(treeText).not.toMatch(/Rothman/);
    expect(treeText).not.toMatch(/Cengage/);
    expect(treeText).not.toMatch(/Raman Sharma/);
    expect(treeText).not.toMatch(/Oxford University Press/);
    expect(treeText).not.toMatch(/Birdwhistell/);
  });

  it('places 5 textbooks in metadata for HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses[0].metadata.textbooks?.length).toBe(5);
  });

  it('places 8 reference books in metadata for HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses[0].metadata.referenceBooks?.length).toBe(8);
  });

  it('extracts credits = 1.5 for HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses[0].metadata.credits).toBe('1.5');
  });

  it('extracts totalContactHours = 36 for HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses[0].metadata.totalContactHours).toBe('36');
  });

  it('detects course code HU191', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    expect(courses[0].code).toBe('HU191');
  });

  it('treeLines does NOT contain bibliography entries for CS101', () => {
    const courses = detectCourses(CS101_BLOCK, 'CS101');
    const treeText = courses[0].treeLines.join('\n');
    expect(treeText).not.toMatch(/Balagurusamy/);
    expect(treeText).not.toMatch(/Kernighan/);
    expect(treeText).not.toMatch(/Schildt/);
  });

  it('places 2 textbooks in metadata for CS101', () => {
    const courses = detectCourses(CS101_BLOCK, 'CS101');
    expect(courses[0].metadata.textbooks?.length).toBe(2);
  });
});

// ─── Stage 3: Hierarchy Builder ───────────────────────────────────────────────

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
      /Rothman/i, /Cengage/i, /Oxford/i, /Tata McGraw/i, /Raman Sharma/i,
      /Lesikar/i, /Birdwhistell/i, /Kinesics/i, /Doubleday/i, /Heinemann/i,
      /Nirali/i, /Himalaya/i, /Jaico/i,
    ]);
    expect(forbidden).toEqual([]);
  });

  it('creates 3 chapter nodes for CS101', () => {
    const courses = detectCourses(CS101_BLOCK, 'CS101');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    expect(tree.length).toBe(3);
  });

  it('no textbook/reference in CS101 tree', () => {
    const courses = detectCourses(CS101_BLOCK, 'CS101');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    const names = allNodeNames(tree);
    expect(containsAny(names, [/Balagurusamy/i, /Kernighan/i, /Schildt/i])).toEqual([]);
  });

  it('lab course: numbered items become topics', () => {
    const labLines = [
      'Module 1: Classical Physics Experiments',
      "1. Verification of Ohm's Law",
      '2. Measurement of Refractive Index',
      '3. Study of RC Circuit',
    ];
    const tree = buildCourseHierarchy(labLines, true);
    expect(tree.length).toBe(1);
    expect(tree[0].children.length).toBe(3);
  });

  it('no synthetic fallback nodes for content-rich input', () => {
    const courses = detectCourses(HU191_BLOCK, 'HU191');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);
    const names = allNodeNames(tree);
    expect(names).not.toContain('Course Curriculum');
    expect(names).not.toContain('Core Concepts');
  });
});

// ─── Stage 4: Validation Pass ────────────────────────────────────────────────

describe('Stage 4 — Validation Pass', () => {
  it('removes bibliography entries that slipped through', () => {
    const fakeNodes: ParsedStudyNode[] = [
      {
        id: '1', name: 'Valid Topic', type: 'topic', completed: false,
        children: [
          {
            id: '2',
            name: 'J. Dan Rothman, "Presentation Skills", Cengage, 2015',
            type: 'subtopic', completed: false, children: [],
          },
        ],
      },
    ];
    const { tree, flagged } = validateTree(fakeNodes);
    expect(flagged.length).toBe(1);
    expect(tree[0].children.length).toBe(0);
  });

  it('keeps valid academic topic names', () => {
    const fakeNodes: ParsedStudyNode[] = [
      { id: '1', name: "Newton's Laws of Motion", type: 'topic', completed: false, children: [] },
      { id: '2', name: 'Semiconductor laser', type: 'topic', completed: false, children: [] },
    ];
    const { tree, flagged } = validateTree(fakeNodes);
    expect(flagged.length).toBe(0);
    expect(tree.length).toBe(2);
  });
});

// ─── Stage 5: isLaboratoryCourse ─────────────────────────────────────────────

describe('Stage 5 — isLaboratoryCourse', () => {
  const cases: [string, string, boolean][] = [
    ['Introduction to Programming and Problem Solving Lab', 'CS191', true],
    ['Engineering Physics Lab', 'PH191', true],
    ['Engineering Graphics & Computer Aided Design Lab', 'ME194', true],
    ['Communication and Presentation Skill', 'HU191', false],
    ['Indian Knowledge System', 'HU102', false],
    ['Environmental Science', 'HU101', false],
    ['Engineering Mathematics-I', 'M101', false],
    ['Introduction to Programming and Problem Solving', 'CS101', false],
    ['Engineering Physics', 'PH101', false],
  ];

  for (const [name, code, expected] of cases) {
    it(`${name} (${code}) → isLab=${expected}`, () => {
      expect(isLaboratoryCourse(name, code)).toBe(expected);
    });
  }
});

// ─── Stage 6: Critical HU191 end-to-end (simulates full pipeline) ─────────────

describe('Stage 6 — HU191 End-to-End Critical Regression', () => {
  it('5 modules in tree, zero bibliography entries in tree', () => {
    // Simulate full pipeline: normalizer → detectCourses → buildHierarchy → validate
    const normalized = normalizeRawText(HU191_BLOCK);
    const courses = detectCourses(normalized, 'HU191');
    const rawTree = buildCourseHierarchy(courses[0].treeLines, courses[0].isLab);
    const { tree, flagged } = validateTree(rawTree);

    // 5 modules
    expect(tree.length).toBe(5);

    // Zero bibliography in tree
    const names = allNodeNames(tree);
    const forbidden = containsAny(names, [
      /Rothman/i, /Raman Sharma/i, /Lesikar/i, /Madhukar/i, /Sethi/i,
      /Birdwhistell/i, /Kinesics/i, /Hall.*Silent/i, /Hartley/i, /Quirk/i,
      /Dhir/i, /Bhardwaj/i, /Desai.*Organisational/i,
      /Cengage/i, /Oxford University/i, /McGraw/i, /Nirali/i, /Himalaya/i,
      /\b195\d\b/, /\b196\d\b/, /\b200\d\b/, /\b201\d\b/,
    ]);
    expect(forbidden).toEqual([]);

    // 5 textbooks in metadata, 8 references in metadata
    expect(courses[0].metadata.textbooks?.length).toBe(5);
    expect(courses[0].metadata.referenceBooks?.length).toBe(8);

    // isLab = false
    expect(courses[0].isLab).toBe(false);
  });

  it('Module names are correct', () => {
    const normalized = normalizeRawText(HU191_BLOCK);
    const courses = detectCourses(normalized, 'HU191');
    const tree = buildCourseHierarchy(courses[0].treeLines, false);

    expect(tree[0].name).toMatch(/Introduction Theories of Communication/i);
    expect(tree[1].name).toMatch(/Active Listening/i);
    expect(tree[2].name).toMatch(/Speaking Skills/i);
    expect(tree[3].name).toMatch(/Writing and Reading Comprehension/i);
    expect(tree[4].name).toMatch(/Presentation Skills/i);
  });
});

