import React from 'react';
import {
  TrendingUp,
  Boxes,
  Users,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Camera,
  PlusCircle,
  FileDown,
  CloudSun,
  MapPin,
  ArrowUpRight,
  Sparkles,
  Clock,
  HardHat,
  UserPlus,
  Banknote,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ProjectSite, MaterialItem, WorkerProfile, SiteUpdateLog, SafetyIncident, BudgetExpense, LanguageCode, Role } from '../types';
import { getTranslation } from '../lib/i18n';
import { exportExecutiveProjectPDF } from '../lib/pdfExporter';

interface DashboardViewProps {
  project: ProjectSite;
  materials: MaterialItem[];
  workers: WorkerProfile[];
  updates: SiteUpdateLog[];
  incidents: SafetyIncident[];
  expenses: BudgetExpense[];
  currentLang: LanguageCode;
  currentRole: Role;
  onNavigate: (view: any) => void;
  onOpenAiHub: () => void;
  onOpenCreateSiteModal?: () => void;
  onOpenAddUserModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  materials = [],
  workers = [],
  updates = [],
  incidents = [],
  expenses = [],
  currentLang,
  currentRole,
  onNavigate,
  onOpenAiHub,
  onOpenCreateSiteModal,
  onOpenAddUserModal,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4 Viaduct & Elevated Station',
    code: 'METRO-L4-PKG2',
    location: 'Mumbai, MH',
    address: 'Eastern Express Highway, Ghatkopar East, Mumbai - 400077',
    siteType: 'Infrastructure / Transportation',
    progressPercentage: 68,
    totalBudget: 425000000,
    spentBudget: 289000000,
    startDate: '2025-01-15',
    targetCompletionDate: '2026-12-31',
    status: 'In Progress' as const,
    geofenceRadiusMeters: 500,
    coordinates: { lat: 19.076, lng: 72.8777 },
  };

  const activeWorkers = workers.filter((w) => w.status === 'Active On-Site');
  const lowStockMaterials = materials.filter((m) => m.status === 'Low Stock' || m.status === 'Critical Shortage');
  const openIncidents = incidents.filter((i) => i.status !== 'Resolved');

  // Chart data: Budget by category
  const expenseByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.actualAmount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

  // S-Curve Progress Trend
  const trendData = [
    { month: 'Jan', planned: 10, actual: 12 },
    { month: 'Feb', planned: 22, actual: 24 },
    { month: 'Mar', planned: 35, actual: 36 },
    { month: 'Apr', planned: 48, actual: 47 },
    { month: 'May', planned: 58, actual: 56 },
    { month: 'Jun', planned: 65, actual: 64 },
    { month: 'Jul', planned: 72, actual: 68 },
    { month: 'Aug', planned: 80, actual: safeProject.progressPercentage },
  ];

  const handleExportPDF = () => {
    exportExecutiveProjectPDF(safeProject, materials, workers, updates, incidents, expenses);
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Site Header Summary Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 font-mono text-[10px] font-bold">
                {safeProject.code}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                {safeProject.siteType}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                safeProject.workType === 'Work with Material'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {safeProject.workType || 'Labour Contractor Work'}
              </span>
              {safeProject.workOrderNumber && (
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-200">
                  WO: {safeProject.workOrderNumber}
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {safeProject.name}
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>{safeProject.address}</span>
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenCreateSiteModal && (
              <button
                id="btn-quick-add-site"
                type="button"
                onClick={onOpenCreateSiteModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-2xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
                <span>+ Add Site</span>
              </button>
            )}

            {onOpenAddUserModal && (
              <button
                id="btn-quick-add-user"
                onClick={onOpenAddUserModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold shadow-2xs transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                <span>+ Add User</span>
              </button>
            )}

            <button
              id="btn-quick-ai-scan"
              onClick={onOpenAiHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Site Scanner</span>
            </button>

            <button
              id="btn-quick-export-pdf"
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{getTranslation(currentLang, 'exportPdf')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Total Progress */}
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{getTranslation(currentLang, 'totalProgress')}</span>
            <div className="p-1 rounded bg-blue-50 text-blue-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{safeProject.progressPercentage}%</span>
            <span className="text-[11px] font-semibold text-emerald-600">+4.2% wk</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${safeProject.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Budget Spent */}
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{getTranslation(currentLang, 'budgetSpent')}</span>
            <div className="p-1 rounded bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(safeProject.spentBudget / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              / ₹{(safeProject.totalBudget / 10000000).toFixed(1)} Cr
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-medium flex justify-between">
            <span>Burn Rate: Normal</span>
            <span className="text-emerald-600 font-bold">{Math.round((safeProject.spentBudget / (safeProject.totalBudget || 1)) * 100)}% spent</span>
          </div>
        </div>

        {/* Card 3: Active Labor */}
        <div
          onClick={() => onNavigate('workers')}
          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{getTranslation(currentLang, 'activeLabor')}</span>
            <div className="p-1 rounded bg-orange-50 text-orange-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeWorkers.length}</span>
            <span className="text-[11px] font-semibold text-emerald-600">100% On-Site</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Morning Shift Active
          </div>
        </div>

        {/* Card 4: Safety & Hazard Flags */}
        <div
          onClick={() => onNavigate('safety')}
          className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{getTranslation(currentLang, 'safetyHazards')}</span>
            <div className={`p-1 rounded ${openIncidents.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${openIncidents.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {openIncidents.length}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {openIncidents.length === 0 ? 'Zero Open Flags' : 'Immediate Action Req'}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between font-medium">
            <span>Safety Score</span>
            <span className="text-orange-600 font-bold">96 / 100</span>
          </div>
        </div>

      </div>

      {/* Labour Contractor Rates & Real-Time P&L Quick Strip */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-600 text-white shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Labour Contractor Rates & Daily P&L</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Active Engine</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Upload Work Orders & BOQs, track consumables & logistics, import muster labor costs, and generate AI Photo DPR with Daily Profit/Loss.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('labourContractor')}
          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors whitespace-nowrap self-start md:self-auto shadow"
        >
          Open Contractor P&L Engine →
        </button>
      </div>

      {/* Site Daily Cash Expenses & Petty Cash Quick Strip */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Site Daily Cash Expenses & Petty Cash</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Site-Wise Float</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage physical cash drawer float, record cash vouchers with bill photos, track contractor advances, and perform daily denomination tallies.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('pettyCash')}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap self-start md:self-auto shadow"
        >
          Open Petty Cash Book →
        </button>
      </div>

      {/* Critical Warnings Strip */}
      {lowStockMaterials.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-100 text-amber-700 shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {lowStockMaterials.length} Materials Below Minimum Threshold
              </h4>
              <p className="text-[11px] text-amber-800">
                {lowStockMaterials.map((m) => `${m.name} (${m.quantity} ${m.unit})`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('materials')}
            className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors"
          >
            Review Stock
          </button>
        </div>
      )}

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* S-Curve Chart (2 cols) */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Project S-Curve Progress vs Plan</h3>
              <p className="text-[11px] text-slate-500">Cumulative physical milestone completion</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Planned %
              </span>
              <span className="flex items-center gap-1.5 text-orange-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Actual %
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPlanned)" />
                <Area type="monotone" dataKey="actual" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Allocation Pie (1 col) */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Disbursement by Category</h3>
            <p className="text-[11px] text-slate-500">Verified cost code expenditures</p>
          </div>

          <div className="h-40 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '11px', color: '#1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {pieData.slice(0, 4).map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 truncate max-w-[150px] text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {p.name}
                </span>
                <span className="font-mono text-[11px] text-slate-800 font-semibold">₹{(Number(p.value) / 100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Live Site Weather & Crane Lifting Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded bg-sky-50 text-sky-600 shrink-0">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Weather</span>
            <div className="text-xs font-bold text-slate-900">31°C • Sunny & Clear</div>
            <div className="text-[10px] text-slate-500">Humidity: 68% | Barometer: 1012 hPa</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crane Lifting Status</span>
            <div className="text-xs font-bold text-emerald-700">GREEN : Safe to Lift</div>
            <div className="text-[10px] text-slate-500">Wind: 12 km/h (Limit: 35 km/h)</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded bg-purple-50 text-purple-600 shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concrete Curing Windows</span>
            <div className="text-xs font-bold text-purple-900">Optimal Slump Window</div>
            <div className="text-[10px] text-slate-500">Next RMC batch scheduled: 14:00</div>
          </div>
        </div>

      </div>

      {/* Recent Photo Updates Gallery */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Live Site Progress Photo Feed</h3>
            <p className="text-[11px] text-slate-500">Supervisory field logs with AI compliance analysis</p>
          </div>
          <button
            onClick={() => onNavigate('siteProgress')}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {updates.slice(0, 3).map((upd) => (
            <div
              key={upd.id}
              onClick={() => onNavigate('siteProgress')}
              className="group rounded-lg overflow-hidden bg-slate-50 border border-slate-200 hover:border-orange-400 transition-all cursor-pointer shadow-xs"
            >
              <div className="relative h-32 overflow-hidden bg-slate-200">
                <img
                  src={upd.photos[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600'}
                  alt={upd.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.2 rounded bg-slate-900/80 text-orange-400 text-[10px] font-mono font-bold">
                  {upd.progressPercentage}%
                </div>
                {upd.aiAnalysis && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.2 rounded bg-purple-900/90 text-purple-100 text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span>Score {upd.aiAnalysis.safetyScore}%</span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">{upd.stage}</div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{upd.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{upd.description}</p>
                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>By {upd.supervisorName}</span>
                  <span>{new Date(upd.timestamp).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
