import type { AcademicMetadata, SectionKind } from './types';
import {
  COURSE_CODE_REGEX,
  cleanLectureHours,
  isLaboratoryCourse,
  detectSectionTransition,
  classifyLine,
} from './classifier';

export interface RawCourseBlock {
  name: string;
  code?: string;
  isLab: boolean;
  metadata: AcademicMetadata;
  /** Lines that belong to the study tree (content sections only). */
  treeLines: string[];
  /** All block lines (kept for reference / debugging). */
  allLines: string[];
}

// ─── Metadata extraction ──────────────────────────────────────────────────────

/**
 * Extracts structured metadata and bibliography from lines of a course block.
 * Uses an explicit section-state machine so that bibliography entries
 * are never confused with content.
 *
 * Also returns `treeLines`: the subset of lines that belong to the content
 * sections only (modules, units, chapters, experiments, topics).
 */
export function extractCourseMetadataAndTreeLines(
  allLines: string[],
  isLab = false
): { metadata: AcademicMetadata; treeLines: string[] } {
  const meta: AcademicMetadata = {};
  const objectives: string[] = [];
  const outcomes: string[] = [];
  const textbooks: string[] = [];
  const references: string[] = [];
  const treeLines: string[] = [];

  const peekNextNonEmpty = (lines: string[], start: number): string | null => {
    for (let j = start + 1; j < lines.length; j++) {
      if (lines[j].trim()) return lines[j].trim();
    }
    return null;
  };

  // State machine sections:
  // preamble  → before any content heading (collect metadata key/values)
  // content   → inside course-content / module sections → lines go to treeLines
  // objective → inside objectives section → lines go to objectives[]
  // outcome   → inside outcomes section → lines go to outcomes[]
  // textbook  → inside textbook section → lines go to textbooks[] (NEVER tree)
  // reference → inside reference section → lines go to references[] (NEVER tree)
  // other_meta → anything else non-tree

  let section: SectionKind = 'preamble';

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // ── Detect section transitions ────────────────────────────────────────
    const transition = detectSectionTransition(trimmed);
    if (transition !== null) {
      // Critical stopping rule: once in terminal bibliography, cannot re-enter content or objectives
      if (section === 'textbook' || section === 'reference') {
        if (transition === 'textbook' || transition === 'reference') {
          section = transition;
        }
        // ignore other transitions if we already hit terminal metadata
      } else {
        section = transition;
        if (transition === 'content') {
          // If the heading is e.g. "List of Experiments:", include it in treeLines
          // so hierarchyBuilder can use it as a chapter node if needed.
          if (/experiments?|lab|practical/i.test(trimmed)) {
            treeLines.push(line);
          }
        }
      }
      continue;
    }

    // ── Module / Unit headings re-enter content section ───────────────────
    if (
      /^(?:module|unit|chapter|part|section)\s*[-–—:]?\s*\d/i.test(trimmed) ||
      /^(?:module|unit|chapter|part|section)\s+[IVX]/i.test(trimmed) ||
      /^(?:physical|inorganic|organic)\s+chemistry$/i.test(trimmed)
    ) {
      // Only switch to content if we're not already past a terminal bibliography heading
      if (section !== 'textbook' && section !== 'reference') {
        section = 'content';
        treeLines.push(line);
      }
      continue;
    }

    // ── Metadata key-value lines (always extracted, never to tree) ────────
    const totalHoursMatch = trimmed.match(/^total\s+contact\s+hours\s*[:=]?\s*([0-9\sA-Za-z]+)/i);
    if (totalHoursMatch && !meta.totalContactHours) {
      meta.totalContactHours = totalHoursMatch[1].trim();
      continue;
    }

    const contactHoursMatch = trimmed.match(
      /^(?:contact\s+hours(?:\s*\(l:t:p\))?|l\s*:\s*t\s*:\s*p|lecture\s*[:(])\s*[:=]?\s*([0-9\s:,-]+)/i
    );
    if (contactHoursMatch && !meta.contactHours) {
      meta.contactHours = contactHoursMatch[1].trim();
      continue;
    }

    const codeMatch = trimmed.match(/(?:course\s+code|paper\s+code|code)\s*[:=]\s*([A-Za-z0-9\-]+)/i);
    if (codeMatch && !meta.code) {
      meta.code = codeMatch[1].trim().toUpperCase();
      if (section === 'preamble') continue;
    }

    const creditsMatch = trimmed.match(/^credits?\s*[:=]\s*([\d\.]+)/i);
    if (creditsMatch && !meta.credits) {
      meta.credits = creditsMatch[1].trim();
      continue;
    }

    const prereqMatch = trimmed.match(/^prerequisites?\s*[:=]\s*(.+)/i);
    if (prereqMatch && !meta.prerequisites) {
      meta.prerequisites = prereqMatch[1].trim();
      continue;
    }

    // ── Auto-transition from preamble to content on encountering study items ──
    if (section === 'preamble') {
      const cls = classifyLine(trimmed);
      const nextLine = peekNextNonEmpty(allLines, i);
      const isHeadingFollowedByItems =
        trimmed.length > 3 &&
        trimmed.length < 65 &&
        !/[.;,]$/.test(trimmed.replace(/:$/, '')) &&
        nextLine !== null &&
        (/^\d+[\.\)]\s+/.test(nextLine) || /^[-*+•]\s+/.test(nextLine));

      if (
        cls === 'module_chapter' ||
        cls === 'experiment' ||
        cls === 'topic' ||
        cls === 'subtopic' ||
        (isLab && /^\d+[\.\)]\s+/.test(trimmed)) ||
        isHeadingFollowedByItems
      ) {
        section = 'content';
        treeLines.push(line);
        continue;
      }
    }

    // ── Route line to the appropriate bucket ──────────────────────────────
    switch (section) {
      case 'content':
        treeLines.push(line);
        break;

      case 'objective': {
        const cleaned = trimmed.replace(/^\d+[\.\)]\s*/, '').trim();
        if (cleaned.length > 5) objectives.push(cleaned);
        break;
      }

      case 'outcome': {
        if (/^co\d+\s*[:.-]\s*/i.test(trimmed)) {
          outcomes.push(trimmed);
        } else if (trimmed.length > 10 && !/^at\s+the\s+end/i.test(trimmed)) {
          outcomes.push(trimmed);
        }
        break;
      }

      case 'textbook': {
        const cleaned = trimmed.replace(/^\d+[\.\)]\s*/, '').trim();
        if (cleaned.length > 5) textbooks.push(cleaned);
        break;
      }

      case 'reference': {
        const cleaned = trimmed.replace(/^\d+[\.\)]\s*/, '').trim();
        if (cleaned.length > 5) references.push(cleaned);
        break;
      }

      case 'preamble':
      case 'other_meta':
      default:
        // Drop — these are metadata/preamble lines not in a content section
        break;
    }
  }

  if (objectives.length > 0) meta.courseObjectives = objectives;
  if (outcomes.length > 0) meta.courseOutcomes = outcomes;
  if (textbooks.length > 0) meta.textbooks = textbooks;
  if (references.length > 0) meta.referenceBooks = references;

  return { metadata: meta, treeLines };
}

// ─── Course boundary detection ────────────────────────────────────────────────

/**
 * Detects multiple course boundaries in normalized text.
 * Returns one RawCourseBlock per detected course, each with its own
 * metadata and treeLines (content only — no bibliography).
 */
export function detectCourses(normalizedText: string, fallbackDocumentName?: string): RawCourseBlock[] {
  const lines = normalizedText.split('\n');

  interface CourseBoundary {
    lineIndex: number;
    name: string;
    code?: string;
  }

  const peekNextNonEmpty = (all: string[], start: number): string | null => {
    for (let j = start + 1; j < all.length; j++) {
      if (all[j].trim()) return all[j].trim();
    }
    return null;
  };

  const boundaries: CourseBoundary[] = [];
  let currentPaperPrefix = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Track active Paper header (e.g. Paper 2A (B.Arch.), Paper 2B (B.Planning))
    const paperMatch = line.match(/^syllabus\s+for\s+.*?(paper\s+2[ab])\s*\(([^)]+)\)/i);
    if (paperMatch) {
      currentPaperPrefix = `${paperMatch[2].trim()}: `;
      const nextNonEmpty = peekNextNonEmpty(lines, i);
      let courseName = `${paperMatch[2].trim()}: Course`;
      if (nextNonEmpty) {
        const nextPartMatch = nextNonEmpty.match(/^part\s*[-–—:]\s*([I|V|X\d]+)\s+([A-Za-z\s]+)$/i);
        if (nextPartMatch) {
          const partNum = nextPartMatch[1].toUpperCase();
          const partTitle = nextPartMatch[2].trim();
          courseName = `${paperMatch[2].trim()}: Part ${partNum} - ${partTitle.charAt(0).toUpperCase() + partTitle.slice(1).toLowerCase()}`;
        }
      }
      boundaries.push({
        lineIndex: i,
        name: courseName,
      });
      continue;
    } else if (/^syllabus\s+for\s+.*?paper\s+1/i.test(line)) {
      currentPaperPrefix = '';
    }

    // Pattern 1: Explicit "Course Name: ..."
    const explicitNameMatch = line.match(
      /^(?:course\s+(?:name|title)|subject\s+(?:name|title)|paper\s+(?:name|title))\s*[:=]\s*(.+)/i
    );
    if (explicitNameMatch) {
      const rawName = explicitNameMatch[1].trim();
      let code: string | undefined;
      const inlineCodeMatch = rawName.match(COURSE_CODE_REGEX);
      if (inlineCodeMatch) {
        code = inlineCodeMatch[1].toUpperCase();
      } else {
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextMatch = lines[j].match(
            /^(?:course\s+code|paper\s+code|code)\s*[:=]\s*([A-Za-z0-9\-]+)/i
          );
          if (nextMatch) {
            code = nextMatch[1].trim().toUpperCase();
            break;
          }
        }
      }
      boundaries.push({
        lineIndex: i,
        name: cleanLectureHours(rawName.replace(COURSE_CODE_REGEX, '').replace(/[-–—]\s*$/, '').trim()),
        code,
      });
      continue;
    }

    // Pattern 2: Explicit "Course Code: CS101" with preceding title
    const explicitCodeMatch = line.match(
      /^(?:course\s+code|paper\s+code|code)\s*[:=]\s*([A-Za-z0-9\-]+)/i
    );
    if (explicitCodeMatch) {
      const code = explicitCodeMatch[1].trim().toUpperCase();
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      if (
        prevLine &&
        prevLine.length > 4 &&
        prevLine.length < 90 &&
        !/credits|contact|hours|semester|page|university/i.test(prevLine) &&
        (!boundaries.length || boundaries[boundaries.length - 1].lineIndex !== i - 1)
      ) {
        boundaries.push({
          lineIndex: i - 1,
          name: cleanLectureHours(prevLine),
          code,
        });
        continue;
      }
    }

    // Pattern 3: "Course Name — CS101" on one line
    const inlineMatch = line.match(
      /^(?:\d+[\.\)]\s+)?([A-Za-z\s&,\-'\(\)]{5,75}?)\s*[-–—:\(]\s*([A-Z]{1,4}[- ]?(?:[A-Z]{2,4}[- ]?)?\d{3}[A-Z]?)\s*[\)]?$/i
    );
    if (
      inlineMatch &&
      /programming|physics|mathematics|chemistry|science|knowledge|engineering|graphics|communication|electronics|mechanics|english|lab/i.test(
        inlineMatch[1]
      ) &&
      !/prerequisite|textbook|reference|outcome|objective|module|unit|chapter/i.test(line)
    ) {
      boundaries.push({
        lineIndex: i,
        name: cleanLectureHours(inlineMatch[1].trim()),
        code: inlineMatch[2].replace(/\s+/g, '').toUpperCase(),
      });
      continue;
    }

    // Pattern 4: Standalone major subject headings like "MATHEMATICS", "PHYSICS", "CHEMISTRY"
    const subjectMatch = line.match(/^(?:subject\s*[:=]\s*)?(MATHEMATICS|PHYSICS|CHEMISTRY|BIOLOGY)\s*[:]?$/i);
    if (subjectMatch) {
      const subjName = subjectMatch[1].charAt(0).toUpperCase() + subjectMatch[1].slice(1).toLowerCase();
      boundaries.push({
        lineIndex: i,
        name: currentPaperPrefix ? `${currentPaperPrefix}${subjName}` : subjName,
      });
      continue;
    }

    // Pattern 5: Part headings (e.g. "Part - I MATHEMATICS", "Part - II APTITUDE TEST", "Part - III DRAWING TEST", "Part - III PLANNING")
    const partMatch = line.match(/^part\s*[-–—:]\s*([I|V|X\d]+)\s+([A-Za-z\s]+)$/i);
    if (partMatch) {
      const partNum = partMatch[1].toUpperCase();
      const partTitle = partMatch[2].trim();
      const cleanTitle = partTitle.charAt(0).toUpperCase() + partTitle.slice(1).toLowerCase();
      boundaries.push({
        lineIndex: i,
        name: currentPaperPrefix ? `${currentPaperPrefix}Part ${partNum} - ${cleanTitle}` : `Part ${partNum} - ${cleanTitle}`,
      });
      continue;
    }

    // Pattern 6: Line starting with major subject then Unit (e.g. "MATHEMATICS UNIT 1: ...")
    const subjectUnitMatch = line.match(/^(MATHEMATICS|PHYSICS|CHEMISTRY|BIOLOGY)\s+(?:UNIT|MODULE)\s+\d+/i);
    if (subjectUnitMatch) {
      const subjName = subjectUnitMatch[1].charAt(0).toUpperCase() + subjectUnitMatch[1].slice(1).toLowerCase();
      boundaries.push({
        lineIndex: i,
        name: currentPaperPrefix ? `${currentPaperPrefix}${subjName}` : subjName,
      });
      continue;
    }
  }

  // Deduplicate nearby boundaries (same course detected twice)
  const deduped: CourseBoundary[] = [];
  for (const b of boundaries) {
    const last = deduped[deduped.length - 1];
    if (!last || b.lineIndex - last.lineIndex > 3) {
      deduped.push(b);
    } else {
      if (!last.code && b.code) last.code = b.code;
      if (b.name.length > last.name.length) last.name = b.name;
    }
  }

  // ── Build course blocks ───────────────────────────────────────────────────

  if (deduped.length === 0) {
    // Single-course document
    const docName = fallbackDocumentName?.trim() || 'Imported Syllabus';
    const isLab = isLaboratoryCourse(docName);
    const { metadata, treeLines } = extractCourseMetadataAndTreeLines(lines, isLab);
    return [
      {
        name: docName,
        code: metadata.code,
        isLab: isLaboratoryCourse(docName, metadata.code),
        metadata,
        treeLines,
        allLines: lines,
      },
    ];
  }

  const blocks: RawCourseBlock[] = [];
  for (let k = 0; k < deduped.length; k++) {
    const current = deduped[k];
    const startIndex = current.lineIndex;
    const endIndex =
      k + 1 < deduped.length ? deduped[k + 1].lineIndex : lines.length;
    const blockLines = lines.slice(startIndex, endIndex);

    const isLab = isLaboratoryCourse(current.name, current.code);
    const { metadata, treeLines } = extractCourseMetadataAndTreeLines(blockLines, isLab);
    if (current.code && !metadata.code) metadata.code = current.code;

    blocks.push({
      name: current.name,
      code: metadata.code || current.code,
      isLab: isLaboratoryCourse(current.name, metadata.code || current.code),
      metadata,
      treeLines,
      allLines: blockLines,
    });
  }

  return blocks;
}
