import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building2,
  FileText,
  Upload,
  Layers,
  Sparkles,
  Calculator,
  HardHat,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  IndianRupee,
  MapPin,
  Phone,
  User,
  Info,
  Package,
  Wrench,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  RefreshCw,
  FileCheck,
  Shield,
  Percent,
  Tag,
  Palette,
  Check,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Briefcase,
  Home,
  Factory,
  Hotel,
  Activity,
  GraduationCap,
  SunMedium,
  Boxes,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ProjectSite,
  SiteCategory,
  SiteWorkType,
  BOQItem,
  WorkOrderContract,
  WorkOrderMilestone,
  WorkOrderPnlProjection,
} from '../types';
import { store } from '../lib/offlineStore';

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated?: (project: ProjectSite, workOrder?: WorkOrderContract) => void;
}

const SAMPLE_BANNERS = [
  { label: 'Metro & Infrastructure', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Commercial High-Rise', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Industrial & Warehouse', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Bridge & Marine', url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Residential Township', url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80' },
];

const CATEGORY_COLOR_PALETTES = [
  { id: 'blue', label: 'Sapphire Blue', bg: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-600' },
  { id: 'amber', label: 'Warm Amber', bg: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-600' },
  { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' },
  { id: 'indigo', label: 'Royal Indigo', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-600' },
  { id: 'rose', label: 'Coral Rose', bg: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-600' },
  { id: 'purple', label: 'Deep Purple', bg: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-600' },
  { id: 'cyan', label: 'Ocean Cyan', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200', dot: 'bg-cyan-600' },
  { id: 'teal', label: 'Teal Green', bg: 'bg-teal-100 text-teal-800 border-teal-200', dot: 'bg-teal-600' },
  { id: 'slate', label: 'Slate Grey', bg: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-600' },
  { id: 'orange', label: 'Construction Orange', bg: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-600' },
];

const CATEGORY_ICONS = [
  { id: 'Building2', label: 'Commercial Building', icon: Building2 },
  { id: 'Home', label: 'Residential', icon: Home },
  { id: 'Layers', label: 'Infrastructure & Road', icon: Layers },
  { id: 'Factory', label: 'Industrial Factory', icon: Factory },
  { id: 'Hotel', label: 'Hospitality & Resort', icon: Hotel },
  { id: 'Activity', label: 'Healthcare & Medical', icon: Activity },
  { id: 'GraduationCap', label: 'Institutional Campus', icon: GraduationCap },
  { id: 'SunMedium', label: 'Solar & Renewable', icon: SunMedium },
  { id: 'Boxes', label: 'Warehouse & Precast', icon: Boxes },
  { id: 'Shield', label: 'Special Infrastructure', icon: Shield },
];

const BOQ_PRESETS: Record<string, { label: string; items: BOQItem[] }> = {
  labour_rcc: {
    label: '👷 Labour Rate Contract: RCC Framing & Reinforcement',
    items: [
      {
        id: 'boq-new-1',
        itemCode: 'BOQ-STL-01',
        description: 'TMT Rebar Cutting, Bending, Shifting & Tying with 18G Binding Wire in Beam/Columns',
        category: 'Steel & Rebar',
        unit: 'MT',
        contractRate: 5500,
        totalEstimatedQty: 60,
        completedQty: 0,
        todayCompletedQty: 1.5,
        totalEarnedValue: 0,
      },
      {
        id: 'boq-new-2',
        itemCode: 'BOQ-SHT-02',
        description: 'Film-Faced Plywood & Steel Shuttering Erection and Staging for Slabs & Beams',
        category: 'Formwork & Shuttering',
        unit: 'Sq.Ft',
        contractRate: 48,
        totalEstimatedQty: 8500,
        completedQty: 0,
        todayCompletedQty: 180,
        totalEarnedValue: 0,
      },
      {
        id: 'boq-new-3',
        itemCode: 'BOQ-CNC-03',
        description: 'Ready-Mix / Transit Mixer Concrete Pouring, Needle Compacting & Surface Leveling',
        category: 'Cement & Concrete',
        unit: 'Cu.M',
        contractRate: 420,
        totalEstimatedQty: 450,
        completedQty: 0,
        todayCompletedQty: 15,
        totalEarnedValue: 0,
      },
    ],
  },
  labour_finishing: {
    label: '🧱 Labour Rate Contract: Masonry, Plaster & Flooring',
    items: [
      {
        id: 'boq-new-1',
        itemCode: 'BOQ-MAS-01',
        description: 'AAC Lightweight Block Masonry in 1:4 Polymer Mortar (200mm thick)',
        category: 'Masonry & Plaster',
        unit: 'Sq.Ft',
        contractRate: 34,
        totalEstimatedQty: 9500,
        completedQty: 0,
        todayCompletedQty: 220,
        totalEarnedValue: 0,
      },
      {
        id: 'boq-new-2',
        itemCode: 'BOQ-PLS-02',
        description: '12mm Internal Cement Plastering with sponge finish on walls & ceiling',
        category: 'Masonry & Plaster',
        unit: 'Sq.Ft',
        contractRate: 28,
        totalEstimatedQty: 14000,
        completedQty: 0,
        todayCompletedQty: 300,
        totalEarnedValue: 0,
      },
      {
        id: 'boq-new-3',
        itemCode: 'BOQ-FLR-03',
        description: 'Vitrified Floor Tile Laying 800x800 with adhesive bedding & epoxy grouting',
        category: 'Flooring & Tiling',
        unit: 'Sq.Ft',
        contractRate: 45,
        totalEstimatedQty: 6000,
        completedQty: 0,
        todayCompletedQty: 110,
        totalEarnedValue: 0,
      },
    ],
  },
  material_turnkey: {
    label: '🏗️ Work with Material: Turnkey Civil & Structural Package',
    items: [
      {
        id: 'boq-new-1',
        itemCode: 'BOQ-TKY-01',
        description: 'Complete Supply & Placement of Fe550D TMT Rebar with testing certificates',
        category: 'Steel & Rebar',
        unit: 'MT',
        contractRate: 68500,
        totalEstimatedQty: 45,
        completedQty: 0,
        todayCompletedQty: 1.2,
        totalEarnedValue: 0,
      },
      {
        id: 'boq-new-2',
        itemCode: 'BOQ-TKY-02',
        description: 'Supply & Pouring of M30 Design Mix Concrete with slump retention admixture',
        category: 'Cement & Concrete',
        unit: 'Cu.M',
        contractRate: 5400,
        totalEstimatedQty: 380,
        completedQty: 0,
        todayCompletedQty: 18,
        totalEarnedValue: 0,
      },
      {
        id: 'boq-new-3',
        itemCode: 'BOQ-TKY-03',
        description: 'Supply & Laying of Red Clay Wire-Cut Bricks in 1:6 Cement Sand Mortar',
        category: 'Masonry & Plaster',
        unit: 'Cu.M',
        contractRate: 6200,
        totalEstimatedQty: 220,
        completedQty: 0,
        todayCompletedQty: 6,
        totalEarnedValue: 0,
      },
    ],
  },
};

export const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
  isOpen,
  onClose,
  onSiteCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Site Categories from store
  const [siteCategories, setSiteCategories] = useState<SiteCategory[]>(() => store.siteCategories || []);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSiteCategories([...(store.siteCategories || [])]);
    });
    return unsub;
  }, []);

  // --- New Category Modal / Inline Form State ---
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatColor, setNewCatColor] = useState('blue');
  const [newCatIcon, setNewCatIcon] = useState('Building2');
  const [categoryError, setCategoryError] = useState('');

  // --- Step 1: Site Fundamentals ---
  const [siteName, setSiteName] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    return siteCategories[1]?.id || siteCategories[0]?.id || 'site-cat-comm';
  });
  const [siteType, setSiteType] = useState<string>('Commercial & High-Rise');
  const [workType, setWorkType] = useState<SiteWorkType>('Labour Contractor Work');
  const [totalBudget, setTotalBudget] = useState<number>(15000000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [supervisorName, setSupervisorName] = useState('Rajendra Verma');
  const [supervisorPhone, setSupervisorPhone] = useState('+91 98200 44551');
  const [bannerImage, setBannerImage] = useState(SAMPLE_BANNERS[0].url);

  // --- Step 2: Work Order Details & Upload ---
  const [workOrderNumber, setWorkOrderNumber] = useState('WO-2026-SITE-001');
  const [contractorName, setContractorName] = useState('Verma Civil & Construction Gang');
  const [contractorPhone, setContractorPhone] = useState('+91 98200 44551');
  const [contractorType, setContractorType] = useState<WorkOrderContract['contractorType']>('Piece-Rate Labour Gang');
  const [contractorTrade, setContractorTrade] = useState('Reinforcement & Shuttering');
  const [scopeOfWork, setScopeOfWork] = useState(
    'Execution of sub-structure and super-structure civil works as per approved GFC structural drawings and agreed item rates.'
  );

  // Work Order Document Upload & File details
  const [workOrderDocUrl, setWorkOrderDocUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
  );
  const [workOrderDocName, setWorkOrderDocName] = useState<string>('Official_Work_Order_Signed.pdf');
  const [workOrderDocSize, setWorkOrderDocSize] = useState<string>('2.4 MB');
  const [workOrderDocType, setWorkOrderDocType] = useState<string>('application/pdf');
  const [uploadNotice, setUploadNotice] = useState<string | null>('Pre-loaded standard official contract template.');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Step 3: Future P&L Projections & Financial Budgeting ---
  const [materialBudgetPct, setMaterialBudgetPct] = useState<number>(workType === 'Work with Material' ? 45 : 12);
  const [labourBudgetPct, setLabourBudgetPct] = useState<number>(workType === 'Work with Material' ? 22 : 48);
  const [plantMachineryPct, setPlantMachineryPct] = useState<number>(8);
  const [siteOverheadPct, setSiteOverheadPct] = useState<number>(6);
  const [contingencyPct, setContingencyPct] = useState<number>(4);
  const [retentionPct, setRetentionPct] = useState<number>(5);
  const [mobilizationAdvancePct, setMobilizationAdvancePct] = useState<number>(10);
  const [tdsPct, setTdsPct] = useState<number>(2);
  const [gstPct, setGstPct] = useState<number>(18);
  const [riskSensitivity, setRiskSensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');

  // Work Order Milestones for Billing Projections
  const [milestones, setMilestones] = useState<WorkOrderMilestone[]>([
    {
      id: 'ms-1',
      title: 'Mobilization & Initial Site Infrastructure',
      percentage: 15,
      targetDate: new Date().toISOString().split('T')[0],
      deliverable: 'Site grading, temporary batching, worker barracks & electrical lines',
      billingAmount: 2250000,
      status: 'In Progress',
    },
    {
      id: 'ms-2',
      title: 'Substructure & Raft Foundation Concrete',
      percentage: 35,
      targetDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      deliverable: 'Excavation, raft footing casting, column starter placement up to plinth beam',
      billingAmount: 5250000,
      status: 'Pending',
    },
    {
      id: 'ms-3',
      title: 'Superstructure & RCC Framing Works',
      percentage: 35,
      targetDate: new Date(Date.now() + 140 * 86400000).toISOString().split('T')[0],
      deliverable: 'RCC column casting, formwork, floor slab casting up to terrace level',
      billingAmount: 5250000,
      status: 'Pending',
    },
    {
      id: 'ms-4',
      title: 'Finishing, Testing & Client Handover',
      percentage: 15,
      targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      deliverable: 'Finishing, QA/QC punch lists, final certification & retention release',
      billingAmount: 2250000,
      status: 'Pending',
    },
  ]);

  // --- Step 4: BOQ & Rates ---
  const [boqItems, setBoqItems] = useState<BOQItem[]>(BOQ_PRESETS.labour_rcc.items);
  const [generateDPR, setGenerateDPR] = useState(true);

  // Sync P&L percentages when workType changes
  useEffect(() => {
    if (workType === 'Work with Material') {
      setMaterialBudgetPct(48);
      setLabourBudgetPct(22);
    } else {
      setMaterialBudgetPct(10);
      setLabourBudgetPct(52);
    }
  }, [workType]);

  if (!isOpen) return null;

  // Calculate total BOQ contract value
  const totalBoqValue = boqItems.reduce(
    (sum, item) => sum + (Number(item.totalEstimatedQty) || 0) * (Number(item.contractRate) || 0),
    0
  );

  const effectiveContractValue = totalBoqValue > 0 ? totalBoqValue : totalBudget;

  // P&L Projections Calculation
  const projectedMaterialCost = Math.round((effectiveContractValue * materialBudgetPct) / 100);
  const projectedLabourCost = Math.round((effectiveContractValue * labourBudgetPct) / 100);
  const projectedMachineryCost = Math.round((effectiveContractValue * plantMachineryPct) / 100);
  const projectedOverheadCost = Math.round((effectiveContractValue * siteOverheadPct) / 100);
  const projectedContingencyCost = Math.round((effectiveContractValue * contingencyPct) / 100);

  const totalProjectedCost =
    projectedMaterialCost +
    projectedLabourCost +
    projectedMachineryCost +
    projectedOverheadCost +
    projectedContingencyCost;

  const totalCostPct = materialBudgetPct + labourBudgetPct + plantMachineryPct + siteOverheadPct + contingencyPct;
  const projectedGrossProfit = effectiveContractValue - totalProjectedCost;
  const projectedProfitMarginPct = effectiveContractValue > 0 ? Number(((projectedGrossProfit / effectiveContractValue) * 100).toFixed(1)) : 0;

  // Auto-generate code when site name changes if not edited manually
  const handleSiteNameChange = (val: string) => {
    setSiteName(val);
    if (!siteCode || siteCode.startsWith('SITE-')) {
      const generated = val
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0]?.toUpperCase())
        .join('')
        .slice(0, 5);
      setSiteCode(generated ? `${generated}-PH1` : 'SITE-01');
      setWorkOrderNumber(`WO-${new Date().getFullYear()}-${generated || 'SITE'}-01`);
    }
  };

  // Select category
  const handleSelectCategory = (cat: SiteCategory) => {
    setSelectedCategoryId(cat.id);
    setSiteType(cat.name);
    if (cat.defaultBannerUrl) {
      setBannerImage(cat.defaultBannerUrl);
    }
  };

  // Create new Site Category inline
  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCategoryError('Category name is required.');
      return;
    }
    const cleanCode = newCatCode.trim() || newCatName.slice(0, 4).toUpperCase();

    // Check duplicate
    const exists = siteCategories.some(
      (c) => c.name.toLowerCase() === newCatName.trim().toLowerCase() || c.code.toLowerCase() === cleanCode.toLowerCase()
    );
    if (exists) {
      setCategoryError('A category with this name or code already exists.');
      return;
    }

    try {
      const created = store.addSiteCategory({
        name: newCatName.trim(),
        code: cleanCode,
        description: newCatDescription.trim() || `${newCatName.trim()} projects and special construction sites`,
        color: newCatColor,
        icon: newCatIcon,
        isCustom: true,
      });

      setSelectedCategoryId(created.id);
      setSiteType(created.name);
      setShowAddCategoryForm(false);
      setNewCatName('');
      setNewCatCode('');
      setNewCatDescription('');
      setCategoryError('');
    } catch (err: any) {
      setCategoryError(err?.message || 'Failed to create site category.');
    }
  };

  // Quick fill preset sample data
  const handleFillDemo = (type: 'labour' | 'turnkey') => {
    if (type === 'labour') {
      setSiteName('Godrej Horizon Heights Tower C');
      setSiteCode('GHH-TWR-C');
      setClientName('Godrej Properties Ltd.');
      setLocation('Kanjurmarg East, Mumbai');
      setAddress('CTS 412, LBS Marg, Kanjurmarg East, Mumbai, MH 400042');
      const resiCat = siteCategories.find((c) => c.code === 'RESI') || siteCategories[0];
      if (resiCat) {
        setSelectedCategoryId(resiCat.id);
        setSiteType(resiCat.name);
      }
      setWorkType('Labour Contractor Work');
      setTotalBudget(8500000);
      setContractorName('Shree Ram Labour & Shuttering Gang');
      setContractorPhone('+91 98331 22990');
      setContractorType('Piece-Rate Labour Gang');
      setContractorTrade('Civil & Formwork');
      setWorkOrderNumber('WO-2026-GODREJ-044');
      setScopeOfWork('Reinforcement steel tying, aluminium formwork shuttering, and M35 concrete placement for 32 floors.');
      setBoqItems(BOQ_PRESETS.labour_rcc.items);
      setBannerImage(SAMPLE_BANNERS[4].url);
      setWorkOrderDocName('Godrej_TowerC_WorkOrder_Signed.pdf');
      setWorkOrderDocSize('3.1 MB');
      setUploadNotice('Verified Godrej Properties Contract WO Attached.');
    } else {
      setSiteName('L&T Tech Park Sub-Station & Cable Vault');
      setSiteCode('LTP-SUB-01');
      setClientName('L&T Construction & Powermin');
      setLocation('Whitefield, Bengaluru');
      setAddress('Plot 22B, EPIP Zone, Whitefield, Bengaluru, KA 560066');
      const commCat = siteCategories.find((c) => c.code === 'COMM') || siteCategories[1] || siteCategories[0];
      if (commCat) {
        setSelectedCategoryId(commCat.id);
        setSiteType(commCat.name);
      }
      setWorkType('Work with Material');
      setTotalBudget(38000000);
      setContractorName('InfraTech Turnkey Builders Pvt Ltd');
      setContractorPhone('+91 97110 55882');
      setContractorType('Turnkey Subcontractor');
      setContractorTrade('Turnkey Electrical & Civil');
      setWorkOrderNumber('WO-2026-LTP-TURNKEY');
      setScopeOfWork('Complete supply and execution of foundation, RCC cable trenches, high-voltage transformers pads, and boundary retaining wall.');
      setBoqItems(BOQ_PRESETS.material_turnkey.items);
      setBannerImage(SAMPLE_BANNERS[1].url);
      setWorkOrderDocName('LT_TechPark_Turnkey_Contract.pdf');
      setWorkOrderDocSize('5.4 MB');
      setUploadNotice('Verified L&T Turnkey Subcontract Agreement Attached.');
    }
  };

  // Handle Work Order Document upload
  const handleFileProcess = (file: File) => {
    if (file) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      setWorkOrderDocName(file.name);
      setWorkOrderDocSize(sizeInMb);
      setWorkOrderDocType(file.type || 'application/pdf');
      setUploadNotice(`Work Order "${file.name}" (${sizeInMb}) parsed & verified for P&L analysis.`);

      const reader = new FileReader();
      reader.onload = () => {
        setWorkOrderDocUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  // Add custom BOQ item
  const handleAddBoqItem = () => {
    const newItem: BOQItem = {
      id: `boq-custom-${Date.now()}`,
      itemCode: `BOQ-CUST-0${boqItems.length + 1}`,
      description: 'New Civil / Labour Contract Work Item',
      category: 'General Civil',
      unit: 'Sq.Ft',
      contractRate: 50,
      totalEstimatedQty: 1000,
      completedQty: 0,
      todayCompletedQty: 25,
      totalEarnedValue: 0,
    };
    setBoqItems([...boqItems, newItem]);
  };

  // Delete BOQ Item
  const handleDeleteBoqItem = (id: string) => {
    if (boqItems.length <= 1) {
      alert('You must have at least one BOQ item in the Work Order.');
      return;
    }
    setBoqItems(boqItems.filter((item) => item.id !== id));
  };

  // Update BOQ Item
  const handleUpdateBoqItem = (id: string, field: keyof BOQItem, value: any) => {
    setBoqItems(
      boqItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'contractRate' || field === 'completedQty') {
            updated.totalEarnedValue = (updated.completedQty || 0) * (updated.contractRate || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Submit and Create
  const handleCreateSite = () => {
    if (!siteName.trim()) {
      alert('Please enter a Site Name.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const pnlProjectionData: WorkOrderPnlProjection = {
        totalAgreedRevenue: effectiveContractValue,
        directMaterialCostBudget: projectedMaterialCost,
        labourWagesBudget: projectedLabourCost,
        plantMachineryFuelBudget: projectedMachineryCost,
        siteOverheadsAndAdminBudget: projectedOverheadCost,
        contingencyAndSafetyBudget: projectedContingencyCost,
        totalBudgetedCost: totalProjectedCost,
        projectedGrossProfit: projectedGrossProfit,
        projectedProfitMarginPct: projectedProfitMarginPct,
        retentionMoneyPct: retentionPct,
        retentionMoneyAmount: Math.round((effectiveContractValue * retentionPct) / 100),
        mobilizationAdvancePct: mobilizationAdvancePct,
        mobilizationAdvanceAmount: Math.round((effectiveContractValue * mobilizationAdvancePct) / 100),
        tdsDeductionPct: tdsPct,
        gstRatePct: gstPct,
        riskFactorSensitivity: riskSensitivity,
        milestones: milestones,
        uploadedWorkOrderFile: {
          name: workOrderDocName,
          size: workOrderDocSize,
          type: workOrderDocType,
          url: workOrderDocUrl || undefined,
          uploadedAt: new Date().toISOString(),
        },
      };

      const result = store.createProjectWithWorkOrder({
        project: {
          name: siteName,
          code: siteCode || `SITE-${Date.now().toString().slice(-4)}`,
          client: clientName || 'Client Infrastructure Ltd.',
          location: location || 'Project Site Yard',
          address: address || `${location}, Site Office Gate 1`,
          coordinates: { lat: 19.076, lng: 72.8777 },
          geofenceRadiusMeters: 400,
          totalBudget: totalBudget || effectiveContractValue,
          spentBudget: 0,
          startDate: startDate,
          targetEndDate: targetEndDate,
          status: 'active',
          progressPercentage: 0,
          supervisorName: supervisorName,
          supervisorPhone: supervisorPhone,
          siteType: siteType,
          siteCategoryId: selectedCategoryId,
          bannerImage: bannerImage,
          activeWorkersCount: 14,
          workType: workType,
          workOrderNumber: workOrderNumber,
          workOrderDocumentUrl: workOrderDocUrl || undefined,
          workOrderDocumentName: workOrderDocName,
          contractValue: effectiveContractValue,
          contractorName: contractorName,
          contractorPhone: contractorPhone,
          scopeOfWork: scopeOfWork,
          pnlProjection: pnlProjectionData,
        },
        workOrder: {
          workOrderNumber: workOrderNumber,
          contractorName: contractorName,
          contractorPhone: contractorPhone,
          contractorTrade: contractorTrade,
          contractorType: contractorType,
          scopeOfWork: scopeOfWork,
          contractValue: effectiveContractValue,
          documentUrl: workOrderDocUrl || undefined,
          documentName: workOrderDocName,
          documentType: workOrderDocType,
          fileSize: workOrderDocSize,
          issuedBy: clientName || 'Authorized Site Engineer',
          notes: `Official Work Order with P&L projection model for ${siteName} (${workType})`,
          pnlProjection: pnlProjectionData,
          milestones: milestones,
        },
        boqItems: boqItems,
        generateInitialDPR: generateDPR,
      });

      if (onSiteCreated) {
        onSiteCreated(result.project, result.workOrder);
      }

      onClose();
    } catch (err: any) {
      console.error('Error creating site:', err);
      alert('Failed to create site: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = siteCategories.find((c) => c.id === selectedCategoryId) || siteCategories[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Create / Add New Site</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-orange-500 text-white">
                  P&L Engine Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Setup custom Site Category, upload Work Order, configure BOQ rates, and project future P&L margins.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Demo Pre-fill */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400">Quick Fill:</span>
              <button
                type="button"
                onClick={() => handleFillDemo('labour')}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                Labour Site
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => handleFillDemo('turnkey')}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
              >
                Turnkey Site
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                currentStep === 1
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                1
              </span>
              <span>Site Fundamentals & Category</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                currentStep === 2
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                2
              </span>
              <span>Work Order Upload & Contract</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                currentStep === 3
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                3
              </span>
              <span>Future P&L Projections</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                currentStep === 4
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                4
              </span>
              <span>BOQ Rates & DPR Setup</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: Site Profile, Category & Type of Work */}
          {currentStep === 1 && (
            <div className="space-y-6">
              
              {/* Type of Work Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-orange-600" />
                  Type of Work <span className="text-red-500">*</span>
                  <span className="text-[11px] text-slate-500 font-normal lowercase">(determines P&L calculations & material tracking)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Option A: Labour Contractor Work */}
                  <div
                    onClick={() => {
                      setWorkType('Labour Contractor Work');
                      setContractorType('Piece-Rate Labour Gang');
                      setBoqItems(BOQ_PRESETS.labour_rcc.items);
                    }}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
                      workType === 'Labour Contractor Work'
                        ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        workType === 'Labour Contractor Work' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <HardHat className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm">Labour Contractor Work</h3>
                          {workType === 'Labour Contractor Work' && (
                            <CheckCircle2 className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Labour rate-contract basis. Client supplies major raw materials at site; contractor provides skilled labour gangs, tools, consumables & supervision with piece-rate P&L.
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 bg-orange-100/80 text-orange-800 text-[10px] font-bold rounded">
                            Item Rates (₹/Sq.Ft, ₹/MT)
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                            Muster & Overtime Wage P&L
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Option B: Work with Material */}
                  <div
                    onClick={() => {
                      setWorkType('Work with Material');
                      setContractorType('Turnkey Subcontractor');
                      setBoqItems(BOQ_PRESETS.material_turnkey.items);
                    }}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
                      workType === 'Work with Material'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        workType === 'Work with Material' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm">Work with Material</h3>
                          {workType === 'Work with Material' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Full turnkey civil & structural execution. Contractor procures and supplies raw materials (cement, rebar, aggregates, bricks) plus machinery & labour gangs.
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 bg-blue-100/80 text-blue-800 text-[10px] font-bold rounded">
                            Turnkey Material Inventory
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                            Direct Material + Labour P&L
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Site Category Selector & "+ Create New Category" feature */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-orange-600" />
                      Site Category / Sector <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Categorize by project domain for portfolio analysis, P&L aggregation, and tax classification.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-all self-start"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddCategoryForm ? 'Close Category Form' : 'Add / Create New Site Category'}</span>
                  </button>
                </div>

                {/* Inline New Category Creation Form */}
                {showAddCategoryForm && (
                  <form onSubmit={handleCreateNewCategory} className="bg-white border-2 border-orange-400 rounded-xl p-4 shadow-sm space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                          +
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">Define New Project Site Category</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryForm(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {categoryError && (
                      <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{categoryError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newCatName}
                          onChange={(e) => {
                            setNewCatName(e.target.value);
                            if (!newCatCode) {
                              setNewCatCode(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase());
                            }
                          }}
                          placeholder="e.g. Hospitality & Eco-Resorts, Clean Solar Farms"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Taxonomy Code
                        </label>
                        <input
                          type="text"
                          value={newCatCode}
                          onChange={(e) => setNewCatCode(e.target.value.toUpperCase())}
                          placeholder="e.g. HOSP, SOLAR"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono font-bold uppercase"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Description & Scope Definition
                        </label>
                        <input
                          type="text"
                          value={newCatDescription}
                          onChange={(e) => setNewCatDescription(e.target.value)}
                          placeholder="e.g. 5-star hotels, luxury eco-resorts, banquet pavilions, and guest cottages"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Theme Color Pill
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {CATEGORY_COLOR_PALETTES.map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => setNewCatColor(c.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                newCatColor === c.id ? 'ring-2 ring-orange-500 scale-110' : 'opacity-70 hover:opacity-100'
                              } ${c.dot}`}
                              title={c.label}
                            >
                              {newCatColor === c.id && <Check className="w-3 h-3 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Category Icon
                        </label>
                        <select
                          value={newCatIcon}
                          onChange={(e) => setNewCatIcon(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          {CATEGORY_ICONS.map((ico) => (
                            <option key={ico.id} value={ico.id}>
                              {ico.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryForm(false)}
                        className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save & Select Category</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Category Pills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {siteCategories.map((cat) => {
                    const isSelected = cat.id === selectedCategoryId;
                    const palette = CATEGORY_COLOR_PALETTES.find((p) => p.id === cat.color) || CATEGORY_COLOR_PALETTES[0];
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat)}
                        className={`cursor-pointer rounded-xl p-2.5 border transition-all text-left flex items-start gap-2.5 relative ${
                          isSelected
                            ? 'border-orange-600 bg-white ring-2 ring-orange-400 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${palette.dot}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {cat.name}
                            </span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">
                            [{cat.code}]
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Basic Site Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Site / Project Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={siteName}
                      onChange={(e) => handleSiteNameChange(e.target.value)}
                      placeholder="e.g. Prestige Tech Park Tower D"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Site Code / ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={siteCode}
                    onChange={(e) => setSiteCode(e.target.value)}
                    placeholder="e.g. PTP-TWR-D"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono font-bold text-slate-800 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Client / Principal Employer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Prestige Estates / L&T / NHAI"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Project Budget (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(Number(e.target.value))}
                      placeholder="15000000"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Whitefield, Bengaluru"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Site Address & Gate Location
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 14-B, Near Metro Pier 142, Eastern Highway"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Completion Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={targetEndDate}
                      onChange={(e) => setTargetEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Site Supervisor
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      placeholder="e.g. Rajendra Verma"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supervisor Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={supervisorPhone}
                      onChange={(e) => setSupervisorPhone(e.target.value)}
                      placeholder="+91 98200 44551"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

              </div>

              {/* Site Cover Image Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Aerial Cover / Site Photo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {SAMPLE_BANNERS.map((banner, idx) => (
                    <div
                      key={idx}
                      onClick={() => setBannerImage(banner.url)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 relative transition-all group ${
                        bannerImage === banner.url
                          ? 'border-orange-600 ring-2 ring-orange-400'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={banner.url} alt={banner.label} className="w-full h-16 object-cover" />
                      <div className="p-1 text-[10px] font-semibold text-slate-700 truncate bg-slate-50 text-center">
                        {banner.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Work Order (WO) Upload & Contract Parameters */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              {/* Work Order Upload Box with Drag & Drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragOver
                    ? 'border-orange-500 bg-orange-50/80 scale-[1.01]'
                    : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Upload Signed Work Order / Contract Agreement
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Drag & drop your official contract agreement (PDF, Scanned Image, DOCX, XLSX) to auto-extract rates, milestones, and feed into the future P&L projection model.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Choose Work Order File</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.xlsx,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setWorkOrderDocName('Standard_Contract_Agreement_WO.pdf');
                      setWorkOrderDocSize('2.4 MB');
                      setWorkOrderDocType('application/pdf');
                      setWorkOrderDocUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80');
                      setUploadNotice('Sample official Work Order contract attached and verified for P&L analysis.');
                    }}
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Use Sample Contract PDF</span>
                  </button>
                </div>

                {/* Uploaded File Card Preview */}
                {workOrderDocName && (
                  <div className="mt-4 max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {workOrderDocName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{workOrderDocSize}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> P&L Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {workOrderDocUrl && (
                        <a
                          href={workOrderDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-100"
                        title="Replace File"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {uploadNotice && (
                  <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{uploadNotice}</span>
                  </div>
                )}
              </div>

              {/* Work Order Contract Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Work Order Reference No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={workOrderNumber}
                    onChange={(e) => setWorkOrderNumber(e.target.value)}
                    placeholder="e.g. WO-2026-PTP-001"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contractor / Agency Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder="e.g. Verma Civil & Construction Gang"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contractor Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contractorPhone}
                    onChange={(e) => setContractorPhone(e.target.value)}
                    placeholder="+91 98200 44551"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contractor Classification
                  </label>
                  <select
                    value={contractorType}
                    onChange={(e) => setContractorType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    <option value="Piece-Rate Labour Gang">Piece-Rate Labour Gang (Item Rate)</option>
                    <option value="Turnkey Subcontractor">Turnkey Subcontractor (Material + Labour)</option>
                    <option value="Specialist Agency">Specialist Agency (MEP/Flooring/Facade)</option>
                    <option value="Daily Wage Gang">Daily Wage Gang (Muster Basis)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Trade / Discipline
                  </label>
                  <input
                    type="text"
                    value={contractorTrade}
                    onChange={(e) => setContractorTrade(e.target.value)}
                    placeholder="e.g. Civil, Rebar & Formwork"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agreed Contract Value (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      readOnly
                      value={`₹ ${effectiveContractValue.toLocaleString('en-IN')}`}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Scope of Work
                  </label>
                  <textarea
                    rows={3}
                    value={scopeOfWork}
                    onChange={(e) => setScopeOfWork(e.target.value)}
                    placeholder="Describe specific work items, technical specifications, and milestones included in this contract..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

              </div>

            </div>
          )}

          {/* STEP 3: Future P&L Projections & Financial Budgeting */}
          {currentStep === 3 && (
            <div className="space-y-6">
              
              {/* Projections Top Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Agreed Contract Revenue</div>
                  <div className="text-xl font-extrabold text-white mt-1 font-mono">
                    ₹ {effectiveContractValue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Source: Uploaded Work Order / BOQ
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Projected Cost</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    ₹ {totalProjectedCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{totalCostPct}% of Revenue</span>
                    <span className={totalCostPct <= 85 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                      {totalCostPct <= 85 ? 'Within Budget' : 'High Outlay'}
                    </span>
                  </div>
                </div>

                <div className={`rounded-xl p-4 border shadow-xs ${
                  projectedProfitMarginPct >= 15
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : projectedProfitMarginPct >= 8
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Projected Gross Profit & Margin</div>
                  <div className="text-xl font-extrabold mt-1 font-mono flex items-center justify-between">
                    <span>₹ {projectedGrossProfit.toLocaleString('en-IN')}</span>
                    <span className="text-base px-2 py-0.5 rounded-lg bg-white/70 font-bold">
                      {projectedProfitMarginPct}%
                    </span>
                  </div>
                  <div className="text-[11px] mt-1 opacity-80 flex items-center gap-1 font-semibold">
                    {projectedProfitMarginPct >= 15 ? (
                      <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> High Profitability Margin</span>
                    ) : projectedProfitMarginPct >= 8 ? (
                      <span className="flex items-center gap-1 text-amber-700"><AlertCircle className="w-3.5 h-3.5" /> Moderate Profitability Margin</span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-700"><TrendingDown className="w-3.5 h-3.5" /> Tight Margin / Review Rates</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost Component Breakdown Budgeting Sliders */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Work Order Cost Center Projections (% Allocation)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Total Budget Allocation: <strong className={totalCostPct > 100 ? 'text-rose-600' : 'text-slate-900'}>{totalCostPct}%</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Direct Material */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-blue-600" /> Direct Material Cost Budget
                      </span>
                      <span className="font-mono font-bold text-blue-700">{materialBudgetPct}% (₹{projectedMaterialCost.toLocaleString('en-IN')})</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={70}
                      value={materialBudgetPct}
                      onChange={(e) => setMaterialBudgetPct(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Raw materials procurement: Cement, Steel Rebar, Aggregate, Bricks & Formwork.
                    </p>
                  </div>

                  {/* Labour Wages */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5 text-orange-600" /> Direct Labour Wages Budget
                      </span>
                      <span className="font-mono font-bold text-orange-700">{labourBudgetPct}% (₹{projectedLabourCost.toLocaleString('en-IN')})</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={70}
                      value={labourBudgetPct}
                      onChange={(e) => setLabourBudgetPct(Number(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Gang muster wages, piece-rate item wages, and overtime allowances.
                    </p>
                  </div>

                  {/* Machinery & Fuel */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-600" /> Plant, Machinery & Fuel Budget
                      </span>
                      <span className="font-mono font-bold text-amber-700">{plantMachineryPct}% (₹{projectedMachineryCost.toLocaleString('en-IN')})</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={plantMachineryPct}
                      onChange={(e) => setPlantMachineryPct(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Excavator hire, crane rental, diesel generator, needle vibrator fuel.
                    </p>
                  </div>

                  {/* Overheads & Administration */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Site Overheads & Admin
                      </span>
                      <span className="font-mono font-bold text-purple-700">{siteOverheadPct}% (₹{projectedOverheadCost.toLocaleString('en-IN')})</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={siteOverheadPct}
                      onChange={(e) => setSiteOverheadPct(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Site office rent, electricity, supervisor phones, transportation & petty cash.
                    </p>
                  </div>

                </div>

                {/* Commercial Terms & Withholdings */}
                <div className="border-t border-slate-200 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Retention Money %
                    </label>
                    <input
                      type="number"
                      value={retentionPct}
                      onChange={(e) => setRetentionPct(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobilization Advance %
                    </label>
                    <input
                      type="number"
                      value={mobilizationAdvancePct}
                      onChange={(e) => setMobilizationAdvancePct(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      TDS Deduction %
                    </label>
                    <input
                      type="number"
                      value={tdsPct}
                      onChange={(e) => setTdsPct(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Risk Sensitivity
                    </label>
                    <select
                      value={riskSensitivity}
                      onChange={(e) => setRiskSensitivity(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-bold"
                    >
                      <option value="LOW">Low Risk</option>
                      <option value="MEDIUM">Medium Risk</option>
                      <option value="HIGH">High Risk / Volatile</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Milestones & Future Cash-Flow Billing Projection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Work Order Billing Milestones & Cash-Flow Projection
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Total: {milestones.reduce((s, m) => s + m.percentage, 0)}%
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Milestone Stage</th>
                        <th className="py-2.5 px-3">Target Date</th>
                        <th className="py-2.5 px-3">Key Deliverable</th>
                        <th className="py-2.5 px-3 text-right">Billing %</th>
                        <th className="py-2.5 px-3 text-right">Projected Billing (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {milestones.map((m) => {
                        const amount = Math.round((effectiveContractValue * m.percentage) / 100);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900">{m.title}</td>
                            <td className="p-2.5 text-slate-600 font-mono text-[11px]">{m.targetDate}</td>
                            <td className="p-2.5 text-slate-600 text-[11px]">{m.deliverable}</td>
                            <td className="p-2.5 font-mono font-bold text-right text-orange-700">{m.percentage}%</td>
                            <td className="p-2.5 font-mono font-bold text-right text-slate-900">
                              ₹ {amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: BOQ Rates & Day-to-Day P&L Setup */}
          {currentStep === 4 && (
            <div className="space-y-6">
              
              {/* Preset Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-slate-800">BOQ Industry Templates:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBoqItems(BOQ_PRESETS.labour_rcc.items)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                  >
                    RCC Frame Gang
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoqItems(BOQ_PRESETS.labour_finishing.items)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                  >
                    Masonry & Plaster
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoqItems(BOQ_PRESETS.material_turnkey.items)}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                  >
                    Turnkey Package
                  </button>
                </div>
              </div>

              {/* BOQ Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Contract Bill of Quantities (BOQ) & Unit Rates
                    </h4>
                    <span className="px-2 py-0.2 rounded bg-orange-100 text-orange-800 text-[10px] font-extrabold">
                      {boqItems.length} Items
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBoqItem}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Item Code</th>
                          <th className="py-2.5 px-3 min-w-[200px]">Description</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3">Planned Qty</th>
                          <th className="py-2.5 px-3">Contract Rate (₹)</th>
                          <th className="py-2.5 px-3">Total Value</th>
                          <th className="py-2.5 px-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {boqItems.map((item) => {
                          const itemTotal = (Number(item.totalEstimatedQty) || 0) * (Number(item.contractRate) || 0);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80">
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={item.itemCode}
                                  onChange={(e) => handleUpdateBoqItem(item.id, 'itemCode', e.target.value)}
                                  className="w-24 px-2 py-1 border border-slate-200 rounded font-mono font-bold text-slate-800"
                                />
                              </td>
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleUpdateBoqItem(item.id, 'description', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 rounded font-medium text-slate-800"
                                />
                              </td>
                              <td className="p-2.5">
                                <select
                                  value={item.category}
                                  onChange={(e) => handleUpdateBoqItem(item.id, 'category', e.target.value)}
                                  className="px-2 py-1 border border-slate-200 rounded bg-white"
                                >
                                  <option value="Steel & Rebar">Steel & Rebar</option>
                                  <option value="Cement & Concrete">Cement & Concrete</option>
                                  <option value="Formwork & Shuttering">Formwork & Shuttering</option>
                                  <option value="Masonry & Plaster">Masonry & Plaster</option>
                                  <option value="Flooring & Tiling">Flooring & Tiling</option>
                                  <option value="Electrical & Plumbing">Electrical & Plumbing</option>
                                  <option value="General Civil">General Civil</option>
                                </select>
                              </td>
                              <td className="p-2.5">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleUpdateBoqItem(item.id, 'unit', e.target.value)}
                                  className="px-2 py-1 border border-slate-200 rounded bg-white font-mono"
                                >
                                  <option value="MT">MT (Tons)</option>
                                  <option value="Sq.Ft">Sq.Ft</option>
                                  <option value="Sq.M">Sq.M</option>
                                  <option value="Cu.M">Cu.M</option>
                                  <option value="Rft">Rft</option>
                                  <option value="Bags">Bags</option>
                                  <option value="Nos">Nos</option>
                                </select>
                              </td>
                              <td className="p-2.5">
                                <input
                                  type="number"
                                  value={item.totalEstimatedQty}
                                  onChange={(e) => handleUpdateBoqItem(item.id, 'totalEstimatedQty', Number(e.target.value))}
                                  className="w-20 px-2 py-1 border border-slate-200 rounded font-mono text-right"
                                />
                              </td>
                              <td className="p-2.5">
                                <input
                                  type="number"
                                  value={item.contractRate}
                                  onChange={(e) => handleUpdateBoqItem(item.id, 'contractRate', Number(e.target.value))}
                                  className="w-24 px-2 py-1 border border-slate-200 rounded font-mono font-bold text-right text-emerald-700"
                                />
                              </td>
                              <td className="p-2.5 font-mono font-bold text-slate-800 text-right">
                                ₹ {itemTotal.toLocaleString('en-IN')}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBoqItem(item.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Calculated Total Contract Value from BOQ Rates:
                    </span>
                    <span className="text-sm font-extrabold font-mono text-emerald-700">
                      ₹ {totalBoqValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Day-to-Day Progress & P&L Engine Activation */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-900">
                      <input
                        type="checkbox"
                        checked={generateDPR}
                        onChange={(e) => setGenerateDPR(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>Initialize Day-1 Work Progress Report (DPR) & Live P&L Tracking</span>
                    </label>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Automatically generates today's initial executed quantities based on uploaded BOQ rates, calculates labour gang muster wages (₹11,755), consumable expenses (₹5,850), and derives immediate net profit margin for this site.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !siteName.trim()) {
                    alert('Please enter a Site Name.');
                    return;
                  }
                  setCurrentStep((prev) => (prev + 1) as any);
                }}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateSite}
                className="px-6 py-2 text-xs font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? 'Creating Site...' : 'Create Site & Launch P&L Engine'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
