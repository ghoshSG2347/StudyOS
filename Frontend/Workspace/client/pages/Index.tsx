import { useMemo, useRef, useState } from "react";
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
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  StickyNote,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

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
  source?: string;
  tree: StudyNode[];
};

type Activity = "syllabus" | "import" | "library" | "settings" | "profile";
type Page = "list" | "workspace" | "import" | "review";
type Tab = "Checklist" | "Notes" | "Materials" | "Ask AI";

const id = () => Math.random().toString(36).slice(2, 10);
const node = (name: string, children: StudyNode[] = [], completed = false, type: ItemType = "item"): StudyNode => ({ id: id(), name, type, completed, children });

function assignItemTypes(items: StudyNode[], depth = 0): StudyNode[] {
  const types: ItemType[] = ["subject", "chapter", "topic", "subtopic"];
  return items.map((item) => ({ ...item, type: types[depth] ?? "item", children: assignItemTypes(item.children, depth + 1) }));
}

const initialSyllabuses: Syllabus[] = [
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

const extractedTree = () => assignItemTypes([
  node("Data Structures", [node("Arrays", [node("Array Traversal"), node("Searching"), node("Sorting")]), node("Linked Lists"), node("Trees")]),
  node("Digital Electronics", [node("Logic Gates"), node("Flip-Flops")]),
  node("Mathematics", [node("Matrices"), node("Differential Equations")]),
]);

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
  return nodes.map((item) => item.id === targetId ? update(item) : { ...item, children: updateTree(item.children, targetId, update) });
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
    case "subject": return [{ label: "Add chapter", itemType: "chapter" as const, sameLevel: false }, { label: "Add subject", itemType: "subject" as const, sameLevel: true }];
    case "chapter": return [{ label: "Add topic", itemType: "topic" as const, sameLevel: false }, { label: "Add chapter", itemType: "chapter" as const, sameLevel: true }];
    case "topic": return [{ label: "Add subtopic", itemType: "subtopic" as const, sameLevel: false }, { label: "Add topic", itemType: "topic" as const, sameLevel: true }];
    case "subtopic": return [{ label: "Add item", itemType: "item" as const, sameLevel: false }, { label: "Add subtopic", itemType: "subtopic" as const, sameLevel: true }];
    case "item": return [{ label: "Add item", itemType: "item" as const, sameLevel: false }];
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
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><h2 id="modal-title">{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={17} /></IconButton></div>
      {children}
    </section>
  </div>;
}

export default function Index() {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(initialSyllabuses);
  const [activeId, setActiveId] = useState("sem3");
  const [activity, setActivity] = useState<Activity>("syllabus");
  const [page, setPage] = useState<Page>("workspace");
  const [selectedId, setSelectedId] = useState(initialSyllabuses[0].tree[0].children[0].id);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allNodes(initialSyllabuses[0].tree).filter((item) => item.children.length).map((item) => item.id)));
  const [activeTab, setActiveTab] = useState<Tab>("Checklist");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{ type: "add"; parentId: string | null; anchorId: string | null; itemType: ItemType; value: string } | { type: "rename"; nodeId: string; value: string } | null>(null);
  const [inlineError, setInlineError] = useState("");
  const [dialog, setDialog] = useState<{ kind: "create" | "renameSyllabus" | "deleteSyllabus" | "deleteNode"; syllabusId?: string; nodeId?: string } | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [method, setMethod] = useState<"file" | "paste" | "manual">("file");
  const [importName, setImportName] = useState("");
  const [importNameError, setImportNameError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [importError, setImportError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewTree, setReviewTree] = useState<StudyNode[]>([]);
  const [reviewSource, setReviewSource] = useState("");
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const fileInput = useRef<HTMLInputElement>(null);

  const activeSyllabus = syllabuses.find((item) => item.id === activeId);
  const tree = page === "review" ? reviewTree : activeSyllabus?.tree ?? [];
  const current = selectedId ? findNode(tree, selectedId) : undefined;
  const path = selectedId ? findPath(tree, selectedId) : undefined;
  const progress = current ? progressOf(current) : null;
  const selectedAddAction = current ? addActionsFor(current.type)[0] : null;
  const flatNodes = useMemo(() => allNodes(tree), [tree]);

  const openImport = () => {
    if (page === "import" && activity === "import") return;
    if (!finishInlineEdit()) return;
    if (page === "review" && reviewTree.length && !window.confirm("Your review edits have not been added to the Syllabus List. Start a new import and discard them?")) return;
    setActivity("import"); setPage("import"); setImportName(""); setImportNameError(""); setFile(null); setPastedText(""); setImportError(""); setMethod("file"); setBusy(false); setNotice(""); setReviewTree([]); setReviewSource("");
  };

  const openCreate = () => {
    setShowCreateMenu(false); setName(""); setNameError(""); setDialog({ kind: "create" });
  };

  const createEmpty = (syllabusName: string) => {
    const newSyllabus: Syllabus = { id: id(), name: syllabusName.trim(), tree: [] };
    setSyllabuses((items) => [newSyllabus, ...items]); setActiveId(newSyllabus.id); setSelectedId(""); setExpanded(new Set()); setActivity("syllabus"); setPage("workspace"); setDialog(null); setNotice("Workspace created in this demo session.");
  };

  const createFromImport = () => {
    const trimmed = importName.trim();
    if (!trimmed) { setImportNameError("Enter a name for this syllabus."); return; }
    if (method === "manual") { createEmpty(trimmed); return; }
    if (method === "file" && !file) { setImportError("Choose a file before continuing."); return; }
    if (method === "paste" && !pastedText.trim()) { setImportError("Paste some syllabus content before continuing."); return; }
    setImportNameError(""); setImportError(""); setBusy(true);
    window.setTimeout(() => {
      setReviewTree(extractedTree());
      setReviewSource(method === "file" ? file?.name ?? "Selected file" : "Pasted text · locally generated demo proposal");
      setSelectedId(""); setPage("review"); setBusy(false); setNotice("");
    }, 650);
  };

  const confirmImport = () => {
    if (!finishInlineEdit()) return;
    if (!importName.trim()) { setImportNameError("Enter a name for this syllabus."); setPage("import"); return; }
    if (!reviewTree.length) { setImportError("Add at least one item before saving this proposal."); return; }
    setBusy(true);
    window.setTimeout(() => {
      const created: Syllabus = { id: id(), name: importName.trim(), source: reviewSource, tree: reviewTree };
      setSyllabuses((items) => [created, ...items]); setActiveId(created.id); setSelectedId(reviewTree[0]?.id ?? ""); setExpanded(new Set(allNodes(reviewTree).filter((item) => item.children.length).map((item) => item.id))); setActivity("syllabus"); setPage("workspace"); setBusy(false); setNotice("Syllabus added to your list in this demo session."); setReviewTree([]);
    }, 450);
  };

  const selectSyllabus = (idValue: string) => {
    if (!finishInlineEdit()) return;
    const next = syllabuses.find((item) => item.id === idValue);
    if (!next) return;
    setActiveId(idValue); setSelectedId(next.tree[0]?.id ?? ""); setExpanded(new Set(allNodes(next.tree).filter((item) => item.children.length).map((item) => item.id))); setPage("workspace"); setActivity("syllabus"); setRowMenu(null); setActiveTab("Checklist"); setNotice("");
  };

  const toggleExpanded = (nodeId: string) => setExpanded((previous) => { const next = new Set(previous); next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId); return next; });

  const changeNode = (nodeId: string, update: (item: StudyNode) => StudyNode) => {
    if (page === "review") setReviewTree((items) => updateTree(items, nodeId, update));
    else setSyllabuses((items) => items.map((syllabus) => syllabus.id === activeId ? { ...syllabus, tree: updateTree(syllabus.tree, nodeId, update) } : syllabus));
  };

  const toggleComplete = (nodeId: string) => {
    const target = findNode(tree, nodeId);
    if (!target || target.children.length) return;
    changeNode(nodeId, (item) => ({ ...item, completed: !item.completed }));
  };

  const saveInlineEdit = () => {
    if (!inlineEdit || !inlineEdit.value.trim()) { setInlineError("A name is required."); return; }
    const cleanName = inlineEdit.value.trim();
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
        setSyllabuses((items) => items.map((item) => item.id === activeId ? { ...item, tree: insertAfter(item.tree) } : item));
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

  const deleteNode = (nodeId: string) => {
    const nodePath = findPath(tree, nodeId) ?? [];
    const nextTree = removeTreeNode(tree, nodeId);
    const parentId = nodePath.length > 1 ? nodePath[nodePath.length - 2].id : "";
    const fallback = (parentId && findNode(nextTree, parentId)?.id) || nextTree[0]?.id || "";
    if (page === "review") setReviewTree(nextTree);
    else setSyllabuses((items) => items.map((syllabus) => syllabus.id === activeId ? { ...syllabus, tree: nextTree } : syllabus));
    if (selectedId === nodeId || nodePath.some((item) => item.id === selectedId)) setSelectedId(fallback);
    setDialog(null); setNotice("Item removed from the local tree.");
  };

  const renderInlineCreate = (depth: number) => {
    if (inlineEdit?.type !== "add") return null;
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") { event.preventDefault(); saveInlineEdit(); }
      if (event.key === "Escape") { setInlineEdit(null); setInlineError(""); }
    };
    return <>
      <div className="tree-row inline-create-row" style={{ "--depth": depth } as React.CSSProperties}>
        <div className="tree-main inline-rename-main"><span className="tree-disclosure" aria-hidden="true"><span className="disclosure-spacer" /></span><span className="node-glyph">{inlineEdit.itemType === "item" ? <FileText size={14} /> : <Folder size={15} />}</span><input className="inline-tree-input" autoFocus aria-label={inlineEdit.itemType === "subject" ? "New subject name" : `New ${inlineEdit.itemType} name`} placeholder={placeholderFor(inlineEdit.itemType)} value={inlineEdit.value} onChange={(event) => { setInlineEdit({ ...inlineEdit, value: event.target.value }); setInlineError(""); }} onKeyDown={handleKeyDown} /></div>
        <div className="tree-actions editing"><button type="button" className="tree-action save-action" aria-label={inlineEdit.itemType === "subject" ? "Add subject" : `Add ${inlineEdit.itemType}`} data-tooltip="Save" onClick={saveInlineEdit}><Check size={13} /></button><button type="button" className="tree-action" aria-label="Cancel add" data-tooltip="Cancel" onClick={() => { setInlineEdit(null); setInlineError(""); }}><X size={13} /></button></div>
      </div>
      {inlineError && <div className="inline-tree-error" style={{ "--depth": depth } as React.CSSProperties}>{inlineError}</div>}
    </>;
  };

  const renderTree = (items: StudyNode[], depth = 0, parentId: string | null = null): React.ReactNode => <>
    {items.map((item) => {
      const isOpen = expanded.has(item.id);
      const isSelected = selectedId === item.id;
      const isEditing = inlineEdit?.type === "rename" && inlineEdit.nodeId === item.id;
      const disclosure = item.children.length ? <button type="button" className="tree-disclosure" aria-label={isOpen ? "Collapse" : "Expand"} onClick={(event) => { event.stopPropagation(); toggleExpanded(item.id); }}>{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button> : <span className="tree-disclosure" aria-hidden="true"><span className="disclosure-spacer" /></span>;
      const glyph = <span className={`node-glyph ${item.completed ? "node-done" : ""}`}>{item.type === "item" && item.children.length === 0 ? <FileText size={14} /> : (isOpen ? <FolderOpen size={15} /> : <Folder size={15} />)}</span>;
      const siblingParentId = parentId;
      const addActions = addActionsFor(item.type);
      return <div key={item.id}>
        <div className={`tree-row ${isSelected ? "is-selected" : ""}`} style={{ "--depth": depth } as React.CSSProperties}>
          {isEditing ? <div className="tree-main inline-rename-main">{disclosure}{glyph}<input className="inline-tree-input" autoFocus aria-label={`Rename ${item.name}`} value={inlineEdit.value} onChange={(event) => { setInlineEdit({ ...inlineEdit, value: event.target.value }); setInlineError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); saveInlineEdit(); } if (event.key === "Escape") { setInlineEdit(null); setInlineError(""); } }} />{!item.children.length && item.completed && <span className="mini-check"><Check size={11} /></span>}</div> : <div className="tree-main">
            {disclosure}<button className="tree-select" type="button" onClick={() => { setSelectedId(item.id); setActiveTab("Checklist"); setNotice(""); }}>{glyph}<span className="tree-name">{item.name}</span>{!item.children.length && item.completed && <span className="mini-check"><Check size={11} /></span>}</button>
          </div>}
          <div className={`tree-actions ${isEditing ? "editing" : ""}`}>
            {isEditing ? <><button type="button" className="tree-action save-action" aria-label="Save name" data-tooltip="Save" onClick={saveInlineEdit}><Check size={13} /></button><button type="button" className="tree-action" aria-label="Cancel rename" data-tooltip="Cancel" onClick={() => { setInlineEdit(null); setInlineError(""); }}><X size={13} /></button></> : <>
              {addActions.map((action) => <button key={action.label} type="button" className="tree-action" aria-label={action.label} data-tooltip={action.label} onClick={() => startAddingItem(action.sameLevel ? siblingParentId : item.id, action.sameLevel ? item.id : item.id, action.itemType)}><Plus size={13} /></button>)}
              <button type="button" className="tree-action" aria-label="Rename" data-tooltip="Rename" onClick={() => { setSelectedId(item.id); setInlineEdit({ type: "rename", nodeId: item.id, value: item.name }); setInlineError(""); }}><Pencil size={12} /></button>
              <button type="button" className="tree-action delete-action" aria-label="Delete" data-tooltip="Delete" onClick={() => { setSelectedId(item.id); setDialog({ kind: "deleteNode", nodeId: item.id }); }}><Trash2 size={12} /></button>
            </>}
          </div>
        </div>
        {inlineError && isEditing && <div className="inline-tree-error" style={{ "--depth": depth } as React.CSSProperties}>{inlineError}</div>}
        {item.children.length > 0 && isOpen && <div className="tree-children">{renderTree(item.children, depth + 1, item.id)}</div>}
        {inlineEdit?.type === "add" && inlineEdit.parentId === item.id && inlineEdit.anchorId === item.id && renderInlineCreate(depth + 1)}
        {inlineEdit?.type === "add" && inlineEdit.parentId === parentId && inlineEdit.anchorId === item.id && renderInlineCreate(depth)}
      </div>;
    })}
    {inlineEdit?.type === "add" && inlineEdit.parentId === parentId && inlineEdit.anchorId === parentId && renderInlineCreate(depth)}
  </>;

  const sidebarTitle = activity === "syllabus" ? (page === "workspace" ? "EXPLORER" : "Syllabus List") : activity === "import" ? "NEW SYLLABUS" : activity === "library" ? "LIBRARY" : activity === "settings" ? "SETTINGS" : "PROFILE";
  const activityLabel: Record<Activity, string> = { syllabus: "Syllabus List", import: "Import Syllabus", library: "Library", settings: "Settings", profile: "Profile" };

  return <main className="studyos-shell" onClick={() => { if (rowMenu) setRowMenu(null); }}>
    <aside className="activity-bar" aria-label="Main navigation">
      <div className="brand-mark" aria-label="StudyOS"><GraduationCap size={21} strokeWidth={2.2} /></div>
      <div className="activity-main">
        <ActivityButton label="Syllabus List" active={activity === "syllabus"} onClick={() => { setActivity("syllabus"); setPage("list"); setNotice(""); }}><BookOpen size={19} /></ActivityButton>
        <ActivityButton label="Import Syllabus" active={activity === "import"} onClick={openImport}><Plus size={20} /></ActivityButton>
        <ActivityButton label="Library" active={activity === "library"} onClick={() => { setActivity("library"); setPage("list"); setNotice(""); }}><Library size={19} /></ActivityButton>
      </div>
      <div className="activity-bottom">
        <ActivityButton label="Settings" active={activity === "settings"} onClick={() => { setActivity("settings"); setPage("list"); setNotice(""); }}><Settings size={19} /></ActivityButton>
        <ActivityButton label="Profile" active={activity === "profile"} onClick={() => { setActivity("profile"); setPage("list"); setNotice(""); }}><UserRound size={19} /></ActivityButton>
        <div className="profile-avatar" title="Student profile">S</div>
      </div>
    </aside>

    <aside className="secondary-sidebar">
      <header className="sidebar-heading">
        <div><div className="workspace-label">STUDYOS</div><h2>{sidebarTitle}</h2></div>
        {activity === "syllabus" && page === "list" && <div className="create-anchor" onClick={(event) => event.stopPropagation()}>
          <IconButton label="Create syllabus" onClick={() => setShowCreateMenu((value) => !value)}><Plus size={18} /></IconButton>
          {showCreateMenu && <div className="context-menu create-menu">
            <button onClick={openImport}><Upload size={15} />Import syllabus</button>
            <button onClick={openCreate}><FileText size={15} />Create manually</button>
            <button onClick={openCreate}><Plus size={15} />Start with an empty workspace</button>
          </div>}
        </div>}
        {activity === "syllabus" && page === "workspace" && activeSyllabus && <button className="sidebar-switcher" title="Back to Syllabus List" onClick={() => setPage("list")}><ChevronDown size={14} /></button>}
      </header>

      {activity === "syllabus" && page === "list" && <div className="syllabus-list-area">
        {syllabuses.length === 0 ? <div className="sidebar-empty"><BookOpen size={23} /><strong>No syllabuses yet</strong><span>Create your first syllabus by importing a document or building one manually.</span><button className="secondary-button" onClick={openCreate}>Create syllabus</button></div> : <>
          <div className="sidebar-section-label">YOUR WORKSPACES <span>{syllabuses.length}</span></div>
          <div className="syllabus-list">{syllabuses.map((item) => <div key={item.id} className={`syllabus-row ${item.id === activeId ? "active" : ""}`}>
            <button className="syllabus-select" onClick={() => selectSyllabus(item.id)}><FileText size={15} /><span>{item.name}</span></button>
            <div className="row-actions" onClick={(event) => event.stopPropagation()}><IconButton label={`Actions for ${item.name}`} onClick={() => setRowMenu(rowMenu === item.id ? null : item.id)}><MoreHorizontal size={16} /></IconButton>
              {rowMenu === item.id && <div className="context-menu row-context"><button onClick={() => { setName(item.name); setNameError(""); setDialog({ kind: "renameSyllabus", syllabusId: item.id }); setRowMenu(null); }}>Rename</button><button className="danger-menu-item" onClick={() => { setDialog({ kind: "deleteSyllabus", syllabusId: item.id }); setRowMenu(null); }}>Delete</button></div>}
            </div>
          </div>)}</div>
          <div className="sidebar-footnote">Each syllabus keeps its own tree and progress.</div>
        </>}
      </div>}

      {activity === "syllabus" && page === "workspace" && activeSyllabus && <div className="explorer-area">
        <div className="explorer-title"><span className="syllabus-icon"><FileText size={15} /></span><span>{activeSyllabus.name}</span><button type="button" className="explorer-add-subject" aria-label="Add subject" data-tooltip="Add subject" onClick={() => startAddingItem(null, null, "subject")}><Plus size={15} /></button></div>
        {activeSyllabus.tree.length || inlineEdit?.type === "add" ? <div className="explorer-tree">{renderTree(activeSyllabus.tree)}</div> : <div className="explorer-empty">No items yet.<br />Add your first subject.</div>}
      </div>}

      {activity === "import" && <div className="sidebar-info"><span className="step-badge">1</span><div><strong>Prepare</strong><small>Name and add your syllabus source.</small></div><span className="step-line" /><span className={`step-badge ${page === "review" ? "complete" : ""}`}>2</span><div><strong>Review</strong><small>Check the proposed tree before saving.</small></div></div>}
      {(activity === "library" || activity === "settings" || activity === "profile") && <div className="sidebar-info light-info"><span>{activity === "library" ? "Resources are separate from your syllabus tree." : activity === "settings" ? "Global app settings will appear here." : "Account and profile actions will appear here."}</span></div>}
      {activity === "syllabus" && page === "workspace" && !activeSyllabus && <div className="sidebar-empty"><span>Select or create a syllabus to begin.</span><button className="secondary-button" onClick={openCreate}>Create syllabus</button></div>}
    </aside>

    <section className="main-area">
      <header className="topbar">
        <div className="topbar-crumb"><span>StudyOS</span><ChevronRight size={14} /><span>{activityLabel[activity]}</span>{page === "review" && <><ChevronRight size={14} /><span>Review proposal</span></>}</div>
        <div className="topbar-right"><span className="demo-chip">Local demo</span><button aria-label="Help" title="Help" className="topbar-help"><CircleHelp size={17} /></button></div>
      </header>

      {notice && <div className="notice-banner"><Check size={15} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={14} /></button></div>}

      {activity === "syllabus" && page === "list" && <div className="catalogue-main">
        <div className="page-eyebrow">YOUR STUDY WORKSPACES</div><h1>Syllabus List</h1><p className="page-intro">Choose a syllabus to continue, or create a new workspace.</p>
        {syllabuses.length === 0 ? <div className="empty-catalogue"><div className="empty-icon"><BookOpen size={23} /></div><h2>No syllabuses yet</h2><p>Create your first syllabus by importing a document or building one manually.</p><button className="primary-button" onClick={openCreate}><Plus size={16} />Create syllabus</button></div> : <div className="catalogue-list">{syllabuses.map((item, index) => {
          const info = item.tree.flatMap((root) => allNodes([root])).filter((n) => !n.children.length);
          const done = info.filter((n) => n.completed).length;
          return <button key={item.id} className="catalogue-item" onClick={() => selectSyllabus(item.id)}>
            <span className="catalogue-file"><FileText size={17} /></span><span className="catalogue-name"><strong>{item.name}</strong><small>{item.tree.length} top-level {item.tree.length === 1 ? "item" : "items"}</small></span>
            {info.length > 0 && <span className="catalogue-progress"><span>{done}/{info.length} complete</span><span className="tiny-progress"><i style={{ width: `${Math.round(done / info.length * 100)}%` }} /></span></span>}
            <ChevronRight size={16} className="catalogue-arrow" />
          </button>;
        })}</div>}
      </div>}

      {activity === "syllabus" && page === "workspace" && activeSyllabus && <>
        {activeSyllabus.tree.length === 0 ? <div className="workspace-empty"><div className="empty-icon"><BookOpen size={23} /></div><h1>Your syllabus starts here</h1><p>Add your first subject, chapter, or other item to begin building your study tree.</p><button className="primary-button" onClick={() => startAddingItem(null, null, "subject")}><Plus size={16} />Add first subject</button></div> : current && path && <div className="workspace-content">
          <div className="breadcrumbs"><button onClick={() => setPage("list")}>{activeSyllabus.name}</button>{path.map((part, index) => <span className="breadcrumb-part" key={part.id}><ChevronRight size={13} />{index === path.length - 1 ? <strong>{part.name}</strong> : <button onClick={() => setSelectedId(part.id)}>{part.name}</button>}</span>)}</div>
          <div className="node-heading-row"><div><div className="node-kicker">SYLLABUS ITEM</div><h1>{current.name}</h1><div className="completion-caption">Completion status <span>·</span> <strong>{progress?.percent ?? 0}%</strong>{current.children.length > 0 && <small>Progress calculated from descendants</small>}</div></div>
            <div className="node-heading-actions"><button className="outline-button" onClick={() => selectedAddAction && startAddingItem(current.id, current.id, selectedAddAction.itemType)}><Plus size={15} />{selectedAddAction?.label ?? "Add item"}</button><button className="outline-icon" aria-label="Rename selected item" title="Rename selected item" onClick={() => { setSelectedId(current.id); setInlineEdit({ type: "rename", nodeId: current.id, value: current.name }); setInlineError(""); }}><Pencil size={15} /></button></div>
          </div>
          <div className="progress-track" aria-label={`Completion ${progress?.percent ?? 0}%`}><span style={{ width: `${progress?.percent ?? 0}%` }} /></div>
          <nav className="content-tabs" aria-label="Syllabus content views">{(["Checklist", "Notes", "Materials", "Ask AI"] as Tab[]).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab === "Notes" && <StickyNote size={14} />}{tab === "Materials" && <FolderOpen size={14} />}{tab === "Ask AI" && <Sparkles size={14} />}{tab}{tab === "Checklist" && current.children.length > 0 && <span className="tab-count">{leafNodes(current).length}</span>}</button>)}</nav>
          <div className="tab-content">
            {activeTab === "Checklist" && <>
              {current.children.length === 0 ? <div className="leaf-status"><button className={`completion-box ${current.completed ? "checked" : ""}`} aria-label={current.completed ? "Mark incomplete" : "Mark complete"} onClick={() => toggleComplete(current.id)}>{current.completed && <Check size={13} />}</button><div><strong>{current.name}</strong><small>{current.completed ? "Completed" : "Mark this item complete when you finish studying."}</small></div></div> : <>
                <div className="list-section-heading"><h2>Checklist</h2><span>{progress?.complete ?? 0} of {progress?.total ?? 0} complete</span></div>
                <div className="checklist">{leafNodes(current).map((leaf) => <label key={leaf.id} className="checklist-row"><input type="checkbox" checked={leaf.completed} onChange={() => toggleComplete(leaf.id)} /><span className="custom-check"><Check size={13} /></span><span className="checklist-name">{leaf.name}</span>{leaf.completed && <span className="completed-label">Done</span>}</label>)}</div>
                <button className="add-checklist-item" onClick={() => selectedAddAction && startAddingItem(current.id, current.id, selectedAddAction.itemType)}><Plus size={15} />{selectedAddAction?.label ?? "Add item"}</button>
              </>}
            </>}
            {activeTab === "Notes" && <div className="simple-view"><div className="view-title"><StickyNote size={17} /><h2>Notes</h2></div><p>Notes for <strong>{current.name}</strong> stay with this syllabus item in the current demo session.</p><textarea value={notes[current.id] ?? ""} onChange={(event) => setNotes((previous) => ({ ...previous, [current.id]: event.target.value }))} placeholder="Write a note for this item…" aria-label={`Notes for ${current.name}`} /></div>}
            {activeTab === "Materials" && <div className="simple-view"><div className="view-title"><FolderOpen size={17} /><h2>Materials</h2></div><p>No materials are attached to <strong>{current.name}</strong>.</p><span className="muted-inline">Resource uploads are not connected in this local demo.</span></div>}
            {activeTab === "Ask AI" && <div className="simple-view"><div className="view-title"><Sparkles size={17} /><h2>Ask AI</h2></div><p>Ask about <strong>{current.name}</strong>.</p><div className="ai-demo-message">AI assistance is not connected in this demo. The selected syllabus item is shown here as context.</div><div className="ai-input-row"><input disabled placeholder="AI service not connected" /><button disabled className="primary-button">Ask</button></div></div>}
          </div>
        </div>}
      </>}

      {activity === "import" && page === "import" && <div className="import-page">
        <button className="back-link" onClick={() => { setActivity("syllabus"); setPage("list"); }}><ChevronRight size={14} />Syllabus List</button>
        <div className="page-eyebrow">CREATE WORKSPACE</div><h1>Import Syllabus</h1><p className="page-intro">Prepare a new syllabus workspace. You’ll review the proposed structure before adding it to your list.</p>
        <div className="form-section"><label htmlFor="syllabus-name">Syllabus Name <span className="required-mark">*</span></label><input id="syllabus-name" className={importNameError ? "has-error" : ""} value={importName} onChange={(event) => { setImportName(event.target.value); setImportNameError(""); }} placeholder="e.g. 3rd Semester CSE" />{importNameError && <span className="field-error">{importNameError}</span>}<small>Use a name you’ll recognize. This can differ from the source filename.</small></div>
        <div className="form-section"><div className="form-label">Input method</div><div className="method-switcher" role="tablist">{([["file", "Upload a file"], ["paste", "Paste syllabus text"], ["manual", "Create manually"]] as const).map(([key, label]) => <button role="tab" aria-selected={method === key} key={key} className={method === key ? "selected" : ""} onClick={() => { setMethod(key); setImportError(""); }}>{label}</button>)}</div>
          {method === "file" && <div className="input-panel"><input ref={fileInput} type="file" accept=".pdf,.docx,.txt" hidden onChange={(event) => { const selected = event.target.files?.[0] ?? null; const supported = selected && /\.(pdf|docx|txt)$/i.test(selected.name); if (selected && !supported) { setFile(null); setImportError("This file type is not supported. Choose a PDF, DOCX, or TXT file."); event.target.value = ""; return; } setFile(selected); setImportError(""); }} />{file ? <div className="selected-file"><span className="file-icon"><FileText size={18} /></span><span className="file-meta"><strong>{file.name}</strong><small>{file.type || "Selected file"}{file.size ? ` · ${(file.size / 1024 / 1024).toFixed(1)} MB` : ""}</small></span><button className="text-button" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ""; }}>Remove</button><button className="text-button" onClick={() => fileInput.current?.click()}>Replace</button></div> : <button className="upload-area" onClick={() => fileInput.current?.click()}><span className="upload-icon"><Upload size={19} /></span><strong>Choose a syllabus file</strong><span>PDF, DOCX, or TXT</span><em>Browse files</em></button>}<p className="demo-disclaimer">Frontend demo only: file content is not uploaded or parsed.</p></div>}
          {method === "paste" && <div className="input-panel"><textarea className="paste-area" value={pastedText} onChange={(event) => { setPastedText(event.target.value); setImportError(""); }} placeholder="Paste syllabus content here…" /><p className="demo-disclaimer">This demo shows a sample proposal and does not parse pasted text.</p></div>}
          {method === "manual" && <div className="input-panel manual-panel"><div className="manual-icon"><BookOpen size={20} /></div><div><strong>Start with an empty tree</strong><p>Create a named workspace now, then add and organize items yourself. No extraction step.</p></div></div>}
        </div>
        {importError && <div className="inline-error" role="alert">{importError}</div>}
        {busy ? <div className="processing-panel"><span className="loader" /><div><strong>{method === "manual" ? "Creating workspace…" : "Preparing your syllabus…"}</strong><span>Building a local demo proposal for review.</span></div></div> : <div className="form-actions"><button className="secondary-button" onClick={() => { setActivity("syllabus"); setPage("list"); }}>Cancel</button><button className="primary-button" onClick={createFromImport}>{method === "manual" ? "Create workspace" : method === "paste" ? "Review structure" : "Continue to review"}<ChevronRight size={15} /></button></div>}
      </div>}

      {activity === "import" && page === "review" && <div className="review-page">
        <button className="back-link" onClick={() => { setPage("import"); setActivity("import"); }}><ChevronRight size={14} />Back to import</button>
        <div className="page-eyebrow">IMPORT SYLLABUS · REVIEW</div><h1>Review extracted structure</h1><p className="page-intro">This is a proposed tree. Make any changes before adding it to your Syllabus List.</p>
        <div className="review-summary"><div><span className="review-label">SYLLABUS NAME</span><strong>{importName || "Untitled syllabus"}</strong></div><div><span className="review-label">SOURCE</span><strong>{reviewSource}</strong></div><span className="proposal-badge">Unconfirmed proposal</span></div>
        <div className="review-tree-card"><div className="review-tree-header"><div><h2>Proposed structure</h2><span>{flatNodes.length} items · editable until confirmed</span></div><button className="outline-button" onClick={() => startAddingItem(null, null, "subject")}><Plus size={15} />Add subject</button></div>{reviewTree.length || inlineEdit?.type === "add" ? <div className="review-tree">{renderTree(reviewTree)}</div> : <div className="review-no-items">No items yet. Add a top-level item to continue.</div>}</div>
        {importError && <div className="inline-error" role="alert">{importError}</div>}
        <div className="review-actions"><button className="secondary-button" onClick={() => { setPage("import"); setActivity("import"); }}>Back</button><button className="primary-button" disabled={busy} onClick={confirmImport}>{busy ? "Adding…" : "Confirm & Add to Syllabus List"}<Check size={15} /></button></div>
        <p className="demo-disclaimer review-disclaimer">Local demo only. The proposal is sample content and is not extracted from your file or text.</p>
      </div>}

      {activity === "library" && <div className="placeholder-main"><div className="page-eyebrow">STUDYOS</div><h1>Library</h1><p>Your resource area is separate from your syllabus tree. Library features are not connected in this demo.</p></div>}
      {activity === "settings" && <div className="placeholder-main"><div className="page-eyebrow">STUDYOS</div><h1>Settings</h1><p>Global application settings will appear here.</p></div>}
      {activity === "profile" && <div className="placeholder-main"><div className="page-eyebrow">STUDYOS</div><h1>Profile</h1><p>Account and profile actions will appear here.</p></div>}
    </section>

    {dialog?.kind === "create" && <Modal title="Create syllabus workspace" onClose={() => setDialog(null)}><p className="modal-copy">Give this workspace a name. You can build the tree manually after creation.</p><form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) { setNameError("Enter a name for this syllabus."); return; } createEmpty(name); }}><label className="modal-label" htmlFor="create-name">Syllabus name</label><input id="create-name" autoFocus className={nameError ? "has-error" : ""} value={name} onChange={(event) => { setName(event.target.value); setNameError(""); }} placeholder="e.g. 3rd Semester CSE" />{nameError && <span className="field-error">{nameError}</span>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="primary-button">Create workspace</button></div></form></Modal>}
    {dialog?.kind === "renameSyllabus" && <Modal title="Rename syllabus" onClose={() => setDialog(null)}><form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) { setNameError("Enter a name for this syllabus."); return; } setSyllabuses((items) => items.map((item) => item.id === dialog.syllabusId ? { ...item, name: name.trim() } : item)); setDialog(null); setNotice("Syllabus name updated in this demo session."); }}><label className="modal-label" htmlFor="rename-syllabus">Syllabus name</label><input id="rename-syllabus" autoFocus className={nameError ? "has-error" : ""} value={name} onChange={(event) => { setName(event.target.value); setNameError(""); }} />{nameError && <span className="field-error">{nameError}</span>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="primary-button">Save name</button></div></form></Modal>}
    {dialog?.kind === "deleteSyllabus" && <Modal title="Delete syllabus?" onClose={() => setDialog(null)}><p className="modal-copy">Delete <strong>“{syllabuses.find((item) => item.id === dialog.syllabusId)?.name}”</strong>? This removes it from the local demo session along with its tree and completion state.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setDialog(null)}>Cancel</button><button className="danger-button" onClick={() => { const deletedId = dialog.syllabusId; const remaining = syllabuses.filter((item) => item.id !== deletedId); setSyllabuses(remaining); if (activeId === deletedId) { setActiveId(remaining[0]?.id ?? ""); setSelectedId(remaining[0]?.tree[0]?.id ?? ""); setPage(remaining.length ? "workspace" : "list"); } setDialog(null); setNotice("Syllabus removed from this demo session."); }}>Delete syllabus</button></div></Modal>}
    {dialog?.kind === "deleteNode" && <Modal title="Delete syllabus item?" onClose={() => setDialog(null)}><p className="modal-copy">Delete <strong>“{findNode(tree, dialog.nodeId!)?.name}”</strong>?{findNode(tree, dialog.nodeId!)?.children.length ? " This will also remove the items inside it." : " This item will be removed from the syllabus."} This change applies to the local demo tree.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setDialog(null)}>Cancel</button><button className="danger-button" onClick={() => deleteNode(dialog.nodeId!)}>Delete item</button></div></Modal>}
  </main>;
}

function ActivityButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className={`activity-button ${active ? "active" : ""}`} aria-label={label} title={label} onClick={onClick}>{children}<span className="activity-tooltip">{label}</span></button>;
}
