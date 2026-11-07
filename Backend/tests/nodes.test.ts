import { describe, it, expect, beforeEach } from "vitest";
import { MockConvexDatabase } from "./harness";
import * as syllabuses from "../convex/syllabuses";
import * as nodes from "../convex/nodes";

describe("Node Tree Operations", () => {
  let db: MockConvexDatabase;
  const userA = { subject: "user_a", email: "alice@example.com" };
  const userB = { subject: "user_b", email: "bob@example.com" };

  beforeEach(() => {
    db = new MockConvexDatabase();
  });

  it("enforces cross-user node isolation", async () => {
    const ctxA = db.createContext(userA);
    const ctxB = db.createContext(userB);

    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Alice Syllabus" });
    const nodeId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Secret Chapter",
      type: "chapter",
    });

    // Bob cannot rename Alice's node
    await expect(nodes.rename._handler(ctxB, { nodeId, name: "Stolen" })).rejects.toThrow();

    // Bob cannot delete Alice's node
    await expect(nodes.deleteNode._handler(ctxB, { nodeId })).rejects.toThrow();

    // Bob cannot toggle Alice's node
    await expect(nodes.toggleComplete._handler(ctxB, { nodeId })).rejects.toThrow();
  });

  it("prevents non-leaf nodes from being marked complete", async () => {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Test Syllabus" });

    const parentId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Parent Node",
      type: "subject",
    });

    await nodes.create._handler(ctxA, {
      syllabusId,
      parentId,
      name: "Child Leaf",
      type: "topic",
    });

    await expect(nodes.toggleComplete._handler(ctxA, { nodeId: parentId })).rejects.toThrow(
      "Only leaf nodes can be completed."
    );
  });

  it("completes leaf node and verifies derived progress on parent", async () => {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Progress Test" });

    const subjectId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Subject",
      type: "subject",
    });

    const leaf1 = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: subjectId,
      name: "Leaf 1",
      type: "item",
    });

    const leaf2 = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: subjectId,
      name: "Leaf 2",
      type: "item",
    });

    // Complete one leaf
    await nodes.toggleComplete._handler(ctxA, { nodeId: leaf1 });

    const treeData = await syllabuses.getTree._handler(ctxA, { syllabusId });
    expect(treeData.totalLeaves).toBe(2);
    expect(treeData.completedLeaves).toBe(1);
    expect(treeData.percentComplete).toBe(50);
  });

  it("prevents circular tree moves", async () => {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Circular Test" });

    const parentId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Parent",
      type: "subject",
    });

    const childId = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId,
      name: "Child",
      type: "chapter",
    });

    // Attempting to move parent under its own child (circular)
    await expect(
      nodes.move._handler(ctxA, { nodeId: parentId, newParentId: childId })
    ).rejects.toThrow("Circular tree moves are not allowed.");
  });

  it("moves node to new parent and updates parent completion state", async () => {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Move Test" });

    const parent1 = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Parent 1",
      type: "subject",
    });

    const parent2 = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Parent 2",
      type: "subject",
    });

    const leafId = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: parent1,
      name: "Leaf Node",
      type: "item",
    });

    // Complete the leaf
    await nodes.toggleComplete._handler(ctxA, { nodeId: leafId });

    // Move leaf to parent2
    await nodes.move._handler(ctxA, { nodeId: leafId, newParentId: parent2 });

    const treeData = await syllabuses.getTree._handler(ctxA, { syllabusId });

    // Parent2 should now have the leaf
    const p2 = treeData.tree.find((n: any) => n._id === parent2);
    expect(p2?.children).toHaveLength(1);
    expect(p2?.children[0].name).toBe("Leaf Node");

    // Parent1 should be empty
    const p1 = treeData.tree.find((n: any) => n._id === parent1);
    expect(p1?.children).toHaveLength(0);
  });

  it("reorders siblings correctly", async () => {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Reorder Test" });

    const n1 = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "First",
      type: "subject",
    });
    const n2 = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Second",
      type: "subject",
    });
    const n3 = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Third",
      type: "subject",
    });

    // Move "Third" to position 0
    await nodes.reorder._handler(ctxA, { nodeId: n3, newIndex: 0 });

    const children = await nodes.getChildren._handler(ctxA, { syllabusId });
    expect(children.map((c: any) => c.name)).toEqual(["Third", "First", "Second"]);
  });

  it("cascades deletion to descendant subtree", async () => {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Delete Cascade" });

    const root = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Root Subject",
      type: "subject",
    });
    const child = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: root,
      name: "Child Chapter",
      type: "chapter",
    });
    const grandchild = await nodes.create._handler(ctxA, {
      syllabusId,
      parentId: child,
      name: "Grandchild Topic",
      type: "topic",
    });

    await nodes.deleteNode._handler(ctxA, { nodeId: root });

    // All nodes should be deleted
    expect(db.tables.get("syllabusNodes")!.size).toBe(0);
  });
});

