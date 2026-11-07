import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireUser, forbidden, validateName } from "./lib/auth";
import { assembleTree, type FlatNode, type TreeNode, progressOf } from "./lib/tree";
import { nodeTypeValidator } from "./lib/validators";

async function owned(ctx: any, id: any, userId: string) {
  const s = await ctx.db.get(id);
  if (!s || s.userId !== userId) forbidden();
  return s;
}

async function rows(ctx: any, syllabusId: any) {
  return await ctx.db
    .query("syllabusNodes")
    .withIndex("by_syllabusId", (q: any) => q.eq("syllabusId", syllabusId))
    .collect();
}

function counts(tree: TreeNode[]) {
  return tree.map(progressOf).reduce(
    (a, b) => ({
      totalLeaves: a.totalLeaves + b.totalLeaves,
      completedLeaves: a.completedLeaves + b.completedLeaves,
    }),
    { totalLeaves: 0, completedLeaves: 0 }
  );
}

function enrich(node: TreeNode): TreeNode & ReturnType<typeof progressOf> {
  return { ...node, ...progressOf(node), children: node.children.map(enrich) };
}

export const list = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const docs = await ctx.db
      .query("syllabuses")
      .withIndex("by_userId_updatedAt", (q) => q.eq("userId", user.userId))
      .order("desc")
      .collect();

    const result = [];
    for (const s of docs) {
      if (!args.includeArchived && s.isArchived) continue;
      const rs = await rows(ctx, s._id);
      const tree = assembleTree(rs as unknown as FlatNode[]);
      const c = counts(tree);
      result.push({
        ...s,
        ...c,
        percentComplete: c.totalLeaves ? Math.round((c.completedLeaves / c.totalLeaves) * 100) : 0,
      });
    }
    return result;
  },
});

export const get = query({
  args: { syllabusId: v.id("syllabuses") },
  handler: async (ctx, { syllabusId }) => {
    const user = await requireUser(ctx);
    return await owned(ctx, syllabusId, user.userId);
  },
});

export const getTree = query({
  args: { syllabusId: v.id("syllabuses") },
  handler: async (ctx, { syllabusId }) => {
    const user = await requireUser(ctx);
    const syllabus = await owned(ctx, syllabusId, user.userId);
    const rawRows = await rows(ctx, syllabusId);
    const tree = assembleTree(rawRows as unknown as FlatNode[]);
    const c = counts(tree);
    return {
      syllabus,
      tree: tree.map(enrich),
      ...c,
      percentComplete: c.totalLeaves ? Math.round((c.completedLeaves / c.totalLeaves) * 100) : 0,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    metadata: v.optional(v.any()),
    source: v.optional(v.string()),
    initialTree: v.optional(v.any()), // Supports optional array of nested nodes from import
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const syllabusId = await ctx.db.insert("syllabuses", {
      userId: user.userId,
      name: validateName(args.name, "Syllabus name"),
      code: args.code?.trim() || undefined,
      metadata: args.metadata,
      source: args.source?.trim() || undefined,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    if (Array.isArray(args.initialTree) && args.initialTree.length > 0) {
      async function insertInitialNodes(nodes: any[], parentId?: any) {
        for (let i = 0; i < nodes.length; i++) {
          const item = nodes[i];
          if (!item) continue;
          const rawName = typeof item.name === "string" ? item.name.trim() : "";
          if (!rawName) continue;
          const nodeName = rawName.length > 200 ? rawName.slice(0, 197) + "..." : rawName;
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const type = ["subject", "chapter", "topic", "subtopic", "item"].includes(item.type)
            ? item.type
            : "item";

          const nodeId = await ctx.db.insert("syllabusNodes", {
            syllabusId,
            userId: user.userId,
            parentId,
            name: nodeName,
            type,
            order: typeof item.order === "number" && Number.isFinite(item.order) ? item.order : i,
            completed: hasChildren ? false : Boolean(item.completed),
            createdAt: now,
            updatedAt: now,
          });

          if (hasChildren) {
            await insertInitialNodes(item.children, nodeId);
          }
        }
      }
      await insertInitialNodes(args.initialTree, undefined);
    }

    return syllabusId;
  },
});

export const rename = mutation({
  args: { syllabusId: v.id("syllabuses"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await owned(ctx, args.syllabusId, user.userId);
    await ctx.db.patch(args.syllabusId, {
      name: validateName(args.name, "Syllabus name"),
      updatedAt: Date.now(),
    });
  },
});

export const setArchived = mutation({
  args: { syllabusId: v.id("syllabuses"), isArchived: v.boolean() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await owned(ctx, args.syllabusId, user.userId);
    await ctx.db.patch(args.syllabusId, {
      isArchived: args.isArchived,
      updatedAt: Date.now(),
    });
  },
});

export const duplicate = mutation({
  args: { syllabusId: v.id("syllabuses"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const src = await owned(ctx, args.syllabusId, user.userId);
    const oldNodes = await rows(ctx, src._id);
    const now = Date.now();

    const newId = await ctx.db.insert("syllabuses", {
      userId: user.userId,
      name: validateName(args.name, "Syllabus name"),
      source: src.source,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    if (oldNodes.length > 0) {
      const tree = assembleTree(oldNodes as unknown as FlatNode[]);
      async function duplicateTree(nodes: TreeNode[], parentId?: any) {
        for (const item of nodes) {
          const oldRecord = oldNodes.find((r: any) => r._id === item._id);
          const newNodeId = await ctx.db.insert("syllabusNodes", {
            syllabusId: newId,
            userId: user.userId,
            parentId,
            name: item.name,
            type: oldRecord?.type ?? "item",
            order: item.order,
            completed: item.children.length === 0 ? item.completed : false,
            createdAt: now,
            updatedAt: now,
          });
          if (item.children.length > 0) {
            await duplicateTree(item.children, newNodeId);
          }
        }
      }
      await duplicateTree(tree, undefined);
    }

    return newId;
  },
});

export const deleteSyllabus = mutation({
  args: { syllabusId: v.id("syllabuses") },
  handler: async (ctx, { syllabusId }) => {
    const user = await requireUser(ctx);
    await owned(ctx, syllabusId, user.userId);

    // 1. Delete all node notes via indexed syllabusId lookup (no unbounded scan)
    const notes = await ctx.db
      .query("nodeNotes")
      .withIndex("by_syllabusId", (q: any) => q.eq("syllabusId", syllabusId))
      .collect();
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }

    // 2. Delete all materials and underlying storage files
    const mats = await ctx.db
      .query("materials")
      .withIndex("by_syllabusId", (q: any) => q.eq("syllabusId", syllabusId))
      .collect();
    for (const m of mats) {
      await ctx.storage.delete(m.storageId);
      await ctx.db.delete(m._id);
    }

    // 3. Delete all syllabus nodes
    const ns = await rows(ctx, syllabusId);
    for (const n of ns) {
      await ctx.db.delete(n._id);
    }

    // 4. Delete the syllabus record itself
    await ctx.db.delete(syllabusId);
  },
});
