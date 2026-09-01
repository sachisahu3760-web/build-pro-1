import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall, triggerHaptic } from '../hooks/usePWAInstall';
import { AndroidAppInstallModal } from './AndroidAppInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  compact = false,
}) => {
  const { isInstallable, isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        id="btn-android-app-launcher"
        type="button"
        onClick={() => {
          triggerHaptic(15);
          setShowModal(true);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 hover:text-white hover:border-orange-400 font-bold text-xs transition-all shadow-xs group ${className}`}
        title="Android Native App & Install Options"
      >
        <Smartphone className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
        {!compact && (
          <span className="hidden sm:inline">
            {isInstalled ? 'Android App' : 'Get Android App'}
          </span>
        )}
      </button>

      <AndroidAppInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
