import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Quote, Star, GraduationCap } from 'lucide-react';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef(null);

  const testimonials = [
    {
      quote: "Before StudyOS, our semester syllabus was a 40-page PDF rotting in our downloads folder. We turned it into an interactive tree in 30 seconds, and for the first time in 4 years of engineering, I actually finished every module before the final exam.",
      author: "Aarav Mehta",
      role: "B.Tech Computer Science & Engineering",
      institution: "IIT Bombay &bull; Class of '25",
      avatar: "👨‍💻",
      highlight: "Completed 100% of coursework on schedule"
    },
    {
      quote: "The human-in-the-loop editing is what separates this from every fake AI app. When the parser extracted our Quantum Mechanics units, I quickly merged two subtopics and had our entire study group tracking module progress live.",
      author: "Elena Rostova",
      role: "M.Sc. Physics & Mathematics",
      institution: "ETH Zürich &bull; Graduate School",
      avatar: "🔬",
      highlight: "Unified 8 course syllabi in one dashboard"
    },
    {
      quote: "As a teaching assistant managing 120 undergraduates, I recommend StudyOS in every orientation. The automatic mathematical rollup from individual micro-topics to subject mastery gives students immediate clarity on where they stand.",
      author: "Dr. Marcus Chen",
      role: "Head Teaching Fellow, Distributed Systems",
      institution: "UC Berkeley EECS",
      avatar: "🎓",
      highlight: "Recommended across Department Orientation"
    }
  ];

  const changeSlide = (direction) => {
    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % testimonials.length
      : (currentIndex - 1 + testimonials.length) % testimonials.length;

    const outX = direction === 'next' ? -60 : 60;
    const inX = direction === 'next' ? 60 : -60;

    gsap.to(cardRef.current, {
      x: outX,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentIndex(nextIndex);
        gsap.fromTo(cardRef.current,
          { x: inX, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
      }
    });
  };

  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-8 lg:px-16 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold mb-6">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>STUDENT EVIDENCE &amp; REVIEWS</span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-12">
          From overwhelm to <span className="font-drama text-indigo-600 font-normal">academic control</span>.
        </h2>

        {/* Stacked Reveal Card */}
        <div className="relative w-full min-h-[340px] flex items-center justify-center">
          
          <div
            ref={cardRef}
            className="w-full glass-card p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden"
          >
            {/* Background Decorative Quote Mark */}
            <div className="absolute top-4 right-8 text-indigo-100 font-drama text-8xl pointer-events-none select-none">
              “
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Quote Body */}
            <p className="font-sans text-base sm:text-xl text-slate-800 leading-relaxed font-normal max-w-2xl mx-auto mb-8">
              "{current.quote}"
            </p>

            {/* Author details */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-inner mb-3">
                {current.avatar}
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                {current.author}
              </h3>
              <p className="text-xs text-indigo-600 font-mono font-semibold">
                {current.role}
              </p>
              <p
                className="text-xs text-slate-400 font-sans mt-0.5"
                dangerouslySetInnerHTML={{ __html: current.institution }}
              />
              <span className="mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold border border-emerald-200">
                {current.highlight}
              </span>
            </div>
          </div>

        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => changeSlide('prev')}
            className="p-3 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/80 transition-all active:scale-90 cursor-pointer shadow-sm"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i !== currentIndex) {
                    changeSlide(i > currentIndex ? 'next' : 'prev');
                  }
                }}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => changeSlide('next')}
            className="p-3 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/80 transition-all active:scale-90 cursor-pointer shadow-sm"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
