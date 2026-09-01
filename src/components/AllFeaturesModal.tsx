import React, { useState } from 'react';
import {
  X,
  Search,
  LayoutDashboard,
  ReceiptText,
  Boxes,
  Users,
  Clock,
  Radio,
  MapPin,
  Camera,
  ShieldAlert,
  Wallet,
  FolderLock,
  FileSpreadsheet,
  Shield,
  Banknote,
  Sparkles,
  User,
  Layers,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  Globe,
  SlidersHorizontal,
  Flame,
  Zap,
  Smartphone,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { LanguageCode, Role, ProjectSite } from '../types';
import { SUPPORTED_LANGUAGES } from '../lib/i18n';
import { store } from '../lib/offlineStore';
import { AndroidAppInstallModal } from './AndroidAppInstallModal';

interface AllFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  currentRole: Role;
  currentLang: LanguageCode;
  onOpenAiHub: () => void;
  activeProject?: ProjectSite;
  materialsLowStockCount?: number;
  safetyHazardsCount?: number;
  unreadChatCount?: number;
  onRoleChange?: (role: Role) => void;
  onLanguageChange?: (lang: LanguageCode) => void;
}

interface FeatureItem {
  id: NavView | 'aiHub' | 'androidApp';
  title: string;
  category: 'core' | 'field' | 'materials_finance' | 'engineering' | 'ai_settings';
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
  badgeCount?: number;
  isAiAction?: boolean;
  isCustomAction?: boolean;
  roles?: Role[];
}

export const AllFeaturesModal: React.FC<AllFeaturesModalProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  currentRole,
  currentLang,
  onOpenAiHub,
  activeProject,
  materialsLowStockCount = 0,
  safetyHazardsCount = 0,
  unreadChatCount = 0,
  onRoleChange,
  onLanguageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAndroidInstallModal, setShowAndroidInstallModal] = useState(false);

  if (!isOpen) return null;

  const features: FeatureItem[] = [
    // Core Operations & Dashboards
    {
      id: 'dashboard',
      title: 'Command Dashboard',
      category: 'core',
      description: 'High-level site KPIs, attendance, milestone progress & weather radar',
      icon: <LayoutDashboard className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-50 border-orange-200',
    },
    {
      id: 'labourContractor',
      title: 'Master Rates & P&L Billing',
      category: 'core',
      description: 'Contractor master rate ledger, MB measurement sheets, daily wage billing & margin analytics',
      icon: <ReceiptText className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-200',
      badge: 'RATE LEDGER & P&L',
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'siteProgress',
      title: 'Site Progress & 3D Drone Scans',
      category: 'core',
      description: 'Physical milestone progress, S-curve trends, daily visual logs & 3D scan photogrammetry',
      icon: <Camera className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-200',
      badge: '3D SCANS',
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'masterAdmin',
      title: 'Master Admin & DB Engine',
      category: 'core',
      description: 'Cloud Firestore sync engine, granular RBAC permission matrix & system user management',
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-200',
      badge: 'RBAC MATRIX',
      badgeColor: 'bg-purple-600 text-white',
    },

    // Field Tools & Workforce
    {
      id: 'selfPunch',
      title: 'Worker Punching Kiosk',
      category: 'field',
      description: 'One-tap biometric clock-in, facial verification & GPS geofence shift logger',
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-200',
      badge: 'TAP TO CLOCK-IN',
      badgeColor: 'bg-emerald-600 text-white animate-pulse',
    },
    {
      id: 'teamChat',
      title: 'Site Comms & Radio',
      category: 'field',
      description: 'Instant walkie-talkie audio, photo/CAD broadcast, Gemini multilingual translation & Gmail dispatch',
      icon: <Radio className="w-5 h-5 text-sky-600" />,
      iconBg: 'bg-sky-50 border-sky-200',
      badge: unreadChatCount > 0 ? `${unreadChatCount} New` : 'LIVE PTT',
      badgeColor: 'bg-sky-600 text-white',
    },
    {
      id: 'liveLocation',
      title: 'Site Radar & Geofence',
      category: 'field',
      description: 'Live field coordinate tracking, geofenced hazard zones & real-time contractor labor distribution',
      icon: <MapPin className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-50 border-rose-200',
    },
    {
      id: 'workers',
      title: 'Workforce & Contractors',
      category: 'field',
      description: 'Labor roster, trade categorization, KYC verification, shift attendance cards & emergency contacts',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-200',
    },

    // Materials, Finance & Logistics
    {
      id: 'materials',
      title: 'Materials, Silos & Rebar Yard',
      category: 'materials_finance',
      description: 'RMC batching, steel rebar & bulk aggregate inventory with automated low-stock alarms',
      icon: <Boxes className="w-5 h-5 text-teal-600" />,
      iconBg: 'bg-teal-50 border-teal-200',
      badgeCount: materialsLowStockCount,
      badge: materialsLowStockCount > 0 ? `${materialsLowStockCount} Alert(s)` : undefined,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'pettyCash',
      title: 'Site Petty Cash & Imprest',
      category: 'materials_finance',
      description: 'Cash vouchers, on-site imprest disbursements, GST bill uploads & audit approval logs',
      icon: <Banknote className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-200',
      badge: 'IMPREST CASH',
      badgeColor: 'bg-emerald-700 text-white',
    },
    {
      id: 'budget',
      title: 'Project Budget & Cost Codes',
      category: 'materials_finance',
      description: 'Budget vs actual cost allocation, contractor milestone drawdowns & financial burn rate',
      icon: <Wallet className="w-5 h-5 text-cyan-600" />,
      iconBg: 'bg-cyan-50 border-cyan-200',
    },

    // Engineering, Quality & Safety
    {
      id: 'safety',
      title: 'Safety Guidelines & SOS',
      category: 'engineering',
      description: 'HSE hazard reporting, IS/OSHA compliance lookup, near-miss logging & instant site SOS',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-50 border-rose-200',
      badgeCount: safetyHazardsCount,
      badge: safetyHazardsCount > 0 ? `${safetyHazardsCount} Open Hazard(s)` : undefined,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'documents',
      title: 'CAD Vault & Blueprints',
      category: 'engineering',
      description: 'Architectural blueprints, structural revisions, RFI tracking & Google Drive synchronizer',
      icon: <FolderLock className="w-5 h-5 text-slate-700" />,
      iconBg: 'bg-slate-100 border-slate-300',
    },
    {
      id: 'reports',
      title: 'Analytics & DPR Reports',
      category: 'engineering',
      description: 'Daily Progress Reports (DPR), physical milestones, exportable CSV/Excel ledgers & PDF packets',
      icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
      iconBg: 'bg-green-50 border-green-200',
    },

    // AI & Account
    {
      id: 'aiHub',
      title: 'AI Site Co-Pilot & Engineering Hub',
      category: 'ai_settings',
      description: 'Gemini reasoning assistant, Indian IS standard lookup, automated DPR generator & site translations',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      iconBg: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-300',
      badge: 'GEMINI 2.5',
      badgeColor: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
      isAiAction: true,
    },
    {
      id: 'account',
      title: 'My Account, Pass & Settings',
      category: 'ai_settings',
      description: 'Digital site badge pass, biometric credentials, security PIN, offline sync settings & profile details',
      icon: <User className="w-5 h-5 text-sky-600" />,
      iconBg: 'bg-sky-50 border-sky-200',
      badge: 'ID PASS',
      badgeColor: 'bg-sky-600 text-white',
    },
    {
      id: 'androidApp',
      title: 'Android Native App & APK Setup',
      category: 'ai_settings',
      description: 'Install standalone Android app on mobile, enable background GPS & export Play Store APK (.apk/.aab)',
      icon: <Smartphone className="w-5 h-5 text-orange-500" />,
      iconBg: 'bg-orange-50 border-orange-200',
      badge: 'ANDROID APK',
      badgeColor: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white',
      isCustomAction: true,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'core', label: 'Core & Dashboards' },
    { id: 'field', label: 'Field & Workforce' },
    { id: 'materials_finance', label: 'Materials & Finance' },
    { id: 'engineering', label: 'Engineering & Safety' },
    { id: 'ai_settings', label: 'AI & Settings' },
  ];

  const filteredFeatures = features.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleItemClick = (item: FeatureItem) => {
    if (item.isAiAction) {
      onClose();
      onOpenAiHub();
    } else if (item.isCustomAction && item.id === 'androidApp') {
      setShowAndroidInstallModal(true);
    } else {
      onSelectView(item.id as NavView);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  All App Features & Options
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-[10px] font-bold text-white uppercase">
                  Directory
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeProject?.name || 'BuildPulse Pro'} • Select any feature to navigate instantly
              </p>
            </div>
          </div>

          <button
            id="btn-close-all-features"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all features, tools, drawings, rates, or settings (e.g. 'Punch', 'P&L', 'Concrete', 'Safety')..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredFeatures.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No feature matching "{searchQuery}"</p>
              <p className="text-xs">Try searching for keywords like "rates", "punch", "materials", or "safety".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs font-bold text-orange-600 hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFeatures.map((item) => {
                const isActive = !item.isAiAction && currentView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between group relative ${
                      isActive
                        ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`p-2 rounded-xl border ${item.iconBg} shrink-0`}>
                          {item.icon}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>ACTIVE</span>
                            </span>
                          )}

                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                                item.badgeColor || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                        <span>{item.title}</span>
                      </h3>

                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-orange-600 transition-colors">
                      <span>{item.isAiAction ? 'Open AI Hub' : 'Open Feature'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Quick Controls Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-700">Current Role:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-extrabold text-slate-900 uppercase text-[11px]">
              {currentRole}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAiHub();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ask AI Co-Pilot</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
            >
              Close Menu
            </button>
          </div>
        </div>

      </div>

      {/* Android Native App & APK Setup Modal */}
      <AndroidAppInstallModal
        isOpen={showAndroidInstallModal}
        onClose={() => setShowAndroidInstallModal(false)}
      />
    </div>
  );
};
