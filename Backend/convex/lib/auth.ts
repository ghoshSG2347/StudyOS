import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

export type AuthUser = { userId: string; email: string; name?: string };

export async function requireUser(ctx: QueryCtx | MutationCtx | ActionCtx | any): Promise<AuthUser> {
  if (!ctx || !ctx.auth) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in is required." });
  }
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.subject) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in is required." });
  }
  return { userId: identity.subject, email: identity.email ?? "", name: identity.name };
}

export function forbidden(message = "The requested resource is not available."): never {
  throw new ConvexError({ code: "FORBIDDEN", message });
}

export function validateName(value: string, label = "Name"): string {
  const clean = value.trim();
  if (!clean || clean.length > 200) {
    throw new ConvexError({ code: "INVALID_INPUT", message: `${label} must contain 1–200 characters.` });
  }
  return clean;
}

export async function assertStorageIdUnclaimed(ctx: any, storageId: any, excludeProfileUserId?: string): Promise<void> {
  const inMaterials = await ctx.db
    .query("materials")
    .withIndex("by_storageId", (q: any) => q.eq("storageId", storageId))
    .first();
  if (inMaterials) {
    throw new ConvexError({ code: "FORBIDDEN", message: "This file is already associated with an existing material." });
  }

  const inLibrary = await ctx.db
    .query("libraryResources")
    .withIndex("by_storageId", (q: any) => q.eq("storageId", storageId))
    .first();
  if (inLibrary) {
    throw new ConvexError({ code: "FORBIDDEN", message: "This file is already associated with an existing library resource." });
  }

  const inProfiles = await ctx.db
    .query("profiles")
    .withIndex("by_avatarStorageId", (q: any) => q.eq("avatarStorageId", storageId))
    .first();
  if (inProfiles && (!excludeProfileUserId || inProfiles.userId !== excludeProfileUserId)) {
    throw new ConvexError({ code: "FORBIDDEN", message: "This file is already associated with a user profile." });
  }
}
