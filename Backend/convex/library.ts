import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireUser, forbidden, validateName, assertStorageIdUnclaimed } from "./lib/auth";
import { ALLOWED_LIBRARY_MIME_TYPES, MAX_LIBRARY_BYTES } from "./lib/validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const u = await requireUser(ctx);
    return await ctx.db
      .query("libraryResources")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", u.userId))
      .order("desc")
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const u = await requireUser(ctx);
    const uploadIntentId = await ctx.db.insert("uploadIntents", {
      userId: u.userId,
      purpose: "library",
      createdAt: Date.now(),
    });
    return { uploadUrl: await ctx.storage.generateUploadUrl(), uploadIntentId };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    uploadIntentId: v.optional(v.id("uploadIntents")),
    externalUrl: v.optional(v.string()),
    kind: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, a) => {
    const u = await requireUser(ctx);

    if (!a.storageId && !a.externalUrl) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Provide a stored file or an external link URL.",
      });
    }

    if (a.externalUrl) {
      let url: URL;
      try {
        url = new URL(a.externalUrl);
      } catch {
        throw new ConvexError({ code: "INVALID_INPUT", message: "External URL is invalid." });
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new ConvexError({
          code: "INVALID_INPUT",
          message: "Only HTTP(S) links are supported.",
        });
      }
    }

    if (a.storageId) {
      if (!a.uploadIntentId) {
        throw new ConvexError({
          code: "INVALID_INPUT",
          message: "Upload intent ID is required when attaching a file.",
        });
      }
      const intent = await ctx.db.get(a.uploadIntentId);
      if (
        !intent ||
        intent.userId !== u.userId ||
        intent.purpose !== "library" ||
        intent.consumed ||
        Date.now() - intent.createdAt > 15 * 60 * 1000
      ) {
        forbidden("Library upload intent is invalid or expired.");
      }

      await assertStorageIdUnclaimed(ctx, a.storageId);

      const meta = await ctx.db.system.get(a.storageId);
      if (!meta) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Uploaded file not found in storage." });
      }
      if (meta.size > MAX_LIBRARY_BYTES) {
        throw new ConvexError({
          code: "INVALID_INPUT",
          message: "Library file exceeds the 50 MB limit.",
        });
      }
      if (meta.contentType && !ALLOWED_LIBRARY_MIME_TYPES.has(meta.contentType)) {
        throw new ConvexError({
          code: "INVALID_INPUT",
          message: "Unsupported file type for library resource.",
        });
      }

      await ctx.db.delete(intent._id);
    } else if (a.uploadIntentId) {
      const intent = await ctx.db.get(a.uploadIntentId);
      if (intent && intent.userId === u.userId) {
        await ctx.db.delete(intent._id);
      }
    }

    const now = Date.now();
    return await ctx.db.insert("libraryResources", {
      userId: u.userId,
      title: validateName(a.title, "Title"),
      description: a.description?.trim() || undefined,
      storageId: a.storageId,
      externalUrl: a.externalUrl,
      kind: validateName(a.kind, "Kind"),
      tags: [...new Set(a.tags.map((t) => t.trim()).filter(Boolean))].slice(0, 30),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    resourceId: v.id("libraryResources"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, a) => {
    const u = await requireUser(ctx);
    const r = await ctx.db.get(a.resourceId);
    if (!r || r.userId !== u.userId) forbidden();

    if (a.externalUrl) {
      let url: URL;
      try {
        url = new URL(a.externalUrl);
      } catch {
        throw new ConvexError({ code: "INVALID_INPUT", message: "External URL is invalid." });
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new ConvexError({
          code: "INVALID_INPUT",
          message: "Only HTTP(S) links are supported.",
        });
      }
    }

    await ctx.db.patch(r._id, {
      title: a.title === undefined ? r.title : validateName(a.title, "Title"),
      description: a.description === undefined ? r.description : a.description.trim() || undefined,
      externalUrl: a.externalUrl === undefined ? r.externalUrl : a.externalUrl,
      tags:
        a.tags === undefined
          ? r.tags
          : [...new Set(a.tags.map((t) => t.trim()).filter(Boolean))].slice(0, 30),
      updatedAt: Date.now(),
    });
  },
});

export const deleteResource = mutation({
  args: { resourceId: v.id("libraryResources") },
  handler: async (ctx, { resourceId }) => {
    const u = await requireUser(ctx);
    const r = await ctx.db.get(resourceId);
    if (!r || r.userId !== u.userId) forbidden();
    if (r.storageId) {
      await ctx.storage.delete(r.storageId);
    }
    await ctx.db.delete(resourceId);
  },
});

export const getFileUrl = query({
  args: { resourceId: v.id("libraryResources") },
  handler: async (ctx, { resourceId }) => {
    const u = await requireUser(ctx);
    const r = await ctx.db.get(resourceId);
    if (!r || r.userId !== u.userId) forbidden();
    if (!r.storageId) return null;
    return await ctx.storage.getUrl(r.storageId);
  },
});
