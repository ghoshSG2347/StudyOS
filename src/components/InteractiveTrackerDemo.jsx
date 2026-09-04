import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileUp, CheckCircle2, ChevronRight, ChevronDown, Plus, Trash2, Edit3, 
  RotateCcw, Sparkles, Layers, Award, BarChart2, ShieldCheck, Check, ArrowRight
} from 'lucide-react';

const INITIAL_SYLLABUS = {
  title: "Semester 4: Computer Science Core",
  institution: "Computer Science & Engineering",
  subjects: [
    {
      id: "sub-1",
      name: "Data Structures & Algorithms",
      code: "CS-201",
      color: "from-indigo-600 to-indigo-500",
      accent: "indigo",
      modules: [
        {
          id: "mod-1-1",
          name: "Module 1: Advanced Tree Structures",
          topics: [
            { id: "top-1-1-1", name: "AVL Trees & Self-Balancing Rotations", completed: true },
            { id: "top-1-1-2", name: "Red-Black Tree Properties & Color Flips", completed: true },
            { id: "top-1-1-3", name: "B-Trees & Multiway Search Indices", completed: false },
          ]
        },
        {
          id: "mod-1-2",
          name: "Module 2: Graph Algorithms & Flow",
          topics: [
            { id: "top-1-2-1", name: "Dijkstra's Shortest Path & Priority Queues", completed: true },
            { id: "top-1-2-2", name: "Bellman-Ford & Negative Cycle Detection", completed: false },
            { id: "top-1-2-3", name: "Ford-Fulkerson Max Flow & Min-Cut Theorem", completed: false },
          ]
        }
      ]
    },
    {
      id: "sub-2",
      name: "Operating Systems & Concurrency",
      code: "CS-204",
      color: "from-amber-500 to-amber-600",
      accent: "amber",
      modules: [
        {
          id: "mod-2-1",
          name: "Module 1: Process Scheduling & Threads",
          topics: [
            { id: "top-2-1-1", name: "Preemptive Multi-Level Feedback Queues", completed: true },
            { id: "top-2-1-2", name: "Dining Philosophers & Deadlock Prevention", completed: true },
            { id: "top-2-1-3", name: "POSIX Semaphore & Mutex Implementations", completed: false },
          ]
        },
        {
          id: "mod-2-2",
          name: "Module 2: Virtual Memory Management",
          topics: [
            { id: "top-2-2-1", name: "Multi-Level Page Tables & TLB Thrashing", completed: false },
            { id: "top-2-2-2", name: "Page Replacement (LRU, Clock & Second Chance)", completed: false },
          ]
        }
      ]
    }
  ]
};

export default function InteractiveTrackerDemo() {
  const [syllabusData, setSyllabusData] = useState(INITIAL_SYLLABUS);
  const [expandedModules, setExpandedModules] = useState({ 'mod-1-1': true, 'mod-1-2': true, 'mod-2-1': true, 'mod-2-2': true });
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'review'

  // Toggle Module Accordion
  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Toggle Topic Completion
  const toggleTopic = (subId, modId, topId) => {
    setSyllabusData(prev => {
      const updatedSubjects = prev.subjects.map(sub => {
        if (sub.id !== subId) return sub;
        const updatedModules = sub.modules.map(mod => {
          if (mod.id !== modId) return mod;
          const updatedTopics = mod.topics.map(top => {
            if (top.id === topId) {
              const nextState = !top.completed;
              if (nextState) {
                // Fire small celebration particle
                confetti({
                  particleCount: 25,
                  spread: 60,
                  origin: { y: 0.75 }
                });
              }
              return { ...top, completed: nextState };
            }
            return top;
          });
          return { ...mod, topics: updatedTopics };
        });
        return { ...sub, modules: updatedModules };
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Add Topic
  const addTopic = (subId, modId) => {
    const topicName = prompt("Enter new topic name:", "New Syllabus Topic");
    if (!topicName || !topicName.trim()) return;

    setSyllabusData(prev => {
      const updatedSubjects = prev.subjects.map(sub => {
        if (sub.id !== subId) return sub;
        const updatedModules = sub.modules.map(mod => {
          if (mod.id !== modId) return mod;
          const newTopic = {
            id: `top-${Date.now()}`,
            name: topicName.trim(),
            completed: false
          };
          return { ...mod, topics: [...mod.topics, newTopic] };
        });
        return { ...sub, modules: updatedModules };
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Delete Topic
  const deleteTopic = (subId, modId, topId) => {
    setSyllabusData(prev => {
      const updatedSubjects = prev.subjects.map(sub => {
        if (sub.id !== subId) return sub;
        const updatedModules = sub.modules.map(mod => {
          if (mod.id !== modId) return mod;
          return { ...mod, topics: mod.topics.filter(t => t.id !== topId) };
        });
        return { ...sub, modules: updatedModules };
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Save Inline Edit
  const saveTopicEdit = (subId, modId, topId) => {
    if (!editingText.trim()) {
      setEditingTopicId(null);
      return;
    }
    setSyllabusData(prev => {
      const updatedSubjects = prev.subjects.map(sub => {
        if (sub.id !== subId) return sub;
        const updatedModules = sub.modules.map(mod => {
          if (mod.id !== modId) return mod;
          return {
            ...mod,
            topics: mod.topics.map(t => t.id === topId ? { ...t, name: editingText.trim() } : t)
          };
        });
        return { ...sub, modules: updatedModules };
      });
      return { ...prev, subjects: updatedSubjects };
    });
    setEditingTopicId(null);
  };

  // Calculate Metrics
  const calculateModuleProgress = (mod) => {
    if (!mod.topics.length) return 0;
    const completedCount = mod.topics.filter(t => t.completed).length;
    return Math.round((completedCount / mod.topics.length) * 100);
  };

  const calculateSubjectProgress = (sub) => {
    let totalTopics = 0;
    let completedTopics = 0;
    sub.modules.forEach(m => {
      totalTopics += m.topics.length;
      completedTopics += m.topics.filter(t => t.completed).length;
    });
    if (!totalTopics) return 0;
    return Math.round((completedTopics / totalTopics) * 100);
  };

  const calculateOverallProgress = () => {
    let totalTopics = 0;
    let completedTopics = 0;
    syllabusData.subjects.forEach(sub => {
      sub.modules.forEach(m => {
        totalTopics += m.topics.length;
        completedTopics += m.topics.filter(t => t.completed).length;
      });
    });
    if (!totalTopics) return 0;
    return {
      percent: Math.round((completedTopics / totalTopics) * 100),
      completed: completedTopics,
      total: totalTopics
    };
  };

  const overall = calculateOverallProgress();

  // Simulate Re-parsing Pipeline
  const runExtractionSimulator = (curriculumName) => {
    setIsSimulatingUpload(true);
    setUploadStep(1);

    setTimeout(() => setUploadStep(2), 700);
    setTimeout(() => setUploadStep(3), 1400);
    setTimeout(() => {
      setIsSimulatingUpload(false);
      setUploadStep(0);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 2100);
  };

  return (
    <section id="simulator" className="py-24 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#FAFAFD] via-indigo-50/20 to-[#FAFAFD] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>LIVE INTERACTIVE TEST FLIGHT</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
            Experience the <span className="font-drama text-indigo-600 font-normal">Syllabus Engine</span> Live.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 max-w-2xl">
            Check off topics below to see instant mathematical progress rollups. Or click "Simulate New Upload" to watch document intelligence reconstruct a messy syllabus in real time.
          </p>
        </div>

        {/* The Instrument Console Box */}
        <div className="glass-card rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Top Console Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="font-mono text-xs text-slate-300 ml-2">
                StudyOS &bull; Hierarchical Progress Engine
              </span>
            </div>

            {/* Quick Curriculum Load Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">SIMULATE PARSE:</span>
              <button
                onClick={() => runExtractionSimulator('CS Core')}
                disabled={isSimulatingUpload}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload Sample PDF</span>
              </button>
              <button
                onClick={() => {
                  setSyllabusData(INITIAL_SYLLABUS);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Reset Tracker State"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading / Extraction Simulation Overlay */}
          {isSimulatingUpload && (
            <div className="p-8 bg-slate-900/95 text-white flex flex-col items-center justify-center min-h-[350px] animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500 text-indigo-400 flex items-center justify-center mb-6 animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <div className="w-full max-w-md space-y-3 font-mono text-xs">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${uploadStep >= 1 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/40 border-slate-700 text-slate-500'}`}>
                  <span>1. OCR &amp; Document Layout Parsing</span>
                  <span className="font-bold">{uploadStep >= 1 ? '✓ COMPLETE' : 'WAITING...'}</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${uploadStep >= 2 ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/40 border-slate-700 text-slate-500'}`}>
                  <span>2. Structural Hierarchy Classification</span>
                  <span className="font-bold">{uploadStep >= 2 ? '✓ STRUCTURE REBUILT' : 'PROCESSING...'}</span>
                </div>
                <div className={`p-3 rounded-xl border flex items-center justify-between ${uploadStep >= 3 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-slate-800/40 border-slate-700 text-slate-500'}`}>
                  <span>3. Schema Validation &amp; Rollup Generation</span>
                  <span className="font-bold">{uploadStep >= 3 ? '✓ 100% READY' : 'WAITING...'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Dashboard Layout */}
          {!isSimulatingUpload && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Left Column: Overall Academic Cockpit */}
              <div className="lg:col-span-4 p-6 sm:p-8 bg-slate-50/70 border-r border-slate-200/80 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      LIVE SEMESTER TELEMETRY
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      VERIFIED
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl text-slate-900 mb-1">
                    {syllabusData.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mb-6">
                    {syllabusData.institution}
                  </p>

                  {/* Master Progress Ring / Big Stat */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                      Overall Academic Mastery
                    </span>
                    <div className="text-5xl font-display font-black text-slate-900 my-2">
                      {overall.percent}%
                    </div>
                    <p className="text-xs font-mono text-slate-500">
                      <span className="text-indigo-600 font-bold">{overall.completed}</span> of <span className="font-bold">{overall.total}</span> micro-topics mastered
                    </p>

                    {/* Progress Track */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-4">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${overall.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Rollups Summary */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    SUBJECT LEVEL BREAKDOWN
                  </span>
                  {syllabusData.subjects.map((sub) => {
                    const progress = calculateSubjectProgress(sub);
                    return (
                      <div key={sub.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                          <span>{sub.code}: {sub.name}</span>
                          <span className="font-mono text-indigo-600">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${sub.color} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Human in the loop reassurance */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/60 text-indigo-950 text-xs flex items-start gap-2.5">
                  <Edit3 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    <span className="font-bold">Human-in-the-Loop:</span> Hover any topic on the right to edit or delete. You have complete structural control.
                  </p>
                </div>
              </div>

              {/* Right Column: Hierarchical Interactive Syllabus Tree */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  
                  {syllabusData.subjects.map((subject) => (
                    <div key={subject.id} className="space-y-3">
                      
                      {/* Subject Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
                            {subject.code}
                          </span>
                          <h4 className="font-display font-bold text-base text-slate-900">
                            {subject.name}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600">
                          {calculateSubjectProgress(subject)}% Done
                        </span>
                      </div>

                      {/* Modules */}
                      <div className="space-y-3">
                        {subject.modules.map((mod) => {
                          const isExpanded = expandedModules[mod.id] !== false;
                          const modProgress = calculateModuleProgress(mod);

                          return (
                            <div key={mod.id} className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all">
                              
                              {/* Module Bar Accordion */}
                              <div
                                onClick={() => toggleModule(mod.id)}
                                className="p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                  <span className="font-semibold text-sm text-slate-800">
                                    {mod.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono font-bold text-slate-600">
                                    {modProgress}%
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addTopic(subject.id, mod.id);
                                    }}
                                    className="p-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 shadow-2xs text-xs flex items-center gap-1 px-2"
                                    title="Add Topic to Module"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span className="text-[10px] font-mono">Add</span>
                                  </button>
                                </div>
                              </div>

                              {/* Topics List */}
                              {isExpanded && (
                                <div className="p-4 divide-y divide-slate-100 bg-white">
                                  {mod.topics.map((topic) => {
                                    const isEditing = editingTopicId === topic.id;

                                    return (
                                      <div
                                        key={topic.id}
                                        className="py-2.5 px-2 flex items-center justify-between gap-3 group hover:bg-slate-50/60 rounded-xl transition-colors"
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          {/* Custom Interactive Checkbox */}
                                          <button
                                            onClick={() => toggleTopic(subject.id, mod.id, topic.id)}
                                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                              topic.completed
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                                                : 'border-2 border-slate-300 hover:border-indigo-400 bg-white'
                                            }`}
                                          >
                                            {topic.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                          </button>

                                          {/* Inline Edit or Normal Text */}
                                          {isEditing ? (
                                            <div className="flex items-center gap-2 flex-1">
                                              <input
                                                type="text"
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') saveTopicEdit(subject.id, mod.id, topic.id);
                                                  if (e.key === 'Escape') setEditingTopicId(null);
                                                }}
                                                autoFocus
                                                className="w-full text-xs font-sans px-2 py-1 border border-indigo-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                              />
                                              <button
                                                onClick={() => saveTopicEdit(subject.id, mod.id, topic.id)}
                                                className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-mono font-bold"
                                              >
                                                Save
                                              </button>
                                            </div>
                                          ) : (
                                            <span
                                              className={`text-xs font-sans select-none ${
                                                topic.completed
                                                  ? 'line-through text-slate-400'
                                                  : 'text-slate-800 font-medium'
                                              }`}
                                            >
                                              {topic.name}
                                            </span>
                                          )}
                                        </div>

                                        {/* Action Hover Icons */}
                                        {!isEditing && (
                                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                            <button
                                              onClick={() => {
                                                setEditingTopicId(topic.id);
                                                setEditingText(topic.name);
                                              }}
                                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                              title="Rename topic"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => deleteTopic(subject.id, mod.id, topic.id)}
                                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                              title="Delete topic"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}

                </div>

                {/* Bottom CTA within Console */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs font-mono text-slate-500">
                    Ready to track your own actual university syllabus?
                  </p>
                  <a
                    href="#pricing"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <span>Open Your Own Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </section>
  );
}
