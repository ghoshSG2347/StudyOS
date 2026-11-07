import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireUser, forbidden, validateName, assertStorageIdUnclaimed } from "./lib/auth";
import { ALLOWED_MIME_TYPES, MAX_MATERIAL_BYTES, materialKindFor } from "./lib/validators";

async function ownedNode(ctx: any, id: any, userId: string) {
  const n = await ctx.db.get(id);
  if (!n || n.userId !== userId) forbidden();
  const s = await ctx.db.get(n.syllabusId);
  if (!s || s.userId !== userId) forbidden();
  return n;
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const u = await requireUser(ctx);
    const intentId = await ctx.db.insert("uploadIntents", {
      userId: u.userId,
      purpose: "material",
      createdAt: Date.now(),
    });
    return { uploadUrl: await ctx.storage.generateUploadUrl(), intentId };
  },
});

export const saveAttachment = mutation({
  args: {
    nodeId: v.id("syllabusNodes"),
    storageId: v.id("_storage"),
    uploadIntentId: v.id("uploadIntents"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    textContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const u = await requireUser(ctx);
    const n = await ownedNode(ctx, args.nodeId, u.userId);

    const intent = await ctx.db.get(args.uploadIntentId);
    if (
      !intent ||
      intent.userId !== u.userId ||
      intent.purpose !== "material" ||
      intent.consumed ||
      Date.now() - intent.createdAt > 15 * 60 * 1000
    ) {
      forbidden("Upload intent is invalid, expired, or already consumed.");
    }

    if (!Number.isInteger(args.fileSize) || args.fileSize < 1 || args.fileSize > MAX_MATERIAL_BYTES) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "File must be between 1 byte and 25 MB.",
      });
    }

    if (!ALLOWED_MIME_TYPES.has(args.mimeType)) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Unsupported file type for study materials.",
      });
    }

    await assertStorageIdUnclaimed(ctx, args.storageId);

    const meta = await ctx.db.system.get(args.storageId);
    if (!meta || meta.size !== args.fileSize || meta.contentType !== args.mimeType) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Uploaded object metadata does not match submitted file metadata.",
      });
    }

    const now = Date.now();
    const id = await ctx.db.insert("materials", {
      nodeId: n._id,
      syllabusId: n.syllabusId,
      userId: u.userId,
      storageId: args.storageId,
      fileName: validateName(args.fileName, "File name"),
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      kind: materialKindFor(args.mimeType),
      textContent: args.textContent,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.delete(intent._id);
    return id;
  },
});

export const renameAttachment = mutation({
  args: {
    materialId: v.id("materials"),
    fileName: v.string(),
  },
  handler: async (ctx, { materialId, fileName }) => {
    const u = await requireUser(ctx);
    const m = await ctx.db.get(materialId);
    if (!m || m.userId !== u.userId) forbidden();
    await ownedNode(ctx, m.nodeId, u.userId);
    const validated = validateName(fileName, "File name");
    await ctx.db.patch(materialId, { fileName: validated, updatedAt: Date.now() });
  },
});

export const updateTextAttachment = mutation({
  args: {
    materialId: v.id("materials"),
    textContent: v.string(),
    fileName: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    uploadIntentId: v.optional(v.id("uploadIntents")),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const u = await requireUser(ctx);
    const m = await ctx.db.get(args.materialId);
    if (!m || m.userId !== u.userId) forbidden();
    await ownedNode(ctx, m.nodeId, u.userId);

    let newStorageId = m.storageId;
    let size = args.fileSize ?? (typeof Buffer !== "undefined" ? Buffer.byteLength(args.textContent, "utf8") : args.textContent.length);

    if (args.storageId && args.uploadIntentId) {
      const intent = await ctx.db.get(args.uploadIntentId);
      if (
        !intent ||
        intent.userId !== u.userId ||
        intent.purpose !== "material" ||
        intent.consumed ||
        Date.now() - intent.createdAt > 15 * 60 * 1000
      ) {
        forbidden("Upload intent is invalid, expired, or already consumed.");
      }
      await assertStorageIdUnclaimed(ctx, args.storageId);
      if (m.storageId) {
        await ctx.storage.delete(m.storageId);
      }
      newStorageId = args.storageId;
      await ctx.db.delete(intent._id);
    }

    const patch: any = {
      storageId: newStorageId,
      textContent: args.textContent,
      fileSize: size,
      updatedAt: Date.now(),
    };
    if (args.fileName) {
      patch.fileName = validateName(args.fileName, "File name");
    }

    await ctx.db.patch(args.materialId, patch);
    return args.materialId;
  },
});

export const listByNode = query({
  args: { nodeId: v.id("syllabusNodes") },
  handler: async (ctx, { nodeId }) => {
    const u = await requireUser(ctx);
    const n = await ownedNode(ctx, nodeId, u.userId);
    const list = await ctx.db
      .query("materials")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .collect();
    return list.filter((m: any) => m.userId === u.userId && m.syllabusId === n.syllabusId);
  },
});

export const getFileUrl = query({
  args: { materialId: v.id("materials") },
  handler: async (ctx, { materialId }) => {
    const u = await requireUser(ctx);
    const m = await ctx.db.get(materialId);
    if (!m || m.userId !== u.userId) forbidden();
    await ownedNode(ctx, m.nodeId, u.userId);
    const url = await ctx.storage.getUrl(m.storageId);
    if (!url) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Stored file is unavailable." });
    }
    return { url, fileName: m.fileName, mimeType: m.mimeType, textContent: m.textContent };
  },
});

export const deleteAttachment = mutation({
  args: { materialId: v.id("materials") },
  handler: async (ctx, { materialId }) => {
    const u = await requireUser(ctx);
    const m = await ctx.db.get(materialId);
    if (!m || m.userId !== u.userId) forbidden();
    await ownedNode(ctx, m.nodeId, u.userId);
    await ctx.storage.delete(m.storageId);
    await ctx.db.delete(materialId);
  },
});
