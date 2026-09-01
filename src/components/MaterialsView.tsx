import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Phone,
  Truck,
  Sparkles,
  MapPin,
  RefreshCw,
  Trash2,
  Edit2,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Warehouse,
  FileText,
  Image as ImageIcon,
  Paperclip,
  KeyRound,
  ShieldCheck,
  Eye,
  Download,
  ExternalLink,
  Clock,
  Send,
  Check,
  X,
  Building2,
  Building,
  Layers,
  ChevronRight,
  Tag,
} from 'lucide-react';
import {
  MaterialItem,
  MaterialCategory,
  LanguageCode,
  Role,
  ProjectSite,
  MaterialTransactionRecord,
  CentralStockItem,
  MaterialMovementType,
  MaterialAttachment,
} from '../types';
import { getTranslation } from '../lib/i18n';
import { store } from '../lib/offlineStore';
import { MaterialMovementModal } from './MaterialMovementModal';
import { OtpVerificationModal } from './OtpVerificationModal';
import { IndentDocPreviewModal } from './IndentDocPreviewModal';
import { MaterialCategoryModal } from './MaterialCategoryModal';

interface MaterialsViewProps {
  materials: MaterialItem[];
  project: ProjectSite;
  projects?: ProjectSite[];
  materialCategories?: MaterialCategory[];
  materialTransactions?: MaterialTransactionRecord[];
  centralStock?: CentralStockItem[];
  currentLang: LanguageCode;
  currentRole: Role;
  onOpenAiHub: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials = [],
  project,
  projects = [],
  materialCategories = [],
  materialTransactions = [],
  centralStock = [],
  currentLang,
  currentRole,
  onOpenAiHub,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    location: 'Mumbai, Maharashtra',
  };

  // Primary Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'transactions' | 'centralStock'>('inventory');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTxType, setSelectedTxType] = useState<string>('ALL');
  const [selectedTxStatus, setSelectedTxStatus] = useState<string>('ALL');

  // Category Management Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'manage'>('create');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementModalType, setMovementModalType] = useState<MaterialMovementType>('RECEIVE_FROM_CLIENT');

  const [activeOtpTransaction, setActiveOtpTransaction] = useState<MaterialTransactionRecord | null>(null);
  const [activePreviewAttachment, setActivePreviewAttachment] = useState<MaterialAttachment | null>(null);
  const [activePreviewTx, setActivePreviewTx] = useState<MaterialTransactionRecord | null>(null);

  // Dynamic Material Categories
  const activeCategoriesList = materialCategories && materialCategories.length > 0
    ? materialCategories
    : store.getState().materialCategories || [];

  const categories = [
    'ALL',
    ...Array.from(new Set(activeCategoriesList.map((c) => c.name))),
  ];

  // Supplier Search (Gemini)
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('TMT Steel, RMC Concrete & Crane Suppliers');
  const [supplierResults, setSupplierResults] = useState<any>(null);
  const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);

  // Central Stock Creation Modal State
  const [showAddCentralStockModal, setShowAddCentralStockModal] = useState(false);
  const [centralFormData, setCentralFormData] = useState<Partial<CentralStockItem>>({
    name: '',
    category: activeCategoriesList[0]?.name || 'Cement & Concrete',
    totalQuantity: 500,
    availableQuantity: 500,
    unit: 'Bags',
    warehouseLocation: 'Central Warehouse Bhiwandi Hub',
    bayNumber: 'Bay A-12',
    costPerUnit: 420,
    reorderLevel: 100,
    status: 'Available',
  });

  // Standard Material Form State
  const [formData, setFormData] = useState<Partial<MaterialItem>>({
    projectId: safeProject.id,
    name: '',
    category: activeCategoriesList[0]?.name || 'Cement & Concrete',
    quantity: 100,
    unit: 'Bags',
    minThreshold: 50,
    costPerUnit: 400,
    supplier: '',
    supplierPhone: '',
    status: 'In Stock',
    locationInSite: 'Central Storage Staging Yard',
  });

  // Filtered lists
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.locationInSite.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredTransactions = (materialTransactions || []).filter((tx) => {
    const matchesSearch =
      tx.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.clientIndentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.clientName && tx.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.gatePassNumber && tx.gatePassNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.sourceLocation && tx.sourceLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.destinationLocation && tx.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedTxType === 'ALL' || tx.type === selectedTxType;
    const matchesStatus = selectedTxStatus === 'ALL' || tx.status === selectedTxStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const lowStockCount = materials.filter((m) => m.status === 'Low Stock' || m.status === 'Critical Shortage').length;
  const totalInventoryValue = materials.reduce((sum, m) => sum + m.totalValue, 0);

  const pendingVerificationCount = (materialTransactions || []).filter(
    (tx) => tx.status === 'Pending Verification'
  ).length;

  const handleOpenMovement = (type: MaterialMovementType) => {
    setMovementModalType(type);
    setShowMovementModal(true);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    store.addMaterial({
      projectId: safeProject.id,
      name: formData.name,
      category: formData.category as any,
      quantity: Number(formData.quantity) || 0,
      unit: formData.unit as any,
      minThreshold: Number(formData.minThreshold) || 10,
      costPerUnit: Number(formData.costPerUnit) || 0,
      totalValue: (Number(formData.quantity) || 0) * (Number(formData.costPerUnit) || 0),
      supplier: formData.supplier || 'Local Supplier',
      supplierPhone: formData.supplierPhone || '+91 98000 00000',
      status: Number(formData.quantity) <= Number(formData.minThreshold) ? 'Low Stock' : 'In Stock',
      lastRestocked: new Date().toISOString().split('T')[0],
      locationInSite: formData.locationInSite || 'Site Staging Yard',
    });

    setShowAddModal(false);
    setFormData({
      projectId: safeProject.id,
      name: '',
      category: 'Cement & Concrete',
      quantity: 100,
      unit: 'Bags',
      minThreshold: 50,
      costPerUnit: 400,
      supplier: '',
      supplierPhone: '',
      status: 'In Stock',
      locationInSite: 'Central Storage Staging Yard',
    });
  };

  const handleCreateCentralStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centralFormData.name) return;

    store.addCentralStockItem({
      name: centralFormData.name,
      category: (centralFormData.category as any) || 'Cement & Concrete',
      totalQuantity: Number(centralFormData.totalQuantity) || 500,
      availableQuantity: Number(centralFormData.availableQuantity) || 500,
      unit: (centralFormData.unit as any) || 'Bags',
      warehouseLocation: centralFormData.warehouseLocation || 'Central Warehouse Bhiwandi Hub',
      bayNumber: centralFormData.bayNumber || 'Bay A-01',
      costPerUnit: Number(centralFormData.costPerUnit) || 400,
      reorderLevel: Number(centralFormData.reorderLevel) || 100,
      status: 'Available',
      lastUpdated: new Date().toISOString().split('T')[0],
    });

    setShowAddCentralStockModal(false);
    setCentralFormData({
      name: '',
      category: 'Cement & Concrete',
      totalQuantity: 500,
      availableQuantity: 500,
      unit: 'Bags',
      warehouseLocation: 'Central Warehouse Bhiwandi Hub',
      bayNumber: 'Bay A-12',
      costPerUnit: 420,
      reorderLevel: 100,
      status: 'Available',
    });
  };

  const handleQuickAdjustQty = (id: string, delta: number) => {
    const mat = materials.find((m) => m.id === id);
    if (!mat) return;
    const newQty = Math.max(0, mat.quantity + delta);
    store.updateMaterial(id, { quantity: newQty });
  };

  const handleSearchNearbySuppliers = async () => {
    setIsSearchingSuppliers(true);
    setSupplierResults(null);
    try {
      const res = await fetch('/api/gemini/supplier-equipment-locator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: safeProject.location || 'Mumbai, Maharashtra',
          materialType: supplierSearchQuery,
          radius: '25km',
        }),
      });
      const data = await res.json();
      setSupplierResults(data);
    } catch (err) {
      console.error('Failed to locate suppliers:', err);
    } finally {
      setIsSearchingSuppliers(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Top Header & Fast Action Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {getTranslation(currentLang, 'materials')} & Logistics Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800">
                  {safeProject.code}
                </span>
                {pendingVerificationCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    {pendingVerificationCount} Pending OTP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Client indents, material shifts, central stock tracking, and OTP-authenticated gate releases
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenMovement('RECEIVE_FROM_CLIENT')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Receive from Client</span>
            </button>

            <button
              onClick={() => handleOpenMovement('RETURN_TO_CLIENT')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Return to Client</span>
            </button>

            <button
              onClick={() => handleOpenMovement('SHIFT_FROM_MAIN_STOCK')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Shift from Main Stock</span>
            </button>

            <button
              onClick={() => handleOpenMovement('INTER_SITE_SHIFT')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Inter-Site Shift</span>
            </button>

            <button
              onClick={() => {
                setCategoryModalMode('create');
                setShowCategoryModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-orange-200"
            >
              <Tag className="w-3.5 h-3.5 text-orange-600" />
              <span>+ New Category</span>
            </button>

            <button
              onClick={() => {
                setCategoryModalMode('manage');
                setShowCategoryModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Categories Master</span>
            </button>

            <button
              onClick={() => setShowSupplierModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Find Suppliers</span>
            </button>
          </div>
        </div>

        {/* 4 Feature Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-slate-100">
          <div
            onClick={() => {
              setActiveSubTab('transactions');
              setSelectedTxType('RECEIVE_FROM_CLIENT');
            }}
            className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900">1. Client Receiving</span>
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">Indent photo/doc attach + OTP auth</p>
          </div>

          <div
            onClick={() => {
              setActiveSubTab('transactions');
              setSelectedTxType('RETURN_TO_CLIENT');
            }}
            className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 hover:bg-rose-100/70 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-900">2. Client Return</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <p className="text-[11px] text-rose-700 mt-1">Surplus/QC return + Indent report</p>
          </div>

          <div
            onClick={() => {
              setActiveSubTab('transactions');
              setSelectedTxType('SHIFT_FROM_MAIN_STOCK');
            }}
            className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100/70 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900">3. Main Stock Shift</span>
              <Warehouse className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-[11px] text-blue-700 mt-1">Central depot to site with OTP</p>
          </div>

          <div
            onClick={() => {
              setActiveSubTab('transactions');
              setSelectedTxType('INTER_SITE_SHIFT');
            }}
            className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900">4. Inter-Site Shift</span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Cross-site transfer & dual authorization</p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'border-orange-500 text-orange-600 bg-orange-50/40 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Site Inventory ({materials.length})</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                {lowStockCount} Low
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'transactions'
                ? 'border-orange-500 text-orange-600 bg-orange-50/40 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Material Movements & Indent Ledger ({(materialTransactions || []).length})</span>
            {pendingVerificationCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                {pendingVerificationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('centralStock')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'centralStock'
                ? 'border-orange-500 text-orange-600 bg-orange-50/40 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>Central Warehouse Depot ({(centralStock || []).length})</span>
          </button>
        </div>

        {activeSubTab === 'inventory' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs mb-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Site Material</span>
          </button>
        )}

        {activeSubTab === 'centralStock' && (
          <button
            onClick={() => setShowAddCentralStockModal(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs mb-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Central Stock Item</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SITE INVENTORY VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          {/* Metrics summary banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Tracked Items
                </span>
                <span className="text-xl font-bold text-slate-900">{materials.length} SKUs</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Inventory Valuation
                </span>
                <span className="text-xl font-bold text-slate-900">
                  ₹{(totalInventoryValue / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Low Stock Warnings
                </span>
                <span className={`text-xl font-bold ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {lowStockCount} Items Below Min
                </span>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search material SKU, supplier, storage bay..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-orange-500"
              >
                {categories.map((c) => {
                  const count = c === 'ALL' ? materials.length : materials.filter((m) => m.category === c).length;
                  return (
                    <option key={c} value={c}>
                      {c} ({count})
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => {
                  setCategoryModalMode('create');
                  setShowCategoryModal(true);
                }}
                title="Create a new material category"
                className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Category</span>
              </button>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMaterials.map((mat) => {
              const isLow = mat.status === 'Low Stock' || mat.status === 'Critical Shortage';
              const percent = Math.min(100, Math.round((mat.quantity / (mat.minThreshold * 2.5)) * 100));

              return (
                <div
                  key={mat.id}
                  className={`bg-white border rounded-xl p-4 shadow-2xs space-y-3 transition-all ${
                    isLow ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {mat.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{mat.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        mat.status === 'Critical Shortage'
                          ? 'bg-rose-100 text-rose-800'
                          : mat.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {mat.status}
                    </span>
                  </div>

                  {/* Stock Quantity Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-slate-900">
                        {mat.quantity} <span className="text-xs font-semibold text-slate-500">{mat.unit}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Min: {mat.minThreshold} {mat.unit}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location</span>
                      <span className="font-semibold text-slate-800 truncate block">{mat.locationInSite}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valuation</span>
                      <span className="font-semibold text-slate-800">
                        ₹{(mat.totalValue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate">Source: {mat.supplier}</span>
                      <span className="text-slate-400">Restocked: {mat.lastRestocked}</span>
                    </div>
                  </div>

                  {/* Quick Adjust & Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickAdjustQty(mat.id, -10)}
                        title="Deduct 10 units"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleQuickAdjustQty(mat.id, 10)}
                        title="Add 10 units"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
                      >
                        +10
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setMovementModalType('INTER_SITE_SHIFT');
                          setShowMovementModal(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                        title="Shift to another site"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setMovementModalType('RETURN_TO_CLIENT');
                          setShowMovementModal(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Return to client"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => store.deleteMaterial(mat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete SKU"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Materials Found</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or add a new material stock.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MATERIAL TRANSACTIONS & INDENTS LEDGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filters Bar for Ledger */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Indent #, Gate Pass, Material Name, Client, Origin/Destination..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedTxType}
                onChange={(e) => setSelectedTxType(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-orange-500"
              >
                <option value="ALL">All Movement Types</option>
                <option value="RECEIVE_FROM_CLIENT">1. Receive from Client</option>
                <option value="RETURN_TO_CLIENT">2. Return to Client</option>
                <option value="SHIFT_FROM_MAIN_STOCK">3. Shift from Main Stock</option>
                <option value="INTER_SITE_SHIFT">4. Inter-Site Shift</option>
              </select>

              <select
                value={selectedTxStatus}
                onChange={(e) => setSelectedTxStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-orange-500"
              >
                <option value="ALL">All Verification Status</option>
                <option value="Completed">Completed (OTP Verified)</option>
                <option value="Pending Verification">Pending OTP Verification</option>
              </select>
            </div>
          </div>

          {/* Transactions Ledger Cards List */}
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isCompleted = tx.status === 'Completed';
              const typeStyle =
                tx.type === 'RECEIVE_FROM_CLIENT'
                  ? { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: ArrowDownLeft, label: 'Receive from Client' }
                  : tx.type === 'RETURN_TO_CLIENT'
                  ? { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: ArrowUpRight, label: 'Return to Client' }
                  : tx.type === 'SHIFT_FROM_MAIN_STOCK'
                  ? { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Warehouse, label: 'Shift from Main Stock' }
                  : { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: ArrowRightLeft, label: 'Inter-Site Shift' };

              const Icon = typeStyle.icon;

              return (
                <div
                  key={tx.id}
                  className={`bg-white border rounded-xl p-4 shadow-2xs space-y-3 transition-all ${
                    !isCompleted ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{tx.materialName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                            {typeStyle.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Indent #{tx.clientIndentNumber} • Gate Pass: {tx.gatePassNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {isCompleted ? 'OTP Verified & Completed' : 'Pending OTP Authorization'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {tx.dateDisplay} {tx.timeDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Route Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Quantity</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {tx.quantity} <span className="text-xs font-semibold text-slate-600">{tx.unit}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Origin Source</span>
                      <span className="font-semibold text-slate-800 truncate block" title={tx.sourceLocation}>
                        {tx.sourceLocation}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Destination</span>
                      <span className="font-semibold text-slate-800 truncate block" title={tx.destinationLocation}>
                        {tx.destinationLocation}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">Logistics / Vehicle</span>
                      <span className="font-medium text-slate-700 block truncate">
                        {tx.vehicleNumber ? `${tx.vehicleNumber} (${tx.driverName || 'Driver'})` : 'Local Handover'}
                      </span>
                    </div>
                  </div>

                  {/* Return reason if applicable */}
                  {tx.returnReason && (
                    <div className="p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <span className="font-bold">Return Reason:</span> {tx.returnReason}
                    </div>
                  )}

                  {/* Attachments & OTP Authorization Footer */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    {/* Document / Indent Attachments */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" />
                        Indent Photos/Docs ({tx.attachments?.length || 0}):
                      </span>

                      {tx.attachments && tx.attachments.length > 0 ? (
                        tx.attachments.map((att) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => {
                              setActivePreviewAttachment(att);
                              setActivePreviewTx(tx);
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                          >
                            {att.fileType.startsWith('image') ? (
                              <ImageIcon className="w-3 h-3 text-orange-600" />
                            ) : (
                              <FileText className="w-3 h-3 text-blue-600" />
                            )}
                            <span className="truncate max-w-[130px]">{att.title || att.fileName}</span>
                            <Eye className="w-3 h-3 text-slate-400" />
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No attachments</span>
                      )}
                    </div>

                    {/* OTP Trigger or Status */}
                    <div className="flex items-center gap-2">
                      {!isCompleted ? (
                        <>
                          <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-bold text-amber-900">
                              Recipient: {tx.otpRecord?.recipientName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Code: <span className="font-mono font-bold text-slate-800">{tx.otpRecord?.otpCode}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveOtpTransaction(tx)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Verify OTP Now</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-right text-[11px] text-emerald-800 font-medium">
                          Authorized by <span className="font-bold">{tx.otpRecord?.recipientName || 'Inspector'}</span> ({tx.otpRecord?.verifiedByRole || 'Authorized'})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Material Transactions Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start by logging a Material Receive from Client, Return, or Shift using the buttons above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CENTRAL WAREHOUSE DEPOT VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'centralStock' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-blue-300" />
                <h2 className="text-base font-bold">Central Warehouse Logistics Hub (Bhiwandi / Wadala Depot)</h2>
              </div>
              <p className="text-xs text-blue-200">
                Primary company storage depot holding bulk steel coils, cement silos, precast aggregates, and safety gear.
              </p>
            </div>
            <button
              onClick={() => handleOpenMovement('SHIFT_FROM_MAIN_STOCK')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Shift Stock to {safeProject.name}</span>
            </button>
          </div>

          {/* Central Stock Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(centralStock || []).map((cs) => {
              const percent = Math.min(100, Math.round((cs.availableQuantity / cs.totalQuantity) * 100));

              return (
                <div key={cs.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {cs.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{cs.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {cs.bayNumber}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-slate-900">
                        {cs.availableQuantity} <span className="text-xs font-semibold text-slate-500">{cs.unit}</span>
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Total: {cs.totalQuantity} {cs.unit}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Depot</span>
                      <span className="font-semibold text-slate-800 truncate block">{cs.warehouseLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Unit Cost</span>
                      <span className="font-semibold text-slate-800">₹{cs.costPerUnit}/{cs.unit}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Updated: {cs.lastUpdated}</span>
                    <button
                      onClick={() => handleOpenMovement('SHIFT_FROM_MAIN_STOCK')}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded flex items-center gap-1 transition-colors"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Shift to Site</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Material Movement Modal (Receive, Return, Main Shift, Inter-Site Shift) */}
      <MaterialMovementModal
        isOpen={showMovementModal}
        initialType={movementModalType}
        project={safeProject}
        allProjects={projects}
        materials={materials}
        centralStock={centralStock}
        materialCategories={activeCategoriesList}
        currentRole={currentRole}
        onClose={() => setShowMovementModal(false)}
        onSuccess={(txId) => {
          const createdTx = (store.getState().materialTransactions || []).find((t) => t.id === txId);
          if (createdTx && createdTx.status === 'Pending Verification') {
            setActiveOtpTransaction(createdTx);
          }
          setActiveSubTab('transactions');
        }}
      />

      {/* 2. OTP Verification Dialog Modal */}
      <OtpVerificationModal
        isOpen={!!activeOtpTransaction}
        transaction={activeOtpTransaction}
        onClose={() => setActiveOtpTransaction(null)}
        onSuccess={() => {
          setActiveOtpTransaction(null);
        }}
      />

      {/* 3. Indent Document & Photo Preview Modal */}
      <IndentDocPreviewModal
        isOpen={!!activePreviewAttachment}
        attachment={activePreviewAttachment}
        transaction={activePreviewTx}
        onClose={() => {
          setActivePreviewAttachment(null);
          setActivePreviewTx(null);
        }}
      />

      {/* 4. Add Regular Material SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-orange-600" />
                <h2 className="text-base font-bold text-slate-900">Add New Site Material SKU</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. UltraTech Super Cement OPC 53"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Category</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryModalMode('create');
                        setShowCategoryModal(true);
                      }}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === '__CREATE_NEW__') {
                        setCategoryModalMode('create');
                        setShowCategoryModal(true);
                      } else {
                        const selectedCat = activeCategoriesList.find((c) => c.name === e.target.value);
                        setFormData({
                          ...formData,
                          category: e.target.value as any,
                          unit: (selectedCat?.defaultUnit as any) || formData.unit,
                        });
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    {activeCategoriesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.isCustom ? '(Custom)' : ''}
                      </option>
                    ))}
                    <option value="__CREATE_NEW__">+ Create New Category...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measurement</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Bags">Bags</option>
                    <option value="MT">MT</option>
                    <option value="Cum">Cum</option>
                    <option value="Nos">Nos</option>
                    <option value="Truckloads">Truckloads</option>
                    <option value="Meters">Meters</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                    <option value="Barrels">Barrels</option>
                    <option value="Litres">Litres</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Units">Units</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Per Unit (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location on Site</label>
                  <input
                    type="text"
                    value={formData.locationInSite}
                    onChange={(e) => setFormData({ ...formData, locationInSite: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Central Stock Item Modal */}
      {showAddCentralStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Add Central Warehouse Stock Item</h2>
              </div>
              <button onClick={() => setShowAddCentralStockModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCentralStock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  value={centralFormData.name}
                  onChange={(e) => setCentralFormData({ ...centralFormData, name: e.target.value })}
                  placeholder="e.g. Pre-stressed Structural High-Tensile Steel Wire (7mm)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Category</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryModalMode('create');
                        setShowCategoryModal(true);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New</span>
                    </button>
                  </div>
                  <select
                    value={centralFormData.category}
                    onChange={(e) => {
                      if (e.target.value === '__CREATE_NEW__') {
                        setCategoryModalMode('create');
                        setShowCategoryModal(true);
                      } else {
                        const selectedCat = activeCategoriesList.find((c) => c.name === e.target.value);
                        setCentralFormData({
                          ...centralFormData,
                          category: e.target.value as any,
                          unit: (selectedCat?.defaultUnit as any) || centralFormData.unit,
                        });
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {activeCategoriesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.isCustom ? '(Custom)' : ''}
                      </option>
                    ))}
                    <option value="__CREATE_NEW__">+ Create New Category...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={centralFormData.unit}
                    onChange={(e) => setCentralFormData({ ...centralFormData, unit: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Bags">Bags</option>
                    <option value="MT">MT</option>
                    <option value="Cum">Cum</option>
                    <option value="Nos">Nos</option>
                    <option value="Truckloads">Truckloads</option>
                    <option value="Meters">Meters</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                    <option value="Barrels">Barrels</option>
                    <option value="Litres">Litres</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Units">Units</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Stock Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={centralFormData.totalQuantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCentralFormData({ ...centralFormData, totalQuantity: val, availableQuantity: val });
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Bay Number</label>
                  <input
                    type="text"
                    value={centralFormData.bayNumber}
                    onChange={(e) => setCentralFormData({ ...centralFormData, bayNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCentralStockModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Central Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Local Supplier Finder Modal (Google Maps Grounding) */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-5 shadow-xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-orange-50 text-orange-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Google Maps Grounded Supplier Finder</h2>
                  <p className="text-[11px] text-slate-500">Locates verified local concrete plants, steel yards & crane rentals</p>
                </div>
              </div>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={supplierSearchQuery}
                onChange={(e) => setSupplierSearchQuery(e.target.value)}
                placeholder="Search materials e.g. RMC Batching plant, TMT steel, Scaffolding hire..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleSearchNearbySuppliers}
                disabled={isSearchingSuppliers}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer"
              >
                {isSearchingSuppliers ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Find Nearby</span>
              </button>
            </div>

            {isSearchingSuppliers && (
              <div className="py-6 text-center space-y-2">
                <RefreshCw className="w-5 h-5 text-orange-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">Scanning Google Maps for verified regional construction suppliers...</p>
              </div>
            )}

            {supplierResults && !isSearchingSuppliers && (
              <div className="space-y-3">
                <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {supplierResults.recommendations}
                </div>

                {supplierResults.sources && supplierResults.sources.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grounding Map Sources:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {supplierResults.sources.map((s: any, idx: number) => (
                        <a
                          key={idx}
                          href={s.web?.uri || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] text-blue-600 truncate max-w-xs font-medium"
                        >
                          {s.web?.title || 'Map Citation ' + (idx + 1)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Material Categories Master Modal (Create & Manage) */}
      {showCategoryModal && (
        <MaterialCategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          categories={activeCategoriesList}
          materials={materials}
          centralStock={centralStock}
          currentRole={currentRole}
          initialMode={categoryModalMode}
          onCategoryCreated={(newCat) => {
            if (showAddModal) {
              setFormData((prev) => ({
                ...prev,
                category: newCat.name as any,
                unit: (newCat.defaultUnit as any) || prev.unit,
              }));
            }
            if (showAddCentralStockModal) {
              setCentralFormData((prev) => ({
                ...prev,
                category: newCat.name as any,
                unit: (newCat.defaultUnit as any) || prev.unit,
              }));
            }
            setSelectedCategory(newCat.name);
          }}
        />
      )}
    </div>
  );
};
