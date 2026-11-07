/**
 * Syllabus Text Normalizer
 *
 * Pass 1: Unicode normalization, strip noise lines, repeated headers, split compound headers
 * Pass 2: Join wrapped continuation lines (preventing header/meta absorption)
 */

/** These endings mean the line is a complete sentence — don't join next. */
const SENTENCE_END = /[.;:,\)\]\}]$/;

export function splitCompoundHeadings(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push(line);
      continue;
    }

    // Pattern 1: "Syllabus for ... Part - I MATHEMATICS"
    const mSyllabusPart = trimmed.match(
      /^(Syllabus\s+for\s+.+?)\s+(Part\s*[-–—:]\s*[I|V|X\d]+\s+[A-Za-z].*)$/i
    );
    if (mSyllabusPart) {
      result.push(mSyllabusPart[1].trim());
      result.push(mSyllabusPart[2].trim());
      continue;
    }

    // Pattern 2: "MATHEMATICS UNIT 1: ..."
    const mSubjUnit = trimmed.match(
      /^((?:SUBJECT\s*[:=]\s*)?(?:MATHEMATICS|PHYSICS|CHEMISTRY|BIOLOGY))\s+((?:UNIT|MODULE|CHAPTER|PART)\s*[-–—:]?\s*\d+.*)$/i
    );
    if (mSubjUnit) {
      result.push(mSubjUnit[1].trim());
      result.push(mSubjUnit[2].trim());
      continue;
    }

    // Pattern 3: "Part - II APTITUDE TEST UNIT - 1 ..."
    const mPartUnit = trimmed.match(
      /^(Part\s*[-–—:]\s*[I|V|X\d]+\s+[A-Za-z\s]+?)\s+((?:UNIT|MODULE)\s*[-–—:]?\s*\d+.*)$/i
    );
    if (mPartUnit) {
      result.push(mPartUnit[1].trim());
      result.push(mPartUnit[2].trim());
      continue;
    }

    // Pattern 4: "Part – III DRAWING TEST Sketching..."
    const mPartDrawing = trimmed.match(
      /^(Part\s*[-–—:]\s*[I|V|X\d]+\s+(?:DRAWING\s+TEST|PLANNING))\s+([A-Za-z].*)$/i
    );
    if (mPartDrawing) {
      result.push(mPartDrawing[1].trim());
      result.push(mPartDrawing[2].trim());
      continue;
    }

    result.push(line);
  }
  return result.join('\n');
}

export function matchesBoundaryStart(trimmed: string): boolean {
  return (
    /^(?:module|unit|chapter|part|section)\s*[-–—:]?\s*\d/i.test(trimmed) ||
    /^(?:module|unit|chapter|part|section)\s+[IVX]/i.test(trimmed) ||
    /^(?:part\s*[-–—:]\s*[I|V|X\d]+)/i.test(trimmed) ||
    /^(?:syllabus\s+for\b)/i.test(trimmed) ||
    /^(?:subject\s*[:=]\s*)?(?:mathematics|physics|chemistry|biology)\s*[:]?$/i.test(trimmed) ||
    /^\d+\.\d+/.test(trimmed) ||
    /^\d+[\.\)]\s+[A-Z]/.test(trimmed) ||
    /^[-*+•]\s+/.test(trimmed) ||
    /^#+\s+/.test(trimmed) ||
    /^course\s+(?:name|code|content|objectives?|outcomes?)/i.test(trimmed) ||
    /^text\s*books?/i.test(trimmed) ||
    /^reference\s*books?/i.test(trimmed) ||
    /^suggested\s+readings?/i.test(trimmed) ||
    /^co\s*[-–]\s*po/i.test(trimmed) ||
    /^contact\s+hours/i.test(trimmed) ||
    /^total\s+contact/i.test(trimmed) ||
    /^credits?\s*[:=]/i.test(trimmed) ||
    /^prerequisites?/i.test(trimmed)
  );
}

export function normalizeRawText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/\f/g, '\n---PAGE_BREAK---\n');

  text = splitCompoundHeadings(text);

  const rawLines = text.split('\n');

  // ── Frequency map for repeated headers ───────────────────────────────────
  const lineFrequencies = new Map<string, number>();
  for (const line of rawLines) {
    const t = line.trim();
    if (t.length > 5 && t.length < 100) {
      lineFrequencies.set(t, (lineFrequencies.get(t) || 0) + 1);
    }
  }

  const noisePatterns = [
    /^\s*page\s+\d+\s*(of\s+\d+)?\s*$/i,
    /^\s*[-_~=*#]{4,}\s*$/,
    /^\s*\d+\s*\/\s*\d+\s*$/,
    /^\s*(confidential|internal circulation only|draft copy)\s*$/i,
  ];

  // ── Pass 1: remove noise lines ───────────────────────────────────────────
  const pass1: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed === '---PAGE_BREAK---') continue;
    if (!trimmed) { pass1.push(''); continue; }
    if (noisePatterns.some((p) => p.test(trimmed))) continue;

    const freq = lineFrequencies.get(trimmed) || 0;
    if (
      freq >= 3 &&
      /university|institute|curriculum|b\.?tech|syllabus|semester|all rights reserved|department/i.test(trimmed) &&
      !/module|unit|chapter|course\s+name|course\s+code/i.test(trimmed)
    ) {
      continue;
    }

    pass1.push(line);
  }

  // ── Pass 2: join wrapped continuation lines ──────────────────────────────
  const pass2: string[] = [];
  for (let i = 0; i < pass1.length; i++) {
    const line = pass1[i];
    const trimmed = line.trim();

    if (!trimmed) {
      pass2.push('');
      continue;
    }

    // Do NOT join across blank lines (preserves paragraphs)
    const prevLineWasEmpty = i > 0 && pass1[i - 1].trim().length === 0;

    if (!prevLineWasEmpty && pass2.length > 0) {
      const prev = pass2[pass2.length - 1].trim();
      const isPrevMeta =
        /^(?:credits?|contact\s+hours|total\s+contact|course\s+(?:name|code)|paper\s+(?:name|code)|prerequisites?|syllabus\s+for|part\s*[-–—:]|paper\s*\d)\b/i.test(
          prev
        );
      const isPrevHeader = matchesBoundaryStart(prev);
      const isCurrHeader = matchesBoundaryStart(trimmed);

      const shouldJoin =
        prev.length > 0 &&
        trimmed.length > 0 &&
        !isPrevMeta &&
        !isPrevHeader &&
        !isCurrHeader &&
        !SENTENCE_END.test(prev) &&
        !/^[A-Z][A-Z\s\-&]{3,}$/.test(trimmed) &&
        (prev + ' ' + trimmed).length < 220;

      if (shouldJoin) {
        pass2[pass2.length - 1] = pass2[pass2.length - 1].trimEnd() + ' ' + trimmed;
        continue;
      }
    }

    pass2.push(line);
  }

  return pass2.join('\n');
}
