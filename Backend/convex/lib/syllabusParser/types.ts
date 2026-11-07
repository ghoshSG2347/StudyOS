export type ItemType = 'subject' | 'chapter' | 'topic' | 'subtopic' | 'item';

export interface AcademicMetadata {
  code?: string;
  credits?: string;
  contactHours?: string;
  totalContactHours?: string;
  prerequisites?: string;
  courseObjectives?: string[];
  courseOutcomes?: string[];
  textbooks?: string[];
  referenceBooks?: string[];
  department?: string;
  programme?: string;
  academicYear?: string;
  [key: string]: any;
}

export type ContentClassification =
  | 'course_header'
  | 'metadata'
  | 'objective'
  | 'outcome'
  | 'reference'      // textbook / reference-book section heading
  | 'bibliography'   // content *inside* a reference section (book entries)
  | 'module_chapter'
  | 'experiment'
  | 'topic'
  | 'subtopic'
  | 'noise'
  | 'unclassified';

/**
 * Represents a document section kind used by the section-state machine.
 * Sections are mutually exclusive per course block.
 */
export type SectionKind =
  | 'preamble'      // before any recognised content heading
  | 'content'       // inside Course Content / Module / Unit headings
  | 'objective'     // Course Objectives
  | 'outcome'       // Course Outcomes / CO-PO mapping
  | 'textbook'      // Text Books
  | 'reference'     // Reference Books / Suggested Readings
  | 'other_meta';   // other non-tree metadata

export interface ParsedStudyNode {
  id: string;
  name: string;
  type: ItemType;
  completed: boolean;
  children: ParsedStudyNode[];
  confidence?: 'high' | 'medium' | 'low';
  rawText?: string;
}

export interface ParsedCourse {
  id: string;
  name: string;
  code?: string;
  isLab?: boolean;
  metadata: AcademicMetadata;
  tree: ParsedStudyNode[];
  warnings: string[];
  unclassifiedSections: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ExtractionResult {
  documentTitle?: string;
  courses: ParsedCourse[];
  warnings: string[];
}
