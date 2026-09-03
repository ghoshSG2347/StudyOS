import React, { useState } from 'react';
import { 
  CheckSquare, FileUp, BarChart3, Sparkles, BookOpen, 
  ChevronLeft, ChevronRight, Plus, Trash2, Edit3, ShieldCheck, 
  Settings, Zap, ExternalLink, Menu, X, ArrowUpRight, Check, LogOut
} from 'lucide-react';
import PwaInstallPrompt from './PwaInstallPrompt';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  syllabiList, 
  setSyllabiList,
  activeSyllabusId, 
  setActiveSyllabusId, 
  overallStats,
  onOpenUploadModal,
  onRenameSyllabus,
  onDeleteSyllabus,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const { user, signOut } = useAuth();
  const [syllabusDropdownOpen, setSyllabusDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const activeSyllabus = syllabiList.find(s => s.id === activeSyllabusId) || syllabiList[0];

  const navItems = [
    { id: 'tracker', label: 'Interactive Tracker', icon: CheckSquare, badge: `${overallStats.percent}%` },
    { id: 'ingest', label: 'PDF / Image Ingest', icon: FileUp, badge: 'AI OCR' },
    { id: 'analytics', label: 'Mastery Analytics', icon: BarChart3 },
    { id: 'overview', label: 'Landing & Architecture', icon: Sparkles },
  ];

  const handleStartRename = (e, syllabus) => {
    e.stopPropagation();
    setEditingId(syllabus.id);
    setEditingTitle(syllabus.title);
  };

  const handleSaveRename = (e, syllabusId) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      if (onRenameSyllabus) {
        onRenameSyllabus(syllabusId, editingTitle.trim());
      } else {
        setSyllabiList(prev => prev.map(s => s.id === syllabusId ? { ...s, title: editingTitle.trim() } : s));
      }
    }
    setEditingId(null);
  };

  const handleDelete = (e, syllabusId) => {
    e.stopPropagation();
    if (onDeleteSyllabus) {
      onDeleteSyllabus(syllabusId);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-white border-r border-slate-200/90 shadow-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
          
          {/* Brand Logo & Collapse Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="/logo-cropped.png"
                alt="StudyOS"
                className="w-10 h-10 rounded-2xl object-contain shadow-md shadow-indigo-500/25 flex-shrink-0"
              />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg tracking-tight text-slate-900 leading-tight">
                    Study<span className="text-indigo-600">OS</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider">
                    v2.4 &bull; ENGINE
                  </span>
                </div>
              )}
            </div>

            {/* Collapse toggle (Desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Syllabus Selector (Expanded View) */}
          {!isCollapsed && (
            <div className="relative">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <span>ACTIVE CURRICULUM</span>
                <button
                  onClick={onOpenUploadModal}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <button
                onClick={() => setSyllabusDropdownOpen(!syllabusDropdownOpen)}
                className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-left flex items-center justify-between gap-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-display font-bold text-xs text-slate-800 truncate">
                    {activeSyllabus?.title || "Choose Syllabus"}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100/80 text-indigo-700 flex-shrink-0">
                  {overallStats.percent}%
                </span>
              </button>

              {/* Syllabus Dropdown Menu with Rename & Delete actions */}
              {syllabusDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SAVED CURRICULA ({syllabiList.length})</span>
                  </div>

                  {syllabiList.map((s) => {
                    const isEditing = editingId === s.id;
                    const isActive = s.id === activeSyllabusId;

                    return (
                      <div
                        key={s.id}
                        className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between gap-2 transition-colors group ${
                          isActive ? 'bg-indigo-50/80 text-indigo-700 font-bold border border-indigo-200/60' : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(e, s.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="w-full text-xs font-sans px-2 py-1 border border-indigo-400 rounded-lg focus:outline-none bg-white text-slate-900"
                            />
                            <button
                              onClick={(e) => handleSaveRename(e, s.id)}
                              className="p-1 rounded bg-indigo-600 text-white text-[10px] cursor-pointer"
                              title="Save Title"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div 
                              onClick={() => {
                                setActiveSyllabusId(s.id);
                                setSyllabusDropdownOpen(false);
                              }}
                              className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer"
                            >
                              <span className="truncate">{s.title}</span>
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />}
                            </div>

                            {/* Actions on hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleStartRename(e, s)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                                title="Rename Syllabus"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, s.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete Entire Syllabus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setSyllabusDropdownOpen(false);
                      onOpenUploadModal();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Drop New PDF / Photo</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              WORKSPACE
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: User Info + Telemetry Widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* PWA Install Banner */}
              <PwaInstallPrompt />

              {/* Mini Semester Progress Widget */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-400">SEMESTER MASTERY</span>
                  <span className="font-display font-black text-indigo-600">{overallStats.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-amber-500 transition-all duration-500"
                    style={{ width: `${overallStats.percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  {overallStats.completed} / {overallStats.total} topics completed
                </p>
              </div>

              {/* Status Heartbeat */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>ENGINE LIVE</span>
                </div>
                <span>99.9% ACCURACY</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="truncate text-[10px] text-slate-500">{user?.email}</span>
                <button onClick={signOut} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer" title="Sign out">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-[11px] font-bold">
                {overallStats.percent}%
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <button onClick={signOut} title="Sign out" aria-label="Sign out" className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
