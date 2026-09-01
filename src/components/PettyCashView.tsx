import React, { useState, useMemo } from 'react';
import {
  Banknote,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Receipt,
  UserCheck,
  Calculator,
  Building2,
  RefreshCw,
  Trash2,
  Eye,
  Camera,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Coins,
  DollarSign,
  Printer,
  ChevronDown,
  X,
  CreditCard,
  Phone,
  Calendar,
  Tag,
  FolderPlus,
  Sparkles,
  Package,
  Truck,
  Fuel,
  Wrench,
  Coffee,
  HeartPulse,
  HardHat,
  FileText,
  Check,
  Settings2,
  ArrowRightLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DailyCashPayment,
  PettyCashAccount,
  DailyCashReconciliationRecord,
  ProjectSite,
  Role,
  LanguageCode,
  PettyCashExpenseCategory,
  CashTransactionType,
  PaymentMode,
  CashDenominationCount,
  CustomExpenseCategoryDef,
  CustomTransactionTypeDef,
} from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation } from '../lib/i18n';

interface PettyCashViewProps {
  projects: ProjectSite[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  pettyCashAccounts: PettyCashAccount[];
  dailyCashPayments: DailyCashPayment[];
  dailyCashReconciliations: DailyCashReconciliationRecord[];
  currentRole: Role;
  currentLang: LanguageCode;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Consumables & Hardware': '#3b82f6',
  'Transportation & Cartage': '#10b981',
  'Fuel & Generator Diesel': '#f59e0b',
  'Equipment & Tool Rental': '#8b5cf6',
  'Food, Tea & Labour Welfare': '#ec4899',
  'Emergency Medical & First Aid': '#ef4444',
  'Site Maintenance & Cleaning': '#14b8a6',
  'Site Office & Stationery': '#6366f1',
  'Permits, Tolls & Local Fees': '#eab308',
  'Subcontractor Labour Advance': '#f97316',
  'Machinery Spares & Breakdown Repair': '#a855f7',
  'Quality Testing & Lab Sampling': '#06b6d4',
  'Safety Gear & PPE Replacements': '#f43f5e',
  'Other Site Misc': '#64748b',
};

const DEFAULT_TRANSACTION_TYPES: CustomTransactionTypeDef[] = [
  {
    id: 'EXPENSE',
    label: 'Site Expense (Outflow)',
    flow: 'OUTFLOW',
    description: 'Daily consumables, fuel, cartage, stationery & repairs',
    iconName: 'Receipt',
    color: 'emerald',
  },
  {
    id: 'CONTRACTOR_ADVANCE',
    label: 'Contractor / Labour Advance',
    flow: 'OUTFLOW',
    description: 'Cash advance against running labour work orders',
    iconName: 'UserCheck',
    color: 'amber',
  },
  {
    id: 'SUPPLIER_PAYMENT',
    label: 'Direct Supplier Cash',
    flow: 'OUTFLOW',
    description: 'Instant cash settlement for local building material deliveries',
    iconName: 'Truck',
    color: 'blue',
  },
  {
    id: 'EQUIPMENT_REPAIR',
    label: 'Equipment & Spares Emergency',
    flow: 'OUTFLOW',
    description: 'Generator, mixer or crane emergency repair/welding',
    iconName: 'Wrench',
    color: 'purple',
  },
  {
    id: 'LABOUR_WELFARE',
    label: 'Labour Tea & Welfare',
    flow: 'OUTFLOW',
    description: 'Daily worker refreshments, water cans, mess meals',
    iconName: 'Coffee',
    color: 'pink',
  },
  {
    id: 'SITE_UTILITY',
    label: 'Site Utility & Water Tanker',
    flow: 'OUTFLOW',
    description: 'Curing water tanker, diesel refilling & local utility',
    iconName: 'Fuel',
    color: 'teal',
  },
  {
    id: 'SAFETY_COMPLIANCE',
    label: 'Emergency Safety & First Aid',
    flow: 'OUTFLOW',
    description: 'Urgent worker medical clinic visit or PPE replacements',
    iconName: 'HeartPulse',
    color: 'rose',
  },
  {
    id: 'REFUND',
    label: 'Refund / Advance Return (Inflow)',
    flow: 'INFLOW',
    description: 'Return of unspent advance or vendor cash refund',
    iconName: 'ArrowDownRight',
    color: 'indigo',
  },
];

const DEFAULT_EXPENSE_CATEGORIES: CustomExpenseCategoryDef[] = [
  { id: 'cat-01', name: 'Consumables & Hardware', costCode: 'CC-MAT-01', group: 'Materials', description: 'Drill bits, binding wire, nails, cutting discs, safety tape' },
  { id: 'cat-02', name: 'Transportation & Cartage', costCode: 'CC-LOG-02', group: 'Logistics', description: 'Tempo, auto, tractor freight, local material cartage' },
  { id: 'cat-03', name: 'Fuel & Generator Diesel', costCode: 'CC-POL-03', group: 'Plant & Equipment', description: 'Diesel cans for site DG set, vibrator & roller' },
  { id: 'cat-04', name: 'Equipment & Tool Rental', costCode: 'CC-PLT-04', group: 'Plant & Equipment', description: 'Scaffolding, concrete needle vibrator, breaker rental' },
  { id: 'cat-05', name: 'Food, Tea & Labour Welfare', costCode: 'CC-WLF-05', group: 'Labour & Welfare', description: 'Worker daily tea, jaggery, lemon juice, drinking water tankers' },
  { id: 'cat-06', name: 'Emergency Medical & First Aid', costCode: 'CC-HSE-06', group: 'Statutory & Permits', description: 'First aid medicines, bandages, emergency clinic visit' },
  { id: 'cat-07', name: 'Site Maintenance & Cleaning', costCode: 'CC-MNT-07', group: 'Site Admin & Overheads', description: 'Site housekeeping, debris removal, water pump suction' },
  { id: 'cat-08', name: 'Site Office & Stationery', costCode: 'CC-ADM-08', group: 'Site Admin & Overheads', description: 'Blueprints printing, muster registers, markers, paper' },
  { id: 'cat-09', name: 'Permits, Tolls & Local Fees', costCode: 'CC-GOV-09', group: 'Statutory & Permits', description: 'Toll plaza charges, municipal parking & local permissions' },
  { id: 'cat-10', name: 'Subcontractor Labour Advance', costCode: 'CC-ADV-10', group: 'Labour & Welfare', description: 'Daily wage worker advances, mess draws, medical support' },
  { id: 'cat-11', name: 'Machinery Spares & Breakdown Repair', costCode: 'CC-REP-11', group: 'Plant & Equipment', description: 'Hydraulic hose replacement, welding, battery charging' },
  { id: 'cat-12', name: 'Quality Testing & Lab Sampling', costCode: 'CC-QAC-12', group: 'Materials', description: 'Cube testing fee, sand silt test jars, slump cone' },
  { id: 'cat-13', name: 'Safety Gear & PPE Replacements', costCode: 'CC-PPE-13', group: 'Statutory & Permits', description: 'Reflective jackets, safety helmets, cotton gloves' },
  { id: 'cat-99', name: 'Other Site Misc', costCode: 'CC-MSC-99', group: 'Other', description: 'General petty cash expenses' },
];

export const PettyCashView: React.FC<PettyCashViewProps> = ({
  projects = [],
  activeProjectId,
  onSelectProject,
  pettyCashAccounts = [],
  dailyCashPayments = [],
  dailyCashReconciliations = [],
  currentRole,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<
    'vouchers' | 'reconciliation' | 'advances' | 'accounts' | 'analytics'
  >('vouchers');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals
  const [showAddVoucherModal, setShowAddVoucherModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedVoucherForView, setSelectedVoucherForView] = useState<DailyCashPayment | null>(null);

  // Dynamic Catalogs for Categories and Transaction Types
  const [transactionTypes, setTransactionTypes] = useState<CustomTransactionTypeDef[]>(() => {
    const saved = localStorage.getItem('petty_cash_custom_types');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TRANSACTION_TYPES;
      }
    }
    return DEFAULT_TRANSACTION_TYPES;
  });

  const [expenseCategories, setExpenseCategories] = useState<CustomExpenseCategoryDef[]>(() => {
    const saved = localStorage.getItem('petty_cash_custom_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_EXPENSE_CATEGORIES;
      }
    }
    return DEFAULT_EXPENSE_CATEGORIES;
  });

  // Inline Creation Form States
  const [showAddTypeInline, setShowAddTypeInline] = useState(false);
  const [newTypeForm, setNewTypeForm] = useState<{
    label: string;
    flow: 'OUTFLOW' | 'INFLOW';
    description: string;
  }>({
    label: '',
    flow: 'OUTFLOW',
    description: '',
  });

  const [showAddCategoryInline, setShowAddCategoryInline] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState<{
    name: string;
    costCode: string;
    group: 'Materials' | 'Logistics' | 'Plant & Equipment' | 'Labour & Welfare' | 'Site Admin & Overheads' | 'Statutory & Permits' | 'Other';
    description: string;
  }>({
    name: '',
    costCode: 'CC-CUST-01',
    group: 'Materials',
    description: '',
  });

  // Quick category search filter in modal
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // New Voucher Form
  const [voucherForm, setVoucherForm] = useState<{
    projectId: string;
    type: CashTransactionType;
    category: PettyCashExpenseCategory;
    amount: number;
    payee: string;
    payeePhone: string;
    description: string;
    paymentMode: PaymentMode;
    referenceNumber: string;
    paidBy: string;
    date: string;
    time: string;
    costCode: string;
    contractorName?: string;
    recoveryTerms?: string;
    receiptPhotoUrl?: string;
    receiptPhotoName?: string;
  }>({
    projectId: activeProjectId === 'all' ? (projects[0]?.id || 'proj-01') : activeProjectId,
    type: 'EXPENSE',
    category: 'Consumables & Hardware',
    amount: 1500,
    payee: '',
    payeePhone: '',
    description: '',
    paymentMode: 'Cash',
    referenceNumber: '',
    paidBy: 'Site Supervisor',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    costCode: 'CC-MAT-01',
    receiptPhotoUrl: '',
    receiptPhotoName: '',
  });

  // Top Up Form
  const [topUpForm, setTopUpForm] = useState<{
    projectId: string;
    amount: number;
    source: string;
    referenceNumber: string;
    notes: string;
  }>({
    projectId: activeProjectId === 'all' ? (projects[0]?.id || 'proj-01') : activeProjectId,
    amount: 25000,
    source: 'Head Office Accounts / Bank Withdrawal',
    referenceNumber: '',
    notes: 'Site petty cash float replenishment sanctioned for monthly operations.',
  });

  // Reconciliation Denominations State
  const [reconDate, setReconDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reconProjectId, setReconProjectId] = useState<string>(
    activeProjectId === 'all' ? (projects[0]?.id || 'proj-01') : activeProjectId
  );
  const [denominations, setDenominations] = useState<{
    n500: number;
    n200: number;
    n100: number;
    n50: number;
    n20: number;
    n10: number;
    coins: number;
  }>({
    n500: 20,
    n200: 25,
    n100: 40,
    n50: 20,
    n20: 50,
    n10: 100,
    coins: 250,
  });
  const [reconNotes, setReconNotes] = useState<string>('');

  // Selected project for stats
  const currentProject = projects.find((p) => p.id === activeProjectId);
  const isAllProjects = activeProjectId === 'all';

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return dailyCashPayments.filter((p) => {
      if (!isAllProjects && p.projectId !== activeProjectId) return false;
      if (filterType !== 'ALL' && p.type !== filterType) return false;
      if (filterCategory !== 'ALL' && p.category !== filterCategory) return false;
      if (dateFilter && p.date !== dateFilter) return false;
      if (searchTerm) {
        const matchSearch =
          p.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchSearch) return false;
      }
      return true;
    });
  }, [dailyCashPayments, activeProjectId, isAllProjects, filterType, filterCategory, dateFilter, searchTerm]);

  // Current Site Accounts & Balances
  const relevantAccounts = useMemo(() => {
    if (isAllProjects) return pettyCashAccounts;
    return pettyCashAccounts.filter((a) => a.projectId === activeProjectId);
  }, [pettyCashAccounts, activeProjectId, isAllProjects]);

  const totalCashInHand = useMemo(() => {
    return relevantAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
  }, [relevantAccounts]);

  const totalAllocatedFloat = useMemo(() => {
    return relevantAccounts.reduce((acc, a) => acc + (a.allocatedLimit || 0), 0);
  }, [relevantAccounts]);

  // Today's metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOutflow = useMemo(() => {
    return dailyCashPayments
      .filter((p) => {
        if (!isAllProjects && p.projectId !== activeProjectId) return false;
        if (p.date !== todayStr) return false;
        return p.type === 'EXPENSE' || p.type === 'CONTRACTOR_ADVANCE' || p.type === 'SUPPLIER_PAYMENT';
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [dailyCashPayments, activeProjectId, isAllProjects, todayStr]);

  const todayInflow = useMemo(() => {
    return dailyCashPayments
      .filter((p) => {
        if (!isAllProjects && p.projectId !== activeProjectId) return false;
        if (p.date !== todayStr) return false;
        return p.type === 'TOP_UP' || p.type === 'REFUND';
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [dailyCashPayments, activeProjectId, isAllProjects, todayStr]);

  // Physical denomination total calculation
  const calculatedPhysicalCash = useMemo(() => {
    return (
      (denominations.n500 || 0) * 500 +
      (denominations.n200 || 0) * 200 +
      (denominations.n100 || 0) * 100 +
      (denominations.n50 || 0) * 50 +
      (denominations.n20 || 0) * 20 +
      (denominations.n10 || 0) * 10 +
      (denominations.coins || 0)
    );
  }, [denominations]);

  // System closing balance for the selected recon project
  const reconAccount = pettyCashAccounts.find((a) => a.projectId === reconProjectId);
  const reconProjectClosingBalance = reconAccount ? reconAccount.currentBalance : 0;
  const cashDiscrepancy = calculatedPhysicalCash - reconProjectClosingBalance;

  // Chart data: Category wise breakdown
  const categoryChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    dailyCashPayments
      .filter((p) => {
        if (!isAllProjects && p.projectId !== activeProjectId) return false;
        return p.type === 'EXPENSE' || p.type === 'CONTRACTOR_ADVANCE' || p.type === 'SUPPLIER_PAYMENT';
      })
      .forEach((p) => {
        categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.amount;
      });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#94a3b8',
    }));
  }, [dailyCashPayments, activeProjectId, isAllProjects]);

  // Chart data: Daily trend last 7 days
  const dailyTrendData = useMemo(() => {
    const dates: Record<string, { date: string; expense: number; topup: number }> = {};
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dates[dStr] = { date: label, expense: 0, topup: 0 };
    }

    dailyCashPayments.forEach((p) => {
      if (!isAllProjects && p.projectId !== activeProjectId) return;
      if (dates[p.date]) {
        if (p.type === 'EXPENSE' || p.type === 'CONTRACTOR_ADVANCE' || p.type === 'SUPPLIER_PAYMENT') {
          dates[p.date].expense += p.amount;
        } else if (p.type === 'TOP_UP' || p.type === 'REFUND') {
          dates[p.date].topup += p.amount;
        }
      }
    });

    return Object.values(dates);
  }, [dailyCashPayments, activeProjectId, isAllProjects]);

  // Handlers for Custom Transaction Types & Expense Categories
  const handleSaveCustomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeForm.label.trim()) return;
    const cleanId = newTypeForm.label.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 30);
    const existing = transactionTypes.find((t) => t.id === cleanId || t.label.toLowerCase() === newTypeForm.label.toLowerCase());
    if (existing) {
      setVoucherForm((prev) => ({ ...prev, type: existing.id }));
      setShowAddTypeInline(false);
      return;
    }
    const newTypeDef: CustomTransactionTypeDef = {
      id: cleanId,
      label: newTypeForm.label.trim(),
      flow: newTypeForm.flow,
      description: newTypeForm.description || `Custom ${newTypeForm.flow.toLowerCase()} transaction type`,
      color: newTypeForm.flow === 'INFLOW' ? 'indigo' : 'emerald',
      isCustom: true,
    };
    const updated = [...transactionTypes, newTypeDef];
    setTransactionTypes(updated);
    localStorage.setItem('petty_cash_custom_types', JSON.stringify(updated));
    setVoucherForm((prev) => ({ ...prev, type: cleanId }));
    setNewTypeForm({ label: '', flow: 'OUTFLOW', description: '' });
    setShowAddTypeInline(false);
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name.trim()) return;
    const catName = newCategoryForm.name.trim();
    const existing = expenseCategories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    if (existing) {
      setVoucherForm((prev) => ({
        ...prev,
        category: existing.name,
        costCode: existing.costCode || prev.costCode,
      }));
      setShowAddCategoryInline(false);
      return;
    }
    const newCatDef: CustomExpenseCategoryDef = {
      id: `cat-${Date.now()}`,
      name: catName,
      costCode: newCategoryForm.costCode || `CC-CUST-${Math.floor(10 + Math.random() * 90)}`,
      group: newCategoryForm.group,
      description: newCategoryForm.description || `Custom category for ${catName}`,
      isCustom: true,
    };
    const updated = [...expenseCategories, newCatDef];
    setExpenseCategories(updated);
    localStorage.setItem('petty_cash_custom_categories', JSON.stringify(updated));
    setVoucherForm((prev) => ({
      ...prev,
      category: catName,
      costCode: newCatDef.costCode,
    }));
    setNewCategoryForm({
      name: '',
      costCode: `CC-CUST-${Math.floor(10 + Math.random() * 90)}`,
      group: 'Materials',
      description: '',
    });
    setShowAddCategoryInline(false);
  };

  const handleSelectCategory = (catName: string) => {
    const matched = expenseCategories.find((c) => c.name === catName);
    setVoucherForm((prev) => ({
      ...prev,
      category: catName,
      costCode: matched?.costCode || prev.costCode,
    }));
  };

  const handleSelectType = (typeId: CashTransactionType) => {
    setVoucherForm((prev) => ({
      ...prev,
      type: typeId,
    }));
  };

  // Handlers
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.amount || voucherForm.amount <= 0 || !voucherForm.payee || !voucherForm.description) {
      alert('Please fill all required voucher fields.');
      return;
    }

    const targetProj = projects.find((p) => p.id === voucherForm.projectId);
    const voucherPrefix = targetProj?.code ? targetProj.code.replace(/[^A-Za-z0-9]/g, '').substring(0, 4) : 'SITE';
    const voucherNo = `PCV-${voucherPrefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let finalDesc = voucherForm.description;
    if (voucherForm.type === 'CONTRACTOR_ADVANCE' && voucherForm.contractorName) {
      finalDesc = `[Adv to: ${voucherForm.contractorName}${voucherForm.recoveryTerms ? ` | Recovery: ${voucherForm.recoveryTerms}` : ''}] ${voucherForm.description}`;
    }

    store.addPettyCashPayment({
      projectId: voucherForm.projectId,
      projectName: targetProj?.name || 'Site Project',
      voucherNumber: voucherNo,
      date: voucherForm.date,
      time: voucherForm.time,
      type: voucherForm.type,
      category: voucherForm.category,
      amount: Number(voucherForm.amount),
      payee: voucherForm.payee,
      payeePhone: voucherForm.payeePhone || undefined,
      description: finalDesc,
      paymentMode: voucherForm.paymentMode,
      referenceNumber: voucherForm.referenceNumber || undefined,
      costCode: voucherForm.costCode || undefined,
      paidBy: voucherForm.paidBy || 'Site Supervisor',
      status: 'Approved',
      approvedBy: 'Project Manager (Automated Policy)',
      receiptPhotoUrl: voucherForm.receiptPhotoUrl || undefined,
      receiptPhotoName: voucherForm.receiptPhotoName || undefined,
    });

    setShowAddVoucherModal(false);
    // Reset form
    setVoucherForm({
      projectId: activeProjectId === 'all' ? (projects[0]?.id || 'proj-01') : activeProjectId,
      type: 'EXPENSE',
      category: 'Consumables & Hardware',
      amount: 1500,
      payee: '',
      payeePhone: '',
      description: '',
      paymentMode: 'Cash',
      referenceNumber: '',
      paidBy: 'Site Supervisor',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      costCode: 'CC-MAT-01',
      receiptPhotoUrl: '',
      receiptPhotoName: '',
    });
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpForm.amount || topUpForm.amount <= 0) {
      alert('Please enter a valid replenishment amount.');
      return;
    }

    store.topUpPettyCashAccount(
      topUpForm.projectId,
      Number(topUpForm.amount),
      topUpForm.notes,
      topUpForm.referenceNumber,
      topUpForm.source
    );

    setShowTopUpModal(false);
  };

  const handleSaveReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProject = projects.find((p) => p.id === reconProjectId);
    const dayPayments = dailyCashPayments.filter((p) => p.projectId === reconProjectId && p.date === reconDate);

    const totalCashInflow = dayPayments
      .filter((p) => p.type === 'TOP_UP' || p.type === 'REFUND')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalCashOutflow = dayPayments
      .filter((p) => p.type === 'EXPENSE' || p.type === 'CONTRACTOR_ADVANCE' || p.type === 'SUPPLIER_PAYMENT')
      .reduce((sum, p) => sum + p.amount, 0);

    const account = pettyCashAccounts.find((a) => a.projectId === reconProjectId);
    const openingBalance = (account?.currentBalance || 0) + totalCashOutflow - totalCashInflow;
    const closingBalance = account?.currentBalance || 0;
    const diff = calculatedPhysicalCash - closingBalance;

    let status: 'Balanced' | 'Discrepancy' | 'Pending Review' = 'Balanced';
    if (Math.abs(diff) > 5) {
      status = 'Discrepancy';
    }

    store.saveDailyCashReconciliation({
      projectId: reconProjectId,
      projectName: targetProject?.name || 'Site Project',
      date: reconDate,
      openingBalance: Math.max(0, openingBalance),
      totalCashIn: totalCashInflow,
      totalCashOut: totalCashOutflow,
      calculatedClosingBalance: closingBalance,
      actualPhysicalCashCount: calculatedPhysicalCash,
      cashDifference: diff,
      status,
      denominationBreakdown: {
        note500: denominations.n500,
        note200: denominations.n200,
        note100: denominations.n100,
        note50: denominations.n50,
        note20: denominations.n20,
        note10: denominations.n10,
        coins: denominations.coins,
      },
      verifiedBy: 'Arjun Patel',
      verifiedRole: currentRole,
      notes: reconNotes || `Daily physical cash count completed. Total physical notes & coins: ₹${calculatedPhysicalCash.toLocaleString('en-IN')}.`,
    });

    setShowReconcileModal(false);
  };

  const handleExportCSV = () => {
    const csvContent = store.exportPettyCashCSV(activeProjectId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Site_Petty_Cash_Book_${activeProjectId}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVoucherForm((prev) => ({
          ...prev,
          receiptPhotoUrl: event.target?.result as string,
          receiptPhotoName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header & Site Scope Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Site Daily Cash & Petty Cash Management</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-mono font-medium border border-emerald-700/40">
                  Imprest & Vouchers
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Site-wise daily cash expenses, contractor micro-advances, float replenishments & physical cash tally
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="btn-export-cashbook"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Cash Book</span>
          </button>

          <button
            id="btn-reconcile-cash"
            onClick={() => {
              setReconProjectId(activeProjectId === 'all' ? (projects[0]?.id || 'proj-01') : activeProjectId);
              setShowReconcileModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-900/70 hover:bg-indigo-800/80 border border-indigo-700/50 text-indigo-200 text-xs font-semibold transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span>Physical Tally & Sign-Off</span>
          </button>

          <button
            id="btn-topup-float"
            onClick={() => {
              setTopUpForm((prev) => ({
                ...prev,
                projectId: activeProjectId === 'all' ? (projects[0]?.id || 'proj-01') : activeProjectId,
              }));
              setShowTopUpModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-900/70 hover:bg-amber-800/80 border border-amber-700/50 text-amber-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replenish Float</span>
          </button>

          <button
            id="btn-add-cash-voucher"
            onClick={() => {
              setVoucherForm((prev) => ({
                ...prev,
                projectId: activeProjectId === 'all' ? (projects[0]?.id || 'proj-01') : activeProjectId,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }));
              setShowAddVoucherModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Cash Voucher</span>
          </button>
        </div>
      </div>

      {/* Site Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5" /> Scope:
        </span>
        <button
          onClick={() => onSelectProject('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeProjectId === 'all'
              ? 'bg-orange-500 text-white shadow-sm font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
          }`}
        >
          All Sites Portfolio ({pettyCashAccounts.length} Floats)
        </button>
        {projects.map((proj) => {
          const acc = pettyCashAccounts.find((a) => a.projectId === proj.id);
          const isSelected = activeProjectId === proj.id;
          return (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-sm font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <span>{proj.name}</span>
              {acc && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    acc.status === 'Depleted'
                      ? 'bg-red-500/80 text-white'
                      : acc.status === 'Low Balance'
                      ? 'bg-amber-500/80 text-black'
                      : isSelected
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-900 text-emerald-400'
                  }`}
                >
                  ₹{(acc.currentBalance / 1000).toFixed(0)}k
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash In Hand */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isAllProjects ? 'Total Cash In Hand (All Sites)' : 'Site Cash In Hand (Float)'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              ₹ {totalCashInHand.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / limit ₹{totalAllocatedFloat.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  totalAllocatedFloat > 0 && totalCashInHand / totalAllocatedFloat < 0.2
                    ? 'bg-red-500'
                    : totalAllocatedFloat > 0 && totalCashInHand / totalAllocatedFloat < 0.4
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, totalAllocatedFloat > 0 ? (totalCashInHand / totalAllocatedFloat) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {relevantAccounts.filter((a) => a.status === 'Low Balance' || a.status === 'Depleted').length > 0
                ? '⚠️ Low float warning on site'
                : '✓ Float adequate for daily ops'}
            </span>
            <span className="text-slate-300 font-mono font-medium">
              {totalAllocatedFloat > 0 ? Math.round((totalCashInHand / totalAllocatedFloat) * 100) : 0}% available
            </span>
          </div>
        </div>

        {/* Today's Cash Outflow */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today's Cash Disbursed
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-700/50 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono tracking-tight">
              ₹ {todayOutflow.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>
              {dailyCashPayments.filter((p) => p.date === todayStr && (isAllProjects || p.projectId === activeProjectId)).length} vouchers recorded today
            </span>
          </p>
        </div>

        {/* Today's Float Replenishment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today's Replenishments
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400 font-mono tracking-tight">
              ₹ {todayInflow.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            <span>Bank / HO transfer to site floats</span>
          </p>
        </div>

        {/* Daily Cash Reconciliation Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Daily Physical Tally
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              {dailyCashReconciliations.some((r) => r.date === todayStr && (isAllProjects || r.projectId === activeProjectId))
                ? 'Balanced & Signed'
                : 'Pending Daily Sign-Off'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {dailyCashReconciliations.length > 0
              ? `Last signed: ${dailyCashReconciliations[0].date} by ${dailyCashReconciliations[0].verifiedBy}`
              : 'Physical count required before evening lockup'}
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'vouchers', label: 'Cash Vouchers & Transactions', icon: <Receipt className="w-4 h-4" />, count: filteredPayments.length },
          { id: 'reconciliation', label: 'Daily Physical Cash Tally & Drawer', icon: <Calculator className="w-4 h-4" /> },
          { id: 'advances', label: 'Contractor & Labour Advances', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'accounts', label: 'Site Accounts & Custodians', icon: <Building2 className="w-4 h-4" />, count: relevantAccounts.length },
          { id: 'analytics', label: 'Cash Flow Analytics & Trends', icon: <Layers className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800 text-orange-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 font-mono">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Vouchers & Transactions */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search voucher #, payee, desc, or ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="ALL">All Transaction Types</option>
                {transactionTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.flow === 'INFLOW' ? '🟢 ' : '🔻 '}
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-orange-500 max-w-[200px]"
              >
                <option value="ALL">All Categories</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    [{c.group}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter & Clear */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-orange-500"
              />
              {(searchTerm || filterType !== 'ALL' || filterCategory !== 'ALL' || dateFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('ALL');
                    setFilterCategory('ALL');
                    setDateFilter('');
                  }}
                  className="px-2 py-1.5 rounded text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-700/80">
                  <tr>
                    <th className="py-3 px-4">Voucher No & Date</th>
                    {isAllProjects && <th className="py-3 px-4">Site Location</th>}
                    <th className="py-3 px-4">Category & Payee</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Disbursed By</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-right">Balance After</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={isAllProjects ? 10 : 9} className="py-8 text-center text-slate-500">
                        No cash transactions match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const isExpense =
                        p.type === 'EXPENSE' || p.type === 'CONTRACTOR_ADVANCE' || p.type === 'SUPPLIER_PAYMENT';
                      const proj = projects.find((pr) => pr.id === p.projectId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Voucher No & Date */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                              <span>{p.voucherNumber}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-semibold uppercase ${
                                  p.type === 'TOP_UP'
                                    ? 'bg-blue-900/80 text-blue-300'
                                    : p.type === 'CONTRACTOR_ADVANCE'
                                    ? 'bg-amber-900/80 text-amber-300'
                                    : 'bg-emerald-900/60 text-emerald-300'
                                }`}
                              >
                                {p.type === 'TOP_UP'
                                  ? 'TOP UP'
                                  : p.type === 'CONTRACTOR_ADVANCE'
                                  ? 'ADVANCE'
                                  : 'CASH OUT'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {p.date} • {p.time || '12:00 PM'}
                            </div>
                          </td>

                          {/* Site Location (if All Sites) */}
                          {isAllProjects && (
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-200">{proj?.name || p.projectName}</span>
                              <div className="text-[10px] text-slate-500">{proj?.code}</div>
                            </td>
                          )}

                          {/* Category & Payee */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{p.payee}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: CATEGORY_COLORS[p.category] || '#64748b' }}
                              />
                              <span>{p.category}</span>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="py-3 px-4 max-w-xs">
                            <p className="text-slate-300 truncate" title={p.description}>
                              {p.description}
                            </p>
                            {p.costCode && (
                              <span className="text-[10px] font-mono text-slate-500">
                                Cost Code: {p.costCode}
                              </span>
                            )}
                          </td>

                          {/* Payment Mode */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                              {p.paymentMode}
                            </span>
                            {p.referenceNumber && (
                              <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate max-w-[120px]">
                                Ref: {p.referenceNumber}
                              </div>
                            )}
                          </td>

                          {/* Disbursed By */}
                          <td className="py-3 px-4">
                            <div className="text-slate-300">{p.paidBy}</div>
                            <div className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>{p.status}</span>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-mono font-bold text-sm ${
                                isExpense ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {isExpense ? '-' : '+'} ₹ {p.amount.toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Balance After */}
                          <td className="py-3 px-4 text-right">
                            {p.balanceAfter !== undefined ? (
                              <span className="font-mono text-xs text-slate-400">
                                ₹ {p.balanceAfter.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Receipt */}
                          <td className="py-3 px-4 text-center">
                            {p.receiptPhotoUrl ? (
                              <button
                                onClick={() => setSelectedVoucherForView(p)}
                                className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-[10px] font-bold hover:bg-emerald-900 transition-colors"
                              >
                                View Bill
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[10px]">No Bill</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedVoucherForView(p)}
                                title="Print / View Voucher Slip"
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete cash voucher ${p.voucherNumber} (₹${p.amount})? This will restore the account balance.`)) {
                                    store.deletePettyCashPayment(p.id);
                                  }
                                }}
                                title="Delete Voucher"
                                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Daily Physical Cash Tally & Drawer Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Cash Drawer Denomination Counter */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Physical Cash Drawer Denomination Calculator</h3>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Site:</label>
                  <select
                    value={reconProjectId}
                    onChange={(e) => setReconProjectId(e.target.value)}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                  >
                    {projects.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Count the physical currency notes and coins currently present in the site cash drawer or safe. The system will compute any discrepancy against the expected ledger balance.
              </p>

              {/* Denominations Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'n500', label: '₹ 500 Notes', multiplier: 500, count: denominations.n500 },
                  { key: 'n200', label: '₹ 200 Notes', multiplier: 200, count: denominations.n200 },
                  { key: 'n100', label: '₹ 100 Notes', multiplier: 100, count: denominations.n100 },
                  { key: 'n50', label: '₹ 50 Notes', multiplier: 50, count: denominations.n50 },
                  { key: 'n20', label: '₹ 20 Notes', multiplier: 20, count: denominations.n20 },
                  { key: 'n10', label: '₹ 10 Notes', multiplier: 10, count: denominations.n10 },
                  { key: 'coins', label: 'Coins Total (₹)', multiplier: 1, count: denominations.coins },
                ].map((den) => (
                  <div key={den.key} className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                      <span>{den.label}</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ₹ {((den.count || 0) * den.multiplier).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={den.count}
                      onChange={(e) =>
                        setDenominations((prev) => ({
                          ...prev,
                          [den.key]: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* Tally Summary Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Total Physical Cash in Drawer</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹ {calculatedPhysicalCash.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-semibold">Ledger Closing Balance</div>
                  <div className="text-2xl font-black text-slate-200 font-mono">
                    ₹ {reconProjectClosingBalance.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-semibold">Difference / Variance</div>
                  <div
                    className={`text-2xl font-black font-mono flex items-center gap-1 ${
                      cashDiscrepancy === 0
                        ? 'text-emerald-400'
                        : cashDiscrepancy > 0
                        ? 'text-blue-400'
                        : 'text-rose-400'
                    }`}
                  >
                    <span>{cashDiscrepancy > 0 ? '+' : ''}₹ {cashDiscrepancy.toLocaleString('en-IN')}</span>
                    {cashDiscrepancy === 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {cashDiscrepancy === 0
                      ? '✓ Cash drawer fully balanced'
                      : cashDiscrepancy > 0
                      ? 'Cash Surplus in drawer'
                      : 'Cash Shortage in drawer'}
                  </div>
                </div>
              </div>

              {/* Notes & Sign-off Button */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Reconciliation & Audit Notes</label>
                <textarea
                  rows={2}
                  value={reconNotes}
                  onChange={(e) => setReconNotes(e.target.value)}
                  placeholder="e.g., Physical count matched perfectly during evening shift handover. Verified with Site In-Charge."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveReconciliation}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign & Save Daily Tally Record</span>
                </button>
              </div>
            </div>

            {/* Right Col: Past Reconciliation Records */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center justify-between">
                <span>Recent Daily Tally Logs</span>
                <span className="text-xs text-slate-500 font-mono font-normal">Audit Trail</span>
              </h3>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {dailyCashReconciliations.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No physical reconciliation records logged yet.
                  </p>
                ) : (
                  dailyCashReconciliations.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-slate-800/80 border border-slate-700/70 rounded-lg p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{rec.projectName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            rec.status === 'Balanced'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          Date: <span className="text-slate-200 font-medium">{rec.date}</span>
                        </div>
                        <div>
                          Physical: <span className="text-emerald-400 font-mono font-bold">₹{rec.actualPhysicalCashCount.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          Calculated: <span className="text-slate-200 font-mono">₹{rec.calculatedClosingBalance.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          Variance: <span className={rec.cashDifference === 0 ? 'text-emerald-400' : 'text-rose-400'}>₹{rec.cashDifference}</span>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Signed by: {rec.verifiedBy}</span>
                        <span className="font-mono text-slate-500">{rec.timestamp.split('T')[0]}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Contractor & Labour Cash Advances */}
      {activeTab === 'advances' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 shadow-md flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Labour Contractor & Daily Worker Advances</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Site-level micro cash advances disbursed for mess food, emergency medicines, travel, or weekly wage draws.
              </p>
            </div>
            <button
              onClick={() => {
                setVoucherForm((prev) => ({
                  ...prev,
                  type: 'CONTRACTOR_ADVANCE',
                  category: 'Contractor Minor Advance',
                }));
                setShowAddVoucherModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Contractor Advance</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyCashPayments
              .filter((p) => {
                if (!isAllProjects && p.projectId !== activeProjectId) return false;
                return p.type === 'CONTRACTOR_ADVANCE';
              })
              .map((adv) => {
                const proj = projects.find((pr) => pr.id === adv.projectId);
                return (
                  <div key={adv.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-orange-400">{adv.voucherNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-700/50 font-semibold">
                        Advance Draw
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white">{adv.payee}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{adv.description}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Site</div>
                        <div className="text-slate-300 font-medium">{proj?.name || adv.projectName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Disbursed</div>
                        <div className="font-mono font-bold text-rose-400 text-sm">
                          ₹ {adv.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Date: {adv.date}</span>
                      <span>By: {adv.paidBy}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: Site Accounts & Custodians */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {relevantAccounts.map((acc) => {
            const proj = projects.find((p) => p.id === acc.projectId);
            const utilizationPct = acc.allocatedLimit > 0 ? (acc.currentBalance / acc.allocatedLimit) * 100 : 0;
            return (
              <div
                key={acc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{proj?.code || 'SITE'}</span>
                    <h3 className="font-bold text-white text-base mt-0.5">{acc.accountName}</h3>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      acc.status === 'Active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : acc.status === 'Low Balance'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                        : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                    }`}
                  >
                    {acc.status}
                  </span>
                </div>

                {/* Balance Progress */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Imprest Balance</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₹ {acc.currentBalance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        utilizationPct < 20 ? 'bg-red-500' : utilizationPct < 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, utilizationPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Limit: ₹{acc.allocatedLimit.toLocaleString('en-IN')}</span>
                    <span>Alert Threshold: ₹{acc.minimumThreshold.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Custodian details */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Custodian In-Charge:</span>
                    <span className="font-semibold text-white">{acc.custodianName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span>{acc.custodianRole}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-mono">{acc.custodianPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Replenished:</span>
                    <span className="text-slate-400">{acc.lastReplenishedDate}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTopUpForm((prev) => ({
                        ...prev,
                        projectId: acc.projectId,
                      }));
                      setShowTopUpModal(true);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-200 text-xs font-bold text-center transition-colors"
                  >
                    Top-Up Float
                  </button>
                  <button
                    onClick={() => {
                      onSelectProject(acc.projectId);
                      setActiveTab('vouchers');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    View Vouchers
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: Cash Flow Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Outflow vs Inflow Trend */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span>7-Day Daily Cash Flow Trend</span>
              <span className="text-xs text-slate-500">Inflow vs Outflow</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrendData}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                    formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="expense" name="Cash Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="topup" name="Float Replenishment" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Category Breakdown Pie */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span>Expenses by Category</span>
              <span className="text-xs text-slate-500">Distribution</span>
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              {categoryChartData.length === 0 ? (
                <p className="text-xs text-slate-500">No expense records logged yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                      formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Category legends */}
            <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1 text-[11px]">
              {categoryChartData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="font-mono text-slate-200 font-semibold shrink-0">
                    ₹{c.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD CASH VOUCHER                                                  */}
      {/* ========================================================================= */}
      {showAddVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">Record Site Cash Voucher</h3>
                  <p className="text-xs text-slate-400">Issue petty cash voucher, track expense categories & update site float</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddVoucherModal(false);
                  setShowAddTypeInline(false);
                  setShowAddCategoryInline(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4">
              {/* Site Selection & Transaction Flow Indicator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Site Project *</label>
                  <select
                    value={voucherForm.projectId}
                    onChange={(e) => setVoucherForm({ ...voucherForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Current Site Float Balance</label>
                  {(() => {
                    const currentSiteAccount = pettyCashAccounts.find((a) => a.projectId === voucherForm.projectId);
                    const bal = currentSiteAccount?.currentBalance || 0;
                    return (
                      <div className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                        <span className="text-slate-400">Available in drawer:</span>
                        <span className="font-mono font-bold text-emerald-400">₹ {bal.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SECTION: TRANSACTION TYPE & FLOW                              */}
              {/* ------------------------------------------------------------- */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
                    <span>Transaction Type & Cash Flow *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddTypeInline(!showAddTypeInline)}
                    className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddTypeInline ? 'Close Form' : '+ Add Custom Type'}</span>
                  </button>
                </div>

                {/* Inline Add Transaction Type Form */}
                {showAddTypeInline && (
                  <div className="p-3 bg-slate-900 border border-orange-500/40 rounded-lg space-y-2.5 animate-fadeIn">
                    <div className="text-xs font-bold text-orange-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create New Transaction Type</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-300 block mb-0.5">Type Name / Label *</label>
                        <input
                          type="text"
                          placeholder="e.g. Client Site PR, Crane Batta"
                          value={newTypeForm.label}
                          onChange={(e) => setNewTypeForm({ ...newTypeForm, label: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 block mb-0.5">Cash Flow Direction *</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewTypeForm({ ...newTypeForm, flow: 'OUTFLOW' })}
                            className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition-all ${
                              newTypeForm.flow === 'OUTFLOW'
                                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            🔻 Outflow (Expense)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTypeForm({ ...newTypeForm, flow: 'INFLOW' })}
                            className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition-all ${
                              newTypeForm.flow === 'INFLOW'
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            🟢 Inflow (Refund)
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-300 block mb-0.5">Description (Optional)</label>
                      <input
                        type="text"
                        placeholder="Brief summary of when this type is used"
                        value={newTypeForm.description}
                        onChange={(e) => setNewTypeForm({ ...newTypeForm, description: e.target.value })}
                        className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddTypeInline(false)}
                        className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCustomType}
                        className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                      >
                        Save & Select Type
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Type Selection Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {transactionTypes.slice(0, 8).map((t) => {
                    const isSelected = voucherForm.type === t.id;
                    const isOutflow = t.flow === 'OUTFLOW';
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectType(t.id)}
                        className={`px-2.5 py-2 rounded-lg text-left text-xs transition-all border ${
                          isSelected
                            ? isOutflow
                              ? 'bg-rose-950/70 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/50'
                              : 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">{t.label}</span>
                          <span className="text-[10px] shrink-0 font-mono">
                            {isOutflow ? '🔻' : '🟢'}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 truncate mt-0.5">{t.description}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Extended Type Dropdown */}
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0">Selected Type:</span>
                  <select
                    value={voucherForm.type}
                    onChange={(e) => handleSelectType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500 font-medium"
                  >
                    {transactionTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.flow === 'INFLOW' ? '🟢 Inflow - ' : '🔻 Outflow - '}
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SECTION: EXPENSE CATEGORY & COST CODE                         */}
              {/* ------------------------------------------------------------- */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      <span>Expense Category & Cost Code *</span>
                    </label>
                    {voucherForm.costCode && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-mono text-[10px]">
                        GL: {voucherForm.costCode}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryInline(!showAddCategoryInline)}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddCategoryInline ? 'Close Form' : '+ Add New Category'}</span>
                  </button>
                </div>

                {/* Inline Add Expense Category Form */}
                {showAddCategoryInline && (
                  <div className="p-3 bg-slate-900 border border-blue-500/40 rounded-lg space-y-2.5 animate-fadeIn">
                    <div className="text-xs font-bold text-blue-300 flex items-center gap-1">
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Create New Expense Category</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-300 block mb-0.5">Category Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Scaffolding Clamps Daily, Water Tanker"
                          value={newCategoryForm.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewCategoryForm({
                              ...newCategoryForm,
                              name: val,
                              costCode: newCategoryForm.costCode || `CC-CUST-${Math.floor(10 + Math.random() * 90)}`,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 block mb-0.5">Cost Code (GL)</label>
                        <input
                          type="text"
                          placeholder="CC-MAT-99"
                          value={newCategoryForm.costCode}
                          onChange={(e) => setNewCategoryForm({ ...newCategoryForm, costCode: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-300 block mb-0.5">Account Head / Group *</label>
                        <select
                          value={newCategoryForm.group}
                          onChange={(e) => setNewCategoryForm({ ...newCategoryForm, group: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                        >
                          <option value="Materials">Materials & Consumables</option>
                          <option value="Logistics">Logistics & Transportation</option>
                          <option value="Plant & Equipment">Plant & Equipment / Machinery</option>
                          <option value="Labour & Welfare">Labour & Worker Welfare</option>
                          <option value="Site Admin & Overheads">Site Admin & Overheads</option>
                          <option value="Statutory & Permits">Statutory, Safety & Permits</option>
                          <option value="Other">Other Miscellaneous</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-300 block mb-0.5">Description / Purpose</label>
                        <input
                          type="text"
                          placeholder="Brief items covered in this category"
                          value={newCategoryForm.description}
                          onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryInline(false)}
                        className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCustomCategory}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                      >
                        Save & Select Category
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick 1-Click Category Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Consumables & Hardware',
                    'Fuel & Generator Diesel',
                    'Transportation & Cartage',
                    'Food, Tea & Labour Welfare',
                    'Equipment & Tool Rental',
                    'Emergency Medical & First Aid',
                    'Subcontractor Labour Advance',
                    'Site Office & Stationery',
                  ].map((catName) => {
                    const isSelected = voucherForm.category === catName;
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => handleSelectCategory(catName)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                        }`}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>

                {/* Full Grouped Category Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Category Catalog</label>
                    <select
                      value={voucherForm.category}
                      onChange={(e) => handleSelectCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                    >
                      {expenseCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          [{c.group}] {c.name} ({c.costCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Cost Code Head</label>
                    <input
                      type="text"
                      value={voucherForm.costCode}
                      onChange={(e) => setVoucherForm({ ...voucherForm, costCode: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      placeholder="e.g. CC-MAT-01"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SECTION: AMOUNT & LIVE FLOAT IMPACT PREVIEW                   */}
              {/* ------------------------------------------------------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Voucher Amount (₹ INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-mono font-bold text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={voucherForm.amount}
                      onChange={(e) => setVoucherForm({ ...voucherForm, amount: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. 1500"
                    />
                  </div>
                </div>

                {/* Float Impact Preview */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Projected Float Balance</label>
                  {(() => {
                    const currentSiteAccount = pettyCashAccounts.find((a) => a.projectId === voucherForm.projectId);
                    const currentBal = currentSiteAccount?.currentBalance || 0;
                    const matchedType = transactionTypes.find((t) => t.id === voucherForm.type);
                    const isInflow = matchedType ? matchedType.flow === 'INFLOW' : (voucherForm.type === 'TOP_UP' || voucherForm.type === 'REFUND');
                    const simulatedNewBal = isInflow ? currentBal + Number(voucherForm.amount || 0) : currentBal - Number(voucherForm.amount || 0);
                    const isDeficit = simulatedNewBal < 0;

                    return (
                      <div className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        isDeficit
                          ? 'bg-rose-950/80 border-rose-600/70 text-rose-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Impact:</span>
                          <span className={`font-bold font-mono ${isInflow ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isInflow ? '+' : '-'} ₹{Number(voucherForm.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">New Cash In Hand:</span>
                          <span className={`font-mono font-bold text-sm ${isDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ₹ {simulatedNewBal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CONTRACTOR ADVANCE EXTRA FIELDS (CONDITIONAL)                 */}
              {/* ------------------------------------------------------------- */}
              {(voucherForm.type === 'CONTRACTOR_ADVANCE' || voucherForm.type.includes('ADVANCE')) && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2 animate-fadeIn">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Contractor / Worker Advance Particulars</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-300 block mb-0.5">Contractor / Gang Leader Name *</label>
                      <input
                        type="text"
                        value={voucherForm.contractorName || ''}
                        onChange={(e) => setVoucherForm({ ...voucherForm, contractorName: e.target.value })}
                        placeholder="e.g. Raju Bar Bending Contractor / Mistri"
                        className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-300 block mb-0.5">Advance Recovery Terms / Deductions</label>
                      <input
                        type="text"
                        value={voucherForm.recoveryTerms || ''}
                        onChange={(e) => setVoucherForm({ ...voucherForm, recoveryTerms: e.target.value })}
                        placeholder="e.g. Deduct from RA Bill #3 or Saturday Muster"
                        className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payee / Vendor & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Payee / Vendor / Contractor *</label>
                  <input
                    type="text"
                    required
                    value={voucherForm.payee}
                    onChange={(e) => setVoucherForm({ ...voucherForm, payee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., Mahadev Hardware Store / Raju Mistri"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Payee Phone / Contact</label>
                  <input
                    type="text"
                    value={voucherForm.payeePhone}
                    onChange={(e) => setVoucherForm({ ...voucherForm, payeePhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., +91 98765 43210"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Purpose / Item Description *</label>
                <textarea
                  rows={2}
                  required
                  value={voucherForm.description}
                  onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., 20 pcs Binding wire, 2 pkt concrete nails, and cutting wheels for Column shuttering"
                />
              </div>

              {/* Mode, Date, Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Mode</label>
                  <select
                    value={voucherForm.paymentMode}
                    onChange={(e) => setVoucherForm({ ...voucherForm, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Cash">Physical Cash (Drawer)</option>
                    <option value="UPI / QR">Site UPI / QR Scanner</option>
                    <option value="Petty Cash Voucher">Supervisor Imprest Voucher</option>
                    <option value="Bank Transfer / IMPS">Direct Bank / IMPS</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={voucherForm.date}
                    onChange={(e) => setVoucherForm({ ...voucherForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ref / Bill No.</label>
                  <input
                    type="text"
                    value={voucherForm.referenceNumber}
                    onChange={(e) => setVoucherForm({ ...voucherForm, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                    placeholder="e.g., BILL-9821 / UPI-Ref"
                  />
                </div>
              </div>

              {/* Receipt Photo Upload */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-400" /> Attach Bill / Cash Memo Photo
                  </label>
                  {voucherForm.receiptPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setVoucherForm({ ...voucherForm, receiptPhotoUrl: '', receiptPhotoName: '' })}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                {voucherForm.receiptPhotoUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={voucherForm.receiptPhotoUrl}
                      alt="Receipt preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                    />
                    <div className="text-xs text-slate-400 truncate">
                      <span className="text-emerald-400 font-semibold">✓ Photo Attached:</span>{' '}
                      {voucherForm.receiptPhotoName || 'receipt.jpg'}
                    </div>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVoucherModal(false);
                    setShowAddTypeInline(false);
                    setShowAddCategoryInline(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Save & Record Cash Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REPLENISH PETTY CASH FLOAT (TOP-UP)                              */}
      {/* ========================================================================= */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Replenish Site Petty Cash Float</h3>
                  <p className="text-xs text-slate-400">Transfer funds from Head Office / Bank to site imprest</p>
                </div>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Site Project *</label>
                <select
                  value={topUpForm.projectId}
                  onChange={(e) => setTopUpForm({ ...topUpForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Replenishment Amount (₹ INR) *</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={topUpForm.amount}
                  onChange={(e) => setTopUpForm({ ...topUpForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Source of Funds *</label>
                <select
                  value={topUpForm.source}
                  onChange={(e) => setTopUpForm({ ...topUpForm, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Head Office Accounts / Bank Withdrawal">Head Office Accounts / Bank Withdrawal</option>
                  <option value="Online IMPS / NEFT Transfer to Supervisor">Online IMPS / NEFT to Supervisor</option>
                  <option value="Company Current Account Cheque Encashment">Company Current Account Cheque Encashment</option>
                  <option value="Inter-Site Cash Transfer">Inter-Site Cash Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bank Reference / UTR Number</label>
                <input
                  type="text"
                  value={topUpForm.referenceNumber}
                  onChange={(e) => setTopUpForm({ ...topUpForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  placeholder="e.g. UTR-20260830-4921"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Sanction Notes / Authorization</label>
                <textarea
                  rows={2}
                  value={topUpForm.notes}
                  onChange={(e) => setTopUpForm({ ...topUpForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Confirm Float Top-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW / PRINT CASH VOUCHER SLIP                                    */}
      {/* ========================================================================= */}
      {selectedVoucherForView && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Petty Cash Voucher Slip</h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedVoucherForView.voucherNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedVoucherForView(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Printable Slip Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="text-center border-b border-slate-800 pb-3">
                <div className="font-black text-sm text-white uppercase tracking-wider">
                  BUILDPULSE PRO • SITE PETTY CASH VOUCHER
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedVoucherForView.projectName || 'Construction Site Operations'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">VOUCHER NUMBER</span>
                  <span className="font-mono font-bold text-white">{selectedVoucherForView.voucherNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">DATE & TIME</span>
                  <span className="text-slate-200">{selectedVoucherForView.date} {selectedVoucherForView.time}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">PAID TO (PAYEE)</span>
                  <span className="font-semibold text-white">{selectedVoucherForView.payee}</span>
                  {selectedVoucherForView.payeePhone && (
                    <div className="text-[10px] text-slate-400 font-mono">{selectedVoucherForView.payeePhone}</div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">PAYMENT MODE</span>
                  <span className="text-slate-200">{selectedVoucherForView.paymentMode}</span>
                  {selectedVoucherForView.referenceNumber && (
                    <div className="text-[10px] text-slate-400 font-mono">Ref: {selectedVoucherForView.referenceNumber}</div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">ACCOUNT HEAD / CATEGORY</span>
                <span className="text-slate-200 text-xs font-semibold">{selectedVoucherForView.category}</span>
                {selectedVoucherForView.costCode && (
                  <span className="text-slate-500 font-mono text-[10px] ml-2">({selectedVoucherForView.costCode})</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">PURPOSE & DESCRIPTION</span>
                <p className="text-slate-300 text-xs mt-0.5 bg-slate-900 p-2.5 rounded border border-slate-800">
                  {selectedVoucherForView.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400">TOTAL DISBURSED AMOUNT</span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  ₹ {selectedVoucherForView.amount.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedVoucherForView.receiptPhotoUrl && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-slate-500 block text-[10px] mb-2">ATTACHED RECEIPT PROOF</span>
                  <img
                    src={selectedVoucherForView.receiptPhotoUrl}
                    alt="Receipt"
                    referrerPolicy="no-referrer"
                    className="max-h-52 w-auto mx-auto rounded-lg border border-slate-800 object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-[10px] text-slate-400">
                <div className="border-t border-slate-700 pt-1 text-center">
                  <span>Prepared By ({selectedVoucherForView.paidBy})</span>
                </div>
                <div className="border-t border-slate-700 pt-1 text-center">
                  <span>Approved By ({selectedVoucherForView.approvedBy || 'Project Manager'})</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedVoucherForView(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
