import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { BrandPanel } from '@/components/auth/BrandPanel';
import { BrandMark } from '@/components/auth/BrandMark';
import { Button } from '@/components/auth/Button';
import { ProfileFormFields } from '@/components/profile/ProfileFormFields';
import { useProfile } from '@/hooks/useProfile';
import { profileToFormData, formDataToProfile } from '@/lib/profile';
import { IS_DEMO_MODE } from '@/lib/demo';
import type { ProfileFormData } from '@/types/profile';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();

  const [formData, setFormData] = useState<ProfileFormData>(() => profileToFormData(profile));
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = IS_DEMO_MODE ? '/workspace/demo' : '/workspace';

  const validate = (): boolean => {
    if (!formData.fullName.trim()) {
      setNameError('Full name is required. Please enter your name to continue.');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const updated = formDataToProfile(formData, profile, true);
      saveProfile(updated);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Error saving onboarding profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    try {
      // If user typed a name, save it; otherwise use whatever existing or fallback name
      const fallbackName = formData.fullName.trim() || profile.fullName || 'Student';
      const skippedData: ProfileFormData = {
        ...formData,
        fullName: fallbackName,
      };
      const updated = formDataToProfile(skippedData, profile, true);
      saveProfile(updated);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Error skipping onboarding:', err);
      navigate(destination, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg transition-colors duration-500">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_1fr]">
        {/* Left Editorial Brand Panel */}
        <BrandPanel
          onBackToLanding={() => navigate('/')}
          tagline="Your syllabus. Your workspace. Built around your studies."
        />

        {/* Right Form Area */}
        <main className="flex flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-12 bg-bg transition-colors duration-500 overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <BrandMark onBackToLanding={() => navigate('/')} />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[460px] py-6 animate-fade-up">
              {/* Onboarding Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Profile Onboarding</span>
                </div>
                <h1 className="font-serif text-[28px] sm:text-[32px] leading-tight font-semibold text-ink-900 tracking-tight">
                  Welcome to StudyOS
                </h1>
                <p className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-ink-600">
                  Set up your student profile to personalize your study space. Only your name is required — you can complete or change the rest anytime.
                </p>
              </div>

              {/* Shared Profile Form Fields */}
              <form onSubmit={handleSaveAndContinue} noValidate>
                <ProfileFormFields
                  data={formData}
                  onChange={setFormData}
                  nameError={nameError}
                  onClearNameError={() => setNameError(null)}
                  disabled={isSubmitting}
                />

                {/* Action Buttons */}
                <div className="mt-8 pt-5 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-sm text-ink-500 hover:text-ink-800 transition py-2 px-3 focus-ring rounded text-center order-2 sm:order-1"
                  >
                    Skip for now
                  </button>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="w-full sm:w-auto px-6 order-1 sm:order-2"
                  >
                    Save & Continue
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </form>

              {/* Informational reassurance */}
              <div className="mt-6 flex items-start gap-2 text-[12px] text-ink-500">
                <CheckCircle2 className="h-4 w-4 text-done flex-shrink-0 mt-0.5" />
                <span>
                  Skipping optional information will never lock features or restrict access to your StudyOS workspace.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

