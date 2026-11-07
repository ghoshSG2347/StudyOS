import { action, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireUser, forbidden } from "./lib/auth";

export const verifyNodeForAi = internalQuery({
  args: { nodeId: v.id("syllabusNodes"), userId: v.string() },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.nodeId);
    if (!node || node.userId !== args.userId) return null;
    return { id: node._id, name: node.name, syllabusId: node.syllabusId };
  },
});

export const availability = action({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return {
      available: false,
      reason:
        "AI provider integration is intentionally not configured. Core StudyOS features work completely without AI.",
    };
  },
});

export const askAboutNode = action({
  args: {
    nodeId: v.id("syllabusNodes"),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (!args.question || !args.question.trim()) {
      throw new ConvexError({ code: "INVALID_INPUT", message: "Question cannot be empty." });
    }

    if (typeof ctx.runQuery === "function") {
      const node = await ctx.runQuery("ai:verifyNodeForAi" as any, {
        nodeId: args.nodeId,
        userId: user.userId,
      });
      if (!node) {
        forbidden("Node not found or not owned by the active user.");
      }
    }

    if (!process.env.AI_PROVIDER) {
      throw new ConvexError({
        code: "AI_UNAVAILABLE",
        message: "No AI provider is configured. Core StudyOS features work completely without AI.",
      });
    }
    throw new ConvexError({
      code: "AI_UNAVAILABLE",
      message: "Provider adapter is not implemented; no request was sent.",
    });
  },
});
