import React, { useState } from 'react';
import { X, Play, CheckCircle2, Sparkles, FileText, ArrowRight, Layers, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DemoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      title: "Step 1: Raw Document Intake",
      badge: "Optical Layout Parsing",
      desc: "Drag and drop multi-page PDFs, scans, or handwritten course guides. The OCR pipeline extracts raw text blocks without flattening structure.",
      code: `POST /api/v1/extract-hierarchy
Payload: "Physics_401_Quantum.pdf" (18 Pages)
Status: 200 OK -> 4 Modules, 22 Topics Detected`
    },
    {
      title: "Step 2: AI Hierarchy Inference",
      badge: "Strict JSON Schema",
      desc: "Our LLM model maps Roman numeral units, chapter headers, and laboratory sessions into a clean nested JSON tree.",
      code: `{
  "subject": "Quantum Mechanics",
  "modules": [
    { "name": "Module 1: Wave Mechanics", "topics": ["Schrödinger Equation", "Potential Wells"] }
  ]
}`
    },
    {
      title: "Step 3: Human Verification Gate",
      badge: "User Corrections",
      desc: "You can rename ambiguous topics, move prerequisites, or split broad chapters with a single click before saving.",
      code: `Action: User renamed "Topic 2.1" -> "Perturbation Theory (Time-Dependent)"
Integrity Check: PASSED. Tree locked.`
    },
    {
      title: "Step 4: Real-time Mathematical Rollup",
      badge: "Deterministic Progress",
      desc: "Each checkbox tick cascades through Module and Subject mastery gauges with mathematical precision.",
      code: `Topic [✓] -> Module 1 Progress: 75% -> Overall Semester: 64.2% (Velocity +12%)`
    }
  ];

  const handleNext = () => {
    if (activeStep < demoSteps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 text-white rounded-[2.5rem] border border-slate-700 shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-white">
              StudyOS Architecture Walkthrough
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              60-Second Interactive System Deep-Dive
            </p>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {demoSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeStep
                  ? 'bg-amber-400'
                  : idx < activeStep
                  ? 'bg-indigo-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step Card Content */}
        <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display font-bold text-base text-slate-100">
              {demoSteps[activeStep].title}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
              {demoSteps[activeStep].badge}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
            {demoSteps[activeStep].desc}
          </p>

          <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
            {demoSteps[activeStep].code}
          </pre>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            Step {activeStep + 1} of {demoSteps.length}
          </span>

          <div className="flex items-center gap-3">
            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>{activeStep === demoSteps.length - 1 ? 'Finish & Launch Simulator' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
