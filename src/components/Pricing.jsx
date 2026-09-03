import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const handleSelectPlan = (planName) => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  const plans = [
    {
      name: 'Scholar Free',
      tagline: 'For individual students starting a new term.',
      price: '$0',
      period: 'forever',
      popular: false,
      features: [
        '3 Active Syllabus Trees',
        'PDF & Digital Doc Extraction',
        'Human-in-the-Loop Inline Editor',
        'Hierarchical Progress Rollups',
        'Local Browser Persistence',
      ],
      cta: 'Start Free Forever',
      ctaVariant: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    },
    {
      name: 'Academic Pro',
      tagline: 'For serious undergrads, postgrads & competitive exam prep.',
      price: isAnnual ? '$6' : '$9',
      period: 'per month, billed ' + (isAnnual ? 'annually' : 'monthly'),
      popular: true,
      badge: 'MOST POPULAR',
      features: [
        'Unlimited Syllabus Ingestions',
        'Advanced Scanned Photo & OCR Engine',
        'Multi-Semester Dashboard Aggregation',
        'Milestone Exam Velocity Forecaster',
        'Priority JSON Schema Extraction',
        'Export to Notion / Markdown / CSV',
      ],
      cta: 'Claim 14-Day Free Trial',
      ctaVariant: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30',
    },
    {
      name: 'Study Group / Lab',
      tagline: 'For project teams, student cohorts & TAs.',
      price: isAnnual ? '$15' : '$19',
      period: 'per month (up to 5 members)',
      popular: false,
      features: [
        'Shared Collaborative Syllabus Trackers',
        'Team Member Completion Analytics',
        'TA & Professor Role Permissions',
        'Department LMS Syllabus Sync (Canvas/Moodle)',
        'Dedicated Fast-Track Support',
      ],
      cta: 'Get Group Access',
      ctaVariant: 'bg-slate-900 hover:bg-slate-800 text-white',
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-8 lg:px-16 bg-[#FAFAFD] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>TRANSPARENT STUDENT-FIRST PRICING</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
            Invest in clarity. <span className="font-drama text-indigo-600 font-normal">Ace your degree</span>.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 max-w-2xl">
            Start for free today. Upgrade when you want unlimited scanned OCR parsing and semester-wide velocity forecasts.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-slate-200/80 border border-slate-300/60">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual (Save 33%)</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                SAVE
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? 'bg-white border-2 border-indigo-600 shadow-2xl shadow-indigo-600/10 scale-100 lg:scale-105 z-10'
                  : 'bg-white/80 glass-card border border-slate-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-mono text-[10px] font-black tracking-wider uppercase shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="font-display font-extrabold text-2xl text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                    {plan.tagline}
                  </p>
                </div>

                <div className="my-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-black text-5xl text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      /{plan.price === '$0' ? 'forever' : 'mo'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {plan.period}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    INCLUDED CAPABILITIES:
                  </span>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ${plan.ctaVariant}`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
