import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex-api";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  Folder,
  FolderOpen,
  GraduationCap,
  Library,
  LogOut,
  Minus,
  Moon,
  MoreHorizontal,
  Pencil,
  Paperclip,
  Plus,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";
import { useProfile } from "@/hooks/useProfile";
import { ProfileView } from "@/components/profile/ProfileView";
import { NodeAttachments } from "@/components/workspace/NodeAttachments";
import {
  parseAcademicSyllabus,
  parseSyllabusFile,
  type ParsedCourse,
  type ExtractionResult,
} from "@/lib/syllabus-parser";
import "@/styles/workspace.css";

type ItemType = "subject" | "chapter" | "topic" | "subtopic" | "item";

type StudyNode = {
  id: string;
  name: string;
  type: ItemType;
  completed: boolean;
  children: StudyNode[];
};

type Syllabus = {
  id: string;
  name: string;
  code?: string;
  metadata?: any;
  source?: string;
  tree: StudyNode[];
  totalLeaves?: number;
  completedLeaves?: number;
  percentComplete?: number;
};

type Activity = "syllabus" | "import" | "library" | "settings" | "profile";
type Page = "list" | "workspace" | "import" | "review";
type Tab = "Tree" | "Notes" | "Materials" | "Ask AI";

const id = () => Math.random().toString(36).slice(2, 10);
const node = (name: string, children: StudyNode[] = [], completed = false, type: ItemType = "item"): StudyNode => ({ id: id(), name, type, completed, children });

function assignItemTypes(items: StudyNode[], depth = 0): StudyNode[] {
  const types: ItemType[] = ["subject", "chapter", "topic", "subtopic"];
  return items.map((item) => ({ ...item, type: types[depth] ?? "item", children: assignItemTypes(item.children, depth + 1) }));
}

function isConvexId(value?: string): boolean {
  if (!value) return false;
  return typeof value === "string" && value.length > 15;
}

function mapConvexNodeToStudyNode(n: any): StudyNode {
  return {
    id: n._id || n.id || id(),
    name: n.name || "Untitled",
    type: ["subject", "chapter", "topic", "subtopic", "item"].includes(n.type) ? n.type : "item",
    completed: Boolean(n.completed),
    children: Array.isArray(n.children) ? n.children.map(mapConvexNodeToStudyNode) : [],
  };
}

function mapStudyNodeToInitialTree(nodes: StudyNode[]): any[] {
  return (nodes || [])
    .filter((n) => n && typeof n.name === 'string' && n.name.trim().length > 0)
    .map((n, i) => {
      let cleanName = n.name.trim();
      if (cleanName.length > 200) {
        cleanName = cleanName.slice(0, 197) + '...';
      }
      return {
        name: cleanName,
        type: n.type,
        order: i,
        completed: Boolean(n.completed),
        children: mapStudyNodeToInitialTree(n.children || []),
      };
    });
}

/**
 * Parses raw pasted or uploaded syllabus text into a nested StudyNode tree.
 * Understands markdown headings (#, ##), indentation, numbering (1., 1.1),
 * Unit/Module markers, and bullet points.
 */
function parseSyllabusText(rawText: string): StudyNode[] {
  const result = parseAcademicSyllabus(rawText);
  return result.courses[0]?.tree || [];
}

const initialDemoSyllabuses: Syllabus[] = [
  {
    id: "sem3",
    name: "3rd Semester CSE",
    source: "MAKAUT_CSE_Sem3_Syllabus_2026.pdf",
    tree: [
      node("Data Structures", [
        node("Arrays", [node("Array Traversal", [], true), node("Searching", [], true), node("Sorting")]),
        node("Linked Lists", [node("Singly Linked List", [], true), node("Doubly Linked List")]),
        node("Trees", [node("Binary Trees"), node("Tree Traversal")]),
      ]),
      node("Digital Electronics", [node("Logic Gates", [], true), node("Flip-Flops")]),
      node("Mathematics", [node("Matrices"), node("Differential Equations")]),
    ],
  },
  { id: "python", name: "Python Fundamentals", tree: [node("Python Basics", [node("Variables and Types"), node("Control Flow"), node("Functions")]), node("Data Structures", [node("Lists"), node("Dictionaries")])] },
  { id: "math11", name: "Class 11 Mathematics", tree: [node("Algebra", [node("Sets"), node("Sequences and Series")]), node("Calculus", [node("Limits"), node("Derivatives")])] },
  { id: "sem2", name: "2nd Semester CSE", tree: [node("Programming", [node("C Fundamentals"), node("Algorithms")]), node("Mathematics", [node("Linear Algebra")])] },
].map((syllabus) => ({ ...syllabus, tree: assignItemTypes(syllabus.tree) }));

function allNodes(nodes: StudyNode[]): StudyNode[] {
  return nodes.flatMap((item) => [item, ...allNodes(item.children)]);
}

function findNode(nodes: StudyNode[], targetId: string): StudyNode | undefined {
  for (const item of nodes) {
    if (item.id === targetId) return item;
    const found = findNode(item.children, targetId);
    if (found) return found;
  }
}

function findPath(nodes: StudyNode[], targetId: string, path: StudyNode[] = []): StudyNode[] | undefined {
  for (const item of nodes) {
    const next = [...path, item];
    if (item.id === targetId) return next;
    const found = findPath(item.children, targetId, next);
    if (found) return found;
  }
}

function updateTree(nodes: StudyNode[], targetId: string, update: (item: StudyNode) => StudyNode): StudyNode[] {
  return nodes.map((item) => (item.id === targetId ? update(item) : { ...item, children: updateTree(item.children, targetId, update) }));
}

function removeTreeNode(nodes: StudyNode[], targetId: string): StudyNode[] {
  return nodes.filter((item) => item.id !== targetId).map((item) => ({ ...item, children: removeTreeNode(item.children, targetId) }));
}

function leafNodes(item: StudyNode): StudyNode[] {
  if (!item.children.length) return [item];
  return item.children.flatMap(leafNodes);
}

function progressOf(item: StudyNode) {
  const leaves = leafNodes(item);
  const complete = leaves.filter((leaf) => leaf.completed).length;
  return { complete, total: leaves.length, percent: leaves.length ? Math.round((complete / leaves.length) * 100) : 0 };
}

function addActionsFor(type: ItemType) {
  switch (type) {
    case "subject":
      return [{ label: "Add chapter", itemType: "chapter" as const, sameLevel: false }, { label: "Add subject", itemType: "subject" as const, sameLevel: true }];
    case "chapter":
      return [{ label: "Add topic", itemType: "topic" as const, sameLevel: false }, { label: "Add chapter", itemType: "chapter" as const, sameLevel: true }];
    case "topic":
      return [{ label: "Add subtopic", itemType: "subtopic" as const, sameLevel: false }, { label: "Add topic", itemType: "topic" as const, sameLevel: true }];
    case "subtopic":
      return [{ label: "Add item", itemType: "item" as const, sameLevel: false }, { label: "Add subtopic", itemType: "subtopic" as const, sameLevel: true }];
    case "item":
      return [{ label: "Add item", itemType: "item" as const, sameLevel: false }];
  }
}

function placeholderFor(type: ItemType) {
  const labels: Record<ItemType, string> = { subject: "New subject…", chapter: "New chapter…", topic: "New topic…", subtopic: "New subtopic…", item: "New item…" };
  return labels[type];
}

function IconButton({ label, children, onClick, className = "" }: { label: string; children: React.ReactNode; onClick: () => void; className?: string }) {
  return <button type="button" aria-label={label} title={label} className={`icon-button ${className}`} onClick={onClick}>{children}</button>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <IconButton label="Close dialog" onClick={onClose}><X size={17} /></IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function WorkspacePage({ initialActivity }: { initialActivity?: Activity } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { syllabusId } = useParams<{ syllabusId?: string }>();
  const isDemoRoute = location.pathname.startsWith("/workspace/demo");
  const basePath = isDemoRoute ? "/workspace/demo" : "/workspace";
  const { theme, toggle: toggleTheme } = useTheme();
  const { profile, updateProfile, initials } = useProfile();

  const [activeId, setActiveId] = useState(syllabusId || "");

  // Convex live queries & mutations (active when authenticated)
  const convexSyllabuses = useQuery(api.syllabuses.list, isDemoRoute ? "skip" : {});
  const activeTreeData = useQuery(
    api.syllabuses.getTree,
    !isDemoRoute && activeId && isConvexId(activeId) ? { syllabusId: activeId as any } : "skip"
  );

  const createSyllabusMutation = useMutation(api.syllabuses.create);
  const renameSyllabusMutation = useMutation(api.syllabuses.rename);
  const deleteSyllabusMutation = useMutation(api.syllabuses.deleteSyllabus);
  const createNodeMutation = useMutation(api.nodes.create);
  const renameNodeMutation = useMutation(api.nodes.rename);
  const toggleCompleteMutation = useMutation(api.nodes.toggleComplete);
  const deleteNodeMutation = useMutation(api.nodes.deleteNode);
  const saveNoteMutation = useMutation(api.notes.save);

  // Demo fallback state (used only when in demo route)
  const [demoSyllabuses, setDemoSyllabuses] = useState<Syllabus[]>(initialDemoSyllabuses);
  const [activity, setActivity] = useState<Activity>(() => {
    if (initialActivity) return initialActivity;
    if (location.pathname.endsWith("/profile")) return "profile";
    return "syllabus";
  });
  const [page, setPage] = useState<Page>(syllabusId ? "workspace" : "list");
  const [selectedId, setSelectedId] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("Tree");
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Compute unified syllabuses list
  const syllabuses: Syllabus[] = useMemo(() => {
    if (isDemoRoute) return demoSyllabuses;
    if (!convexSyllabuses) return [];
    return convexSyllabuses.map((cs: any) => ({
      id: cs._id,
      name: cs.name,
      code: cs.code,
      metadata: cs.metadata,
      source: cs.source,
      tree: cs._id === activeId && activeTreeData?.tree ? activeTreeData.tree.map(mapConvexNodeToStudyNode) : [],
      totalLeaves: cs.totalLeaves,
      completedLeaves: cs.completedLeaves,
      percentComplete: cs.percentComplete,
    }));
  }, [isDemoRoute, demoSyllabuses, convexSyllabuses, activeId, activeTreeData]);

  // Sync route param with active state
  useEffect(() => {
    if (syllabusId) {
      setActiveId(syllabusId);
      setPage("workspace");
      setActivity("syllabus");
    } else {
      setActiveId("");
      setPage("list");
      setActivity("syllabus");
    }
  }, [syllabusId]);

  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ type: "add"; parentId: string | null; anchorId: string | null; itemType: ItemType; value: string } | { type: "rename"; nodeId: string; value: string } | null>(null);
  const [inlineError, setInlineError] = useState("");
  const [dialog, setDialog] = useState<{ kind: "create" | "renameSyllabus" | "deleteSyllabus" | "deleteNode"; syllabusId?: string; nodeId?: string } | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [method, setMethod] = useState<"file" | "paste" | "manual">("paste");
  const [importName, setImportName] = useState("");
  const [importNameError, setImportNameError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [importError, setImportError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewTree, setReviewTree] = useState<StudyNode[]>([]);
  const [reviewSource, setReviewSource] = useState("");
  const [detectedCourses, setDetectedCourses] = useState<ParsedCourse[]>([]);
  const [activeCourseIdx, setActiveCourseIdx] = useState(0);
  const [selectedCourseIndices, setSelectedCourseIndices] = useState<Set<number>>(new Set());
  const [reviewCode, setReviewCode] = useState<string | undefined>(undefined);
  const [reviewMetadata, setReviewMetadata] = useState<any>(undefined);
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const noteSaveTimeoutRef = useRef<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const activeSyllabus = syllabuses.find((item) => item.id === activeId);

  // Compute active tree
  const tree: StudyNode[] = useMemo(() => {
    if (page === "review") return reviewTree;
    if (isDemoRoute) return activeSyllabus?.tree ?? [];
    if (activeTreeData?.tree) return activeTreeData.tree.map(mapConvexNodeToStudyNode);
    return [];
  }, [page, reviewTree, isDemoRoute, activeSyllabus?.tree, activeTreeData?.tree]);

  // Sync expanded set and validate selected node
  useEffect(() => {
    if (tree.length > 0) {
      // Auto-expand all branch nodes so the tree is immediately browsable
      setExpanded((prev) => {
        if (prev.size === 0) {
          return new Set(allNodes(tree).filter((n) => n.children.length).map((n) => n.id));
        }
        return prev;
      });
      // If selectedId no longer exists in tree, clear it to show root overview
      if (selectedId && !findNode(tree, selectedId)) {
        setSelectedId("");
      }
    } else {
      setSelectedId("");
    }
  }, [tree, selectedId]);

  const current = selectedId ? findNode(tree, selectedId) : undefined;
  const path = selectedId ? findPath(tree, selectedId) : undefined;
  const progress = current ? progressOf(current) : null;
  const selectedAddAction = current ? addActionsFor(current.type)[0] : null;

  // Active node's live note query from Convex
  const liveNodeNote = useQuery(
    api.notes.getByNode,
    !isDemoRoute && current?.id && isConvexId(current.id) ? { nodeId: current.id as any } : "skip"
  );

  useEffect(() => {
    if (!isDemoRoute && current?.id && liveNodeNote !== undefined) {
      setNotes((prev) => ({
        ...prev,
        [current.id]: liveNodeNote?.content ?? "",
      }));
    }
  }, [isDemoRoute, current?.id, liveNodeNote]);

  const handleNoteChange = (text: string) => {
    if (!current) return;
    const nodeId = current.id;
    setNotes((prev) => ({ ...prev, [nodeId]: text }));

    if (!isDemoRoute && isConvexId(nodeId)) {
      if (noteSaveTimeoutRef.current) clearTimeout(noteSaveTimeoutRef.current);
      noteSaveTimeoutRef.current = window.setTimeout(async () => {
        try {
          await saveNoteMutation({ nodeId: nodeId as any, content: text });
        } catch (err) {
          console.warn("Failed to persist note to backend:", err);
        }
      }, 500);
    }
  };

  const openImport = () => {
    if (page === "import" && activity === "import") return;
    if (!finishInlineEdit()) return;
    if (page === "review" && reviewTree.length && !window.confirm("Your review edits have not been added to the Syllabus List. Start a new import and discard them?")) return;
    setActivity("import"); setPage("import"); setImportName(""); setImportNameError(""); setFile(null); setPastedText(""); setImportError(""); setMethod("paste"); setBusy(false); setNotice(""); setReviewTree([]); setReviewSource(""); setDetectedCourses([]); setActiveCourseIdx(0); setSelectedCourseIndices(new Set()); setReviewCode(undefined); setReviewMetadata(undefined);
  };

  const openCreate = () => {
    setShowCreateMenu(false); setName(""); setNameError(""); setDialog({ kind: "create" });
  };

  function buildUnifiedTree(courses: ParsedCourse[], selectedIndices?: Set<number>): StudyNode[] {
    const active = selectedIndices
      ? courses.filter((_, idx) => selectedIndices.has(idx))
      : courses;

    if (active.length === 0) return [];

    // Multi-subject document (e.g. Semester 1): create top-level Subject nodes with codes
    if (courses.length > 1) {
      return active.map((c) => ({
        id: c.id || id(),
        name: c.code ? `[${c.code}] ${c.name}` : c.name,
        type: "subject" as ItemType,
        completed: false,
        children: c.tree,
      }));
    }

    // Single subject
    const single = active[0];
    if (single.code) {
      return [{
        id: single.id || id(),
        name: `[${single.code}] ${single.name}`,
        type: "subject" as ItemType,
        completed: false,
        children: single.tree,
      }];
    }
    return single.tree;
  }

  const selectReviewCourse = (index: number) => {
    if (index < 0 || index >= detectedCourses.length) return;
    if (!finishInlineEdit()) return;
    setActiveCourseIdx(index);
    const course = detectedCourses[index];
    setReviewCode(course.code);
    setReviewMetadata(course.metadata);
  };

  const toggleCourseSelection = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCourseIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        if (next.size <= 1) return prev; // Keep at least one subject
        next.delete(index);
      } else {
        next.add(index);
      }
      setReviewTree(buildUnifiedTree(detectedCourses, next));
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCourseIndices.size === detectedCourses.length) {
      const single = new Set([0]);
      setSelectedCourseIndices(single);
      setReviewTree(buildUnifiedTree(detectedCourses, single));
    } else {
      const all = new Set(detectedCourses.map((_, i) => i));
      setSelectedCourseIndices(all);
      setReviewTree(buildUnifiedTree(detectedCourses, all));
    }
  };

  const createEmpty = async (syllabusName: string) => {
    const trimmed = syllabusName.trim();
    if (!isDemoRoute) {
      try {
        const newId = await createSyllabusMutation({ name: trimmed });
        setActiveId(newId);
        setSelectedId("");
        setExpanded(new Set());
        setActivity("syllabus");
        setPage("workspace");
        setDialog(null);
        setNotice("Workspace created.");
        navigate(`${basePath}/${newId}`, { replace: true });
        return;
      } catch (err: any) {
        setNameError(err?.message || "Failed to create syllabus.");
        return;
      }
    }

    const newSyllabus: Syllabus = { id: id(), name: trimmed, tree: [] };
    setDemoSyllabuses((items) => [newSyllabus, ...items]);
    setActiveId(newSyllabus.id);
    setSelectedId(""); setExpanded(new Set()); setActivity("syllabus"); setPage("workspace");
    setDialog(null); setNotice("Workspace created in this demo session.");
    navigate(`${basePath}/${newSyllabus.id}`, { replace: true });
  };

  const createFromImport = async () => {
    const trimmed = importName.trim();
    if (!trimmed && method === "manual") { setImportNameError("Enter a name for this syllabus."); return; }
    if (method === "manual") { createEmpty(trimmed); return; }
    if (method === "file" && !file) { setImportError("Choose a file before continuing."); return; }
    if (method === "paste" && !pastedText.trim()) { setImportError("Paste some syllabus content before continuing."); return; }
    setImportNameError(""); setImportError(""); setBusy(true);

    try {
      let result: ExtractionResult;
      let sourceLabel = "";

      if (method === "file" && file) {
        sourceLabel = file.name;
        result = await parseSyllabusFile(file, trimmed || undefined);
      } else {
        sourceLabel = "Pasted syllabus document";
        result = parseAcademicSyllabus(pastedText, trimmed || undefined);
      }

      if (!result.courses.length) {
        setImportError(result.warnings[0] || "No syllabus content could be extracted from this input.");
        setBusy(false);
        return;
      }

      setDetectedCourses(result.courses);
      const allIndices = new Set(result.courses.map((_, i) => i));
      setSelectedCourseIndices(allIndices);

      // Keep user's entered name if provided (e.g. "1st Semester" or "Semester 1")
      const finalSyllabusName = trimmed || (result.courses.length > 1 ? "1st Semester" : result.courses[0].name);
      setImportName(finalSyllabusName);

      // Build unified tree containing all subjects with their codes
      const unified = buildUnifiedTree(result.courses, allIndices);
      setReviewTree(unified);
      setReviewSource(sourceLabel);
      setSelectedId("");
      setPage("review");
      setBusy(false);
      setNotice(
        result.courses.length > 1
          ? `Detected ${result.courses.length} subjects! All included under "${finalSyllabusName}".`
          : ""
      );
    } catch (err: any) {
      setImportError(err?.message || "Failed to extract syllabus content.");
      setBusy(false);
    }
  };

  const confirmImport = async () => {
    if (!finishInlineEdit()) return;
    if (!importName.trim()) { setImportNameError("Enter a name for this syllabus."); setPage("import"); return; }
    if (!reviewTree.length) { setImportError("Select at least one subject before saving."); return; }
    setBusy(true);

    if (!isDemoRoute) {
      try {
        const initialTreePayload = mapStudyNodeToInitialTree(reviewTree);
        let createdId: any;
        try {
          createdId = await createSyllabusMutation({
            name: importName.trim(),
            source: reviewSource || undefined,
            initialTree: initialTreePayload,
          });
        } catch (innerErr: any) {
          throw innerErr;
        }

        setActiveId(createdId);
        setActivity("syllabus");
        setPage("workspace");
        setActiveTab("Tree");
        setSelectedId("");
        // Pre-expand subject nodes so subjects are visible and ready to expand
        setExpanded(new Set(reviewTree.map((n) => n.id)));
        setBusy(false);
        setNotice(`Saved "${importName.trim()}" with ${selectedCourseIndices.size} subjects!`);
        setReviewTree([]);
        navigate(`${basePath}/${createdId}`, { replace: true });
        return;
      } catch (err: any) {
        console.error("Failed to save syllabus to Convex:", err);
        setImportError(err?.message || "Failed to save syllabus to backend.");
        setBusy(false);
        return;
      }
    }

    // Demo route fallback
    window.setTimeout(() => {
      const created: Syllabus = {
        id: id(),
        name: importName.trim(),
        source: reviewSource,
        tree: reviewTree,
      };
      setDemoSyllabuses((items) => [created, ...items]);
      setActiveId(created.id);
      setSelectedId("");
      setExpanded(new Set(reviewTree.map((item) => item.id)));
      setActivity("syllabus"); setPage("workspace"); setActiveTab("Tree"); setBusy(false);
      setNotice(`Saved "${importName.trim()}" with ${selectedCourseIndices.size} subjects.`); setReviewTree([]);
      navigate(`${basePath}/${created.id}`, { replace: true });
    }, 400);
  };

  const selectSyllabus = (idValue: string) => {
    if (!finishInlineEdit()) return;
    const next = syllabuses.find((item) => item.id === idValue);
    if (!next) return;
    setActiveId(idValue);
    setSelectedId(next.tree[0]?.id ?? "");
    setExpanded(new Set(allNodes(next.tree).filter((item) => item.children.length).map((item) => item.id)));
    setPage("workspace"); setActivity("syllabus"); setRowMenu(null); setActiveTab("Tree"); setNotice("");
    navigate(`${basePath}/${idValue}`, { replace: true });
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
    } catch {
      // Proceed with navigation regardless
    }
    navigate("/", { replace: true });
  };

  const toggleExpanded = (nodeId: string) => setExpanded((previous) => { const next = new Set(previous); next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId); return next; });

  const changeNode = (nodeId: string, update: (item: StudyNode) => StudyNode) => {
    if (page === "review") setReviewTree((items) => updateTree(items, nodeId, update));
    else setDemoSyllabuses((items) => items.map((syllabus) => syllabus.id === activeId ? { ...syllabus, tree: updateTree(syllabus.tree, nodeId, update) } : syllabus));
  };

  const toggleNodeCompletion = async (targetNode: StudyNode) => {
    const isLeaf = targetNode.children.length === 0;

    if (isLeaf) {
      const nextCompleted = !targetNode.completed;

      if (!isDemoRoute && isConvexId(targetNode.id)) {
        try {
          await toggleCompleteMutation({ nodeId: targetNode.id as any });
        } catch (err) {
          console.warn("Failed to toggle completion on Convex:", err);
        }
      }

      if (page === "review") {
        setReviewTree((items) => updateTree(items, targetNode.id, (n) => ({ ...n, completed: nextCompleted })));
      } else {
        setDemoSyllabuses((items) =>
          items.map((s) =>
            s.id === activeId ? { ...s, tree: updateTree(s.tree, targetNode.id, (n) => ({ ...n, completed: nextCompleted })) } : s
          )
        );
      }
      return;
    }

    // Target is a parent node: cascade toggle all leaves in its subtree
    const targetLeaves = leafNodes(targetNode);
    if (targetLeaves.length === 0) return;

    const { complete, total } = progressOf(targetNode);
    const shouldComplete = complete < total; // If not fully complete, check all; if fully complete, uncheck all.
    const targetLeafIds = new Set(targetLeaves.map((l) => l.id));

    const updateDescendants = (nodes: StudyNode[]): StudyNode[] =>
      nodes.map((n) => ({
        ...n,
        completed: targetLeafIds.has(n.id) ? shouldComplete : n.completed,
        children: updateDescendants(n.children),
      }));

    if (page === "review") {
      setReviewTree((prev) => updateDescendants(prev));
    } else {
      setDemoSyllabuses((prev) =>
        prev.map((s) => (s.id === activeId ? { ...s, tree: updateDescendants(s.tree) } : s))
      );
    }

    if (!isDemoRoute) {
      const leavesToToggle = targetLeaves.filter((l) => l.completed !== shouldComplete && isConvexId(l.id));
      if (leavesToToggle.length > 0) {
        try {
          await Promise.all(
            leavesToToggle.map((l) => toggleCompleteMutation({ nodeId: l.id as any }))
          );
        } catch (err) {
          console.warn("Failed to toggle leaves on Convex:", err);
        }
      }
    }
  };

  const toggleComplete = (nodeId: string) => {
    const target = findNode(tree, nodeId);
    if (target) toggleNodeCompletion(target);
  };

  const saveInlineEdit = async () => {
    if (!inlineEdit || !inlineEdit.value.trim()) { setInlineError("A name is required."); return; }
    const cleanName = inlineEdit.value.trim();

    if (!isDemoRoute && isConvexId(activeId) && page !== "review") {
      if (inlineEdit.type === "rename") {
        try {
          await renameNodeMutation({
            nodeId: inlineEdit.nodeId as any,
            name: cleanName,
          });
          setInlineEdit(null);
          setInlineError("");
          setNotice("Item renamed.");
          return;
        } catch (err: any) {
          setInlineError(err?.message || "Failed to rename item.");
          return;
        }
      } else {
        try {
          const newId = await createNodeMutation({
            syllabusId: activeId as any,
            parentId: inlineEdit.parentId ? (inlineEdit.parentId as any) : undefined,
            name: cleanName,
            type: inlineEdit.itemType,
            anchorId: inlineEdit.anchorId && inlineEdit.anchorId !== inlineEdit.parentId ? (inlineEdit.anchorId as any) : undefined,
            position: "after",
          });
          if (inlineEdit.parentId) {
            setExpanded((prev) => new Set(prev).add(inlineEdit.parentId!));
          }
          setSelectedId(newId);
          setInlineEdit(null);
          setInlineError("");
          setNotice("Item added.");
          return;
        } catch (err: any) {
          setInlineError(err?.message || "Failed to add item.");
          return;
        }
      }
    }

    // Review mode or Demo route fallback
    if (inlineEdit.type === "rename") {
      changeNode(inlineEdit.nodeId, (item) => ({ ...item, name: cleanName }));
    } else {
      const added = node(cleanName, [], false, inlineEdit.itemType);
      const insertAfter = (items: StudyNode[]) => {
        if (!inlineEdit.anchorId || inlineEdit.anchorId === inlineEdit.parentId) return [...items, added];
        const index = items.findIndex((item) => item.id === inlineEdit.anchorId);
        return index < 0 ? [...items, added] : [...items.slice(0, index + 1), added, ...items.slice(index + 1)];
      };
      if (inlineEdit.parentId) {
        changeNode(inlineEdit.parentId, (item) => ({ ...item, children: insertAfter(item.children) }));
        setExpanded((previous) => new Set(previous).add(inlineEdit.parentId!));
      } else if (page === "review") {
        setReviewTree(insertAfter);
      } else {
        setDemoSyllabuses((items) => items.map((item) => item.id === activeId ? { ...item, tree: insertAfter(item.tree) } : item));
      }
      setSelectedId(added.id);
    }
    setInlineEdit(null);
    setInlineError("");
  };

  const finishInlineEdit = () => {
    if (!inlineEdit) return true;
    const hasChanges = inlineEdit.type === "add"
      ? Boolean(inlineEdit.value.trim())
      : inlineEdit.value.trim() !== findNode(tree, inlineEdit.nodeId)?.name;
    if (hasChanges && !window.confirm("Discard your unsaved item changes?")) return false;
    setInlineEdit(null);
    setInlineError("");
    return true;
  };

  const startAddingItem = (parentId: string | null, anchorId: string | null, itemType: ItemType) => {
    if (!finishInlineEdit()) return;
    setInlineEdit({ type: "add", parentId, anchorId, itemType, value: "" });
    setInlineError("");
    if (parentId && anchorId === parentId) setExpanded((previous) => new Set(previous).add(parentId));
  };

  const deleteNode = async (nodeId: string) => {
    const nodePath = findPath(tree, nodeId) ?? [];
    const parentId = nodePath.length > 1 ? nodePath[nodePath.length - 2].id : "";

    if (!isDemoRoute && isConvexId(nodeId) && page !== "review") {
      try {
        await deleteNodeMutation({ nodeId: nodeId as any });
        const nextTree = removeTreeNode(tree, nodeId);
        const fallback = (parentId && findNode(nextTree, parentId)?.id) || nextTree[0]?.id || "";
        if (selectedId === nodeId || nodePath.some((item) => item.id === selectedId)) {
          setSelectedId(fallback);
        }
        setDialog(null);
        setNotice("Item deleted.");
        return;
      } catch (err: any) {
        console.error("Failed to delete node:", err);
        setNotice(err?.message || "Failed to delete item.");
        setDialog(null);
        return;
      }
    }

    const nextTree = removeTreeNode(tree, nodeId);
    const fallback = (parentId && findNode(nextTree, parentId)?.id) || nextTree[0]?.id || "";
    if (page === "review") setReviewTree(nextTree);
    else setDemoSyllabuses((items) => items.map((syllabus) => syllabus.id === activeId ? { ...syllabus, tree: nextTree } : syllabus));
    if (selectedId === nodeId || nodePath.some((item) => item.id === selectedId)) setSelectedId(fallback);
    setDialog(null); setNotice("Item removed.");
  };

  const deleteSyllabus = async (syllabusIdToDelete: string) => {
    if (!isDemoRoute && isConvexId(syllabusIdToDelete)) {
      try {
        await deleteSyllabusMutation({ syllabusId: syllabusIdToDelete as any });
        setDialog(null);
        setNotice("Syllabus deleted.");
        if (activeId === syllabusIdToDelete) {
          setActiveId("");
          setPage("list");
          navigate(basePath, { replace: true });
        }
        return;
      } catch (err: any) {
        setNotice(err?.message || "Failed to delete syllabus.");
        setDialog(null);
        return;
      }
    }

    const remaining = demoSyllabuses.filter((item) => item.id !== syllabusIdToDelete);
    setDemoSyllabuses(remaining);
    if (activeId === syllabusIdToDelete) {
      const firstRemaining = remaining[0];
      setActiveId(firstRemaining?.id ?? "");
      setSelectedId(firstRemaining?.tree[0]?.id ?? "");
      setPage(remaining.length ? "workspace" : "list");
      if (remaining.length && firstRemaining) {
        navigate(`${basePath}/${firstRemaining.id}`, { replace: true });
      } else {
        navigate(basePath, { replace: true });
      }
    }
    setDialog(null);
    setNotice("Syllabus removed from this demo session.");
  };

  const renameSyllabus = async (syllabusIdToRename: string, newName: string) => {
    const clean = newName.trim();
    if (!clean) {
      setNameError("Enter a name for this syllabus.");
      return;
    }

    if (!isDemoRoute && isConvexId(syllabusIdToRename)) {
      try {
        await renameSyllabusMutation({ syllabusId: syllabusIdToRename as any, name: clean });
        setDialog(null);
        setNotice("Syllabus renamed.");
        return;
      } catch (err: any) {
        setNameError(err?.message || "Failed to rename syllabus.");
        return;
      }
    }

    setDemoSyllabuses((items) => items.map((item) => item.id === syllabusIdToRename ? { ...item, name: clean } : item));
    setDialog(null);
    setNotice("Syllabus name updated in this demo session.");
  };

  const renderInlineCreate = (depth: number) => {
    if (inlineEdit?.type !== "add") return null;
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") { event.preventDefault(); saveInlineEdit(); }
      if (event.key === "Escape") { setInlineEdit(null); setInlineError(""); }
    };
    return (
      <>
        <div className="tree-row inline-create-row" style={{ "--depth": depth } as React.CSSProperties}>
          <div className="tree-main inline-rename-main">
            <span className="tree-disclosure" aria-hidden="true"><span className="disclosure-spacer" /></span>
            <span className="node-glyph">{inlineEdit.itemType === "item" ? <FileText size={14} /> : <Folder size={15} />}</span>
            <input
              className="inline-tree-input"
              autoFocus
              aria-label={inlineEdit.itemType === "subject" ? "New subject name" : `New ${inlineEdit.itemType} name`}
              placeholder={placeholderFor(inlineEdit.itemType)}
              value={inlineEdit.value}
              onChange={(event) => { setInlineEdit({ ...inlineEdit, value: event.target.value }); setInlineError(""); }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="tree-actions editing">
            <button type="button" className="tree-action save-action" aria-label={inlineEdit.itemType === "subject" ? "Add subject" : `Add ${inlineEdit.itemType}`} data-tooltip="Save" onClick={saveInlineEdit}><Check size={13} /></button>
            <button type="button" className="tree-action" aria-label="Cancel add" data-tooltip="Cancel" onClick={() => { setInlineEdit(null); setInlineError(""); }}><X size={13} /></button>
          </div>
        </div>
        {inlineError && <div className="inline-tree-error" style={{ "--depth": depth } as React.CSSProperties}>{inlineError}</div>}
      </>
    );
  };

  const renderTree = (items: StudyNode[], depth = 0, parentId: string | null = null, showCheckboxes = true): React.ReactNode => (
    <>
      {items.map((item) => {
        const isOpen = expanded.has(item.id);
        const isSelected = selectedId === item.id;
        const isEditing = inlineEdit?.type === "rename" && inlineEdit.nodeId === item.id;
        const isLeaf = item.children.length === 0;
        const { complete, total, percent } = progressOf(item);
        const isFullyComplete = total > 0 ? complete === total : Boolean(item.completed);
        const isPartial = total > 0 && complete > 0 && complete < total;

        const disclosure = item.children.length ? (
          <button type="button" className="tree-disclosure" aria-label={isOpen ? "Collapse" : "Expand"} onClick={(event) => { event.stopPropagation(); toggleExpanded(item.id); }}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="tree-disclosure" aria-hidden="true"><span className="disclosure-spacer" /></span>
        );

        const checkbox = showCheckboxes ? (
          <button
            type="button"
            className={`tree-checkbox ${isFullyComplete ? "is-checked" : isPartial ? "is-partial" : ""}`}
            aria-label={isFullyComplete ? `Mark ${item.name} incomplete` : `Mark ${item.name} complete`}
            title={
              isLeaf
                ? (item.completed ? "Mark incomplete" : "Mark complete")
                : `${complete} of ${total} items completed (${percent}%). Click to ${isFullyComplete ? "uncheck all" : "check all"}`
            }
            onClick={(event) => {
              event.stopPropagation();
              toggleNodeCompletion(item);
            }}
          >
            {isFullyComplete && <Check size={11} strokeWidth={3} />}
            {isPartial && <Minus size={11} strokeWidth={3} />}
          </button>
        ) : null;

        const glyph = (
          <span className={`node-glyph ${isFullyComplete ? "node-done" : ""}`}>
            {item.type === "item" && item.children.length === 0 ? <FileText size={14} /> : isOpen ? <FolderOpen size={15} /> : <Folder size={15} />}
          </span>
        );
        const siblingParentId = parentId;
        const addActions = addActionsFor(item.type);
        return (
          <div key={item.id}>
            <div className={`tree-row ${isSelected ? "is-selected" : ""}`} style={{ "--depth": depth } as React.CSSProperties}>
              {isEditing ? (
                <div className="tree-main inline-rename-main">
                  {disclosure}{checkbox}{glyph}
                  <input
                    className="inline-tree-input"
                    autoFocus
                    aria-label={`Rename ${item.name}`}
                    value={inlineEdit.value}
                    onChange={(event) => { setInlineEdit({ ...inlineEdit, value: event.target.value }); setInlineError(""); }}
                    onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); saveInlineEdit(); } if (event.key === "Escape") { setInlineEdit(null); setInlineError(""); } }}
                  />
                </div>
              ) : (
                <div className="tree-main">
                  {disclosure}
                  {checkbox}
                  <button className="tree-select" type="button" onClick={() => { setSelectedId(item.id); setNotice(""); }}>
                    {glyph}
                    <span className={`tree-name ${isFullyComplete ? "name-done" : ""}`}>{item.name}</span>
                    {showCheckboxes && !isLeaf && total > 0 && (
                      <span className={`tree-node-badge ${isFullyComplete ? "complete" : ""}`}>
                        {complete}/{total}
                      </span>
                    )}
                  </button>
                </div>
              )}
              <div className={`tree-actions ${isEditing ? "editing" : ""}`}>
                {isEditing ? (
                  <>
                    <button type="button" className="tree-action save-action" aria-label="Save name" data-tooltip="Save" onClick={saveInlineEdit}><Check size={13} /></button>
                    <button type="button" className="tree-action" aria-label="Cancel rename" data-tooltip="Cancel" onClick={() => { setInlineEdit(null); setInlineError(""); }}><X size={13} /></button>
                  </>
                ) : (
                  <>
                    {addActions.map((action) => (
                      <button key={action.label} type="button" className="tree-action" aria-label={action.label} data-tooltip={action.label} onClick={() => startAddingItem(action.sameLevel ? siblingParentId : item.id, action.sameLevel ? item.id : item.id, action.itemType)}>
                        <Plus size={13} />
                      </button>
                    ))}
                    <button type="button" className="tree-action" aria-label="Rename" data-tooltip="Rename" onClick={() => { setSelectedId(item.id); setInlineEdit({ type: "rename", nodeId: item.id, value: item.name }); setInlineError(""); }}>
                      <Pencil size={12} />
                    </button>
                    <button type="button" className="tree-action delete-action" aria-label="Delete" data-tooltip="Delete" onClick={() => { setSelectedId(item.id); setDialog({ kind: "deleteNode", nodeId: item.id }); }}>
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {inlineError && isEditing && <div className="inline-tree-error" style={{ "--depth": depth } as React.CSSProperties}>{inlineError}</div>}
            {item.children.length > 0 && isOpen && <div className="tree-children">{renderTree(item.children, depth + 1, item.id, showCheckboxes)}</div>}
            {inlineEdit?.type === "add" && inlineEdit.parentId === item.id && inlineEdit.anchorId === item.id && renderInlineCreate(depth + 1)}
            {inlineEdit?.type === "add" && inlineEdit.parentId === parentId && inlineEdit.anchorId === item.id && renderInlineCreate(depth)}
          </div>
        );
      })}
      {inlineEdit?.type === "add" && inlineEdit.parentId === parentId && inlineEdit.anchorId === parentId && renderInlineCreate(depth)}
    </>
  );

  const sidebarTitle = activity === "syllabus" ? (page === "workspace" ? "EXPLORER" : "Syllabus List") : activity === "import" ? "NEW SYLLABUS" : activity === "library" ? "LIBRARY" : activity === "settings" ? "SETTINGS" : "PROFILE";
  const activityLabel: Record<Activity, string> = { syllabus: "Syllabus List", import: "Import Syllabus", library: "Library", settings: "Settings", profile: "Profile" };

  return (
    <main className="studyos-shell" onClick={() => { if (rowMenu) setRowMenu(null); }}>
      <aside className="activity-bar" aria-label="Main navigation">
        <div className="brand-mark" aria-label="StudyOS"><GraduationCap size={21} strokeWidth={2.2} /></div>
        <div className="activity-main">
          <ActivityButton label="Syllabus List" active={activity === "syllabus"} onClick={() => { setActivity("syllabus"); setPage("list"); setNotice(""); navigate(basePath); }}><BookOpen size={19} /></ActivityButton>
          <ActivityButton label="Import Syllabus" active={activity === "import"} onClick={openImport}><Plus size={20} /></ActivityButton>
          <ActivityButton label="Library" active={activity === "library"} onClick={() => { setActivity("library"); setPage("list"); setNotice(""); }}><Library size={19} /></ActivityButton>
        </div>
        <div className="activity-bottom">
          <ActivityButton label="Settings" active={activity === "settings"} onClick={() => { setActivity("settings"); setPage("list"); setNotice(""); }}><Settings size={19} /></ActivityButton>
          <ActivityButton label="Sign out" active={false} onClick={handleSignOut}><LogOut size={19} /></ActivityButton>
          <ActivityButton label="Profile" active={activity === "profile"} onClick={() => { setActivity("profile"); setPage("list"); setNotice(""); }}><UserRound size={19} /></ActivityButton>
          <button
            type="button"
            className="profile-avatar-btn"
            aria-label={`Open profile for ${profile.fullName || "Student"}`}
            title={`Profile: ${profile.fullName || "Student"}`}
            onClick={() => { setActivity("profile"); setPage("list"); setNotice(""); }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar">{initials}</div>
            )}
          </button>
        </div>
      </aside>

      <aside className="secondary-sidebar">
        <header className="sidebar-heading">
          <div><div className="workspace-label">STUDYOS</div><h2>{sidebarTitle}</h2></div>
          {activity === "syllabus" && page === "list" && (
            <div className="create-anchor" onClick={(event) => event.stopPropagation()}>
              <IconButton label="Create syllabus" onClick={() => setShowCreateMenu((value) => !value)}><Plus size={18} /></IconButton>
              {showCreateMenu && (
                <div className="context-menu create-menu">
                  <button onClick={openImport}><Upload size={15} />Import syllabus</button>
                  <button onClick={openCreate}><FileText size={15} />Create manually</button>
                  <button onClick={openCreate}><Plus size={15} />Start with an empty workspace</button>
                </div>
              )}
            </div>
          )}
          {activity === "syllabus" && page === "workspace" && activeSyllabus && (
            <button className="sidebar-switcher" title="Back to Syllabus List" onClick={() => { setPage("list"); navigate(basePath); }}><ChevronDown size={14} /></button>
          )}
        </header>

        {activity === "syllabus" && page === "list" && (
          <div className="syllabus-list-area">
            {syllabuses.length === 0 ? (
              <div className="sidebar-empty">
                <BookOpen size={23} />
                <strong>No syllabuses yet</strong>
                <span>Create your first syllabus by importing a document or building one manually.</span>
                <button className="secondary-button" onClick={openCreate}>Create syllabus</button>
              </div>
            ) : (
              <>
                <div className="sidebar-section-label">YOUR WORKSPACES <span>{syllabuses.length}</span></div>
                <div className="syllabus-list">
                  {syllabuses.map((item) => (
                    <div key={item.id} className={`syllabus-row ${item.id === activeId ? "active" : ""}`}>
                      <button className="syllabus-select" onClick={() => selectSyllabus(item.id)}>
                        <FileText size={15} /><span>{item.name}</span>
                      </button>
                      <div className="row-actions" onClick={(event) => event.stopPropagation()}>
                        <IconButton label={`Actions for ${item.name}`} onClick={() => setRowMenu(rowMenu === item.id ? null : item.id)}><MoreHorizontal size={16} /></IconButton>
                        {rowMenu === item.id && (
                          <div className="context-menu row-context">
                            <button onClick={() => { setName(item.name); setNameError(""); setDialog({ kind: "renameSyllabus", syllabusId: item.id }); setRowMenu(null); }}>Rename</button>
                            <button className="danger-menu-item" onClick={() => { setDialog({ kind: "deleteSyllabus", syllabusId: item.id }); setRowMenu(null); }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sidebar-footnote">Each syllabus keeps its own tree and progress.</div>
              </>
            )}
          </div>
        )}

        {activity === "syllabus" && page === "workspace" && activeSyllabus && (
          <div className="explorer-area">
            <div className="explorer-title">
              <button
                type="button"
                className="explorer-title-btn"
                onClick={() => { setSelectedId(""); setActiveTab("Tree"); }}
                title="View full syllabus overview"
              >
                <span className="syllabus-icon"><FileText size={15} /></span>
                <span className="explorer-title-text">{activeSyllabus.name}</span>
              </button>
              <button type="button" className="explorer-add-subject" aria-label="Add subject" data-tooltip="Add subject" onClick={() => startAddingItem(null, null, "subject")}><Plus size={15} /></button>
            </div>
            {tree.length || inlineEdit?.type === "add" ? (
              <div className="explorer-tree">{renderTree(tree, 0, null, false)}</div>
            ) : (
              <div className="explorer-empty">No items yet.<br />Add your first subject.</div>
            )}
          </div>
        )}

        {activity === "import" && (
          <div className="sidebar-info">
            <span className="step-badge">1</span>
            <div><strong>Prepare</strong><small>Name and add your syllabus source.</small></div>
            <span className="step-line" />
            <span className={`step-badge ${page === "review" ? "complete" : ""}`}>2</span>
            <div><strong>Review</strong><small>Check the proposed tree before saving.</small></div>
          </div>
        )}

        {activity === "profile" && (
          <div className="sidebar-info" style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="flex items-center gap-3 pb-3 border-b border-line w-full">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-8 h-8 rounded-full object-cover border border-line flex-shrink-0" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{ background: "var(--ws-avatar-bg)", color: "var(--ws-avatar-ink)" }}
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <strong className="text-xs text-ink truncate block">{profile.fullName || "Student"}</strong>
                <small className="text-[10px] text-ink-secondary truncate block">{profile.email}</small>
              </div>
            </div>
            <p className="light-info" style={{ margin: 0, fontSize: "11px", lineHeight: 1.55 }}>
              Personal information and academic curriculum details stay configured alongside your study trees.
            </p>
          </div>
        )}

        {(activity === "library" || activity === "settings") && (
          <div className="sidebar-info light-info">
            <span>{activity === "library" ? "Resources are separate from your syllabus tree." : "Global app settings will appear here."}</span>
          </div>
        )}

        {activity === "syllabus" && page === "workspace" && !activeSyllabus && (
          <div className="sidebar-empty">
            <span>Select or create a syllabus to begin.</span>
            <button className="secondary-button" onClick={openCreate}>Create syllabus</button>
          </div>
        )}
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="topbar-crumb">
            <span>StudyOS</span><ChevronRight size={14} /><span>{activityLabel[activity]}</span>
            {page === "review" && <><ChevronRight size={14} /><span>Review proposal</span></>}
          </div>
          <div className="topbar-right">
            {isDemoRoute ? (
              <span className="demo-chip">Demo Mode</span>
            ) : (
              <span className="demo-chip" style={{ background: "rgba(98, 104, 201, 0.12)", color: "var(--ws-accent, #6268c9)", borderColor: "rgba(98, 104, 201, 0.25)" }}>
                Live Workspace
              </span>
            )}
            <button
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className="topbar-theme-btn"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button aria-label="Help" title="Help" className="topbar-help"><CircleHelp size={17} /></button>
          </div>
        </header>

        {notice && (
          <div className="notice-banner">
            <Check size={15} />{notice}
            <button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={14} /></button>
          </div>
        )}

        {activity === "syllabus" && page === "list" && (
          <div className="catalogue-main">
            <div className="page-eyebrow">YOUR STUDY WORKSPACES</div>
            <h1>Syllabus List</h1>
            <p className="page-intro">Choose a syllabus to continue, or create a new workspace.</p>
            {syllabuses.length === 0 ? (
              <div className="empty-catalogue">
                <div className="empty-icon"><BookOpen size={23} /></div>
                <h2>No syllabuses yet</h2>
                <p>Create your first syllabus by importing a document or building one manually.</p>
                <button className="primary-button" onClick={openCreate}><Plus size={16} />Create syllabus</button>
              </div>
            ) : (
              <div className="catalogue-list">
                {syllabuses.map((item) => {
                  const total = item.totalLeaves ?? allNodes(item.tree).filter((n) => !n.children.length).length;
                  const done = item.completedLeaves ?? allNodes(item.tree).filter((n) => !n.children.length && n.completed).length;
                  const pct = item.percentComplete ?? (total ? Math.round((done / total) * 100) : 0);
                  return (
                    <div key={item.id} className="catalogue-item-row">
                      <button className="catalogue-item" onClick={() => selectSyllabus(item.id)}>
                        <span className="catalogue-file"><FileText size={17} /></span>
                        <span className="catalogue-name">
                          <strong>{item.name}</strong>
                          <small>{item.source ? item.source : `${item.tree.length || "Workspace"} item(s)`}</small>
                        </span>
                        {total > 0 && (
                          <span className="catalogue-progress">
                            <span>{done}/{total} complete</span>
                            <span className="tiny-progress"><i style={{ width: `${pct}%` }} /></span>
                          </span>
                        )}
                        <ChevronRight size={16} className="catalogue-arrow" />
                      </button>
                      <button
                        type="button"
                        className="catalogue-row-delete"
                        title="Delete syllabus"
                        aria-label={`Delete ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDialog({ kind: "deleteSyllabus", syllabusId: item.id });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activity === "syllabus" && page === "workspace" && activeSyllabus && (
          <>
            {tree.length === 0 ? (
              <div className="workspace-empty">
                <div className="empty-icon"><BookOpen size={23} /></div>
                <h1>Your syllabus starts here</h1>
                <p>Add your first subject, chapter, or other item to begin building your study tree.</p>
                <button className="primary-button" onClick={() => startAddingItem(null, null, "subject")}><Plus size={16} />Add first subject</button>
              </div>
            ) : (
              (() => {
                const isRootView = !current || !path;
                const headingTitle = isRootView ? activeSyllabus.name : current.name;
                const headingKicker = isRootView
                  ? (activeSyllabus.code ? `SYLLABUS WORKSPACE · ${activeSyllabus.code}` : "SYLLABUS WORKSPACE")
                  : "SYLLABUS ITEM";
                const allLeafItems = allNodes(tree).filter((n) => !n.children.length);
                const totalLeafCount = allLeafItems.length;
                const doneLeafCount = allLeafItems.filter((n) => n.completed).length;
                const totalPercent = totalLeafCount ? Math.round((doneLeafCount / totalLeafCount) * 100) : 0;
                const currentPercent = isRootView ? totalPercent : (progress?.percent ?? 0);
                const currentTotal = isRootView ? totalLeafCount : (progress?.total ?? 0);
                const currentComplete = isRootView ? doneLeafCount : (progress?.complete ?? 0);

                return (
                  <div className="workspace-content">
                    <div className="breadcrumbs">
                      <button className="breadcrumb-root-btn" onClick={() => { setSelectedId(""); setActiveTab("Tree"); }}>
                        {activeSyllabus.name}
                      </button>
                      {!isRootView && path && path.map((part, index) => (
                        <span className="breadcrumb-part" key={part.id}>
                          <ChevronRight size={13} />
                          {index === path.length - 1 ? <strong>{part.name}</strong> : <button onClick={() => setSelectedId(part.id)}>{part.name}</button>}
                        </span>
                      ))}
                    </div>
                    <div className="node-heading-row">
                      <div className="node-heading-left">
                        {!isRootView && current && (
                          <button
                            type="button"
                            className={`heading-checkbox ${
                              progressOf(current).total > 0
                                ? (progressOf(current).complete === progressOf(current).total ? "is-checked" : progressOf(current).complete > 0 ? "is-partial" : "")
                                : (current.completed ? "is-checked" : "")
                            }`}
                            aria-label="Toggle completion of this node"
                            title="Click to toggle completion for this entire node and everything inside it"
                            onClick={() => toggleNodeCompletion(current)}
                          >
                            {progressOf(current).total > 0
                              ? (progressOf(current).complete === progressOf(current).total ? <Check size={16} strokeWidth={3} /> : progressOf(current).complete > 0 ? <Minus size={16} strokeWidth={3} /> : null)
                              : (current.completed ? <Check size={16} strokeWidth={3} /> : null)}
                          </button>
                        )}
                        <div>
                          <div className="node-kicker">{headingKicker}</div>
                          <h1>{headingTitle}</h1>
                          <div className="completion-caption">
                            Completion status <span>·</span> <strong>{currentPercent}%</strong>
                            <small>({currentComplete} of {currentTotal} complete)</small>
                          </div>
                        </div>
                      </div>
                      <div className="node-heading-actions">
                        <button
                          className="outline-button"
                          onClick={() => {
                            if (isRootView) {
                              startAddingItem(null, null, "subject");
                            } else if (selectedAddAction) {
                              startAddingItem(current.id, current.id, selectedAddAction.itemType);
                            }
                          }}
                        >
                          <Plus size={15} />{isRootView ? "Add module" : (selectedAddAction?.label ?? "Add item")}
                        </button>
                        {!isRootView && (
                          <button
                            className="outline-icon"
                            aria-label="Rename selected item"
                            title="Rename selected item"
                            onClick={() => {
                              setSelectedId(current.id);
                              setInlineEdit({ type: "rename", nodeId: current.id, value: current.name });
                              setInlineError("");
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="progress-track" aria-label={`Completion ${currentPercent}%`}>
                      <span style={{ width: `${currentPercent}%` }} />
                    </div>
                    <nav className="content-tabs" aria-label="Syllabus content views">
                      {(["Tree", "Notes", "Materials", "Ask AI"] as Tab[]).map((tab) => (
                        <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                          {tab === "Tree" && <FolderOpen size={14} />}
                          {tab === "Notes" && <StickyNote size={14} />}
                          {tab === "Materials" && <Paperclip size={14} />}
                          {tab === "Ask AI" && <Sparkles size={14} />}
                          {tab === "Tree" ? "Syllabus Tree" : tab}
                          {tab === "Tree" && <span className="tab-count">{isRootView || !current ? tree.length : current.children.length}</span>}
                        </button>
                      ))}
                    </nav>
                    <div className="tab-content">
                      {activeTab === "Tree" && (() => {
                        const displayedTree = isRootView || !current ? tree : current.children;
                        const parentId = isRootView || !current ? null : current.id;
                        const hasChildren = displayedTree.length > 0;
                        const isAddingHere = inlineEdit?.type === "add" && inlineEdit.parentId === parentId;

                        const nodeParentIds = allNodes(displayedTree).filter((n) => n.children.length > 0).map((n) => n.id);
                        const isAllOpen = nodeParentIds.length > 0 && nodeParentIds.every((id) => expanded.has(id));

                        const toggleAllInSubtree = () => {
                          if (isAllOpen) {
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              nodeParentIds.forEach((id) => next.delete(id));
                              return next;
                            });
                          } else {
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              nodeParentIds.forEach((id) => next.add(id));
                              return next;
                            });
                          }
                        };

                        const childCount = displayedTree.length;
                        const totalTopicsInView = isRootView || !current ? totalLeafCount : leafNodes(current).length;
                        const doneTopicsInView = isRootView || !current ? doneLeafCount : leafNodes(current).filter((l) => l.completed).length;

                        const isSubject = !isRootView && current?.type === "subject";
                        const isModule = !isRootView && current?.type === "chapter";

                        const completedDirectChildren = displayedTree.filter((child) => {
                          const p = progressOf(child);
                          return p.total > 0 && p.complete === p.total;
                        }).length;

                        return (
                          <div className="main-tree-view">
                            <div className="main-tree-toolbar">
                              <div className="main-tree-stats">
                                {isSubject ? (
                                  <>
                                    <span className="stats-pill">
                                      <strong>{completedDirectChildren} of {displayedTree.length}</strong> Modules Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{doneTopicsInView} of {totalTopicsInView}</strong> Topics Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{totalTopicsInView ? Math.round((doneTopicsInView / totalTopicsInView) * 100) : 0}%</strong> Subject Progress
                                    </span>
                                  </>
                                ) : isModule ? (
                                  <>
                                    <span className="stats-pill">
                                      <strong>{completedDirectChildren} of {displayedTree.length}</strong> Topics Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{doneTopicsInView} of {totalTopicsInView}</strong> Items Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{totalTopicsInView ? Math.round((doneTopicsInView / totalTopicsInView) * 100) : 0}%</strong> Module Progress
                                    </span>
                                  </>
                                ) : isRootView ? (
                                  <>
                                    <span className="stats-pill">
                                      <strong>{completedDirectChildren} of {displayedTree.length}</strong> {tree.some((n) => n.type === "subject") ? "Subjects" : "Modules"} Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{doneTopicsInView} of {totalTopicsInView}</strong> Total Topics Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{totalTopicsInView ? Math.round((doneTopicsInView / totalTopicsInView) * 100) : 0}%</strong> Degree Progress
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="stats-pill">
                                      <strong>{completedDirectChildren} of {displayedTree.length}</strong> Subtopics Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{doneTopicsInView} of {totalTopicsInView}</strong> Items Complete
                                    </span>
                                    <span className="stats-pill">
                                      <strong>{totalTopicsInView ? Math.round((doneTopicsInView / totalTopicsInView) * 100) : 0}%</strong> Complete
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="main-tree-actions">
                                {nodeParentIds.length > 0 && (
                                  <button
                                    type="button"
                                    className="tree-control-btn"
                                    onClick={toggleAllInSubtree}
                                  >
                                    {isAllOpen ? "Collapse all" : "Expand all"}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="tree-control-btn primary"
                                  onClick={() => {
                                    if (isRootView || !current) {
                                      startAddingItem(null, null, tree.some((n) => n.type === "subject") ? "subject" : "chapter");
                                    } else if (selectedAddAction) {
                                      startAddingItem(current.id, current.id, selectedAddAction.itemType);
                                    }
                                  }}
                                >
                                  <Plus size={14} />{" "}
                                  {isRootView || !current
                                    ? (tree.some((n) => n.type === "subject") ? "Add subject" : "Add module")
                                    : (selectedAddAction?.label ?? "Add item")}
                                </button>
                              </div>
                            </div>
                            <div className="main-tree-canvas">
                              {hasChildren || isAddingHere ? (
                                <div className="main-tree-body">
                                  {renderTree(displayedTree, 0, parentId, true)}
                                </div>
                              ) : (
                                <div className="main-tree-empty">
                                  <FolderOpen size={30} className="main-tree-empty-icon" />
                                  <strong className="main-tree-empty-title">
                                    No items inside "{current?.name || headingTitle}"
                                  </strong>
                                  <p className="main-tree-empty-desc">
                                    This {current?.type || "item"} does not contain any subtopics or child items.
                                  </p>
                                  {selectedAddAction && current && (
                                    <button
                                      type="button"
                                      className="tree-control-btn primary"
                                      onClick={() => startAddingItem(current.id, current.id, selectedAddAction.itemType)}
                                      style={{ marginTop: 12 }}
                                    >
                                      <Plus size={14} /> {selectedAddAction.label}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {activeTab === "Notes" && (
                        <div className="simple-view">
                          <div className="view-title"><StickyNote size={17} /><h2>Notes</h2></div>
                          <p>Notes for <strong>{headingTitle}</strong> stay with this syllabus item.</p>
                          <textarea
                            value={notes[isRootView ? activeSyllabus.id : current.id] ?? ""}
                            onChange={(event) => {
                              const noteTargetId = isRootView ? activeSyllabus.id : current.id;
                              setNotes((prev) => ({ ...prev, [noteTargetId]: event.target.value }));
                            }}
                            placeholder="Write notes, references, or study outlines for this item…"
                            aria-label={`Notes for ${headingTitle}`}
                          />
                        </div>
                      )}

                      {activeTab === "Materials" && (
                        <div className="simple-view">
                          <div className="view-title"><Paperclip size={17} /><h2>Attachments</h2></div>
                          {isRootView && activeSyllabus?.metadata && (
                            <div style={{ marginBottom: 16, padding: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8 }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                {activeSyllabus.code && <span className="meta-badge code-badge">Course Code: {activeSyllabus.code}</span>}
                                {activeSyllabus.metadata.credits && <span className="meta-badge">Credits: {activeSyllabus.metadata.credits}</span>}
                                {activeSyllabus.metadata.contactHours && <span className="meta-badge">Hours (L:T:P): {activeSyllabus.metadata.contactHours}</span>}
                                {activeSyllabus.metadata.totalContactHours && <span className="meta-badge">Total: {activeSyllabus.metadata.totalContactHours}</span>}
                              </div>
                              {activeSyllabus.metadata.textbooks?.length > 0 && (
                                <div style={{ fontSize: 12, marginTop: 8, color: "var(--ink)" }}>
                                  <strong>Recommended Textbooks:</strong>
                                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                                    {activeSyllabus.metadata.textbooks.map((tb: string, i: number) => (
                                      <li key={i}>{tb}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {activeSyllabus.metadata.referenceBooks?.length > 0 && (
                                <div style={{ fontSize: 12, marginTop: 8, color: "var(--ink-secondary)" }}>
                                  <strong>Reference Books:</strong>
                                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                                    {activeSyllabus.metadata.referenceBooks.map((rb: string, i: number) => (
                                      <li key={i}>{rb}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          <NodeAttachments
                            nodeId={isRootView || !current ? "" : current.id}
                            isDemoRoute={isDemoRoute}
                          />
                        </div>
                      )}

                      {activeTab === "Ask AI" && (
                        <div className="simple-view">
                          <div className="view-title"><Sparkles size={17} /><h2>Ask AI</h2></div>
                          <p>Ask questions and generate explanations for <strong>{headingTitle}</strong>.</p>
                          <div className="ai-demo-message">AI assistant uses your selected syllabus topic as study context.</div>
                          <div className="ai-input-row">
                            <input placeholder="Ask a question about this topic…" />
                            <button className="primary-button">Ask</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </>
        )}

        {activity === "import" && page === "import" && (
          <div className="import-page">
            <button className="back-link" onClick={() => { setActivity("syllabus"); setPage("list"); navigate(basePath); }}><ChevronRight size={14} />Syllabus List</button>
            <div className="page-eyebrow">CREATE WORKSPACE</div>
            <h1>Import Syllabus</h1>
            <p className="page-intro">Prepare a new syllabus workspace. You'll review the proposed structure before adding it to your list.</p>
            <div className="form-section">
              <label htmlFor="syllabus-name">Syllabus Name <span className="required-mark">*</span></label>
              <input id="syllabus-name" className={importNameError ? "has-error" : ""} value={importName} onChange={(event) => { setImportName(event.target.value); setImportNameError(""); }} placeholder="e.g. 3rd Semester CSE" />
              {importNameError && <span className="field-error">{importNameError}</span>}
              <small>Use a name you'll recognize. This can differ from the source filename.</small>
            </div>
            <div className="form-section">
              <div className="form-label">Input method</div>
              <div className="method-switcher" role="tablist">
                {([["paste", "Paste syllabus text"], ["file", "Upload a file"], ["manual", "Create manually"]] as const).map(([key, label]) => (
                  <button role="tab" aria-selected={method === key} key={key} className={method === key ? "selected" : ""} onClick={() => { setMethod(key); setImportError(""); }}>{label}</button>
                ))}
              </div>
              {method === "paste" && (
                <div className="input-panel">
                  <textarea
                    className="paste-area"
                    value={pastedText}
                    onChange={(event) => { setPastedText(event.target.value); setImportError(""); }}
                    placeholder={`Paste syllabus content here. For example:\n\n# Data Structures\n## Arrays\n- Array Traversal\n- Searching and Sorting\n## Linked Lists\n- Singly Linked List\n- Doubly Linked List\n\n# Algorithms\n## Graph Algorithms\n- BFS and DFS`}
                  />
                  <p className="demo-disclaimer">Indented lines, numbers (1., 1.1), Units, and markdown bullets are automatically organized into hierarchy.</p>
                </div>
              )}
              {method === "file" && (
                <div className="input-panel">
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    hidden
                    onChange={(event) => {
                      const selected = event.target.files?.[0] ?? null;
                      const supported = selected && /\.(pdf|docx|txt)$/i.test(selected.name);
                      if (selected && !supported) {
                        setFile(null);
                        setImportError("This file type is not supported. Choose a PDF, DOCX, or TXT file.");
                        event.target.value = "";
                        return;
                      }
                      setFile(selected);
                      setImportError("");
                    }}
                  />
                  {file ? (
                    <div className="selected-file">
                      <span className="file-icon"><FileText size={18} /></span>
                      <span className="file-meta"><strong>{file.name}</strong><small>{file.type || "Selected file"}{file.size ? ` · ${(file.size / 1024 / 1024).toFixed(1)} MB` : ""}</small></span>
                      <button className="text-button" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ""; }}>Remove</button>
                      <button className="text-button" onClick={() => fileInput.current?.click()}>Replace</button>
                    </div>
                  ) : (
                    <button className="upload-area" onClick={() => fileInput.current?.click()}>
                      <span className="upload-icon"><Upload size={19} /></span>
                      <strong>Choose a syllabus file</strong>
                      <span>PDF, DOCX, or TXT</span>
                      <em>Browse files</em>
                    </button>
                  )}
                  <p className="demo-disclaimer">Files with text structure are parsed into your syllabus outline for review.</p>
                </div>
              )}
              {method === "manual" && (
                <div className="input-panel manual-panel">
                  <div className="manual-icon"><BookOpen size={20} /></div>
                  <div><strong>Start with an empty tree</strong><p>Create a named workspace now, then add and organize items yourself. No extraction step.</p></div>
                </div>
              )}
            </div>
            {importError && <div className="inline-error" role="alert">{importError}</div>}
            {busy ? (
              <div className="processing-panel">
                <span className="loader" />
                <div>
                  <strong>{method === "manual" ? "Creating workspace…" : "Preparing your syllabus…"}</strong>
                  <span>Structuring syllabus nodes for review.</span>
                </div>
              </div>
            ) : (
              <div className="form-actions">
                <button className="secondary-button" onClick={() => { setActivity("syllabus"); setPage("list"); navigate(basePath); }}>Cancel</button>
                <button className="primary-button" onClick={createFromImport}>
                  {method === "manual" ? "Create workspace" : method === "paste" ? "Review parsed outline" : "Review imported outline"}
                </button>
              </div>
            )}
          </div>
        )}

        {activity === "import" && page === "review" && (
          <div className="review-page">
            <button className="back-link" onClick={() => setPage("import")}><ChevronRight size={14} />Back to import settings</button>
            <div className="page-eyebrow">STEP 2 OF 2</div>
            <h1>Review Proposed Structure</h1>

            {/* Editable syllabus name on the review page */}
            <div className="review-name-card">
              <div className="review-name-top">
                <label htmlFor="review-syllabus-name" className="review-name-label">
                  Syllabus Workspace Name <span className="required-mark">*</span>
                </label>
                {detectedCourses.length > 1 && (
                  <span className="stats-pill">
                    <strong>{selectedCourseIndices.size}</strong> of {detectedCourses.length} subjects included
                  </span>
                )}
              </div>
              <input
                id="review-syllabus-name"
                className={`review-name-input${importNameError ? " has-error" : ""}`}
                value={importName}
                onChange={(e) => { setImportName(e.target.value); setImportNameError(""); }}
                placeholder="e.g. 1st Semester CSE"
              />
              {importNameError && <span className="field-error">{importNameError}</span>}
              <small className="review-name-hint">
                This workspace will appear in your Syllabus List. All included subjects will be organized inside it with their subject codes.
              </small>
            </div>

            {detectedCourses.length > 1 && (
              <div className="course-switcher-bar">
                <div className="course-switcher-header-row">
                  <span className="course-switcher-header">
                    Included Subjects ({selectedCourseIndices.size}/{detectedCourses.length}) — Click checkbox to include/exclude:
                  </span>
                  <button
                    type="button"
                    className="course-select-all-btn"
                    onClick={toggleSelectAll}
                  >
                    {selectedCourseIndices.size === detectedCourses.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="course-pills">
                  {detectedCourses.map((c, idx) => {
                    const isChecked = selectedCourseIndices.has(idx);
                    return (
                      <div
                        key={c.id || idx}
                        className={`course-pill ${isChecked ? "checked" : ""}`}
                        onClick={(e) => toggleCourseSelection(idx, e)}
                        style={{ cursor: "pointer" }}
                        title={isChecked ? "Subject included. Click to exclude." : "Subject excluded. Click to include."}
                      >
                        <span
                          className={`course-pill-checkbox ${isChecked ? "is-checked" : ""}`}
                          role="checkbox"
                          aria-checked={isChecked}
                          aria-label={`Include ${c.name}`}
                        >
                          {isChecked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        <strong>{c.code || `Subject ${idx + 1}`}</strong>
                        <span>{c.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="review-meta">
              <span className="review-meta-item"><strong>Syllabus:</strong> {importName}</span>
              {reviewCode && <><span className="review-meta-divider">·</span><span className="review-meta-item"><strong>Code:</strong> {reviewCode}</span></>}
              <span className="review-meta-divider">·</span>
              <span className="review-meta-item"><strong>Source:</strong> {reviewSource || "User input"}</span>
              <span className="review-meta-divider">·</span>
              <span className="review-meta-item"><strong>Items:</strong> {allNodes(reviewTree).length}</span>
            </div>

            {reviewMetadata && (
              <div className="metadata-preview-card">
                <div className="metadata-badges">
                  {reviewCode && <span className="meta-badge code-badge">Code: {reviewCode}</span>}
                  {reviewMetadata.credits && <span className="meta-badge">Credits: {reviewMetadata.credits}</span>}
                  {reviewMetadata.contactHours && <span className="meta-badge">Hours (L:T:P): {reviewMetadata.contactHours}</span>}
                  {reviewMetadata.totalContactHours && <span className="meta-badge">Total Hours: {reviewMetadata.totalContactHours}</span>}
                  {detectedCourses[activeCourseIdx]?.isLab && <span className="meta-badge lab-badge">Laboratory Subject</span>}
                </div>
                {(reviewMetadata.courseOutcomes?.length || reviewMetadata.textbooks?.length || reviewMetadata.referenceBooks?.length) && (
                  <details className="metadata-collapsible">
                    <summary>View Extracted Academic Metadata (Outcomes, References)</summary>
                    <div className="metadata-content">
                      {reviewMetadata.courseObjectives?.length > 0 && (
                        <div className="meta-block">
                          <strong>Objectives:</strong>
                          <ul>
                            {reviewMetadata.courseObjectives.map((obj: string, i: number) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reviewMetadata.courseOutcomes?.length > 0 && (
                        <div className="meta-block">
                          <strong>Course Outcomes:</strong>
                          <ul>
                            {reviewMetadata.courseOutcomes.map((co: string, i: number) => (
                              <li key={i}>{co}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reviewMetadata.textbooks?.length > 0 && (
                        <div className="meta-block">
                          <strong>Textbooks:</strong>
                          <ul>
                            {reviewMetadata.textbooks.map((tb: string, i: number) => (
                              <li key={i}>{tb}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {reviewMetadata.referenceBooks?.length > 0 && (
                        <div className="meta-block">
                          <strong>Reference Books:</strong>
                          <ul>
                            {reviewMetadata.referenceBooks.map((rb: string, i: number) => (
                              <li key={i}>{rb}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            )}

            <div className="review-tree-container">
              <div className="review-tree-header">
                <strong>Proposed Tree</strong>
                <button type="button" className="explorer-add-subject" aria-label="Add root subject" data-tooltip="Add root subject" onClick={() => startAddingItem(null, null, "subject")}>
                  <Plus size={15} />
                </button>
              </div>
              <div className="review-tree-body">
                {reviewTree.length || inlineEdit?.type === "add" ? (
                  renderTree(reviewTree, 0, null, false)
                ) : (
                  <div className="review-empty">No items in this proposal. Add a subject above to begin.</div>
                )}
              </div>
            </div>
            {importError && <div className="inline-error" role="alert">{importError}</div>}
            <div className="review-actions">
              <button className="secondary-button" onClick={() => setPage("import")}>Back</button>
              <button
                className="primary-button"
                disabled={busy || reviewTree.length === 0}
                onClick={confirmImport}
              >
                {busy
                  ? "Saving to workspace…"
                  : detectedCourses.length > 1
                  ? `Save "${importName.trim()}" (${selectedCourseIndices.size} subjects)`
                  : "Save syllabus to workspace"}
                <Check size={15} />
              </button>
            </div>
            <p className="demo-disclaimer review-disclaimer">
              {isDemoRoute
                ? "Local demo mode: saved to your browser session."
                : "Your syllabus will be saved to your private StudyOS database and synchronized across your devices."}
            </p>
          </div>
        )}

        {activity === "library" && (
          <div className="placeholder-main">
            <div className="page-eyebrow">STUDYOS</div>
            <h1>Library</h1>
            <p>Your resource area is separate from your syllabus tree. Upload and organize notes, textbooks, and reading materials.</p>
          </div>
        )}

        {activity === "settings" && (
          <div className="placeholder-main">
            <div className="page-eyebrow">STUDYOS</div>
            <h1>Settings</h1>
            <p>Global application preferences, notifications, and study reminders will appear here.</p>
          </div>
        )}

        {activity === "profile" && (
          <ProfileView
            profile={profile}
            onUpdateProfile={(updated) => {
              updateProfile(updated);
              setNotice("Profile updated successfully.");
            }}
            syllabusCount={syllabuses.length}
          />
        )}
      </section>

      {dialog?.kind === "create" && (
        <Modal title="Create syllabus workspace" onClose={() => setDialog(null)}>
          <p className="modal-copy">Give this workspace a name. You can build the tree manually after creation.</p>
          <form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) { setNameError("Enter a name for this syllabus."); return; } createEmpty(name); }}>
            <label className="modal-label" htmlFor="create-name">Syllabus name</label>
            <input id="create-name" autoFocus className={nameError ? "has-error" : ""} value={name} onChange={(event) => { setName(event.target.value); setNameError(""); }} placeholder="e.g. 3rd Semester CSE" />
            {nameError && <span className="field-error">{nameError}</span>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDialog(null)}>Cancel</button>
              <button type="submit" className="primary-button">Create workspace</button>
            </div>
          </form>
        </Modal>
      )}

      {dialog?.kind === "renameSyllabus" && (
        <Modal title="Rename syllabus" onClose={() => setDialog(null)}>
          <form onSubmit={(event) => { event.preventDefault(); if (dialog.syllabusId) renameSyllabus(dialog.syllabusId, name); }}>
            <label className="modal-label" htmlFor="rename-syllabus">Syllabus name</label>
            <input id="rename-syllabus" autoFocus className={nameError ? "has-error" : ""} value={name} onChange={(event) => { setName(event.target.value); setNameError(""); }} />
            {nameError && <span className="field-error">{nameError}</span>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDialog(null)}>Cancel</button>
              <button type="submit" className="primary-button">Save name</button>
            </div>
          </form>
        </Modal>
      )}

      {dialog?.kind === "deleteSyllabus" && (
        <Modal title="Delete syllabus?" onClose={() => setDialog(null)}>
          <p className="modal-copy">
            Delete <strong>"{syllabuses.find((item) => item.id === dialog.syllabusId)?.name}"</strong>? This will remove this syllabus along with its study tree and notes.
          </p>
          <div className="modal-actions">
            <button className="secondary-button" onClick={() => setDialog(null)}>Cancel</button>
            <button className="danger-button" onClick={() => { if (dialog.syllabusId) deleteSyllabus(dialog.syllabusId); }}>Delete syllabus</button>
          </div>
        </Modal>
      )}

      {dialog?.kind === "deleteNode" && (
        <Modal title="Delete syllabus item?" onClose={() => setDialog(null)}>
          <p className="modal-copy">
            Delete <strong>"{findNode(tree, dialog.nodeId!)?.name}"</strong>?
            {findNode(tree, dialog.nodeId!)?.children.length ? " This will also remove all items inside it." : " This item will be removed from the syllabus."}
          </p>
          <div className="modal-actions">
            <button className="secondary-button" onClick={() => setDialog(null)}>Cancel</button>
            <button className="danger-button" onClick={() => { if (dialog.nodeId) deleteNode(dialog.nodeId); }}>Delete item</button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function ActivityButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`activity-button ${active ? "active" : ""}`} aria-label={label} title={label} onClick={onClick}>
      {children}
      <span className="activity-tooltip">{label}</span>
    </button>
  );
}
