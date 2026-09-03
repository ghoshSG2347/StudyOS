import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenDemo }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Capabilities', href: '#features' },
    { label: 'Live Simulator', href: '#simulator' },
    { label: 'Workflow', href: '#how-it-works' },
    { label: 'Manifesto', href: '#manifesto' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto transition-all duration-300 ease-out flex items-center justify-between gap-6 px-5 py-3 rounded-full ${
          isScrolled
            ? 'glass-nav shadow-lg shadow-indigo-950/5 border-slate-200/80 w-full max-w-4xl'
            : 'bg-white/40 backdrop-blur-md border border-white/60 shadow-sm w-full max-w-5xl'
        }`}
      >
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-tight text-slate-900 leading-none">
              Study<span className="text-indigo-600">OS</span>
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-500 tracking-wider">
              v2.4 &bull; ENGINE
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-full border border-slate-200/50">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-white rounded-full transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenDemo}
            className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5 transition-colors cursor-pointer"
          >
            Live Parser
          </button>
          <a
            href="#simulator"
            className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 transition-all duration-200"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none rounded-lg"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 inset-x-4 glass-card p-5 rounded-3xl shadow-2xl border border-slate-200 pointer-events-auto flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="h-px bg-slate-100 my-1" />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenDemo) onOpenDemo();
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-800 text-sm font-semibold text-center hover:bg-slate-200 transition-colors"
            >
              Test Syllabus Parser
            </button>
            <a
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
