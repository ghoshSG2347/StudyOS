import { describe, it, expect, beforeEach } from "vitest";
import { MockConvexDatabase } from "./harness";
import * as syllabuses from "../convex/syllabuses";
import * as nodes from "../convex/nodes";
import * as notes from "../convex/notes";
import * as materials from "../convex/materials";

describe("Notes", () => {
  let db: MockConvexDatabase;
  const userA = { subject: "user_a", email: "alice@example.com" };
  const userB = { subject: "user_b", email: "bob@example.com" };

  async function setup() {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Test Syllabus" });
    const nodeId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Test Node",
      type: "subject",
    });
    return { ctxA, syllabusId, nodeId };
  }

  beforeEach(() => {
    db = new MockConvexDatabase();
  });

  it("saves and retrieves a note for a node", async () => {
    const { ctxA, nodeId } = await setup();

    const noteId = await notes.save._handler(ctxA, {
      nodeId,
      content: "My study notes here",
    });
    expect(noteId).toBeDefined();

    const retrieved = await notes.getByNode._handler(ctxA, { nodeId });
    expect(retrieved).not.toBeNull();
    expect(retrieved?.content).toBe("My study notes here");
  });

  it("updates existing note on second save (upsert behavior)", async () => {
    const { ctxA, nodeId } = await setup();

    await notes.save._handler(ctxA, { nodeId, content: "Initial content" });
    await notes.save._handler(ctxA, { nodeId, content: "Updated content" });

    const retrieved = await notes.getByNode._handler(ctxA, { nodeId });
    expect(retrieved?.content).toBe("Updated content");

    // Only one note record should exist
    const allNotes = Array.from(db.tables.get("nodeNotes")?.values() ?? []);
    expect(allNotes).toHaveLength(1);
  });

  it("deletes note when empty content is saved", async () => {
    const { ctxA, nodeId } = await setup();

    await notes.save._handler(ctxA, { nodeId, content: "Note to delete" });
    await notes.save._handler(ctxA, { nodeId, content: "   " }); // whitespace-only

    const retrieved = await notes.getByNode._handler(ctxA, { nodeId });
    expect(retrieved).toBeNull();

    const allNotes = Array.from(db.tables.get("nodeNotes")?.values() ?? []);
    expect(allNotes).toHaveLength(0);
  });

  it("removes a note via remove mutation", async () => {
    const { ctxA, nodeId } = await setup();

    await notes.save._handler(ctxA, { nodeId, content: "To be removed" });
    await notes.remove._handler(ctxA, { nodeId });

    const retrieved = await notes.getByNode._handler(ctxA, { nodeId });
    expect(retrieved).toBeNull();
  });

  it("prevents user B from reading user A's note", async () => {
    const { ctxA, nodeId } = await setup();
    const ctxB = db.createContext(userB);

    await notes.save._handler(ctxA, { nodeId, content: "Private note" });

    // User B does not own this node, so getByNode should throw
    await expect(notes.getByNode._handler(ctxB, { nodeId })).rejects.toThrow();
  });

  it("rejects notes exceeding 500 KB", async () => {
    const { ctxA, nodeId } = await setup();
    const bigContent = "x".repeat(500_001);

    await expect(
      notes.save._handler(ctxA, { nodeId, content: bigContent })
    ).rejects.toThrow("500 KB");
  });
});

describe("Materials (Attachments)", () => {
  let db: MockConvexDatabase;
  const userA = { subject: "user_a", email: "alice@example.com" };
  const userB = { subject: "user_b", email: "bob@example.com" };

  async function setup() {
    const ctxA = db.createContext(userA);
    const syllabusId = await syllabuses.create._handler(ctxA, { name: "Test Syllabus" });
    const nodeId = await nodes.create._handler(ctxA, {
      syllabusId,
      name: "Test Node",
      type: "subject",
    });
    return { ctxA, syllabusId, nodeId };
  }

  beforeEach(() => {
    db = new MockConvexDatabase();
  });

  it("generates upload URL and saves a material attachment", async () => {
    const { ctxA, nodeId } = await setup();

    const { uploadUrl, intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    expect(uploadUrl).toContain("upload");
    expect(intentId).toBeDefined();

    const storageId = "storage_pdf_1";
    db.addStorageFile(storageId, { size: 1024 * 100, contentType: "application/pdf" });

    const materialId = await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId,
      uploadIntentId: intentId,
      fileName: "lecture-notes.pdf",
      fileSize: 1024 * 100,
      mimeType: "application/pdf",
    });

    expect(materialId).toBeDefined();

    const list = await materials.listByNode._handler(ctxA, { nodeId });
    expect(list).toHaveLength(1);
    expect(list[0].fileName).toBe("lecture-notes.pdf");
  });

  it("prevents using an upload intent belonging to another user", async () => {
    const { ctxA, nodeId } = await setup();
    const ctxB = db.createContext(userB);

    // User B generates an intent
    const { intentId: bIntentId } = await materials.generateUploadUrl._handler(ctxB, {});

    const storageId = "storage_pdf_cross";
    db.addStorageFile(storageId, { size: 1000, contentType: "application/pdf" });

    // User A tries to use User B's intent
    await expect(
      materials.saveAttachment._handler(ctxA, {
        nodeId,
        storageId,
        uploadIntentId: bIntentId,
        fileName: "malicious.pdf",
        fileSize: 1000,
        mimeType: "application/pdf",
      })
    ).rejects.toThrow();
  });

  it("prevents user B from listing user A's materials", async () => {
    const { ctxA, nodeId } = await setup();
    const ctxB = db.createContext(userB);

    // User B cannot list materials for user A's node (node ownership check)
    await expect(materials.listByNode._handler(ctxB, { nodeId })).rejects.toThrow();
  });

  it("prevents using same storage ID twice (double-claim prevention)", async () => {
    const { ctxA, nodeId } = await setup();

    const { intentId: intentId1 } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_pdf_once";
    db.addStorageFile(storageId, { size: 500, contentType: "application/pdf" });

    // First save succeeds
    await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId,
      uploadIntentId: intentId1,
      fileName: "original.pdf",
      fileSize: 500,
      mimeType: "application/pdf",
    });

    // Attempt to claim the same storage ID again
    const { intentId: intentId2 } = await materials.generateUploadUrl._handler(ctxA, {});
    await expect(
      materials.saveAttachment._handler(ctxA, {
        nodeId,
        storageId,
        uploadIntentId: intentId2,
        fileName: "duplicate.pdf",
        fileSize: 500,
        mimeType: "application/pdf",
      })
    ).rejects.toThrow("already associated");
  });

  it("rejects unsupported MIME types", async () => {
    const { ctxA, nodeId } = await setup();

    const { intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_exe_1";
    db.addStorageFile(storageId, { size: 100, contentType: "application/x-msdownload" });

    await expect(
      materials.saveAttachment._handler(ctxA, {
        nodeId,
        storageId,
        uploadIntentId: intentId,
        fileName: "malware.exe",
        fileSize: 100,
        mimeType: "application/x-msdownload",
      })
    ).rejects.toThrow("Unsupported file type");
  });

  it("rejects files exceeding 25 MB", async () => {
    const { ctxA, nodeId } = await setup();

    const { intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    const oversizeStorageId = "storage_huge_pdf";
    const bigSize = 26 * 1024 * 1024;
    db.addStorageFile(oversizeStorageId, { size: bigSize, contentType: "application/pdf" });

    await expect(
      materials.saveAttachment._handler(ctxA, {
        nodeId,
        storageId: oversizeStorageId,
        uploadIntentId: intentId,
        fileName: "huge.pdf",
        fileSize: bigSize,
        mimeType: "application/pdf",
      })
    ).rejects.toThrow("25 MB");
  });

  it("deletes a material and its storage file", async () => {
    const { ctxA, nodeId } = await setup();

    const { intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_delete_me";
    db.addStorageFile(storageId, { size: 200, contentType: "application/pdf" });

    const materialId = await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId,
      uploadIntentId: intentId,
      fileName: "delete.pdf",
      fileSize: 200,
      mimeType: "application/pdf",
    });

    expect(db.storage.has(storageId)).toBe(true);

    await materials.deleteAttachment._handler(ctxA, { materialId });

    expect(db.storage.has(storageId)).toBe(false);
    const remaining = Array.from(db.tables.get("materials")?.values() ?? []);
    expect(remaining).toHaveLength(0);
  });

  it("prevents user B from deleting user A's material", async () => {
    const { ctxA, nodeId } = await setup();
    const ctxB = db.createContext(userB);

    const { intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_protect_me";
    db.addStorageFile(storageId, { size: 300, contentType: "application/pdf" });

    const materialId = await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId,
      uploadIntentId: intentId,
      fileName: "protected.pdf",
      fileSize: 300,
      mimeType: "application/pdf",
    });

    await expect(materials.deleteAttachment._handler(ctxB, { materialId })).rejects.toThrow();
    expect(db.storage.has(storageId)).toBe(true);
  });

  it("renames an attachment and enforces ownership", async () => {
    const { ctxA, nodeId } = await setup();
    const ctxB = db.createContext(userB);

    const { intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_rename_test";
    db.addStorageFile(storageId, { size: 400, contentType: "application/pdf" });

    const materialId = await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId,
      uploadIntentId: intentId,
      fileName: "old-name.pdf",
      fileSize: 400,
      mimeType: "application/pdf",
    });

    // User B cannot rename User A's attachment
    await expect(
      materials.renameAttachment._handler(ctxB, { materialId, fileName: "hacked.pdf" })
    ).rejects.toThrow();

    // User A successfully renames
    await materials.renameAttachment._handler(ctxA, { materialId, fileName: "new-name.pdf" });
    const list = await materials.listByNode._handler(ctxA, { nodeId });
    expect(list[0].fileName).toBe("new-name.pdf");
  });

  it("supports spreadsheets, presentations, and word documents", async () => {
    const { ctxA, nodeId } = await setup();

    // Excel spreadsheet
    const { intentId: intent1 } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageXlsx = "storage_excel";
    db.addStorageFile(storageXlsx, { size: 800, contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId: storageXlsx,
      uploadIntentId: intent1,
      fileName: "budget.xlsx",
      fileSize: 800,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Word doc (.doc)
    const { intentId: intent2 } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageDoc = "storage_doc";
    db.addStorageFile(storageDoc, { size: 600, contentType: "application/msword" });
    await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId: storageDoc,
      uploadIntentId: intent2,
      fileName: "syllabus.doc",
      fileSize: 600,
      mimeType: "application/msword",
    });

    const list = await materials.listByNode._handler(ctxA, { nodeId });
    expect(list).toHaveLength(2);
  });

  it("creates, reads, and updates a text document attachment", async () => {
    const { ctxA, nodeId } = await setup();

    const { intentId } = await materials.generateUploadUrl._handler(ctxA, {});
    const storageId = "storage_txt_1";
    const initialText = "# Laser Physics\nKey formulas and notes.";
    db.addStorageFile(storageId, { size: 120, contentType: "text/markdown" });

    const materialId = await materials.saveAttachment._handler(ctxA, {
      nodeId,
      storageId,
      uploadIntentId: intentId,
      fileName: "Laser_Notes.md",
      fileSize: 120,
      mimeType: "text/markdown",
      textContent: initialText,
    });

    // Read back text content
    const fileData = await materials.getFileUrl._handler(ctxA, { materialId });
    expect(fileData.fileName).toBe("Laser_Notes.md");
    expect(fileData.textContent).toBe(initialText);

    // Update text content
    const updatedText = "# Laser Physics (Updated)\nExpanded section on lasers.";
    await materials.updateTextAttachment._handler(ctxA, {
      materialId,
      textContent: updatedText,
      fileName: "Laser_Notes_v2.md",
    });

    const updatedData = await materials.getFileUrl._handler(ctxA, { materialId });
    expect(updatedData.fileName).toBe("Laser_Notes_v2.md");
    expect(updatedData.textContent).toBe(updatedText);
  });
});

