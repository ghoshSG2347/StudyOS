import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import { parseAcademicSyllabus } from '../convex/lib/syllabusParser/index';

describe('JEE Main PDF extracted text parsing', () => {
  it('parses JEE Main syllabus into separate subjects without mixing', () => {
    const text = fs.readFileSync('tests/jee_main_extracted.txt', 'utf8');
    const result = parseAcademicSyllabus(text, 'JEE MAIN');

    const courseNames = result.courses.map((c) => c.name);
    expect(courseNames).toContain('Mathematics');
    expect(courseNames).toContain('Physics');
    expect(courseNames).toContain('Chemistry');

    // Chemistry must NOT contain Mathematics or Paper 2A items
    const chemCourse = result.courses.find((c) => c.name === 'Chemistry')!;
    expect(chemCourse).toBeDefined();

    const allChemNodes = (nodes: any[]): any[] =>
      nodes.flatMap((n) => [n, ...allChemNodes(n.children || [])]);
    const chemNodeNames = allChemNodes(chemCourse.tree).map((n) => n.name);

    expect(chemNodeNames.some((n) => /Paper\s+2[ab]/i.test(n))).toBe(false);
    expect(chemNodeNames.some((n) => /sets,\s*relations/i.test(n))).toBe(false);
  });
});
