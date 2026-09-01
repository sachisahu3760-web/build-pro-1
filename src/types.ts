export type Role =
  | 'master_admin'
  | 'admin'
  | 'project_manager'
  | 'site_supervisor'
  | 'safety_officer'
  | 'field_engineer'
  | 'labour_contractor'
  | 'worker'
  | 'client_stakeholder';

export type PermissionKey =
  | 'manage_sites'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_master_rates'
  | 'view_financials_pnl'
  | 'approve_pnl_reports'
  | 'create_work_orders'
  | 'manage_materials'
  | 'manage_workers'
  | 'self_punch'
  | 'view_live_location'
  | 'manage_safety_incidents'
  | 'export_audit_reports'
  | 'system_configuration';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  assignedProjectIds: string[];
  avatar: string;
  designation: string;
  department: string;
  status: 'Active' | 'Suspended' | 'Pending Invite';
  lastActive: string;
  workerProfileId?: string; // Linked worker if role is 'worker'
  permissionsOverride?: Partial<Record<PermissionKey, boolean>>;
}

export interface MasterRateCardItem {
  id: string;
  itemCode: string;
  description: string;
  category: string;
  unit: string;
  benchmarkRate: number; // ₹ standard benchmark
  minAllowedRate: number;
  maxAllowedRate: number;
  lastUpdated: string;
  updatedBy: string;
  applicableSiteType: 'All Sites' | 'Commercial' | 'Infrastructure' | 'Residential' | 'Industrial';
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  timeDisplay: string;
  dateDisplay: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  category: 'AUTH_RBAC' | 'SITE_OPS' | 'FINANCIAL_PNL' | 'WORK_ORDER' | 'SELF_PUNCH' | 'SECURITY';
  targetResource: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ipAddress?: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface WorkerSelfPunchPayload {
  workerId: string;
  workerName: string;
  type: 'PUNCH_IN' | 'PUNCH_OUT';
  lat: number;
  lng: number;
  accuracyMeters: number;
  isInsideGeofence: boolean;
  distanceFromSiteMeters: number;
  locationAddress: string;
  photoUrl?: string;
  notes?: string;
  shiftHours?: number;
  earnedAmount?: number;
}


export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'or';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export type SiteWorkType = 'Work with Material' | 'Labour Contractor Work';

export interface SiteCategory {
  id: string;
  name: string; // e.g. "Commercial", "Residential", "Infrastructure", "Industrial", "Hospitality & Resort", "Healthcare & Medical", "Institutional & Educational", "Solar & Renewable", "PEB & Precast Structure", "Highway & Bridge"
  code: string; // e.g. "COMM", "RESI", "INFRA", "IND", "HOSP", "HLTH", "INST", "SOLAR", "PEB", "BRDG"
  description?: string;
  color?: 'blue' | 'amber' | 'emerald' | 'indigo' | 'rose' | 'purple' | 'cyan' | 'teal' | 'slate' | 'orange' | string;
  icon?: string;
  defaultBannerUrl?: string;
  isCustom?: boolean;
  createdAt?: string;
  createdByRole?: string;
}

export interface WorkOrderMilestone {
  id: string;
  title: string;
  percentage: number; // e.g. 25 (%)
  targetDate: string;
  deliverable: string;
  billingAmount: number;
  status?: 'Pending' | 'In Progress' | 'Achieved' | 'Billed';
}

export interface WorkOrderPnlProjection {
  totalAgreedRevenue: number;
  directMaterialCostBudget: number; // Direct Material Cost Budget
  labourWagesBudget: number; // Direct Labour Wages Budget
  plantMachineryFuelBudget: number; // Plant, Machinery & Fuel Budget
  siteOverheadsAndAdminBudget: number; // Site Overheads & Admin
  contingencyAndSafetyBudget: number; // Contingency & Safety Buffer
  totalBudgetedCost: number;
  projectedGrossProfit: number;
  projectedProfitMarginPct: number;
  retentionMoneyPct?: number; // e.g., 5%
  retentionMoneyAmount?: number;
  mobilizationAdvancePct?: number; // e.g., 10%
  mobilizationAdvanceAmount?: number;
  tdsDeductionPct?: number; // e.g., 2%
  gstRatePct?: number; // e.g., 18%
  milestones?: WorkOrderMilestone[];
  riskFactorSensitivity?: 'LOW' | 'MEDIUM' | 'HIGH';
  projectedBreakEvenUnits?: string;
  notes?: string;
  uploadedWorkOrderFile?: {
    name: string;
    size: string;
    type: string;
    url?: string;
    uploadedAt: string;
  };
}

export interface ProjectSite {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  address: string;
  coordinates: GeoCoordinate;
  geofenceRadiusMeters: number;
  totalBudget: number;
  spentBudget: number;
  startDate: string;
  targetEndDate: string;
  status: 'active' | 'on_hold' | 'completed' | 'delayed';
  progressPercentage: number;
  supervisorName: string;
  supervisorPhone: string;
  siteType: 'Commercial' | 'Infrastructure' | 'Residential' | 'Industrial' | string;
  siteCategoryId?: string;
  siteCategoryName?: string;
  bannerImage: string;
  activeWorkersCount: number;
  workType?: SiteWorkType;
  workOrderNumber?: string;
  workOrderDocumentUrl?: string;
  workOrderDocumentName?: string;
  contractValue?: number;
  contractorName?: string;
  contractorPhone?: string;
  scopeOfWork?: string;
  pnlProjection?: WorkOrderPnlProjection;
}

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  color?: 'orange' | 'blue' | 'amber' | 'rose' | 'cyan' | 'purple' | 'emerald' | 'indigo' | 'slate' | 'teal' | string;
  icon?: string;
  defaultUnit?: string;
  isCustom?: boolean;
  createdAt?: string;
  createdByRole?: string;
}

export interface MaterialItem {
  id: string;
  projectId: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'Bags' | 'Tons' | 'Cu. Meters' | 'Pieces' | 'Meters' | 'Litres' | 'Sets' | 'Units' | 'MT' | 'Cum' | 'Nos' | 'Truckloads' | 'Sq.Ft' | 'Barrels' | string;
  minThreshold: number;
  costPerUnit: number;
  totalValue: number;
  supplier: string;
  supplierPhone: string;
  status: 'In Stock' | 'Low Stock' | 'Critical Shortage' | 'Ordered' | 'Dispatched';
  lastRestocked: string;
  locationInSite: string;
}

export type MaterialMovementType = 
  | 'RECEIVE_FROM_CLIENT'
  | 'RETURN_TO_CLIENT'
  | 'SHIFT_FROM_MAIN_STOCK'
  | 'INTER_SITE_SHIFT';

export interface MaterialAttachment {
  id: string;
  name: string;
  title?: string;
  fileName?: string;
  url: string; // Base64 image/document data or URL
  fileUrl?: string;
  fileType: string;
  docCategory?: 'Indent Document' | 'Delivery Challan' | 'Return Gate Pass' | 'Material Inspection Note' | 'Client Acknowledgment' | 'Site Photo' | string;
  documentCategory?: string;
  fileSize?: string;
  timestamp: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface MaterialOtpRecord {
  otpCode: string;
  authReference: string;
  generatedAt: string;
  expiresAt: string;
  recipientType: 'Client Representative' | 'Site Storekeeper' | 'Dispatch Supervisor' | 'Receiving Field Engineer' | 'Custom Recipient';
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedByRole?: string;
  verificationChannel: 'SMS' | 'WhatsApp' | 'Email' | 'Supervisor In-Person';
  attemptsCount?: number;
}

export interface MaterialTransactionRecord {
  id: string;
  type: MaterialMovementType;
  materialId?: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: 'Bags' | 'Tons' | 'Cu. Meters' | 'Pieces' | 'Meters' | 'Litres' | 'Sets' | 'Units' | string;
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
  returnReason?: 'Excess Material' | 'Defective / Rejected QC' | 'Project Phase Completed' | 'Rental Equipment Return' | 'Client Recall / Re-allocation' | 'Specification Mismatch' | 'Other';
  costPerUnit?: number;
  totalValue?: number;
  attachments: MaterialAttachment[];
  otpRecord: MaterialOtpRecord;
  status: 'Completed' | 'In Transit' | 'Pending Verification' | 'Rejected';
  timestamp: string; // ISO string
  dateDisplay: string;
  timeDisplay: string;
  initiatedBy: string;
  initiatedRole: string;
  notes?: string;
}

export interface CentralStockItem {
  id: string;
  skuCode?: string;
  name: string;
  category: string;
  availableQuantity: number;
  totalQuantity?: number;
  bayNumber?: string;
  unit: 'Bags' | 'Tons' | 'Cu. Meters' | 'Pieces' | 'Meters' | 'Litres' | 'Sets' | 'Units' | 'MT' | 'Cum' | 'Nos' | 'Truckloads' | 'Sq.Ft' | 'Barrels' | string;
  costPerUnit: number;
  warehouseLocation: string;
  minThreshold?: number;
  reorderLevel?: number;
  status?: string;
  lastRestocked?: string;
  lastUpdated?: string;
  supplier?: string;
  supplierPhone?: string;
}

export interface WorkerPunchRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  workerTrade: string;
  workerAvatar: string;
  projectId: string;
  projectName: string;
  type: 'PUNCH_IN' | 'PUNCH_OUT';
  timestamp: string; // ISO string
  timeDisplay: string; // e.g. "07:15 AM"
  dateDisplay: string; // e.g. "28 Aug 2026"
  coordinates: GeoCoordinate;
  distanceFromSiteMeters: number;
  isInsideGeofence: boolean;
  locationAddress: string;
  verificationMethod: 'GPS Telemetry' | 'Browser Geolocation' | 'Supervisor Manual' | 'Kiosk Quick-Punch' | 'GPS Live Self-Punch';
  notes?: string;
  photoUrl?: string;
  shiftDurationHours?: number;
  shiftDurationFormatted?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  role: string;
  trade: 'Mason' | 'Steel Fixer' | 'Electrician' | 'Carpenter' | 'Welder' | 'Heavy Equipment Operator' | 'Safety Marshal' | 'Site Engineer' | 'General Labor';
  assignedProjectId: string;
  phone: string;
  emergencyContact: string;
  dailyWage: number;
  shift: 'Morning (07:00 - 15:30)' | 'Evening (15:30 - 23:30)' | 'Night (23:30 - 07:00)';
  status: 'Active On-Site' | 'Off-Duty' | 'On Leave' | 'En Route';
  checkInTime?: string;
  checkOutTime?: string;
  lastPunchTimestamp?: string;
  lastPunchType?: 'PUNCH_IN' | 'PUNCH_OUT';
  liveLocation: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: string;
    isInsideGeofence: boolean;
    accuracyMeters?: number;
  };
  avatar: string;
  certifications: string[];
  punchHistory?: WorkerPunchRecord[];
}

export interface SiteUpdateLog {
  id: string;
  projectId: string;
  title: string;
  stage: string;
  progressPercentage: number;
  description: string;
  photos: string[];
  laborCount: number;
  weather: {
    temperature: string;
    condition: string;
    humidity: string;
    windSpeed: string;
  };
  supervisorId: string;
  supervisorName: string;
  timestamp: string;
  gpsLocation?: GeoCoordinate;
  aiAnalysis?: {
    safetyScore: number;
    ppeCompliance: {
      helmets: boolean;
      highVisVests: boolean;
      safetyBoots: boolean;
      fallProtection: boolean;
      notes: string;
    };
    detectedHazards: Array<{
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
      recommendedAction: string;
    }>;
    workProgressEstimate: {
      estimatedStage: string;
      estimatedCompletionPct: number;
      qualityObservations: string;
    };
    summary: string;
  };
}

export interface SafetyIncident {
  id: string;
  projectId: string;
  title: string;
  type: 'Near Miss' | 'PPE Non-Compliance' | 'Equipment Hazard' | 'Fall Risk' | 'Electrical Hazard' | 'Fire Hazard' | 'Excavation Collapse';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Escalated';
  reportedBy: string;
  reportedRole: string;
  locationOnSite: string;
  description: string;
  photos: string[];
  correctiveAction?: string;
  resolutionDate?: string;
  timestamp: string;
  complianceStandard?: string;
}

export interface BudgetExpense {
  id: string;
  projectId: string;
  costCode: string;
  title: string;
  category: 'Materials' | 'Labor Wages' | 'Machinery & Fuel' | 'Subcontractor' | 'Permits & Testing' | 'Safety & Overhead' | 'Materials & Raw Supplies' | 'Heavy Machinery & Fuel' | 'Labor Payroll & Wages' | 'Subcontractor Milestones' | 'Site Overheads & Permits' | 'Quality & Testing';
  plannedAmount: number;
  actualAmount: number;
  variance?: number;
  invoiceNumber: string;
  date: string;
  status?: 'Approved' | 'Pending Review' | 'Flagged' | 'Paid';
  paymentStatus?: 'Approved' | 'Pending Review' | 'Flagged' | 'Paid';
  vendorName?: string;
  vendor?: string;
}

export interface ComplianceDocument {
  id: string;
  projectId: string;
  title: string;
  category: 'Building Permit' | 'Environmental Clearance' | 'Structural Stability' | 'Fire NOC' | 'Labor Insurance' | 'Soil Testing Report' | string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  fileUrl: string;
  fileSize: string;
  driveFileId?: string;
  notes: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedRole?: string;
  uploadDate?: string;
  version: string;
  tags?: string[];
  driveFileId?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'dwg' | 'other';
  url: string;
  size?: string;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  channel: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  avatar?: string;
  text: string;
  language?: LanguageCode;
  photoUrl?: string;
  attachments?: ChatAttachment[];
  timestamp: string;
  translations?: Record<string, string>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  category: 'safety' | 'material' | 'schedule' | 'budget' | 'chat';
  timestamp: string;
  read: boolean;
  projectId?: string;
}

export interface ProjectScheduleMilestone {
  id: string;
  projectId: string;
  title: string;
  stage: string;
  startDate: string;
  endDate: string;
  progressPercentage: number;
  status: 'Completed' | 'In Progress' | 'Delayed' | 'Upcoming';
  assignedLead: string;
  dependencies?: string[];
}

export interface OfflineSyncQueueItem {
  id: string;
  collection: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: number;
}

// ==========================================
// LABOUR CONTRACTOR, RATE OF WORK & P&L TYPES
// ==========================================

export interface BOQItem {
  id: string;
  itemCode: string;
  description: string;
  category:
    | 'RCC & Formwork'
    | 'Steel & Rebar'
    | 'Cement & Concrete'
    | 'Formwork & Shuttering'
    | 'Masonry & Blockwork'
    | 'Masonry & Plaster'
    | 'Plastering'
    | 'Flooring & Tiling'
    | 'Painting & Finishing'
    | 'Earthwork & Excavation'
    | 'Waterproofing'
    | 'Electrical & Plumbing'
    | 'General Civil'
    | 'Other'
    | string;
  unit: 'Sq.Ft' | 'Cu.M' | 'MT' | 'Rft' | 'Sq.M' | 'Brass' | 'Nos' | 'Bags' | 'Days' | string;
  contractRate: number; // ₹ unit rate agreed with contractor
  totalEstimatedQty: number;
  completedQty: number;
  todayCompletedQty?: number;
  totalEarnedValue: number;
}

export interface WorkOrderContract {
  id: string;
  projectId: string;
  workOrderNumber: string; // e.g. WO-2026-042
  contractorName: string;
  contractorPhone: string;
  contractorTrade: string;
  contractorType: 'Piece-Rate Labour Gang' | 'Turnkey Subcontractor' | 'Specialist Agency' | 'Daily Wage Gang';
  scopeOfWork: string;
  boqItems: BOQItem[];
  contractValue: number;
  startDate: string;
  targetEndDate: string;
  status: 'Active' | 'Under Review' | 'Completed' | 'Suspended';
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  fileSize?: string;
  issuedBy: string;
  notes?: string;
  createdAt: string;
  pnlProjection?: WorkOrderPnlProjection;
  milestones?: WorkOrderMilestone[];
  uploadedAt?: string;
}

export type SiteExpenseCategory = 
  | 'Consumables' 
  | 'Transportation & Logistics' 
  | 'Equipment Rental & Fuel' 
  | 'Site Overheads & Misc';

export interface SiteDailyExpense {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  category: SiteExpenseCategory;
  itemDescription: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalAmount: number;
  vendorName: string;
  paidBy: string;
  paymentMode: 'Cash' | 'UPI / Online' | 'Bank Transfer' | 'Petty Cash' | 'Credit / Invoice';
  receiptUrl?: string;
  receiptName?: string;
  status: 'Approved' | 'Paid' | 'Pending';
  notes?: string;
  createdAt: string;
}

export interface TradeLabourCost {
  trade: string;
  count: number;
  averageDailyWage: number;
  normalWages: number;
  overtimeHours: number;
  overtimeWages: number;
  totalCost: number;
}

export interface DailyLabourSummary {
  id: string;
  date: string; // YYYY-MM-DD
  projectId: string;
  projectName: string;
  totalWorkersPresent: number;
  breakdownByTrade: TradeLabourCost[];
  totalNormalCost: number;
  totalOvertimeCost: number;
  totalLabourCost: number;
  importedFromApp: boolean;
  importedAt: string;
  contractorGangName?: string;
  verifiedBySupervisor?: string;
}

export interface DPRBOQProgress {
  boqItemId: string;
  workOrderId?: string;
  itemDescription: string;
  category: string;
  unit: string;
  rate: number;
  todayExecutedQty: number;
  todayEarnedAmount: number;
  locationOrGrid: string;
  qualityRating: 'Satisfactory' | 'Good' | 'Needs Rectification';
}

export interface DailyProgressReport {
  id: string;
  dprNumber: string; // e.g. DPR-2026-08-29-01
  projectId: string;
  projectName: string;
  date: string; // YYYY-MM-DD
  sitePhotos: string[];
  aiGenerated: boolean;
  weather: {
    condition: string;
    temperature: string;
    humidity?: string;
  };
  workDoneSummary: string;
  progressByBOQ: DPRBOQProgress[];
  totalTodayEarnedIncome: number;
  safetyObservations?: string;
  qualityObservations?: string;
  aiDprInsights?: {
    structuralAssessment: string;
    productivityScore: number;
    detectedActivities: string[];
    bottlenecksIdentified: string[];
    safetyScore?: number;
  };
  preparedBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface DailyProfitLossReport {
  id: string;
  projectId: string;
  projectName: string;
  date: string; // YYYY-MM-DD
  dprId?: string;
  
  // Income (Revenue earned from work executed)
  earnedIncomeTotal: number;
  incomeBreakdown: Array<{
    item: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;

  // Expenses incurred for the day
  expensesTotal: number;
  labourCostTotal: number;
  consumablesCostTotal: number;
  transportationCostTotal: number;
  equipmentFuelCostTotal: number;
  materialDirectCostTotal: number;
  miscOverheadCostTotal: number;

  // Net P&L
  netProfitOrLoss: number; // earnedIncomeTotal - expensesTotal
  profitMarginPct: number; // (net / earnedIncome) * 100
  status: 'Profitable' | 'Breakeven' | 'Loss';
  marginHealth: 'EXCELLENT' | 'HEALTHY' | 'SLIM' | 'NEGATIVE';
  
  keyVarianceNotes: string[];
  actionRecommendations: string[];
  generatedAt: string;
}

// =========================================================================
// SITE-WISE DAILY CASH EXPENSES, PETTY CASH IMPREST & PAYMENTS
// =========================================================================

export type CashTransactionType = 
  | 'EXPENSE' 
  | 'TOP_UP' 
  | 'CONTRACTOR_ADVANCE' 
  | 'SUPPLIER_PAYMENT' 
  | 'REFUND' 
  | 'TRANSFER'
  | 'EQUIPMENT_REPAIR'
  | 'LABOUR_WELFARE'
  | 'SITE_UTILITY'
  | 'SAFETY_COMPLIANCE'
  | (string & {});

export type PettyCashExpenseCategory =
  | 'Consumables & Hardware'
  | 'Transportation & Cartage'
  | 'Fuel & Generator Diesel'
  | 'Food, Tea & Labour Welfare'
  | 'Subcontractor Labour Advance'
  | 'Emergency Site Spares'
  | 'Site Maintenance & Cleaning'
  | 'Permits, Tolls & Local Fees'
  | 'Equipment & Tool Rental'
  | 'Medical & First Aid'
  | 'Site Office & Stationery'
  | 'Machinery Spares & Breakdown Repair'
  | 'Quality Testing & Lab Sampling'
  | 'Safety Gear & PPE Replacements'
  | 'Other Site Misc'
  | (string & {});

export interface CustomExpenseCategoryDef {
  id: string;
  name: string;
  costCode: string;
  group: 'Materials' | 'Logistics' | 'Labour & Welfare' | 'Plant & Equipment' | 'Site Admin & Overheads' | 'Statutory & Permits' | 'Other' | (string & {});
  description?: string;
  isCustom?: boolean;
}

export interface CustomTransactionTypeDef {
  id: string;
  label: string;
  flow: 'OUTFLOW' | 'INFLOW';
  description: string;
  iconName?: string;
  color?: string;
  isCustom?: boolean;
}

export type PaymentMode = 
  | 'Cash' 
  | 'UPI / QR' 
  | 'Bank Transfer / IMPS' 
  | 'Cheque' 
  | 'Petty Cash Voucher';

export interface PettyCashAccount {
  id: string;
  projectId: string;
  accountName: string; // e.g. "Metro Line 4 - Main Site Petty Cash Float"
  custodianName: string; // Person holding physical cash on site
  custodianPhone: string;
  custodianRole: string;
  allocatedLimit: number; // Maximum imprest limit, e.g. ₹50,000
  currentBalance: number; // Current physical cash in hand, e.g. ₹18,450
  minimumThreshold: number; // Alert threshold e.g. ₹5,000
  lastReplenishedDate: string;
  status: 'Active' | 'Low Balance' | 'Depleted' | 'Closed';
  notes?: string;
  createdAt: string;
}

export interface DailyCashPayment {
  id: string;
  projectId: string;
  projectName?: string;
  voucherNumber: string; // e.g. "PCV-MTR4-2026-0089"
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: CashTransactionType;
  category: PettyCashExpenseCategory;
  amount: number; // ₹ Total amount paid out or received
  balanceAfter?: number; // Snapshot of remaining petty cash balance
  payee: string; // Person or Vendor receiving cash
  payeePhone?: string;
  paidBy: string; // Supervisor or Storekeeper disbursing cash
  paymentMode: PaymentMode;
  referenceNumber?: string; // Bill no, Challan no, UPI Ref, or Cheque no
  description: string; // Detailed reason for cash payment
  receiptPhotoUrl?: string; // Photo of cash memo, receipt or invoice
  receiptPhotoName?: string;
  status: 'Approved' | 'Paid' | 'Pending Review' | 'Flagged' | 'Rejected';
  approvedBy?: string;
  costCode?: string; // Linked cost code if budgeted
  workOrderId?: string; // Linked work order if labour advance
  contractorName?: string;
  isAdvanceRecovered?: boolean; // For contractor advances
  tags?: string[];
  createdAt: string;
}

export interface CashDenominationCount {
  note500: number;
  note200: number;
  note100: number;
  note50: number;
  note20: number;
  note10: number;
  coins: number;
}

export interface DailyCashReconciliationRecord {
  id: string;
  projectId: string;
  projectName?: string;
  date: string; // YYYY-MM-DD
  openingBalance: number;
  totalCashIn: number; // Replenishments / Refunds
  totalCashOut: number; // Expenses / Advances
  calculatedClosingBalance: number; // Opening + In - Out
  actualPhysicalCashCount: number; // Physical count
  cashDifference: number; // Actual - Calculated (0 is balanced, <0 is shortage, >0 is surplus)
  denominationBreakdown: CashDenominationCount;
  verifiedBy: string;
  verifiedRole: string;
  status: 'Balanced' | 'Discrepancy' | 'Pending Review';
  notes?: string;
  timestamp: string;
}


