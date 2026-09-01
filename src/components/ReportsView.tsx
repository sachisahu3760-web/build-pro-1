import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileDown,
  Printer,
  Share2,
  Calendar,
  Sparkles,
  CheckCircle2,
  HardHat,
  TrendingUp,
  FileText,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { ProjectSite, MaterialItem, WorkerProfile, SiteUpdateLog, SafetyIncident, BudgetExpense, LanguageCode, Role } from '../types';
import { getTranslation } from '../lib/i18n';
import { exportExecutiveProjectPDF } from '../lib/pdfExporter';
import { sendGmailBroadcast } from '../lib/workspaceService';

interface ReportsViewProps {
  project: ProjectSite;
  materials: MaterialItem[];
  workers: WorkerProfile[];
  updates: SiteUpdateLog[];
  incidents: SafetyIncident[];
  expenses: BudgetExpense[];
  currentLang: LanguageCode;
  currentRole: Role;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  project,
  materials = [],
  workers = [],
  updates = [],
  incidents = [],
  expenses = [],
  currentLang,
  currentRole,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    location: 'Mumbai, Maharashtra',
    progressPercentage: 68,
    totalBudget: 425000000,
    spentBudget: 289000000,
  };

  const [reportType, setReportType] = useState<string>('comprehensive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const handleGeneratePdf = () => {
    setIsGenerating(true);
    setTimeout(() => {
      exportExecutiveProjectPDF(safeProject, materials, workers, updates, incidents, expenses);
      setIsGenerating(false);
    }, 600);
  };

  const handleEmailReport = async () => {
    setEmailStatus(null);
    try {
      await sendGmailBroadcast(
        'director@buildpulse.org',
        `[Automated Report] ${safeProject.name} - Executive Status Dossier`,
        `Attached executive summary for ${safeProject.name}.\n\nOverall Progress: ${safeProject.progressPercentage}%\nSpent Budget: ₹${(safeProject.spentBudget / 10000000).toFixed(2)} Cr\nActive Field Crew: ${workers.filter((w) => w.status === 'Active On-Site').length}\nOpen Safety Flags: ${incidents.filter((i) => i.status !== 'Resolved').length}\n\nGenerated via BuildPulse Pro Executive Engine.`
      );
      setEmailStatus('Executive Dossier dispatched to stakeholders via Gmail!');
    } catch (err: any) {
      setEmailStatus(`Notice: ${err.message || 'Ready for Google OAuth connection'}`);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" />
            <span>{getTranslation(currentLang, 'reports')}</span>
          </h1>
          <p className="text-[11px] text-slate-500">
            Automated PDF reporting engine, executive summaries & stakeholder dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEmailReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Email Report via Gmail</span>
          </button>

          <button
            id="btn-generate-pdf-main"
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            <span>Export Executive PDF</span>
          </button>
        </div>
      </div>

      {emailStatus && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between shadow-xs">
          <span>{emailStatus}</span>
          <button onClick={() => setEmailStatus(null)} className="text-blue-500 font-bold hover:text-blue-800">✕</button>
        </div>
      )}

      {/* Available Report Formats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Card 1 */}
        <div
          onClick={() => setReportType('comprehensive')}
          className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2.5 shadow-xs ${
            reportType === 'comprehensive'
              ? 'bg-orange-50/60 border-orange-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="p-2 rounded bg-orange-100 text-orange-600 w-fit">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Full Executive Site Progress Dossier</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Includes physical milestone progress, S-curve trends, budget cost codes, workforce shift attendance & safety logs.
            </p>
          </div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Recommended for Stakeholders</span>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => setReportType('materials')}
          className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2.5 shadow-xs ${
            reportType === 'materials'
              ? 'bg-orange-50/60 border-orange-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="p-2 rounded bg-blue-100 text-blue-600 w-fit">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Material Consumption & Inventory Ledger</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Inventory valuation, low-stock alerts, procurement vendor contacts & purchase order reconciliations.
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">For Procurement & Store Managers</span>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => setReportType('safety')}
          className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2.5 shadow-xs ${
            reportType === 'safety'
              ? 'bg-orange-50/60 border-orange-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="p-2 rounded bg-red-100 text-red-600 w-fit">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">HSE Safety & Statutory Audit Dossier</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              OSHA/IS compliance logs, open safety hazard interventions, PPE audit summaries & statutory permit records.
            </p>
          </div>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">For HSE Auditors & Authorities</span>
        </div>

      </div>

      {/* Report Preview Panel */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Live Document Preview</span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              {safeProject.name} — Executive Report Summary
            </h3>
          </div>
          <button
            onClick={handleGeneratePdf}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-orange-600" />
            <span>Download .PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 text-[11px]">Site Code:</span>
            <div className="font-bold text-slate-900 font-mono">{safeProject.code}</div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Physical Progress:</span>
            <div className="font-bold text-orange-600">{safeProject.progressPercentage}%</div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Sanctioned Budget:</span>
            <div className="font-bold text-slate-900">₹{(safeProject.totalBudget / 10000000).toFixed(2)} Cr</div>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">Disbursed Outlay:</span>
            <div className="font-bold text-emerald-600">₹{(safeProject.spentBudget / 10000000).toFixed(2)} Cr</div>
          </div>
        </div>

        {/* Milestone summary list */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Key Milestones Tracked in PDF</h4>
          <div className="space-y-1">
            {updates.slice(0, 3).map((upd) => (
              <div key={upd.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate mr-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{upd.title}</span>
                </div>
                <span className="text-orange-600 font-mono font-bold shrink-0">{upd.progressPercentage}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
