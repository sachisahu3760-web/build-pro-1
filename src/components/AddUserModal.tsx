import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Building2,
  Phone,
  Mail,
  Briefcase,
  Layers,
  Check,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  HardHat,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  IdCard,
} from 'lucide-react';
import { Role, SystemUser, ProjectSite, PermissionKey, WorkerProfile } from '../types';
import { ROLE_CONFIGS, PERMISSION_DEFINITIONS, DEFAULT_ROLE_PERMISSIONS, getAllowedAssignableRoles, hasPermission } from '../lib/rbac';
import { store } from '../lib/offlineStore';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  projects: ProjectSite[];
  activeProjectId?: string;
  onUserAdded?: (newUser: SystemUser) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  projects = [],
  activeProjectId,
  onUserAdded,
}) => {
  const allowedRoles = getAllowedAssignableRoles(currentRole, store.getState().rolePermissions);
  const defaultSelectedRole: Role = allowedRoles.includes('site_supervisor')
    ? 'site_supervisor'
    : allowedRoles[0] || 'worker';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(defaultSelectedRole);
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Site Operations');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'Active' | 'Pending Invite'>('Active');
  const [workerTrade, setWorkerTrade] = useState<WorkerProfile['trade']>('Steel Fixer');
  const [dailyWage, setDailyWage] = useState<number>(950);
  const [showPermissionsOverride, setShowPermissionsOverride] = useState(false);
  const [customOverrides, setCustomOverrides] = useState<Partial<Record<PermissionKey, boolean>>>({});
  const [avatarSeed, setAvatarSeed] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize projects selection and default designation
  useEffect(() => {
    if (isOpen) {
      const initialProjId = activeProjectId || projects[0]?.id || 'proj-01';
      setSelectedProjectIds([initialProjId]);
      setSelectedRole(defaultSelectedRole);
      setDesignation(getDefaultDesignation(defaultSelectedRole));
      setDepartment(getDefaultDepartment(defaultSelectedRole));
      setCustomOverrides({});
      setErrorMsg(null);
    }
  }, [isOpen, activeProjectId, projects]);

  // When role changes, update default designation and department
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setDesignation(getDefaultDesignation(role));
    setDepartment(getDefaultDepartment(role));
    setCustomOverrides({});
  };

  function getDefaultDesignation(role: Role): string {
    switch (role) {
      case 'master_admin':
        return 'Chief Technology & Governance Officer';
      case 'admin':
        return 'Site General Administrator';
      case 'project_manager':
        return 'Senior Project Lead';
      case 'site_supervisor':
        return 'Chief Site Supervisor';
      case 'safety_officer':
        return 'Lead HSE & Safety Officer';
      case 'field_engineer':
        return 'Field / QC Engineer';
      case 'labour_contractor':
        return 'Labour Contractor & Gang Boss';
      case 'worker':
        return 'Skilled Tradesperson';
      case 'client_stakeholder':
        return 'Client Representative & Auditor';
      default:
        return 'Staff Member';
    }
  }

  function getDefaultDepartment(role: Role): string {
    switch (role) {
      case 'master_admin':
      case 'admin':
        return 'Executive & System Administration';
      case 'project_manager':
        return 'Project Planning & Control';
      case 'site_supervisor':
        return 'Civil & Site Execution';
      case 'safety_officer':
        return 'HSE & Safety Governance';
      case 'field_engineer':
        return 'Quality Assurance & Technical Labs';
      case 'labour_contractor':
        return 'Contracting & Labor Supply';
      case 'worker':
        return 'Field Workforce';
      case 'client_stakeholder':
        return 'Client Inspection & Audit';
      default:
        return 'Site Operations';
    }
  }

  const handleToggleProject = (projId: string) => {
    setSelectedProjectIds((prev) => {
      if (prev.includes(projId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== projId);
      } else {
        return [...prev, projId];
      }
    });
  };

  const handleSelectAllProjects = () => {
    if (selectedProjectIds.length === projects.length) {
      setSelectedProjectIds([activeProjectId || projects[0]?.id || 'proj-01']);
    } else {
      setSelectedProjectIds(projects.map((p) => p.id));
    }
  };

  const handleTogglePermissionOverride = (permKey: PermissionKey) => {
    const defaultVal = (DEFAULT_ROLE_PERMISSIONS[selectedRole] || []).includes(permKey);
    const currentOverride = customOverrides[permKey];

    const currentEffective = currentOverride !== undefined ? currentOverride : defaultVal;
    const nextVal = !currentEffective;

    setCustomOverrides((prev) => ({
      ...prev,
      [permKey]: nextVal,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter the user full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const avatarUrl = `https://images.unsplash.com/photo-${1500000000000 + (avatarSeed * 9876543) % 90000000}?auto=format&fit=crop&w=150&q=80`;

      const newUser = store.addSystemUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+91 98000 00000',
        role: selectedRole,
        assignedProjectIds: selectedProjectIds.length > 0 ? selectedProjectIds : [projects[0]?.id || 'proj-01'],
        avatar: avatarUrl,
        designation: designation.trim() || getDefaultDesignation(selectedRole),
        department: department.trim() || getDefaultDepartment(selectedRole),
        status,
        permissionsOverride: Object.keys(customOverrides).length > 0 ? customOverrides : undefined,
        workerTrade: selectedRole === 'worker' ? workerTrade : undefined,
        dailyWage: selectedRole === 'worker' ? Number(dailyWage) : undefined,
      });

      if (onUserAdded) {
        onUserAdded(newUser);
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create user. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentRoleCfg = ROLE_CONFIGS[selectedRole] || ROLE_CONFIGS.site_supervisor;
  const currentActorCfg = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.master_admin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Add / Provision New User
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Role-Based (RBAC)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Logged in as <strong className="text-white">{currentActorCfg.label}</strong> • Onboarding team members with site-specific credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: ROLE SELECTION (ROLE BASIS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>1. Select System Role (Role-Basis) *</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {allowedRoles.length} role(s) available under your tier
              </span>
            </div>

            {/* Grid of Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allowedRoles.map((r) => {
                const cfg = ROLE_CONFIGS[r];
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? `${cfg.borderAccent} border-2 bg-purple-50/50 shadow-sm ring-1 ring-purple-500/20`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cfg.icon}</span>
                          <span className="font-bold text-slate-900 text-xs leading-tight">
                            {cfg.shortLabel}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 text-[10px]">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {cfg.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${cfg.badgeBg} ${cfg.badgeText}`}>
                        Level {cfg.hierarchyLevel}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {(DEFAULT_ROLE_PERMISSIONS[r] || []).length} permissions
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Role Summary Strip */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-2xl mt-0.5">{currentRoleCfg.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs">{currentRoleCfg.label}</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${currentRoleCfg.badgeBg} ${currentRoleCfg.badgeText}`}>
                    Tier Level {currentRoleCfg.hierarchyLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {currentRoleCfg.description}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: USER PROFILE CREDENTIALS */}
          <div className="space-y-3 pt-2">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <IdCard className="w-4 h-4 text-purple-600" />
              <span>2. Personal & Contact Information</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@construction.io"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-xs font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 11223"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Job Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Project Lead"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Department / Wing
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Site Operations"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Initial Account Status
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Active')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'Active'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Active (Instant Access)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Pending Invite')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      status === 'Pending Invite'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Pending Invite</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Avatar Preset
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((seed) => (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setAvatarSeed(seed)}
                      className={`relative rounded-full p-0.5 border-2 transition-all ${
                        avatarSeed === seed ? 'border-purple-600 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={`https://images.unsplash.com/photo-${1500000000000 + (seed * 9876543) % 90000000}?auto=format&fit=crop&w=150&q=80`}
                        alt={`Preset ${seed}`}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAvatarSeed((prev) => prev + 1)}
                    className="text-[10px] text-purple-600 hover:text-purple-800 font-bold ml-1"
                  >
                    Randomize
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: WORKER-SPECIFIC TRADE & WAGE (ONLY IF ROLE IS WORKER) */}
          {selectedRole === 'worker' && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-900 text-xs">
                  Worker Roster & Telemetry Integration
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold ml-auto">
                  Auto-linked to GPS Self-Punch
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                This user will automatically be registered in the active workforce muster roll and granted GPS Self-Punch credentials.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-emerald-900 block mb-1">
                    Primary Trade Specialization
                  </label>
                  <select
                    value={workerTrade}
                    onChange={(e) => setWorkerTrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Steel Fixer">Steel Fixer</option>
                    <option value="Mason">Mason</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Welder">Welder</option>
                    <option value="Heavy Equipment Operator">Heavy Equipment Operator</option>
                    <option value="Safety Marshal">Safety Marshal</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="General Labor">General Labor</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-emerald-900 block mb-1">
                    Standard Daily Wage (₹ / 8-hour shift)
                  </label>
                  <input
                    type="number"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PROJECT SITE ASSIGNMENTS */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>3. Assign Project Site Locations *</span>
              </label>
              <button
                type="button"
                onClick={handleSelectAllProjects}
                className="text-[11px] text-purple-600 hover:text-purple-800 font-bold underline"
              >
                {selectedProjectIds.length === projects.length ? 'Clear to Active Only' : 'Grant All Sites'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {projects.map((p) => {
                const isChecked = selectedProjectIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleProject(p.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isChecked
                        ? 'border-purple-400 bg-purple-50/60 shadow-xs ring-1 ring-purple-400/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                          {p.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{p.client} • {p.siteType}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 5: CUSTOM PERMISSIONS OVERRIDES (COLLAPSIBLE) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPermissionsOverride(!showPermissionsOverride)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="font-bold text-slate-900 text-xs">
                    Granular Permission Overrides (Optional)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Fine-tune specific operational or financial rights for this individual user
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {Object.keys(customOverrides).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    {Object.keys(customOverrides).length} custom override(s)
                  </span>
                )}
                {showPermissionsOverride ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
            </button>

            {showPermissionsOverride && (
              <div className="p-4 bg-white divide-y divide-slate-100 space-y-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pb-2">
                  <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>
                    Defaults are derived from <strong>{currentRoleCfg.label}</strong>. Toggling overrides will pin specific capabilities to this account.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {PERMISSION_DEFINITIONS.map((perm) => {
                    const defaultHas = (DEFAULT_ROLE_PERMISSIONS[selectedRole] || []).includes(perm.key);
                    const override = customOverrides[perm.key];
                    const effective = override !== undefined ? override : defaultHas;

                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermissionOverride(perm.key)}
                        className={`p-2 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-colors ${
                          effective
                            ? 'bg-purple-50/40 border-purple-200'
                            : 'bg-slate-50/60 border-slate-200 opacity-80'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            effective
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {effective && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11px] leading-tight">
                              {perm.label}
                            </span>
                            {override !== undefined && (
                              <span className="text-[9px] font-bold text-purple-600 uppercase">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Will assign <strong>{selectedProjectIds.length} site(s)</strong> under <strong>{currentRoleCfg.shortLabel}</strong> policy.
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Provisioning...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Provision & Grant Access</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
