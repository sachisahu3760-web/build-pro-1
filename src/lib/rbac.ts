import { Role, PermissionKey } from '../types';
import { NavView } from '../components/Sidebar';

export interface RoleMeta {
  key: Role;
  label: string;
  shortLabel: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  description: string;
  hierarchyLevel: number; // 1 = Master Admin, 9 = Worker
}

export const ROLE_CONFIGS: Record<Role, RoleMeta> = {
  master_admin: {
    key: 'master_admin',
    label: 'Master Admin (Superuser)',
    shortLabel: 'Master Admin',
    icon: '👑',
    badgeBg: 'bg-purple-900',
    badgeText: 'text-purple-100',
    borderAccent: 'border-purple-500',
    description: 'Global system rights: site creation, user/role management, master rate cards, security policies, and system audit logs.',
    hierarchyLevel: 1,
  },
  admin: {
    key: 'admin',
    label: 'Site Administrator',
    shortLabel: 'Site Admin',
    icon: '⚡',
    badgeBg: 'bg-indigo-700',
    badgeText: 'text-indigo-100',
    borderAccent: 'border-indigo-500',
    description: 'Operational site management, contractor onboarding, inventory approval, and site-level configuration.',
    hierarchyLevel: 2,
  },
  project_manager: {
    key: 'project_manager',
    label: 'Project Manager',
    shortLabel: 'Project Mgr',
    icon: '📊',
    badgeBg: 'bg-blue-700',
    badgeText: 'text-blue-100',
    borderAccent: 'border-blue-500',
    description: 'Overall project execution, budget variance, milestone tracking, resource forecasting, and executive reporting.',
    hierarchyLevel: 3,
  },
  site_supervisor: {
    key: 'site_supervisor',
    label: 'Site Supervisor',
    shortLabel: 'Supervisor',
    icon: '🏗️',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-amber-100',
    borderAccent: 'border-amber-500',
    description: 'Daily field operations, labor muster roll verification, material receipt OTPs, daily logs, and task allocation.',
    hierarchyLevel: 4,
  },
  safety_officer: {
    key: 'safety_officer',
    label: 'Safety (HSE) Officer',
    shortLabel: 'HSE Officer',
    icon: '🦺',
    badgeBg: 'bg-red-700',
    badgeText: 'text-red-100',
    borderAccent: 'border-red-500',
    description: 'Site safety enforcement, hazard inspection, incident logging, PPE compliance scans, and safety toolbox talks.',
    hierarchyLevel: 5,
  },
  field_engineer: {
    key: 'field_engineer',
    label: 'Field / QC Engineer',
    shortLabel: 'QC Engineer',
    icon: '📐',
    badgeBg: 'bg-teal-700',
    badgeText: 'text-teal-100',
    borderAccent: 'border-teal-500',
    description: 'Technical quality assurance, concrete cube test records, rebar inspection, and drawing verification.',
    hierarchyLevel: 6,
  },
  labour_contractor: {
    key: 'labour_contractor',
    label: 'Labour Contractor (Gang Boss)',
    shortLabel: 'Contractor',
    icon: '📋',
    badgeBg: 'bg-orange-700',
    badgeText: 'text-orange-100',
    borderAccent: 'border-orange-500',
    description: 'Rate-contract work orders, BOQ quantity measurements, gang muster management, and daily profit/loss claims.',
    hierarchyLevel: 7,
  },
  worker: {
    key: 'worker',
    label: 'Labor / Skilled Worker',
    shortLabel: 'Worker / Labor',
    icon: '👷',
    badgeBg: 'bg-emerald-700',
    badgeText: 'text-emerald-100',
    borderAccent: 'border-emerald-500',
    description: 'Real-time GPS self-punching in/out, selfie face capture, live work hours tracker, and wage history.',
    hierarchyLevel: 8,
  },
  client_stakeholder: {
    key: 'client_stakeholder',
    label: 'Client / Auditor Stakeholder',
    shortLabel: 'Client Auditor',
    icon: '🏛️',
    badgeBg: 'bg-slate-700',
    badgeText: 'text-slate-100',
    borderAccent: 'border-slate-500',
    description: 'Read-only financial inspection, progress milestone verification, BOQ billing review, and executive dashboards.',
    hierarchyLevel: 9,
  },
};

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: 'Administration & RBAC' | 'Field Operations' | 'Financials & Rates' | 'Safety & Compliance';
  description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'manage_sites',
    label: 'Create & Manage Project Sites',
    category: 'Administration & RBAC',
    description: 'Add new sites, set geofence boundaries, configure work types, and upload initial contracts.',
  },
  {
    key: 'manage_users',
    label: 'Manage Staff Directory & Access',
    category: 'Administration & RBAC',
    description: 'Invite new staff, assign project sites, and toggle user active/suspended statuses.',
  },
  {
    key: 'manage_roles',
    label: 'Modify Role-Based Access (RBAC)',
    category: 'Administration & RBAC',
    description: 'Assign and change user roles across all sites and customize permission matrices.',
  },
  {
    key: 'manage_master_rates',
    label: 'Configure Master Rate Cards',
    category: 'Financials & Rates',
    description: 'Set standard benchmark rates and allowable rate boundaries for BOQ work items.',
  },
  {
    key: 'system_configuration',
    label: 'System Settings & Audit Overrides',
    category: 'Administration & RBAC',
    description: 'View tamper-evident security audit logs, manage cloud sync, and enforce global policies.',
  },
  {
    key: 'view_financials_pnl',
    label: 'View Financials & Daily P&L',
    category: 'Financials & Rates',
    description: 'Access revenue, labour cost breakups, net profit calculations, and rate contracts.',
  },
  {
    key: 'approve_pnl_reports',
    label: 'Approve Contractor Daily DPRs & Claims',
    category: 'Financials & Rates',
    description: 'Verify daily BOQ measured quantities and sign off contractor daily wage claims.',
  },
  {
    key: 'create_work_orders',
    label: 'Issue & Manage Work Orders',
    category: 'Financials & Rates',
    description: 'Draft BOQ line items, upload contract PDFs, and assign gangs to work orders.',
  },
  {
    key: 'manage_materials',
    label: 'Material Inventory & Gate Pass OTPs',
    category: 'Field Operations',
    description: 'Issue gate passes, verify delivery challans, and authenticate SMS/WhatsApp OTPs.',
  },
  {
    key: 'manage_workers',
    label: 'Labor Muster Roll & Gang Dispatch',
    category: 'Field Operations',
    description: 'Register workers, reassign gangs between sites, and edit shift daily wage schedules.',
  },
  {
    key: 'self_punch',
    label: 'Worker Real-Time GPS Self-Punch',
    category: 'Field Operations',
    description: 'Clock in and clock out using live GPS coordinates and live face camera verification.',
  },
  {
    key: 'view_live_location',
    label: 'Live Crew GPS Tracking & Radar',
    category: 'Field Operations',
    description: 'View real-time worker pins on interactive GPS map and geofence boundary radar.',
  },
  {
    key: 'manage_safety_incidents',
    label: 'Safety Inspections & Incident Logging',
    category: 'Safety & Compliance',
    description: 'Run AI PPE hazard checks, report site safety violations, and issue corrective action orders.',
  },
  {
    key: 'export_audit_reports',
    label: 'Export Executive & Compliance Reports',
    category: 'Administration & RBAC',
    description: 'Generate PDF summaries, export Excel muster sheets, and download financial balance sheets.',
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  master_admin: [
    'manage_sites',
    'manage_users',
    'manage_roles',
    'manage_master_rates',
    'system_configuration',
    'view_financials_pnl',
    'approve_pnl_reports',
    'create_work_orders',
    'manage_materials',
    'manage_workers',
    'self_punch',
    'view_live_location',
    'manage_safety_incidents',
    'export_audit_reports',
  ],
  admin: [
    'manage_sites',
    'manage_users',
    'manage_roles',
    'view_financials_pnl',
    'approve_pnl_reports',
    'create_work_orders',
    'manage_materials',
    'manage_workers',
    'self_punch',
    'view_live_location',
    'manage_safety_incidents',
    'export_audit_reports',
  ],
  project_manager: [
    'manage_sites',
    'view_financials_pnl',
    'approve_pnl_reports',
    'create_work_orders',
    'manage_materials',
    'manage_workers',
    'view_live_location',
    'manage_safety_incidents',
    'export_audit_reports',
  ],
  site_supervisor: [
    'approve_pnl_reports',
    'manage_materials',
    'manage_workers',
    'self_punch',
    'view_live_location',
    'manage_safety_incidents',
    'export_audit_reports',
  ],
  safety_officer: [
    'manage_safety_incidents',
    'view_live_location',
    'export_audit_reports',
  ],
  field_engineer: [
    'approve_pnl_reports',
    'manage_materials',
    'view_live_location',
    'manage_safety_incidents',
    'export_audit_reports',
  ],
  labour_contractor: [
    'view_financials_pnl',
    'create_work_orders',
    'manage_workers',
    'self_punch',
    'view_live_location',
  ],
  worker: [
    'self_punch',
    'view_live_location',
  ],
  client_stakeholder: [
    'view_financials_pnl',
    'view_live_location',
    'export_audit_reports',
  ],
};

export function hasPermission(
  role: Role,
  permission: PermissionKey,
  customRolePermissions?: Record<Role, PermissionKey[]>,
  userOverrides?: Partial<Record<PermissionKey, boolean>>
): boolean {
  // Check user-specific explicit override first
  if (userOverrides && userOverrides[permission] !== undefined) {
    return !!userOverrides[permission];
  }

  // Master Admin has full privileges by default
  if (role === 'master_admin') {
    return true;
  }

  const rolePerms = (customRolePermissions && customRolePermissions[role]) || DEFAULT_ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}

export function canAccessView(
  role: Role,
  view: NavView,
  customRolePermissions?: Record<Role, PermissionKey[]>
): boolean {
  if (role === 'master_admin') return true;

  switch (view) {
    case 'dashboard':
      return true;
    case 'masterAdmin' as any:
      return hasPermission(role, 'manage_roles', customRolePermissions) || hasPermission(role, 'system_configuration', customRolePermissions);
    case 'selfPunch' as any:
      return true; // Available to all, specially prioritized for worker
    case 'labourContractor':
      return hasPermission(role, 'view_financials_pnl', customRolePermissions) || role === 'labour_contractor';
    case 'materials':
      return hasPermission(role, 'manage_materials', customRolePermissions) || role === 'project_manager' || role === 'site_supervisor' || role === 'admin';
    case 'workers':
      return hasPermission(role, 'manage_workers', customRolePermissions) || role === 'labour_contractor';
    case 'liveLocation':
      return hasPermission(role, 'view_live_location', customRolePermissions);
    case 'siteProgress':
      return true;
    case 'safety':
      return hasPermission(role, 'manage_safety_incidents', customRolePermissions) || role === 'safety_officer' || role === 'site_supervisor';
    case 'budget':
      return hasPermission(role, 'view_financials_pnl', customRolePermissions) && role !== 'worker' && role !== 'labour_contractor';
    case 'documents':
      return true;
    case 'teamChat':
      return true;
    case 'reports':
      return hasPermission(role, 'export_audit_reports', customRolePermissions);
    default:
      return true;
  }
}

export function getAllowedAssignableRoles(
  currentRole: Role,
  customRolePermissions?: Record<Role, PermissionKey[]>
): Role[] {
  // Master Admin has full global privilege to create/assign ANY role
  if (currentRole === 'master_admin' || hasPermission(currentRole, 'manage_roles', customRolePermissions)) {
    return [
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
  }

  // Site Administrator can provision all operational & executive site roles
  if (currentRole === 'admin') {
    return [
      'admin',
      'project_manager',
      'site_supervisor',
      'safety_officer',
      'field_engineer',
      'labour_contractor',
      'worker',
      'client_stakeholder',
    ];
  }

  // Project Manager can assign site operations crew and contractors
  if (currentRole === 'project_manager') {
    return [
      'site_supervisor',
      'safety_officer',
      'field_engineer',
      'labour_contractor',
      'worker',
      'client_stakeholder',
    ];
  }

  // Site Supervisor can onboard safety marshals, engineers, contractors, and workers
  if (currentRole === 'site_supervisor') {
    return [
      'safety_officer',
      'field_engineer',
      'labour_contractor',
      'worker',
    ];
  }

  // Labour Contractor can onboard fellow contractors & gang workers
  if (currentRole === 'labour_contractor') {
    return [
      'labour_contractor',
      'worker',
    ];
  }

  // Field / Safety Officers can onboard team members
  if (currentRole === 'safety_officer' || currentRole === 'field_engineer') {
    return [
      currentRole,
      'worker',
      'client_stakeholder',
    ];
  }

  // Workers & Stakeholders can invite / register team members
  return ['worker', 'client_stakeholder'];
}

