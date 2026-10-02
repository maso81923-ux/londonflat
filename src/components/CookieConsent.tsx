import { useEffect, useRef, useState } from 'react';
import { Cookie, X } from 'lucide-react';

/**
 * UK GDPR / PECR cookie consent.
 *
 * Persists to localStorage under `lf_cookie_consent_v1` as
 * { necessary: true, analytics: boolean, ecosystem: boolean, timestamp, version }.
 *
 * Reopen anytime via the `lf:open-cookie-settings` window event (footer link).
 */

export interface CookieConsentState {
  necessary: boolean;
  analytics: boolean;
  ecosystem: boolean;
  timestamp: string;
  version: string;
}

const STORAGE_KEY = 'lf_cookie_consent_v1';
const CONSENT_VERSION = 'v1';

export function getCookieConsent(): CookieConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(consent: Omit<CookieConsentState, 'timestamp' | 'version'>) {
  const record: CookieConsentState = {
    ...consent,
    necessary: true,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  // Future analytics/ecosystem scripts check these flags before loading.
  window.dispatchEvent(new CustomEvent('lf:consent-changed', { detail: record }));
}

function clearConsent() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('lf:consent-changed', { detail: null }));
}

interface ToggleProps {
  label: string;
  caption: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, caption, checked, disabled, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {label}
          {disabled && (
            <span className="ml-2 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Always Active
            </span>
          )}
          {!disabled && (
            <span className="ml-2 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Disabled by Default
            </span>
          )}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{caption}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${checked ? 'bg-amber-500' : 'bg-slate-700'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function CookieConsent() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ecosystem, setEcosystem] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Initial state + listen for the reopen event
  useEffect(() => {
    if (!getCookieConsent()) {
      setBannerVisible(true);
    }

    const onOpenSettings = () => {
      setPanelOpen(true);
    };
    window.addEventListener('lf:open-cookie-settings', onOpenSettings);

    return () => window.removeEventListener('lf:open-cookie-settings', onOpenSettings);
  }, []);

  // Focus management + Escape-to-close for the panel
  useEffect(() => {
    if (!panelOpen) return;

    const previousActive = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      previousActive?.focus();
    };
  }, [panelOpen]);

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, ecosystem: true });
    setBannerVisible(false);
    setPanelOpen(false);
  };

  const rejectNonEssential = () => {
    saveConsent({ necessary: true, analytics: false, ecosystem: false });
    setBannerVisible(false);
    setPanelOpen(false);
  };

  const savePreferences = () => {
    saveConsent({ necessary: true, analytics, ecosystem });
    setBannerVisible(false);
    setPanelOpen(false);
  };

  const withdrawConsent = () => {
    clearConsent();
    setPanelOpen(false);
    setBannerVisible(true);
  };

  return (
    <>
      {/* Bottom consent banner — first visit only */}
      {bannerVisible && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-800 bg-slate-900/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-slate-300">
                We use cookies to secure our PropTech ecosystem, optimize speed via the Vercel network, and deliver
                targeted real estate listings. By clicking 'Accept All', you consent to the activation of our automated
                performance and analytical metrics in full compliance with UK GDPR and PECR regulations. You can manage
                your specific preferences or read our policy at any time.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences panel / modal */}
      {panelOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setPanelOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-panel-title"
            className="relative w-full max-w-lg rounded-t-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="cookie-panel-title" className="text-lg font-bold text-white">
                  Cookie Preferences
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Manage how LondonFlat uses cookies. Strictly necessary cookies cannot be disabled.
                </p>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={() => setPanelOpen(false)}
                aria-label="Close cookie settings"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800 border-t border-slate-800">
              <Toggle
                label="1. Strictly Necessary Cookies"
                caption="Required for core platform functionality, secure SSL routing via GitHub/Vercel architecture, and user dashboard stability. Cannot be disabled."
                checked={true}
                disabled
                onChange={() => {}}
              />
              <Toggle
                label="2. Analytical & Performance Cookies"
                caption="Used exclusively to track search volume patterns across London Boroughs and evaluate structural traffic entry points without identifying individual users."
                checked={analytics}
                onChange={setAnalytics}
              />
              <Toggle
                label="3. Integrated Ecosystem Cookies"
                caption="Facilitates secure API routing and XML feed tracking between your browser and our corporate partner agencies for real-time listings and related services synchronization."
                checked={ecosystem}
                onChange={setEcosystem}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={withdrawConsent}
                className="text-left text-xs text-slate-500 underline-offset-2 transition hover:text-slate-300 hover:underline"
              >
                Withdraw consent
              </button>
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}