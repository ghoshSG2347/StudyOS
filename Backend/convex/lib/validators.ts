import { v } from "convex/values";

export const nodeTypeValidator = v.union(
  v.literal("subject"),
  v.literal("chapter"),
  v.literal("topic"),
  v.literal("subtopic"),
  v.literal("item")
);

export const educationLevelValidator = v.union(
  v.literal("School"),
  v.literal("College / University")
);

export const academicMetadataValidator = v.object({
  credits: v.optional(v.string()),
  contactHours: v.optional(v.string()),
  totalContactHours: v.optional(v.string()),
  prerequisites: v.optional(v.string()),
  courseObjectives: v.optional(v.array(v.string())),
  courseOutcomes: v.optional(v.array(v.string())),
  textbooks: v.optional(v.array(v.string())),
  referenceBooks: v.optional(v.array(v.string())),
  department: v.optional(v.string()),
  programme: v.optional(v.string()),
  academicYear: v.optional(v.string()),
});

export const MAX_MATERIAL_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;     // 2 MB
export const MAX_LIBRARY_BYTES = 50 * 1024 * 1024;    // 50 MB

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALLOWED_LIBRARY_MIME_TYPES = new Set([
  ...ALLOWED_MIME_TYPES,
  "application/epub+zip",
  "application/msword",
  "text/csv",
  "application/json",
]);

export function materialKindFor(mime: string): "pdf" | "docx" | "text" | "slides" | "image" | "other" {
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("wordprocessingml") || mime === "application/msword") return "docx";
  if (mime.startsWith("text/")) return "text";
  if (mime.includes("presentation") || mime === "application/vnd.ms-powerpoint") return "slides";
  if (mime.startsWith("image/")) return "image";
  return "other";
}
