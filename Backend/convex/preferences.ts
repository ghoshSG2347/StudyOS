import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const u = await requireUser(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", u.userId))
      .collect();
    return existing[0] ?? { theme: "system" as const, compactMode: false };
  },
});

export const update = mutation({
  args: {
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    compactMode: v.optional(v.boolean()),
  },
  handler: async (ctx, a) => {
    const u = await requireUser(ctx);
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", u.userId))
      .collect();

    const old = existing[0];
    const patch = {
      theme: a.theme ?? old?.theme ?? ("system" as const),
      compactMode: a.compactMode ?? old?.compactMode ?? false,
      updatedAt: Date.now(),
    };

    if (old) {
      await ctx.db.patch(old._id, patch);
      if (existing.length > 1) {
        for (let i = 1; i < existing.length; i++) {
          await ctx.db.delete(existing[i]._id);
        }
      }
    } else {
      await ctx.db.insert("userPreferences", { userId: u.userId, ...patch });
    }
  },
});
