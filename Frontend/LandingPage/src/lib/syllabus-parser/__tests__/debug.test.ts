import { describe, it, expect } from 'vitest';

describe('import test', () => {
  it('imports normalizer', async () => {
    const { normalizeRawText } = await import('../normalizer');
    expect(typeof normalizeRawText).toBe('function');
  });
  it('imports detectCourses', async () => {
    const { detectCourses } = await import('../courseDetector');
    expect(typeof detectCourses).toBe('function');
  });
  it('imports buildCourseHierarchy', async () => {
    const { buildCourseHierarchy } = await import('../hierarchyBuilder');
    expect(typeof buildCourseHierarchy).toBe('function');
  });
  it('imports parseAcademicSyllabus from index', async () => {
    const { parseAcademicSyllabus } = await import('../index');
    expect(typeof parseAcademicSyllabus).toBe('function');
  });
});
