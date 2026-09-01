import React, { useState } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Warehouse,
  FileText,
  Image as ImageIcon,
  Paperclip,
  KeyRound,
  ShieldCheck,
  Truck,
  Building,
  Building2,
  X,
  UploadCloud,
  Check,
  AlertCircle,
  Plus,
  Camera,
} from 'lucide-react';
import {
  MaterialMovementType,
  MaterialItem,
  MaterialCategory,
  ProjectSite,
  CentralStockItem,
  MaterialAttachment,
  MaterialOtpRecord,
  Role,
} from '../types';
import { store } from '../lib/offlineStore';
import { MaterialCategoryModal } from './MaterialCategoryModal';

interface MaterialMovementModalProps {
  isOpen: boolean;
  initialType?: MaterialMovementType;
  project: ProjectSite;
  allProjects: ProjectSite[];
  materials: MaterialItem[];
  centralStock: CentralStockItem[];
  materialCategories?: MaterialCategory[];
  currentRole: Role;
  onClose: () => void;
  onSuccess: (txId: string) => void;
}

export const MaterialMovementModal: React.FC<MaterialMovementModalProps> = ({
  isOpen,
  initialType = 'RECEIVE_FROM_CLIENT',
  project,
  allProjects = [],
  materials = [],
  centralStock = [],
  materialCategories = [],
  currentRole,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<MaterialMovementType>(initialType);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);

  const activeCategoriesList = materialCategories && materialCategories.length > 0
    ? materialCategories
    : store.getState().materialCategories || [];

  // Common Form States
  const [materialName, setMaterialName] = useState('');
  const [category, setCategory] = useState('Cement & Concrete');
  const [quantity, setQuantity] = useState<number | ''>(100);
  const [unit, setUnit] = useState<MaterialItem['unit']>('Bags');
  const [costPerUnit, setCostPerUnit] = useState<number | ''>(450);

  // Location & Site Routing
  const [sourceLocation, setSourceLocation] = useState(
    initialType === 'SHIFT_FROM_MAIN_STOCK' ? 'Central Warehouse Depot (Bhiwandi Hub)' : project.name + ' - Main Yard'
  );
  const [destinationLocation, setDestinationLocation] = useState(
    project.name + ' - Staging Area'
  );
  const [sourceProjectId, setSourceProjectId] = useState<string>(project.id);
  const [destinationProjectId, setDestinationProjectId] = useState<string>(
    allProjects.find((p) => p.id !== project.id)?.id || project.id
  );

  // Logistics & Indent
  const [clientName, setClientName] = useState('MMRDA Rail Metro Infra');
  const [clientIndentNumber, setClientIndentNumber] = useState(
    `IND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [gatePassNumber, setGatePassNumber] = useState(
    `GP-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [challanNumber, setChallanNumber] = useState(
    `DC-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [vehicleNumber, setVehicleNumber] = useState('MH-04-GP-8842');
  const [driverName, setDriverName] = useState('Rajesh Sharma');
  const [driverPhone, setDriverPhone] = useState('+91 98201 44552');
  const [returnReason, setReturnReason] = useState<
    'Excess Material' | 'Defective / Damaged' | 'Specification Mismatch' | 'Project Handover Surplus' | 'Rejected Quality Inspection'
  >('Excess Material');
  const [notes, setNotes] = useState('');

  // Attachments State
  const [attachments, setAttachments] = useState<MaterialAttachment[]>([
    {
      id: 'att-sample-1',
      title: 'Signed Material Indent Slip & Gate Clearance',
      fileName: 'Indent_Requisition_Slip_Signed.jpg',
      fileUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      fileSize: '1.4 MB',
      fileType: 'image/jpeg',
      uploadedAt: new Date().toLocaleDateString('en-GB'),
      uploadedBy: 'Store Supervisor',
      documentCategory: 'Indent Copy',
    },
  ]);

  // OTP Configuration
  const [otpRecipientType, setOtpRecipientType] = useState<MaterialOtpRecord['recipientType']>('Client Representative');
  const [otpRecipientName, setOtpRecipientName] = useState('Vikramaditya Rao');
  const [otpRecipientPhone, setOtpRecipientPhone] = useState('+91 98201 44552');
  const [otpChannel, setOtpChannel] = useState<MaterialOtpRecord['verificationChannel']>('SMS');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Quick preset indents for fast testing
  const sampleIndentPhotos = [
    {
      title: 'Physical Client Indent Requisition Sheet',
      fileName: 'Client_Indent_Doc_01.jpg',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      size: '1.8 MB',
    },
    {
      title: 'Delivery Challan & Weighbridge Scale Slip',
      fileName: 'Weighbridge_Challan_Slip.jpg',
      url: 'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=800&q=80',
      size: '2.1 MB',
    },
    {
      title: 'Third-Party Batch Quality Certificate',
      fileName: 'Batch_Quality_Compliance.jpg',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      size: '1.2 MB',
    },
  ];

  const handleAddSampleAttachment = (sample: (typeof sampleIndentPhotos)[0]) => {
    const newAtt: MaterialAttachment = {
      id: 'att-' + Date.now(),
      name: sample.fileName,
      title: sample.title,
      fileName: sample.fileName,
      url: sample.url,
      fileUrl: sample.url,
      fileSize: sample.size,
      fileType: 'image/jpeg',
      timestamp: new Date().toLocaleDateString('en-GB'),
      uploadedAt: new Date().toLocaleDateString('en-GB'),
      uploadedBy: 'Site Engineer',
      docCategory: activeTab === 'RECEIVE_FROM_CLIENT' ? 'Indent Document' : 'Return Gate Pass',
      documentCategory: activeTab === 'RECEIVE_FROM_CLIENT' ? 'Indent Copy' : 'Gate Pass Slip',
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const fileUrlResult =
          (event.target?.result as string) ||
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
        const newAtt: MaterialAttachment = {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          url: fileUrlResult,
          fileUrl: fileUrlResult,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: file.type || 'image/jpeg',
          timestamp: new Date().toLocaleDateString('en-GB'),
          uploadedAt: new Date().toLocaleDateString('en-GB'),
          uploadedBy: 'Current User',
          docCategory:
            activeTab === 'RECEIVE_FROM_CLIENT'
              ? 'Indent Document'
              : activeTab === 'RETURN_TO_CLIENT'
              ? 'Return Gate Pass'
              : 'Delivery Challan',
          documentCategory:
            activeTab === 'RECEIVE_FROM_CLIENT'
              ? 'Indent Copy'
              : activeTab === 'RETURN_TO_CLIENT'
              ? 'Return Inspection Report'
              : 'Transfer Order',
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Helper when selecting existing central stock item
  const handleSelectCentralStock = (stockId: string) => {
    const found = centralStock.find((cs) => cs.id === stockId);
    if (found) {
      setMaterialName(found.name);
      setCategory(found.category);
      setUnit(found.unit);
      setCostPerUnit(found.costPerUnit);
      setSourceLocation(`${found.warehouseLocation} (Bay ${found.bayNumber})`);
      setQuantity(Math.min(100, found.availableQuantity));
    }
  };

  // Helper when selecting material for Inter-Site shift
  const handleSelectSiteMaterial = (matId: string) => {
    const found = materials.find((m) => m.id === matId);
    if (found) {
      setMaterialName(found.name);
      setCategory(found.category);
      setUnit(found.unit);
      setCostPerUnit(found.costPerUnit);
      setSourceLocation(`${project.name} - ${found.locationInSite}`);
      setQuantity(Math.min(50, found.quantity));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!materialName.trim()) {
      setFormError('Please provide a material name.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setFormError('Please specify a valid quantity greater than zero.');
      return;
    }
    if (!clientIndentNumber.trim()) {
      setFormError('Indent Number / Reference is required.');
      return;
    }
    if (!otpRecipientPhone.trim()) {
      setFormError('Recipient phone number is required for OTP dispatch.');
      return;
    }

    // Inter-site checks
    if (activeTab === 'INTER_SITE_SHIFT' && sourceProjectId === destinationProjectId) {
      setFormError('Source site and destination site must be different for inter-site shifts.');
      return;
    }

    // Inter-site quantity limit check
    if (activeTab === 'INTER_SITE_SHIFT') {
      const srcMat = materials.find(
        (m) => m.name.toLowerCase().trim() === materialName.toLowerCase().trim()
      );
      if (srcMat && Number(quantity) > srcMat.quantity) {
        setFormError(
          `Insufficient stock at source site (${srcMat.quantity} ${srcMat.unit} available, tried to shift ${quantity} ${unit}).`
        );
        return;
      }
    }

    // Main stock shift quantity check
    if (activeTab === 'SHIFT_FROM_MAIN_STOCK') {
      const csItem = centralStock.find(
        (cs) => cs.name.toLowerCase().trim() === materialName.toLowerCase().trim()
      );
      if (csItem && Number(quantity) > csItem.availableQuantity) {
        setFormError(
          `Insufficient central warehouse stock (${csItem.availableQuantity} ${csItem.unit} available).`
        );
        return;
      }
    }

    setIsSubmitting(true);

    const srcProj = allProjects.find((p) => p.id === sourceProjectId) || project;
    const dstProj = allProjects.find((p) => p.id === destinationProjectId) || project;

    const result = store.createMaterialTransaction({
      type: activeTab,
      materialName: materialName.trim(),
      category,
      quantity: Number(quantity),
      unit,
      sourceLocation:
        activeTab === 'SHIFT_FROM_MAIN_STOCK'
          ? sourceLocation || 'Central Warehouse Bhiwandi Hub'
          : activeTab === 'INTER_SITE_SHIFT'
          ? `${srcProj.name} (${sourceLocation})`
          : sourceLocation || 'Client Supply Depot',
      destinationLocation:
        activeTab === 'RETURN_TO_CLIENT'
          ? destinationLocation || 'Client Reclamation Yard'
          : activeTab === 'INTER_SITE_SHIFT'
          ? `${dstProj.name} (${destinationLocation})`
          : destinationLocation || `${project.name} Staging Yard`,
      sourceProjectId: activeTab === 'INTER_SITE_SHIFT' ? sourceProjectId : undefined,
      sourceProjectName: activeTab === 'INTER_SITE_SHIFT' ? srcProj.name : undefined,
      destinationProjectId:
        activeTab === 'RETURN_TO_CLIENT' ? undefined : activeTab === 'INTER_SITE_SHIFT' ? destinationProjectId : project.id,
      destinationProjectName:
        activeTab === 'RETURN_TO_CLIENT' ? undefined : activeTab === 'INTER_SITE_SHIFT' ? dstProj.name : project.name,
      clientName: clientName.trim(),
      clientIndentNumber: clientIndentNumber.trim(),
      gatePassNumber: gatePassNumber.trim(),
      challanNumber: challanNumber.trim(),
      vehicleNumber: vehicleNumber.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      returnReason: activeTab === 'RETURN_TO_CLIENT' ? returnReason : undefined,
      costPerUnit: Number(costPerUnit) || 0,
      attachments,
      otpRecipient: {
        type: otpRecipientType,
        name: otpRecipientName.trim() || 'Site Inspector',
        phone: otpRecipientPhone.trim() || '+91 98201 44552',
        channel: otpChannel,
      },
      initiatedBy: currentRole.replace('_', ' ').toUpperCase(),
      initiatedRole: currentRole,
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    onSuccess(result.transaction.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Material Logistics & Transfer Hub</h2>
              <p className="text-xs text-slate-500">
                Receive from client, return surplus, or shift between sites with OTP authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Primary Movement Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('RECEIVE_FROM_CLIENT');
              setSourceLocation('Client Supply Staging Yard');
              setDestinationLocation(`${project.name} - Receiving Bay`);
              setOtpRecipientType('Client Representative');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'RECEIVE_FROM_CLIENT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="truncate">Receive from Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('RETURN_TO_CLIENT');
              setSourceLocation(`${project.name} - Surplus Bay`);
              setDestinationLocation('Client Reclamation Depot');
              setOtpRecipientType('Quality Inspector');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'RETURN_TO_CLIENT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="truncate">Return to Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('SHIFT_FROM_MAIN_STOCK');
              setSourceLocation('Central Warehouse (Bhiwandi Logistics Hub)');
              setDestinationLocation(`${project.name} - Site Depot`);
              setOtpRecipientType('Store In-Charge');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'SHIFT_FROM_MAIN_STOCK'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span className="truncate">Main Stock Shift</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('INTER_SITE_SHIFT');
              setSourceProjectId(project.id);
              setSourceLocation(`${project.name} - Transfer Bay`);
              const other = allProjects.find((p) => p.id !== project.id);
              if (other) {
                setDestinationProjectId(other.id);
                setDestinationLocation(`${other.name} - Receiving Yard`);
              }
              setOtpRecipientType('Site Supervisor');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
              activeTab === 'INTER_SITE_SHIFT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span className="truncate">Inter-Site Shift</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Quick Item Picker for Shifts */}
          {activeTab === 'SHIFT_FROM_MAIN_STOCK' && centralStock.length > 0 && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
              <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                <span>Select from Central Warehouse Inventory:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {centralStock.map((cs) => (
                  <button
                    key={cs.id}
                    type="button"
                    onClick={() => handleSelectCentralStock(cs.id)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-xs text-slate-800 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{cs.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {cs.availableQuantity} {cs.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'INTER_SITE_SHIFT' && materials.length > 0 && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                <span>Select Material from Current Site ({project.name}):</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectSiteMaterial(m.id)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-amber-100 border border-amber-200 text-xs text-slate-800 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{m.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      {m.quantity} {m.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Material Details */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-orange-600" />
              <span>1. Material Specification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Name / Specification *
                </label>
                <input
                  type="text"
                  required
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="e.g. Fe500D TMT Rebar 16mm or OPC 53 Grade Cement"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Category</span>
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__CREATE_NEW__') {
                      setShowNewCategoryModal(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="Bags">Bags</option>
                  <option value="MT">MT (Metric Tons)</option>
                  <option value="Cum">Cum (Cubic Meters)</option>
                  <option value="Nos">Nos (Units)</option>
                  <option value="Truckloads">Truckloads</option>
                  <option value="Meters">Meters</option>
                  <option value="Sq.Ft">Sq.Ft</option>
                  <option value="Barrels">Barrels</option>
                  <option value="Litres">Litres</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Est. Rate (₹ per unit)
                </label>
                <input
                  type="number"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Return reason if return tab */}
            {activeTab === 'RETURN_TO_CLIENT' && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Reason for Return to Client *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-rose-50 border border-rose-200 rounded-md text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="Excess Material">Excess Material (Surplus to Stage Requirement)</option>
                  <option value="Defective / Damaged">Defective / Damaged during Ingress</option>
                  <option value="Specification Mismatch">Specification Mismatch (Failed Grade Test)</option>
                  <option value="Project Handover Surplus">Project Handover Surplus Reconciliation</option>
                  <option value="Rejected Quality Inspection">Rejected Quality Inspection (Non-Compliant)</option>
                </select>
              </div>
            )}
          </div>

          {/* Section 2: Origin, Destination & Multi-Site Routing */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Routing & Logistics Transfer</span>
            </h3>

            {activeTab === 'INTER_SITE_SHIFT' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source Site (Sending)
                  </label>
                  <select
                    value={sourceProjectId}
                    onChange={(e) => {
                      setSourceProjectId(e.target.value);
                      const sel = allProjects.find((p) => p.id === e.target.value);
                      if (sel) setSourceLocation(`${sel.name} - Main Yard`);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                  >
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Site (Receiving)
                  </label>
                  <select
                    value={destinationProjectId}
                    onChange={(e) => {
                      setDestinationProjectId(e.target.value);
                      const sel = allProjects.find((p) => p.id === e.target.value);
                      if (sel) setDestinationLocation(`${sel.name} - Ingress Yard`);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                  >
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Location / Bay
                </label>
                <input
                  type="text"
                  value={sourceLocation}
                  onChange={(e) => setSourceLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Location / Yard
                </label>
                <input
                  type="text"
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Indent Number / Reference *
                </label>
                <input
                  type="text"
                  required
                  value={clientIndentNumber}
                  onChange={(e) => setClientIndentNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gate Pass Number
                </label>
                <input
                  type="text"
                  value={gatePassNumber}
                  onChange={(e) => setGatePassNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. MH-04-GP-8842"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transporter / Driver Name & Phone
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Driver Name"
                    className="w-1/2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="Phone No."
                    className="w-1/2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Indent Document & Photo Attachment (Mandatory Feature) */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Indent Document & Photo Attachments</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {attachments.length} attachment(s) attached
              </span>
            </div>

            {/* Uploader Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 sm:p-4 text-center bg-white hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1">
                <UploadCloud className="w-8 h-8 text-orange-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  Click or Drag & Drop Indent Slips / Delivery Challans / Photos
                </p>
                <p className="text-[11px] text-slate-500">Supports JPG, PNG, PDF document scans (up to 25MB)</p>
              </div>
            </div>

            {/* Preset Samples Helper */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Quick Add Sample Indents:</span>
              <div className="flex flex-wrap gap-2">
                {sampleIndentPhotos.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSampleAttachment(s)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-orange-600" />
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Attached List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 bg-white rounded-md border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {att.fileType.startsWith('image') ? (
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{att.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {att.documentCategory} • {att.fileSize}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: OTP Based Authentication Setup */}
          <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>4. OTP Authorization & Handover Verification</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Mandatory Security Rule
              </span>
            </div>

            <p className="text-xs text-amber-800 leading-relaxed">
              A 6-digit numeric OTP will be generated and dispatched to the designated inspector / client representative. The material status will remain &ldquo;Pending Verification&rdquo; until authorized.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Role *
                </label>
                <select
                  value={otpRecipientType}
                  onChange={(e) => setOtpRecipientType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-md text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="Client Representative">Client Representative</option>
                  <option value="Site Engineer">Site Engineer / Inspector</option>
                  <option value="Store In-Charge">Store In-Charge / Yardmaster</option>
                  <option value="Transporter Driver">Transporter Driver</option>
                  <option value="Quality Inspector">Quality Inspector</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={otpRecipientName}
                  onChange={(e) => setOtpRecipientName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-md text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (for SMS OTP) *
                </label>
                <input
                  type="text"
                  required
                  value={otpRecipientPhone}
                  onChange={(e) => setOtpRecipientPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-md text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Error display */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-orange-600/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Generate Indent & Dispatch OTP</span>
            </button>
          </div>
        </form>
      </div>

      {showNewCategoryModal && (
        <MaterialCategoryModal
          isOpen={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
          categories={activeCategoriesList}
          materials={materials}
          centralStock={centralStock}
          currentRole={currentRole}
          initialMode="create"
          onCategoryCreated={(newCat) => {
            setCategory(newCat.name);
            if (newCat.defaultUnit) {
              setUnit(newCat.defaultUnit as any);
            }
            setShowNewCategoryModal(false);
          }}
        />
      )}
    </div>
  );
};
