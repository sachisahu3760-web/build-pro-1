import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { BudgetExpense, LanguageCode, Role, ProjectSite } from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation } from '../lib/i18n';

interface BudgetViewProps {
  expenses: BudgetExpense[];
  project: ProjectSite;
  currentLang: LanguageCode;
  currentRole: Role;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  expenses = [],
  project,
  currentLang,
  currentRole,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    totalBudget: 425000000,
    spentBudget: 289000000,
  };

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [formData, setFormData] = useState<Partial<BudgetExpense>>({
    title: '',
    category: 'Materials & Raw Supplies',
    plannedAmount: 500000,
    actualAmount: 480000,
    vendor: '',
    paymentStatus: 'Approved',
    invoiceNumber: `INV-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
  });

  const categories = [
    'ALL',
    'Materials & Raw Supplies',
    'Heavy Machinery & Fuel',
    'Labor Payroll & Wages',
    'Subcontractor Milestones',
    'Site Overheads & Permits',
    'Quality & Testing',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalPlanned = expenses.reduce((sum, e) => sum + e.plannedAmount, 0);
  const totalActual = expenses.reduce((sum, e) => sum + e.actualAmount, 0);
  const variance = totalPlanned - totalActual;

  // Chart data: Planned vs Actual per category
  const categoryTotals: Record<string, { planned: number; actual: number }> = {};
  expenses.forEach((e) => {
    if (!categoryTotals[e.category]) {
      categoryTotals[e.category] = { planned: 0, actual: 0 };
    }
    categoryTotals[e.category].planned += e.plannedAmount;
    categoryTotals[e.category].actual += e.actualAmount;
  });

  const barChartData = Object.entries(categoryTotals).map(([name, data]) => ({
    name: name.split(' ')[0],
    fullName: name,
    planned: Math.round(data.planned / 100000), // in Lakhs
    actual: Math.round(data.actual / 100000),
  }));

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    store.addExpense({
      projectId: safeProject.id,
      title: formData.title,
      category: formData.category as any,
      plannedAmount: Number(formData.plannedAmount) || 0,
      actualAmount: Number(formData.actualAmount) || 0,
      date: new Date().toISOString().split('T')[0],
      vendor: formData.vendor || 'General Supplier',
      invoiceNumber: formData.invoiceNumber || 'INV-TEMP',
      paymentStatus: formData.paymentStatus as any,
      costCode: 'CC-' + Math.floor(Math.random() * 800 + 100),
    });

    setShowAddExpenseModal(false);
    setFormData({
      title: '',
      category: 'Materials & Raw Supplies',
      plannedAmount: 500000,
      actualAmount: 480000,
      vendor: '',
      paymentStatus: 'Approved',
      invoiceNumber: `INV-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
    });
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-500" />
            <span>{getTranslation(currentLang, 'budget')}</span>
          </h1>
          <p className="text-[11px] text-slate-500">
            Real-time project cost accounting, cost code disbursements, cash flow & budget variances
          </p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense / Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sanctioned Budget</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            ₹{(safeProject.totalBudget / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total contract value approved</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified Disbursements</span>
          <div className="text-xl font-bold text-orange-600 mt-1">
            ₹{(safeProject.spentBudget / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {((safeProject.spentBudget / (safeProject.totalBudget || 1)) * 100).toFixed(1)}% of total allocation
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>Budget Balance</span>
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            ₹{((safeProject.totalBudget - safeProject.spentBudget) / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Remaining liquidity reserve</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost Variance</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            +₹{(variance / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-semibold">Under planned cost target ✓</div>
        </div>
      </div>

      {/* Planned vs Actual Cost Comparison Chart */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Cost Breakdown by Category (in Lakhs ₹)</h3>
            <p className="text-[11px] text-slate-500">Planned Budget vs Actual Invoiced Outlays</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-blue-600 font-medium">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Planned (L)
            </span>
            <span className="flex items-center gap-1.5 text-orange-600 font-medium">
              <span className="w-2.5 h-2.5 rounded bg-orange-500" /> Actual (L)
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.5rem', fontSize: '12px', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="planned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search expenses by title, vendor, invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.slice(0, 4).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-orange-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-2.5 px-3.5">Cost Item & Code</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Vendor & Invoice</th>
                <th className="py-2.5 px-3.5 text-right">Planned (₹)</th>
                <th className="py-2.5 px-3.5 text-right">Actual Paid (₹)</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3.5">
                    <div className="font-bold text-slate-900">{exp.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{exp.costCode} • {exp.date}</div>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="text-slate-800 font-medium">{exp.vendor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{exp.invoiceNumber}</div>
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-slate-500">
                    ₹{exp.plannedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-orange-600">
                    ₹{exp.actualAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        exp.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : exp.paymentStatus === 'Approved'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {exp.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-orange-500" />
                <span>Record Site Expense / Invoice</span>
              </h2>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready Mix Concrete Batch 200m³"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  {categories.filter((c) => c !== 'ALL').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Planned Target (₹)</label>
                  <input
                    type="number"
                    value={formData.plannedAmount}
                    onChange={(e) => setFormData({ ...formData, plannedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Actual Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.actualAmount}
                    onChange={(e) => setFormData({ ...formData, actualAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. ACC Concrete Ltd."
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending Approval">Pending Approval</option>
                </select>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Save Cost Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
