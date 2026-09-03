import { parseSyllabusText } from '../src/utils/syllabusParser.js';

const sampleText = `Course Name: Database Management Systems
Course Code: CS401
Contact (Periods/Week): 3:0:0
Credit Point: 3
No. of Lectures: 36

Prerequisites:
1. Logic of programming language
2. Basic concepts of data structure and algorithms
Course Objective(s):
• To learn the data models, conceptualize and depict a database system
• To design system using E-R diagram.
• To learn SQL & relational database design.
• To understand the internal storage structures using different file and indexing
techniques.
• To know the concepts of transaction processing, concurrency control techniques and
recovery procedure.

Course Outcome(s):
After completion of the course students will be able to
CO1: To express the knowledge of data models
CO2: To implement the concept of designing an efficient relational database system CO3:
To correlate real world queries with database system.
CO4: To illustrate transaction processing, concurrency control and recovery management of a
database.
CO5: To assess the internal storage structure to implement a proper database for an organization.
Course Content:
Module I:
Introduction [3L]
Concept & Overview of DBMS, Data Models, Database Languages, Database Administrator,
Database Users, Three Schema architecture of DBMS.
R25 (B. Tech CSE)
Department: Computer Science & Engineering Curriculum
Structure & Syllabus
(Effective from 2025-26 admission batch)

Module II:
Entity-Relationship and Relational Database Model [9L]
Basic concepts, Design Issues, Mapping Constraints, Keys, Entity-Relationship Diagram,
Weak Entity Sets, Extended E-R features, case study on E-R Model. Structure of relational
Databases, Relational Algebra, Relational Calculus, Extended Relational Algebra Operations,
Views, Modifications of the Database.
Module III: [4L]
SQL and Integrity Constraints [6L]
Concept of DDL, DML, DCL. Basic Structure, set operations, Aggregate Functions, Null
Values, Domain Constraints, Referential Integrity Constraints, assertions, views, Nested
Subqueries, Database security application development using SQL, Stored procedures and
triggers

Module IV:
Relational Database Design [6L]
Functional Dependency, Different anomalies in designing a Database., Normalization using
functional dependencies, Decomposition, Boyce-Codd Normal Form, 3NF, Normalization
using multi-valued dependencies, 4NF, 5NF, Case Study

Module V:
Internals of RDBMS [6L]
Physical data structures, Query optimization: join algorithm, statistics and cost bas
optimization. Transaction processing, Concurrency control and Recovery Management:
transaction model properties, state serializability, lock base protocols; two phase locking, Dead
Lock handling

Module VI:
File Organization & Index Structures [6L]
File & Record Concept, placing file records on Disk, Fixed and Variable sized Records, Types
of Single-Level Index (primary, secondary, clustering), Multilevel Indexes

Text book:
1. Henry F. Korth and Silberschatz Abraham, “Database System Concepts”, McGraw Hill.

2.Elmasri Ramez and Navathe Shamkant, “Fundamentals of Database Systems”, Benjamin
Cummings Publishing Company.

Reference book:
1. Jain: Advanced Database Management System Cyber Tech`;

const result = parseSyllabusText(sampleText, "Pasted Curriculum");
console.log("=== PARSED RESULT ===");
console.log("Title:", result.title);
console.log("Subjects count:", result.subjects.length);
result.subjects.forEach(sub => {
  console.log(`\nSubject: [${sub.code}] ${sub.name}`);
  sub.modules.forEach(mod => {
    console.log(`  Module: ${mod.name} (${mod.topics.length} topics)`);
    mod.topics.forEach(t => console.log(`    - ${t.name}`));
  });
});
