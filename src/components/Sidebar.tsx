import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Users,
  MapPin,
  Camera,
  ShieldAlert,
  Wallet,
  FolderLock,
  MessageSquare,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ReceiptText,
  Shield,
  Radio,
  KeyRound,
  Banknote,
  LogOut,
  AlertTriangle,
  RefreshCw,
  User,
  Menu,
} from 'lucide-react';
import { getTranslation } from '../lib/i18n';
import { LanguageCode, Role, WorkerProfile } from '../types';
import { store } from '../lib/offlineStore';
import { auth, signOutUser } from '../lib/firebase';
import { AllFeaturesModal } from './AllFeaturesModal';

export type NavView =
  | 'dashboard'
  | 'masterAdmin'
  | 'labourContractor'
  | 'pettyCash'
  | 'selfPunch'
  | 'materials'
  | 'workers'
  | 'liveLocation'
  | 'siteProgress'
  | 'safety'
  | 'budget'
  | 'documents'
  | 'teamChat'
  | 'reports'
  | 'account';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  currentLang: LanguageCode;
  currentRole: Role;
  workers: WorkerProfile[];
  materialsLowStockCount: number;
  safetyHazardsCount: number;
  unreadChatCount: number;
  onOpenAiHub: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentLang,
  currentRole,
  workers,
  materialsLowStockCount,
  safetyHazardsCount,
  unreadChatCount,
  onOpenAiHub,
  onLogout,
}) => {
  const [punchedIn, setPunchedIn] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAllFeaturesModal, setShowAllFeaturesModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const isWorkerRole = currentRole === 'worker';

  const workerPrimaryItems: Array<{
    id: NavView;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'selfPunch',
      label: 'Punching Button',
      description: 'GPS Clock-In & Face Biometric',
      icon: <Clock className="w-4 h-4 text-emerald-400" />,
      badge: 'TAP TO PUNCH',
      badgeColor: 'bg-emerald-600 text-white text-[9px] font-bold animate-pulse',
    },
    {
      id: 'teamChat',
      label: 'Site Comm & Radio',
      description: 'Walkie-Talkie & Voice Dispatch',
      icon: <Radio className="w-4 h-4 text-blue-400" />,
      badge: unreadChatCount > 0 ? `${unreadChatCount} New` : 'LIVE',
      badgeColor: 'bg-blue-600 text-white text-[9px] font-bold',
    },
  ];

  const workerSecondaryItems: Array<{
    id: NavView;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'liveLocation', label: 'Site Radar & Geofence', icon: <MapPin className="w-4 h-4 text-slate-400" /> },
    { id: 'safety', label: 'Safety Guidelines & SOS', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
    { id: 'account', label: 'My Account & Pass', icon: <User className="w-4 h-4 text-sky-400" /> },
  ];

  const managementItems: Array<{
    id: NavView;
    labelKey: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', labelKey: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'masterAdmin',
      labelKey: 'masterAdmin',
      icon: <Shield className="w-4 h-4 text-purple-400" />,
      badge: 'RBAC',
      badgeColor: 'bg-purple-600 text-white text-[9px]',
    },
    {
      id: 'labourContractor',
      labelKey: 'labourContractor',
      icon: <ReceiptText className="w-4 h-4 text-orange-400" />,
      badge: 'RATE & P&L',
      badgeColor: 'bg-orange-600 text-white text-[9px]',
    },
    {
      id: 'pettyCash',
      labelKey: 'pettyCash',
      icon: <Banknote className="w-4 h-4 text-emerald-400" />,
      badge: 'DAILY CASH',
      badgeColor: 'bg-emerald-600 text-white text-[9px]',
    },
    {
      id: 'materials',
      labelKey: 'materials',
      icon: <Boxes className="w-4 h-4" />,
      badge: materialsLowStockCount > 0 ? materialsLowStockCount : undefined,
      badgeColor: 'bg-orange-500 text-white',
    },
    { id: 'workers', labelKey: 'workers', icon: <Users className="w-4 h-4" /> },
    {
      id: 'safety',
      labelKey: 'safety',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: safetyHazardsCount > 0 ? safetyHazardsCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'budget', labelKey: 'budget', icon: <Wallet className="w-4 h-4" /> },
    { id: 'reports', labelKey: 'reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    {
      id: 'account',
      labelKey: 'account',
      icon: <User className="w-4 h-4 text-sky-400" />,
    },
  ];

  const fieldToolItems: Array<{
    id: NavView;
    labelKey: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'selfPunch',
      labelKey: 'selfPunch',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      badge: 'GPS LIVE',
      badgeColor: 'bg-emerald-600 text-white text-[9px]',
    },
    { id: 'liveLocation', labelKey: 'liveLocation', icon: <MapPin className="w-4 h-4" /> },
    { id: 'siteProgress', labelKey: 'siteProgress', icon: <Camera className="w-4 h-4" /> },
    { id: 'documents', labelKey: 'documents', icon: <FolderLock className="w-4 h-4" /> },
    {
      id: 'teamChat',
      labelKey: 'teamChat',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
      badgeColor: 'bg-blue-500 text-white',
    },
  ];

  const handleQuickPunchIn = () => {
    if (workers.length > 0) {
      store.recordPunchIn(workers[0].id);
      setPunchedIn(true);
      setTimeout(() => setPunchedIn(false), 3000);
    }
  };

  const handleSidebarLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    try {
      const prevName = user?.displayName || 'Site Supervisor (Arjun Patel)';
      const prevEmail = user?.email || 'local.session@buildpulse';

      await signOutUser();

      store.addSecurityAuditLog({
        actorId: user?.uid || 'usr-session',
        actorName: prevName,
        actorRole: currentRole,
        action: 'User Session Terminated / Logged Out',
        category: 'AUTH_RBAC',
        targetResource: prevEmail,
        severity: 'INFO',
        details: `User signed out via Sidebar profile footer at ${new Date().toLocaleTimeString()}.`,
      });

      store.addNotification({
        title: 'Logged Out',
        message: `Signed out of BuildPulse Pro. Local cached data remains safe offline.`,
        type: 'info',
        category: 'schedule',
      });

      if (onLogout) {
        onLogout();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] lg:w-[260px] bg-[#0f172a] text-white shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto border-r border-slate-800">
        
        {/* Quick Launcher: All App Features & Options */}
        <div className="px-3 pt-3 pb-1">
          <button
            id="btn-sidebar-all-features"
            type="button"
            onClick={() => setShowAllFeaturesModal(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-800 border border-slate-700/80 hover:border-orange-500/80 text-white text-xs font-bold transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Menu className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-100 group-hover:text-orange-400 transition-colors">
                  All App Features
                </span>
                <span className="block text-[10px] text-slate-400 font-normal">
                  Full module directory
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-5">
          {isWorkerRole ? (
            <>
              {/* Worker Primary Tools Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-2">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Labor & Worker Station
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                    FIELD ACTIVE
                  </span>
                </div>

                <div className="space-y-2">
                  {workerPrimaryItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`worker-nav-${item.id}`}
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left group ${
                          isActive
                            ? 'bg-gradient-to-r from-slate-800 to-slate-800/90 border-emerald-500/80 text-white shadow-md shadow-emerald-950/30'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                                : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            </div>
                            <span className="text-[10px] text-slate-400 block leading-tight">
                              {item.description}
                            </span>
                          </div>
                        </div>

                        {item.badge && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Worker Secondary Field Tools */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 px-2">
                  Field Radar & Safety
                </div>

                <div className="space-y-1">
                  {workerSecondaryItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`worker-nav-${item.id}`}
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-300 hover:bg-slate-800/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isActive ? (
                            <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                          ) : (
                            <span className="text-slate-400 group-hover:text-slate-300">{item.icon}</span>
                          )}
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Management Section */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 px-2">
                  Management
                </div>

                <div className="space-y-1">
                  {managementItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-300 hover:bg-slate-800/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isActive ? (
                            <div className="w-1 h-3.5 bg-orange-500 rounded-full" />
                          ) : (
                            <span className="text-slate-400 group-hover:text-slate-300">{item.icon}</span>
                          )}
                          <span>{getTranslation(currentLang, item.labelKey)}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field Tools Section */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 px-2">
                  Field Tools
                </div>

                <div className="space-y-1">
                  {fieldToolItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        onClick={() => onSelectView(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-300 hover:bg-slate-800/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isActive ? (
                            <div className="w-1 h-3.5 bg-orange-500 rounded-full" />
                          ) : (
                            <span className="text-slate-400 group-hover:text-slate-300">{item.icon}</span>
                          )}
                          <span>{getTranslation(currentLang, item.labelKey)}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Gemini AI Site Engine button */}
          <div className="pt-2">
            <button
              onClick={onOpenAiHub}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-800/40 text-purple-200 text-xs font-semibold hover:border-purple-600 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Gemini AI Engine</span>
            </button>
          </div>
        </nav>

        {/* User profile & Offline Status Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#0f172a] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              id="btn-sidebar-user-account"
              type="button"
              onClick={() => onSelectView('account')}
              title="Open Account & Security Settings"
              className={`flex items-center gap-2.5 min-w-0 flex-1 p-1.5 -ml-1 rounded-xl transition-all text-left group ${
                currentView === 'account'
                  ? 'bg-slate-800 ring-1 ring-orange-500/50'
                  : 'hover:bg-slate-800/80'
              }`}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0 group-hover:border-orange-400 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-orange-600 transition-colors">
                  AP
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>{user?.displayName || 'Arjun Patel'}</span>
                  {currentView === 'account' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate group-hover:text-orange-300 transition-colors">
                  Account & Settings • {currentRole}
                </div>
              </div>
            </button>

            {/* Logout Action Button */}
            <button
              id="btn-sidebar-logout"
              type="button"
              onClick={() => setShowLogoutModal(true)}
              title="Log Out / Sign Out"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/60 transition-all shrink-0 group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-800 rounded px-2.5 py-1">
            <span>Offline Mode</span>
            <span className="text-green-400 font-bold">Ready (Indexed)</span>
          </div>

          {/* Quick Punch-In Button */}
          <button
            id="btn-quick-punchin-sidebar"
            onClick={handleQuickPunchIn}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded text-xs font-bold transition-all ${
              punchedIn
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {punchedIn ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Punch-In Verified</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>{getTranslation(currentLang, 'quickPunchIn')}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal from Sidebar */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">Log Out of BuildPulse Pro</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to end your current active site session?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Operator:</span>
                <span className="font-bold text-slate-800">{user?.displayName || 'Arjun Patel (Site Lead)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Role:</span>
                <span className="font-semibold text-slate-800">{currentRole}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                All locally saved progress, attendance, and cash vouchers will remain safely preserved on this device.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-sidebar-confirm-logout"
                type="button"
                onClick={handleSidebarLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isLoggingOut ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Logging Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {isWorkerRole
          ? [
              { id: 'selfPunch' as const, isAction: false, icon: <Clock className="w-5 h-5 text-emerald-400" />, label: 'Punching Button' },
              { id: 'teamChat' as const, isAction: false, icon: <Radio className="w-5 h-5 text-blue-400" />, label: 'Site Comm & Radio', badge: unreadChatCount },
              { id: 'liveLocation' as const, isAction: false, icon: <MapPin className="w-4 h-4" />, label: 'Radar Map' },
              { id: 'allFeatures' as const, isAction: true, icon: <Menu className="w-5 h-5 text-amber-400" />, label: 'All Features' },
            ].map((m) => (
              <button
                key={m.id}
                id={`btn-mobile-nav-${m.id}`}
                onClick={() => {
                  if (m.isAction && m.id === 'allFeatures') {
                    setShowAllFeaturesModal(true);
                  } else {
                    onSelectView(m.id as NavView);
                  }
                }}
                className={`flex flex-col items-center justify-center p-1 rounded text-[10px] font-semibold relative transition-colors ${
                  m.id === 'allFeatures' && showAllFeaturesModal
                    ? 'text-amber-400 font-bold'
                    : currentView === m.id
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.icon}
                <span className="mt-0.5 whitespace-nowrap">{m.label}</span>
                {m.badge !== undefined && m.badge > 0 && (
                  <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))
          : [
              { id: 'dashboard' as const, isAction: false, icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
              { id: 'labourContractor' as const, isAction: false, icon: <ReceiptText className="w-4 h-4" />, label: 'Rates & P&L' },
              { id: 'materials' as const, isAction: false, icon: <Boxes className="w-4 h-4" />, label: 'Materials', badge: materialsLowStockCount },
              { id: 'workers' as const, isAction: false, icon: <Users className="w-4 h-4" />, label: 'Workers' },
              { id: 'allFeatures' as const, isAction: true, icon: <Menu className="w-4 h-4 text-orange-400" />, label: 'All Features' },
            ].map((m) => (
              <button
                key={m.id}
                id={`btn-mobile-nav-${m.id}`}
                onClick={() => {
                  if (m.isAction && m.id === 'allFeatures') {
                    setShowAllFeaturesModal(true);
                  } else {
                    onSelectView(m.id as NavView);
                  }
                }}
                className={`flex flex-col items-center justify-center p-1 rounded text-[10px] font-semibold relative transition-colors ${
                  m.id === 'allFeatures' && showAllFeaturesModal
                    ? 'text-orange-400 font-bold'
                    : currentView === m.id
                    ? 'text-orange-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.icon}
                <span className="mt-0.5 whitespace-nowrap">{m.label}</span>
                {m.badge !== undefined && m.badge > 0 && (
                  <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            ))}
      </nav>

      {/* All App Features & Options Directory Modal */}
      <AllFeaturesModal
        isOpen={showAllFeaturesModal}
        onClose={() => setShowAllFeaturesModal(false)}
        currentView={currentView}
        onSelectView={onSelectView}
        currentRole={currentRole}
        currentLang={currentLang}
        onOpenAiHub={onOpenAiHub}
        activeProject={store.getActiveProject()}
        materialsLowStockCount={materialsLowStockCount}
        safetyHazardsCount={safetyHazardsCount}
        unreadChatCount={unreadChatCount}
      />
    </>
  );
};
