import { describe, it, expect, beforeEach } from "vitest";
import { MockConvexDatabase } from "./harness";
import * as library from "../convex/library";
import * as preferences from "../convex/preferences";

describe("Library Resources", () => {
  let db: MockConvexDatabase;
  const userA = { subject: "user_a", email: "alice@example.com" };
  const userB = { subject: "user_b", email: "bob@example.com" };

  beforeEach(() => {
    db = new MockConvexDatabase();
  });

  it("creates a library resource with an external URL", async () => {
    const ctxA = db.createContext(userA);

    const id = await library.create._handler(ctxA, {
      title: "MDN Web Docs",
      externalUrl: "https://developer.mozilla.org",
      kind: "reference",
      tags: ["web", "javascript", "docs"],
    });

    expect(id).toBeDefined();
    const list = await library.list._handler(ctxA, {});
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("MDN Web Docs");
    expect(list[0].externalUrl).toBe("https://developer.mozilla.org");
  });

  it("creates a library resource with a stored file", async () => {
    const ctxA = db.createContext(userA);

    const { uploadIntentId } = await library.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_lib_pdf_1";
    db.addStorageFile(storageId, { size: 1024 * 500, contentType: "application/pdf" });

    const id = await library.create._handler(ctxA, {
      title: "Data Structures Textbook",
      storageId,
      uploadIntentId,
      kind: "textbook",
      tags: ["cs", "algorithms"],
    });

    expect(id).toBeDefined();
    const list = await library.list._handler(ctxA, {});
    expect(list).toHaveLength(1);
    expect(list[0].storageId).toBe(storageId);
  });

  it("validates file size for library resources (50 MB limit)", async () => {
    const ctxA = db.createContext(userA);

    const { uploadIntentId } = await library.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_lib_huge";
    const bigSize = 51 * 1024 * 1024;
    db.addStorageFile(storageId, { size: bigSize, contentType: "application/pdf" });

    await expect(
      library.create._handler(ctxA, {
        title: "Huge File",
        storageId,
        uploadIntentId,
        kind: "other",
        tags: [],
      })
    ).rejects.toThrow("50 MB");
  });

  it("requires either storageId or externalUrl", async () => {
    const ctxA = db.createContext(userA);

    await expect(
      library.create._handler(ctxA, {
        title: "No Source",
        kind: "other",
        tags: [],
      })
    ).rejects.toThrow("stored file or an external link");
  });

  it("validates external URL scheme (must be HTTP/HTTPS)", async () => {
    const ctxA = db.createContext(userA);

    await expect(
      library.create._handler(ctxA, {
        title: "FTP Link",
        externalUrl: "ftp://files.example.com/document.pdf",
        kind: "file",
        tags: [],
      })
    ).rejects.toThrow("HTTP(S)");
  });

  it("enforces cross-user isolation on library resources", async () => {
    const ctxA = db.createContext(userA);
    const ctxB = db.createContext(userB);

    const id = await library.create._handler(ctxA, {
      title: "Alice's Resource",
      externalUrl: "https://example.com",
      kind: "link",
      tags: [],
    });

    // Bob should not see Alice's resources
    const bList = await library.list._handler(ctxB, {});
    expect(bList).toHaveLength(0);

    // Bob should not be able to update Alice's resource
    await expect(
      library.update._handler(ctxB, { resourceId: id, title: "Stolen" })
    ).rejects.toThrow();

    // Bob should not be able to delete Alice's resource
    await expect(library.deleteResource._handler(ctxB, { resourceId: id })).rejects.toThrow();
  });

  it("deletes library resource and its storage file", async () => {
    const ctxA = db.createContext(userA);

    const { uploadIntentId } = await library.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_lib_delete";
    db.addStorageFile(storageId, { size: 1000, contentType: "application/pdf" });

    const id = await library.create._handler(ctxA, {
      title: "To Delete",
      storageId,
      uploadIntentId,
      kind: "document",
      tags: [],
    });

    expect(db.storage.has(storageId)).toBe(true);

    await library.deleteResource._handler(ctxA, { resourceId: id });

    expect(db.storage.has(storageId)).toBe(false);
    const list = await library.list._handler(ctxA, {});
    expect(list).toHaveLength(0);
  });

  it("prevents using an upload intent belonging to another user", async () => {
    const ctxA = db.createContext(userA);
    const ctxB = db.createContext(userB);

    const { uploadIntentId: bIntent } = await library.generateUploadUrl._handler(ctxB, {});
    const storageId = "storage_cross_lib";
    db.addStorageFile(storageId, { size: 100, contentType: "application/pdf" });

    // User A tries to use User B's intent
    await expect(
      library.create._handler(ctxA, {
        title: "Cross User",
        storageId,
        uploadIntentId: bIntent,
        kind: "document",
        tags: [],
      })
    ).rejects.toThrow();
  });

  it("deduplicates and limits tags to 30", async () => {
    const ctxA = db.createContext(userA);

    const manyTags = Array.from({ length: 50 }, (_, i) => `tag${i}`);
    manyTags.push("tag0"); // duplicate

    const id = await library.create._handler(ctxA, {
      title: "Tagged Resource",
      externalUrl: "https://example.com",
      kind: "reference",
      tags: manyTags,
    });

    const list = await library.list._handler(ctxA, {});
    expect(list[0].tags.length).toBeLessThanOrEqual(30);
    // Check no duplicates
    const tagSet = new Set(list[0].tags);
    expect(tagSet.size).toBe(list[0].tags.length);
  });
});

describe("User Preferences", () => {
  let db: MockConvexDatabase;
  const userA = { subject: "user_a", email: "alice@example.com" };

  beforeEach(() => {
    db = new MockConvexDatabase();
  });

  it("returns default preferences when none are set", async () => {
    const ctxA = db.createContext(userA);

    const prefs = await preferences.get._handler(ctxA, {});
    expect(prefs.theme).toBe("system");
    expect(prefs.compactMode).toBe(false);
  });

  it("saves and retrieves preferences", async () => {
    const ctxA = db.createContext(userA);

    await preferences.update._handler(ctxA, { theme: "dark", compactMode: true });

    const prefs = await preferences.get._handler(ctxA, {});
    expect(prefs.theme).toBe("dark");
    expect(prefs.compactMode).toBe(true);
  });

  it("partially updates preferences (only theme)", async () => {
    const ctxA = db.createContext(userA);

    await preferences.update._handler(ctxA, { theme: "light", compactMode: true });
    await preferences.update._handler(ctxA, { theme: "dark" });

    const prefs = await preferences.get._handler(ctxA, {});
    expect(prefs.theme).toBe("dark");
    expect(prefs.compactMode).toBe(true); // unchanged
  });

  it("isolates preferences between users", async () => {
    const ctxA = db.createContext(userA);
    const ctxB = db.createContext({ subject: "user_b", email: "bob@example.com" });

    await preferences.update._handler(ctxA, { theme: "dark" });
    await preferences.update._handler(ctxB, { theme: "light" });

    const aPrefs = await preferences.get._handler(ctxA, {});
    const bPrefs = await preferences.get._handler(ctxB, {});
    expect(aPrefs.theme).toBe("dark");
    expect(bPrefs.theme).toBe("light");
  });
});

