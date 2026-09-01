import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  WifiOff,
  Radio,
  Fingerprint,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { usePWAInstall, triggerHaptic } from '../hooks/usePWAInstall';

interface AndroidAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppInstallModal: React.FC<AndroidAppInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'features'>('install');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    triggerHaptic(25);
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    triggerHaptic(10);
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Android App Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-400/40">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  BuildPulse Android App
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                  Native Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Install as a standalone Android app with offline storage & biometric kiosk
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-slate-900 text-orange-400 border-t-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Tap Install</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'bg-slate-900 text-orange-400 border-t-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Android Features</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-slate-900 text-orange-400 border-t-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Build APK (.apk/.aab)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* App Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/30 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0 shadow-md">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isInstalled
                      ? 'App Installed on this Device'
                      : 'Add to Android Home Screen'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isInstalled
                      ? 'You are running BuildPulse in standalone app mode with zero browser address bars and offline caching.'
                      : 'Installs directly as an Android standalone application with full screen layout, push walkie-talkie audio, and instant field access.'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {isInstalled ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>BuildPulse Pro is already installed & running natively!</span>
                </div>
              ) : isInstallable ? (
                <button
                  id="btn-trigger-android-pwa-install"
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Native Android App Now</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    How to install on Chrome / Android:
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Open this URL in Google Chrome on your Android phone or tablet.</li>
                    <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>The BuildPulse Pro icon will appear on your app launcher.</li>
                  </ol>
                </div>
              )}

              {/* Quick Spec Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Display</span>
                  <span className="text-xs font-extrabold text-white">Standalone</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Offline Sync</span>
                  <span className="text-xs font-extrabold text-emerald-400">IndexedDB + SW</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Biometrics</span>
                  <span className="text-xs font-extrabold text-amber-400">Fingerprint + Camera</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Biometric Face & Touch Punching</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Field workers can clock in/out with high-speed camera selfie and touch haptics even without internet.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Site Comms & Walkie-Talkie</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Push-to-talk field radio, drawing sharing, and instant safety broadcast across channels.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Full Offline-First Engine</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    All rate ledgers, petty cash vouchers, materials silos, and daily reports queue locally and auto-sync when online.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Geofenced GPS Radar</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ensures workers clock in strictly within the registered boundary coordinates of the site.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-3.5 text-xs">
              <p className="text-slate-300 leading-relaxed">
                You can bundle this codebase directly into a Google Play Store signed <strong>.apk</strong> or <strong>.aab</strong> using Capacitor or Google Bubblewrap (TWA):
              </p>

              {/* Option 1: Bubblewrap CLI */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Method 1: Google Bubblewrap (Fastest APK)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('npx @bubblewrap/cli init --manifest=https://your-deployed-url/manifest.webmanifest && npx @bubblewrap/cli build', 'bubblewrap')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'bubblewrap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`# 1. Initialize Google Play Store TWA
npx @bubblewrap/cli init --manifest=https://your-app.run.app/manifest.webmanifest

# 2. Build signed APK & AAB
npx @bubblewrap/cli build`}
                </pre>
              </div>

              {/* Option 2: Capacitor */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Method 2: Ionic Capacitor (Android Studio)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('npm i @capacitor/core @capacitor/android && npx cap init && npx cap add android && npx cap open android', 'capacitor')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    {copiedCmd === 'capacitor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`# 1. Install Capacitor
npm i @capacitor/core @capacitor/cli @capacitor/android

# 2. Build web assets & add Android project
npm run build
npx cap init BuildPulse com.buildpulse.app --web-dir=dist
npx cap add android

# 3. Open in Android Studio to build APK
npx cap open android`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PWA Service Worker Active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
