/**
 * Service Worker Registration & PWA Install Prompt Manager
 */

let deferredPrompt = null;
const installPromptListeners = new Set();

/**
 * Register the Service Worker
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content is available; please refresh.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });

  // Capture the beforeinstallprompt event for desktop and mobile
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar or browser prompt
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured, ready for desktop/mobile install');
    notifyInstallListeners(true);
  });

  // Listen for successful install
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('[PWA] StudyOS successfully installed!');
    notifyInstallListeners(false);
  });
}

/**
 * Trigger the PWA installation prompt
 */
export async function promptPwaInstall() {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt is not available or app is already installed');
    return false;
  }

  deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;
  console.log('[PWA] User response to install prompt:', choiceResult.outcome);
  deferredPrompt = null;
  notifyInstallListeners(false);
  return choiceResult.outcome === 'accepted';
}

/**
 * Check if the PWA is currently installable
 */
export function canInstallPwa() {
  return Boolean(deferredPrompt);
}

/**
 * Subscribe to installability changes
 */
export function onInstallableChange(callback) {
  installPromptListeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => installPromptListeners.delete(callback);
}

function notifyInstallListeners(installable) {
  installPromptListeners.forEach((listener) => {
    try {
      listener(installable);
    } catch (_) {}
  });
}
