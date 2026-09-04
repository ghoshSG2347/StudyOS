import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FileUp, BookOpen, Layers, Sparkles, ChevronRight, Menu, X, Download
} from 'lucide-react';
import { promptPwaInstall, onInstallableChange } from './pwaRegister';
import Hero from './components/Hero3D';

import Features from './components/Features';
import SocialProofBar from './components/SocialProofBar';
import Sidebar from './components/Sidebar';
import TrackerApp from './components/TrackerApp';
import UploadModal from './components/UploadModal';
import { PRESET_CURRICULA } from './utils/syllabusParser';

gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = 'studyos-syllabus-data';

function loadStoredState() {
  const fallback = {
    syllabiList: PRESET_CURRICULA,
    activeSyllabusId: PRESET_CURRICULA[0]?.id || 'preset-btech-cse-sem1'
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed.syllabiList) || parsed.syllabiList.length === 0) {
      return fallback;
    }

    const activeSyllabusId = parsed.syllabiList.some(syllabus => syllabus.id === parsed.activeSyllabusId)
      ? parsed.activeSyllabusId
      : parsed.syllabiList[0].id;

    return { syllabiList: parsed.syllabiList, activeSyllabusId };
  } catch (error) {
    console.warn('Unable to restore locally saved syllabus data:', error);
    return fallback;
  }
}

/*
<!-- BRAND BRAIN: StudyOS Syllabus System -->
Product: StudyOS — The Intelligent Academic Engine
Audience: Engineering, Medicine, Law & University Students
Core Value: AI-Powered Syllabus Ingestion, Noise Purge & Real-Time Mastery Tracking
Primary Action: Ingest PDF / Scanned Photos ➔ 100% Noise-Free Micro-Topic Checklist
<!-- END BRAND BRAIN -->
*/

export default function App() {
  const [initialState] = useState(loadStoredState);
  const [currentView, setCurrentView] = useState('tracker'); // 'tracker' | 'ingest' | 'analytics' | 'overview'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  // Subscribe to PWA install availability
  useEffect(() => {
    return onInstallableChange((installable) => setCanInstall(installable));
  }, []);

  const [syllabiList, setSyllabiList] = useState(initialState.syllabiList);
  const [activeSyllabusId, setActiveSyllabusId] = useState(initialState.activeSyllabusId);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ syllabiList, activeSyllabusId }));
    } catch (error) {
      console.error('Unable to save syllabus data locally:', error);
    }
  }, [syllabiList, activeSyllabusId]);

  // Calculate Overall Statistics
  const activeSyllabus = syllabiList.find(s => s.id === activeSyllabusId) || syllabiList[0];

  const calculateOverallStats = () => {
    if (!activeSyllabus) return { percent: 0, completed: 0, total: 0 };
    let total = 0;
    let completed = 0;

    activeSyllabus.subjects.forEach(sub => {
      sub.modules.forEach(mod => {
        total += mod.topics.length;
        completed += mod.topics.filter(t => t.completed).length;
      });
    });

    return {
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    };
  };

  const overallStats = calculateOverallStats();

  // Lenis Smooth Scrolling setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const tickerCb = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, []);

  const handleSyllabusParsed = (newSyllabus) => {
    setSyllabiList(prev => [newSyllabus, ...prev]);
    setActiveSyllabusId(newSyllabus.id);
    setCurrentView('tracker');
  };

  // Syllabus Rename Handler
  const handleRenameSyllabus = (id, newTitle, newInstitution) => {
    setSyllabiList(prev => prev.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        title: newTitle.trim(),
        institution: newInstitution !== undefined ? newInstitution.trim() : s.institution
      };
    }));
  };

  // Syllabus Delete Handler
  const handleDeleteSyllabus = (id) => {
    const target = syllabiList.find(s => s.id === id);
    if (!target) return;
    const targetTitle = target ? target.title : "this curriculum";
    if (!confirm(`Are you sure you want to delete the entire syllabus "${targetTitle}"? All subjects and progress will be permanently removed.`)) {
      return;
    }
    const remaining = syllabiList.filter(s => s.id !== id);
    const replacement = {
      id: `syllabus-${Date.now()}`,
      title: "My Academic Curriculum",
      institution: "University / Department",
      createdAt: new Date().toISOString(),
      subjects: []
    };
    const nextList = remaining.length > 0 ? remaining : [replacement];
    setSyllabiList(nextList);
    setActiveSyllabusId(nextList[0].id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col lg:flex-row overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Modern Left Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        syllabiList={syllabiList}
        setSyllabiList={setSyllabiList}
        activeSyllabusId={activeSyllabusId}
        setActiveSyllabusId={setActiveSyllabusId}
        overallStats={overallStats}
        onOpenUploadModal={() => setUploadModalOpen(true)}
        onRenameSyllabus={handleRenameSyllabus}
        onDeleteSyllabus={handleDeleteSyllabus}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-900">StudyOS</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[160px] sm:max-w-xs text-indigo-600 font-semibold">
                {activeSyllabus?.title || "Curriculum"}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {canInstall && (
              <button
                onClick={promptPwaInstall}
                className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold font-mono border border-violet-200/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Install StudyOS on desktop or mobile"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold font-mono border border-indigo-200/80 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drop PDF / Photo</span>
              <span className="sm:hidden">Drop</span>
            </button>

            <button
              onClick={() => setCurrentView(currentView === 'overview' ? 'tracker' : 'overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'overview'
                  ? 'bg-slate-900 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentView === 'overview' ? 'Open Workspace' : 'Brand Story & 3D'}</span>
            </button>

          </div>
        </header>

        {/* View Routing */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 lg:p-10 flex flex-col">
          
          {/* 1. Core Functional Tracker & Ingest Views */}
          {currentView !== 'overview' && (
            <TrackerApp
              currentView={currentView}
              setCurrentView={setCurrentView}
              syllabiList={syllabiList}
              setSyllabiList={setSyllabiList}
              activeSyllabusId={activeSyllabusId}
              setActiveSyllabusId={setActiveSyllabusId}
              overallStats={overallStats}
              onRenameSyllabus={handleRenameSyllabus}
              onDeleteSyllabus={handleDeleteSyllabus}
            />
          )}

          {/* 2. Full Cinematic Brand Landing & 3D Experience */}
          {currentView === 'overview' && (
            <div className="space-y-16 animate-in fade-in duration-300">
              <Hero onOpenDemo={() => setDemoModalOpen(true)} />
              <SocialProofBar />
              <Features />
              
              {/* Embedded Interactive Tracker */}
              <div className="space-y-4">
                <div className="text-center max-w-2xl mx-auto mb-6">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold">
                    IN-APP LIVE WORKSPACE
                  </span>
                  <h2 className="font-display font-black text-3xl text-slate-900 mt-2">
                    Your Active Curriculum Tree
                  </h2>
                </div>
                <TrackerApp
                  currentView="tracker"
                  setCurrentView={setCurrentView}
                  syllabiList={syllabiList}
                  setSyllabiList={setSyllabiList}
                  activeSyllabusId={activeSyllabusId}
                  setActiveSyllabusId={setActiveSyllabusId}
                  overallStats={overallStats}
                  onRenameSyllabus={handleRenameSyllabus}
                  onDeleteSyllabus={handleDeleteSyllabus}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Real Ingest Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSyllabusParsed={handleSyllabusParsed}
      />
    </div>
  );
}
