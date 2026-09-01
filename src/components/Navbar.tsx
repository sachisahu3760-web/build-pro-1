import React, { useState } from 'react';
import {
  HardHat,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Languages,
  Database,
  UserCheck,
  ChevronDown,
  Sparkles,
  Layers,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  Plus,
  UserPlus,
  Radio,
  Clock,
  User,
} from 'lucide-react';
import { store } from '../lib/offlineStore';
import { getTranslation, SUPPORTED_LANGUAGES } from '../lib/i18n';
import { Role, LanguageCode, ProjectSite } from '../types';
import { signInWithGoogle, signOutUser, auth } from '../lib/firebase';
import { NavView } from './Sidebar';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentRole: Role;
  currentLang: LanguageCode;
  isOnline: boolean;
  currentView?: NavView;
  onSelectView?: (view: NavView) => void;
  pendingOfflineCount?: number;
  hasPendingSync?: boolean;
  pendingCount?: number;
  activeProject?: ProjectSite;
  activeProjectId?: string;
  projects?: ProjectSite[];
  unreadNotifsCount?: number;
  notifications?: any[];
  onLanguageChange?: (lang: LanguageCode) => void;
  onRoleChange?: (role: Role) => void;
  onSelectProject?: (id: string) => void;
  onOpenNotifications?: () => void;
  onOpenBackupModal?: () => void;
  onOpenAiHub: () => void;
  onOpenCreateSiteModal?: () => void;
  onOpenAddUserModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentLang,
  isOnline,
  currentView,
  onSelectView,
  pendingOfflineCount = 0,
  hasPendingSync = false,
  pendingCount = 0,
  activeProject,
  activeProjectId,
  projects = [],
  unreadNotifsCount,
  notifications = [],
  onLanguageChange,
  onRoleChange,
  onSelectProject,
  onOpenNotifications = () => {},
  onOpenBackupModal = () => {},
  onOpenAiHub,
  onOpenCreateSiteModal,
  onOpenAddUserModal,
  onLogout,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [logoutFeedback, setLogoutFeedback] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  React.useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const effectivePendingCount = pendingOfflineCount || pendingCount || (hasPendingSync ? 1 : 0);
  const effectiveUnreadCount = unreadNotifsCount ?? (notifications?.filter((n: any) => !n.read)?.length || 0);

  const currentProject =
    activeProject ||
    projects.find((p) => p.id === (activeProjectId || store.getState().activeProjectId)) ||
    projects[0] || {
      id: 'default',
      name: 'Metro Corridor Line 4',
      code: 'METRO-L4',
      location: 'Mumbai, MH',
      progressPercentage: 68,
    };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await store.syncPendingOfflineQueue();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleGoogleAuth = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setAuthNotice(null);

    try {
      if (user) {
        setShowLogoutConfirmModal(true);
      } else {
        const res = await signInWithGoogle();
        if (res?.popupBlocked) {
          setAuthNotice('Popup blocked. Open app in a new tab for Google OAuth or allow popups in your browser.');
          setTimeout(() => setAuthNotice(null), 6000);
        } else if (res?.user) {
          store.addSecurityAuditLog({
            actorId: res.user.uid,
            actorName: res.user.displayName || 'Google User',
            actorRole: currentRole,
            action: 'Google Workspace Account Authenticated',
            category: 'AUTH_RBAC',
            targetResource: res.user.email || 'OAuth Token',
            severity: 'INFO',
            details: `Logged in via Google OAuth (${res.user.email}).`,
          });
          store.addNotification({
            title: 'Google Account Connected',
            message: `Signed in as ${res.user.displayName || res.user.email}`,
            type: 'success',
            category: 'schedule',
          });
        }
      }
    } catch (e: any) {
      console.warn('Authentication status:', e?.message || e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsAuthenticating(true);
    setShowLogoutConfirmModal(false);
    setShowUserDropdown(false);

    try {
      const prevName = user?.displayName || 'Site Supervisor';
      const prevEmail = user?.email || 'local.session@buildpulse';
      
      // Perform Firebase Auth Signout
      await signOutUser();
      
      // Add security audit log
      store.addSecurityAuditLog({
        actorId: user?.uid || 'usr-session',
        actorName: prevName,
        actorRole: currentRole,
        action: 'User Session Terminated / Logged Out',
        category: 'AUTH_RBAC',
        targetResource: prevEmail,
        severity: 'INFO',
        details: `User session logged out at ${new Date().toLocaleTimeString()}. Local cache secured.`,
      });

      // Add in-app notification
      store.addNotification({
        title: 'Logged Out Successfully',
        message: `Session closed for ${prevName}. Offline storage and site data remain cached.`,
        type: 'info',
        category: 'schedule',
      });

      setLogoutFeedback('You have been logged out successfully.');
      setTimeout(() => setLogoutFeedback(null), 5000);

      if (onLogout) {
        onLogout();
      }
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const roles: Array<{ key: Role; label: string; icon: string; color: string }> = [
    { key: 'master_admin', label: '👑 Master Admin (Superuser)', icon: '👑', color: 'bg-purple-100 text-purple-900 font-bold' },
    { key: 'admin', label: '⚡ Site Administrator', icon: '⚡', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'project_manager', label: '📊 Project Manager', icon: '📊', color: 'bg-blue-100 text-blue-800' },
    { key: 'site_supervisor', label: '🏗️ Site Supervisor', icon: '🏗️', color: 'bg-amber-100 text-amber-800' },
    { key: 'safety_officer', label: '🦺 Safety (HSE) Officer', icon: '🦺', color: 'bg-red-100 text-red-800' },
    { key: 'field_engineer', label: '📐 Field / QC Engineer', icon: '📐', color: 'bg-teal-100 text-teal-800' },
    { key: 'labour_contractor', label: '📋 Labour Contractor (Gang Boss)', icon: '📋', color: 'bg-orange-100 text-orange-800' },
    { key: 'worker', label: '👷 Labor / Worker (Self-Punch)', icon: '👷', color: 'bg-emerald-100 text-emerald-800' },
    { key: 'client_stakeholder', label: '🏛️ Client / Stakeholder', icon: '🏛️', color: 'bg-slate-100 text-slate-800' },
  ];

  const currentRoleObj = roles.find((r) => r.key === currentRole) || roles[1];
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Logo & Active Project */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center shadow-xs">
                <HardHat className="w-5 h-5 text-white font-bold" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  BuildPulse <span className="text-orange-600 font-extrabold text-[10px] px-1.5 py-0.2 rounded bg-orange-50 border border-orange-200">PRO</span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium">Enterprise Site Operations</p>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* Project Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-project-selector"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span className="max-w-[130px] sm:max-w-[200px] truncate text-slate-900 font-bold">{currentProject.name}</span>
                <span className="hidden md:inline bg-green-100 text-green-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase">
                  Active
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showProjectDropdown && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                    <span>{getTranslation(currentLang, 'allProjects')}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{projects.length} Sites</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onSelectProject) {
                            onSelectProject(p.id);
                          } else {
                            store.setActiveProject(p.id);
                          }
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between text-xs hover:bg-slate-50 transition-colors ${
                          p.id === currentProject.id ? 'bg-orange-50/80 text-orange-800 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate mr-2 flex-1">
                          <div className="font-bold truncate text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{p.code} • {p.location}</div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                              p.workType === 'Labour Contractor Work'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {p.workType || 'Labour Contractor Work'}
                            </span>
                            {p.workOrderNumber && (
                              <span className="text-[9px] text-slate-400 font-mono truncate max-w-[110px]">
                                {p.workOrderNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">
                            {p.progressPercentage}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Create New Site Action */}
                  <div className="p-2 bg-slate-50 border-t border-slate-200">
                    <button
                      id="btn-nav-create-site"
                      type="button"
                      onClick={() => {
                        setShowProjectDropdown(false);
                        if (onOpenCreateSiteModal) {
                          onOpenCreateSiteModal();
                        }
                      }}
                      className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create / Add New Site</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Worker Direct Action Shortcuts in Navbar */}
            {currentRole === 'worker' && onSelectView && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  id="btn-nav-worker-punch"
                  type="button"
                  onClick={() => onSelectView('selfPunch')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    currentView === 'selfPunch'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40 shadow-emerald-950/20'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Punching Button</span>
                </button>

                <button
                  id="btn-nav-worker-radio"
                  type="button"
                  onClick={() => onSelectView('teamChat')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    currentView === 'teamChat'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-blue-950/20'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Site Comm & Radio</span>
                </button>
              </div>
            )}
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Add User Quick Action */}
            {onOpenAddUserModal && (
              <button
                id="btn-add-user-nav"
                type="button"
                onClick={onOpenAddUserModal}
                title="Add New User (Role-Based)"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold shadow-2xs transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">+ Add User</span>
              </button>
            )}

            {/* Android Native App Install Launcher */}
            <PWAInstallButton />

            {/* AI Assistant Quick Trigger */}
            <button
              id="btn-ai-hub-nav"
              onClick={onOpenAiHub}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">Gemini AI</span>
            </button>

            {/* Offline / Cloud Status Badge */}
            <div className="flex items-center">
              <button
                id="btn-toggle-offline"
                onClick={() => store.toggleOfflineMode()}
                title={isOnline ? 'Online - Click to simulate offline mode' : 'Offline - Click to enable online sync'}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold border transition-all ${
                  isOnline
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                }`}
              >
                {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
                <span className="hidden lg:inline">{isOnline ? getTranslation(currentLang, 'onlineMode') : getTranslation(currentLang, 'offlineMode')}</span>
                {effectivePendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-extrabold">
                    {effectivePendingCount}
                  </span>
                )}
              </button>

              {effectivePendingCount > 0 && isOnline && (
                <button
                  id="btn-sync-now"
                  onClick={handleManualSync}
                  title={getTranslation(currentLang, 'syncNow')}
                  className="ml-1 p-1 rounded bg-slate-100 hover:bg-slate-200 text-orange-600 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Backup Quick Button */}
            <button
              id="btn-backup-system"
              onClick={onOpenBackupModal}
              title={getTranslation(currentLang, 'backupSystem')}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                id="btn-language-selector"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Languages className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden sm:inline">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Regional Languages
                  </div>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        store.setLanguage(l.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                        l.code === currentLang ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.nativeName} ({l.name})</span>
                      {l.code === currentLang && <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                id="btn-role-selector"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden md:inline">{currentRoleObj.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Role-Based Access (RBAC)
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => {
                        store.setRole(r.key);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs hover:bg-slate-50 transition-colors ${
                        r.key === currentRole ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-sm">{r.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{r.label}</div>
                      </div>
                      {r.key === currentRole && <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              id="btn-notification-bell"
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              {effectiveUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Google Workspace / User Profile / Logout Controls */}
            <div className="relative flex items-center gap-1.5">
              {/* Profile / Auth Button */}
              <button
                id="btn-google-auth"
                onClick={() => {
                  if (user) {
                    setShowUserDropdown(!showUserDropdown);
                  } else {
                    handleGoogleAuth();
                  }
                }}
                disabled={isAuthenticating}
                title={user ? `Signed in as ${user.displayName || user.email} (Click for Account / Logout)` : 'Sign in with Google Workspace'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  isAuthenticating
                    ? 'bg-slate-200 text-slate-500 cursor-wait'
                    : user
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 shadow-2xs'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                }`}
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-600" />
                    <span className="hidden sm:inline">Connecting...</span>
                  </>
                ) : user ? (
                  <>
                    <div className="relative">
                      <img
                        src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                        alt="User"
                        className="w-4 h-4 rounded-full border border-emerald-400 object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                    </div>
                    <span className="hidden sm:inline truncate max-w-[110px] font-bold text-emerald-900">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-emerald-600" />
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Google Auth</span>
                  </>
                )}
              </button>

              {/* Direct Standalone Logout Button */}
              <button
                id="btn-navbar-logout"
                type="button"
                onClick={() => setShowLogoutConfirmModal(true)}
                title="Log Out of BuildPulse Pro"
                className="flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold transition-all shadow-2xs group"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500 group-hover:text-rose-700 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden lg:inline text-[11px]">Log Out</span>
              </button>

              {/* User Account Popover Dropdown */}
              {showUserDropdown && user && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-start gap-2.5">
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                      alt="User"
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {user.displayName || 'Google Account'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user.email || 'site.operator@buildpulse.app'}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                          Authenticated
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-extrabold uppercase">
                          {currentRoleObj.label.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-3.5 py-2 space-y-1.5 text-xs text-slate-600 border-b border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Current Role:</span>
                      <span className="font-semibold text-slate-800">{currentRoleObj.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Active Site:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[140px]">{currentProject.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Sync Status:</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready / Cached
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Action Buttons */}
                  <div className="p-2 space-y-1">
                    {onSelectView && (
                      <button
                        id="btn-dropdown-my-account"
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onSelectView('account');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-orange-500" />
                          <span>My Account & Settings</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowRoleDropdown(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-orange-500" />
                        <span>Switch Security Role</span>
                      </div>
                      <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90" />
                    </button>

                    <button
                      id="btn-dropdown-logout"
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowLogoutConfirmModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Auth Notice Popup */}
              {authNotice && (
                <div className="absolute right-0 top-full mt-2 w-72 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl border border-slate-700 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{authNotice}</p>
                      <button
                        onClick={() => setAuthNotice(null)}
                        className="mt-1.5 text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Floating Logout Feedback Toast */}
      {logoutFeedback && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{logoutFeedback}</span>
          <button
            onClick={() => setLogoutFeedback(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">Confirm Session Logout</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to log out of BuildPulse Pro?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active User:</span>
                <span className="font-bold text-slate-800">
                  {user?.displayName || 'Site Supervisor (Arjun Patel)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account / Email:</span>
                <span className="font-mono text-slate-700 text-[11px]">
                  {user?.email || 'local.supervisor@buildpulse.app'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Role:</span>
                <span className="font-semibold text-slate-800">{currentRoleObj.label}</span>
              </div>
              {effectivePendingCount > 0 && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{effectivePendingCount} pending offline edits remain safely cached in local storage.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-logout-submit"
                type="button"
                onClick={handleConfirmLogout}
                disabled={isAuthenticating}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isAuthenticating ? (
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
    </header>
  );
};
