import * as pdfjsLib from 'pdfjs-dist';

// Set up worker in browser environments
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback if URL resolution fails
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

export interface PdfExtractionResult {
  text: string;
  isScannedOrEmpty: boolean;
  pageCount: number;
}

/**
 * Extracts selectable text from an ArrayBuffer of a PDF document using PDF.js.
 * Correctly inflates compressed FlateDecode streams and decodes font CMaps.
 * Reconstructs line breaks based on text Y-coordinates and column positions,
 * preventing superscript/subscript formulas from fragmenting onto separate lines.
 */
export async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<PdfExtractionResult> {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
  });

  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lastY: number | undefined;
    let lastX: number | undefined;
    let pageText = '';

    for (const item of content.items as any[]) {
      if (!('str' in item)) continue;

      const currentY = item.transform[5];
      const currentX = item.transform[4];
      const width = item.width || 0;

      // A genuine newline occurs when:
      // 1. Y changes by > 7 points (typical line height diff is 12-16 points), OR
      // 2. Y changes by > 3 points AND X moved backwards (carriage return to left margin)
      const isNewLine = lastY !== undefined && (
        Math.abs(currentY - lastY) > 7 ||
        (Math.abs(currentY - lastY) > 3 && currentX < (lastX ?? 0) - 30)
      );

      if (isNewLine) {
        pageText += '\n';
      } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n') && !item.str.startsWith(' ')) {
        pageText += ' ';
      }

      pageText += item.str;
      lastY = currentY;
      lastX = currentX + width;
    }

    if (pageText.trim()) {
      pageTexts.push(pageText.trim());
    }
  }

  const combinedText = pageTexts.join('\n\n');
  const isScannedOrEmpty = combinedText.trim().length < 50;

  return {
    text: combinedText,
    isScannedOrEmpty,
    pageCount,
  };
}
