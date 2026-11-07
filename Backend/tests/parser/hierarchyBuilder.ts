import type { ParsedStudyNode, ItemType } from './types';
import { cleanLectureHours, classifyLine } from './classifier';

const id = () => Math.random().toString(36).slice(2, 10);

function createNode(
  name: string,
  type: ItemType,
  children: ParsedStudyNode[] = [],
  confidence: 'high' | 'medium' | 'low' = 'high'
): ParsedStudyNode {
  let cleaned = cleanLectureHours(name.trim());
  if (cleaned.length > 200) {
    cleaned = cleaned.slice(0, 197) + '...';
  }
  return {
    id: id(),
    name: cleaned || 'Untitled Item',
    type,
    completed: false,
    children,
    confidence,
  };
}

/**
 * VALIDATION GUARDS
 * Lines that look like bibliography entries even if they slipped through
 * the section-state machine should not become tree nodes.
 */
export function looksLikeBibliographyEntry(trimmed: string): boolean {
  const hasYear = /\b(19|20)\d{2}\b/.test(trimmed);
  const hasPublisher =
    /\b(press|publication|publisher|wiley|pearson|mcgraw|springer|tata|oxford|cambridge|elsevier|cengage|routledge|prentice|phi|scitech|dover|tmh|katson|schand|s\.?\s*chand|khanna|nirali|himalaya|jaico|regal|heinemann|longman|doubleday)\b/i.test(
      trimmed
    );
  const hasBibKeywords = /\b(?:isbn|doi|pp\.|ed\.|vol\.|edition)\b/i.test(trimmed);
  const hasEdition = /\b(?:1st|2nd|3rd|[4-9]th|\d{1,2}(?:st|nd|rd|th))\s+ed(?:ition|\.)?/i.test(trimmed);

  if (hasBibKeywords || hasEdition) return true;
  if (hasYear && hasPublisher) return true;
  if (hasYear && /"[^"]+"/.test(trimmed)) return true;
  if (hasPublisher && /"[^"]+"/.test(trimmed)) return true;

  // Pattern: "Author, "Book Title", ..."
  if (/^[A-Za-z0-9\s.,'&-]+,\s*"[^"]+"/.test(trimmed)) return true;
  // Pattern: ""Book Title", Author/Publisher..."
  if (/^"[^"]+",\s*[A-Za-z]/.test(trimmed)) return true;

  return false;
}

export function looksLikeMetadataOnly(trimmed: string): boolean {
  return (
    /^co\s*\d+\s*[:.-]/i.test(trimmed) || // CO1: ...
    /^po\s*\d+\s*[:.-]/i.test(trimmed) || // PO1: ...
    /^\d+\s*:\s*\d+\s*:\s*\d+/.test(trimmed) || // L:T:P ratios
    /^at\s+the\s+end\s+of\s+/i.test(trimmed) || // "At the end of this course..."
    /^the\s+students?\s+will\s+/i.test(trimmed) // "The student will be able to..."
  );
}

/**
 * Splits a line into compact, meaningful topic items.
 * Uses semicolons, sentence boundaries, or bullet points.
 * Does NOT blindly split on commas, which would fragment sentences and chemical formulas.
 */
function splitIntoCompactTopics(trimmed: string): string[] {
  // Semicolons in syllabus descriptions separate distinct topics
  if (trimmed.includes(';')) {
    return trimmed
      .split(/;\s*/)
      .map((s) => cleanLectureHours(s.trim().replace(/^[-*+•]\s*/, '').replace(/^\d+[\.\)]\s*/, '')))
      .filter((s) => s.length > 3 && !/^[0-9\s\+\-−\/\^,.]+$/.test(s));
  }

  // Sentences separated by period followed by a capital letter
  if (trimmed.length > 120 && /\.\s+[A-Z]/.test(trimmed)) {
    return trimmed
      .split(/\.\s+(?=[A-Z])/)
      .map((s) => cleanLectureHours(s.trim().replace(/\.$/, '')))
      .filter((s) => s.length > 3 && !/^[0-9\s\+\-−\/\^,.]+$/.test(s));
  }

  const cleaned = cleanLectureHours(trimmed.replace(/^[-*+•]\s*/, '').replace(/^\d+[\.\)]\s*/, '').replace(/\.$/, ''));
  if (cleaned.length >= 4 && !/^[0-9\s\+\-−\/\^,.]+$/.test(cleaned)) {
    return [cleaned];
  }

  return [];
}

/**
 * Builds a structured academic hierarchy from treeLines only.
 * treeLines have already been filtered by courseDetector to contain
 * ONLY content-section lines (modules, topics, subtopics).
 * Bibliography and metadata lines are NEVER passed here.
 */
export function buildCourseHierarchy(treeLines: string[], isLab = false): ParsedStudyNode[] {
  const chapters: ParsedStudyNode[] = [];
  let currentChapter: ParsedStudyNode | null = null;
  let currentTopic: ParsedStudyNode | null = null;
  let prevLineEndedWithColon = false;

  const peekNextNonEmpty = (lines: string[], start: number): string | null => {
    for (let j = start + 1; j < lines.length; j++) {
      if (lines[j].trim()) return lines[j].trim();
    }
    return null;
  };

  for (let i = 0; i < treeLines.length; i++) {
    const rawLine = treeLines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // ── Secondary safety guard: reject bibliography / metadata entries ─────
    if (looksLikeBibliographyEntry(trimmed) || looksLikeMetadataOnly(trimmed)) {
      continue;
    }

    const classification = classifyLine(trimmed);

    // Skip course header and metadata lines
    if (classification === 'course_header' || classification === 'metadata') {
      continue;
    }

    // Skip objective / outcome / reference headings
    if (
      classification === 'objective' ||
      classification === 'outcome' ||
      classification === 'reference'
    ) {
      continue;
    }

    const nextLine = peekNextNonEmpty(treeLines, i);
    const isHeadingFollowedByItems =
      isLab &&
      trimmed.length > 3 &&
      trimmed.length < 65 &&
      !/[.;,]$/.test(trimmed.replace(/:$/, '')) &&
      !/^\d+[\.\)]\s+/.test(trimmed) &&
      !/^\d+\.\d+/.test(trimmed) &&
      !/^[-*+•]\s+/.test(trimmed) &&
      nextLine !== null &&
      (/^\d+[\.\)]\s+/.test(nextLine) || /^[-*+•]\s+/.test(nextLine));

    // ── 1. Module / Unit / Chapter Heading (or Lab Heading followed by items) ─
    if (classification === 'module_chapter' || isHeadingFollowedByItems) {
      const cleaned = cleanLectureHours(
        trimmed
          .replace(/^#{1,3}\s*/, '')
          .replace(/^(?:mathematics|physics|chemistry|biology)\s+/i, '')
          .replace(/:$/, '')
          .trim()
      );
      const newChapter = createNode(cleaned, 'chapter');
      chapters.push(newChapter);
      currentChapter = newChapter;
      currentTopic = null;
      prevLineEndedWithColon = trimmed.endsWith(':');
      continue;
    }

    // ── 2. Experiment / Lab heading ──────────────────────────────────────
    if (classification === 'experiment') {
      if (/^(?:list\s+of\s+)?experiments?/i.test(trimmed)) {
        if (!currentChapter || !/experiment|lab|practical/i.test(currentChapter.name)) {
          const labChapter = createNode(trimmed, 'chapter');
          chapters.push(labChapter);
          currentChapter = labChapter;
        }
        prevLineEndedWithColon = trimmed.endsWith(':');
        continue;
      }

      const cleanedExp = cleanLectureHours(
        trimmed.replace(/^exp(?:eriment)?\.?\s*\d+[\s:.-]*/i, '').trim()
      );
      const expTopic = createNode(cleanedExp || trimmed, 'topic');
      if (!currentChapter) {
        currentChapter = createNode('Laboratory Experiments', 'chapter');
        chapters.push(currentChapter);
      }
      currentChapter.children.push(expTopic);
      currentTopic = expTopic;
      prevLineEndedWithColon = trimmed.endsWith(':');
      continue;
    }

    // ── 3. Numbered experiments in lab course ───────────────────────────
    if (isLab && /^\d+[\.\)]\s+/.test(trimmed)) {
      const expTitle = cleanLectureHours(trimmed.replace(/^\d+[\.\)]\s+/, '').trim());
      if (expTitle.length > 3) {
        const expNode = createNode(expTitle, 'topic');
        if (!currentChapter) {
          currentChapter = createNode('Practical Assignments', 'chapter');
          chapters.push(currentChapter);
        }
        currentChapter.children.push(expNode);
        currentTopic = expNode;
        prevLineEndedWithColon = trimmed.endsWith(':');
        continue;
      }
    }

    // ── 4. Explicit Numbered Topic (e.g. "1.01 Laser (6L): ...") ─────────
    if (classification === 'topic') {
      const colonIdx = trimmed.indexOf(':');
      let topicTitle = trimmed;
      let inlineSubtopics = '';

      if (colonIdx > 0 && colonIdx < 50) {
        topicTitle = trimmed.substring(0, colonIdx).trim();
        inlineSubtopics = trimmed.substring(colonIdx + 1).trim();
      }

      topicTitle = cleanLectureHours(
        topicTitle.replace(/^\d+\.\d{1,3}\s*/, '').replace(/^#{2,4}\s*/, '').trim()
      );
      const newTopic = createNode(topicTitle, 'topic');

      if (!currentChapter) {
        currentChapter = createNode('General Topics', 'chapter', [], 'medium');
        chapters.push(currentChapter);
      }

      currentChapter.children.push(newTopic);
      currentTopic = newTopic;

      if (inlineSubtopics) {
        const subItems = inlineSubtopics
          .split(/,\s*(?=[A-Za-z])/)
          .map((s) => cleanLectureHours(s.trim()))
          .filter((s) => s.length > 2);

        for (const sub of subItems) {
          newTopic.children.push(createNode(sub, 'subtopic'));
        }
      }
      prevLineEndedWithColon = trimmed.endsWith(':');
      continue;
    }

    // ── 5. Subtopics / Bullet Points / Indented Items ───────────────────
    if (classification === 'subtopic') {
      const leadingSpaces =
        rawLine.match(/^(\s*)/)?.[1]?.replace(/\t/g, '  ')?.length || 0;
      const cleanText = cleanLectureHours(
        trimmed
          .replace(/^[-*+•]\s+/, '')
          .replace(/^\d+[\.\)]\s+/, '')
          .trim()
      );
      if (cleanText.length < 2) continue;

      if (!currentChapter) {
        currentChapter = createNode('Course Content', 'chapter');
        chapters.push(currentChapter);
      }

      // "Classification: Digital, Analog, Hybrid" → topic + subtopics
      const colonIdx = cleanText.indexOf(':');
      if (colonIdx > 0 && colonIdx < 35 && cleanText.length > 20) {
        const topicName = cleanText.substring(0, colonIdx).trim();
        const subDetails = cleanText.substring(colonIdx + 1).trim();
        const topicNode = createNode(topicName, 'topic');
        currentChapter.children.push(topicNode);
        currentTopic = topicNode;

        const subItems = subDetails
          .split(/,\s*(?=[A-Za-z0-9])/)
          .map((s) => cleanLectureHours(s.trim().replace(/\.$/, '')))
          .filter((s) => s.length > 2);

        for (const it of subItems) {
          topicNode.children.push(createNode(it, 'subtopic'));
        }
        prevLineEndedWithColon = cleanText.endsWith(':');
        continue;
      }

      if (leadingSpaces >= 3 && currentTopic) {
        currentTopic.children.push(createNode(cleanText, 'subtopic'));
      } else {
        const topicNode = createNode(cleanText, 'topic');
        currentChapter.children.push(topicNode);
        currentTopic = topicNode;
      }
      prevLineEndedWithColon = cleanText.endsWith(':');
      continue;
    }

    // ── 6. Unclassified lines in content ────────────────────────────────
    if (classification === 'unclassified') {
      if (!currentChapter) {
        currentChapter = createNode('Course Content', 'chapter');
        chapters.push(currentChapter);
      }

      // "Classification: Digital, Analog, Hybrid"
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0 && colonIdx < 35) {
        const topicName = trimmed.substring(0, colonIdx).trim();
        const subDetails = trimmed.substring(colonIdx + 1).trim();
        const topicNode = createNode(topicName, 'topic');
        currentChapter.children.push(topicNode);
        currentTopic = topicNode;

        if (subDetails) {
          const subItems = subDetails
            .split(/,\s*(?=[A-Za-z0-9])/)
            .map((s) => cleanLectureHours(s.trim().replace(/\.$/, '')))
            .filter((s) => s.length > 2);

          for (const it of subItems) {
            topicNode.children.push(createNode(it, 'subtopic'));
          }
        }
        prevLineEndedWithColon = trimmed.endsWith(':');
        continue;
      }

      // If previous line ended with a colon (e.g. "1.01 Laser (6L):")
      // and this line has comma-separated concepts, they are subtopics of currentTopic!
      if (prevLineEndedWithColon && currentTopic && trimmed.includes(',')) {
        const concepts = trimmed
          .split(/,\s*(?=[A-Za-z0-9])/)
          .map((c) => cleanLectureHours(c.trim().replace(/\.$/, '')))
          .filter((c) => c.length > 2);

        for (const c of concepts) {
          currentTopic.children.push(createNode(c, 'subtopic', [], 'high'));
        }
        prevLineEndedWithColon = trimmed.endsWith(':');
        continue;
      }

      // Compact topic splitting (semicolons, sentences, or standalone line)
      const topics = splitIntoCompactTopics(trimmed);
      for (const top of topics) {
        const topicNode = createNode(top, 'topic', [], 'medium');
        currentChapter.children.push(topicNode);
        currentTopic = topicNode;
      }
      prevLineEndedWithColon = trimmed.endsWith(':');
    }
  }

  return chapters;
}

/**
 * Validation pass: remove any node whose name pattern indicates it
 * slipped through as bibliography / metadata.
 * Returns the cleaned tree and a list of flagged node names.
 */
export function validateTree(
  nodes: ParsedStudyNode[]
): { tree: ParsedStudyNode[]; flagged: string[] } {
  const flagged: string[] = [];

  function walk(items: ParsedStudyNode[]): ParsedStudyNode[] {
    const kept: ParsedStudyNode[] = [];
    for (const node of items) {
      if (looksLikeBibliographyEntry(node.name) || looksLikeMetadataOnly(node.name)) {
        flagged.push(node.name);
        continue;
      }
      if (!node.name || node.name.length < 2) {
        continue; // drop empty nodes
      }
      kept.push({ ...node, children: walk(node.children) });
    }
    return kept;
  }

  return { tree: walk(nodes), flagged };
}
