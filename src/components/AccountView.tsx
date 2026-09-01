import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Globe,
  Bell,
  HardHat,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  Phone,
  Calendar,
  Lock,
  LogOut,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  Volume2,
  Wifi,
  Download,
  Search,
  Check,
  ChevronRight,
  Sparkles,
  Camera,
  QrCode,
  Fingerprint,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
import { Role, LanguageCode, ProjectSite, SystemUser, PermissionKey } from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation, SUPPORTED_LANGUAGES } from '../lib/i18n';
import { auth, signOutUser } from '../lib/firebase';
import { ROLE_CONFIGS, PERMISSION_DEFINITIONS } from '../lib/rbac';

interface AccountViewProps {
  currentRole: Role;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onRoleChange: (role: Role) => void;
  activeProject: ProjectSite;
  projects: ProjectSite[];
  isOnline: boolean;
  systemUsers?: SystemUser[];
  onLogout?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentRole,
  currentLang,
  onLanguageChange,
  onRoleChange,
  activeProject,
  projects,
  isOnline,
  systemUsers = [],
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions' | 'preferences' | 'activity'>('profile');
  const [user, setUser] = useState(auth.currentUser);

  // Profile Form State
  const [fullName, setFullName] = useState(user?.displayName || 'Arjun Patel');
  const [email, setEmail] = useState(user?.email || 'arjun.patel@buildpulse.app');
  const [phone, setPhone] = useState('+91 98201 45892');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98201 99881');
  const [designation, setDesignation] = useState('Senior Site Project Manager');
  const [department, setDepartment] = useState('Civil Engineering & Metro Ops');
  const [employeeId, setEmployeeId] = useState('BP-EMP-8402');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [safetyPassId, setSafetyPassId] = useState('HSE-PASS-2026-994');
  const [baseOffice, setBaseOffice] = useState('Mumbai Central Regional HQ');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  );

  // Security / PIN state
  const [fieldPin, setFieldPin] = useState('840219');
  const [showPin, setShowPin] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Preferences state
  const [syncPolicy, setSyncPolicy] = useState<'any' | 'wifi_only' | 'manual'>('any');
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [radioBeep, setRadioBeep] = useState(true);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [imageCompression, setImageCompression] = useState<'high' | 'balanced' | 'low'>('balanced');
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Activity filter state
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategory, setActivityCategory] = useState<string>('ALL');

  // UI Toast / Saving state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        if (u.displayName) setFullName(u.displayName);
        if (u.email) setEmail(u.email);
        if (u.photoURL) setAvatarUrl(u.photoURL);
      }
    });
    return () => unsubscribe();
  }, []);

  const currentRoleCfg = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.project_manager;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      store.addSecurityAuditLog({
        actorId: user?.uid || 'usr-self',
        actorName: fullName,
        actorRole: currentRole,
        action: 'Updated User Account Profile',
        category: 'AUTH_RBAC',
        targetResource: email,
        severity: 'INFO',
        details: `Profile updated: Name=${fullName}, Phone=${phone}, Department=${department}`,
      });

      store.addNotification({
        title: 'Account Profile Saved',
        message: 'Your personal details and site preferences have been updated.',
        type: 'success',
        category: 'schedule',
      });
    }, 600);
  };

  const handleExportActivityCsv = () => {
    const logs = store.getState().securityAuditLogs || [];
    const headers = ['Timestamp', 'Action', 'Category', 'Severity', 'Actor', 'Role', 'Details'];
    const rows = logs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.category}"`,
      `"${log.severity}"`,
      `"${log.actorName.replace(/"/g, '""')}"`,
      `"${log.actorRole}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuildPulse_Account_AuditLog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const auditLogs = store.getState().securityAuditLogs || [];
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.details.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesCat = activityCategory === 'ALL' || log.category === activityCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner / Hero Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 sm:p-7 border border-slate-700/80 shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-orange-500/80 shadow-lg ring-4 ring-white/10"
              />
              <button
                type="button"
                onClick={() => {
                  const newUrl = prompt('Enter image URL for user profile picture:', avatarUrl);
                  if (newUrl) setAvatarUrl(newUrl);
                }}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold text-white transition-opacity backdrop-blur-xs"
                title="Change Avatar"
              >
                <Camera className="w-5 h-5 mb-1 text-orange-400" />
                <span>Change</span>
              </button>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-900" title="Account Online & Active" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{fullName}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${currentRoleCfg.badgeBg} ${currentRoleCfg.badgeText} border-white/20`}>
                  {currentRoleCfg.label}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-mono font-semibold">
                  {employeeId}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  {designation}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  <Mail className="w-3 h-3 text-blue-400" />
                  <span className="truncate max-w-[180px] sm:max-w-none">{email}</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{phone}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Digital ID Badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
            <button
              id="btn-account-digital-id"
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 text-orange-400" />
              <span>Digital Site Pass</span>
            </button>

            <button
              id="btn-account-signout"
              type="button"
              onClick={async () => {
                if (window.confirm('Are you sure you want to sign out of this session?')) {
                  await signOutUser();
                  if (onLogout) onLogout();
                }
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Active Site</span>
            <span className="font-bold text-white truncate block mt-0.5">{activeProject.name}</span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Assigned Projects</span>
            <span className="font-bold text-emerald-400 block mt-0.5">{projects.length} Construction Sites</span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Hierarchy Level</span>
            <span className="font-bold text-purple-400 block mt-0.5">Tier {currentRoleCfg.hierarchyLevel} • Level {currentRoleCfg.hierarchyLevel}</span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Field Sync Mode</span>
            <span className={`font-bold block mt-0.5 flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {isOnline ? 'Cloud Synchronized' : 'Offline Cache Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'profile', label: 'Personal & Site Profile', icon: <User className="w-4 h-4" /> },
          { id: 'security', label: 'Security & Auth Credentials', icon: <KeyRound className="w-4 h-4" /> },
          { id: 'permissions', label: 'Sites & Role Matrix', icon: <Shield className="w-4 h-4" /> },
          { id: 'preferences', label: 'App Preferences & Language', icon: <Globe className="w-4 h-4" /> },
          { id: 'activity', label: 'Audit Trail & Activity Log', icon: <FileSpreadsheet className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-account-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profile & Identity */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span>Personal & Professional Credentials</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your identity records, contact numbers, and construction site qualifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact (WhatsApp Enabled)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Number</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Job Title</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Civil Engineering & Metro Ops">Civil Engineering & Metro Ops</option>
                  <option value="Project Management & Planning">Project Management & Planning</option>
                  <option value="Health, Safety & Environment (HSE)">Health, Safety & Environment (HSE)</option>
                  <option value="Quality Assurance & Quality Control (QA/QC)">QA / QC Testing</option>
                  <option value="Procurement & Materials Store">Procurement & Storekeeping</option>
                  <option value="Labour Administration & Billing">Labour Administration & Billing</option>
                  <option value="Electrical & MEP Systems">Electrical & MEP Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee Badge / Payroll ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group (Safety Record)</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-rose-600 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Site Safety Pass / RFID ID</label>
                <input
                  type="text"
                  value={safetyPassId}
                  onChange={(e) => setSafetyPassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Office / Engineering Station</label>
                <input
                  type="text"
                  value={baseOffice}
                  onChange={(e) => setBaseOffice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {saveSuccess ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
                  </span>
                ) : (
                  <span>All profile records are protected under BuildPulse RBAC encryption.</span>
                )}
              </div>

              <button
                id="btn-save-account-profile"
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Credentials */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Auth Provider Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-500" />
              <span>Authentication & SSO Provider</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  G
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {user ? 'Google Workspace SSO Connected' : 'Local Offline Field Profile'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user?.email || 'Logged in via verified role-based field session credentials'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Active Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick-Punch PIN Code */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-500" />
                <span>Field Quick-Punch 6-Digit PIN</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Used for instant self-punching at field kiosks and offline GPS terminals when internet connection is low.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={fieldPin}
                  onChange={(e) => setFieldPin(e.target.value.replace(/\D/g, ''))}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-base font-mono font-bold tracking-widest text-slate-900 w-48 text-center focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  store.addNotification({
                    title: 'Field PIN Updated',
                    message: 'Your 6-digit field quick-punch security PIN has been refreshed.',
                    type: 'success',
                    category: 'schedule',
                  });
                  alert('Field PIN code updated successfully!');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                Update PIN Code
              </button>
            </div>
          </div>

          {/* Biometrics & 2-Factor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-orange-500" />
              <span>Biometric & Two-Factor Verification</span>
            </h2>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Facial & Fingerprint Biometrics</div>
                  <div className="text-slate-500">Allow instant clock-in using device camera and fingerprint scanner.</div>
                </div>
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Two-Factor SMS OTP Verification</div>
                  <div className="text-slate-500">Require OTP verification for approving cash vouchers above ₹10,000.</div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sites & Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Active Role Selector Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span>Security Role & Access Tier</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your active role defines what site data, financial budgets, and approvals you can manage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Switch Simulation Role:</span>
                <select
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value as Role)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="master_admin">Master Admin (Tier 1)</option>
                  <option value="admin">Site Administrator (Tier 2)</option>
                  <option value="project_manager">Project Manager (Tier 3)</option>
                  <option value="site_supervisor">Site Supervisor (Tier 4)</option>
                  <option value="safety_officer">Safety Officer (HSE)</option>
                  <option value="field_engineer">Field Engineer</option>
                  <option value="labour_contractor">Labour Contractor</option>
                  <option value="worker">Worker / Labor</option>
                  <option value="client_stakeholder">Client Stakeholder</option>
                </select>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${currentRoleCfg.badgeBg} border-white/20 space-y-1`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentRoleCfg.icon}</span>
                <span className={`font-black text-sm ${currentRoleCfg.badgeText}`}>{currentRoleCfg.label}</span>
                <span className="px-2 py-0.5 rounded bg-white/80 text-slate-800 text-[10px] font-extrabold uppercase">
                  Hierarchy Level {currentRoleCfg.hierarchyLevel}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {currentRoleCfg.description}
              </p>
            </div>
          </div>

          {/* Assigned Project Sites */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span>Assigned Construction Project Sites ({projects.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((proj) => {
                const isCurrent = proj.id === activeProject.id;
                return (
                  <div
                    key={proj.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[180px]">
                        {proj.name}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white text-[9px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <HardHat className="w-3 h-3 text-slate-400" />
                      <span>{proj.location}</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span>Progress: {proj.progress}%</span>
                      <span className="text-emerald-600">{proj.activeWorkers} Active Workers</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              <span>Active Permissions Capabilities Matrix</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {PERMISSION_DEFINITIONS.map((perm) => {
                const isAllowed = store.getState().rolePermissions[currentRole]?.includes(perm.key);

                return (
                  <div
                    key={perm.key}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isAllowed
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{perm.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{perm.description}</div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isAllowed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isAllowed ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: App Preferences & Language */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Language Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" />
                <span>Preferred Application Language</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your preferred Indian regional language for site forms, walkie-talkie audio, and voice prompts.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onLanguageChange(lang.code)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{lang.nativeName}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sync & Audio Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              <span>Offline Sync & Audio Dispatch Preferences</span>
            </h2>

            <div className="space-y-4 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">Offline Queue Sync Policy</div>
                  <div className="text-slate-500">Choose when cached voucher edits and biometric punches sync to cloud.</div>
                </div>
                <select
                  value={syncPolicy}
                  onChange={(e) => setSyncPolicy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 text-xs"
                >
                  <option value="any">Auto Sync on Any Active Network</option>
                  <option value="wifi_only">WiFi Only (Saves Mobile Data)</option>
                  <option value="manual">Manual Sync Button Only</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Walkie-Talkie Audio Tone & Beep</div>
                  <div className="text-slate-500">Play radio squelch audio when receiving site voice dispatches.</div>
                </div>
                <input
                  type="checkbox"
                  checked={radioBeep}
                  onChange={(e) => setRadioBeep(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Punch Audio Confirmation</div>
                  <div className="text-slate-500">Spoken voice confirmation in preferred language upon successful punch.</div>
                </div>
                <input
                  type="checkbox"
                  checked={audioFeedback}
                  onChange={(e) => setAudioFeedback(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">SMS & WhatsApp Critical Alerts</div>
                  <div className="text-slate-500">Receive SMS notifications for high-severity safety flags and daily P&L.</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Audit Trail & Activity Log */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-orange-500" />
                  <span>Account Security & Operations Audit Trail</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable chronological ledger of all actions and approvals logged under this account.
                </p>
              </div>

              <button
                id="btn-export-account-csv"
                type="button"
                onClick={handleExportActivityCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Log</span>
              </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search actions, timestamps, target resources..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <select
                value={activityCategory}
                onChange={(e) => setActivityCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH_RBAC">Authentication & RBAC</option>
                <option value="FINANCIAL_PNL">Financials & Petty Cash</option>
                <option value="SITE_OPS">Site Operations & Materials</option>
                <option value="SELF_PUNCH">Worker Biometric Punch</option>
                <option value="WORK_ORDER">Work Orders & Contracts</option>
              </select>
            </div>

            {/* Log Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Target Resource</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No audit records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.slice(0, 15).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.timeDisplay || log.timestamp.split('T')[1]?.substring(0, 8)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{log.action}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : log.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] truncate max-w-[150px]">
                          {log.targetResource}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[250px]">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Digital Site Pass QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Official Site ID Pass</span>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 shadow-inner">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 rounded-xl mx-auto object-cover border-2 border-orange-500"
              />
              <div>
                <div className="font-black text-base">{fullName}</div>
                <div className="text-xs text-orange-400 font-bold">{currentRoleCfg.label}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{employeeId}</div>
              </div>

              {/* QR Code graphic container */}
              <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
                <div className="w-36 h-36 bg-slate-100 rounded flex flex-col items-center justify-center text-slate-800 font-mono text-[9px] p-2 border border-slate-300">
                  <QrCode className="w-24 h-24 text-slate-900 mb-1" />
                  <span className="font-bold">{safetyPassId}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                Authorized for: <strong className="text-white">{activeProject.name}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
