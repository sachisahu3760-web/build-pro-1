import React, { useState } from 'react';
import {
  Shield,
  Users,
  KeyRound,
  Sliders,
  DollarSign,
  FileCheck,
  Building2,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Filter,
  Check,
  X,
  RefreshCw,
  Lock,
  Unlock,
  Radio,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { AddUserModal } from './AddUserModal';
import {
  Role,
  PermissionKey,
  SystemUser,
  MasterRateCardItem,
  SecurityAuditLog,
  ProjectSite,
  LanguageCode,
} from '../types';
import { store } from '../lib/offlineStore';
import {
  ROLE_CONFIGS,
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSIONS,
  hasPermission,
} from '../lib/rbac';

interface MasterAdminViewProps {
  currentLang: LanguageCode;
  currentRole: Role;
  systemUsers: SystemUser[];
  masterRateCards: MasterRateCardItem[];
  securityAuditLogs: SecurityAuditLog[];
  rolePermissions: Record<Role, PermissionKey[]>;
  projects: ProjectSite[];
  activeProjectId: string;
  onOpenCreateSiteModal: () => void;
}

export const MasterAdminView: React.FC<MasterAdminViewProps> = ({
  currentLang,
  currentRole,
  systemUsers,
  masterRateCards,
  securityAuditLogs,
  rolePermissions,
  projects,
  activeProjectId,
  onOpenCreateSiteModal,
}) => {
  const [activeTab, setActiveTab] = useState<'rbac_matrix' | 'users' | 'master_rates' | 'audit_logs' | 'site_governance'>('rbac_matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('all');

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editingRate, setEditingRate] = useState<MasterRateCardItem | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('site_supervisor');
  const [newUserDesignation, setNewUserDesignation] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [newUserProjects, setNewUserProjects] = useState<string[]>([activeProjectId]);

  // New Rate Form State
  const [rateItemCode, setRateItemCode] = useState('');
  const [rateDescription, setRateDescription] = useState('');
  const [rateCategory, setRateCategory] = useState('Steel & Rebar');
  const [rateUnit, setRateUnit] = useState('MT');
  const [rateBenchmark, setRateBenchmark] = useState(5000);
  const [rateMin, setRateMin] = useState(4500);
  const [rateMax, setRateMax] = useState(6000);
  const [rateSiteType, setRateSiteType] = useState<'All Sites' | 'Commercial' | 'Infrastructure' | 'Residential' | 'Industrial'>('All Sites');

  // RBAC Matrix toggle handler
  const handleTogglePermission = (role: Role, permissionKey: PermissionKey) => {
    if (role === 'master_admin') return; // Master Admin always has all permissions
    const currentPerms = rolePermissions[role] || DEFAULT_ROLE_PERMISSIONS[role] || [];
    const exists = currentPerms.includes(permissionKey);
    const updated = exists
      ? currentPerms.filter((p) => p !== permissionKey)
      : [...currentPerms, permissionKey];
    store.updateRolePermissions(role, updated);
  };

  const handleResetRoleToDefault = (role: Role) => {
    if (role === 'master_admin') return;
    store.updateRolePermissions(role, DEFAULT_ROLE_PERMISSIONS[role] || []);
  };

  // Add User Submit
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    store.addSystemUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone || '+91 98000 00000',
      role: newUserRole,
      assignedProjectIds: newUserProjects.length > 0 ? newUserProjects : [activeProjectId],
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?auto=format&fit=crop&w=150&q=80`,
      designation: newUserDesignation || `${ROLE_CONFIGS[newUserRole]?.label || 'Staff'} Member`,
      department: newUserDepartment || 'Site Operations',
      status: 'Active',
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserDesignation('');
    setNewUserDepartment('');
    setShowAddUserModal(false);
  };

  // Add Master Rate Submit
  const handleCreateMasterRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateItemCode || !rateDescription) return;

    store.addMasterRateCardItem({
      itemCode: rateItemCode,
      description: rateDescription,
      category: rateCategory,
      unit: rateUnit,
      benchmarkRate: Number(rateBenchmark),
      minAllowedRate: Number(rateMin),
      maxAllowedRate: Number(rateMax),
      updatedBy: 'Vikram Malhotra (Master Admin)',
      applicableSiteType: rateSiteType,
    });

    setRateItemCode('');
    setRateDescription('');
    setRateBenchmark(5000);
    setRateMin(4500);
    setRateMax(6000);
    setShowAddRateModal(false);
  };

  const filteredUsers = systemUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredRates = masterRateCards.filter((r) => {
    const matchesSearch =
      r.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || r.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAuditLogs = securityAuditLogs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.targetResource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = auditSeverityFilter === 'all' || l.severity === auditSeverityFilter;
    return matchesSearch && matchesSeverity;
  });

  const allRolesList: Role[] = [
    'master_admin',
    'admin',
    'project_manager',
    'site_supervisor',
    'safety_officer',
    'field_engineer',
    'labour_contractor',
    'worker',
    'client_stakeholder',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md text-2xl shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Master Admin & RBAC Governance Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Superuser Tier
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Policy Engine Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                Centrally manage role-based security access matrices, enterprise staff credentials, global master rate cards, and immutable audit logs across all construction sites.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-master-add-site"
              onClick={onOpenCreateSiteModal}
              className="px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Site</span>
            </button>
            <button
              id="btn-master-quick-switch"
              onClick={() => store.setRole('master_admin')}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Enforce Master Rights</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Managed Roles</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-bold text-white">9 Active</span>
              <span className="text-[10px] text-purple-300 font-medium">14 Permissions</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Enterprise Users</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-bold text-white">{systemUsers.length} Users</span>
              <span className="text-[10px] text-emerald-300 font-medium">100% Verified</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Master Rate Cards</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-bold text-white">{masterRateCards.length} Benchmarks</span>
              <span className="text-[10px] text-blue-300 font-medium">All BOQ Items</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Security Audit Events</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-bold text-white">{securityAuditLogs.length} Events</span>
              <span className="text-[10px] text-amber-300 font-medium">Zero Breaches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          id="tab-rbac-matrix"
          onClick={() => setActiveTab('rbac_matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'rbac_matrix'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Role-Based Access Control (RBAC) Matrix</span>
        </button>

        <button
          id="tab-users-directory"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enterprise Staff & User Management</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
            {systemUsers.length}
          </span>
        </button>

        <button
          id="tab-master-rates"
          onClick={() => setActiveTab('master_rates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'master_rates'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Central Master Rate Cards</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
            {masterRateCards.length}
          </span>
        </button>

        <button
          id="tab-audit-logs"
          onClick={() => setActiveTab('audit_logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'audit_logs'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Immutable Audit Logs</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
            {securityAuditLogs.length}
          </span>
        </button>

        <button
          id="tab-site-governance"
          onClick={() => setActiveTab('site_governance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'site_governance'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Site Portfolio Governance</span>
        </button>
      </div>

      {/* TAB 1: RBAC MATRIX */}
      {activeTab === 'rbac_matrix' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Enterprise Permission Matrix</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle capabilities for specific operational tiers. Changes apply immediately across active sessions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-purple-600 inline-block" /> Enabled
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium ml-2">
                <span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block" /> Disabled
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3.5 min-w-[280px] sticky left-0 bg-slate-50 z-20 border-r border-slate-200">
                      Permission Capability
                    </th>
                    {allRolesList.map((r) => {
                      const cfg = ROLE_CONFIGS[r];
                      return (
                        <th key={r} className="p-3 text-center min-w-[120px] border-r border-slate-200 last:border-r-0">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-base">{cfg.icon}</span>
                            <span className="font-bold text-[11px] text-slate-800 leading-tight text-center">
                              {cfg.shortLabel}
                            </span>
                            {r !== 'master_admin' && (
                              <button
                                onClick={() => handleResetRoleToDefault(r)}
                                title="Reset to default permissions"
                                className="text-[9px] text-slate-400 hover:text-purple-600 underline font-normal mt-0.5"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERMISSION_DEFINITIONS.map((perm) => (
                    <tr key={perm.key} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 sticky left-0 bg-white hover:bg-slate-50/70 z-10 border-r border-slate-200">
                        <div>
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                            <span>{perm.label}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                              {perm.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{perm.description}</p>
                        </div>
                      </td>

                      {allRolesList.map((r) => {
                        const isMaster = r === 'master_admin';
                        const currentPerms = rolePermissions[r] || DEFAULT_ROLE_PERMISSIONS[r] || [];
                        const isGranted = isMaster || currentPerms.includes(perm.key);

                        return (
                          <td
                            key={`${r}-${perm.key}`}
                            className="p-3 text-center border-r border-slate-200 last:border-r-0 align-middle"
                          >
                            <button
                              disabled={isMaster}
                              onClick={() => handleTogglePermission(r, perm.key)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                isGranted
                                  ? isMaster
                                    ? 'bg-purple-900 text-purple-200 cursor-not-allowed opacity-90'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                              }`}
                              title={
                                isMaster
                                  ? 'Master Admin holds unrestricted privileges'
                                  : `${isGranted ? 'Revoke' : 'Grant'} ${perm.label} for ${ROLE_CONFIGS[r].label}`
                              }
                            >
                              {isGranted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, designation..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="all">All Roles</option>
                {allRolesList.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_CONFIGS[r].shortLabel}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-add-system-user"
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite / Add User</span>
            </button>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredUsers.map((u) => {
              const roleCfg = ROLE_CONFIGS[u.role] || ROLE_CONFIGS.site_supervisor;
              const assignedSites = projects.filter((p) => u.assignedProjectIds.includes(p.id));

              return (
                <div
                  key={u.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">{u.name}</h3>
                          <p className="text-[11px] text-slate-500">{u.designation}</p>
                          <p className="text-[10px] text-slate-400">{u.department}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleCfg.badgeBg} ${roleCfg.badgeText}`}>
                        {roleCfg.icon} {roleCfg.shortLabel}
                      </span>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800">{u.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-medium text-slate-800">{u.phone}</span>
                      </div>
                      <div className="flex items-start justify-between text-[11px]">
                        <span className="text-slate-400 shrink-0">Assigned Sites:</span>
                        <span className="font-medium text-slate-800 text-right">
                          {assignedSites.length > 0
                            ? assignedSites.map((s) => s.name).slice(0, 2).join(', ') +
                              (assignedSites.length > 2 ? ` (+${assignedSites.length - 2} more)` : '')
                            : 'All Enterprise Sites'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[11px] font-semibold text-slate-700">{u.status}</span>
                      <span className="text-[10px] text-slate-400">• {u.lastActive}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
                          store.updateSystemUser(u.id, { status: nextStatus });
                        }}
                        className={`text-[11px] px-2 py-1 rounded font-medium ${
                          u.status === 'Active'
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>

                      {u.role !== 'master_admin' && (
                        <button
                          onClick={() => store.deleteSystemUser(u.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MASTER RATE CARDS */}
      {activeTab === 'master_rates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item code, description, category..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Steel & Rebar">Steel & Rebar</option>
                <option value="Formwork & Shuttering">Formwork & Shuttering</option>
                <option value="Cement & Concrete">Cement & Concrete</option>
                <option value="Masonry & Blockwork">Masonry & Blockwork</option>
                <option value="Plastering">Plastering</option>
                <option value="Flooring & Tiling">Flooring & Tiling</option>
                <option value="Waterproofing">Waterproofing</option>
              </select>
            </div>

            <button
              id="btn-add-master-rate"
              onClick={() => setShowAddRateModal(true)}
              className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rate Benchmark</span>
            </button>
          </div>

          {/* Master Rates Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3">Item Code</th>
                    <th className="p-3">Description & Scope</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Benchmark Rate</th>
                    <th className="p-3">Allowable Band (Min - Max)</th>
                    <th className="p-3">Applicability</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRates.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-purple-700">{r.itemCode}</td>
                      <td className="p-3 font-medium text-slate-800 max-w-sm">{r.description}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {r.category}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{r.unit}</td>
                      <td className="p-3 font-bold text-slate-900 text-sm">₹ {r.benchmarkRate.toLocaleString()}</td>
                      <td className="p-3 text-slate-600 font-medium">
                        ₹ {r.minAllowedRate.toLocaleString()} - ₹ {r.maxAllowedRate.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                          {r.applicableSiteType}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => store.deleteMasterRateCardItem(r.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search actions, actors, IP addresses, targets..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <select
                value={auditSeverityFilter}
                onChange={(e) => setAuditSeverityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(securityAuditLogs, null, 2));
                  const dlAnchor = document.createElement('a');
                  dlAnchor.setAttribute('href', dataStr);
                  dlAnchor.setAttribute('download', `buildpulse_audit_trail_${Date.now()}.json`);
                  dlAnchor.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredAuditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      log.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-700'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {log.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : log.category === 'SELF_PUNCH' ? (
                      <MapPin className="w-4 h-4" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{log.action}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          log.severity === 'CRITICAL'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {log.severity}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-medium">
                        {log.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">{log.details}</p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-medium">
                      <span>Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole})</span>
                      <span>Target: <strong className="text-slate-700">{log.targetResource}</strong></span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-700 block">{log.timeDisplay}</span>
                  <span className="text-[10px] text-slate-400">{log.dateDisplay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SITE PORTFOLIO GOVERNANCE */}
      {activeTab === 'site_governance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Enterprise Site Clusters ({projects.length})</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Master oversight for all commercial, infrastructure, and residential project nodes.
              </p>
            </div>
            <button
              onClick={onOpenCreateSiteModal}
              className="px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Project Site</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden ${
                  p.id === activeProjectId ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-200'
                }`}
              >
                {p.id === activeProjectId && (
                  <span className="absolute top-0 right-0 px-2 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded-bl-lg">
                    CURRENTLY ACTIVE
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <img
                    src={p.bannerImage}
                    alt={p.name}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs leading-tight">{p.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{p.client}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {p.workType || 'Labour Contractor Work'}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Progress</span>
                    <span className="font-bold text-slate-800">{p.progressPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Budget Expended</span>
                    <span className="font-bold text-slate-800">₹ {(p.spentBudget / 100000).toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Geofence Radius</span>
                    <span className="font-medium text-slate-700">{p.geofenceRadiusMeters} meters</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active On-Site</span>
                    <span className="font-bold text-emerald-700">{p.activeWorkersCount} Workers</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => store.setActiveProject(p.id)}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                  >
                    Switch Context →
                  </button>
                  <span className="text-[10px] text-slate-400">{p.supervisorName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD SYSTEM USER (ROLE BASIS) */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        currentRole={currentRole}
        projects={projects}
        activeProjectId={activeProjectId}
      />

      {/* MODAL: ADD MASTER RATE BENCHMARK */}
      {showAddRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">New Master Rate Card Benchmark</h3>
              </div>
              <button
                onClick={() => setShowAddRateModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMasterRate} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={rateItemCode}
                    onChange={(e) => setRateItemCode(e.target.value)}
                    placeholder="e.g. BOQ-ST-08"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={rateCategory}
                    onChange={(e) => setRateCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Steel & Rebar">Steel & Rebar</option>
                    <option value="Formwork & Shuttering">Formwork & Shuttering</option>
                    <option value="Cement & Concrete">Cement & Concrete</option>
                    <option value="Masonry & Blockwork">Masonry & Blockwork</option>
                    <option value="Plastering">Plastering</option>
                    <option value="Flooring & Tiling">Flooring & Tiling</option>
                    <option value="Waterproofing">Waterproofing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Scope of Work *</label>
                <textarea
                  required
                  rows={2}
                  value={rateDescription}
                  onChange={(e) => setRateDescription(e.target.value)}
                  placeholder="e.g. 15mm Ceiling Gypsum Plastering with bonding agent"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={rateUnit}
                    onChange={(e) => setRateUnit(e.target.value)}
                    placeholder="MT / Sq.M / Cu.M"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Benchmark (₹)</label>
                  <input
                    type="number"
                    value={rateBenchmark}
                    onChange={(e) => setRateBenchmark(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Allow (₹)</label>
                  <input
                    type="number"
                    value={rateMin}
                    onChange={(e) => setRateMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Allow (₹)</label>
                  <input
                    type="number"
                    value={rateMax}
                    onChange={(e) => setRateMax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddRateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
                >
                  Save Benchmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
