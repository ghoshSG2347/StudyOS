export type TreeNode = { _id: string; name: string; parentId?: string; order: number; completed: boolean; children: TreeNode[] };
export type FlatNode = { _id: string; parentId?: string; order: number; completed: boolean; name: string };

export function assembleTree(rows: FlatNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  for (const row of rows) map.set(row._id, { ...row, children: [] });
  const roots: TreeNode[] = [];
  for (const row of rows) {
    const node = map.get(row._id)!;
    if (row.parentId) {
      const parent = map.get(row.parentId);
      if (!parent) throw new Error(`Missing parent ${row.parentId}`);
      parent.children.push(node);
    } else roots.push(node);
  }
  const sort = (nodes: TreeNode[]) => { nodes.sort((a, b) => a.order - b.order || a._id.localeCompare(b._id)); nodes.forEach(n => sort(n.children)); };
  sort(roots);
  return roots;
}

export function progressOf(node: TreeNode): { totalLeaves: number; completedLeaves: number; percentComplete: number } {
  if (node.children.length === 0) return { totalLeaves: 1, completedLeaves: node.completed ? 1 : 0, percentComplete: node.completed ? 100 : 0 };
  const counts = node.children.map(progressOf).reduce((a, b) => ({ totalLeaves: a.totalLeaves + b.totalLeaves, completedLeaves: a.completedLeaves + b.completedLeaves }), { totalLeaves: 0, completedLeaves: 0 });
  return { ...counts, percentComplete: counts.totalLeaves ? Math.round(counts.completedLeaves / counts.totalLeaves * 100) : 0 };
}

export function flattenSubtree(root: TreeNode): TreeNode[] {
  return [root, ...root.children.flatMap(flattenSubtree)];
}
