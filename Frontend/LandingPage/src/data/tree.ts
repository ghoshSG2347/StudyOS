export type NodeStatus = 'todo' | 'in-progress' | 'done';

export interface TreeNode {
  id: string;
  label: string;
  status: NodeStatus;
  children?: TreeNode[];
  materials?: { id: string; label: string; kind: 'pdf' | 'slides' | 'note' | 'image' }[];
  note?: string;
}

export const sampleTree: TreeNode = {
  id: 'root',
  label: '3rd Semester — CSE',
  status: 'in-progress',
  children: [
    {
      id: 'ds',
      label: 'Data Structures',
      status: 'in-progress',
      children: [
        { id: 'arrays', label: 'Arrays', status: 'done' },
        { id: 'lists', label: 'Linked Lists', status: 'done' },
        {
          id: 'trees',
          label: 'Trees',
          status: 'in-progress',
          children: [
            { id: 'bst', label: 'Binary Search Trees', status: 'todo' },
            { id: 'traversal', label: 'Traversal', status: 'todo' },
          ],
        },
      ],
      materials: [
        { id: 'm1', label: 'Lecture Notes.pdf', kind: 'pdf' },
        { id: 'm2', label: 'Slides — Week 7', kind: 'slides' },
      ],
    },
    {
      id: 'math',
      label: 'Mathematics III',
      status: 'todo',
      children: [
        { id: 'matrices', label: 'Matrices', status: 'todo' },
        { id: 'calculus', label: 'Calculus', status: 'todo' },
      ],
    },
    {
      id: 'digital',
      label: 'Digital Electronics',
      status: 'todo',
      children: [
        { id: 'logic', label: 'Logic Gates', status: 'todo' },
        { id: 'flipflop', label: 'Flip-Flops', status: 'todo' },
      ],
    },
  ],
};

export function countNodes(node: TreeNode): { total: number; done: number } {
  let total = 1;
  let done = node.status === 'done' ? 1 : 0;
  if (node.children) {
    for (const c of node.children) {
      const r = countNodes(c);
      total += r.total;
      done += r.done;
    }
  }
  return { total, done };
}

export function progressOf(node: TreeNode): number {
  const { total, done } = countNodes(node);
  return total === 0 ? 0 : Math.round((done / total) * 100);
}
