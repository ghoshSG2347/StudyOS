import fs from "fs";
import { extractTextFromPdfBuffer } from "./src/lib/syllabus-parser/pdfExtractor.js";
import { parseAcademicSyllabus } from "./src/lib/syllabus-parser/index.js";

async function run() {
  const buf = fs.readFileSync("C:/Users/Bidisha Ghosh/OneDrive/Desktop/PRDS/202510311323551056.pdf");
  const text = await extractTextFromPdfBuffer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  console.log("Extracted text length:", text.length);
  
  const parsed = parseAcademicSyllabus(text, "JEE Main");
  console.log("Detected courses count:", parsed.courses.length);
  parsed.courses.forEach((c, i) => {
    console.log(`Course ${i + 1}: [${c.code || "NO_CODE"}] ${c.name} (${c.tree.length} top items)`);
  });
}
run().catch(console.error);

