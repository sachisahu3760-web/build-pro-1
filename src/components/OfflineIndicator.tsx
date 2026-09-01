import React from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/95 backdrop-blur-sm px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400/40 animate-bounce">
      <WifiOff className="w-4 h-4 text-white shrink-0" />
      <div>
        <span>Offline Mode</span>
        <span className="hidden sm:inline font-normal text-amber-100 ml-1">
          — Changes saved locally and will auto-sync
        </span>
      </div>
    </div>
  );
};
