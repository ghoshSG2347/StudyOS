import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, X, CheckCircle2, Sparkles } from 'lucide-react';
import { onInstallableChange, promptPwaInstall } from '../pwaRegister';

export default function PwaInstallPrompt({ className = '' }) {
  const [installable, setInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(inStandalone);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    setIsIOS(isAppleDevice && isSafari && !inStandalone);

    // Listen for installability
    const unsubscribe = onInstallableChange((canInstall) => {
      setInstallable(canInstall && !inStandalone);
    });

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    const accepted = await promptPwaInstall();
    if (accepted) {
      setInstalledSuccess(true);
      setTimeout(() => setInstallable(false), 3000);
    }
  };

  // If already installed or dismissed, do not render
  if (isStandalone || dismissed || (!installable && !isIOS)) {
    return null;
  }

  return (
    <div className={`transition-all duration-300 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-violet-950/80 border border-indigo-500/30 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Install StudyOS App
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 text-[9px] font-mono uppercase">
                    PWA
                  </span>
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {isIOS
                  ? "Tap Safari's Share button and select 'Add to Home Screen' for offline access."
                  : 'Install on Desktop or Mobile for instant offline access and faster loading.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        {!isIOS && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/10">
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-xs
                bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all
                cursor-pointer active:scale-[0.98]"
            >
              {installedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Installed Successfully!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
