import { useEffect, useState, useCallback } from "react";
import CcmIcon from "@/components/CcmIcon";

function isStandalonePwa() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosTouchDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export default function PwaInstallButton() {
  const [ui, setUi] = useState("checking");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [iosModalOpen, setIosModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStandalonePwa()) {
      setUi("hidden");
      return;
    }

    if (isIosTouchDevice()) {
      setUi("ios");
    }

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setUi("chromium");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (ui === "chromium" && deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {
        /* user dismissed or prompt failed */
      }
      setDeferredPrompt(null);
      setUi("hidden");
      return;
    }
    if (ui === "ios") {
      setIosModalOpen(true);
    }
  }, [ui, deferredPrompt]);

  if (ui === "hidden" || ui === "checking") {
    return null;
  }

  const label = ui === "ios" ? "Add to Home Screen" : "Install app";

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="ui-btn-secondary w-full min-h-[44px] touch-manipulation"
      >
        <span className="inline-flex items-center justify-center gap-2">
          <CcmIcon name="download" size={20} className="text-slate-700" />
          {label}
        </span>
      </button>

      {iosModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-ios-install-title"
          onClick={() => setIosModalOpen(false)}
        >
          <div
            className="ui-card-padded max-h-[90dvh] w-full max-w-md overflow-y-auto !p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="pwa-ios-install-title"
              className="ui-section-title mb-3 text-base"
            >
              Add to Home Screen
            </h3>
            <ol className="mb-6 list-decimal list-inside space-y-2 text-sm text-slate-700">
              <li>
                Tap the Share button{" "}
                <span className="font-medium">(square with arrow)</span> in
                Safari&apos;s toolbar.
              </li>
              <li>
                Scroll and tap{" "}
                <span className="font-medium">Add to Home Screen</span>.
              </li>
              <li>
                Tap <span className="font-medium">Add</span> to confirm.
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setIosModalOpen(false)}
              className="ui-btn-primary w-full min-h-[44px] touch-manipulation"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
