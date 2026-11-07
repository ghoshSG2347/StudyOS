/**
 * Lightweight PDF Text Extractor
 * Extracts text streams from PDF files in the browser without external runtime dependencies.
 * If a PDF is image-based / scanned, reports a clear informative message.
 */

export interface PdfExtractionResult {
  text: string;
  isScannedOrEmpty: boolean;
  pageCount: number;
}

/**
 * Decodes standard PDF text strings from octal or hex escapes
 */
function decodePdfString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\([()\\])/g, '$1');
}

/**
 * Extracts selectable text from an ArrayBuffer of a PDF document
 */
export function extractTextFromPdfBuffer(buffer: ArrayBuffer): PdfExtractionResult {
  const bytes = new Uint8Array(buffer);
  let rawStr = '';

  // Decode buffer as latin1/binary string to locate text streams safely
  const chunkSize = 16384;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    rawStr += String.fromCharCode.apply(null, Array.from(chunk));
  }

  // Count page markers
  const pageMatches = rawStr.match(/\/Type\s*\/Page\b/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  // Extract text within Text Objects: BT ... ET
  const textObjectRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match: RegExpExecArray | null;
  const extractedLines: string[] = [];

  while ((match = textObjectRegex.exec(rawStr)) !== null) {
    const block = match[1];

    // Pattern 1: (Text) Tj or ' or "
    const tjRegex = /\(([\s\S]*?)\)\s*(?:Tj|'|")/g;
    let tjMatch: RegExpExecArray | null;
    let blockText = '';

    while ((tjMatch = tjRegex.exec(block)) !== null) {
      blockText += decodePdfString(tjMatch[1]) + ' ';
    }

    // Pattern 2: [(T) 10 (ext)] TJ
    const arrayTjRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;

    while ((arrayMatch = arrayTjRegex.exec(block)) !== null) {
      const inner = arrayMatch[1];
      const partRegex = /\(([\s\S]*?)\)/g;
      let partMatch: RegExpExecArray | null;
      while ((partMatch = partRegex.exec(inner)) !== null) {
        blockText += decodePdfString(partMatch[1]);
      }
      blockText += ' ';
    }

    const trimmed = blockText.trim();
    if (trimmed.length > 0) {
      extractedLines.push(trimmed);
    }
  }

  const combinedText = extractedLines.join('\n');
  const isScannedOrEmpty = combinedText.trim().length < 50;

  return {
    text: combinedText,
    isScannedOrEmpty,
    pageCount,
  };
}
