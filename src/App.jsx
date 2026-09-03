import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FileUp, BookOpen, Layers, Sparkles, ChevronRight, Menu, X, Plus, Trash2, Edit3, LogOut, UserCircle, AlertTriangle, Download
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { promptPwaInstall, onInstallableChange } from './pwaRegister';
import Hero from './components/Hero3D';

import Features from './components/Features';
import SocialProofBar from './components/SocialProofBar';
import Sidebar from './components/Sidebar';
import TrackerApp from './components/TrackerApp';
import UploadModal from './components/UploadModal';
import { PRESET_CURRICULA } from './utils/syllabusParser';

gsap.registerPlugin(ScrollTrigger);

/*
<!-- BRAND BRAIN: StudyOS Syllabus System -->
Product: StudyOS — The Intelligent Academic Engine
Audience: Engineering, Medicine, Law & University Students
Core Value: AI-Powered Syllabus Ingestion, Noise Purge & Real-Time Mastery Tracking
Primary Action: Ingest PDF / Scanned Photos ➔ 100% Noise-Free Micro-Topic Checklist
<!-- END BRAND BRAIN -->
*/

// Storage key is scoped per user so each account has isolated syllabi

export default function App() {
  const { user, profile, signOut, deleteAccount } = useAuth();

  // Per-user storage key — ensures two accounts on the same device are isolated
  const userId = user?.id ?? 'anonymous';
  const STORAGE_KEY = `studyos_syllabi_v3_${userId}`;

  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('tracker'); // 'tracker' | 'ingest' | 'analytics' | 'overview'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const profileMenuRef = useRef(null);

  // Subscribe to PWA install availability
  useEffect(() => {
    return onInstallableChange((installable) => setCanInstall(installable));
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
        setDeleteConfirmOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: load syllabi for a given storage key
  const loadSyllabiFromStorage = (key) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    return PRESET_CURRICULA;
  };

  // Initialize Syllabi from localStorage or Presets
  const [syllabiList, setSyllabiList] = useState(() => loadSyllabiFromStorage(STORAGE_KEY));
  const [activeSyllabusId, setActiveSyllabusId] = useState(() => syllabiList[0]?.id || 'preset-btech-cse-sem1');

  // ── KEY FIX: Re-load syllabi whenever user switches ──
  // Without this, useState initializer only runs on first mount,
  // so logging into a different account would show the previous user's data.
  const prevUserIdRef = React.useRef(userId);
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId;
      const freshData = loadSyllabiFromStorage(STORAGE_KEY);
      setSyllabiList(freshData);
      setActiveSyllabusId(freshData[0]?.id || 'preset-btech-cse-sem1');
    }
  }, [userId, STORAGE_KEY]);

  // Save to localStorage — includes STORAGE_KEY in deps so we never
  // write stale data under the wrong user's key
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(syllabiList));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [syllabiList, STORAGE_KEY]);

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
    const targetTitle = target ? target.title : "this curriculum";
    if (!confirm(`Are you sure you want to delete the entire syllabus "${targetTitle}"? All subjects and progress will be permanently removed.`)) {
      return;
    }

    const remaining = syllabiList.filter(s => s.id !== id);
    if (remaining.length > 0) {
      setSyllabiList(remaining);
      if (activeSyllabusId === id) {
        setActiveSyllabusId(remaining[0].id);
      }
    } else {
      const fresh = {
        id: `syllabus-${Date.now()}`,
        title: "My Academic Curriculum",
        institution: "University / Department",
        createdAt: new Date().toISOString(),
        subjects: []
      };
      setSyllabiList([fresh]);
      setActiveSyllabusId(fresh.id);
    }
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

            {/* User Avatar + Profile Menu */}
            <div className="relative pl-1 border-l border-slate-200/80" ref={profileMenuRef}>
              <button
                id="header-profile-btn"
                onClick={() => { setProfileMenuOpen(v => !v); setDeleteConfirmOpen(false); }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform ring-2 ring-transparent hover:ring-indigo-300"
                title="Profile menu"
                aria-label="Profile menu"
              >
                {(profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()}
              </button>

              {/* Dropdown */}
              {profileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2.5 w-72 rounded-2xl shadow-2xl border border-slate-200/70 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                >
                  {/* Profile info header */}
                  <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-base font-bold shadow-md flex-shrink-0">
                        {(profile?.username?.[0] || user?.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        {profile?.username && (
                          <p className="font-display font-bold text-sm text-slate-900 truncate">{profile.username}</p>
                        )}
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      id="menu-sign-out-btn"
                      onClick={() => { setProfileMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      Sign Out
                    </button>

                    <div className="my-1 h-px bg-slate-100" />

                    {!deleteConfirmOpen ? (
                      <button
                        id="menu-delete-account-btn"
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="px-3 py-3 rounded-xl bg-red-50/80 border border-red-100">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <p className="text-xs font-bold text-red-600">This cannot be undone</p>
                        </div>
                        <p className="text-[11px] text-red-500/80 mb-3 leading-relaxed">
                          Your profile, saved syllabi, and all data will be permanently removed.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            id="confirm-delete-account-btn"
                            disabled={deleteLoading}
                            onClick={async () => {
                              setDeleteLoading(true);
                              try {
                                await deleteAccount();
                              } catch (err) {
                                console.error('Delete account error:', err);
                                alert('Failed to delete account. Please try again.');
                              } finally {
                                setDeleteLoading(false);
                                setDeleteConfirmOpen(false);
                                setProfileMenuOpen(false);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60"
                          >
                            {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
