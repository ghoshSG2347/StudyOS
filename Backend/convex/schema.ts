import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const educationLevel = v.union(v.literal("School"), v.literal("College / University"));
const nodeType = v.union(v.literal("subject"), v.literal("chapter"), v.literal("topic"), v.literal("subtopic"), v.literal("item"));
const materialKind = v.union(v.literal("pdf"), v.literal("docx"), v.literal("text"), v.literal("slides"), v.literal("image"), v.literal("other"));

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    fullName: v.string(),
    email: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
    institute: v.optional(v.string()),
    educationLevel: v.optional(educationLevel),
    schoolDetails: v.optional(v.object({ currentClass: v.string() })),
    collegeDetails: v.optional(v.object({ courseOrBranch: v.string(), currentSemester: v.string() })),
    completedOnboarding: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_avatarStorageId", ["avatarStorageId"]),

  syllabuses: defineTable({
    userId: v.string(),
    name: v.string(),
    code: v.optional(v.string()),
    metadata: v.optional(v.any()),
    source: v.optional(v.string()),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_updatedAt", ["userId", "updatedAt"]),

  syllabusNodes: defineTable({
    syllabusId: v.id("syllabuses"),
    userId: v.string(),
    parentId: v.optional(v.id("syllabusNodes")),
    name: v.string(),
    type: nodeType,
    order: v.number(),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_syllabusId", ["syllabusId"])
    .index("by_syllabusId_parentId", ["syllabusId", "parentId"])
    .index("by_userId", ["userId"]),

  nodeNotes: defineTable({
    nodeId: v.id("syllabusNodes"),
    syllabusId: v.id("syllabuses"),
    userId: v.string(),
    content: v.string(),
    updatedAt: v.number(),
  })
    .index("by_nodeId", ["nodeId"])
    .index("by_syllabusId", ["syllabusId"])
    .index("by_userId", ["userId"])
    .index("by_userId_nodeId", ["userId", "nodeId"]),

  materials: defineTable({
    nodeId: v.id("syllabusNodes"),
    syllabusId: v.id("syllabuses"),
    userId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    kind: materialKind,
    textContent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_nodeId", ["nodeId"])
    .index("by_syllabusId", ["syllabusId"])
    .index("by_userId", ["userId"])
    .index("by_storageId", ["storageId"]),

  uploadIntents: defineTable({
    userId: v.string(),
    purpose: v.union(v.literal("material"), v.literal("avatar"), v.literal("library")),
    storageId: v.optional(v.id("_storage")),
    consumed: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_purpose", ["userId", "purpose"]),

  libraryResources: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    externalUrl: v.optional(v.string()),
    kind: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_storageId", ["storageId"]),

  userPreferences: defineTable({
    userId: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    compactMode: v.optional(v.boolean()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),
});
