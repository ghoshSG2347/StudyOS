import { describe, it, expect, beforeEach } from "vitest";
import { MockConvexDatabase } from "./harness";
import * as profiles from "../convex/profiles";

describe("Profiles & Authentication", () => {
  let db: MockConvexDatabase;
  const userA = { subject: "user_a", email: "alice@example.com", name: "Alice" };
  const userB = { subject: "user_b", email: "bob@example.com", name: "Bob" };

  beforeEach(() => {
    db = new MockConvexDatabase();
  });

  it("rejects unauthenticated calls", async () => {
    const unauthCtx = db.createContext(null);
    await expect(profiles.get._handler(unauthCtx, {})).rejects.toThrow("Sign in is required.");
    await expect(
      profiles.completeOnboarding._handler(unauthCtx, { fullName: "Alice" })
    ).rejects.toThrow("Sign in is required.");
  });

  it("completes onboarding and creates profile", async () => {
    const ctxA = db.createContext(userA);
    const profileId = await profiles.completeOnboarding._handler(ctxA, {
      fullName: "Alice Student",
      institute: "Tech University",
      educationLevel: "College / University",
      collegeDetails: { courseOrBranch: "Computer Science", currentSemester: "3rd" },
    });

    expect(profileId).toBeDefined();

    const profile = await profiles.get._handler(ctxA, {});
    expect(profile).not.toBeNull();
    expect(profile?.fullName).toBe("Alice Student");
    expect(profile?.email).toBe("alice@example.com");
    expect(profile?.completedOnboarding).toBe(true);
    expect(profile?.collegeDetails?.courseOrBranch).toBe("Computer Science");
  });

  it("supports updating profile and clearing avatar", async () => {
    const ctxA = db.createContext(userA);

    // 1. Generate avatar upload URL & register intent
    const { uploadIntentId } = await profiles.generateAvatarUploadUrl._handler(ctxA, {});

    // 2. Mock storage file upload
    const avatarStorageId = "storage_avatar_1";
    db.addStorageFile(avatarStorageId, { size: 1024 * 50, contentType: "image/png" });

    // 3. Complete onboarding with avatar
    await profiles.completeOnboarding._handler(ctxA, {
      fullName: "Alice Initial",
      avatarStorageId,
      uploadIntentId,
    });

    let profile = await profiles.get._handler(ctxA, {});
    expect(profile?.avatarStorageId).toBe(avatarStorageId);
    expect(profile?.avatarUrl).toContain(avatarStorageId);

    // 4. Update profile and clear avatar
    await profiles.update._handler(ctxA, {
      fullName: "Alice Renamed",
      clearAvatar: true,
    });

    profile = await profiles.get._handler(ctxA, {});
    expect(profile?.fullName).toBe("Alice Renamed");
    expect(profile?.avatarStorageId).toBeUndefined();
    expect(profile?.avatarUrl).toBeNull();
    // Old avatar storage was deleted
    expect(db.storage.has(avatarStorageId)).toBe(false);
  });

  it("prevents using an avatar storage ID already claimed by another user", async () => {
    const ctxA = db.createContext(userA);
    const ctxB = db.createContext(userB);

    const { uploadIntentId: intentA } = await profiles.generateAvatarUploadUrl._handler(ctxA, {});
    const sharedStorageId = "storage_avatar_shared";
    db.addStorageFile(sharedStorageId, { size: 1024 * 50, contentType: "image/jpeg" });

    // Alice claims the avatar
    await profiles.completeOnboarding._handler(ctxA, {
      fullName: "Alice",
      avatarStorageId: sharedStorageId,
      uploadIntentId: intentA,
    });

    // Bob tries to claim Alice's avatar storage ID
    const { uploadIntentId: intentB } = await profiles.generateAvatarUploadUrl._handler(ctxB, {});
    await expect(
      profiles.completeOnboarding._handler(ctxB, {
        fullName: "Bob",
        avatarStorageId: sharedStorageId,
        uploadIntentId: intentB,
      })
    ).rejects.toThrow("This file is already associated with a user profile.");
  });

  it("rejects avatar exceeding 2 MB", async () => {
    const ctxA = db.createContext(userA);
    const { uploadIntentId } = await profiles.generateAvatarUploadUrl._handler(ctxA, {});

    const oversizedStorageId = "storage_huge_avatar";
    db.addStorageFile(oversizedStorageId, { size: 3 * 1024 * 1024, contentType: "image/jpeg" });

    await expect(
      profiles.completeOnboarding._handler(ctxA, {
        fullName: "Alice",
        avatarStorageId: oversizedStorageId,
        uploadIntentId,
      })
    ).rejects.toThrow("Avatar must be a valid image under 2 MB.");
  });
});

