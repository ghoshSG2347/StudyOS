# StudyOS — Syllabus Understanding & Extraction Engine Limitations

## 1. Supported Formats & Capabilities

| Source / Feature | Status | Capability Details |
|---|---|---|
| **Pasted Syllabus Text** | **Fully Supported** | Normalizes line breaks, whitespace, bullet symbols, and unicode punctuation. Full multi-course segmentation and metadata extraction. |
| **Plain Text Files (`.txt`)** | **Fully Supported** | Ingests and processes through the full extraction pipeline. |
| **Selectable PDF Documents** | **Supported** | Native stream decoder extracts text blocks (`BT ... ET`, `Tj`, `TJ`) and reconstructs structure without external dependencies. |
| **Scanned / Image-only PDFs** | **Requires OCR** | OCR is not configured in this environment. The engine detects image-only PDFs and prompts the student to paste the text directly. |
| **DOCX Files** | **Planned / Manual Fallback** | DOCX binary zip archives are not currently unzipped in the client. Manual paste is recommended for Word documents. |

---

## 2. Deterministic vs. AI-Driven Parsing

- **Deterministic Rule Engine:**
  - StudyOS relies on a deterministic academic rule engine for structure detection, course boundary detection, and metadata separation.
  - Zero external API costs, zero vendor lock-in, and instant local execution (<50ms).
- **Ambiguity & Human Review:**
  - When syllabus documents lack standard academic formatting (e.g., freeform paragraphs without headers or bullets), the engine classifies sections with `medium` or `low` confidence.
  - The Step 2 Review screen allows the student to adjust the outline, rename items, add topics, or remove sections before saving to the database.

---

## 3. Best Practices for Users

1. **Copying from PDFs:** When copying text from PDF viewers, select text column by column if the document uses multi-column tables.
2. **Review Step:** Always review the proposed outline on the Step 2 review screen before saving.
3. **Multi-Course Curriculums:** When pasting an entire semester's curriculum, select and import each course individually into its dedicated study workspace.

