import { describe, expect, it } from "vitest";
import { assembleTree, progressOf } from "../convex/lib/tree";

describe("arbitrary-depth tree and leaf progress", () => {
  it("assembles deep descendants in sibling order and counts only leaves", () => {
    const tree = assembleTree([
      { _id: "s", name: "Subject", order: 0, completed: false },
      { _id: "b", parentId: "s", name: "B", order: 1, completed: false },
      { _id: "a", parentId: "s", name: "A", order: 0, completed: false },
      { _id: "leaf1", parentId: "a", name: "one", order: 0, completed: true },
      { _id: "deep", parentId: "leaf1", name: "deeper", order: 0, completed: false },
      { _id: "leaf2", parentId: "deep", name: "two", order: 0, completed: true },
      { _id: "leaf3", parentId: "b", name: "three", order: 0, completed: false },
    ]);
    expect(tree[0].children.map(x => x.name)).toEqual(["A", "B"]);
    expect(progressOf(tree[0])).toEqual({ totalLeaves: 2, completedLeaves: 1, percentComplete: 50 });
  });
  it("handles an empty root collection without division errors", () => { expect(assembleTree([])).toEqual([]); });
  it("treats a root leaf as the only completion unit", () => {
    expect(progressOf({ _id:"x", name:"single", order:0, completed:true, children:[] })).toEqual({ totalLeaves:1, completedLeaves:1, percentComplete:100 });
  });
  it("rejects orphaned parent references rather than returning a corrupt tree", () => {
    expect(() => assembleTree([{ _id:"x", parentId:"missing", name:"x", order:0, completed:false }])).toThrow("Missing parent");
  });
});
