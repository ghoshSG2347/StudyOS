import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireUser, validateName, assertStorageIdUnclaimed, forbidden } from "./lib/auth";
import { educationLevelValidator, MAX_AVATAR_BYTES } from "./lib/validators";

const profileArgs = {
  fullName: v.string(),
  avatarStorageId: v.optional(v.id("_storage")),
  uploadIntentId: v.optional(v.id("uploadIntents")),
  clearAvatar: v.optional(v.boolean()),
  institute: v.optional(v.string()),
  educationLevel: v.optional(educationLevelValidator),
  schoolDetails: v.optional(v.object({ currentClass: v.string() })),
  collegeDetails: v.optional(v.object({ courseOrBranch: v.string(), currentSemester: v.string() })),
};

function normalizeProfileData(args: {
  fullName: string;
  institute?: string;
  educationLevel?: "School" | "College / University";
  schoolDetails?: { currentClass: string };
  collegeDetails?: { courseOrBranch: string; currentSemester: string };
}) {
  const institute = args.institute?.trim() || undefined;
  return {
    fullName: validateName(args.fullName, "Full name"),
    institute,
    educationLevel: args.educationLevel,
    schoolDetails:
      args.educationLevel === "School" && args.schoolDetails?.currentClass.trim()
        ? { currentClass: args.schoolDetails.currentClass.trim() }
        : undefined,
    collegeDetails:
      args.educationLevel === "College / University" &&
      (args.collegeDetails?.courseOrBranch.trim() || args.collegeDetails?.currentSemester.trim())
        ? {
            courseOrBranch: args.collegeDetails?.courseOrBranch.trim() ?? "",
            currentSemester: args.collegeDetails?.currentSemester.trim() ?? "",
          }
        : undefined,
  };
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user.userId))
      .first();
    if (!profile) return null;
    const avatarUrl = profile.avatarStorageId ? await ctx.storage.getUrl(profile.avatarStorageId) : null;
    return { ...profile, avatarUrl };
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const uploadIntentId = await ctx.db.insert("uploadIntents", {
      userId: user.userId,
      purpose: "avatar",
      createdAt: Date.now(),
    });
    return { uploadUrl: await ctx.storage.generateUploadUrl(), uploadIntentId };
  },
});

export const completeOnboarding = mutation({
  args: profileArgs,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const data = normalizeProfileData(args);

    if (args.avatarStorageId) {
      if (!args.uploadIntentId) {
        throw new ConvexError({ code: "INVALID_INPUT", message: "Upload intent ID is required when setting an avatar." });
      }
      const intent = await ctx.db.get(args.uploadIntentId);
      if (
        !intent ||
        intent.userId !== user.userId ||
        intent.purpose !== "avatar" ||
        intent.consumed ||
        Date.now() - intent.createdAt > 15 * 60 * 1000
      ) {
        forbidden("Avatar upload intent is invalid or expired.");
      }

      await assertStorageIdUnclaimed(ctx, args.avatarStorageId, user.userId);

      const meta = await ctx.db.system.get(args.avatarStorageId);
      if (!meta || meta.size > MAX_AVATAR_BYTES || !meta.contentType?.startsWith("image/")) {
        throw new ConvexError({ code: "INVALID_INPUT", message: "Avatar must be a valid image under 2 MB." });
      }

      await ctx.db.delete(intent._id);
    } else if (args.uploadIntentId) {
      // Safe cleanup only if caller owns the intent
      const intent = await ctx.db.get(args.uploadIntentId);
      if (intent && intent.userId === user.userId) {
        await ctx.db.delete(intent._id);
      }
    }

    const existingProfiles = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user.userId))
      .collect();

    const existing = existingProfiles[0];
    // Clean up any extra duplicates if they exist
    if (existingProfiles.length > 1) {
      for (let i = 1; i < existingProfiles.length; i++) {
        await ctx.db.delete(existingProfiles[i]._id);
      }
    }

    const doc = {
      ...data,
      userId: user.userId,
      email: user.email,
      avatarStorageId: args.avatarStorageId,
      completedOnboarding: true,
      updatedAt: now,
    };

    if (existing) {
      if (existing.avatarStorageId && existing.avatarStorageId !== args.avatarStorageId) {
        await ctx.storage.delete(existing.avatarStorageId);
      }
      await ctx.db.patch(existing._id, doc);
      return existing._id;
    }

    return await ctx.db.insert("profiles", { ...doc, createdAt: now });
  },
});

export const update = mutation({
  args: profileArgs,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existingProfiles = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user.userId))
      .collect();

    const profile = existingProfiles[0];
    if (!profile) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Profile not found; complete onboarding first." });
    }

    // Clean up any extra duplicates if they exist
    if (existingProfiles.length > 1) {
      for (let i = 1; i < existingProfiles.length; i++) {
        await ctx.db.delete(existingProfiles[i]._id);
      }
    }

    let finalAvatarId: typeof profile.avatarStorageId = profile.avatarStorageId;

    if (args.clearAvatar) {
      if (profile.avatarStorageId) {
        await ctx.storage.delete(profile.avatarStorageId);
      }
      finalAvatarId = undefined;
      if (args.uploadIntentId) {
        const intent = await ctx.db.get(args.uploadIntentId);
        if (intent && intent.userId === user.userId) {
          await ctx.db.delete(intent._id);
        }
      }
    } else if (args.avatarStorageId) {
      if (!args.uploadIntentId) {
        throw new ConvexError({ code: "INVALID_INPUT", message: "Upload intent ID is required when setting an avatar." });
      }
      const intent = await ctx.db.get(args.uploadIntentId);
      if (
        !intent ||
        intent.userId !== user.userId ||
        intent.purpose !== "avatar" ||
        intent.consumed ||
        Date.now() - intent.createdAt > 15 * 60 * 1000
      ) {
        forbidden("Avatar upload intent is invalid or expired.");
      }

      await assertStorageIdUnclaimed(ctx, args.avatarStorageId, user.userId);

      const meta = await ctx.db.system.get(args.avatarStorageId);
      if (!meta || meta.size > MAX_AVATAR_BYTES || !meta.contentType?.startsWith("image/")) {
        throw new ConvexError({ code: "INVALID_INPUT", message: "Avatar must be a valid image under 2 MB." });
      }

      if (profile.avatarStorageId && profile.avatarStorageId !== args.avatarStorageId) {
        await ctx.storage.delete(profile.avatarStorageId);
      }
      finalAvatarId = args.avatarStorageId;
      await ctx.db.delete(intent._id);
    } else if (args.uploadIntentId) {
      const intent = await ctx.db.get(args.uploadIntentId);
      if (intent && intent.userId === user.userId) {
        await ctx.db.delete(intent._id);
      }
    }

    await ctx.db.patch(profile._id, {
      ...normalizeProfileData(args),
      email: user.email,
      avatarStorageId: finalAvatarId,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});
