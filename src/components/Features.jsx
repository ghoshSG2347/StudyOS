import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers, Terminal, LineChart, Sparkles, CheckCircle2, ArrowUpRight, Cpu, RefreshCw, Edit3, BarChart3, SlidersHorizontal } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const containerRef = useRef(null);

  // --- CARD 1 STATE: Diagnostic Shuffler ---
  const [shufflerIndex, setShufflerIndex] = useState(0);
  const shufflerItems = [
    {
      stage: '01. Raw Document Ingestion',
      badge: 'PDF / OCR / JPG',
      detail: 'Detects multi-column syllabus layouts, footnotes, and Roman numerals (Unit-I, Module 2, Chapter 4)',
      status: 'STRUCTURE DETECTED',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      stage: '02. Hierarchy Classifier',
      badge: 'LLM Schema Model',
      detail: 'Eliminates flat list syndrome. Constructs strict Parent-Child hierarchy (Subject → Module → Topic)',
      status: 'SCHEMA VALIDATED',
      accent: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      stage: '03. Human Approval Gate',
      badge: 'Interactive Correction',
      detail: 'Drag to reorder, split dense subtopics, or merge overlapping concepts before persisting to tracker',
      status: 'VERIFIED BY STUDENT',
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setShufflerIndex((prev) => (prev + 1) % shufflerItems.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [shufflerItems.length]);

  // --- CARD 2 STATE: Telemetry Typewriter ---
  const [typewriterText, setTypewriterText] = useState('');
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const telemetryMessages = [
    'Parsing: "PHYS-301: Classical Mechanics & Lagrangian Dynamics"...',
    'Confidence 99.8%: Detected 4 Modules, 18 Core Topics, 6 Lab Units.',
    'Hierarchy mapped: Hamiltonian Mechanics → Variational Calculus → Euler-Lagrange.',
    'Anomaly check: Zero missing prerequisites detected across Semester 5.',
    'Human Override Enabled: User renamed "Topic 4.2" in 0.4 seconds.',
  ];

  useEffect(() => {
    let timeoutId;
    const targetText = telemetryMessages[currentMsgIndex];
    let charIdx = 0;
    setTypewriterText('');
    setIsTyping(true);

    const typeChar = () => {
      if (charIdx <= targetText.length) {
        setTypewriterText(targetText.slice(0, charIdx));
        charIdx++;
        timeoutId = setTimeout(typeChar, 25);
      } else {
        setIsTyping(false);
        timeoutId = setTimeout(() => {
          // Scramble transition
          scrambleAndNext();
        }, 2200);
      }
    };

    const scrambleAndNext = () => {
      const chars = '01#%*&!_XYZABC{}<>';
      let count = 0;
      const scrambleInterval = setInterval(() => {
        const scrambled = Array.from({ length: 28 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        setTypewriterText(scrambled);
        count++;
        if (count > 6) {
          clearInterval(scrambleInterval);
          setCurrentMsgIndex((prev) => (prev + 1) % telemetryMessages.length);
        }
      }, 50);
    };

    timeoutId = setTimeout(typeChar, 100);
    return () => clearTimeout(timeoutId);
  }, [currentMsgIndex]);

  // --- CARD 3 STATE: Signal Graph Hover ---
  const [activeDataPoint, setActiveDataPoint] = useState(null);
  const graphPoints = [
    { week: 'W1', mastery: 15, label: 'Syllabus Parsed & Verified' },
    { week: 'W2', mastery: 32, label: 'Module 1 Complete' },
    { week: 'W3', mastery: 48, label: 'Mid-term Milestone Hit' },
    { week: 'W4', mastery: 68, label: 'Problem Sets Aggregated' },
    { week: 'W5', mastery: 84, label: 'Subject 2 Velocity Max' },
    { week: 'W6', mastery: 96, label: 'Final Exam Readiness: Peak' },
  ];

  // GSAP ScrollTrigger Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.18,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={containerRef} className="py-24 px-4 sm:px-8 lg:px-16 bg-[#FAFAFD] relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>THREE CORE ARCHITECTURAL PILLARS</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
            Not another checklist. A <span className="font-drama text-indigo-600 font-normal">learning instrument</span>.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 max-w-2xl">
            Engineered specifically to solve the document-to-hierarchy bottleneck that makes traditional study apps useless for university curricula.
          </p>
        </div>

        {/* 3 Interactive Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Diagnostic Shuffler */}
          <div className="feature-card glass-card rounded-[2.5rem] p-7 flex flex-col justify-between border border-slate-200/80 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  PILLAR 01
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2">
                Document-to-Hierarchy Engine
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Extracts nested subjects, modules, and subtopics from any formatting — whether Roman numerals, unit codes, or unstructured text.
              </p>
            </div>

            {/* Shuffler Interactive Artifact */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-inner mt-4 min-h-[190px] flex flex-col justify-between" style={{ perspective: '800px' }}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  PIPELINE STAGE
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  AUTO CYCLE 3.2s
                </span>
              </div>

              {/* Shuffling Card Item */}
              <div
                key={shufflerIndex}
                className="my-3 transition-all duration-500 ease-out transform"
                style={{
                  animation: 'shufflerFlip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-bold text-slate-100 font-display">{shufflerItems[shufflerIndex].stage}</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                    {shufflerItems[shufflerIndex].badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  {shufflerItems[shufflerIndex].detail}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">STATE:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {shufflerItems[shufflerIndex].status}
                </span>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Layout-Aware OCR</span>
              <span className="text-indigo-600 font-mono text-[11px]">Zero Manual Copy</span>
            </div>
          </div>

          {/* Card 2: Telemetry Typewriter */}
          <div className="feature-card glass-card rounded-[2.5rem] p-7 flex flex-col justify-between border border-slate-200/80 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  PILLAR 02
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2">
                Human-in-the-Loop Gate
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI does the heavy lifting, but you control your syllabus. Add missing subtopics, reorder modules, and lock your structure with full confidence.
              </p>
            </div>

            {/* Typewriter Terminal Artifact */}
            <div className="bg-slate-950 text-emerald-400 rounded-3xl p-5 shadow-inner mt-4 min-h-[190px] flex flex-col justify-between font-mono border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-emerald-400">● LIVE TELEMETRY</span>
                </div>
                <span className="text-slate-500">JSON Schema v2.1</span>
              </div>

              {/* Feed Text */}
              <div className="my-3 text-xs leading-relaxed text-slate-200 break-words min-h-[60px]">
                <span>{typewriterText}</span>
                <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>PARSER CONFIDENCE</span>
                <span className="text-indigo-400 font-bold font-mono">99.84% &bull; VALID</span>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Human Correction Layer</span>
              <span className="text-amber-600 font-mono text-[11px]">Student-Owned Data</span>
            </div>
          </div>

          {/* Card 3: Signal Graph */}
          <div className="feature-card glass-card rounded-[2.5rem] p-7 flex flex-col justify-between border border-slate-200/80 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  PILLAR 03
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2">
                Hierarchical Mathematical Rollup
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Checking off a single topic automatically updates its Module, Subject, and Overall Academic Mastery percentage in real-time.
              </p>
            </div>

            {/* Signal Graph SVG Artifact */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-inner mt-4 min-h-[190px] flex flex-col justify-between relative">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <LineChart className="w-3.5 h-3.5" />
                  MASTERY VELOCITY CURVE
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  +38% ACCELERATION
                </span>
              </div>

              {/* Interactive SVG Chart */}
              <div className="relative my-2 h-24 w-full flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#334155" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" strokeDasharray="3 3" />

                  {/* Gradient Area */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 70 L 60 55 L 115 42 L 175 28 L 230 16 L 285 8 L 285 75 L 10 75 Z"
                    fill="url(#chartGrad)"
                  />

                  {/* Glowing Animated Line */}
                  <path
                    d="M 10 70 L 60 55 L 115 42 L 175 28 L 230 16 L 285 8"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {graphPoints.map((pt, i) => {
                    const cx = 10 + i * 55;
                    const cy = 70 - (pt.mastery / 100) * 62;
                    return (
                      <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveDataPoint(pt)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={activeDataPoint?.week === pt.week ? 6 : 4}
                          fill={activeDataPoint?.week === pt.week ? '#F59E0B' : '#6366F1'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip Overlay */}
                {activeDataPoint && (
                  <div className="absolute top-0 right-2 bg-slate-800/95 border border-slate-700 text-white text-[10px] p-2 rounded-xl shadow-lg pointer-events-none backdrop-blur animate-in fade-in zoom-in-95">
                    <p className="font-bold text-amber-400">{activeDataPoint.week}: {activeDataPoint.mastery}% Complete</p>
                    <p className="text-slate-300 font-sans">{activeDataPoint.label}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>W1 (INIT)</span>
                <span>W3 (MID)</span>
                <span>W6 (MASTERY 96%)</span>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Automatic Aggregation</span>
              <span className="text-emerald-600 font-mono text-[11px]">100% Deterministic</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
