import type { ContentClassification, SectionKind } from './types';

/**
 * Course Code Pattern — matches CS101, PH101, M101, HU191, ME194, PCC-CS101, etc.
 */
export const COURSE_CODE_REGEX = /\b([A-Z]{1,4}[- ]?(?:[A-Z]{2,4}[- ]?)?\d{3}[A-Z]?)\b/i;

/**
 * Strips lecture-hour markers like "(7L)", "[3L]", "(10 hours)"
 */
export function cleanLectureHours(text: string): string {
  return text
    .replace(/\s*[\(\[]\s*\d+\s*(?:L|hrs?|hours?|lectures?|periods?)\s*[\)\]]/gi, '')
    .trim();
}

// ─── Section boundary detection ───────────────────────────────────────────────

export const TEXTBOOK_HEADINGS = [
  /^(?:recommended\s+)?text\s*books?\s*[:=]?\s*$/i,
  /^books?\s+recommended\s*[:=]?\s*$/i,
  /^text\s*books?\s*[:=]/i,
];

export const REFERENCE_HEADINGS = [
  /^(?:recommended\s+)?reference\s*books?\s*[:=]?\s*$/i,
  /^references?\s*[:=]?\s*$/i,
  /^suggested\s+readings?\s*[:=]?\s*$/i,
  /^reference\s*books?\s*[:=]/i,
  /^suggested\s+readings?\s*[:=]/i,
];

export const OBJECTIVE_HEADINGS = [
  /^(?:course\s+)?objectives?\s*[:=]?\s*$/i,
  /^course\s+description\s*[:=]?\s*$/i,
];

export const OUTCOME_HEADINGS = [
  /^(?:course\s+)?outcomes?\s*[:=]?\s*$/i,
  /^co\s*[-–]\s*po(?:\s*[-–]\s*pso)?\s*(?:mapping)?\s*[:=]?\s*$/i,
  /^po\s+mapping\s*[:=]?\s*$/i,
  /^pso\s+mapping\s*[:=]?\s*$/i,
  /^weightage\s+values?\s*[:=]?\s*$/i,
];

export const CONTENT_HEADINGS = [
  /^(?:course\s+)?contents?\s*(?:\(lab\))?\s*[:=]?\s*$/i,
  /^course\s+structure\s*[:=]?\s*$/i,
  /^self[- ]learning\s+topics?\s*[:=]?\s*$/i,
  /^topics?\s*[:=]?\s*$/i,
  /^(?:list\s+of\s+)?(?:experiments?|lab\s+experiments?|practical\s+syllabus|practical\s+assignments?)\s*[:=]?\s*$/i,
  /^(?:lab|practical)\s*(?:experiments?|work|assignments?)?\s*[:=]?\s*$/i,
];

/**
 * Classify a single line in the context of section-state detection.
 * Returns the section kind this line *transitions into*, or null.
 */
export function detectSectionTransition(trimmed: string): SectionKind | null {
  if (!trimmed) return null;

  if (REFERENCE_HEADINGS.some((p) => p.test(trimmed))) return 'reference';
  if (TEXTBOOK_HEADINGS.some((p) => p.test(trimmed))) return 'textbook';
  if (OBJECTIVE_HEADINGS.some((p) => p.test(trimmed))) return 'objective';
  if (OUTCOME_HEADINGS.some((p) => p.test(trimmed))) return 'outcome';
  if (CONTENT_HEADINGS.some((p) => p.test(trimmed))) return 'content';

  return null;
}

// ─── Line classification (for hierarchy builder) ──────────────────────────────

/**
 * Classify a line within a known content section.
 */
export function classifyLine(line: string): ContentClassification {
  const trimmed = line.trim();
  if (!trimmed) return 'noise';

  // 1. Course header indicators
  if (
    /^(?:course\s+(?:name|title|code)|subject\s+(?:name|title|code))\s*[:=]/i.test(trimmed) ||
    /^(?:paper\s+(?:name|title|code))\s*[:=]/i.test(trimmed)
  ) {
    return 'course_header';
  }

  // Standalone course title with code (e.g. "Introduction to Programming — CS101")
  if (
    COURSE_CODE_REGEX.test(trimmed) &&
    /programming|physics|mathematics|chemistry|science|knowledge|engineering|graphics|communication|electronics|mechanics|english/i.test(
      trimmed
    ) &&
    !/prerequisite|textbook|reference|outcome|objective|module|unit|chapter/i.test(trimmed)
  ) {
    return 'course_header';
  }

  // 2. Metadata lines
  if (
    /^(?:contact\s+hours|lecture\s*[:(]|credits?|total\s+contact\s+hours|l\s*:\s*t\s*:\s*p|prerequisites?|pre-requisites?|course\s+coordinator|academic\s+year|semester\s*[:])/i.test(
      trimmed
    ) ||
    /^credits?\s*[:=]\s*\d+/i.test(trimmed) ||
    /^l\s*[-:]\s*\d+\s*,?\s*t\s*[-:]\s*\d+/i.test(trimmed)
  ) {
    return 'metadata';
  }

  // 3. Objectives
  if (/^(?:course\s+)?objectives?\s*[:=]?\s*$/i.test(trimmed)) {
    return 'objective';
  }

  // 4. Outcomes & CO-PO
  if (
    /^(?:course\s+)?outcomes?\s*[:=]?\s*$/i.test(trimmed) ||
    /^co\s*\d+\s*[:.-]/i.test(trimmed) ||
    /^(?:co\s*[-–]\s*po|po\s*[-–]\s*pso|mapping\s+of\s+co)/i.test(trimmed)
  ) {
    return 'outcome';
  }

  // 5. Bibliography headings
  if (
    /^(?:text\s*books?|reference\s*books?|books?\s+recommended|recommended\s+books?|references?|suggested\s+readings?)\s*[:=]?/i.test(
      trimmed
    )
  ) {
    return 'reference';
  }

  // 6. Experiments / lab
  if (
    /^(?:list\s+of\s+)?(?:experiments?|lab\s+experiments?|practical\s+syllabus|practical\s+assignments?)\s*[:=]?/i.test(
      trimmed
    ) ||
    /^(?:exp(?:eriment)?\.?\s*\d+|lab\s*\d+)\s*[:.-]/i.test(trimmed)
  ) {
    return 'experiment';
  }

  // 7. Module / Unit / Chapter headings
  if (
    /(?:^|\b)(?:module|unit|chapter|part|section)\s*(?:[-–:]|\d+|[IVXLCDM]+)\s*[:.-]/i.test(trimmed) ||
    /\bmodule\s+\d+/i.test(trimmed) ||
    /\bunit\s*(?:\d+|[IVXLCDM]+)/i.test(trimmed) ||
    /\bchapter\s+\d+/i.test(trimmed) ||
    /^#{1,2}\s+(?:module|unit|chapter)/i.test(trimmed)
  ) {
    return 'module_chapter';
  }

  // 8. Numbered topic (e.g. "1.01 Laser", "2.1 Newton's Rings")
  if (/^\d+\.\d{1,3}\s+[A-Za-z]/i.test(trimmed) || /^#{2,3}\s+/.test(trimmed)) {
    return 'topic';
  }

  // 9. Bullet / numbered list items
  if (/^[-*+•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed) || /^[a-z]\)\s+/i.test(trimmed)) {
    return 'subtopic';
  }

  return 'unclassified';
}

/**
 * Checks whether a course title represents a laboratory / practical course.
 * Fixed: HU191 must NOT be classified as lab (it's a humanities theory/sessional course).
 */
export function isLaboratoryCourse(name: string, code?: string): boolean {
  const nameLower = name.toLowerCase();
  const codeLower = (code || '').toLowerCase();

  // Explicit lab/practical keywords in name
  if (
    nameLower.includes('lab') ||
    nameLower.includes('laboratory') ||
    nameLower.includes('practical') ||
    nameLower.includes('workshop')
  ) {
    return true;
  }

  // Code-based detection: CS191, PH191, ME194 — but NOT HU191, HU101, HU102
  // Rule: code ending in 19x where the prefix is a STEM subject code
  if (/^(?:cs|ph|me|ec|ee|ce|ch|bt|it|cy|mt)\d*19\d/i.test(codeLower)) {
    return true;
  }

  // ME194 special case
  if (/me19\d/i.test(codeLower)) return true;

  return false;
}
