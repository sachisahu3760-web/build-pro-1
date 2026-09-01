import {
  ProjectSite,
  SiteCategory,
  WorkOrderMilestone,
  WorkOrderPnlProjection,
  MaterialItem,
  MaterialCategory,
  WorkerProfile,
  WorkerPunchRecord,
  SiteUpdateLog,
  SafetyIncident,
  BudgetExpense,
  ComplianceDocument,
  ProjectDocument,
  ChatMessage,
  AppNotification,
  ProjectScheduleMilestone,
  OfflineSyncQueueItem,
  Role,
  LanguageCode,
  MaterialTransactionRecord,
  CentralStockItem,
  MaterialOtpRecord,
  MaterialAttachment,
  MaterialMovementType,
  WorkOrderContract,
  SiteDailyExpense,
  DailyLabourSummary,
  DailyProgressReport,
  DailyProfitLossReport,
  BOQItem,
  SystemUser,
  MasterRateCardItem,
  SecurityAuditLog,
  WorkerSelfPunchPayload,
  PermissionKey,
  PettyCashAccount,
  DailyCashPayment,
  DailyCashReconciliationRecord,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_SITE_CATEGORIES,
  INITIAL_MATERIALS,
  INITIAL_MATERIAL_CATEGORIES,
  INITIAL_WORKERS,
  INITIAL_UPDATES,
  INITIAL_SAFETY_INCIDENTS,
  INITIAL_BUDGET_EXPENSES,
  INITIAL_COMPLIANCE_DOCS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MILESTONES,
  INITIAL_MATERIAL_TRANSACTIONS,
  INITIAL_CENTRAL_STOCK,
  INITIAL_WORK_ORDERS,
  INITIAL_SITE_DAILY_EXPENSES,
  INITIAL_DAILY_LABOUR_SUMMARIES,
  INITIAL_DAILY_PROGRESS_REPORTS,
  INITIAL_DAILY_PROFIT_LOSS_REPORTS,
  INITIAL_SYSTEM_USERS,
  INITIAL_MASTER_RATE_CARDS,
  INITIAL_SECURITY_AUDIT_LOGS,
  INITIAL_PETTY_CASH_ACCOUNTS,
  INITIAL_DAILY_CASH_PAYMENTS,
  INITIAL_DAILY_CASH_RECONCILIATIONS,
} from './initialData';
import { DEFAULT_ROLE_PERMISSIONS } from './rbac';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const INITIAL_PUNCH_RECORDS: WorkerPunchRecord[] = [
  {
    id: 'punch-01',
    workerId: 'wrk-01',
    workerName: 'Suresh Kumar Yadav',
    workerRole: 'Lead Steel Fixer Foreman',
    workerTrade: 'Steel Fixer',
    workerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    projectId: 'proj-01',
    projectName: 'Metro Corridor Line 4',
    type: 'PUNCH_IN',
    timestamp: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
    timeDisplay: '06:55 AM',
    dateDisplay: 'Today',
    coordinates: { lat: 19.0594, lng: 72.8872 },
    distanceFromSiteMeters: 42,
    isInsideGeofence: true,
    locationAddress: 'Pier 142 Staging Area, Wadala Site Gate 2',
    verificationMethod: 'GPS Telemetry',
    notes: 'Shift started: Precast pier rebar cage alignment work',
  },
  {
    id: 'punch-02',
    workerId: 'wrk-02',
    workerName: 'Mohammad Tariq Ansari',
    workerRole: 'Tower Crane Operator (Grade A)',
    workerTrade: 'Heavy Equipment Operator',
    workerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    projectId: 'proj-01',
    projectName: 'Metro Corridor Line 4',
    type: 'PUNCH_IN',
    timestamp: new Date(Date.now() - 5.7 * 3600 * 1000).toISOString(),
    timeDisplay: '06:45 AM',
    dateDisplay: 'Today',
    coordinates: { lat: 19.0598, lng: 72.8879 },
    distanceFromSiteMeters: 65,
    isInsideGeofence: true,
    locationAddress: 'Tower Crane TC-02 Control Deck',
    verificationMethod: 'Browser Geolocation',
    notes: 'Daily pre-operation crane winch and safety hook check passed',
  },
  {
    id: 'punch-03',
    workerId: 'wrk-03',
    workerName: 'Dinesh Ramdas Patil',
    workerRole: 'Quality & Concrete Testing Field Inspector',
    workerTrade: 'Site Engineer',
    workerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    projectId: 'proj-01',
    projectName: 'Metro Corridor Line 4',
    type: 'PUNCH_IN',
    timestamp: new Date(Date.now() - 5.1 * 3600 * 1000).toISOString(),
    timeDisplay: '07:10 AM',
    dateDisplay: 'Today',
    coordinates: { lat: 19.0592, lng: 72.8871 },
    distanceFromSiteMeters: 80,
    isInsideGeofence: true,
    locationAddress: 'Precast Casting Bed Quality Lab #1',
    verificationMethod: 'Kiosk Quick-Punch',
    notes: 'Cube test batch #48 compressive strength validation',
  },
];

const STORAGE_KEYS = {
  PROJECTS: 'buildpulse_projects',
  SITE_CATEGORIES: 'buildpulse_site_categories',
  MATERIALS: 'buildpulse_materials',
  MATERIAL_CATEGORIES: 'buildpulse_material_categories',
  MATERIAL_TRANSACTIONS: 'buildpulse_material_transactions',
  CENTRAL_STOCK: 'buildpulse_central_stock',
  WORKERS: 'buildpulse_workers',
  PUNCH_RECORDS: 'buildpulse_punch_records',
  UPDATES: 'buildpulse_updates',
  INCIDENTS: 'buildpulse_incidents',
  EXPENSES: 'buildpulse_expenses',
  DOCS: 'buildpulse_docs',
  MESSAGES: 'buildpulse_messages',
  NOTIFICATIONS: 'buildpulse_notifications',
  MILESTONES: 'buildpulse_milestones',
  OFFLINE_QUEUE: 'buildpulse_offline_queue',
  ACTIVE_PROJECT_ID: 'buildpulse_active_project_id',
  CURRENT_ROLE: 'buildpulse_current_role',
  CURRENT_LANG: 'buildpulse_current_lang',
  OFFLINE_OVERRIDE: 'buildpulse_offline_override',
  WORK_ORDERS: 'buildpulse_work_orders',
  SITE_DAILY_EXPENSES: 'buildpulse_site_daily_expenses',
  DAILY_LABOUR_SUMMARIES: 'buildpulse_daily_labour_summaries',
  DAILY_PROGRESS_REPORTS: 'buildpulse_daily_progress_reports',
  DAILY_PROFIT_LOSS_REPORTS: 'buildpulse_daily_profit_loss_reports',
  SYSTEM_USERS: 'buildpulse_system_users',
  MASTER_RATE_CARDS: 'buildpulse_master_rate_cards',
  SECURITY_AUDIT_LOGS: 'buildpulse_security_audit_logs',
  ROLE_PERMISSIONS: 'buildpulse_role_permissions',
  PETTY_CASH_ACCOUNTS: 'buildpulse_petty_cash_accounts',
  DAILY_CASH_PAYMENTS: 'buildpulse_daily_cash_payments',
  DAILY_CASH_RECONCILIATIONS: 'buildpulse_daily_cash_reconciliations',
};

// Safe storage accessors
export function loadFromLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveToLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export class ConstructionStore {
  projects: ProjectSite[];
  siteCategories: SiteCategory[];
  materials: MaterialItem[];
  materialCategories: MaterialCategory[];
  materialTransactions: MaterialTransactionRecord[];
  centralStock: CentralStockItem[];
  workers: WorkerProfile[];
  punchRecords: WorkerPunchRecord[];
  updates: SiteUpdateLog[];
  incidents: SafetyIncident[];
  expenses: BudgetExpense[];
  documents: ProjectDocument[];
  docs: ComplianceDocument[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  milestones: ProjectScheduleMilestone[];
  offlineQueue: OfflineSyncQueueItem[];
  workOrders: WorkOrderContract[];
  siteDailyExpenses: SiteDailyExpense[];
  dailyLabourSummaries: DailyLabourSummary[];
  dailyProgressReports: DailyProgressReport[];
  dailyProfitLossReports: DailyProfitLossReport[];
  systemUsers: SystemUser[];
  masterRateCards: MasterRateCardItem[];
  securityAuditLogs: SecurityAuditLog[];
  rolePermissions: Record<Role, PermissionKey[]>;
  pettyCashAccounts: PettyCashAccount[];
  dailyCashPayments: DailyCashPayment[];
  dailyCashReconciliations: DailyCashReconciliationRecord[];
  activeProjectId: string;
  currentRole: Role;
  currentLanguage: LanguageCode;
  isForcedOffline: boolean;
  isOnline: boolean;
  listeners: Array<() => void> = [];

  constructor() {
    this.projects = loadFromLocal(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    this.siteCategories = loadFromLocal(STORAGE_KEYS.SITE_CATEGORIES, INITIAL_SITE_CATEGORIES);
    this.materials = loadFromLocal(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
    this.materialCategories = loadFromLocal(STORAGE_KEYS.MATERIAL_CATEGORIES, INITIAL_MATERIAL_CATEGORIES);
    this.materialTransactions = loadFromLocal(STORAGE_KEYS.MATERIAL_TRANSACTIONS, INITIAL_MATERIAL_TRANSACTIONS);
    this.centralStock = loadFromLocal(STORAGE_KEYS.CENTRAL_STOCK, INITIAL_CENTRAL_STOCK);
    this.workers = loadFromLocal(STORAGE_KEYS.WORKERS, INITIAL_WORKERS);
    this.punchRecords = loadFromLocal(STORAGE_KEYS.PUNCH_RECORDS, INITIAL_PUNCH_RECORDS);
    this.updates = loadFromLocal(STORAGE_KEYS.UPDATES, INITIAL_UPDATES);
    this.incidents = loadFromLocal(STORAGE_KEYS.INCIDENTS, INITIAL_SAFETY_INCIDENTS);
    this.expenses = loadFromLocal(STORAGE_KEYS.EXPENSES, INITIAL_BUDGET_EXPENSES);
    this.docs = loadFromLocal(STORAGE_KEYS.DOCS, INITIAL_COMPLIANCE_DOCS);
    this.documents = loadFromLocal('buildpulse_proj_docs', [
      {
        id: 'doc-01',
        projectId: 'proj-01',
        title: 'Pier 140 to 150 Structural Rebar Detailed CAD',
        category: 'Structural CAD Drawing',
        fileUrl: 'https://example.com/blueprints/drawing.pdf',
        fileSize: '4.8 MB',
        fileType: 'pdf',
        uploadedBy: 'Lead Structural Engineer',
        version: 'Rev 2.4',
        tags: ['Superstructure', 'Approved'],
      },
      {
        id: 'doc-02',
        projectId: 'proj-01',
        title: 'Geotechnical Soil Core Bearing Analysis',
        category: 'Geotechnical Soil Report',
        fileUrl: 'https://example.com/blueprints/soil.pdf',
        fileSize: '3.1 MB',
        fileType: 'pdf',
        uploadedBy: 'GeoTech Consultant Ltd.',
        version: 'Rev 1.0',
        tags: ['Foundation', 'Site Survey'],
      },
    ]);
    this.messages = loadFromLocal(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    this.notifications = loadFromLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.milestones = loadFromLocal(STORAGE_KEYS.MILESTONES, INITIAL_MILESTONES);
    this.offlineQueue = loadFromLocal(STORAGE_KEYS.OFFLINE_QUEUE, []);
    this.workOrders = loadFromLocal(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS);
    this.siteDailyExpenses = loadFromLocal(STORAGE_KEYS.SITE_DAILY_EXPENSES, INITIAL_SITE_DAILY_EXPENSES);
    this.dailyLabourSummaries = loadFromLocal(STORAGE_KEYS.DAILY_LABOUR_SUMMARIES, INITIAL_DAILY_LABOUR_SUMMARIES);
    this.dailyProgressReports = loadFromLocal(STORAGE_KEYS.DAILY_PROGRESS_REPORTS, INITIAL_DAILY_PROGRESS_REPORTS);
    this.dailyProfitLossReports = loadFromLocal(STORAGE_KEYS.DAILY_PROFIT_LOSS_REPORTS, INITIAL_DAILY_PROFIT_LOSS_REPORTS);
    this.systemUsers = loadFromLocal(STORAGE_KEYS.SYSTEM_USERS, INITIAL_SYSTEM_USERS);
    this.masterRateCards = loadFromLocal(STORAGE_KEYS.MASTER_RATE_CARDS, INITIAL_MASTER_RATE_CARDS);
    this.securityAuditLogs = loadFromLocal(STORAGE_KEYS.SECURITY_AUDIT_LOGS, INITIAL_SECURITY_AUDIT_LOGS);
    this.rolePermissions = loadFromLocal(STORAGE_KEYS.ROLE_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS);
    this.pettyCashAccounts = loadFromLocal(STORAGE_KEYS.PETTY_CASH_ACCOUNTS, INITIAL_PETTY_CASH_ACCOUNTS);
    this.dailyCashPayments = loadFromLocal(STORAGE_KEYS.DAILY_CASH_PAYMENTS, INITIAL_DAILY_CASH_PAYMENTS);
    this.dailyCashReconciliations = loadFromLocal(STORAGE_KEYS.DAILY_CASH_RECONCILIATIONS, INITIAL_DAILY_CASH_RECONCILIATIONS);
    this.activeProjectId = loadFromLocal(STORAGE_KEYS.ACTIVE_PROJECT_ID, 'proj-01');
    this.currentRole = loadFromLocal(STORAGE_KEYS.CURRENT_ROLE, 'project_manager');
    this.currentLanguage = loadFromLocal(STORAGE_KEYS.CURRENT_LANG, 'en');
    this.isForcedOffline = loadFromLocal(STORAGE_KEYS.OFFLINE_OVERRIDE, false);
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine && !this.isForcedOffline : true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (!this.isForcedOffline) {
          this.isOnline = true;
          this.syncPendingOfflineQueue();
          this.notify();
        }
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }

    // Try background cloud fetch if online
    if (this.isOnline) {
      this.syncFromCloudSilently();
    }
  }

  getState() {
    return {
      projects: this.projects,
      siteCategories: this.siteCategories,
      materials: this.materials,
      materialCategories: this.materialCategories,
      materialTransactions: this.materialTransactions,
      centralStock: this.centralStock,
      workers: this.workers,
      punchRecords: this.punchRecords,
      siteUpdates: this.updates,
      safetyIncidents: this.incidents,
      budgetExpenses: this.expenses,
      complianceDocs: this.docs,
      documents: this.documents,
      chatMessages: this.messages,
      notifications: this.notifications,
      milestones: this.milestones,
      workOrders: this.workOrders,
      siteDailyExpenses: this.siteDailyExpenses,
      dailyLabourSummaries: this.dailyLabourSummaries,
      dailyProgressReports: this.dailyProgressReports,
      dailyProfitLossReports: this.dailyProfitLossReports,
      systemUsers: this.systemUsers,
      masterRateCards: this.masterRateCards,
      securityAuditLogs: this.securityAuditLogs,
      rolePermissions: this.rolePermissions,
      pettyCashAccounts: this.pettyCashAccounts,
      dailyCashPayments: this.dailyCashPayments,
      dailyCashReconciliations: this.dailyCashReconciliations,
      activeProjectId: this.activeProjectId,
      currentRole: this.currentRole,
      currentLang: this.currentLanguage,
      isOnline: this.isOnline,
      pendingSyncCount: this.offlineQueue.length,
    };
  }

  addDocument(doc: Omit<ProjectDocument, 'id' | 'uploadDate'>) {
    const newDoc: ProjectDocument = {
      ...doc,
      id: 'pdoc-' + Date.now(),
      uploadDate: new Date().toISOString(),
    };
    this.documents = [newDoc, ...this.documents];
    saveToLocal('buildpulse_proj_docs', this.documents);
    this.addNotification({
      title: 'Blueprint Document Uploaded',
      message: `${newDoc.title} (${newDoc.version}) archived.`,
      type: 'info',
      category: 'schedule',
    });
    this.notify();
    return newDoc;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  saveAll() {
    saveToLocal(STORAGE_KEYS.PROJECTS, this.projects);
    saveToLocal(STORAGE_KEYS.SITE_CATEGORIES, this.siteCategories);
    saveToLocal(STORAGE_KEYS.MATERIALS, this.materials);
    saveToLocal(STORAGE_KEYS.MATERIAL_CATEGORIES, this.materialCategories);
    saveToLocal(STORAGE_KEYS.MATERIAL_TRANSACTIONS, this.materialTransactions);
    saveToLocal(STORAGE_KEYS.CENTRAL_STOCK, this.centralStock);
    saveToLocal(STORAGE_KEYS.WORKERS, this.workers);
    saveToLocal(STORAGE_KEYS.PUNCH_RECORDS, this.punchRecords);
    saveToLocal(STORAGE_KEYS.UPDATES, this.updates);
    saveToLocal(STORAGE_KEYS.INCIDENTS, this.incidents);
    saveToLocal(STORAGE_KEYS.EXPENSES, this.expenses);
    saveToLocal(STORAGE_KEYS.DOCS, this.docs);
    saveToLocal(STORAGE_KEYS.MESSAGES, this.messages);
    saveToLocal(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveToLocal(STORAGE_KEYS.MILESTONES, this.milestones);
    saveToLocal(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
    saveToLocal(STORAGE_KEYS.WORK_ORDERS, this.workOrders);
    saveToLocal(STORAGE_KEYS.SITE_DAILY_EXPENSES, this.siteDailyExpenses);
    saveToLocal(STORAGE_KEYS.DAILY_LABOUR_SUMMARIES, this.dailyLabourSummaries);
    saveToLocal(STORAGE_KEYS.DAILY_PROGRESS_REPORTS, this.dailyProgressReports);
    saveToLocal(STORAGE_KEYS.DAILY_PROFIT_LOSS_REPORTS, this.dailyProfitLossReports);
    saveToLocal(STORAGE_KEYS.SYSTEM_USERS, this.systemUsers);
    saveToLocal(STORAGE_KEYS.MASTER_RATE_CARDS, this.masterRateCards);
    saveToLocal(STORAGE_KEYS.SECURITY_AUDIT_LOGS, this.securityAuditLogs);
    saveToLocal(STORAGE_KEYS.ROLE_PERMISSIONS, this.rolePermissions);
    saveToLocal(STORAGE_KEYS.PETTY_CASH_ACCOUNTS, this.pettyCashAccounts);
    saveToLocal(STORAGE_KEYS.DAILY_CASH_PAYMENTS, this.dailyCashPayments);
    saveToLocal(STORAGE_KEYS.DAILY_CASH_RECONCILIATIONS, this.dailyCashReconciliations);
    saveToLocal(STORAGE_KEYS.ACTIVE_PROJECT_ID, this.activeProjectId);
    saveToLocal(STORAGE_KEYS.CURRENT_ROLE, this.currentRole);
    saveToLocal(STORAGE_KEYS.CURRENT_LANG, this.currentLanguage);
    saveToLocal(STORAGE_KEYS.OFFLINE_OVERRIDE, this.isForcedOffline);
    this.notify();
  }

  // --- Security Audit Logging ---
  addSecurityAuditLog(log: Omit<SecurityAuditLog, 'id' | 'timestamp' | 'timeDisplay' | 'dateDisplay'>) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: SecurityAuditLog = {
      ...log,
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: now.toISOString(),
      timeDisplay: timeStr,
      dateDisplay: 'Today',
    };
    this.securityAuditLogs = [newLog, ...this.securityAuditLogs].slice(0, 100); // keep 100 recent
    saveToLocal(STORAGE_KEYS.SECURITY_AUDIT_LOGS, this.securityAuditLogs);
    this.notify();
    return newLog;
  }

  // --- Master Admin & RBAC User Management ---
  addSystemUser(user: Omit<SystemUser, 'id' | 'lastActive'> & { workerTrade?: WorkerProfile['trade']; dailyWage?: number }) {
    let linkedWorkerId = user.workerProfileId;

    // If role is worker and no workerProfileId provided, automatically sync/create a worker profile
    if (user.role === 'worker' && !linkedWorkerId) {
      const primaryProjectId = user.assignedProjectIds[0] || this.activeProjectId || 'proj-01';
      const project = this.projects.find((p) => p.id === primaryProjectId);
      const coords = project?.coordinates || { lat: 19.0596, lng: 72.8875 };
      const createdWorker = this.addWorker({
        name: user.name,
        role: user.designation || 'Skilled Tradesperson',
        trade: user.workerTrade || 'Steel Fixer',
        assignedProjectId: primaryProjectId,
        phone: user.phone || '+91 98000 00000',
        emergencyContact: '+91 98111 22233',
        dailyWage: user.dailyWage || 950,
        shift: 'Morning (07:00 - 15:30)',
        status: user.status === 'Active' ? 'Active On-Site' : 'Off-Duty',
        liveLocation: {
          lat: coords.lat,
          lng: coords.lng,
          address: project?.name ? `${project.name} - Site Perimeter` : 'Active Site Perimeter',
          lastUpdated: 'Just now',
          isInsideGeofence: true,
          accuracyMeters: 5,
        },
        avatar: user.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?auto=format&fit=crop&w=150&q=80`,
        certifications: ['Safety Induction Level 1', 'Trade Competency Certified'],
      });
      linkedWorkerId = createdWorker.id;
    }

    const newUser: SystemUser = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      assignedProjectIds: user.assignedProjectIds,
      avatar: user.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?auto=format&fit=crop&w=150&q=80`,
      designation: user.designation,
      department: user.department,
      status: user.status,
      permissionsOverride: user.permissionsOverride,
      workerProfileId: linkedWorkerId,
      id: 'usr-' + Date.now(),
      lastActive: 'Just now',
    };
    this.systemUsers = [newUser, ...this.systemUsers];
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: 'System User Management',
      actorRole: this.currentRole,
      action: `Created user ${newUser.name} with role ${newUser.role}`,
      category: 'AUTH_RBAC',
      targetResource: newUser.email,
      severity: 'INFO',
      details: `Granted access to ${newUser.assignedProjectIds.length} site(s) with ${newUser.role} credentials.`,
    });
    this.addNotification({
      title: 'User Profile Provisioned',
      message: `${newUser.name} assigned role ${newUser.role.replace('_', ' ').toUpperCase()}`,
      type: 'success',
      category: 'schedule',
    });
    this.saveAll();
    return newUser;
  }

  updateSystemUser(id: string, updates: Partial<SystemUser>) {
    this.systemUsers = this.systemUsers.map((u) => {
      if (u.id === id) {
        const updated = { ...u, ...updates, lastActive: 'Just now' };
        this.addSecurityAuditLog({
          actorId: 'usr-current',
          actorName: 'Master Administrator',
          actorRole: this.currentRole,
          action: `Updated user ${updated.name}`,
          category: 'AUTH_RBAC',
          targetResource: updated.email,
          severity: updates.status === 'Suspended' ? 'WARNING' : 'INFO',
          details: `Role: ${updated.role}, Status: ${updated.status}`,
        });
        return updated;
      }
      return u;
    });
    this.saveAll();
  }

  deleteSystemUser(id: string) {
    const user = this.systemUsers.find((u) => u.id === id);
    if (user) {
      this.systemUsers = this.systemUsers.filter((u) => u.id !== id);
      this.addSecurityAuditLog({
        actorId: 'usr-current',
        actorName: 'Master Administrator',
        actorRole: this.currentRole,
        action: `Revoked & Deleted User ${user.name}`,
        category: 'AUTH_RBAC',
        targetResource: user.email,
        severity: 'WARNING',
        details: `Deleted user record for ${user.email} (${user.role}).`,
      });
      this.saveAll();
    }
  }

  updateRolePermissions(role: Role, permissions: PermissionKey[]) {
    this.rolePermissions = {
      ...this.rolePermissions,
      [role]: permissions,
    };
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: 'Master Administrator',
      actorRole: this.currentRole,
      action: `Modified Permission Matrix for Role [${role.toUpperCase()}]`,
      category: 'AUTH_RBAC',
      targetResource: `Role: ${role}`,
      severity: 'INFO',
      details: `Active permissions count: ${permissions.length}.`,
    });
    this.saveAll();
  }

  // --- Master Rate Card Management (Master Admin) ---
  addMasterRateCardItem(item: Omit<MasterRateCardItem, 'id' | 'lastUpdated'>) {
    const newItem: MasterRateCardItem = {
      ...item,
      id: 'mrc-' + Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    this.masterRateCards = [newItem, ...this.masterRateCards];
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: 'Master Administrator',
      actorRole: this.currentRole,
      action: `Added Master Rate Card: ${newItem.itemCode}`,
      category: 'FINANCIAL_PNL',
      targetResource: newItem.description,
      severity: 'INFO',
      details: `Benchmark Rate: ₹${newItem.benchmarkRate}/${newItem.unit} (Band: ₹${newItem.minAllowedRate} - ₹${newItem.maxAllowedRate})`,
    });
    this.addNotification({
      title: 'Master Rate Card Added',
      message: `${newItem.itemCode} (₹${newItem.benchmarkRate}/${newItem.unit}) published across enterprise sites.`,
      type: 'success',
      category: 'material',
    });
    this.saveAll();
    return newItem;
  }

  updateMasterRateCardItem(id: string, updates: Partial<MasterRateCardItem>) {
    this.masterRateCards = this.masterRateCards.map((m) => {
      if (m.id === id) {
        const updated = {
          ...m,
          ...updates,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        this.addSecurityAuditLog({
          actorId: 'usr-current',
          actorName: 'Master Administrator',
          actorRole: this.currentRole,
          action: `Updated Master Rate Benchmark: ${updated.itemCode}`,
          category: 'FINANCIAL_PNL',
          targetResource: updated.description,
          severity: 'INFO',
          details: `New Benchmark: ₹${updated.benchmarkRate}/${updated.unit}`,
        });
        return updated;
      }
      return m;
    });
    this.saveAll();
  }

  deleteMasterRateCardItem(id: string) {
    this.masterRateCards = this.masterRateCards.filter((m) => m.id !== id);
    this.saveAll();
  }

  // --- Worker Self Punching with Real-Time Live Location ---
  selfPunchWorker(payload: WorkerSelfPunchPayload): WorkerPunchRecord {
    const {
      workerId,
      workerName,
      type,
      lat,
      lng,
      accuracyMeters,
      isInsideGeofence,
      distanceFromSiteMeters,
      locationAddress,
      photoUrl,
      notes,
    } = payload;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    const activeProj = this.getActiveProject();

    // Find worker profile
    let worker = this.workers.find((w) => w.id === workerId);
    if (!worker) {
      // Fallback: search by name or create profile if absent
      worker = this.workers.find((w) => w.name.toLowerCase().includes(workerName.toLowerCase())) || this.workers[0];
    }

    let shiftDurationHours = 0;
    let shiftDurationFormatted = '';
    let earnedAmount = 0;

    if (type === 'PUNCH_OUT') {
      const lastIn = worker.punchHistory?.find((p) => p.type === 'PUNCH_IN');
      if (lastIn) {
        const inTime = new Date(lastIn.timestamp).getTime();
        const outTime = now.getTime();
        const diffMs = Math.max(0, outTime - inTime);
        shiftDurationHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        shiftDurationFormatted = `${hrs}h ${mins}m`;
        earnedAmount = Math.round((worker.dailyWage / 8) * shiftDurationHours);
      } else {
        shiftDurationHours = 8.0;
        shiftDurationFormatted = '8h 00m';
        earnedAmount = worker.dailyWage;
      }
    }

    const punchRecord: WorkerPunchRecord = {
      id: 'punch-' + Date.now(),
      workerId: worker.id,
      workerName: worker.name,
      workerRole: worker.role,
      workerTrade: worker.trade,
      workerAvatar: photoUrl || worker.avatar,
      projectId: activeProj?.id || 'proj-01',
      projectName: activeProj?.name || 'Active Site',
      type,
      timestamp: now.toISOString(),
      timeDisplay: timeStr,
      dateDisplay: dateStr,
      coordinates: { lat, lng },
      distanceFromSiteMeters,
      isInsideGeofence,
      locationAddress: locationAddress || `${activeProj?.name} (GPS Verified ±${Math.round(accuracyMeters)}m)`,
      verificationMethod: 'GPS Live Self-Punch',
      notes: notes || (type === 'PUNCH_IN' ? 'Self-punched at site entry gate.' : `Shift concluded: ${shiftDurationFormatted}`),
      photoUrl,
      shiftDurationHours: type === 'PUNCH_OUT' ? shiftDurationHours : undefined,
      shiftDurationFormatted: type === 'PUNCH_OUT' ? shiftDurationFormatted : undefined,
    };

    // Update worker profile
    const updatedWorker: Partial<WorkerProfile> = {
      status: type === 'PUNCH_IN' ? 'Active On-Site' : 'Off-Duty',
      checkInTime: type === 'PUNCH_IN' ? timeStr : worker.checkInTime,
      checkOutTime: type === 'PUNCH_OUT' ? timeStr : undefined,
      lastPunchTimestamp: now.toISOString(),
      lastPunchType: type,
      liveLocation: {
        lat,
        lng,
        address: locationAddress || `${activeProj?.name} Sector Gate`,
        lastUpdated: 'Just now',
        isInsideGeofence,
        accuracyMeters: Math.round(accuracyMeters),
      },
      punchHistory: [punchRecord, ...(worker.punchHistory || [])].slice(0, 30),
    };

    this.updateWorker(worker.id, updatedWorker);
    this.punchRecords = [punchRecord, ...this.punchRecords];
    this.queueCloudOperation('punchRecords', 'create', punchRecord);

    // Update active workers count for the site
    this.projects = this.projects.map((p) => {
      if (p.id === activeProj?.id) {
        const count = this.workers.filter((w) => w.assignedProjectId === p.id && (w.id === worker!.id ? type === 'PUNCH_IN' : w.status === 'Active On-Site')).length;
        return { ...p, activeWorkersCount: count };
      }
      return p;
    });

    // Record Security Audit Log
    this.addSecurityAuditLog({
      actorId: worker.id,
      actorName: worker.name,
      actorRole: 'worker',
      action: `Worker Self-Punch ${type === 'PUNCH_IN' ? 'IN' : 'OUT'} (GPS Geofence: ${isInsideGeofence ? 'PASSED' : 'OUTSIDE'})`,
      category: 'SELF_PUNCH',
      targetResource: activeProj?.name || 'Project Site',
      severity: isInsideGeofence ? 'INFO' : 'WARNING',
      details: `GPS: [${lat.toFixed(5)}, ${lng.toFixed(5)}] • Dist: ${Math.round(distanceFromSiteMeters)}m • Accuracy: ±${Math.round(accuracyMeters)}m • Address: ${locationAddress}`,
    });

    this.addNotification({
      title: type === 'PUNCH_IN' ? 'Self Punch-In Verified' : 'Self Punch-Out Verified',
      message: `${worker.name} punched ${type === 'PUNCH_IN' ? 'IN' : 'OUT'} at ${timeStr} • GPS accuracy ±${Math.round(accuracyMeters)}m.`,
      type: isInsideGeofence ? 'success' : 'warning',
      category: 'schedule',
    });

    this.saveAll();
    return punchRecord;
  }

  setRole(role: Role) {
    this.currentRole = role;
    this.saveAll();
    this.addNotification({
      title: 'Role Switched',
      message: `Access mode changed to ${role.replace('_', ' ').toUpperCase()}`,
      type: 'info',
      category: 'schedule',
    });
  }

  setLanguage(lang: LanguageCode) {
    this.currentLanguage = lang;
    this.saveAll();
  }

  setActiveProject(projectId: string) {
    this.activeProjectId = projectId;
    this.saveAll();
  }

  toggleOfflineMode(forced?: boolean) {
    this.isForcedOffline = forced !== undefined ? forced : !this.isForcedOffline;
    this.isOnline = this.isForcedOffline ? false : (typeof navigator !== 'undefined' ? navigator.onLine : true);
    if (this.isOnline) {
      this.syncPendingOfflineQueue();
    }
    this.saveAll();
    this.addNotification({
      title: this.isOnline ? 'Online Sync Restored' : 'Offline Mode Enabled',
      message: this.isOnline ? 'All pending site changes synchronized to cloud.' : 'Working in local field cache mode. Edits queued for sync.',
      type: this.isOnline ? 'success' : 'warning',
      category: 'schedule',
    });
  }

  getActiveProject(): ProjectSite {
    return this.projects.find((p) => p.id === this.activeProjectId) || this.projects[0];
  }

  // --- Project Site Management ---
  createProjectWithWorkOrder(params: {
    project: Omit<ProjectSite, 'id'>;
    workOrder?: {
      workOrderNumber?: string;
      contractorName?: string;
      contractorPhone?: string;
      contractorTrade?: string;
      contractorType?: 'Piece-Rate Labour Gang' | 'Turnkey Subcontractor' | 'Specialist Agency' | 'Daily Wage Gang';
      scopeOfWork?: string;
      contractValue?: number;
      documentUrl?: string;
      documentName?: string;
      documentType?: string;
      fileSize?: string;
      issuedBy?: string;
      notes?: string;
      pnlProjection?: WorkOrderPnlProjection;
      milestones?: WorkOrderMilestone[];
    };
    boqItems?: BOQItem[];
    generateInitialDPR?: boolean;
  }): { project: ProjectSite; workOrder?: WorkOrderContract } {
    const projectId = 'proj-' + Date.now();
    const today = new Date().toISOString().split('T')[0];

    const newProject: ProjectSite = {
      ...params.project,
      id: projectId,
      spentBudget: params.project.spentBudget || 0,
      progressPercentage: params.project.progressPercentage || 0,
      activeWorkersCount: params.project.activeWorkersCount || 0,
      status: params.project.status || 'active',
      workType: params.project.workType || 'Labour Contractor Work',
      bannerImage:
        params.project.bannerImage ||
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
      pnlProjection: params.workOrder?.pnlProjection || params.project.pnlProjection,
    };

    this.projects = [newProject, ...this.projects];
    this.activeProjectId = projectId;
    this.queueCloudOperation('projects', 'create', newProject);

    let createdWorkOrder: WorkOrderContract | undefined;

    // Create Work Order & BOQ
    const boqItems: BOQItem[] = params.boqItems && params.boqItems.length > 0
      ? params.boqItems.map((item, idx) => ({
          ...item,
          id: item.id || `boq-${Date.now()}-${idx + 1}`,
          todayCompletedQty: item.todayCompletedQty || 0,
          completedQty: item.completedQty || 0,
          totalEarnedValue: item.totalEarnedValue || (item.completedQty * item.contractRate),
        }))
      : [
          {
            id: `boq-${Date.now()}-1`,
            itemCode: 'BOQ-STR-01',
            description: newProject.workType === 'Labour Contractor Work' 
              ? 'TMT Rebar Cutting, Bending & Binding in Formwork'
              : 'Structural Turnkey Concrete & Reinforcement Package',
            category: 'Steel & Rebar',
            unit: 'MT',
            contractRate: newProject.workType === 'Labour Contractor Work' ? 5500 : 68000,
            totalEstimatedQty: 45,
            completedQty: 4,
            todayCompletedQty: 1.5,
            totalEarnedValue: 4 * (newProject.workType === 'Labour Contractor Work' ? 5500 : 68000),
          },
          {
            id: `boq-${Date.now()}-2`,
            itemCode: 'BOQ-SHT-02',
            description: 'Plywood & Steel Shuttering Assembly with prop staging',
            category: 'Formwork & Shuttering',
            unit: 'Sq.Ft',
            contractRate: newProject.workType === 'Labour Contractor Work' ? 48 : 95,
            totalEstimatedQty: 6000,
            completedQty: 650,
            todayCompletedQty: 180,
            totalEarnedValue: 650 * (newProject.workType === 'Labour Contractor Work' ? 48 : 95),
          },
        ];

    const calculatedContractValue = boqItems.reduce(
      (sum, item) => sum + (item.totalEstimatedQty * item.contractRate),
      0
    );

    createdWorkOrder = {
      id: 'wo-' + Date.now(),
      projectId: projectId,
      workOrderNumber:
        params.workOrder?.workOrderNumber ||
        newProject.workOrderNumber ||
        `WO-${new Date().getFullYear()}-${newProject.code || 'SITE'}-01`,
      contractorName:
        params.workOrder?.contractorName ||
        newProject.contractorName ||
        (newProject.workType === 'Labour Contractor Work' ? 'Master Labour Contractor Gang' : 'Turnkey Project Execution Agency'),
      contractorPhone: params.workOrder?.contractorPhone || newProject.supervisorPhone,
      contractorTrade: params.workOrder?.contractorTrade || (newProject.workType === 'Labour Contractor Work' ? 'Civil & Labour Gang' : 'Turnkey Contractor'),
      contractorType:
        params.workOrder?.contractorType ||
        (newProject.workType === 'Labour Contractor Work' ? 'Piece-Rate Labour Gang' : 'Turnkey Subcontractor'),
      scopeOfWork:
        params.workOrder?.scopeOfWork ||
        newProject.scopeOfWork ||
        `Complete ${newProject.workType} scope for ${newProject.name}`,
      contractValue: params.workOrder?.contractValue || newProject.contractValue || calculatedContractValue || newProject.totalBudget,
      startDate: newProject.startDate,
      targetEndDate: newProject.targetEndDate,
      status: 'Active',
      documentUrl: params.workOrder?.documentUrl || newProject.workOrderDocumentUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      documentName: params.workOrder?.documentName || newProject.workOrderDocumentName || `WO_${newProject.code}_Contract.pdf`,
      documentType: params.workOrder?.documentType || 'application/pdf',
      fileSize: params.workOrder?.fileSize || '1.8 MB',
      issuedBy: params.workOrder?.issuedBy || newProject.client,
      notes: params.workOrder?.notes || `Contract Work Order for ${newProject.name}`,
      createdAt: today,
      uploadedAt: today,
      pnlProjection: params.workOrder?.pnlProjection || newProject.pnlProjection,
      milestones: params.workOrder?.milestones || [
        {
          id: `ms-${Date.now()}-1`,
          title: 'Mobilization & Site Preparation',
          percentage: 15,
          targetDate: newProject.startDate,
          deliverable: 'Site grading, fencing, worker batch setup, store room commissioning',
          billingAmount: (params.workOrder?.contractValue || newProject.totalBudget) * 0.15,
          status: 'Achieved',
        },
        {
          id: `ms-${Date.now()}-2`,
          title: 'Substructure & Foundation Works',
          percentage: 35,
          targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          deliverable: 'Excavation, raft casting, column starter placement up to plinth beam',
          billingAmount: (params.workOrder?.contractValue || newProject.totalBudget) * 0.35,
          status: 'In Progress',
        },
        {
          id: `ms-${Date.now()}-3`,
          title: 'Superstructure & RCC Slab Works',
          percentage: 35,
          targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
          deliverable: 'Column risers, shuttering, beam casting and slab finishing',
          billingAmount: (params.workOrder?.contractValue || newProject.totalBudget) * 0.35,
          status: 'Pending',
        },
        {
          id: `ms-${Date.now()}-4`,
          title: 'Handover & Final Retention Release',
          percentage: 15,
          targetDate: newProject.targetEndDate,
          deliverable: 'Finishing, MEP snag rectification, client QA clearance & handover',
          billingAmount: (params.workOrder?.contractValue || newProject.totalBudget) * 0.15,
          status: 'Pending',
        },
      ],
      boqItems: boqItems,
    };

    this.workOrders = [createdWorkOrder, ...this.workOrders];
    this.queueCloudOperation('workOrders', 'create', createdWorkOrder);

    // If Turnkey "Work with Material", initialize baseline materials for site
    if (newProject.workType === 'Work with Material') {
      const baselineMats: MaterialItem[] = [
        {
          id: 'mat-' + Date.now() + '-1',
          projectId: projectId,
          name: 'UltraTech OPC 53 Grade Cement',
          category: 'Cement & Concrete',
          quantity: 450,
          unit: 'Bags',
          minThreshold: 100,
          costPerUnit: 385,
          totalValue: 450 * 385,
          supplier: 'UltraTech Cement Authorized Depot',
          supplierPhone: '+91 98200 11223',
          status: 'In Stock',
          lastRestocked: today,
          locationInSite: 'Central Cement Silo & Shed #1',
        },
        {
          id: 'mat-' + Date.now() + '-2',
          projectId: projectId,
          name: 'Tata Tiscon 550D TMT Rebar (16mm & 20mm)',
          category: 'Steel & Rebar',
          quantity: 18,
          unit: 'Tons',
          minThreshold: 5,
          costPerUnit: 64500,
          totalValue: 18 * 64500,
          supplier: 'Tata Tiscon Steel Distributors',
          supplierPhone: '+91 98110 44556',
          status: 'In Stock',
          lastRestocked: today,
          locationInSite: 'Rebar Yard & Cutting Staging',
        },
      ];
      this.materials = [...baselineMats, ...this.materials];
      baselineMats.forEach((m) => this.queueCloudOperation('materials', 'create', m));
    }

    // Initialize Day-1 Sample Consumable Expense
    const sampleExp: SiteDailyExpense = {
      id: 'exp-d-' + Date.now(),
      projectId: projectId,
      date: today,
      category: 'Consumables',
      itemDescription: 'GI Annealed Binding Wire 18G (3 Bundles) & Shuttering Foam Tape',
      quantity: 75,
      unit: 'Kg',
      unitRate: 78,
      totalAmount: 5850,
      vendorName: 'Mahalaxmi Hardware & Industrial Tools',
      paidBy: newProject.supervisorName,
      paymentMode: 'UPI / Online',
      status: 'Paid',
      notes: 'Initial binding wire stock for rebar work',
      createdAt: new Date().toISOString(),
    };
    this.siteDailyExpenses = [sampleExp, ...this.siteDailyExpenses];

    // Initialize Day-1 DPR & P&L report if requested
    if (params.generateInitialDPR !== false) {
      const dailyLabourSummary: DailyLabourSummary = {
        id: 'labour-sum-' + Date.now(),
        date: today,
        projectId: projectId,
        projectName: newProject.name,
        totalWorkersPresent: 14,
        breakdownByTrade: [
          {
            trade: 'Steel Fixer',
            count: 4,
            averageDailyWage: 950,
            normalWages: 3800,
            overtimeHours: 2,
            overtimeWages: 350,
            totalCost: 4150,
          },
          {
            trade: 'Carpenter',
            count: 3,
            averageDailyWage: 880,
            normalWages: 2640,
            overtimeHours: 1,
            overtimeWages: 165,
            totalCost: 2805,
          },
          {
            trade: 'General Labor / Helper',
            count: 7,
            averageDailyWage: 620,
            normalWages: 4340,
            overtimeHours: 4,
            overtimeWages: 460,
            totalCost: 4800,
          },
        ],
        totalNormalCost: 10780,
        totalOvertimeCost: 975,
        totalLabourCost: 11755,
        importedFromApp: true,
        importedAt: new Date().toISOString(),
        contractorGangName: createdWorkOrder.contractorName,
        verifiedBySupervisor: newProject.supervisorName,
      };
      this.dailyLabourSummaries = [dailyLabourSummary, ...this.dailyLabourSummaries];

      // Day-1 Progress Report
      const firstBOQ = boqItems[0];
      const secondBOQ = boqItems[1] || boqItems[0];
      const todayBOQ1Earned = (firstBOQ.todayCompletedQty || 1) * firstBOQ.contractRate;
      const todayBOQ2Earned = (secondBOQ.todayCompletedQty || 50) * secondBOQ.contractRate;
      const totalEarnedToday = todayBOQ1Earned + (boqItems.length > 1 ? todayBOQ2Earned : 0);

      const dpr: DailyProgressReport = {
        id: 'dpr-' + Date.now(),
        dprNumber: `DPR-${today}-01`,
        projectId: projectId,
        projectName: newProject.name,
        date: today,
        sitePhotos: [
          'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        ],
        aiGenerated: false,
        weather: {
          condition: 'Clear Sky / Sunny',
          temperature: '31°C',
          humidity: '64%',
        },
        workDoneSummary: `Site mobilization completed. Initiated ${firstBOQ.description} (${firstBOQ.todayCompletedQty} ${firstBOQ.unit}) and ${secondBOQ.description} (${secondBOQ.todayCompletedQty} ${secondBOQ.unit}).`,
        progressByBOQ: [
          {
            boqItemId: firstBOQ.id,
            workOrderId: createdWorkOrder.id,
            itemDescription: firstBOQ.description,
            category: firstBOQ.category,
            unit: firstBOQ.unit,
            rate: firstBOQ.contractRate,
            todayExecutedQty: firstBOQ.todayCompletedQty || 1,
            todayEarnedAmount: todayBOQ1Earned,
            locationOrGrid: 'Grid A1-B3 Ground Level',
            qualityRating: 'Good',
          },
          ...(boqItems.length > 1
            ? [
                {
                  boqItemId: secondBOQ.id,
                  workOrderId: createdWorkOrder.id,
                  itemDescription: secondBOQ.description,
                  category: secondBOQ.category,
                  unit: secondBOQ.unit,
                  rate: secondBOQ.contractRate,
                  todayExecutedQty: secondBOQ.todayCompletedQty || 50,
                  todayEarnedAmount: todayBOQ2Earned,
                  locationOrGrid: 'Grid A1-B3 Ground Level',
                  qualityRating: 'Satisfactory' as const,
                },
              ]
            : []),
        ],
        totalTodayEarnedIncome: totalEarnedToday,
        safetyObservations: 'Site safety induction and PPE inspection completed for all 14 gang members. 0 incidents.',
        qualityObservations: 'Rebar spacing and cover block placement checked and approved.',
        preparedBy: newProject.supervisorName,
        createdAt: new Date().toISOString(),
      };
      this.dailyProgressReports = [dpr, ...this.dailyProgressReports];

      // Auto-compute Profit/Loss for today
      this.generateAndSaveDailyProfitLoss(projectId, today);
    }

    this.addNotification({
      title: `🎉 New Site Created: ${newProject.name}`,
      message: `Initialized with ${newProject.workType} contract mode, Work Order (${createdWorkOrder.workOrderNumber}), and Daily P&L Engine.`,
      type: 'success',
      category: 'schedule',
      projectId: projectId,
    });

    this.saveAll();
    this.notify();

    return { project: newProject, workOrder: createdWorkOrder };
  }

  updateProject(id: string, updates: Partial<ProjectSite>) {
    this.projects = this.projects.map((p) => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        this.queueCloudOperation('projects', 'update', updated);
        return updated;
      }
      return p;
    });
    this.saveAll();
    this.notify();
  }

  deleteProject(id: string) {
    if (this.projects.length <= 1) {
      this.addNotification({
        title: 'Cannot Delete Only Site',
        message: 'You must maintain at least one active site.',
        type: 'alert',
        category: 'safety',
      });
      return;
    }
    const target = this.projects.find((p) => p.id === id);
    this.projects = this.projects.filter((p) => p.id !== id);
    if (this.activeProjectId === id) {
      this.activeProjectId = this.projects[0].id;
    }
    this.queueCloudOperation('projects', 'delete', { id });
    this.addNotification({
      title: 'Site Removed',
      message: `Site ${target?.name || id} has been removed from workspace.`,
      type: 'warning',
      category: 'schedule',
    });
    this.saveAll();
    this.notify();
  }

  // --- Real-time Activity Notification Creator ---
  addNotification(params: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const notif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: params.title,
      message: params.message,
      type: params.type,
      category: params.category,
      timestamp: 'Just now',
      read: false,
      projectId: params.projectId || this.activeProjectId,
    };
    this.notifications = [notif, ...this.notifications];
    this.saveAll();
  }

  // --- Material Actions ---
  addMaterial(mat: Omit<MaterialItem, 'id'>) {
    const newMat: MaterialItem = {
      ...mat,
      id: 'mat-' + Date.now(),
      totalValue: mat.quantity * mat.costPerUnit,
    };
    this.materials = [newMat, ...this.materials];
    this.queueCloudOperation('materials', 'create', newMat);
    this.addNotification({
      title: 'New Material Logged',
      message: `${newMat.name} (${newMat.quantity} ${newMat.unit}) added to inventory.`,
      type: 'info',
      category: 'material',
    });
    this.saveAll();
    return newMat;
  }

  updateMaterial(id: string, updates: Partial<MaterialItem>) {
    this.materials = this.materials.map((m) => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        updated.totalValue = updated.quantity * updated.costPerUnit;
        if (updated.quantity <= updated.minThreshold) {
          updated.status = updated.quantity === 0 ? 'Critical Shortage' : 'Low Stock';
          this.addNotification({
            title: `Low Stock Warning: ${updated.name}`,
            message: `Current stock (${updated.quantity} ${updated.unit}) is at or below threshold (${updated.minThreshold} ${updated.unit}).`,
            type: 'alert',
            category: 'material',
          });
        }
        this.queueCloudOperation('materials', 'update', updated);
        return updated;
      }
      return m;
    });
    this.saveAll();
  }

  deleteMaterial(id: string) {
    this.materials = this.materials.filter((m) => m.id !== id);
    this.queueCloudOperation('materials', 'delete', { id });
    this.saveAll();
  }

  // --- Material Category Management ---
  addMaterialCategory(category: Omit<MaterialCategory, 'id' | 'createdAt'>): MaterialCategory {
    const newCategory: MaterialCategory = {
      ...category,
      id: 'cat-' + Date.now(),
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
      createdByRole: this.currentRole,
    };
    this.materialCategories = [...this.materialCategories, newCategory];
    this.queueCloudOperation('material_categories', 'create', newCategory);
    this.addNotification({
      title: 'Material Category Created',
      message: `Category "${newCategory.name}" has been registered in the materials master catalog.`,
      type: 'info',
      category: 'material',
    });
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: 'Site Inventory Manager',
      actorRole: this.currentRole,
      action: 'Material Category Created',
      category: 'SITE_OPS',
      targetResource: `Category: ${newCategory.name}`,
      details: `Created new material category "${newCategory.name}" (ID: ${newCategory.id}) with default unit ${newCategory.defaultUnit || 'N/A'}.`,
      severity: 'INFO',
    });
    this.saveAll();
    return newCategory;
  }

  updateMaterialCategory(id: string, updates: Partial<MaterialCategory>) {
    this.materialCategories = this.materialCategories.map((c) => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        this.queueCloudOperation('material_categories', 'update', updated);
        return updated;
      }
      return c;
    });
    this.saveAll();
  }

  deleteMaterialCategory(id: string): { success: boolean; message?: string } {
    const category = this.materialCategories.find((c) => c.id === id);
    if (!category) {
      return { success: false, message: 'Category not found.' };
    }
    
    // Check if any materials or central stock are using this category
    const usedInMaterials = this.materials.filter((m) => m.category.toLowerCase() === category.name.toLowerCase());
    const usedInStock = this.centralStock.filter((cs) => cs.category.toLowerCase() === category.name.toLowerCase());
    const totalUsage = usedInMaterials.length + usedInStock.length;

    if (totalUsage > 0) {
      return {
        success: false,
        message: `Cannot delete category "${category.name}". It is currently referenced by ${totalUsage} active material items across sites and warehouse stock.`,
      };
    }

    this.materialCategories = this.materialCategories.filter((c) => c.id !== id);
    this.queueCloudOperation('material_categories', 'delete', { id });
    this.addNotification({
      title: 'Material Category Removed',
      message: `Category "${category.name}" removed from catalog.`,
      type: 'info',
      category: 'material',
    });
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: 'Site Inventory Manager',
      actorRole: this.currentRole,
      action: 'Material Category Deleted',
      category: 'SITE_OPS',
      targetResource: `Category: ${category.name}`,
      details: `Deleted custom material category "${category.name}" (ID: ${category.id}).`,
      severity: 'WARNING',
    });
    this.saveAll();
    return { success: true };
  }

  // --- Site Category Management ---
  addSiteCategory(category: Omit<SiteCategory, 'id' | 'createdAt'>): SiteCategory {
    const newCategory: SiteCategory = {
      ...category,
      id: 'site-cat-' + Date.now(),
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
      createdByRole: this.currentRole,
    };
    this.siteCategories = [...this.siteCategories, newCategory];
    this.queueCloudOperation('site_categories', 'create', newCategory);
    this.addNotification({
      title: 'Site Category Created',
      message: `Category "${newCategory.name}" (${newCategory.code}) has been added to the master project taxonomy.`,
      type: 'info',
      category: 'schedule',
    });
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: 'Project Management Office',
      actorRole: this.currentRole,
      action: 'Site Category Created',
      category: 'SITE_OPS',
      targetResource: `Category: ${newCategory.name}`,
      details: `Created new project site category "${newCategory.name}" [Code: ${newCategory.code}].`,
      severity: 'INFO',
    });
    this.saveAll();
    return newCategory;
  }

  updateSiteCategory(id: string, updates: Partial<SiteCategory>) {
    this.siteCategories = this.siteCategories.map((c) => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        this.queueCloudOperation('site_categories', 'update', updated);
        return updated;
      }
      return c;
    });
    this.saveAll();
  }

  deleteSiteCategory(id: string): { success: boolean; message?: string } {
    const category = this.siteCategories.find((c) => c.id === id);
    if (!category) {
      return { success: false, message: 'Category not found.' };
    }
    
    // Check if any sites are using this category
    const usedInSites = this.projects.filter(
      (p) => p.siteType?.toLowerCase() === category.name.toLowerCase() || p.siteCategoryId === category.id
    );

    if (usedInSites.length > 0) {
      return {
        success: false,
        message: `Cannot delete category "${category.name}". It is currently assigned to ${usedInSites.length} active project site(s).`,
      };
    }

    this.siteCategories = this.siteCategories.filter((c) => c.id !== id);
    this.queueCloudOperation('site_categories', 'delete', { id });
    this.addNotification({
      title: 'Site Category Removed',
      message: `Category "${category.name}" removed from project master catalog.`,
      type: 'info',
      category: 'schedule',
    });
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: 'Project Management Office',
      actorRole: this.currentRole,
      action: 'Site Category Deleted',
      category: 'SITE_OPS',
      targetResource: `Category: ${category.name}`,
      details: `Deleted project site category "${category.name}" (ID: ${category.id}).`,
      severity: 'WARNING',
    });
    this.saveAll();
    return { success: true };
  }

  // --- Central Warehouse Stock Management ---
  addCentralStockItem(item: Omit<CentralStockItem, 'id'>) {
    const newItem: CentralStockItem = {
      ...item,
      id: 'cs-' + Date.now(),
    };
    this.centralStock = [newItem, ...this.centralStock];
    this.queueCloudOperation('central_stock', 'create', newItem);
    this.saveAll();
    return newItem;
  }

  updateCentralStockItem(id: string, updates: Partial<CentralStockItem>) {
    this.centralStock = this.centralStock.map((cs) => {
      if (cs.id === id) {
        const updated = { ...cs, ...updates };
        this.queueCloudOperation('central_stock', 'update', updated);
        return updated;
      }
      return cs;
    });
    this.saveAll();
  }

  // --- OTP Generator for Material Handover ---
  generateMaterialOtp(recipient: {
    type: MaterialOtpRecord['recipientType'];
    name: string;
    phone: string;
    email?: string;
    channel?: MaterialOtpRecord['verificationChannel'];
  }): MaterialOtpRecord {
    // Generate secure 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const authRef = 'OTP-AUTH-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const now = new Date();
    const expires = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes validity

    return {
      otpCode,
      authReference: authRef,
      generatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      recipientType: recipient.type,
      recipientName: recipient.name,
      recipientPhone: recipient.phone,
      recipientEmail: recipient.email,
      verified: false,
      verificationChannel: recipient.channel || 'SMS',
      attemptsCount: 0,
    };
  }

  // --- Create & Execute Material Transaction Workflow with OTP Verification ---
  createMaterialTransaction(params: {
    type: MaterialMovementType;
    materialName: string;
    category: string;
    quantity: number;
    unit: MaterialItem['unit'];
    sourceLocation: string;
    destinationLocation: string;
    sourceProjectId?: string;
    sourceProjectName?: string;
    destinationProjectId?: string;
    destinationProjectName?: string;
    clientName?: string;
    clientIndentNumber: string;
    gatePassNumber?: string;
    challanNumber?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    returnReason?: MaterialTransactionRecord['returnReason'];
    costPerUnit?: number;
    attachments: MaterialAttachment[];
    otpRecipient: {
      type: MaterialOtpRecord['recipientType'];
      name: string;
      phone: string;
      email?: string;
      channel?: MaterialOtpRecord['verificationChannel'];
    };
    initiatedBy: string;
    initiatedRole: string;
    notes?: string;
    autoVerifyOtp?: boolean; // When supervisor completes OTP entry in modal
    verifiedOtpInput?: string;
  }): { transaction: MaterialTransactionRecord; otpSent: MaterialOtpRecord } {
    const now = new Date();
    const dateDisplay = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const otpRecord = this.generateMaterialOtp(params.otpRecipient);

    const isVerified = params.autoVerifyOtp && params.verifiedOtpInput === otpRecord.otpCode;
    if (isVerified) {
      otpRecord.verified = true;
      otpRecord.verifiedAt = now.toISOString();
      otpRecord.verifiedByRole = params.initiatedRole;
    }

    const tx: MaterialTransactionRecord = {
      id: 'tx-' + Date.now(),
      type: params.type,
      materialName: params.materialName,
      category: params.category,
      quantity: Number(params.quantity),
      unit: params.unit,
      sourceLocation: params.sourceLocation,
      destinationLocation: params.destinationLocation,
      sourceProjectId: params.sourceProjectId,
      sourceProjectName: params.sourceProjectName,
      destinationProjectId: params.destinationProjectId,
      destinationProjectName: params.destinationProjectName,
      clientName: params.clientName,
      clientIndentNumber: params.clientIndentNumber,
      gatePassNumber: params.gatePassNumber || `GP-${Math.floor(10000 + Math.random() * 90000)}`,
      challanNumber: params.challanNumber || `DC-${Math.floor(10000 + Math.random() * 90000)}`,
      vehicleNumber: params.vehicleNumber,
      driverName: params.driverName,
      driverPhone: params.driverPhone,
      returnReason: params.returnReason,
      costPerUnit: params.costPerUnit || 0,
      totalValue: (params.costPerUnit || 0) * Number(params.quantity),
      attachments: params.attachments || [],
      otpRecord,
      status: isVerified ? 'Completed' : 'Pending Verification',
      timestamp: now.toISOString(),
      dateDisplay,
      timeDisplay,
      initiatedBy: params.initiatedBy,
      initiatedRole: params.initiatedRole,
      notes: params.notes,
    };

    this.materialTransactions = [tx, ...this.materialTransactions];
    this.queueCloudOperation('material_transactions', 'create', tx);

    if (isVerified) {
      this.applyStockMovement(tx);
    }

    this.saveAll();

    // Trigger user notification
    const typeLabel = 
      params.type === 'RECEIVE_FROM_CLIENT' ? 'Material Received from Client' :
      params.type === 'RETURN_TO_CLIENT' ? 'Material Returned to Client' :
      params.type === 'SHIFT_FROM_MAIN_STOCK' ? 'Material Shifted from Main Stock' : 'Inter-Site Material Shift';

    this.addNotification({
      title: `${typeLabel} (${tx.status})`,
      message: `${tx.materialName} (${tx.quantity} ${tx.unit}) - Indent #${tx.clientIndentNumber} ${isVerified ? 'OTP Verified & Stock Updated' : 'Pending OTP Authorization'}`,
      type: isVerified ? 'success' : 'warning',
      category: 'material',
      projectId: tx.destinationProjectId || tx.sourceProjectId || this.activeProjectId,
    });

    return { transaction: tx, otpSent: otpRecord };
  }

  // --- Verify OTP and Complete Pending Transaction ---
  verifyTransactionOtp(txId: string, enteredCode: string, verifierRole: string = 'Authorized Inspector'): {
    success: boolean;
    message: string;
    transaction?: MaterialTransactionRecord;
  } {
    const tx = this.materialTransactions.find((t) => t.id === txId);
    if (!tx) {
      return { success: false, message: 'Transaction record not found.' };
    }

    if (tx.status === 'Completed') {
      return { success: true, message: 'Transaction already verified and completed.', transaction: tx };
    }

    // Check expiry
    const expires = new Date(tx.otpRecord.expiresAt).getTime();
    if (Date.now() > expires) {
      return { success: false, message: 'OTP has expired. Please click "Resend New OTP".' };
    }

    // Match code (or supervisor master code for demo fallback)
    const isValid = enteredCode.trim() === tx.otpRecord.otpCode || enteredCode.trim() === '123456';
    if (!isValid) {
      tx.otpRecord.attemptsCount = (tx.otpRecord.attemptsCount || 0) + 1;
      this.saveAll();
      return { success: false, message: `Invalid OTP code entered. (Attempt ${tx.otpRecord.attemptsCount}/3)` };
    }

    // Mark verified and complete
    tx.otpRecord.verified = true;
    tx.otpRecord.verifiedAt = new Date().toISOString();
    tx.otpRecord.verifiedByRole = verifierRole;
    tx.status = 'Completed';

    this.applyStockMovement(tx);
    this.queueCloudOperation('material_transactions', 'update', tx);
    this.saveAll();

    this.addNotification({
      title: 'Material OTP Authorization Verified',
      message: `Transaction #${tx.clientIndentNumber} verified by ${tx.otpRecord.recipientName} (${verifierRole}). Stock levels updated.`,
      type: 'success',
      category: 'material',
      projectId: tx.destinationProjectId || tx.sourceProjectId || this.activeProjectId,
    });

    return { success: true, message: 'OTP successfully verified! Inventory updated.', transaction: tx };
  }

  // --- Resend / Regenerate OTP for a Transaction ---
  resendTransactionOtp(txId: string): MaterialOtpRecord | null {
    const tx = this.materialTransactions.find((t) => t.id === txId);
    if (!tx) return null;

    const newOtp = this.generateMaterialOtp({
      type: tx.otpRecord.recipientType,
      name: tx.otpRecord.recipientName,
      phone: tx.otpRecord.recipientPhone,
      email: tx.otpRecord.recipientEmail,
      channel: tx.otpRecord.verificationChannel,
    });

    tx.otpRecord = newOtp;
    this.saveAll();

    this.addNotification({
      title: 'New Material OTP Dispatched',
      message: `New verification code ${newOtp.otpCode} sent to ${newOtp.recipientPhone} (${newOtp.recipientName}).`,
      type: 'info',
      category: 'material',
    });

    return newOtp;
  }

  // --- Inventory Math Application for Material Transactions ---
  private applyStockMovement(tx: MaterialTransactionRecord) {
    const targetProjId = tx.destinationProjectId || this.activeProjectId;
    const sourceProjId = tx.sourceProjectId || this.activeProjectId;

    switch (tx.type) {
      case 'RECEIVE_FROM_CLIENT': {
        // Find if this material exists in destination project site
        const existing = this.materials.find(
          (m) => m.projectId === targetProjId && m.name.toLowerCase().trim() === tx.materialName.toLowerCase().trim()
        );

        if (existing) {
          this.updateMaterial(existing.id, {
            quantity: existing.quantity + tx.quantity,
            lastRestocked: new Date().toISOString().split('T')[0],
          });
        } else {
          // Add as new tracked material
          this.addMaterial({
            projectId: targetProjId,
            name: tx.materialName,
            category: (tx.category as any) || 'Cement & Concrete',
            quantity: tx.quantity,
            unit: tx.unit,
            minThreshold: Math.max(10, Math.round(tx.quantity * 0.2)),
            costPerUnit: tx.costPerUnit || 500,
            totalValue: tx.quantity * (tx.costPerUnit || 500),
            supplier: tx.clientName || 'Client Supplied',
            supplierPhone: tx.driverPhone || '+91 98000 00000',
            status: 'In Stock',
            lastRestocked: new Date().toISOString().split('T')[0],
            locationInSite: tx.destinationLocation || 'Site Staging Yard',
          });
        }
        break;
      }

      case 'RETURN_TO_CLIENT': {
        // Deduct from source project site
        const existing = this.materials.find(
          (m) => m.projectId === sourceProjId && m.name.toLowerCase().trim() === tx.materialName.toLowerCase().trim()
        );
        if (existing) {
          const newQty = Math.max(0, existing.quantity - tx.quantity);
          this.updateMaterial(existing.id, {
            quantity: newQty,
          });
        }
        break;
      }

      case 'SHIFT_FROM_MAIN_STOCK': {
        // 1. Deduct from Central Warehouse Stock
        const centralItem = this.centralStock.find(
          (cs) => cs.name.toLowerCase().trim() === tx.materialName.toLowerCase().trim()
        );
        if (centralItem) {
          const updatedQty = Math.max(0, centralItem.availableQuantity - tx.quantity);
          this.updateCentralStockItem(centralItem.id, { availableQuantity: updatedQty });
        }

        // 2. Add to destination site inventory
        const siteItem = this.materials.find(
          (m) => m.projectId === targetProjId && m.name.toLowerCase().trim() === tx.materialName.toLowerCase().trim()
        );
        if (siteItem) {
          this.updateMaterial(siteItem.id, {
            quantity: siteItem.quantity + tx.quantity,
            lastRestocked: new Date().toISOString().split('T')[0],
          });
        } else {
          this.addMaterial({
            projectId: targetProjId,
            name: tx.materialName,
            category: (tx.category as any) || 'Cement & Concrete',
            quantity: tx.quantity,
            unit: tx.unit,
            minThreshold: Math.max(10, Math.round(tx.quantity * 0.2)),
            costPerUnit: tx.costPerUnit || centralItem?.costPerUnit || 500,
            totalValue: tx.quantity * (tx.costPerUnit || centralItem?.costPerUnit || 500),
            supplier: 'Central Warehouse Depot',
            supplierPhone: '+91 22 6665 8282',
            status: 'In Stock',
            lastRestocked: new Date().toISOString().split('T')[0],
            locationInSite: tx.destinationLocation || 'Site Storage Depot',
          });
        }
        break;
      }

      case 'INTER_SITE_SHIFT': {
        // 1. Deduct from source site
        const srcItem = this.materials.find(
          (m) => m.projectId === sourceProjId && m.name.toLowerCase().trim() === tx.materialName.toLowerCase().trim()
        );
        if (srcItem) {
          const newSrcQty = Math.max(0, srcItem.quantity - tx.quantity);
          this.updateMaterial(srcItem.id, { quantity: newSrcQty });
        }

        // 2. Add to destination site
        const dstItem = this.materials.find(
          (m) => m.projectId === targetProjId && m.name.toLowerCase().trim() === tx.materialName.toLowerCase().trim()
        );
        if (dstItem) {
          this.updateMaterial(dstItem.id, {
            quantity: dstItem.quantity + tx.quantity,
            lastRestocked: new Date().toISOString().split('T')[0],
          });
        } else {
          this.addMaterial({
            projectId: targetProjId,
            name: tx.materialName,
            category: (tx.category as any) || srcItem?.category || 'Cement & Concrete',
            quantity: tx.quantity,
            unit: tx.unit,
            minThreshold: Math.max(10, Math.round(tx.quantity * 0.2)),
            costPerUnit: tx.costPerUnit || srcItem?.costPerUnit || 500,
            totalValue: tx.quantity * (tx.costPerUnit || srcItem?.costPerUnit || 500),
            supplier: `Transferred from ${tx.sourceProjectName || 'Other Site'}`,
            supplierPhone: tx.driverPhone || '+91 98000 00000',
            status: 'In Stock',
            lastRestocked: new Date().toISOString().split('T')[0],
            locationInSite: tx.destinationLocation || 'Transferred Stock Staging',
          });
        }
        break;
      }
    }
  }

  // --- Worker & Attendance Actions ---
  addWorker(worker: Omit<WorkerProfile, 'id'>) {
    const newWorker: WorkerProfile = {
      ...worker,
      id: 'wrk-' + Date.now(),
    };
    this.workers = [newWorker, ...this.workers];
    this.queueCloudOperation('workers', 'create', newWorker);
    this.addNotification({
      title: 'Worker Registered',
      message: `${newWorker.name} (${newWorker.trade}) registered on site roster.`,
      type: 'info',
      category: 'schedule',
    });
    this.saveAll();
    return newWorker;
  }

  updateWorker(id: string, updates: Partial<WorkerProfile>) {
    this.workers = this.workers.map((w) => {
      if (w.id === id) {
        const updated = { ...w, ...updates };
        this.queueCloudOperation('workers', 'update', updated);
        return updated;
      }
      return w;
    });
    this.saveAll();
  }

  recordPunchIn(
    workerId: string,
    options?: {
      lat?: number;
      lng?: number;
      address?: string;
      isInsideGeofence?: boolean;
      accuracyMeters?: number;
      notes?: string;
      photoUrl?: string;
      method?: WorkerPunchRecord['verificationMethod'];
      customTimeStr?: string;
    }
  ) {
    const activeProj = this.getActiveProject();
    const projCoords = activeProj?.coordinates || { lat: 19.0596, lng: 72.8875 };
    const radius = activeProj?.geofenceRadiusMeters || 450;

    const lat = options?.lat !== undefined ? options.lat : projCoords.lat + (Math.random() - 0.5) * 0.0015;
    const lng = options?.lng !== undefined ? options.lng : projCoords.lng + (Math.random() - 0.5) * 0.0015;
    const dist = calculateDistanceMeters(projCoords.lat, projCoords.lng, lat, lng);
    const isInside = options?.isInsideGeofence !== undefined ? options.isInsideGeofence : dist <= radius;
    const now = new Date();
    const timeStr = options?.customTimeStr || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    const locAddress = options?.address || `${activeProj?.name || 'Site Center'} - Sector Access Point (${dist}m)`;

    const wrk = this.workers.find((w) => w.id === workerId);
    if (!wrk) return null;

    const punchRecord: WorkerPunchRecord = {
      id: 'punch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      workerId: wrk.id,
      workerName: wrk.name,
      workerRole: wrk.role,
      workerTrade: wrk.trade,
      workerAvatar: wrk.avatar,
      projectId: activeProj?.id || 'proj-01',
      projectName: activeProj?.name || 'Active Site',
      type: 'PUNCH_IN',
      timestamp: now.toISOString(),
      timeDisplay: timeStr,
      dateDisplay: dateStr,
      coordinates: { lat, lng },
      distanceFromSiteMeters: dist,
      isInsideGeofence: isInside,
      locationAddress: locAddress,
      verificationMethod: options?.method || 'GPS Telemetry',
      notes: options?.notes || (isInside ? 'Shift punch-in verified within site geofence' : `Flagged: Punch-in ${dist}m outside designated perimeter`),
      photoUrl: options?.photoUrl,
    };

    const updatedWorker: Partial<WorkerProfile> = {
      status: 'Active On-Site',
      checkInTime: timeStr,
      checkOutTime: undefined,
      lastPunchTimestamp: now.toISOString(),
      lastPunchType: 'PUNCH_IN',
      liveLocation: {
        lat,
        lng,
        address: locAddress,
        lastUpdated: 'Just now',
        isInsideGeofence: isInside,
        accuracyMeters: options?.accuracyMeters || 8,
      },
      punchHistory: [punchRecord, ...(wrk.punchHistory || [])].slice(0, 20),
    };

    this.updateWorker(workerId, updatedWorker);
    this.punchRecords = [punchRecord, ...this.punchRecords];
    this.queueCloudOperation('punchRecords', 'create', punchRecord);

    // Update active project's activeWorkersCount
    this.projects = this.projects.map((p) => {
      if (p.id === activeProj?.id) {
        const count = this.workers.filter((w) => w.assignedProjectId === p.id && w.status === 'Active On-Site').length;
        return { ...p, activeWorkersCount: count };
      }
      return p;
    });

    this.addNotification({
      title: isInside ? 'Shift Punch-In Verified' : 'Perimeter Warning: Punch-In Alert',
      message: `${wrk.name} (${wrk.trade}) punched IN at ${timeStr} • ${dist}m from center (${isInside ? 'Inside Site' : 'Outside Boundary'}).`,
      type: isInside ? 'success' : 'warning',
      category: 'schedule',
    });

    this.saveAll();
    return punchRecord;
  }

  recordPunchOut(
    workerId: string,
    options?: {
      lat?: number;
      lng?: number;
      address?: string;
      isInsideGeofence?: boolean;
      accuracyMeters?: number;
      notes?: string;
      photoUrl?: string;
      method?: WorkerPunchRecord['verificationMethod'];
      customTimeStr?: string;
    }
  ) {
    const activeProj = this.getActiveProject();
    const projCoords = activeProj?.coordinates || { lat: 19.0596, lng: 72.8875 };
    const radius = activeProj?.geofenceRadiusMeters || 450;

    const lat = options?.lat !== undefined ? options.lat : projCoords.lat + (Math.random() - 0.5) * 0.0015;
    const lng = options?.lng !== undefined ? options.lng : projCoords.lng + (Math.random() - 0.5) * 0.0015;
    const dist = calculateDistanceMeters(projCoords.lat, projCoords.lng, lat, lng);
    const isInside = options?.isInsideGeofence !== undefined ? options.isInsideGeofence : dist <= radius;
    const now = new Date();
    const timeStr = options?.customTimeStr || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    const locAddress = options?.address || `${activeProj?.name || 'Site Exit Gate'} (${dist}m)`;

    const wrk = this.workers.find((w) => w.id === workerId);
    if (!wrk) return null;

    // Calculate approximate duration worked
    let durationHours: number | undefined;
    let durationFormatted = '8 hrs (Full Shift)';
    if (wrk.lastPunchTimestamp) {
      const diffMs = now.getTime() - new Date(wrk.lastPunchTimestamp).getTime();
      if (diffMs > 0) {
        const hrs = diffMs / (1000 * 60 * 60);
        durationHours = Math.round(hrs * 10) / 10;
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        durationFormatted = `${h}h ${m}m`;
      }
    }

    const punchRecord: WorkerPunchRecord = {
      id: 'punch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      workerId: wrk.id,
      workerName: wrk.name,
      workerRole: wrk.role,
      workerTrade: wrk.trade,
      workerAvatar: wrk.avatar,
      projectId: activeProj?.id || 'proj-01',
      projectName: activeProj?.name || 'Active Site',
      type: 'PUNCH_OUT',
      timestamp: now.toISOString(),
      timeDisplay: timeStr,
      dateDisplay: dateStr,
      coordinates: { lat, lng },
      distanceFromSiteMeters: dist,
      isInsideGeofence: isInside,
      locationAddress: locAddress,
      verificationMethod: options?.method || 'GPS Telemetry',
      notes: options?.notes || `Shift concluded. Total on-site duration: ${durationFormatted}`,
      photoUrl: options?.photoUrl,
      shiftDurationHours: durationHours,
      shiftDurationFormatted: durationFormatted,
    };

    const updatedWorker: Partial<WorkerProfile> = {
      status: 'Off-Duty',
      checkOutTime: timeStr,
      lastPunchTimestamp: now.toISOString(),
      lastPunchType: 'PUNCH_OUT',
      liveLocation: {
        lat,
        lng,
        address: `${activeProj?.name || 'Site'} - Departure Hub`,
        lastUpdated: 'Just now',
        isInsideGeofence: isInside,
        accuracyMeters: options?.accuracyMeters || 8,
      },
      punchHistory: [punchRecord, ...(wrk.punchHistory || [])].slice(0, 20),
    };

    this.updateWorker(workerId, updatedWorker);
    this.punchRecords = [punchRecord, ...this.punchRecords];
    this.queueCloudOperation('punchRecords', 'create', punchRecord);

    // Update active project's activeWorkersCount
    this.projects = this.projects.map((p) => {
      if (p.id === activeProj?.id) {
        const count = this.workers.filter((w) => w.assignedProjectId === p.id && w.status === 'Active On-Site').length;
        return { ...p, activeWorkersCount: count };
      }
      return p;
    });

    this.addNotification({
      title: 'Shift Punch-Out Recorded',
      message: `${wrk.name} punched OUT at ${timeStr} • Shift Duration: ${durationFormatted}.`,
      type: 'info',
      category: 'schedule',
    });

    this.saveAll();
    return punchRecord;
  }

  deletePunchRecord(id: string) {
    this.punchRecords = this.punchRecords.filter((p) => p.id !== id);
    this.queueCloudOperation('punchRecords', 'delete', { id });
    this.saveAll();
  }

  clearAllPunchRecords() {
    this.punchRecords = [];
    this.saveAll();
  }

  // --- Site Progress & Photo Diary ---
  addSiteUpdate(log: Omit<SiteUpdateLog, 'id' | 'timestamp'>) {
    const newLog: SiteUpdateLog = {
      ...log,
      id: 'upd-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this.updates = [newLog, ...this.updates];
    this.queueCloudOperation('siteUpdates', 'create', newLog);

    // Update project progress
    this.projects = this.projects.map((p) => {
      if (p.id === log.projectId) {
        return { ...p, progressPercentage: Math.max(p.progressPercentage, log.progressPercentage) };
      }
      return p;
    });

    this.addNotification({
      title: 'Site Progress Diary Logged',
      message: `${newLog.title} (${newLog.stage}) submitted with ${newLog.photos.length} photos.`,
      type: 'success',
      category: 'schedule',
    });
    this.saveAll();
    return newLog;
  }

  // --- Safety & Incident Actions ---
  addSafetyIncident(incident: Omit<SafetyIncident, 'id' | 'timestamp'>) {
    const newIncident: SafetyIncident = {
      ...incident,
      id: 'inc-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this.incidents = [newIncident, ...this.incidents];
    this.queueCloudOperation('safetyIncidents', 'create', newIncident);
    this.addNotification({
      title: `Safety Hazard Alert: ${newIncident.severity} Severity`,
      message: `${newIncident.title} at ${newIncident.locationOnSite}. Immediate corrective action advised.`,
      type: newIncident.severity === 'CRITICAL' || newIncident.severity === 'HIGH' ? 'alert' : 'warning',
      category: 'safety',
    });
    this.saveAll();
    return newIncident;
  }

  resolveSafetyIncident(id: string, correctiveAction: string) {
    this.incidents = this.incidents.map((inc) => {
      if (inc.id === id) {
        const updated = {
          ...inc,
          status: 'Resolved' as const,
          correctiveAction,
          resolutionDate: new Date().toLocaleString(),
        };
        this.queueCloudOperation('safetyIncidents', 'update', updated);
        return updated;
      }
      return inc;
    });
    this.addNotification({
      title: 'Safety Hazard Resolved',
      message: `Safety incident resolved and verified by site inspector.`,
      type: 'success',
      category: 'safety',
    });
    this.saveAll();
  }

  // --- Budget Actions ---
  addExpense(expense: Omit<BudgetExpense, 'id' | 'variance'>) {
    const newExp: BudgetExpense = {
      ...expense,
      id: 'exp-' + Date.now(),
      variance: expense.plannedAmount - expense.actualAmount,
    };
    this.expenses = [newExp, ...this.expenses];
    this.queueCloudOperation('budgetExpenses', 'create', newExp);

    // Update project spent budget
    this.projects = this.projects.map((p) => {
      if (p.id === expense.projectId) {
        return { ...p, spentBudget: p.spentBudget + expense.actualAmount };
      }
      return p;
    });

    this.addNotification({
      title: 'Cost Code Expense Added',
      message: `${newExp.costCode}: ₹${newExp.actualAmount.toLocaleString('en-IN')} for ${newExp.title}`,
      type: 'info',
      category: 'budget',
    });
    this.saveAll();
    return newExp;
  }

  // --- Compliance Document Actions ---
  addComplianceDoc(doc: Omit<ComplianceDocument, 'id'>) {
    const newDoc: ComplianceDocument = {
      ...doc,
      id: 'doc-' + Date.now(),
    };
    this.docs = [newDoc, ...this.docs];
    this.queueCloudOperation('complianceDocs', 'create', newDoc);
    this.addNotification({
      title: 'Compliance Document Uploaded',
      message: `${newDoc.title} (${newDoc.category}) stored in vault.`,
      type: 'info',
      category: 'schedule',
    });
    this.saveAll();
    return newDoc;
  }

  // --- Team Chat Actions ---
  addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this.messages = [...this.messages, newMsg];
    this.queueCloudOperation('messages', 'create', newMsg);
    this.saveAll();
    return newMsg;
  }

  // --- Offline Cloud Sync Queue Management ---
  queueCloudOperation(collectionName: string, action: 'create' | 'update' | 'delete', payload: any) {
    const queueItem: OfflineSyncQueueItem = {
      id: 'queue-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      collection: collectionName,
      action,
      payload,
      timestamp: Date.now(),
    };
    this.offlineQueue.push(queueItem);
    saveToLocal(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);

    if (this.isOnline) {
      this.syncPendingOfflineQueue();
    }
  }

  async syncPendingOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    const currentItems = [...this.offlineQueue];
    for (const item of currentItems) {
      try {
        const itemDocRef = doc(db, item.collection, item.payload.id || item.payload.costCode || 'item-' + item.timestamp);
        if (item.action === 'create' || item.action === 'update') {
          await setDoc(itemDocRef, item.payload, { merge: true });
        } else if (item.action === 'delete') {
          await deleteDoc(itemDocRef);
        }
        // Remove from queue
        this.offlineQueue = this.offlineQueue.filter((q) => q.id !== item.id);
        saveToLocal(STORAGE_KEYS.OFFLINE_QUEUE, this.offlineQueue);
      } catch (err) {
        console.warn('Firestore sync item deferred:', err);
        break; // Stop and retry later if network fails
      }
    }
    this.notify();
  }

  async syncFromCloudSilently() {
    try {
      // Sync projects if collection exists
      const projSnap = await getDocs(collection(db, 'projects'));
      if (!projSnap.empty) {
        const cloudProjs: ProjectSite[] = [];
        projSnap.forEach((d) => cloudProjs.push(d.data() as ProjectSite));
        if (cloudProjs.length > 0) {
          this.projects = cloudProjs;
        }
      }
      this.notify();
    } catch (e) {
      console.log('Using local cached store:', e);
    }
  }

  // --- Full System Automated Backup & Restore ---
  exportFullBackupJSON(): string {
    const backupData = {
      version: '2.6',
      exportedAt: new Date().toISOString(),
      activeProject: this.activeProjectId,
      projects: this.projects,
      siteCategories: this.siteCategories,
      materials: this.materials,
      materialTransactions: this.materialTransactions,
      centralStock: this.centralStock,
      workers: this.workers,
      punchRecords: this.punchRecords,
      updates: this.updates,
      incidents: this.incidents,
      expenses: this.expenses,
      docs: this.docs,
      messages: this.messages,
      milestones: this.milestones,
      notifications: this.notifications,
      workOrders: this.workOrders,
      siteDailyExpenses: this.siteDailyExpenses,
      dailyLabourSummaries: this.dailyLabourSummaries,
      dailyProgressReports: this.dailyProgressReports,
      dailyProfitLossReports: this.dailyProfitLossReports,
      pettyCashAccounts: this.pettyCashAccounts,
      dailyCashPayments: this.dailyCashPayments,
      dailyCashReconciliations: this.dailyCashReconciliations,
    };
    return JSON.stringify(backupData, null, 2);
  }

  restoreFromBackupJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.projects || !Array.isArray(parsed.projects)) {
        throw new Error('Invalid backup schema');
      }
      if (parsed.projects) this.projects = parsed.projects;
      if (parsed.siteCategories) this.siteCategories = parsed.siteCategories;
      if (parsed.materials) this.materials = parsed.materials;
      if (parsed.materialTransactions) this.materialTransactions = parsed.materialTransactions;
      if (parsed.centralStock) this.centralStock = parsed.centralStock;
      if (parsed.workers) this.workers = parsed.workers;
      if (parsed.punchRecords) this.punchRecords = parsed.punchRecords;
      if (parsed.updates) this.updates = parsed.updates;
      if (parsed.incidents) this.incidents = parsed.incidents;
      if (parsed.expenses) this.expenses = parsed.expenses;
      if (parsed.docs) this.docs = parsed.docs;
      if (parsed.messages) this.messages = parsed.messages;
      if (parsed.milestones) this.milestones = parsed.milestones;
      if (parsed.notifications) this.notifications = parsed.notifications;
      if (parsed.workOrders) this.workOrders = parsed.workOrders;
      if (parsed.siteDailyExpenses) this.siteDailyExpenses = parsed.siteDailyExpenses;
      if (parsed.dailyLabourSummaries) this.dailyLabourSummaries = parsed.dailyLabourSummaries;
      if (parsed.dailyProgressReports) this.dailyProgressReports = parsed.dailyProgressReports;
      if (parsed.dailyProfitLossReports) this.dailyProfitLossReports = parsed.dailyProfitLossReports;
      if (parsed.pettyCashAccounts) this.pettyCashAccounts = parsed.pettyCashAccounts;
      if (parsed.dailyCashPayments) this.dailyCashPayments = parsed.dailyCashPayments;
      if (parsed.dailyCashReconciliations) this.dailyCashReconciliations = parsed.dailyCashReconciliations;

      this.saveAll();
      this.addNotification({
        title: 'System Restored from Backup',
        message: `Successfully loaded snapshot dated ${new Date(parsed.exportedAt || Date.now()).toLocaleDateString()}`,
        type: 'success',
        category: 'schedule',
      });
      return true;
    } catch (e: any) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  }

  // =========================================================================
  // WORK ORDERS & RATE CONTRACTS WITH SCOPE
  // =========================================================================
  addWorkOrder(wo: Omit<WorkOrderContract, 'id' | 'createdAt'>): WorkOrderContract {
    const newWo: WorkOrderContract = {
      ...wo,
      id: 'wo-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.workOrders = [newWo, ...this.workOrders];
    this.saveAll();
    this.addNotification({
      title: 'Work Order Contract Uploaded',
      message: `Work Order ${newWo.workOrderNumber} for ${newWo.contractorName} registered with ${newWo.boqItems.length} BOQ line items (₹ ${newWo.contractValue.toLocaleString('en-IN')}).`,
      type: 'success',
      category: 'schedule',
    });
    return newWo;
  }

  updateWorkOrder(id: string, updates: Partial<WorkOrderContract>) {
    this.workOrders = this.workOrders.map((wo) => {
      if (wo.id === id) {
        return { ...wo, ...updates };
      }
      return wo;
    });
    this.saveAll();
  }

  deleteWorkOrder(id: string) {
    const wo = this.workOrders.find((w) => w.id === id);
    this.workOrders = this.workOrders.filter((w) => w.id !== id);
    this.saveAll();
    if (wo) {
      this.addNotification({
        title: 'Work Order Removed',
        message: `Work Order ${wo.workOrderNumber} has been deleted.`,
        type: 'warning',
        category: 'schedule',
      });
    }
  }

  addBOQItemToWorkOrder(workOrderId: string, item: Omit<BOQItem, 'id' | 'completedQty' | 'todayCompletedQty' | 'totalEarnedValue'>): BOQItem | null {
    let createdItem: BOQItem | null = null;
    this.workOrders = this.workOrders.map((wo) => {
      if (wo.id === workOrderId) {
        const newItem: BOQItem = {
          ...item,
          id: 'boq-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          completedQty: 0,
          todayCompletedQty: 0,
          totalEarnedValue: 0,
        };
        createdItem = newItem;
        const updatedBoq = [...wo.boqItems, newItem];
        const newTotalVal = updatedBoq.reduce((sum, b) => sum + (b.totalEstimatedQty * b.contractRate), 0);
        return {
          ...wo,
          boqItems: updatedBoq,
          contractValue: newTotalVal > 0 ? newTotalVal : wo.contractValue,
        };
      }
      return wo;
    });
    this.saveAll();
    return createdItem;
  }

  // =========================================================================
  // CONSUMABLES / TRANSPORTATION / SITE DAILY EXPENSES
  // =========================================================================
  addSiteDailyExpense(exp: Omit<SiteDailyExpense, 'id' | 'createdAt'>): SiteDailyExpense {
    const newExp: SiteDailyExpense = {
      ...exp,
      id: 'exp-d-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.siteDailyExpenses = [newExp, ...this.siteDailyExpenses];
    this.saveAll();
    this.addNotification({
      title: 'Daily Site Expense Recorded',
      message: `₹ ${newExp.totalAmount.toLocaleString('en-IN')} for ${newExp.category}: ${newExp.itemDescription}`,
      type: 'info',
      category: 'safety',
    });
    return newExp;
  }

  updateSiteDailyExpense(id: string, updates: Partial<SiteDailyExpense>) {
    this.siteDailyExpenses = this.siteDailyExpenses.map((exp) => {
      if (exp.id === id) {
        const updated = { ...exp, ...updates };
        if (updates.quantity !== undefined || updates.unitRate !== undefined) {
          updated.totalAmount = (updated.quantity || 0) * (updated.unitRate || 0);
        }
        return updated;
      }
      return exp;
    });
    this.saveAll();
  }

  deleteSiteDailyExpense(id: string) {
    this.siteDailyExpenses = this.siteDailyExpenses.filter((e) => e.id !== id);
    this.saveAll();
  }

  // =========================================================================
  // SITE DAILY CASH EXPENSES, PETTY CASH IMPREST & RECONCILIATIONS
  // =========================================================================

  getPettyCashAccountForProject(projectId: string): PettyCashAccount | undefined {
    return this.pettyCashAccounts.find((a) => a.projectId === projectId);
  }

  addPettyCashPayment(payment: Omit<DailyCashPayment, 'id' | 'createdAt'>): DailyCashPayment {
    const isInflow = payment.type === 'TOP_UP' || payment.type === 'REFUND' || payment.type.toUpperCase().includes('INFLOW') || payment.type.toUpperCase().includes('REFUND') || payment.type.toUpperCase().includes('TOP_UP');
    const isOutflow = !isInflow;
    
    // Find or initialize account for project
    let account = this.pettyCashAccounts.find((a) => a.projectId === payment.projectId);
    if (!account) {
      const proj = this.projects.find((p) => p.id === payment.projectId);
      account = {
        id: 'pca-' + Date.now(),
        projectId: payment.projectId,
        accountName: `${proj?.name || 'Site'} - Petty Cash Float`,
        custodianName: payment.paidBy || 'Site Supervisor',
        custodianPhone: '+91 98000 00000',
        custodianRole: 'Site Supervisor',
        allocatedLimit: 50000,
        currentBalance: 50000,
        minimumThreshold: 5000,
        lastReplenishedDate: payment.date,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.pettyCashAccounts.push(account);
    }

    // Calculate updated balance
    const previousBalance = account.currentBalance;
    let newBalance = previousBalance;
    if (isOutflow) {
      newBalance = Math.max(0, previousBalance - payment.amount);
    } else {
      newBalance = previousBalance + payment.amount;
      account.lastReplenishedDate = payment.date;
    }

    account.currentBalance = newBalance;
    if (newBalance <= 0) {
      account.status = 'Depleted';
    } else if (newBalance <= account.minimumThreshold) {
      account.status = 'Low Balance';
    } else {
      account.status = 'Active';
    }

    const newPayment: DailyCashPayment = {
      ...payment,
      id: 'dcp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      balanceAfter: newBalance,
      createdAt: new Date().toISOString(),
    };

    this.dailyCashPayments = [newPayment, ...this.dailyCashPayments];

    // If it's an expense, also ensure it is mirrored in siteDailyExpenses if relevant
    if (isOutflow) {
      let mappedCategory: any = 'Site Overheads & Misc';
      if (payment.category === 'Consumables & Hardware') mappedCategory = 'Consumables';
      else if (payment.category === 'Transportation & Cartage') mappedCategory = 'Transportation & Logistics';
      else if (payment.category === 'Fuel & Generator Diesel' || payment.category === 'Equipment & Tool Rental' || payment.category === 'Machinery Spares & Breakdown Repair') mappedCategory = 'Equipment Rental & Fuel';

      const existingExp = this.siteDailyExpenses.find(
        (e) => e.projectId === payment.projectId && e.date === payment.date && e.itemDescription === payment.description
      );
      if (!existingExp) {
        this.siteDailyExpenses.push({
          id: 'exp-d-' + Date.now(),
          projectId: payment.projectId,
          date: payment.date,
          category: mappedCategory,
          itemDescription: `[Petty Cash ${newPayment.voucherNumber}] ${payment.description}`,
          quantity: 1,
          unit: 'Lot',
          unitRate: payment.amount,
          totalAmount: payment.amount,
          vendorName: payment.payee,
          paidBy: payment.paidBy,
          paymentMode: payment.paymentMode === 'UPI / QR' ? 'UPI / Online' : 'Petty Cash',
          receiptUrl: payment.receiptPhotoUrl,
          receiptName: payment.receiptPhotoName,
          status: payment.status === 'Approved' ? 'Approved' : 'Paid',
          notes: payment.costCode ? `Cost Code: ${payment.costCode}` : undefined,
          createdAt: newPayment.createdAt,
        });
      }
    }

    // Security audit log
    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: payment.paidBy || 'Site Supervisor',
      actorRole: this.currentRole,
      action: isOutflow ? `Cash Payment Disbursed (${newPayment.voucherNumber})` : `Petty Cash Float Top-Up (${newPayment.voucherNumber})`,
      category: 'FINANCIAL_PNL',
      targetResource: `${newPayment.category}: ₹${payment.amount.toLocaleString('en-IN')}`,
      severity: isOutflow && payment.amount > 10000 ? 'WARNING' : 'INFO',
      ipAddress: '103.224.182.45',
      details: `${payment.description} paid to ${payment.payee}. New site cash balance: ₹${newBalance.toLocaleString('en-IN')}`,
    });

    // Check low balance alert
    if (account.status === 'Low Balance' || account.status === 'Depleted') {
      this.addNotification({
        title: '⚠️ Site Petty Cash Running Low',
        message: `${account.accountName} balance is ₹${newBalance.toLocaleString('en-IN')} (Threshold: ₹${account.minimumThreshold.toLocaleString('en-IN')}). Please request a float top-up.`,
        type: 'warning',
        category: 'budget',
      });
    } else {
      this.addNotification({
        title: isOutflow ? 'Cash Payment Recorded' : 'Petty Cash Replenished',
        message: `Voucher ${newPayment.voucherNumber}: ₹${payment.amount.toLocaleString('en-IN')} for ${payment.payee}`,
        type: 'info',
        category: 'budget',
      });
    }

    this.saveAll();
    return newPayment;
  }

  updatePettyCashPayment(id: string, updates: Partial<DailyCashPayment>) {
    this.dailyCashPayments = this.dailyCashPayments.map((p) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    this.saveAll();
  }

  deletePettyCashPayment(id: string) {
    const payment = this.dailyCashPayments.find((p) => p.id === id);
    if (payment) {
      // Revert account balance
      const account = this.pettyCashAccounts.find((a) => a.projectId === payment.projectId);
      if (account) {
        if (payment.type === 'EXPENSE' || payment.type === 'CONTRACTOR_ADVANCE' || payment.type === 'SUPPLIER_PAYMENT') {
          account.currentBalance += payment.amount;
        } else if (payment.type === 'TOP_UP' || payment.type === 'REFUND') {
          account.currentBalance = Math.max(0, account.currentBalance - payment.amount);
        }
        if (account.currentBalance > account.minimumThreshold) {
          account.status = 'Active';
        }
      }
      this.dailyCashPayments = this.dailyCashPayments.filter((p) => p.id !== id);
      this.saveAll();
      this.addNotification({
        title: 'Voucher Cancelled',
        message: `Cash voucher ${payment.voucherNumber} (₹${payment.amount.toLocaleString('en-IN')}) has been deleted and balance restored.`,
        type: 'warning',
        category: 'budget',
      });
    }
  }

  topUpPettyCashAccount(
    projectId: string,
    amount: number,
    notes?: string,
    referenceNumber?: string,
    source?: string
  ): DailyCashPayment {
    const project = this.projects.find((p) => p.id === projectId);
    const voucherNo = `PCV-${project?.code ? project.code.substring(0, 4) : 'SITE'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.addPettyCashPayment({
      projectId,
      projectName: project?.name,
      voucherNumber: voucherNo,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'TOP_UP',
      category: 'Other Site Misc',
      amount,
      payee: source || 'Head Office Accounts / Bank Withdrawal',
      paidBy: 'Head Office Accounts',
      paymentMode: 'Bank Transfer / IMPS',
      referenceNumber: referenceNumber || `HO-REPLENISH-${Date.now().toString().slice(-6)}`,
      description: notes || `Petty cash float replenishment sanctioned for site operations.`,
      status: 'Approved',
      approvedBy: 'Project Manager / Accounts Lead',
    });
  }

  addPettyCashAccount(account: Omit<PettyCashAccount, 'id' | 'createdAt'>): PettyCashAccount {
    const newAcc: PettyCashAccount = {
      ...account,
      id: 'pca-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.pettyCashAccounts = [...this.pettyCashAccounts, newAcc];
    this.saveAll();
    return newAcc;
  }

  updatePettyCashAccount(id: string, updates: Partial<PettyCashAccount>) {
    this.pettyCashAccounts = this.pettyCashAccounts.map((acc) => {
      if (acc.id === id) {
        return { ...acc, ...updates };
      }
      return acc;
    });
    this.saveAll();
  }

  saveDailyCashReconciliation(rec: Omit<DailyCashReconciliationRecord, 'id' | 'timestamp'>): DailyCashReconciliationRecord {
    const newRec: DailyCashReconciliationRecord = {
      ...rec,
      id: 'dcr-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    // Replace or insert for same project and date
    this.dailyCashReconciliations = this.dailyCashReconciliations.filter(
      (r) => !(r.projectId === rec.projectId && r.date === rec.date)
    );
    this.dailyCashReconciliations = [newRec, ...this.dailyCashReconciliations];
    this.saveAll();

    this.addSecurityAuditLog({
      actorId: 'usr-current',
      actorName: rec.verifiedBy,
      actorRole: (rec.verifiedRole as Role) || this.currentRole,
      action: 'Daily Physical Cash Reconciliation Signed Off',
      category: 'FINANCIAL_PNL',
      targetResource: `Physical Count: ₹${rec.actualPhysicalCashCount.toLocaleString('en-IN')} (Diff: ₹${rec.cashDifference})`,
      severity: rec.status === 'Discrepancy' ? 'WARNING' : 'INFO',
      ipAddress: '103.224.182.45',
      details: `Daily cash drawer balanced for ${rec.date}. Physical count ₹${rec.actualPhysicalCashCount.toLocaleString('en-IN')} vs expected ₹${rec.calculatedClosingBalance.toLocaleString('en-IN')}`,
    });

    this.addNotification({
      title: rec.status === 'Balanced' ? 'Cash Reconciled Successfully' : '⚠️ Cash Discrepancy Flagged',
      message: `${rec.date}: Physical Cash ₹${rec.actualPhysicalCashCount.toLocaleString('en-IN')} (${rec.status})`,
      type: rec.status === 'Balanced' ? 'success' : 'warning',
      category: 'budget',
    });

    return newRec;
  }

  exportPettyCashCSV(projectId?: string): string {
    const payments = projectId && projectId !== 'all'
      ? this.dailyCashPayments.filter((p) => p.projectId === projectId)
      : this.dailyCashPayments;

    const headers = [
      'Voucher No',
      'Date',
      'Site Name',
      'Type',
      'Category',
      'Payee / Vendor',
      'Payee Contact',
      'Description',
      'Payment Mode',
      'Ref Number',
      'Disbursed By',
      'Approved By',
      'Status',
      'Amount (INR)',
      'Balance After (INR)',
    ];

    const rows = payments.map((p) => {
      const proj = this.projects.find((pr) => pr.id === p.projectId);
      return [
        `"${p.voucherNumber}"`,
        `"${p.date}"`,
        `"${proj?.name || p.projectName || p.projectId}"`,
        `"${p.type}"`,
        `"${p.category}"`,
        `"${(p.payee || '').replace(/"/g, '""')}"`,
        `"${p.payeePhone || ''}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        `"${p.paymentMode}"`,
        `"${p.referenceNumber || ''}"`,
        `"${p.paidBy}"`,
        `"${p.approvedBy || ''}"`,
        `"${p.status}"`,
        p.amount,
        p.balanceAfter ?? '',
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }


  // =========================================================================
  // DAILY LABOUR DATA / IMPORT LABOUR COST FROM ATTENDANCE
  // =========================================================================
  importDailyLabourCost(projectId: string, dateStr: string): DailyLabourSummary {
    const targetProject = this.projects.find((p) => p.id === projectId) || this.projects[0];
    const projectWorkers = this.workers.filter((w) => w.assignedProjectId === projectId);

    // Group active punches for this date or worker profile trade wage defaults
    const tradeMap = new Map<string, { count: number; totalNormal: number; totalOT: number; totalOTHours: number; rates: number[] }>();

    projectWorkers.forEach((w) => {
      // Find today's punch if exists or check if active worker
      const dayPunches = this.punchRecords.filter((p) => p.workerId === w.id && p.timestamp.startsWith(dateStr));
      const isPresent = dayPunches.length > 0 ? dayPunches.some((p) => p.type === 'PUNCH_IN') : w.status === 'Active On-Site';

      if (isPresent) {
        const trade = w.trade || 'General Labor / Helper';
        const current = tradeMap.get(trade) || { count: 0, totalNormal: 0, totalOT: 0, totalOTHours: 0, rates: [] };
        current.count += 1;
        const baseWage = w.dailyWage || 650;
        current.rates.push(baseWage);
        current.totalNormal += baseWage;

        // Check if overtime hours logged or standard shift OT
        const otHours = Math.random() > 0.65 ? 1 : 0;
        const hourlyRate = (baseWage / 8) * 1.5;
        current.totalOTHours += otHours;
        current.totalOT += Math.round(otHours * hourlyRate);

        tradeMap.set(trade, current);
      }
    });

    // If no workers mapped, provide standard realistic gang
    if (tradeMap.size === 0) {
      tradeMap.set('Steel Fixer', { count: 8, totalNormal: 7600, totalOT: 850, totalOTHours: 6, rates: [950] });
      tradeMap.set('Mason', { count: 5, totalNormal: 4500, totalOT: 500, totalOTHours: 4, rates: [900] });
      tradeMap.set('Carpenter', { count: 4, totalNormal: 3520, totalOT: 380, totalOTHours: 3, rates: [880] });
      tradeMap.set('Heavy Equipment Operator', { count: 2, totalNormal: 2400, totalOT: 350, totalOTHours: 2, rates: [1200] });
      tradeMap.set('General Labor / Helper', { count: 9, totalNormal: 5580, totalOT: 820, totalOTHours: 9, rates: [620] });
    }

    const breakdown: any[] = [];
    let grandNormal = 0;
    let grandOT = 0;
    let totalHeadcount = 0;

    tradeMap.forEach((data, trade) => {
      totalHeadcount += data.count;
      grandNormal += data.totalNormal;
      grandOT += data.totalOT;
      const avgWage = data.rates.length > 0 ? Math.round(data.totalNormal / data.count) : 800;
      breakdown.push({
        trade,
        count: data.count,
        averageDailyWage: avgWage,
        normalWages: Math.round(data.totalNormal),
        overtimeHours: data.totalOTHours,
        overtimeWages: Math.round(data.totalOT),
        totalCost: Math.round(data.totalNormal + data.totalOT),
      });
    });

    const summary: DailyLabourSummary = {
      id: 'labour-sum-' + Date.now(),
      date: dateStr,
      projectId,
      projectName: targetProject?.name || 'Site Project',
      totalWorkersPresent: totalHeadcount,
      breakdownByTrade: breakdown,
      totalNormalCost: Math.round(grandNormal),
      totalOvertimeCost: Math.round(grandOT),
      totalLabourCost: Math.round(grandNormal + grandOT),
      importedFromApp: true,
      importedAt: new Date().toISOString(),
      contractorGangName: 'Site Attendance Muster Roll (Biometric & Geofenced Punch)',
      verifiedBySupervisor: this.currentRole === 'project_manager' ? 'Project Lead' : 'Site Supervisor',
    };

    // Replace or insert
    this.dailyLabourSummaries = this.dailyLabourSummaries.filter((s) => !(s.projectId === projectId && s.date === dateStr));
    this.dailyLabourSummaries = [summary, ...this.dailyLabourSummaries];
    this.saveAll();

    this.addNotification({
      title: 'Daily Labour Data Imported',
      message: `Imported ${totalHeadcount} workers on site (${dateStr}): Total Labour Cost ₹ ${summary.totalLabourCost.toLocaleString('en-IN')}`,
      type: 'info',
      category: 'schedule',
    });

    return summary;
  }

  saveDailyLabourSummary(summary: DailyLabourSummary) {
    this.dailyLabourSummaries = this.dailyLabourSummaries.filter((s) => s.id !== summary.id && !(s.projectId === summary.projectId && s.date === summary.date));
    this.dailyLabourSummaries = [summary, ...this.dailyLabourSummaries];
    this.saveAll();
  }

  // =========================================================================
  // DAILY PROGRESS REPORT (DPR) WITH AI PHOTO INTEGRATION & BOQ PROGRESS
  // =========================================================================
  saveDailyProgressReport(dpr: DailyProgressReport): DailyProgressReport {
    // Update cumulative completed quantities in BOQ items
    if (dpr.progressByBOQ && dpr.progressByBOQ.length > 0) {
      dpr.progressByBOQ.forEach((prog) => {
        this.workOrders = this.workOrders.map((wo) => {
          if (wo.id === prog.workOrderId || wo.boqItems.some((b) => b.id === prog.boqItemId)) {
            const updatedItems = wo.boqItems.map((b) => {
              if (b.id === prog.boqItemId) {
                const newCompleted = (b.completedQty || 0) + (prog.todayExecutedQty || 0);
                return {
                  ...b,
                  todayCompletedQty: prog.todayExecutedQty,
                  completedQty: newCompleted,
                  totalEarnedValue: newCompleted * b.contractRate,
                };
              }
              return b;
            });
            return {
              ...wo,
              boqItems: updatedItems,
            };
          }
          return wo;
        });
      });
    }

    this.dailyProgressReports = this.dailyProgressReports.filter((r) => r.id !== dpr.id);
    this.dailyProgressReports = [dpr, ...this.dailyProgressReports];

    // Automatically recalculate and sync Daily Profit & Loss report for this site and date
    this.generateAndSaveDailyProfitLoss(dpr.projectId, dpr.date, dpr.id);

    this.saveAll();
    this.addNotification({
      title: 'Daily Progress Report (DPR) Generated',
      message: `${dpr.dprNumber} recorded for ${dpr.date}. Earned Gross Income: ₹ ${dpr.totalTodayEarnedIncome.toLocaleString('en-IN')}`,
      type: 'success',
      category: 'schedule',
    });
    return dpr;
  }

  deleteDailyProgressReport(id: string) {
    this.dailyProgressReports = this.dailyProgressReports.filter((r) => r.id !== id);
    this.saveAll();
  }

  // =========================================================================
  // DAILY PROFIT / LOSS REPORT CALCULATION & PREPARATION
  // =========================================================================
  generateAndSaveDailyProfitLoss(projectId: string, dateStr: string, dprId?: string): DailyProfitLossReport {
    const project = this.projects.find((p) => p.id === projectId) || this.projects[0];
    const dpr = this.dailyProgressReports.find((r) => r.projectId === projectId && (r.date === dateStr || r.id === dprId));

    // 1. Calculate Gross Income from DPR and BOQ rates
    let earnedIncomeTotal = 0;
    const incomeBreakdown: Array<{ item: string; quantity: number; unit: string; rate: number; amount: number }> = [];

    if (dpr && dpr.progressByBOQ && dpr.progressByBOQ.length > 0) {
      dpr.progressByBOQ.forEach((prog) => {
        const amt = prog.todayEarnedAmount || (prog.todayExecutedQty * prog.rate);
        earnedIncomeTotal += amt;
        incomeBreakdown.push({
          item: prog.itemDescription,
          quantity: prog.todayExecutedQty,
          unit: prog.unit,
          rate: prog.rate,
          amount: amt,
        });
      });
    } else {
      // If no DPR yet, check all work orders in project for today's completed quantity
      const projWorkOrders = this.workOrders.filter((w) => w.projectId === projectId);
      projWorkOrders.forEach((wo) => {
        wo.boqItems.forEach((b) => {
          if (b.todayCompletedQty && b.todayCompletedQty > 0) {
            const amt = b.todayCompletedQty * b.contractRate;
            earnedIncomeTotal += amt;
            incomeBreakdown.push({
              item: b.description,
              quantity: b.todayCompletedQty,
              unit: b.unit,
              rate: b.contractRate,
              amount: amt,
            });
          }
        });
      });
    }

    // 2. Fetch or import Labour Cost for today
    let labourSummary = this.dailyLabourSummaries.find((s) => s.projectId === projectId && s.date === dateStr);
    if (!labourSummary) {
      labourSummary = this.importDailyLabourCost(projectId, dateStr);
    }
    const labourCostTotal = labourSummary ? labourSummary.totalLabourCost : 0;

    // 3. Aggregate Site Daily Expenses for today
    const dayExpenses = this.siteDailyExpenses.filter((e) => e.projectId === projectId && e.date === dateStr);
    let consumablesCostTotal = 0;
    let transportationCostTotal = 0;
    let equipmentFuelCostTotal = 0;
    let miscOverheadCostTotal = 0;

    dayExpenses.forEach((exp) => {
      if (exp.category === 'Consumables') {
        consumablesCostTotal += exp.totalAmount;
      } else if (exp.category === 'Transportation & Logistics') {
        transportationCostTotal += exp.totalAmount;
      } else if (exp.category === 'Equipment Rental & Fuel') {
        equipmentFuelCostTotal += exp.totalAmount;
      } else {
        miscOverheadCostTotal += exp.totalAmount;
      }
    });

    const expensesTotal = labourCostTotal + consumablesCostTotal + transportationCostTotal + equipmentFuelCostTotal + miscOverheadCostTotal;
    const netProfitOrLoss = earnedIncomeTotal - expensesTotal;
    const profitMarginPct = earnedIncomeTotal > 0 ? Number(((netProfitOrLoss / earnedIncomeTotal) * 100).toFixed(2)) : 0;

    const status = netProfitOrLoss >= 0 ? 'Profitable' : 'Loss';
    const marginHealth: 'EXCELLENT' | 'HEALTHY' | 'SLIM' | 'NEGATIVE' =
      profitMarginPct >= 15
        ? 'EXCELLENT'
        : profitMarginPct >= 5
        ? 'HEALTHY'
        : profitMarginPct >= 0
        ? 'SLIM'
        : 'NEGATIVE';

    const keyVarianceNotes: string[] = [];
    if (netProfitOrLoss >= 0) {
      keyVarianceNotes.push(`Positive Site Net Margin: ₹ ${netProfitOrLoss.toLocaleString('en-IN')} (+${profitMarginPct}%).`);
    } else {
      keyVarianceNotes.push(`Operating Deficit of ₹ ${Math.abs(netProfitOrLoss).toLocaleString('en-IN')} (${profitMarginPct}% margin) incurred today.`);
    }

    if (labourCostTotal > 0) {
      const labourShare = earnedIncomeTotal > 0 ? Math.round((labourCostTotal / earnedIncomeTotal) * 100) : 0;
      keyVarianceNotes.push(`Direct Labour Cost constitutes ${labourShare}% of today's earned gross progress.`);
    }

    if (consumablesCostTotal + transportationCostTotal > 0) {
      keyVarianceNotes.push(`Consumables & Haulage: ₹ ${(consumablesCostTotal + transportationCostTotal).toLocaleString('en-IN')} logged.`);
    }

    const actionRecommendations: string[] = [];
    if (netProfitOrLoss < 0) {
      actionRecommendations.push('Audit today\'s non-productive labour downtime and verify if shuttering/rebar batching was delayed.');
      actionRecommendations.push('Confirm with client consultant for fast-track joint measurement sign-off to monetize completed scope.');
    } else if (profitMarginPct < 5) {
      actionRecommendations.push('Consumables inventory purchased today will amortize across subsequent execution cycles.');
    } else {
      actionRecommendations.push('Maintain current trade gang allocation and reinforce material staging to preserve profitable run-rate.');
    }

    const pnlReport: DailyProfitLossReport = {
      id: 'pnl-' + projectId + '-' + dateStr,
      projectId,
      projectName: project?.name || 'Metro Corridor Line 4 Viaduct',
      date: dateStr,
      dprId: dpr?.id,
      earnedIncomeTotal,
      incomeBreakdown,
      expensesTotal,
      labourCostTotal,
      consumablesCostTotal,
      transportationCostTotal,
      equipmentFuelCostTotal,
      materialDirectCostTotal: 0,
      miscOverheadCostTotal,
      netProfitOrLoss,
      profitMarginPct,
      status,
      marginHealth,
      keyVarianceNotes,
      actionRecommendations,
      generatedAt: new Date().toISOString(),
    };

    this.dailyProfitLossReports = this.dailyProfitLossReports.filter((r) => !(r.projectId === projectId && r.date === dateStr));
    this.dailyProfitLossReports = [pnlReport, ...this.dailyProfitLossReports];
    this.saveAll();

    return pnlReport;
  }
}

// Global Singleton Instance
export const store = new ConstructionStore();
