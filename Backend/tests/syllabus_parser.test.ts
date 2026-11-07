import { describe, it, expect } from 'vitest';
import { parseAcademicSyllabus } from '../convex/lib/syllabusParser/index';

const SAMPLE_R25_MULTI_COURSE_SYLLABUS = `
MAULANA ABUL KALAM AZAD UNIVERSITY OF TECHNOLOGY, WEST BENGAL
ROUTINE / CURRICULUM FOR B.TECH FIRST YEAR (R25 CSE)
Page 1 of 42
---------------------------------------------------------------------------------

Course Name: Introduction to Programming and Problem Solving
Course Code: CS101
Contact Hours (L:T:P): 3:0:0
Total Contact Hours: 36L
Credits: 3
Prerequisites: Basic knowledge of mathematics and computers

Course Objectives:
1. To introduce the foundational concepts of programming using C.
2. To understand structured programming constructs.

Course Outcomes:
At the end of the course students will be able to:
CO1: Understand the basics of computer architecture and number systems.
CO2: Formulate algorithms and flowcharts for computational problems.
CO3: Implement structured programming in C with functions and recursion.
CO4: Use pointers and dynamic memory allocation.

CO-PO Mapping:
CO1 -> PO1, PO2
CO2 -> PO1, PO3

Course Content:

Module 1: Basics of Computing & Number Representation (7L)
- History and generations of computers
- Classification of computers
- Computer architecture: CPU, Memory, I/O devices
- Number systems: Binary, Octal, Decimal, Hexadecimal, 1's and 2's complements

Module 2: Algorithms, Flowcharts and Basic C Constructs (8L)
- Problem solving concepts: Algorithms, Pseudo-code, Flowcharts
- Overview of C: Constants, Variables, Operators, Expressions
- Input and Output functions: printf, scanf, getchar

Module 3: Control Statements and Functions (9L)
- Branching: if, if-else, switch-case
- Looping: for, while, do-while, break, continue
- Functions: Declaration, Definition, Call by value, Call by reference, Recursion

Module 4: Arrays, Pointers, and Structures (12L)
Arrays: 1D and 2D arrays, String handling functions.
Pointers: Pointer declaration, Arithmetic, Dynamic memory allocation.
Structures and Unions: Definition, Declaration, Nested structures.

Textbooks:
1. Reema Thareja, "Computer Fundamentals and Programming in C", Oxford University Press.
2. E. Balagurusamy, "Programming in ANSI C", Tata McGraw-Hill.

Reference Books:
1. Brian W. Kernighan and Dennis M. Ritchie, "The C Programming Language", Prentice Hall.

---------------------------------------------------------------------------------
Course Name: Engineering Physics
Course Code: PH101
Contact Hours (L:T:P): 3:0:0
Total Contact Hours: 36L
Credits: 3

Course Objectives:
To provide comprehensive understanding of physics principles for engineers.

Course Outcomes:
CO1: Apply wave optics principles in engineering.
CO2: Understand quantum mechanics and laser operations.

Course Content:

Module 1: Physical Optics (8L)
- Interference: Young's double slit experiment, Newton's rings
- Diffraction: Fraunhofer diffraction, Diffraction grating
- Polarization: Brewster's law, Double refraction

Module 2: Quantum Mechanics (10L)
- Wave-particle duality, De Broglie hypothesis, Uncertainty principle
- Schrodinger wave equation: Time-dependent and time-independent

Module 3: Lasers and Fiber Optics (9L)
1.01 Laser (6L):
Concepts of various emission and absorption processes, Einstein A and B coefficients, working principle of laser, metastable state, population inversion.
1.02 Fiber Optics (3L):
Principle of optical fiber, Acceptance angle, Numerical aperture.

Module 4: Solid State Physics (9L)
- Crystallography: Lattice, Unit cell, Miller indices
- Band theory of solids: Conductors, Semiconductors, Insulators

Textbooks:
1. David Halliday, Robert Resnick, "Principles of Physics", Wiley.
Reference Books:
1. A. Beiser, "Concepts of Modern Physics", McGraw-Hill.

---------------------------------------------------------------------------------
Course Name: Engineering Mathematics-I
Course Code: M101
Contact Hours (L:T:P): 3:1:0
Total Contact Hours: 40L
Credits: 4

Course Content:
Module 1: Calculus (10L)
- Rolle's Theorem, Mean Value Theorem, Taylor's and Maclaurin's series
- Indeterminate forms and L'Hospital's rule

Module 2: Matrices and Linear Algebra (12L)
- Matrix operations, Rank of a matrix, Consistency of linear systems
- Eigenvalues and Eigenvectors, Cayley-Hamilton theorem

Module 3: Vector Calculus (10L)
- Gradient, Divergence, Curl
- Gauss divergence theorem, Green's theorem, Stokes' theorem

Module 4: Differential Equations (8L)
- First order linear equations, Exact differential equations
- Higher order linear equations with constant coefficients

---------------------------------------------------------------------------------
Course Name: Environmental Science
Course Code: HU101
Contact Hours: 2:0:0
Credits: 2

Course Content:
Module 1: Ecology and Ecosystems (6L)
- Concept of ecosystem, Structure and function, Food chains and food webs

Module 2: Environmental Pollution (8L)
- Air pollution, Water pollution, Soil pollution, Noise pollution

Module 3: Natural Resources and Sustainability (6L)
- Renewable and non-renewable energy resources, Sustainable development

---------------------------------------------------------------------------------
Course Name: Indian Knowledge System
Course Code: HU102
Contact Hours: 2:0:0
Credits: 2

Course Content:
Module 1: Overview of Indian Knowledge Traditions (6L)
- Vedic literature, Ancient educational systems, Gurukul philosophy

Module 2: Science and Technology in Ancient India (8L)
- Mathematics and astronomy: Aryabhata, Brahmagupta, Bhaskara
- Metallurgy and civil engineering traditions

---------------------------------------------------------------------------------
Course Name: Introduction to Programming and Problem Solving Lab
Course Code: CS191
Contact Hours: 0:0:3
Credits: 1.5

List of Experiments:
1. Familiarization with C programming environment and basic I/O programs.
2. Programs using conditional control statements (if, if-else, switch).
3. Programs using iterative control statements (for, while, do-while).
4. Programs using one-dimensional and two-dimensional arrays.
5. Programs using functions and recursion.
6. Programs using pointers and dynamic memory allocation.
7. Programs using structures and unions.
8. Programs on file handling.

---------------------------------------------------------------------------------
Course Name: Engineering Physics Lab
Course Code: PH191
Contact Hours: 0:0:3
Credits: 1.5

List of Experiments:
1. Determination of wavelength of light by Newton's ring method.
2. Determination of grating element of diffraction grating using spectrometer.
3. Determination of numerical aperture of optical fiber.
4. Measurement of Planck's constant using photoelectric effect.
5. Hall Effect measurement in semiconductor.

---------------------------------------------------------------------------------
Course Name: Engineering Graphics & Computer Aided Design Lab
Course Code: ME194
Contact Hours: 1:0:4
Credits: 3

Basic Engineering Graphics
1. Introduction to Engineering Graphics and Drawing Instruments.
2. Orthographic Projections of Points, Lines, and Planes.
3. Projections of Regular Solids (Prisms, Pyramids, Cylinders, Cones).
4. Isometric Projections and Isometric Views.

Computer Graphics
5. Computer Aided Drafting (CAD) tools and 2D modeling exercises.

---------------------------------------------------------------------------------
Course Name: Communication and Presentation Skill
Course Code: HU191
Contact Hours (L:T:P): 0:0:3
Total Contact Hours: 36
Credits: 1.5

Course Content
Module 1: Introduction Theories of Communication and Soft Skills
benefits and application
b. Introduction to Workplace Communication (Principles and Practice)
c. Non-Verbal communication and its application

Module 2: Active Listening
What is Active Listening? Its significance
Listening barriers
Clarifying
Inferencing
Evaluating
Note-taking

Module 3: Speaking Skills
Differences between reading and speaking skill
c. Differences between hearing and listening

Module 4: Writing and Reading Comprehension
Writing skills - Introduction
Reading comprehension techniques

Module 5: Presentation Skills
Elements of effective presentation
Practice with feedback

Text Books:
1. J. Dan Rothman, "Presentation Skills", Cengage Learning, 2nd Edition, 2015.
2. Raman Sharma, "Technical Communication", Oxford University Press, 2nd Edition, 2016.
3. Lesikar and Petit, "Business Communication", Tata McGraw-Hill, 10th Edition, 2007.
4. Madhukar Gogate, "Effective Presentation Skills", Nirali Prakashan, 2010.
5. Sethi & King, "Organisational Behaviour", Tata McGraw-Hill, 2010.

Reference Books:
1. R. L. Birdwhistell, "Introduction to Kinesics", University of Louisville Press, 1952.
2. E. Hall, "The Silent Language", Doubleday, New York, 1959.
3. L. P. Hartley, "The Go Between", Heinemann, London, 1953.
4. R. Quirk, "The Use of English", Longman, London, 1962.
5. S. P. Dhir, "Communication in Business", Jaico Publication, 2000.
6. T. Bhardwaj & M. Bhardwaj, "Communicative Skills", Regal Publ., 2004.
7. G. Desai, "Organisational Behaviour", Himalaya Publishing House, 2003.
8. Lesikar and Petit, "Business Communication", Tata McGraw-Hill, 10th Edition, 2007.
`;

describe('Academic Syllabus Extraction Engine', () => {
  it('detects all 9 courses from the R25 B.Tech CSE syllabus document', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS, 'R25 B.Tech CSE Curriculum');

    expect(result.courses).toHaveLength(9);

    const detectedCodes = result.courses.map((c) => c.code);
    expect(detectedCodes).toEqual([
      'CS101',
      'PH101',
      'M101',
      'HU101',
      'HU102',
      'CS191',
      'PH191',
      'ME194',
      'HU191',
    ]);

    const detectedNames = result.courses.map((c) => c.name);
    expect(detectedNames[0]).toContain('Introduction to Programming and Problem Solving');
    expect(detectedNames[1]).toContain('Engineering Physics');
    expect(detectedNames[2]).toContain('Engineering Mathematics');
    expect(detectedNames[3]).toContain('Environmental Science');
    expect(detectedNames[4]).toContain('Indian Knowledge System');
    expect(detectedNames[5]).toContain('Introduction to Programming and Problem Solving Lab');
    expect(detectedNames[6]).toContain('Engineering Physics Lab');
    expect(detectedNames[7]).toContain('Engineering Graphics & Computer Aided Design Lab');
    expect(detectedNames[8]).toContain('Communication and Presentation Skill');
  });

  it('separates administrative information and course metadata from study tree nodes', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    const cs101 = result.courses.find((c) => c.code === 'CS101')!;

    // Metadata is extracted cleanly
    expect(cs101.metadata.code).toBe('CS101');
    expect(cs101.metadata.credits).toBe('3');
    expect(cs101.metadata.contactHours).toBe('3:0:0');
    expect(cs101.metadata.totalContactHours).toBe('36L');
    expect(cs101.metadata.prerequisites).toContain('Basic knowledge of mathematics');

    // Objectives and outcomes are separated
    expect(cs101.metadata.courseObjectives?.length).toBeGreaterThanOrEqual(1);
    expect(cs101.metadata.courseOutcomes?.length).toBeGreaterThanOrEqual(2);
    expect(cs101.metadata.textbooks?.length).toBeGreaterThanOrEqual(2);
    expect(cs101.metadata.referenceBooks?.length).toBeGreaterThanOrEqual(1);

    // Tree does NOT contain metadata as study nodes
    const allNodeNames = cs101.tree.flatMap((ch) => [ch.name, ...ch.children.map((t) => t.name)]);
    for (const name of allNodeNames) {
      expect(name).not.toMatch(/credits/i);
      expect(name).not.toMatch(/contact hours/i);
      expect(name).not.toMatch(/prerequisites/i);
      expect(name).not.toMatch(/course outcomes/i);
      expect(name).not.toMatch(/co-po mapping/i);
      expect(name).not.toMatch(/textbooks/i);
      expect(name).not.toMatch(/page \d+/i);
    }
  });

  it('correctly builds module and topic hierarchies with clean names', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    const cs101 = result.courses.find((c) => c.code === 'CS101')!;

    // Has 4 modules
    expect(cs101.tree).toHaveLength(4);
    expect(cs101.tree[0].name).toBe('Module 1: Basics of Computing & Number Representation');
    expect(cs101.tree[1].name).toBe('Module 2: Algorithms, Flowcharts and Basic C Constructs');

    // Module 1 topics
    const m1Topics = cs101.tree[0].children.map((n) => n.name);
    expect(m1Topics).toContain('History and generations of computers');
    expect(m1Topics).toContain('Classification of computers');
    expect(m1Topics).toContain('Computer architecture');

    const compArchTopic = cs101.tree[0].children.find((n) => n.name === 'Computer architecture')!;
    expect(compArchTopic).toBeDefined();
    expect(compArchTopic.children.length).toBeGreaterThanOrEqual(1);
  });

  it('handles numbered subtopics and colon-separated concepts like 1.01 Laser (6L)', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    const ph101 = result.courses.find((c) => c.code === 'PH101')!;

    const laserModule = ph101.tree.find((ch) => ch.name.includes('Lasers and Fiber Optics'))!;
    expect(laserModule).toBeDefined();

    const laserTopic = laserModule.children.find((t) => t.name.includes('Laser'))!;
    expect(laserTopic).toBeDefined();
    // Lecture hours (6L) stripped from name
    expect(laserTopic.name).not.toContain('(6L)');

    // Concept list after colon became subtopics
    const subtopics = laserTopic.children.map((s) => s.name);
    expect(subtopics.some((s) => s.includes('emission and absorption'))).toBe(true);
    expect(subtopics.some((s) => s.includes('Einstein A and B coefficients'))).toBe(true);
    expect(subtopics.some((s) => s.includes('population inversion'))).toBe(true);
  });

  it('identifies practical/laboratory courses and extracts experiments', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    const cs191 = result.courses.find((c) => c.code === 'CS191')!;

    expect(cs191.isLab).toBe(true);
    expect(cs191.tree.length).toBeGreaterThanOrEqual(1);

    const experiments = cs191.tree[0].children.map((n) => n.name);
    expect(experiments.length).toBe(8);
    expect(experiments[0]).toContain('Familiarization with C programming environment');
    expect(experiments[7]).toContain('Programs on file handling');
  });

  it('handles single course document cleanly without false course boundaries', () => {
    const singleCourse = `
Course Name: Data Structures and Algorithms
Course Code: CS201
Credits: 4

Course Content:
Module 1: Linear Data Structures
- Arrays and Linked Lists
- Stacks and Queues

Module 2: Trees and Graphs
- Binary Search Trees
- Graph Traversals (BFS and DFS)
`;
    const result = parseAcademicSyllabus(singleCourse, 'Data Structures');
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].code).toBe('CS201');
    expect(result.courses[0].name).toBe('Data Structures and Algorithms');
    expect(result.courses[0].tree).toHaveLength(2);
  });

  it('handles syllabuses with Chapter/Unit terminology and nested numbering (1.1, 1.1.1)', () => {
    const chapterSyllabus = `
Course Name: Discrete Mathematics
Course Code: MATH202
Credits: 3

Unit I: Set Theory and Relations
1.1 Sets and Subsets
1.1.1 Operations on Sets
1.1.2 Venn Diagrams
1.2 Relations and Functions
1.2.1 Equivalence Relations

Unit II: Graph Theory
2.1 Basic Definitions
2.2 Paths and Circuits
`;
    const result = parseAcademicSyllabus(chapterSyllabus);
    expect(result.courses).toHaveLength(1);
    const course = result.courses[0];
    expect(course.tree).toHaveLength(2);
    expect(course.tree[0].name).toContain('Unit I');
    expect(course.tree[1].name).toContain('Unit II');

    const unit1Topics = course.tree[0].children;
    expect(unit1Topics.length).toBeGreaterThanOrEqual(2);
  });

  it('handles bullet-only syllabus structure gracefully', () => {
    const bulletOnlySyllabus = `
Course Name: Python for Beginners
Credits: 2

- Python Basics: Variables, Data types, Basic operators
- Control Structures: If statements, While loops, For loops
- Data Structures: Lists, Dictionaries, Sets, Tuples
- Functions: Defining functions, Return values, Lambda expressions
`;
    const result = parseAcademicSyllabus(bulletOnlySyllabus);
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].tree.length).toBeGreaterThanOrEqual(1);
  });

  it('distinguishes theory courses from corresponding laboratory courses with similar names', () => {
    const pairedSyllabus = `
Course Name: Advanced Database Systems
Course Code: CS501
Credits: 3

Course Content:
Module 1: Distributed Databases
- Data fragmentation and replication

Course Name: Advanced Database Systems Lab
Course Code: CS591
Credits: 1.5

List of Experiments:
1. Implementation of two-phase commit protocol.
2. Distributed query processing using PostgreSQL.
`;
    const result = parseAcademicSyllabus(pairedSyllabus);
    expect(result.courses).toHaveLength(2);
    expect(result.courses[0].code).toBe('CS501');
    expect(result.courses[0].isLab).toBe(false);
    expect(result.courses[1].code).toBe('CS591');
    expect(result.courses[1].isLab).toBe(true);
  });

  it('safely handles empty or whitespace-only syllabus documents', () => {
    const result = parseAcademicSyllabus('   \n\n   \t  ');
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].name).toBe('Imported Syllabus');
  });

  it('HU191 critical regression: 5 modules, zero bibliography in tree, metadata preserved', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    const hu191 = result.courses.find((c) => c.code === 'HU191')!;
    expect(hu191).toBeDefined();

    // 5 modules
    expect(hu191.tree).toHaveLength(5);
    expect(hu191.tree[0].name).toContain('Module 1: Introduction Theories of Communication');
    expect(hu191.tree[1].name).toContain('Module 2: Active Listening');
    expect(hu191.tree[2].name).toContain('Module 3: Speaking Skills');
    expect(hu191.tree[3].name).toContain('Module 4: Writing and Reading Comprehension');
    expect(hu191.tree[4].name).toContain('Module 5: Presentation Skills');

    // Not classified as lab
    expect(hu191.isLab).toBe(false);

    // Metadata has 5 textbooks and 8 reference books
    expect(hu191.metadata.textbooks).toHaveLength(5);
    expect(hu191.metadata.referenceBooks).toHaveLength(8);
    expect(hu191.metadata.credits).toBe('1.5');
    expect(hu191.metadata.totalContactHours).toBe('36');

    // Study tree has ZERO bibliography entries, author names, publishers, or years
    const allNames = hu191.tree.flatMap((ch) => [ch.name, ...ch.children.map((t) => t.name)]);
    for (const name of allNames) {
      expect(name).not.toMatch(/Rothman/i);
      expect(name).not.toMatch(/Cengage/i);
      expect(name).not.toMatch(/Oxford/i);
      expect(name).not.toMatch(/McGraw/i);
      expect(name).not.toMatch(/Birdwhistell/i);
      expect(name).not.toMatch(/Kinesics/i);
      expect(name).not.toMatch(/Doubleday/i);
      expect(name).not.toMatch(/Heinemann/i);
      expect(name).not.toMatch(/Longman/i);
      expect(name).not.toMatch(/\b19[0-9]{2}\b/);
      expect(name).not.toMatch(/\b20[0-9]{2}\b/);
      expect(name).not.toMatch(/textbooks?/i);
      expect(name).not.toMatch(/reference\s*books?/i);
    }
  });

  it('Engineering Graphics (ME194) retains Basic Engineering Graphics and Computer Graphics groupings', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    const me194 = result.courses.find((c) => c.code === 'ME194')!;
    expect(me194).toBeDefined();
    expect(me194.isLab).toBe(true);

    // Groupings preserved
    const groupNames = me194.tree.map((ch) => ch.name);
    expect(groupNames.some((n) => n.includes('Basic Engineering Graphics'))).toBe(true);
    expect(groupNames.some((n) => n.includes('Computer Graphics'))).toBe(true);
  });

  it('Engineering Mathematics-I (M101) preserves 4 modules', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    const m101 = result.courses.find((c) => c.code === 'M101')!;
    expect(m101).toBeDefined();
    expect(m101.tree).toHaveLength(4);
    expect(m101.tree[0].name).toContain('Calculus');
    expect(m101.tree[1].name).toContain('Matrices and Linear Algebra');
    expect(m101.tree[2].name).toContain('Vector Calculus');
    expect(m101.tree[3].name).toContain('Differential Equations');
  });

  it('all 9 courses satisfy strict validation: zero metadata or bibliography in study trees', () => {
    const result = parseAcademicSyllabus(SAMPLE_R25_MULTI_COURSE_SYLLABUS);
    expect(result.courses).toHaveLength(9);

    for (const course of result.courses) {
      const allNames = course.tree.flatMap((ch) => [ch.name, ...ch.children.map((t) => t.name)]);
      for (const name of allNames) {
        // No bibliography headings in tree
        expect(name).not.toMatch(/^text\s*books?/i);
        expect(name).not.toMatch(/^reference\s*books?/i);
        // No metadata in tree
        expect(name).not.toMatch(/^credits?\s*[:=]/i);
        expect(name).not.toMatch(/^contact\s+hours/i);
        expect(name).not.toMatch(/^total\s+contact/i);
        expect(name).not.toMatch(/^co\s*[-–]\s*po/i);
        expect(name).not.toMatch(/^course\s+outcomes?/i);
        expect(name).not.toMatch(/^course\s+objectives?/i);
        // No empty nodes
        expect(name.trim().length).toBeGreaterThan(1);
      }
    }
  });
});
