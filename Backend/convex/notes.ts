import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireUser, forbidden } from "./lib/auth";

async function nodeFor(ctx: any, nodeId: any, userId: string) {
  const n = await ctx.db.get(nodeId);
  if (!n || n.userId !== userId) forbidden();
  const s = await ctx.db.get(n.syllabusId);
  if (!s || s.userId !== userId) forbidden();
  return n;
}

export const getByNode = query({
  args: { nodeId: v.id("syllabusNodes") },
  handler: async (ctx, { nodeId }) => {
    const u = await requireUser(ctx);
    await nodeFor(ctx, nodeId, u.userId);
    const notes = await ctx.db
      .query("nodeNotes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .collect();
    return notes[0] ?? null;
  },
});

export const save = mutation({
  args: { nodeId: v.id("syllabusNodes"), content: v.string() },
  handler: async (ctx, args) => {
    const u = await requireUser(ctx);
    const n = await nodeFor(ctx, args.nodeId, u.userId);

    if (args.content.length > 500_000) {
      throw new ConvexError({ code: "INVALID_INPUT", message: "Note exceeds the 500 KB text limit." });
    }

    const existingNotes = await ctx.db
      .query("nodeNotes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .collect();

    // If content is empty or whitespace, delete any existing notes for this node
    if (!args.content.trim()) {
      for (const note of existingNotes) {
        await ctx.db.delete(note._id);
      }
      return null;
    }

    const now = Date.now();
    if (existingNotes.length > 0) {
      const primary = existingNotes[0];
      if (primary.userId !== u.userId || primary.syllabusId !== n.syllabusId) forbidden();

      await ctx.db.patch(primary._id, { content: args.content, updatedAt: now });

      // Clean up any extra duplicates that may have been created concurrently
      if (existingNotes.length > 1) {
        for (let i = 1; i < existingNotes.length; i++) {
          await ctx.db.delete(existingNotes[i]._id);
        }
      }
      return primary._id;
    }

    return await ctx.db.insert("nodeNotes", {
      nodeId: n._id,
      syllabusId: n.syllabusId,
      userId: u.userId,
      content: args.content,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { nodeId: v.id("syllabusNodes") },
  handler: async (ctx, { nodeId }) => {
    const u = await requireUser(ctx);
    await nodeFor(ctx, nodeId, u.userId);
    const notes = await ctx.db
      .query("nodeNotes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .collect();
    for (const note of notes) {
      if (note.userId === u.userId) {
        await ctx.db.delete(note._id);
      }
    }
  },
});
