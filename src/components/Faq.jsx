import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Why should I use StudyOS instead of ChatGPT + Notion or Excel?",
      a: "ChatGPT gives you flat, unformatted markdown text that you still have to manually copy, reformat, and organize into checklists. Notion and Excel don't understand hierarchical academic structures or calculate parent-child rollups. StudyOS is purpose-built: you drop a raw PDF, and in under 45 seconds you have an interactive, editable tree where checking a subtopic instantly recalculates Module, Subject, and Overall Semester Mastery."
    },
    {
      q: "What happens when the AI gets a topic or module hierarchy slightly wrong?",
      a: "Unlike black-box AI tools, StudyOS has an explicit Human-in-the-Loop review stage. Before any syllabus is saved, you see the detected tree and can drag-and-drop to reorder modules, rename topics, split dense bullet points, or add custom lab assignments with one click."
    },
    {
      q: "Does it support physical photo handouts or only clean digital PDFs?",
      a: "Both. Our optical layout engine is trained on diverse university formats—including blurry phone photos of printed lab sheets, multi-column exam circulars, and Roman numeral unit guides (Unit-I, Chapter 3, Module B)."
    },
    {
      q: "How does progress aggregation work across multiple courses?",
      a: "Every micro-topic has a binary or in-progress state. Completion deterministically rolls up to its parent Module percentage, then into the Subject percentage, and finally into your overall Semester Mastery Index. You get instant visibility into which subjects need urgent attention before midterms."
    },
    {
      q: "Will my progress stay saved if I close or refresh the tab?",
      a: "Yes. StudyOS automatically persists your entire curriculum tree, checked topics, and custom edits locally in your browser and syncs securely whenever you log in."
    },
    {
      q: "Do I need a credit card to get started?",
      a: "No. The Scholar Free plan requires no credit card, never expires, and allows you to parse and track up to 3 complete semester syllabi with full hierarchical rollups."
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-8 lg:px-16 bg-white border-t border-slate-200/80 relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
            Everything you need to know about the <span className="font-drama text-indigo-600 font-normal">engine</span>.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Clear answers to common questions about document parsing, accuracy, and hierarchical tracking.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-50/80 border-indigo-200 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                    {faq.q}
                  </h3>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                      isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed font-sans border-t border-slate-200/60 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
