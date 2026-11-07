import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useTheme } from '@/hooks/useTheme';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProblemSection } from '@/components/ProblemSection';
import { TreeStory } from '@/components/TreeStory';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { StudentControl } from '@/components/StudentControl';
import { MaterialsSection } from '@/components/MaterialsSection';
import { AISection } from '@/components/AISection';
import { Philosophy } from '@/components/Philosophy';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  useSmoothScroll();
  useTheme();

  return (
    <div className="relative min-h-screen bg-bg text-ink antialiased transition-colors duration-500">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <TreeStory />
        <HowItWorks />
        <Features />
        <StudentControl />
        <MaterialsSection />
        <AISection />
        <Philosophy />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
