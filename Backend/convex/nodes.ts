import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireUser, forbidden, validateName } from "./lib/auth";
import { nodeTypeValidator } from "./lib/validators";

async function ownedSyllabus(ctx: any, syllabusId: any, userId: string) {
  const s = await ctx.db.get(syllabusId);
  if (!s || s.userId !== userId) forbidden();
  return s;
}

async function childRows(ctx: any, syllabusId: any, parentId: any) {
  return await ctx.db
    .query("syllabusNodes")
    .withIndex("by_syllabusId_parentId", (q: any) =>
      q.eq("syllabusId", syllabusId).eq("parentId", parentId)
    )
    .collect();
}

async function verifyNode(ctx: any, id: any, userId: string) {
  const n = await ctx.db.get(id);
  if (!n || n.userId !== userId) forbidden();
  const s = await ownedSyllabus(ctx, n.syllabusId, userId);
  return { n, s };
}

export const getChildren = query({
  args: {
    syllabusId: v.id("syllabuses"),
    parentId: v.optional(v.id("syllabusNodes")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await ownedSyllabus(ctx, args.syllabusId, user.userId);
    if (args.parentId) {
      const p = await ctx.db.get(args.parentId);
      if (!p || p.userId !== user.userId || p.syllabusId !== args.syllabusId) forbidden();
    }
    const children = await childRows(ctx, args.syllabusId, args.parentId);
    return children.sort((x: any, y: any) => x.order - y.order || x._id.localeCompare(y._id));
  },
});

export const create = mutation({
  args: {
    syllabusId: v.id("syllabuses"),
    parentId: v.optional(v.id("syllabusNodes")),
    name: v.string(),
    type: nodeTypeValidator,
    position: v.optional(v.union(v.literal("before"), v.literal("after"))),
    anchorId: v.optional(v.id("syllabusNodes")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await ownedSyllabus(ctx, args.syllabusId, user.userId);

    if (args.parentId) {
      const p = await ctx.db.get(args.parentId);
      if (!p || p.userId !== user.userId || p.syllabusId !== args.syllabusId) forbidden();
      // Parent now has a child, so it can no longer be directly marked completed
      if (p.completed) {
        await ctx.db.patch(p._id, { completed: false, updatedAt: Date.now() });
      }
    }

    const siblings = await childRows(ctx, args.syllabusId, args.parentId);
    let order = siblings.length ? Math.max(...siblings.map((n: any) => n.order)) + 1 : 0;

    if (args.anchorId) {
      const anchor = await ctx.db.get(args.anchorId);
      if (
        !anchor ||
        anchor.userId !== user.userId ||
        anchor.syllabusId !== args.syllabusId ||
        anchor.parentId !== args.parentId
      ) {
        forbidden();
      }
      const before = args.position === "before";
      order = anchor.order + (before ? -0.5 : 0.5);
      for (const sib of siblings as any[]) {
        if (before ? sib.order >= anchor.order : sib.order > anchor.order) {
          await ctx.db.patch(sib._id, { order: sib.order + 1, updatedAt: Date.now() });
        }
      }
    }

    const now = Date.now();
    return await ctx.db.insert("syllabusNodes", {
      syllabusId: args.syllabusId,
      userId: user.userId,
      parentId: args.parentId,
      name: validateName(args.name, "Node name"),
      type: args.type,
      order,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const rename = mutation({
  args: { nodeId: v.id("syllabusNodes"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await verifyNode(ctx, args.nodeId, user.userId);
    await ctx.db.patch(args.nodeId, {
      name: validateName(args.name, "Node name"),
      updatedAt: Date.now(),
    });
  },
});

export const toggleComplete = mutation({
  args: { nodeId: v.id("syllabusNodes") },
  handler: async (ctx, { nodeId }) => {
    const user = await requireUser(ctx);
    const { n } = await verifyNode(ctx, nodeId, user.userId);
    const children = await childRows(ctx, n.syllabusId, n._id);
    if (children.length > 0) {
      throw new ConvexError({
        code: "INVALID_OPERATION",
        message: "Only leaf nodes can be completed.",
      });
    }
    const nextCompleted = !n.completed;
    await ctx.db.patch(nodeId, { completed: nextCompleted, updatedAt: Date.now() });
    return nextCompleted;
  },
});

export const move = mutation({
  args: {
    nodeId: v.id("syllabusNodes"),
    newParentId: v.optional(v.id("syllabusNodes")),
    position: v.optional(v.union(v.literal("before"), v.literal("after"))),
    anchorId: v.optional(v.id("syllabusNodes")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { n } = await verifyNode(ctx, args.nodeId, user.userId);

    if (args.newParentId) {
      const p = await ctx.db.get(args.newParentId);
      if (!p || p.userId !== user.userId || p.syllabusId !== n.syllabusId) forbidden();

      // Check circular reference by walking up ancestors
      let cur: any = p;
      while (cur) {
        if (cur._id === n._id) {
          throw new ConvexError({
            code: "INVALID_OPERATION",
            message: "Circular tree moves are not allowed.",
          });
        }
        cur = cur.parentId ? await ctx.db.get(cur.parentId) : null;
      }
    }

    if (args.anchorId) {
      const a = await ctx.db.get(args.anchorId);
      if (
        !a ||
        a.userId !== user.userId ||
        a.syllabusId !== n.syllabusId ||
        a.parentId !== args.newParentId
      ) {
        forbidden();
      }
    }

    // Determine if moved node itself has children (if it does, it cannot remain marked completed)
    const nodeChildren = await childRows(ctx, n.syllabusId, n._id);
    const nodeHasChildren = nodeChildren.length > 0;

    // Fetch existing siblings under destination parent (excluding moved node itself)
    const siblings = await childRows(ctx, n.syllabusId, args.newParentId);
    const ordered = (siblings as any[])
      .filter((s) => s._id !== n._id)
      .sort((a, b) => a.order - b.order || a._id.localeCompare(b._id));

    let insertIndex = ordered.length;
    if (args.anchorId) {
      const idx = ordered.findIndex((s) => s._id === args.anchorId);
      if (idx < 0) forbidden();
      insertIndex = idx + (args.position === "after" ? 1 : 0);
    }

    ordered.splice(insertIndex, 0, n);

    const now = Date.now();
    for (let i = 0; i < ordered.length; i++) {
      const item = ordered[i];
      const isMovedNode = item._id === n._id;
      const completedValue = isMovedNode
        ? (nodeHasChildren ? false : item.completed)
        : item.completed;

      await ctx.db.patch(item._id, {
        parentId: args.newParentId,
        order: i,
        completed: completedValue,
        updatedAt: now,
      });
    }

    // If moved to a parent, parent is no longer a leaf
    if (args.newParentId) {
      const p = await ctx.db.get(args.newParentId);
      if (p && p.completed) {
        await ctx.db.patch(p._id, { completed: false, updatedAt: now });
      }
    }
  },
});

export const reorder = mutation({
  args: { nodeId: v.id("syllabusNodes"), newIndex: v.number() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (!Number.isFinite(args.newIndex)) {
      throw new ConvexError({ code: "INVALID_INPUT", message: "newIndex must be a valid number." });
    }
    const { n } = await verifyNode(ctx, args.nodeId, user.userId);
    const siblings = (await childRows(ctx, n.syllabusId, n.parentId) as any[]).sort(
      (a, b) => a.order - b.order || a._id.localeCompare(b._id)
    );

    const from = siblings.findIndex((s) => s._id === n._id);
    if (from < 0) forbidden();

    const [moved] = siblings.splice(from, 1);
    const to = Math.max(0, Math.min(Math.floor(args.newIndex), siblings.length));
    siblings.splice(to, 0, moved);

    const now = Date.now();
    for (let i = 0; i < siblings.length; i++) {
      await ctx.db.patch(siblings[i]._id, { order: i, updatedAt: now });
    }
  },
});

export const deleteNode = mutation({
  args: { nodeId: v.id("syllabusNodes") },
  handler: async (ctx, { nodeId }) => {
    const user = await requireUser(ctx);
    const { n } = await verifyNode(ctx, nodeId, user.userId);

    const allSyllabusNodes = await ctx.db
      .query("syllabusNodes")
      .withIndex("by_syllabusId", (q: any) => q.eq("syllabusId", n.syllabusId))
      .collect();

    const byParent = new Map<string, any[]>();
    for (const row of allSyllabusNodes as any[]) {
      const k = String(row.parentId ?? "");
      byParent.set(k, [...(byParent.get(k) ?? []), row]);
    }

    const ids: any[] = [];
    const visit = (id: any) => {
      ids.push(id);
      for (const child of byParent.get(String(id)) ?? []) {
        visit(child._id);
      }
    };
    visit(n._id);

    // 1. Delete notes associated with nodes in this subtree
    for (const id of ids) {
      const nodeNotes = await ctx.db
        .query("nodeNotes")
        .withIndex("by_nodeId", (q: any) => q.eq("nodeId", id))
        .collect();
      for (const note of nodeNotes) {
        await ctx.db.delete(note._id);
      }
    }

    // 2. Delete materials and their storage files for nodes in this subtree
    const set = new Set(ids.map(String));
    const mats = await ctx.db
      .query("materials")
      .withIndex("by_syllabusId", (q: any) => q.eq("syllabusId", n.syllabusId))
      .collect();
    for (const m of mats as any[]) {
      if (set.has(String(m.nodeId))) {
        await ctx.storage.delete(m.storageId);
        await ctx.db.delete(m._id);
      }
    }

    // 3. Delete nodes in reverse topological order (deepest descendants first)
    for (const id of ids.reverse()) {
      await ctx.db.delete(id);
    }
  },
});
