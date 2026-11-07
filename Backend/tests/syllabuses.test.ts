import { describe, it, expect, beforeEach } from "vitest";
import { MockConvexDatabase } from "./harness";
import * as syllabuses from "../convex/syllabuses";
import * as nodes from "../convex/nodes";
import * as notes from "../convex/notes";
import * as materials from "../convex/materials";

describe("Syllabuses CRUD, Duplication & Isolation", () => {
  let db: MockConvexDatabase;
  const userA = { subject: "user_a", email: "alice@example.com" };
  const userB = { subject: "user_b", email: "bob@example.com" };

  beforeEach(() => {
    db = new MockConvexDatabase();
  });

  it("enforces multi-user isolation on syllabus access and modification", async () => {
    const ctxA = db.createContext(userA);
    const ctxB = db.createContext(userB);

    // Alice creates a syllabus
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Alice Chemistry" });

    // Bob cannot read Alice's syllabus
    await expect(syllabuses.get._handler(ctxB, { syllabusId })).rejects.toThrow();

    // Bob cannot rename Alice's syllabus
    await expect(
      syllabuses.rename._handler(ctxB, { syllabusId, name: "Bob Stolen" })
    ).rejects.toThrow();

    // Bob cannot duplicate Alice's syllabus
    await expect(
      syllabuses.duplicate._handler(ctxB, { syllabusId, name: "Bob Copy" })
    ).rejects.toThrow();

    // Bob cannot delete Alice's syllabus
    await expect(
      syllabuses.deleteSyllabus._handler(ctxB, { syllabusId })
    ).rejects.toThrow();

    // Bob's syllabus list is empty
    const bList = await syllabuses.list._handler(ctxB, {});
    expect(bList).toHaveLength(0);

    // Alice's syllabus list has 1 item
    const aList = await syllabuses.list._handler(ctxA, {});
    expect(aList).toHaveLength(1);
    expect(aList[0].name).toBe("Alice Chemistry");
  });

  it("creates a syllabus with an initialTree (import flow)", async () => {
    const ctxA = db.createContext(userA);

    const initialTree = [
      {
        name: "Module 1: Foundations",
        type: "subject",
        children: [
          {
            name: "Topic 1.1: Basic Concepts",
            type: "topic",
            completed: true,
          },
          {
            name: "Topic 1.2: Advanced Concepts",
            type: "topic",
            completed: false,
          },
        ],
      },
    ];

    const syllabusId = await syllabuses.create._handler(ctxA, {
      name: "Imported Physics",
      source: "Physics_2026.pdf",
      initialTree,
    });

    const treeData = await syllabuses.getTree._handler(ctxA, { syllabusId });
    expect(treeData.syllabus.name).toBe("Imported Physics");
    expect(treeData.tree).toHaveLength(1);
    expect(treeData.tree[0].name).toBe("Module 1: Foundations");
    expect(treeData.tree[0].children).toHaveLength(2);
    // Derived progress: 1 of 2 leaves complete = 50%
    expect(treeData.totalLeaves).toBe(2);
    expect(treeData.completedLeaves).toBe(1);
    expect(treeData.percentComplete).toBe(50);
  });

  it("correctly duplicates an arbitrary-depth tree without parent-missing errors", async () => {
    const ctxA = db.createContext(userA);

    // Build a 4-level deep tree: Subject -> Chapter -> Topic -> Item
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Deep Math" });

    const subjectId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Calculus",
      type: "subject",
    });

    const chapterId = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: subjectId,
      name: "Differentiation",
      type: "chapter",
    });

    const topicId = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: chapterId,
      name: "Chain Rule",
      type: "topic",
    });

    const itemId = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: topicId,
      name: "Practice Problems",
      type: "item",
    });

    // Mark the leaf complete
    await nodes.toggleComplete._handler(ctxA, { nodeId: itemId });

    // Duplicate syllabus
    const copyId = await syllabuses.duplicate._handler(ctxA, {
      syllabusId,
      name: "Deep Math (Copy)",
    });

    expect(copyId).not.toBe(syllabusId);

    const copyTree = await syllabuses.getTree._handler(ctxA, { syllabusId: copyId });
    expect(copyTree.syllabus.name).toBe("Deep Math (Copy)");
    expect(copyTree.totalLeaves).toBe(1);
    expect(copyTree.completedLeaves).toBe(1);
    expect(copyTree.percentComplete).toBe(100);

    // Verify 4-level hierarchy structure in duplicated tree
    const root = copyTree.tree[0];
    expect(root.name).toBe("Calculus");
    expect(root.children[0].name).toBe("Differentiation");
    expect(root.children[0].children[0].name).toBe("Chain Rule");
    expect(root.children[0].children[0].children[0].name).toBe("Practice Problems");
    expect(root.children[0].children[0].children[0].completed).toBe(true);
  });

  it("cascading delete removes nodes, notes, materials, and storage files", async () => {
    const ctxA = db.createContext(userA);

    const syllabusId = await syllabuses.create._handler(ctxA, { name: "To Delete" });
    const nodeId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Sample Node",
      type: "subject",
    });

    // Add note to node
    await notes.save._handler(ctxA, { nodeId, content: "Test note content" });

    // Add material to node
    const { intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_mat_del_1";
    db.addStorageFile(storageId, { size: 1000, contentType: "application/pdf" });
    await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId,
      uploadIntentId: intentId,
      fileName: "test.pdf",
      fileSize: 1000,
      mimeType: "application/pdf",
    });

    expect(db.storage.has(storageId)).toBe(true);

    // Delete syllabus
    await syllabuses.deleteSyllabus._handler(ctxA, { syllabusId });

    // Verify syllabus gone
    await expect(syllabuses.get._handler(ctxA, { syllabusId })).rejects.toThrow();

    // Verify nodes gone
    const remainingNodes = await db.tables.get("syllabusNodes")?.size;
    expect(remainingNodes).toBe(0);

    // Verify notes gone
    const remainingNotes = await db.tables.get("nodeNotes")?.size;
    expect(remainingNotes).toBe(0);

    // Verify material record gone
    const remainingMaterials = await db.tables.get("materials")?.size;
    expect(remainingMaterials).toBe(0);

    // Verify storage file deleted
    expect(db.storage.has(storageId)).toBe(false);
  });
});

