import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import philmacLogo from '@/assets/philmac-logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed within 7 days
    const dismissed = localStorage.getItem('philmac_pwa_dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < sevenDays) return;
    }

    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari: show manual install hint after delay (no beforeinstallprompt)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('philmac_pwa_dismissed', Date.now().toString());
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top stripe */}
        <div className="h-1 brand-gradient" />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <img
                src={philmacLogo}
                alt="PHILMAC"
                className="w-11 h-11 object-contain rounded-xl bg-white border border-border p-0.5 shadow-sm"
              />
              <div>
                <p className="font-black text-[hsl(218,72%,12%)] text-sm leading-tight">
                  PHILMAC <span className="text-brand">Cebu</span>
                </p>
                <p className="text-[hsl(218,35%,32%)] text-[11px] leading-tight">Trading Academy</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-[hsl(218,35%,32%)] hover:text-[hsl(218,72%,12%)] shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm font-bold text-[hsl(218,72%,12%)] leading-tight mb-1">
              Add to Home Screen
            </p>
            <p className="text-xs text-[hsl(218,35%,32%)] leading-relaxed">
              {isIOS && !deferredPrompt
                ? 'Tap the Share button below, then select "Add to Home Screen" to install the PHILMAC Cebu app.'
                : 'Install the PHILMAC Cebu app for quick access to your student portal, courses, and challenges — even offline.'}
            </p>
          </div>

          {/* iOS Manual Steps */}
          {isIOS && !deferredPrompt && (
            <div className="bg-[hsl(210,20%,97%)] rounded-xl p-3 mb-4 space-y-1.5">
              {[
                { step: '1', text: 'Tap the Share icon (↑) in Safari' },
                { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
                { step: '3', text: 'Tap "Add" to confirm' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full brand-gradient text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {step}
                  </span>
                  <span className="text-xs text-[hsl(218,72%,12%)]">{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {deferredPrompt ? (
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                size="sm"
                className="flex-1 brand-gradient text-white font-bold hover:opacity-90 gap-1.5 h-9 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
            ) : (
              <Button
                onClick={handleDismiss}
                size="sm"
                className="flex-1 brand-gradient text-white font-bold hover:opacity-90 gap-1.5 h-9 text-xs"
              >
                <Smartphone className="w-3.5 h-3.5" /> Got it
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="h-9 px-3 text-xs text-[hsl(218,35%,32%)] border-border hover:bg-muted"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
