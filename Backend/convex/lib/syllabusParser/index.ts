import type { ExtractionResult, ParsedCourse } from './types';
import { normalizeRawText } from './normalizer';
import { detectCourses } from './courseDetector';
import { buildCourseHierarchy, validateTree } from './hierarchyBuilder';
import { extractTextFromPdfBuffer, type PdfExtractionResult } from './pdfExtractor';

export * from './types';
export * from './normalizer';
export * from './classifier';
export * from './courseDetector';
export * from './hierarchyBuilder';
export * from './pdfExtractor';

const id = () => Math.random().toString(36).slice(2, 10);

/**
 * Full parsing pipeline:
 *   normalizeRawText
 *   → detectCourses (segments by boundary + splits treeLines from metadata)
 *   → buildCourseHierarchy (treeLines only)
 *   → validateTree (secondary bibliography guard)
 */
export function parseAcademicSyllabus(rawText: string, fallbackTitle?: string): ExtractionResult {
  const normalized = normalizeRawText(rawText);
  const rawCourses = detectCourses(normalized, fallbackTitle);

  const courses: ParsedCourse[] = [];
  const warnings: string[] = [];

  for (const raw of rawCourses) {
    if (raw.code === 'ME194') console.log('ME194 raw.treeLines in index.ts:', raw.treeLines);
    // Build hierarchy from treeLines only — bibliography never reaches here
    const rawTree = buildCourseHierarchy(raw.treeLines, raw.isLab);

    // Secondary validation pass
    const { tree, flagged } = validateTree(rawTree);

    const courseWarnings: string[] = [];
    if (!raw.code) {
      courseWarnings.push('Course code could not be detected automatically.');
    }
    if (tree.length === 0) {
      courseWarnings.push('No syllabus modules or topics could be extracted.');
    }
    if (flagged.length > 0) {
      courseWarnings.push(
        `${flagged.length} line(s) were removed from the tree during validation (bibliography/metadata detected).`
      );
    }

    courses.push({
      id: id(),
      name: raw.name,
      code: raw.code,
      isLab: raw.isLab,
      metadata: raw.metadata,
      tree,
      warnings: courseWarnings,
      unclassifiedSections: [],
      confidence: raw.code && tree.length > 0 ? 'high' : 'medium',
    });
  }

  if (courses.length > 1) {
    warnings.push(
      `Detected ${courses.length} separate academic courses in the submitted syllabus document.`
    );
  }

  return {
    documentTitle:
      fallbackTitle || (courses[0]?.name ? `${courses[0].name} Syllabus` : 'Academic Syllabus'),
    courses,
    warnings,
  };
}

/**
 * Ingests a file (PDF, TXT) and runs the full extraction pipeline.
 */
export async function parseSyllabusFile(file: File, fallbackTitle?: string): Promise<ExtractionResult> {
  const fileName = file.name || 'Uploaded Document';
  const docTitle = fallbackTitle || fileName.replace(/\.[^/.]+$/, '');

  if (/\.pdf$/i.test(fileName)) {
    try {
      const buffer = await file.arrayBuffer();
      const pdfRes: PdfExtractionResult = await extractTextFromPdfBuffer(buffer);

      if (pdfRes.isScannedOrEmpty) {
        return {
          documentTitle: docTitle,
          courses: [],
          warnings: [
            'This PDF appears to be scanned or contains non-selectable text. OCR is not configured. Please paste the syllabus text directly.',
          ],
        };
      }

      return parseAcademicSyllabus(pdfRes.text, docTitle);
    } catch (err: any) {
      return {
        documentTitle: docTitle,
        courses: [],
        warnings: [
          `Failed to read PDF content: ${err?.message || 'Unsupported format'}. Try pasting the text instead.`,
        ],
      };
    }
  }

  // Plain text / markdown files
  try {
    const text = await file.text();
    return parseAcademicSyllabus(text, docTitle);
  } catch (err: any) {
    return {
      documentTitle: docTitle,
      courses: [],
      warnings: [`Failed to read text file: ${err?.message || 'Error reading file'}.`],
    };
  }
}
