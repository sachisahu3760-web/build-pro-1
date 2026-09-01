import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Layers,
  X,
  Check,
  Trash2,
  Edit2,
  Tag,
  Sparkles,
  Shield,
  Truck,
  Zap,
  Paintbrush,
  Building,
  Wrench,
  Droplets,
  Ruler,
  Hammer,
  AlertCircle,
  Search,
} from 'lucide-react';
import { MaterialCategory, MaterialItem, CentralStockItem, Role } from '../types';
import { store } from '../lib/offlineStore';

interface MaterialCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MaterialCategory[];
  materials?: MaterialItem[];
  centralStock?: CentralStockItem[];
  currentRole?: Role;
  onCategoryCreated?: (newCategory: MaterialCategory) => void;
  initialMode?: 'create' | 'manage';
}

const COLOR_OPTIONS: Array<{ key: string; label: string; bg: string; text: string; ring: string }> = [
  { key: 'orange', label: 'Orange', bg: 'bg-orange-100 text-orange-800 border-orange-200', text: 'text-orange-600', ring: 'ring-orange-500' },
  { key: 'blue', label: 'Blue', bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-600', ring: 'ring-blue-500' },
  { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-600', ring: 'ring-emerald-500' },
  { key: 'purple', label: 'Purple', bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-600', ring: 'ring-purple-500' },
  { key: 'amber', label: 'Amber', bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-600', ring: 'ring-amber-500' },
  { key: 'rose', label: 'Rose', bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-600', ring: 'ring-rose-500' },
  { key: 'cyan', label: 'Cyan', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200', text: 'text-cyan-600', ring: 'ring-cyan-500' },
  { key: 'indigo', label: 'Indigo', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', text: 'text-indigo-600', ring: 'ring-indigo-500' },
  { key: 'teal', label: 'Teal', bg: 'bg-teal-100 text-teal-800 border-teal-200', text: 'text-teal-600', ring: 'ring-teal-500' },
  { key: 'slate', label: 'Slate', bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-600', ring: 'ring-slate-500' },
];

const COMMON_UNITS = [
  'Bags',
  'Tons',
  'Cu. Meters',
  'Pieces',
  'Meters',
  'Litres',
  'Sets',
  'Units',
  'Sq.Ft',
  'MT',
  'Cum',
  'Nos',
  'Truckloads',
  'Barrels',
  'Rolls',
  'Kg',
];

const PRESET_TEMPLATES = [
  { name: 'Waterproofing & Chemicals', unit: 'Litres', color: 'teal', icon: 'Droplets', desc: 'Liquid membranes, crystalline waterproofing, epoxy grouts & sealants' },
  { name: 'Carpentry & Plywood', unit: 'Pieces', color: 'amber', icon: 'Hammer', desc: 'Commercial ply, marine shuttering ply, teak timber, hardwood battens' },
  { name: 'Glass & Aluminium Facade', unit: 'Sq.Ft', color: 'cyan', icon: 'Building', desc: 'Toughened glass, ACP sheets, curtain wall extrusions & silicon gaskets' },
  { name: 'HVAC & Mechanical', unit: 'Units', color: 'indigo', icon: 'Wrench', desc: 'GI ducting, chilled water pipes, dampers, diffusers & insulation rolls' },
  { name: 'Tiles, Marble & Granite', unit: 'Sq.Ft', color: 'purple', icon: 'Layers', desc: 'Vitrified flooring tiles, Italian marble slabs, adhesive & spacer clips' },
  { name: 'Pipes & Drainage Lines', unit: 'Meters', color: 'blue', icon: 'Ruler', desc: 'RCC NP3 pipes, HDPE drainage ducts, manhole covers & catch pits' },
];

export const MaterialCategoryModal: React.FC<MaterialCategoryModalProps> = ({
  isOpen,
  onClose,
  categories = [],
  materials = [],
  centralStock = [],
  currentRole = 'STOREKEEPER',
  onCategoryCreated,
  initialMode = 'create',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>(initialMode);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultUnit, setDefaultUnit] = useState('Bags');
  const [customUnit, setCustomUnit] = useState('');
  const [color, setColor] = useState('orange');
  const [icon, setIcon] = useState('Layers');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Mode inside Manage Tab
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDefaultUnit, setEditDefaultUnit] = useState('Bags');
  const [editColor, setEditColor] = useState('orange');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setName(preset.name);
    setDescription(preset.desc);
    setDefaultUnit(preset.unit);
    setColor(preset.color);
    setIcon(preset.icon);
    setFormError('');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    // Check duplicate
    const exists = categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      setFormError(`A category named "${trimmedName}" already exists.`);
      return;
    }

    const finalUnit = defaultUnit === 'CUSTOM' ? (customUnit.trim() || 'Units') : defaultUnit;

    const newCat = store.addMaterialCategory({
      name: trimmedName,
      description: description.trim() || undefined,
      color,
      icon,
      defaultUnit: finalUnit,
      createdByRole: currentRole,
    });

    setFormSuccess(`Category "${newCat.name}" successfully created!`);
    
    // Clear form
    setName('');
    setDescription('');
    setCustomUnit('');

    if (onCategoryCreated) {
      onCategoryCreated(newCat);
    }

    setTimeout(() => {
      setFormSuccess('');
    }, 3000);
  };

  const handleStartEdit = (cat: MaterialCategory) => {
    setEditingCategoryId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
    setEditDefaultUnit(cat.defaultUnit || 'Units');
    setEditColor(cat.color || 'orange');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    store.updateMaterialCategory(id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      defaultUnit: editDefaultUnit,
      color: editColor,
    });
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = (cat: MaterialCategory) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    const res = store.deleteMaterialCategory(cat.id);
    if (!res.success) {
      alert(res.message);
    }
  };

  // Helper: compute usage count and valuation for each category
  const getCategoryStats = (catName: string) => {
    const siteItems = materials.filter((m) => m.category.toLowerCase() === catName.toLowerCase());
    const stockItems = centralStock.filter((cs) => cs.category.toLowerCase() === catName.toLowerCase());
    const totalSiteValuation = siteItems.reduce((acc, curr) => acc + (curr.totalValue || (curr.quantity * curr.costPerUnit)), 0);
    const totalStockQty = stockItems.reduce((acc, curr) => acc + curr.availableQuantity, 0);

    return {
      siteItemCount: siteItems.length,
      stockItemCount: stockItems.length,
      totalItems: siteItems.length + stockItems.length,
      totalSiteValuation,
      totalStockQty,
    };
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Material Categories Master</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
                  {categories.length} Categories
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Organize site inventory, central warehouse stock, and delivery manifests by custom categories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Category</span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories Catalog ({categories.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CREATE CATEGORY FORM */}
        {/* ========================================================================= */}
        {activeTab === 'create' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Quick Preset Badges */}
            <div className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Quick Presets & Industry Templates:</span>
                </span>
                <span className="text-[11px] text-orange-700">Click to autofill template</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100 border border-orange-200 text-slate-800 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({p.unit})</span>
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Waterproofing & Chemical Admixtures"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Description & Scope (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specify what kinds of materials, parts, or tools belong in this classification..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500 font-normal resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Default Unit of Measurement
                  </label>
                  <select
                    value={defaultUnit}
                    onChange={(e) => setDefaultUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500 font-medium"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                    <option value="CUSTOM">+ Custom Unit...</option>
                  </select>

                  {defaultUnit === 'CUSTOM' && (
                    <input
                      type="text"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      placeholder="Enter custom unit (e.g. Drum, Bundle, Carton)"
                      className="mt-1.5 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Theme Color Badge
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setColor(c.key)}
                        className={`h-8 rounded-lg border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${c.bg} ${
                          color === c.key ? `ring-2 ${c.ring} shadow-xs font-extrabold` : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {color === c.key && <Check className="w-3.5 h-3.5 mr-0.5" />}
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Live Category Badge Preview:
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                      COLOR_OPTIONS.find((c) => c.key === color)?.bg || 'bg-orange-100 text-orange-800 border-orange-200'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{name.trim() || 'New Category Name'}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Default: {defaultUnit === 'CUSTOM' ? customUnit || 'Units' : defaultUnit}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Material Category</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MANAGE CATEGORIES CATALOG */}
        {/* ========================================================================= */}
        {activeTab === 'manage' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories by title, keyword, or material type..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Category Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCategories.map((cat) => {
                const stats = getCategoryStats(cat.name);
                const colorConfig = COLOR_OPTIONS.find((c) => c.key === cat.color) || COLOR_OPTIONS[0];
                const isEditing = editingCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5 hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-bold text-slate-900"
                        />
                        <textarea
                          rows={2}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-700 resize-none"
                        />
                        <div className="flex gap-2">
                          <select
                            value={editDefaultUnit}
                            onChange={(e) => setEditDefaultUnit(e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 flex-1"
                          >
                            {COMMON_UNITS.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryId(null)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md border text-xs font-bold flex items-center gap-1 ${colorConfig.bg}`}
                            >
                              <Tag className="w-3 h-3" />
                              <span>{cat.name}</span>
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {cat.isCustom && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
                                  Custom
                                </span>
                              )}
                              {cat.isCustom ? (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(cat)}
                                    title="Edit category"
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat)}
                                    title="Delete category"
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                                  System Default
                                </span>
                              )}
                            </div>
                          </div>

                          {cat.description && (
                            <p className="text-[11px] text-slate-600 leading-snug">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        {/* Inventory Utilization Stats */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div>
                            <span className="font-bold text-slate-800">{stats.siteItemCount}</span> site items
                            {stats.stockItemCount > 0 && (
                              <span> • <span className="font-bold text-blue-700">{stats.stockItemCount}</span> central stock</span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-400">Unit:</span> <span className="font-semibold text-slate-700">{cat.defaultUnit || 'Units'}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
