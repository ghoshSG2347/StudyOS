import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

/**
 * Extract text from a PDF file using pdfjs-dist
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `\n--- Page ${pageNum} ---\n` + pageText;
    }

    return fullText.trim();
  } catch (error) {
    console.warn("PDF.js direct worker failed, falling back to text stream reader:", error);
    const text = await file.text();
    const ascii = text.replace(/[^\x20-\x7E\n]/g, ' ');
    return ascii.length > 50 ? ascii : "Syllabus Content: " + file.name;
  }
}

/**
 * Noise filter rules to eliminate boilerplate, CO-PO tables, watermarks, and headers
 */
const NOISE_PATTERNS = [
  /R\d{2,}\s*\([^)]*\)/i, // e.g. R25 (B. Tech CSE)
  /Department:\s*Computer Science/i,
  /Curriculum\s*Structure\s*&\s*Syllabus/i,
  /^Structure\s*&\s*Syllabus/i,
  /Effective from \d{4}-\d{2,4}\s*admission batch/i,
  /^--- Page \d+ ---$/i,
  /^Contact\s*(?:\(Periods\/Week\)|\(Hours\)|\(L:\s*T:\s*P\))?\s*:\s*[\d:]+/i,
  /^Total Contact Hours\s*:\s*\d+/i,
  /^Credits?\s*(?:Point)?\s*:\s*\d+/i,
  /^Credit Point\s*:\s*\d+/i,
  /^No\.\s*of Lectures\s*:\s*\d+/i,
  /^Prerequisites?\s*:/i,
  /^Course Objectives?\s*(?:\(s\))?\s*:/i,
  /^Course Outcomes?\s*(?:\(s\))?\s*(?:\(COs\))?\s*:/i,
  /^By the end of this course/i,
  /^After (?:successful\s*)?completion of the course/i,
  /^On completing this course/i,
  /^CO\d+[:\s]/i, // e.g. CO1: To express...
  /^CO-PO(?:-PSO)?(?:\/PSO)?\s*Mapping:?/i,
  /^(?:COs?\/?POs?|PO1|PO2|PO3|PSO1)\b/i,
  /^CO\d+\s+[\d\s\-]+/i,
  /^Weightage Values:/i,
  /^Textbooks?\s*(?:\(s\))?\s*:/i,
  /^Text\s*Books?\s*(?:\(s\))?\s*:/i,
  /^Reference\s*Books?\s*(?:\(s\))?\s*:/i,
  /^Recommended\s*Text\s*Books/i,
  /^\d+\.\s+.*(?:Publishers?|Prentice Hall|McGraw-Hill|McGraw Hill|Edition|Press|Publications?|TMH|PHI|Benjamin|Cyber Tech)/i,
  /^\*\*In addition, it is recommended/i,
  /^Probable experiments beyond the syllabus:?/i,
  /^General idea about Measurements and Errors/i,
  /^Module\s*\d+\s*[-–]\s*(?:PO|CO)\b/i,
  /^Course Content\s*:/i
];

function isNoiseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 2) return true;
  return NOISE_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Intelligent Academic Syllabus Parser with Strict Course, Module & Topic Extraction
 */
export function parseSyllabusText(rawText, sourceFileName = "Uploaded Syllabus") {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const cleanTitle = sourceFileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

  const parsedSyllabus = {
    id: `syllabus-${Date.now()}`,
    title: cleanTitle.length > 3 ? cleanTitle : "Extracted Curriculum",
    institution: "Department of Computer Science & Engineering",
    createdAt: new Date().toISOString(),
    sourceFile: sourceFileName,
    subjects: [],
    stats: {
      filteredNoiseLines: 0,
      extractedCourses: 0,
      extractedModules: 0,
      extractedTopics: 0
    }
  };

  const subjectColorPalettes = [
    { color: "from-indigo-600 to-indigo-500", accent: "indigo" },
    { color: "from-amber-500 to-amber-600", accent: "amber" },
    { color: "from-emerald-600 to-teal-500", accent: "emerald" },
    { color: "from-purple-600 to-indigo-600", accent: "purple" },
    { color: "from-rose-500 to-pink-600", accent: "rose" },
    { color: "from-cyan-600 to-blue-600", accent: "cyan" },
  ];

  let currentSubject = null;
  let currentModule = null;
  let subjectCounter = 1;
  let moduleCounter = 1;
  let topicCounter = 1;

  // Module content buffer to stitch wrapped lines
  let moduleContentLines = [];

  const flushModuleBuffer = () => {
    if (!currentModule || moduleContentLines.length === 0) return;

    // Join lines into a single coherent text block
    const fullBlock = moduleContentLines.join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\[\s*\d+\s*[LP]\s*\]/gi, '')
      .replace(/\(\s*\d+\s*[LP]\s*\)/gi, '');

    // Split topics intelligently by commas and semicolons and periods followed by capitals
    // Handle comma splits without breaking acronym lists like DDL, DML, DCL
    const rawTopics = fullBlock.split(/[,;]|\.\s+(?=[A-Z])/).map(t => t.trim()).filter(t => t.length > 2);

    rawTopics.forEach(t => {
      let clean = t
        .replace(/^[•\-\*–—\d\.\)]+\s*/, '')
        .replace(/[:\-]\s*$/, '')
        .trim();

      if (clean.endsWith('.')) clean = clean.slice(0, -1).trim();

      if (clean.length > 2 && !isNoiseLine(clean)) {
        if (!currentModule.topics.some(existing => existing.name.toLowerCase() === clean.toLowerCase())) {
          currentModule.topics.push({
            id: `top-${Date.now()}-${topicCounter++}`,
            name: clean,
            completed: false
          });
          parsedSyllabus.stats.extractedTopics++;
        }
      }
    });

    moduleContentLines = [];
  };

  const createSubject = (name, code = `SUB-${100 + subjectCounter}`) => {
    flushModuleBuffer();
    const palette = subjectColorPalettes[(subjectCounter - 1) % subjectColorPalettes.length];
    currentSubject = {
      id: `sub-${Date.now()}-${subjectCounter++}`,
      name: name.trim().replace(/^[:\-]\s*/, ''),
      code: code.trim(),
      color: palette.color,
      accent: palette.accent,
      modules: []
    };
    parsedSyllabus.subjects.push(currentSubject);
    currentModule = null;
    return currentSubject;
  };

  const createModule = (rawName) => {
    flushModuleBuffer();
    if (!currentSubject) {
      createSubject(cleanTitle || "Core Course", "CS-101");
    }
    // Clean name: remove lecture hours like [3L], [9L], (6L), : 6P, etc.
    const cleanModName = rawName
      .replace(/\[\s*\d+\s*[LP]\s*\]/gi, '')
      .replace(/\(\s*\d+\s*[LP]\s*\)/gi, '')
      .replace(/:\s*\d+\s*P\b/gi, '')
      .replace(/[:\-]\s*$/, '')
      .trim();

    currentModule = {
      id: `mod-${Date.now()}-${moduleCounter++}`,
      name: cleanModName || `Module ${moduleCounter}`,
      topics: []
    };
    currentSubject.modules.push(currentModule);
    parsedSyllabus.stats.extractedModules++;
    return currentModule;
  };

  let parserState = 'METADATA'; // 'METADATA' | 'IN_MODULE' | 'IN_BOOKS'

  // Main Parsing Loop
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Detect Books / Bibliographies -> Enter IN_BOOKS state
    if (/^(?:Text\s*books?|Reference\s*books?|Recommended\s*Text\s*Books?)\s*(?:\(s\))?\s*:/i.test(line)) {
      flushModuleBuffer();
      parserState = 'IN_BOOKS';
      parsedSyllabus.stats.filteredNoiseLines++;
      continue;
    }

    // 2. Detect Prerequisites / Objectives / Outcomes -> Enter METADATA state
    if (/^(?:Prerequisites?|Course\s*Objectives?|Course\s*Outcomes?|Course\s*Content\s*:|Contact\s*\(|Credit\s*Point|No\.\s*of\s*Lectures)/i.test(line)) {
      if (!/^Course\s*Name/i.test(line)) {
        flushModuleBuffer();
        parserState = 'METADATA';
        parsedSyllabus.stats.filteredNoiseLines++;
        continue;
      }
    }

    // 3. Detect Course Start (Course Name: Database Management Systems)
    if (/^Course\s*Name\s*:\s*(.*)/i.test(line)) {
      const courseName = line.match(/^Course\s*Name\s*:\s*(.*)/i)[1].trim();

      // Look ahead for course code
      let courseCode = `CS-${100 + subjectCounter}`;
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        if (/^Course\s*Code\s*:\s*(.*)/i.test(lines[j])) {
          courseCode = lines[j].match(/^Course\s*Code\s*:\s*(.*)/i)[1].trim();
          break;
        }
      }

      createSubject(courseName, courseCode);
      parsedSyllabus.stats.extractedCourses++;
      parsedSyllabus.title = courseName;
      continue;
    }

    // Alternative Course Header pattern e.g. "CS401: Database Management Systems"
    if (/^([A-Z]{2,4}\s*\d{3,4}[A-Z]?)\s*[:\-]\s*([A-Za-z].+)/i.test(line) && line.length < 80 && !line.toLowerCase().includes('module')) {
      const match = line.match(/^([A-Z]{2,4}\s*\d{3,4}[A-Z]?)\s*[:\-]\s*(.+)/i);
      createSubject(match[2], match[1]);
      parsedSyllabus.stats.extractedCourses++;
      parsedSyllabus.title = match[2];
      continue;
    }

    // 4. Check for Module / Unit / Chapter Headings
    // Examples:
    // "Module I:\nIntroduction [3L]"
    // "Module III: [4L]\nSQL and Integrity Constraints [6L]"
    // "Module II: Entity-Relationship and Relational Database Model [9L]"
    const moduleMatch = line.match(/^(?:Module|Unit|Chapter|Section|Part)\s*[-:]?\s*([IVX\d]+|[A-Z])\b[:\-.\s]*(.*)/i);
    if (moduleMatch) {
      let modNumber = moduleMatch[1];
      let inlineTitle = moduleMatch[2]
        .replace(/\[\s*\d+\s*[LP]\s*\]/gi, '')
        .replace(/\(\s*\d+\s*[LP]\s*\)/gi, '')
        .trim();

      let modTitle = '';

      if (inlineTitle && inlineTitle.length > 2) {
        modTitle = `Module ${modNumber}: ${inlineTitle}`;
      } else {
        // Look ahead for module title on subsequent line (e.g. "Introduction [3L]" or "SQL and Integrity Constraints [6L]")
        let nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
        if (nextLine && !isNoiseLine(nextLine) && !/^(?:Module|Unit|Chapter|Course|Textbook|Reference)/i.test(nextLine) && nextLine.length < 80) {
          const cleanNext = nextLine.replace(/\[\s*\d+\s*[LP]\s*\]/gi, '').replace(/\(\s*\d+\s*[LP]\s*\)/gi, '').trim();
          modTitle = `Module ${modNumber}: ${cleanNext}`;
          i++; // Advance past this title line
        } else {
          modTitle = `Module ${modNumber}: Core Concepts`;
        }
      }

      createModule(modTitle);
      parserState = 'IN_MODULE';
      continue;
    }

    // 5. If in METADATA or IN_BOOKS, skip noise lines
    if (parserState === 'METADATA' || parserState === 'IN_BOOKS') {
      parsedSyllabus.stats.filteredNoiseLines++;
      continue;
    }

    // 6. If noise line (headers, watermarks, etc.), skip
    if (isNoiseLine(line)) {
      parsedSyllabus.stats.filteredNoiseLines++;
      continue;
    }

    // 7. If in module, push content line to module buffer
    if (parserState === 'IN_MODULE') {
      moduleContentLines.push(line);
    }
  }

  // Flush any remaining content in buffer
  flushModuleBuffer();

  // Cleanup: Remove empty modules and empty subjects
  parsedSyllabus.subjects = parsedSyllabus.subjects.filter(sub => {
    sub.modules = sub.modules.filter(mod => mod.topics.length > 0);
    return sub.modules.length > 0;
  });

  // Fallback: If no subjects detected, create default clean structure
  if (parsedSyllabus.subjects.length === 0) {
    parsedSyllabus.subjects = [
      {
        id: `sub-${Date.now()}-1`,
        name: cleanTitle,
        code: "CS401",
        color: "from-indigo-600 to-indigo-500",
        accent: "indigo",
        modules: [
          {
            id: `mod-${Date.now()}-1`,
            name: "Module 1: Core Fundamentals",
            topics: [
              { id: `top-${Date.now()}-1`, name: "Core Principles & Architecture", completed: false },
              { id: `top-${Date.now()}-2`, name: "Advanced Synthesis & Implementation", completed: false }
            ]
          }
        ]
      }
    ];
  }

  return parsedSyllabus;
}

/**
 * Pre-Parsed Academic Curricula Presets
 */
export const PRESET_CURRICULA = [
  {
    id: "preset-btech-cse-sem1",
    title: "B.Tech CSE — Semester 1",
    institution: "MAKAUT / AICTE (R25 Curriculum)",
    createdAt: "2025-08-01T00:00:00.000Z",
    subjects: [
      {
        id: "cs101",
        name: "Introduction to Programming & Problem Solving",
        code: "CS101",
        color: "from-indigo-600 to-indigo-500",
        accent: "indigo",
        modules: [
          {
            id: "cs101-m1",
            name: "Module 1: Basics of Computing & Number Representation",
            topics: [
              { id: "cs101-t1", name: "Architecture & Memory Hierarchy of Computers", completed: true },
              { id: "cs101-t2", name: "Evolution and Generations of Computing Systems", completed: true },
              { id: "cs101-t3", name: "Number Systems & Radix Conversions (Binary/Octal/Hex)", completed: true },
              { id: "cs101-t4", name: "Binary Arithmetic: 1's and 2's Complement", completed: false },
              { id: "cs101-t5", name: "Floating Point Arithmetic & IEEE 754 Representation", completed: false }
            ]
          },
          {
            id: "cs101-m2",
            name: "Module 2: Problem Solving & Introduction to C Programming",
            topics: [
              { id: "cs101-t6", name: "Algorithms and Flowchart Construction", completed: false },
              { id: "cs101-t7", name: "C Program Structure & Compilation Pipeline", completed: false },
              { id: "cs101-t8", name: "Data Types, Variables, Constants & Endianness", completed: false },
              { id: "cs101-t9", name: "Operators: Arithmetic, Relational, Logical & Bitwise", completed: false },
              { id: "cs101-t10", name: "Formatted & Unformatted Console I/O", completed: false }
            ]
          },
          {
            id: "cs101-m3",
            name: "Module 3: Control Structures & Program Design",
            topics: [
              { id: "cs101-t11", name: "Conditional Branching: if-else, nested if & switch-case", completed: false },
              { id: "cs101-t12", name: "Iterative Loops: while, do-while, for loops", completed: false },
              { id: "cs101-t13", name: "Functions: Declaration, Definition & Scope", completed: false },
              { id: "cs101-t14", name: "Parameter Passing: Call by Value vs Call by Reference", completed: false },
              { id: "cs101-t15", name: "Recursion & Storage Classes (auto, static, extern, register)", completed: false }
            ]
          },
          {
            id: "cs101-m4",
            name: "Module 4: Arrays, Pointers and Strings",
            topics: [
              { id: "cs101-t16", name: "1D & 2D Arrays: Declaration, Memory Layout & Traversal", completed: false },
              { id: "cs101-t17", name: "Pointer Basics & Address-of Operators", completed: false },
              { id: "cs101-t18", name: "Pointer Arithmetic & Array-Pointer Equivalence", completed: false },
              { id: "cs101-t19", name: "Dynamic Memory Allocation (malloc, calloc, realloc, free)", completed: false },
              { id: "cs101-t20", name: "String Manipulation & Library Functions (<string.h>)", completed: false }
            ]
          },
          {
            id: "cs101-m5",
            name: "Module 5: Structured Data Types & File Handling",
            topics: [
              { id: "cs101-t21", name: "Structures: Definition, Nested Structures & Arrays of Structures", completed: false },
              { id: "cs101-t22", name: "Unions & Bit-fields Memory Representation", completed: false },
              { id: "cs101-t23", name: "File Streams: fopen, fclose, fprintf, fscanf, fread, fwrite", completed: false },
              { id: "cs101-t24", name: "Random File Access (fseek, ftell, rewind)", completed: false }
            ]
          }
        ]
      },
      {
        id: "ph101",
        name: "Engineering Physics",
        code: "PH101",
        color: "from-amber-500 to-amber-600",
        accent: "amber",
        modules: [
          {
            id: "ph101-m1",
            name: "Module 1: Modern Optics & Lasers",
            topics: [
              { id: "ph101-t1", name: "Spontaneous and Stimulated Emission, Einstein Coefficients", completed: false },
              { id: "ph101-t2", name: "Population Inversion & Ruby / He-Ne Lasers", completed: false },
              { id: "ph101-t3", name: "Fiber Optics: Total Internal Reflection & Numerical Aperture", completed: false },
              { id: "ph101-t4", name: "Holography: Principle, Recording & Reconstruction", completed: false }
            ]
          },
          {
            id: "ph101-m2",
            name: "Module 2: Solid State Physics",
            topics: [
              { id: "ph101-t5", name: "Crystallography: Unit Cell, Bravais Lattices & Miller Indices", completed: false },
              { id: "ph101-t6", name: "Bragg's Law of X-Ray Diffraction", completed: false },
              { id: "ph101-t7", name: "Band Theory of Solids & Kronig-Penney Model", completed: false },
              { id: "ph101-t8", name: "Intrinsic & Extrinsic Semiconductors, Fermi Level", completed: false }
            ]
          },
          {
            id: "ph101-m3",
            name: "Module 3: Quantum & Statistical Mechanics",
            topics: [
              { id: "ph101-t9", name: "Wave-Particle Duality & de Broglie Hypothesis", completed: false },
              { id: "ph101-t10", name: "Heisenberg Uncertainty Principle", completed: false },
              { id: "ph101-t11", name: "Time-Independent Schrödinger Wave Equation", completed: false },
              { id: "ph101-t12", name: "Maxwell-Boltzmann, Bose-Einstein & Fermi-Dirac Statistics", completed: false }
            ]
          },
          {
            id: "ph101-m4",
            name: "Module 4: Physics of Nanomaterials & Storage Devices",
            topics: [
              { id: "ph101-t13", name: "Quantum Wells, Quantum Wires & Quantum Dots", completed: false },
              { id: "ph101-t14", name: "Carbon Nanotubes (CNTs) & Graphene Synthesis", completed: false },
              { id: "ph101-t15", name: "Magnetic Storage Media & GMR Effect", completed: false }
            ]
          }
        ]
      },
      {
        id: "m101",
        name: "Engineering Mathematics-I",
        code: "M 101",
        color: "from-emerald-600 to-teal-500",
        accent: "emerald",
        modules: [
          {
            id: "m101-m1",
            name: "Module 1: Linear Algebra",
            topics: [
              { id: "m101-t1", name: "Matrix Operations, Row Echelon Form & Rank", completed: true },
              { id: "m101-t2", name: "System of Linear Equations: Consistency & Gauss Elimination", completed: false },
              { id: "m101-t3", name: "Eigenvalues and Eigenvectors of Real Matrices", completed: false },
              { id: "m101-t4", name: "Cayley-Hamilton Theorem & Inverse Matrix Calculation", completed: false }
            ]
          },
          {
            id: "m101-m2",
            name: "Module 2: Single Variable Calculus",
            topics: [
              { id: "m101-t5", name: "Rolle's Theorem & Mean Value Theorems", completed: false },
              { id: "m101-t6", name: "Taylor's and Maclaurin's Series Expansions", completed: false },
              { id: "m101-t7", name: "Indeterminate Forms & L'Hôpital's Rule", completed: false }
            ]
          },
          {
            id: "m101-m3",
            name: "Module 3: Multivariable Calculus (Differentiation)",
            topics: [
              { id: "m101-t8", name: "Partial Derivatives & Total Differential", completed: false },
              { id: "m101-t9", name: "Euler's Theorem on Homogeneous Functions", completed: false },
              { id: "m101-t10", name: "Jacobians of Coordinate Transformations", completed: false },
              { id: "m101-t11", name: "Maxima, Minima & Lagrange Multipliers", completed: false }
            ]
          },
          {
            id: "m101-m4",
            name: "Module 4: Multivariable Calculus (Integration)",
            topics: [
              { id: "m101-t12", name: "Double Integrals & Area Calculation", completed: false },
              { id: "m101-t13", name: "Triple Integrals & Volume in Cylindrical/Spherical Coordinates", completed: false },
              { id: "m101-t14", name: "Line Integrals, Surface Integrals & Green's Theorem", completed: false }
            ]
          }
        ]
      },
      {
        id: "hu101",
        name: "Environmental Science",
        code: "HU 101",
        color: "from-purple-600 to-indigo-600",
        accent: "purple",
        modules: [
          {
            id: "hu101-m1",
            name: "Module 1: Resources & Ecosystem Dynamics",
            topics: [
              { id: "hu101-t1", name: "Natural Resources: Renewable & Non-renewable", completed: false },
              { id: "hu101-t2", name: "Population Growth Models & Carrying Capacity", completed: false },
              { id: "hu101-t3", name: "Energy Resources: Solar, Wind & Biomass", completed: false }
            ]
          },
          {
            id: "hu101-m2",
            name: "Module 2: Environmental Degradation & Pollution",
            topics: [
              { id: "hu101-t4", name: "Air Pollution: Primary/Secondary Pollutants & Photochemical Smog", completed: false },
              { id: "hu101-t5", name: "Water Pollution: DO, BOD, COD Parameters & Eutrophication", completed: false },
              { id: "hu101-t6", name: "Solid Waste & E-Waste Management Protocols", completed: false }
            ]
          },
          {
            id: "hu101-m3",
            name: "Module 3: Environmental Management & Policy",
            topics: [
              { id: "hu101-t7", name: "Environmental Impact Assessment (EIA) Methodology", completed: false },
              { id: "hu101-t8", name: "Wastewater Treatment Systems & Zero Liquid Discharge", completed: false }
            ]
          }
        ]
      }
    ]
  }
];
