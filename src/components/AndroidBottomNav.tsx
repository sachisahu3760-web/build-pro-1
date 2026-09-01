import React from 'react';
import {
  LayoutDashboard,
  Fingerprint,
  Radio,
  Boxes,
  FileSpreadsheet,
  Wallet,
  Menu,
  ShieldCheck,
  HardHat,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { Role, LanguageCode } from '../types';
import { triggerHaptic } from '../hooks/usePWAInstall';

interface AndroidBottomNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  currentRole: Role;
  currentLang: LanguageCode;
  onOpenMenu: () => void;
  materialsLowStockCount?: number;
  safetyHazardsCount?: number;
  unreadChatCount?: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentView,
  onSelectView,
  currentRole,
  currentLang,
  onOpenMenu,
  materialsLowStockCount = 0,
  safetyHazardsCount = 0,
  unreadChatCount = 0,
}) => {
  const isWorker = currentRole === 'worker';

  const handleNavClick = (view: NavView) => {
    triggerHaptic(20);
    onSelectView(view);
  };

  const navItems = isWorker
    ? [
        {
          id: 'selfPunch' as NavView,
          label: 'Punch In',
          icon: Fingerprint,
          isPrimary: true,
        },
        {
          id: 'teamChat' as NavView,
          label: 'Site Radio',
          icon: Radio,
          badge: unreadChatCount,
        },
        {
          id: 'safety' as NavView,
          label: 'Safety',
          icon: ShieldCheck,
          badge: safetyHazardsCount,
        },
        {
          id: 'account' as NavView,
          label: 'My Card',
          icon: HardHat,
        },
      ]
    : [
        {
          id: 'dashboard' as NavView,
          label: 'Overview',
          icon: LayoutDashboard,
        },
        {
          id: 'labourContractor' as NavView,
          label: 'Rates & P&L',
          icon: FileSpreadsheet,
        },
        {
          id: 'selfPunch' as NavView,
          label: 'Punching',
          icon: Fingerprint,
          isPrimary: true,
        },
        {
          id: 'materials' as NavView,
          label: 'Materials',
          icon: Boxes,
          badge: materialsLowStockCount,
        },
        {
          id: 'pettyCash' as NavView,
          label: 'Petty Cash',
          icon: Wallet,
        },
      ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="relative -top-3.5 flex flex-col items-center justify-center focus:outline-hidden"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                    isActive
                      ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-orange-500/40 ring-4 ring-slate-900'
                      : 'bg-gradient-to-tr from-orange-500 to-amber-600 text-white shadow-orange-500/25 ring-2 ring-slate-800'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-black text-orange-400 mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
                isActive ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* All Modules / Sidebar Trigger */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            onOpenMenu();
          }}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all active:scale-95"
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] tracking-tight mt-1">More</span>
        </button>
      </div>
    </div>
  );
};
