import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Check, FileText, Presentation, StickyNote, Image as ImageIcon } from 'lucide-react';
import type { TreeNode, NodeStatus } from '@/data/tree';
import { progressOf } from '@/data/tree';

const statusColor: Record<NodeStatus, string> = {
  todo: 'var(--status-todo)',
  'in-progress': 'var(--status-progress)',
  done: 'var(--status-done)',
};

const materialIcon = {
  pdf: FileText,
  slides: Presentation,
  note: StickyNote,
  image: ImageIcon,
} as const;

interface FlatNode {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
  parentLabel?: string;
}

function flatten(node: TreeNode, depth = 0, parentLabel?: string): FlatNode[] {
  const out: FlatNode[] = [{ node, depth, hasChildren: !!node.children?.length, parentLabel }];
  if (node.children) {
    for (const c of node.children) out.push(...flatten(c, depth + 1, node.label));
  }
  return out;
}

/**
 * Animated, interactive syllabus tree visualization that mirrors the
 * StudyOS workspace explorer. Self-reveals on mount; supports click-to-select
 * and shows a small detail panel for the selected node.
 */
export function SyllabusTree({
  data,
  autoReveal = true,
  className,
}: {
  data: TreeNode;
  autoReveal?: boolean;
  className?: string;
}) {
  const rows = flatten(data);
  const [selectedId, setSelectedId] = useState<string>('trees');
  const [revealed, setRevealed] = useState(!autoReveal);
  const treeRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected = rows.find((r) => r.node.id === selectedId)?.node ?? data;

  // Reveal animation on mount
  useEffect(() => {
    if (!autoReveal) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = treeRef.current?.querySelectorAll('[data-tree-row]');
    if (!items?.length) return;

    if (prefersReduced) {
      gsap.set(items, { opacity: 1, y: 0 });
      setRevealed(true);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 12 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.3,
        onComplete: () => setRevealed(true),
      });
    }, treeRef);
    return () => ctx.revert();
  }, [autoReveal]);

  // Animate the detail panel on selection change
  useEffect(() => {
    if (!detailRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    gsap.fromTo(
      detailRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, [selectedId]);

  const rootProgress = progressOf(data);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-0 overflow-hidden rounded-2.5xl border border-line bg-surface shadow-[0_2px_8px_rgba(41,48,71,0.06),0_24px_60px_-24px_rgba(41,48,71,0.22)]">
        {/* Tree pane */}
        <div
          ref={treeRef}
          className="relative bg-sidebar/60 px-4 py-5 sm:px-6 sm:py-6 min-h-[360px] lg:min-h-[440px]"
        >
          {/* Root progress bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-secondary">
              Syllabus
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full rounded-full bg-done transition-all duration-700"
                  style={{ width: `${rootProgress}%` }}
                />
              </div>
              <span className="text-[0.7rem] tabular-nums text-ink-secondary">
                {rootProgress}%
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-0.5">
            {rows.map((r, i) => {
              const isSel = r.node.id === selectedId;
              return (
                <li
                  key={r.node.id}
                  data-tree-row
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <button
                    onClick={() => setSelectedId(r.node.id)}
                    className={`group flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left transition-all duration-200 ${
                      isSel ? 'bg-accent-soft' : 'hover:bg-hover'
                    }`}
                    style={{ paddingLeft: `${r.depth * 18 + 8}px` }}
                  >
                    {/* tree guide */}
                    {r.depth > 0 && (
                      <span
                        className="absolute"
                        style={{
                          left: `${(r.depth - 1) * 18 + 20}px`,
                          width: '12px',
                          height: '1px',
                          background: 'var(--tree-guide)',
                          marginTop: '14px',
                        }}
                      />
                    )}

                    <StatusDot status={r.node.status} />

                    <span
                      className={`flex-1 truncate text-[0.86rem] sm:text-[0.9rem] ${
                        r.depth === 0
                          ? 'font-semibold text-ink'
                          : r.depth === 1
                            ? 'font-medium text-ink'
                            : 'text-ink-secondary'
                      }`}
                    >
                      {r.node.label}
                    </span>

                    {r.hasChildren && (
                      <span className="text-[0.7rem] text-ink-secondary/70 tabular-nums">
                        {progressOf(r.node)}%
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detail pane */}
        <div className="relative bg-surface px-5 py-6 sm:px-6 border-t lg:border-t-0 lg:border-l border-line">
          <div ref={detailRef} key={selected.id}>
            <div className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-secondary mb-2">
              Selected
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-ink leading-tight">
              {selected.label}
            </h3>

            <div className="mt-3 flex items-center gap-3 text-[0.78rem]">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${statusColor[selected.status]}1a`, color: statusColor[selected.status] }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[selected.status] }} />
                {selected.status === 'done'
                  ? 'Completed'
                  : selected.status === 'in-progress'
                    ? 'In progress'
                    : 'Not started'}
              </span>
              {selected.children?.length ? (
                <span className="text-ink-secondary">
                  {selected.children.length} items · {progressOf(selected)}% done
                </span>
              ) : null}
            </div>

            {selected.note && (
              <div className="mt-5 rounded-xl border border-line bg-bg/50 p-3.5">
                <div className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-secondary mb-1.5">
                  Note
                </div>
                <p className="text-[0.85rem] text-ink leading-relaxed">{selected.note}</p>
              </div>
            )}

            {selected.materials && selected.materials.length > 0 && (
              <div className="mt-5">
                <div className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-secondary mb-2">
                  Materials
                </div>
                <ul className="flex flex-col gap-1.5">
                  {selected.materials.map((m) => {
                    const Icon = materialIcon[m.kind];
                    return (
                      <li
                        key={m.id}
                        className="flex items-center gap-2.5 rounded-lg border border-line bg-bg/40 px-3 py-2 text-[0.82rem] text-ink"
                      >
                        <Icon className="h-4 w-4 text-accent" strokeWidth={1.7} />
                        {m.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {!selected.materials?.length && !selected.note && (
              <div className="mt-6">
                <div className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-secondary mb-2">
                  Materials
                </div>
                <div className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-[0.78rem] text-ink-secondary/80">
                  Attach notes, PDFs or slides here
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-line/70">
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-secondary mb-2">
                Ask about this
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-bg/40 px-3 py-2.5 text-[0.8rem] text-ink-secondary">
                <span className="text-accent font-medium">AI</span>
                <span className="truncate">Explain this at my level</span>
              </div>
            </div>
          </div>

          {!revealed && (
            <div className="absolute inset-0 bg-surface" style={{ opacity: 0 }} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: NodeStatus }) {
  if (status === 'done') {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-done text-white">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="h-4 w-4 rounded-full border-2 border-progress" />
        <span className="absolute h-2 w-2 rounded-full bg-progress" />
      </span>
    );
  }
  return <span className="h-4 w-4 shrink-0 rounded-full border-2 border-line" />;
}
