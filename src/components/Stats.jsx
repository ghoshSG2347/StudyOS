import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Award, Clock, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Stats() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Counter animations
      const counters = document.querySelectorAll('.stat-counter-val');
      counters.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const isDecimal = el.getAttribute('data-decimal') === 'true';

        gsap.fromTo(el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2.2,
            ease: 'power2.out',
            snap: isDecimal ? { innerText: 0.1 } : { innerText: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    {
      value: '52',
      suffix: 'K+',
      label: 'Academic Syllabi Parsed',
      sub: 'Across 480+ universities and competitive boards',
      icon: TrendingUp,
      decimal: false,
    },
    {
      value: '45',
      suffix: 's',
      label: 'Average Ingestion Speed',
      sub: 'From raw PDF drop to fully interactive tracker',
      icon: Clock,
      decimal: false,
    },
    {
      value: '99.4',
      suffix: '%',
      label: 'Structural Accuracy',
      sub: 'Layout-aware hierarchy inference without missing modules',
      icon: Award,
      decimal: true,
    },
    {
      value: '4.2',
      suffix: 'x',
      label: 'Semester Velocity Gain',
      sub: 'Students report completing coursework ahead of finals',
      icon: Sparkles,
      decimal: true,
    },
  ];

  return (
    <section ref={containerRef} className="py-20 px-4 sm:px-8 lg:px-16 bg-slate-100/70 border-y border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">METRIC 0{idx + 1}</span>
                </div>

                <div className="my-2">
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className="stat-counter-val font-display font-black text-4xl sm:text-5xl text-slate-900 tracking-tight"
                      data-target={stat.value}
                      data-decimal={stat.decimal}
                    >
                      0
                    </span>
                    <span className="font-display font-black text-3xl sm:text-4xl text-indigo-600">
                      {stat.suffix}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-800 mt-2">
                    {stat.label}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 font-sans mt-2 pt-3 border-t border-slate-100 leading-normal">
                  {stat.sub}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
