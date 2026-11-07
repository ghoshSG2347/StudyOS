import { useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex-api";
import {
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  FilmIcon,
  Image,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function isConvexId(value?: string): boolean {
  return typeof value === "string" && value.length > 15;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function mimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image size={18} />;
  if (mimeType === "application/pdf") return <FileText size={18} />;
  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
    return <FilmIcon size={18} />;
  if (
    mimeType === "text/csv" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return <FileSpreadsheet size={18} />;
  return <FileText size={18} />;
}

function mimeColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "var(--accent)";
  if (mimeType === "application/pdf") return "#e55";
  if (mimeType.includes("spreadsheet") || mimeType === "text/csv" || mimeType.includes("excel"))
    return "#1a9e5c";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "#e07b39";
  if (mimeType.includes("word") || mimeType.includes("msword")) return "#2b7de9";
  return "var(--ink-secondary)";
}

const ACCEPT_MIME =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain,text/markdown,image/png,image/jpeg,image/webp,image/gif";

// ─── sub-components ───────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="na-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="na-confirm-box" role="dialog" aria-modal="true">
        <p>{message}</p>
        <div className="na-confirm-actions">
          <button className="na-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="na-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function TextEditorModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: { title: string; content: string };
  onSave: (title: string, content: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(title.trim() || "Untitled note", content);
    setSaving(false);
  }

  return (
    <div className="na-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-text-editor" role="dialog" aria-modal="true" aria-label="Text document editor">
        <div className="na-te-header">
          <input
            className="na-te-title"
            placeholder="Document title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <button className="na-icon-btn" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <textarea
          className="na-te-body"
          placeholder="Paste or type your notes here. Markdown formatting is preserved."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="na-te-footer">
          <button className="na-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="na-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save document"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({
  url,
  mimeType,
  fileName,
  textContent,
  onClose,
}: {
  url: string;
  mimeType: string;
  fileName: string;
  textContent?: string | null;
  onClose: () => void;
}) {
  return (
    <div className="na-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-preview-modal" role="dialog" aria-modal="true" aria-label={`Preview: ${fileName}`}>
        <div className="na-preview-header">
          <span className="na-preview-name">{fileName}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <a className="na-btn-ghost" href={url} download={fileName} target="_blank" rel="noreferrer">
              <Download size={15} /> Download
            </a>
            <button className="na-icon-btn" aria-label="Close preview" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="na-preview-body">
          {mimeType.startsWith("image/") && (
            <img src={url} alt={fileName} className="na-preview-img" />
          )}
          {mimeType === "application/pdf" && (
            <iframe src={url} title={fileName} className="na-preview-frame" />
          )}
          {(mimeType.startsWith("text/") || mimeType === "text/markdown") && (
            <pre className="na-preview-text">{textContent ?? "Loading…"}</pre>
          )}
          {!mimeType.startsWith("image/") && mimeType !== "application/pdf" && !mimeType.startsWith("text/") && (
            <div className="na-preview-unsupported">
              <FileText size={48} style={{ opacity: 0.3 }} />
              <p>Preview unavailable for this file type.</p>
              <a className="na-btn-primary" href={url} download={fileName} target="_blank" rel="noreferrer">
                <Download size={15} /> Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── upload progress state ────────────────────────────────────────────────────

type UploadStatus = "uploading" | "done" | "error";
type UploadEntry = {
  id: string;
  name: string;
  status: UploadStatus;
  progress: number;
  error?: string;
};

// ─── inline rename ────────────────────────────────────────────────────────────

function InlineRename({
  initial,
  onDone,
  onCancel,
}: {
  initial: string;
  onDone: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <input
      className="na-inline-rename"
      value={value}
      autoFocus
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onDone(value.trim() || initial);
        if (e.key === "Escape") onCancel();
      }}
      onBlur={() => onDone(value.trim() || initial)}
    />
  );
}

// ─── Material row ─────────────────────────────────────────────────────────────

type MaterialDoc = {
  _id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  kind: string;
  createdAt: number;
  updatedAt?: number;
  textContent?: string;
};

function AttachmentRow({
  mat,
  onDelete,
  onRename,
  onEdit,
}: {
  mat: MaterialDoc;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onEdit: (mat: MaterialDoc) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const urlQuery = useQuery(
    api.materials.getFileUrl,
    { materialId: mat._id as any }
  );

  const isText = mat.mimeType.startsWith("text/") || mat.kind === "text";
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${mat.fileName}"? This cannot be undone.`}
          onConfirm={() => { setConfirmDelete(false); onDelete(mat._id); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      {previewOpen && urlQuery?.url && (
        <PreviewModal
          url={urlQuery.url}
          mimeType={mat.mimeType}
          fileName={mat.fileName}
          textContent={urlQuery.textContent}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <div className="na-row">
        <div className="na-row-icon" style={{ color: mimeColor(mat.mimeType) }}>
          {mat.mimeType.startsWith("image/") && urlQuery?.url ? (
            <img src={urlQuery.url} alt="" className="na-thumb" />
          ) : (
            mimeIcon(mat.mimeType)
          )}
        </div>
        <div className="na-row-meta">
          {renaming ? (
            <InlineRename
              initial={mat.fileName}
              onDone={(v) => { setRenaming(false); if (v !== mat.fileName) onRename(mat._id, v); }}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <span className="na-row-name" title={mat.fileName}>{mat.fileName}</span>
          )}
          <span className="na-row-info">{formatBytes(mat.fileSize)} · {formatDate(mat.createdAt)}</span>
        </div>
        <div className="na-row-actions">
          <button
            className="na-icon-btn"
            title={isText ? "Edit text" : "Preview"}
            onClick={() => isText ? onEdit(mat) : setPreviewOpen(true)}
          >
            {isText ? <Edit3 size={14} /> : <Eye size={14} />}
          </button>
          {!isText && urlQuery?.url && (
            <a
              className="na-icon-btn"
              href={urlQuery.url}
              download={mat.fileName}
              title="Download"
              target="_blank"
              rel="noreferrer"
            >
              <Download size={14} />
            </a>
          )}
          <button className="na-icon-btn" title="Rename" onClick={() => setRenaming(true)}>
            <Edit3 size={14} />
          </button>
          <button className="na-icon-btn na-icon-btn--danger" title="Delete" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NodeAttachments({ nodeId, isDemoRoute }: { nodeId: string; isDemoRoute: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<MaterialDoc | null>(null);
  const [dragging, setDragging] = useState(false);

  const canQuery = !isDemoRoute && isConvexId(nodeId);
  const materials = useQuery(api.materials.listByNode, canQuery ? { nodeId: nodeId as any } : "skip");

  const generateUploadUrl = useMutation(api.materials.generateUploadUrl);
  const saveAttachment = useMutation(api.materials.saveAttachment);
  const deleteAttachment = useMutation(api.materials.deleteAttachment);
  const renameAttachment = useMutation(api.materials.renameAttachment);
  const updateTextAttachment = useMutation(api.materials.updateTextAttachment);

  // ── upload pipeline ────────────────────────────────────────────────────────

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const capturedNodeId = nodeId; // capture at time of upload start
      const fileArray = Array.from(files);
      if (!fileArray.length) return;
      setAddPanelOpen(false);

      const newEntries: UploadEntry[] = fileArray.map((f) => ({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        status: "uploading" as const,
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...newEntries]);

      await Promise.all(
        fileArray.map(async (file, i) => {
          const entryId = newEntries[i].id;
          try {
            const { uploadUrl, intentId } = await generateUploadUrl();

            const xhr = new XMLHttpRequest();
            await new Promise<void>((resolve, reject) => {
              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  const pct = Math.round((e.loaded / e.total) * 100);
                  setUploads((prev) =>
                    prev.map((u) => (u.id === entryId ? { ...u, progress: pct } : u))
                  );
                }
              });
              xhr.addEventListener("load", () =>
                xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`))
              );
              xhr.addEventListener("error", () => reject(new Error("Network error")));
              xhr.open("POST", uploadUrl);
              xhr.setRequestHeader("Content-Type", file.type);
              xhr.send(file);
            });

            const body = JSON.parse(xhr.responseText) as { storageId: string };

            await saveAttachment({
              nodeId: capturedNodeId as any,
              storageId: body.storageId as any,
              uploadIntentId: intentId as any,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
            });

            setUploads((prev) =>
              prev.map((u) => (u.id === entryId ? { ...u, status: "done", progress: 100 } : u))
            );
            setTimeout(
              () => setUploads((prev) => prev.filter((u) => u.id !== entryId)),
              1800
            );
          } catch (err: any) {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === entryId
                  ? { ...u, status: "error", error: err?.message ?? "Upload failed" }
                  : u
              )
            );
          }
        })
      );
    },
    [nodeId, generateUploadUrl, saveAttachment]
  );

  // ── text document save ─────────────────────────────────────────────────────

  async function saveTextDocument(title: string, content: string) {
    const capturedNodeId = nodeId;

    if (editingMat) {
      // Update existing text document
      await updateTextAttachment({
        materialId: editingMat._id as any,
        textContent: content,
        fileName: title.endsWith(".md") ? title : `${title}.md`,
      });
      setEditingMat(null);
      setTextEditorOpen(false);
      return;
    }

    // Create new text document via upload
    const blob = new Blob([content], { type: "text/markdown" });
    const fileName = title.endsWith(".md") ? title : `${title}.md`;

    const { uploadUrl, intentId } = await generateUploadUrl();
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "text/markdown" },
      body: blob,
    });
    if (!res.ok) throw new Error("Upload failed");
    const { storageId } = (await res.json()) as { storageId: string };

    await saveAttachment({
      nodeId: capturedNodeId as any,
      storageId: storageId as any,
      uploadIntentId: intentId as any,
      fileName,
      fileSize: blob.size,
      mimeType: "text/markdown",
      textContent: content,
    });

    setTextEditorOpen(false);
  }

  // ── drag-and-drop ──────────────────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave() { setDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  // ── delete / rename ────────────────────────────────────────────────────────

  async function handleDelete(materialId: string) {
    await deleteAttachment({ materialId: materialId as any });
  }

  async function handleRename(materialId: string, fileName: string) {
    await renameAttachment({ materialId: materialId as any, fileName });
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (isDemoRoute) {
    return (
      <div className="na-demo-notice">
        <Paperclip size={22} />
        <p>Sign in to attach files and documents to your study nodes.</p>
      </div>
    );
  }

  if (!isConvexId(nodeId)) {
    return (
      <div className="na-empty">
        <Paperclip size={22} />
        <p>Select a node to manage its attachments.</p>
      </div>
    );
  }

  return (
    <div
      className={`na-root${dragging ? " na-dragging" : ""}`}
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* header */}
      <div className="na-header">
        <div className="na-add-wrapper">
          <button
            className="na-add-btn"
            onClick={() => setAddPanelOpen((o) => !o)}
            title="Add attachment"
          >
            <Plus size={14} /> Add attachment
          </button>
          {addPanelOpen && (
            <div className="na-add-panel">
              <button
                className="na-add-panel-item"
                onClick={() => { setAddPanelOpen(false); fileInputRef.current?.click(); }}
              >
                <Upload size={14} /> Upload files
              </button>
              <button
                className="na-add-panel-item"
                onClick={() => { setAddPanelOpen(false); setEditingMat(null); setTextEditorOpen(true); }}
              >
                <FileText size={14} /> Add text document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_MIME}
        multiple
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }}
      />

      {/* upload progress entries */}
      {uploads.map((u) => (
        <div key={u.id} className={`na-upload-row na-upload-${u.status}`}>
          <span className="na-upload-name">{u.name}</span>
          {u.status === "uploading" && (
            <div className="na-progress-bar">
              <div className="na-progress-fill" style={{ width: `${u.progress}%` }} />
            </div>
          )}
          {u.status === "error" && <span className="na-upload-err">{u.error}</span>}
          {u.status === "done" && <span className="na-upload-done">✓ Saved</span>}
        </div>
      ))}

      {/* attachment list */}
      {materials === undefined && <p className="na-loading">Loading…</p>}
      {materials?.length === 0 && uploads.length === 0 && (
        <div className="na-empty">
          <Paperclip size={28} />
          <p>No attachments yet.</p>
          <span>Drag & drop files here, or use "Add attachment" above.</span>
        </div>
      )}
      {materials?.map((mat: MaterialDoc) => (
        <AttachmentRow
          key={mat._id}
          mat={mat}
          onDelete={handleDelete}
          onRename={handleRename}
          onEdit={(m) => { setEditingMat(m); setTextEditorOpen(true); }}
        />
      ))}

      {/* drag drop hint */}
      {dragging && (
        <div className="na-drop-hint">
          <Upload size={32} />
          <p>Drop files to attach</p>
        </div>
      )}

      {/* text editor modal */}
      {textEditorOpen && (
        <TextEditorModal
          initial={editingMat ? { title: editingMat.fileName.replace(/\.md$/, ""), content: editingMat.textContent ?? "" } : undefined}
          onSave={saveTextDocument}
          onClose={() => { setTextEditorOpen(false); setEditingMat(null); }}
        />
      )}
    </div>
  );
}

