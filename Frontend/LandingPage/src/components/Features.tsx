import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Check,
  FileText,
  Presentation,
  StickyNote,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  CornerDownRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  num: string;
  title: string;
  desc: string;
  artifact: 'tree' | 'completion' | 'materials' | 'notes' | 'ai' | 'build';
}

const features: Feature[] = [
  {
    num: '01',
    title: 'Build your syllabus',
    desc: 'Import a supported syllabus or create the structure yourself. Either way, you start from a real outline of what you need to study.',
    artifact: 'build',
  },
  {
    num: '02',
    title: 'Shape the tree',
    desc: 'Rename, add, remove, reorder, expand and collapse items until the structure matches how you actually study.',
    artifact: 'tree',
  },
  {
    num: '03',
    title: 'Track completion',
    desc: 'Mark a topic complete and the progress on its parent updates automatically. You always see how far along each branch is.',
    artifact: 'completion',
  },
  {
    num: '04',
    title: 'Keep materials close',
    desc: 'Attach PDFs, slides, text, photos or screenshots to the syllabus item they belong to — not to a folder you will forget about.',
    artifact: 'materials',
  },
  {
    num: '05',
    title: 'Write your own notes',
    desc: 'Keep personal notes attached to the topic where they belong, so the context is never lost.',
    artifact: 'notes',
  },
  {
    num: '06',
    title: 'Ask for help when needed',
    desc: 'Use contextual AI assistance for explanations, practice questions or feedback — tied to the item you selected.',
    artifact: 'ai',
  },
];

export function Features() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-feat]', { opacity: 1, y: 0 });
        return;
      }
      gsap.from('[data-feat="head"]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      });
      gsap.from('[data-feat="card"]', {
        opacity: 0,
        y: 36,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-feat="grid"]', start: 'top 78%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="features" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <div data-feat="head" className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4">
            What you can do
          </div>
          <h2 data-feat="head" className="font-display font-light text-display-md text-ink text-balance">
            Six things your syllabus can finally do for you.
          </h2>
        </div>

        <div
          data-feat="grid"
          className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {features.map((f) => (
            <FeatureCard key={f.num} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div
      data-feat="card"
      className="group relative flex flex-col rounded-2.5xl border border-line bg-surface p-6 transition-all duration-500 hover:shadow-[0_2px_8px_rgba(41,48,71,0.06),0_24px_50px_-24px_rgba(41,48,71,0.18)] hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-[0.9rem] text-ink-secondary tabular-nums">
          {feature.num}
        </span>
      </div>

      <Artifact kind={feature.artifact} />

      <h3 className="mt-5 font-display text-xl text-ink leading-tight">
        {feature.title}
      </h3>
      <p className="mt-2.5 text-[0.92rem] text-ink-secondary leading-relaxed">
        {feature.desc}
      </p>
    </div>
  );
}

function Artifact({ kind }: { kind: Feature['artifact'] }) {
  switch (kind) {
    case 'build':
      return <BuildArtifact />;
    case 'tree':
      return <TreeArtifact />;
    case 'completion':
      return <CompletionArtifact />;
    case 'materials':
      return <MaterialsArtifact />;
    case 'notes':
      return <NotesArtifact />;
    case 'ai':
      return <AIArtifact />;
  }
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-40 rounded-xl border border-line bg-bg/60 overflow-hidden p-3">
      {children}
    </div>
  );
}

function BuildArtifact() {
  return (
    <Frame>
      <div className="flex items-center gap-2 text-[0.72rem] text-ink-secondary mb-2">
        <FileText className="h-3.5 w-3.5" /> syllabus.pdf
      </div>
      <div className="space-y-1.5">
        {[100, 92, 78, 86, 64].map((w, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full bg-line/80"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-soft/70 px-2.5 py-1.5 text-[0.7rem] text-ink">
        <CornerDownRight className="h-3 w-3 text-accent" />
        Structure proposed
      </div>
    </Frame>
  );
}

function TreeArtifact() {
  return (
    <Frame>
      <ul className="text-[0.78rem]">
        <li className="flex items-center gap-2 py-1">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-progress" />
          <span className="text-ink font-medium">Data Structures</span>
        </li>
        <li className="flex items-center gap-2 py-1 pl-5">
          <span className="h-2 w-2 rounded-full bg-done" />
          <span className="text-ink-secondary">Arrays</span>
        </li>
        <li className="flex items-center gap-2 py-1 pl-5 group/edit">
          <span className="h-2 w-2 rounded-full border border-line" />
          <span className="text-ink-secondary line-through decoration-accent/60">
            Linked Lists
          </span>
        </li>
        <li className="flex items-center gap-2 py-1 pl-10">
          <span className="h-2 w-2 rounded-full border border-line" />
          <span className="text-ink-secondary">New topic</span>
        </li>
      </ul>
      <div className="absolute bottom-3 right-3 flex gap-1">
        {[Pencil, Plus, Trash2].map((Icon, i) => (
          <span
            key={i}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface text-ink-secondary"
          >
            <Icon className="h-3 w-3" strokeWidth={1.8} />
          </span>
        ))}
      </div>
    </Frame>
  );
}

function CompletionArtifact() {
  const [done, setDone] = useState(false);
  const parent = done ? 100 : 33;
  return (
    <Frame>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[0.78rem]">
          <span className="text-ink font-medium">Data Structures</span>
          <span className="tabular-nums text-ink-secondary">{parent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden">
          <div
            className="h-full rounded-full bg-done transition-all duration-700"
            style={{ width: `${parent}%` }}
          />
        </div>
        {['Arrays', 'Linked Lists', 'Trees'].map((t, i) => (
          <div key={t} className="flex items-center gap-2 pl-2 text-[0.76rem]">
            <button
              onClick={() => i === 1 && setDone((d) => !d)}
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 transition-all ${
                i === 1 ? (done ? 'bg-done border-done' : 'border-progress') : i === 0 ? 'bg-done border-done' : 'border-line'
              }`}
            >
              {(i === 0 || (i === 1 && done)) && (
                <Check className="h-2 w-2 text-white" strokeWidth={3} />
              )}
            </button>
            <span className={i === 0 || (i === 1 && done) ? 'text-ink-secondary line-through' : 'text-ink-secondary'}>
              {t}
            </span>
            {i === 1 && (
              <span className="ml-auto text-[0.65rem] text-accent">click me</span>
            )}
          </div>
        ))}
      </div>
    </Frame>
  );
}

function MaterialsArtifact() {
  const items = [
    { icon: FileText, label: 'Lecture.pdf', color: 'var(--accent)' },
    { icon: Presentation, label: 'Week 7 slides', color: 'var(--progress)' },
    { icon: ImageIcon, label: 'Screenshot.png', color: 'var(--done)' },
  ];
  return (
    <Frame>
      <div className="text-[0.72rem] uppercase tracking-[0.14em] text-ink-secondary mb-2">
        Arrays
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[0.76rem] text-ink"
          >
            <it.icon className="h-3.5 w-3.5" style={{ color: it.color }} strokeWidth={1.7} />
            {it.label}
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-dashed border-line px-2 py-1 text-[0.68rem] text-ink-secondary/80">
        <Plus className="h-3 w-3" /> Attach
      </div>
    </Frame>
  );
}

function NotesArtifact() {
  return (
    <Frame>
      <div className="text-[0.72rem] uppercase tracking-[0.14em] text-ink-secondary mb-2">
        Notes · Arrays
      </div>
      <div className="rounded-lg border border-line bg-surface p-2.5 text-[0.76rem] text-ink leading-relaxed">
        <p>Index 0 → first element.</p>
        <p>Access is O(1) — random access is the whole point.</p>
        <p className="text-ink-secondary mt-1">Insert at end = O(1) amortized.</p>
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[0.68rem] text-accent">
        <StickyNote className="h-3 w-3" /> attached
      </div>
    </Frame>
  );
}

function AIArtifact() {
  return (
    <Frame>
      <div className="text-[0.72rem] uppercase tracking-[0.14em] text-ink-secondary mb-2">
        Selected: Binary Search
      </div>
      <div className="flex items-start gap-2 mb-1.5">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
        <p className="rounded-lg bg-hover px-2.5 py-1.5 text-[0.76rem] text-ink">
          Explain this at my level.
        </p>
      </div>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <CornerDownRight className="h-2.5 w-2.5" />
        </span>
        <p className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[0.76rem] text-ink-secondary leading-snug">
          Think of a sorted list. You check the middle, discard half, repeat…
        </p>
      </div>
    </Frame>
  );
}
