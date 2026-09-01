import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  BookOpen,
  FileText,
  Upload,
} from 'lucide-react';
import { SafetyIncident, ComplianceDocument, LanguageCode, Role, ProjectSite } from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation } from '../lib/i18n';

interface SafetyComplianceViewProps {
  incidents: SafetyIncident[];
  docs: ComplianceDocument[];
  project: ProjectSite;
  currentLang: LanguageCode;
  currentRole: Role;
}

export const SafetyComplianceView: React.FC<SafetyComplianceViewProps> = ({
  incidents = [],
  docs = [],
  project,
  currentLang,
  currentRole,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    supervisorName: 'Sanjay Deshmukh',
  };

  const [activeTab, setActiveTab] = useState<'incidents' | 'permits' | 'aiSearch'>('incidents');
  const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);

  // AI Search Grounding
  const [searchQuery, setSearchQuery] = useState('IS 2750 scaffolding safety standard load limits');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearchingAi, setIsSearchingAi] = useState(false);

  // Incident Form
  const [incidentForm, setIncidentForm] = useState<Partial<SafetyIncident>>({
    title: '',
    type: 'PPE Non-Compliance',
    severity: 'MEDIUM',
    locationOnSite: 'Pier 146 Superstructure Deck',
    description: '',
    correctiveAction: '',
  });

  // Doc Form
  const [docForm, setDocForm] = useState<Partial<ComplianceDocument>>({
    title: '',
    category: 'Building Permit',
    issuingAuthority: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-12-31',
    fileSize: '3.4 MB',
    notes: '',
  });

  const handleSearchSafetyStandards = async () => {
    setIsSearchingAi(true);
    setSearchResults(null);
    try {
      const res = await fetch('/api/gemini/safety-regulatory-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          jurisdiction: 'National Building Code / IS / OSHA Construction Safety',
        }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingAi(false);
    }
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.title) return;

    store.addSafetyIncident({
      projectId: safeProject.id,
      title: incidentForm.title,
      type: incidentForm.type as any,
      severity: incidentForm.severity as any,
      status: 'Open',
      reportedBy: safeProject.supervisorName || 'Safety Marshal',
      reportedRole: 'HSE Safety Officer',
      locationOnSite: incidentForm.locationOnSite || 'General Site Front',
      description: incidentForm.description || 'Observed hazard requiring corrective action.',
      photos: [],
      complianceStandard: 'IS 3521 / OSHA 1926 Safety Standard',
    });

    setShowAddIncidentModal(false);
    setIncidentForm({
      title: '',
      type: 'PPE Non-Compliance',
      severity: 'MEDIUM',
      locationOnSite: 'Pier 146 Superstructure Deck',
      description: '',
      correctiveAction: '',
    });
  };

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title) return;

    store.addComplianceDoc({
      projectId: safeProject.id,
      title: docForm.title,
      category: docForm.category as any,
      issuingAuthority: docForm.issuingAuthority || 'Govt Department',
      issueDate: docForm.issueDate || '2025-01-01',
      expiryDate: docForm.expiryDate || '2028-12-31',
      status: 'Valid',
      fileUrl: 'https://example.com/compliance-certificate.pdf',
      fileSize: docForm.fileSize || '2.5 MB',
      notes: docForm.notes || 'Official approval filed.',
    });

    setShowAddDocModal(false);
    setDocForm({
      title: '',
      category: 'Building Permit',
      issuingAuthority: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2028-12-31',
      fileSize: '3.4 MB',
      notes: '',
    });
  };

  const openIncidentsCount = incidents.filter((i) => i.status !== 'Resolved').length;

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>{getTranslation(currentLang, 'safety')}</span>
          </h1>
          <p className="text-[11px] text-slate-500">
            HSE incident management, OSHA / IS compliance audit logs & permit expiration trackers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddIncidentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{getTranslation(currentLang, 'reportHazard')}</span>
          </button>

          <button
            onClick={() => setShowAddDocModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-orange-500" />
            <span>Upload Permit</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'incidents'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Safety Incidents ({openIncidentsCount} Open)</span>
        </button>

        <button
          onClick={() => setActiveTab('permits')}
          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'permits'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Permits Vault ({docs.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('aiSearch');
            if (!searchResults) handleSearchSafetyStandards();
          }}
          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'aiSearch'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>AI Building Code Search</span>
        </button>
      </div>

      {/* TAB 1: Safety Incidents */}
      {activeTab === 'incidents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {incidents.map((inc) => {
            const isCritical = inc.severity === 'CRITICAL' || inc.severity === 'HIGH';
            const isResolved = inc.status === 'Resolved';

            return (
              <div
                key={inc.id}
                className={`p-3.5 rounded-lg bg-white border transition-all shadow-xs space-y-2.5 ${
                  isResolved
                    ? 'border-emerald-200'
                    : isCritical
                    ? 'border-red-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      inc.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-700 font-extrabold'
                        : inc.severity === 'HIGH'
                        ? 'bg-orange-100 text-orange-700 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {inc.severity} SEVERITY
                  </span>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">{inc.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{inc.locationOnSite}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{inc.description}</p>

                {inc.correctiveAction && (
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs text-emerald-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Corrective Action Taken:</span>
                    <div className="text-[11px]">{inc.correctiveAction}</div>
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>By: {inc.reportedBy}</span>
                  <span>{new Date(inc.timestamp).toLocaleDateString('en-IN')}</span>
                </div>

                {!isResolved && (
                  <button
                    onClick={() => {
                      const action = prompt('Enter corrective action taken:', 'Hazard inspected and eliminated as per safety guidelines.');
                      if (action) store.resolveSafetyIncident(inc.id, action);
                    }}
                    className="w-full py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verify & Close Hazard</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Permits & Compliance Docs */}
      {activeTab === 'permits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docs.map((doc) => {
            const isExpiring = doc.status === 'Expiring Soon';

            return (
              <div
                key={doc.id}
                className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1.5 py-0.2 rounded bg-slate-100">
                      {doc.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{doc.title}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isExpiring
                        ? 'bg-amber-100 text-amber-700 font-bold'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Issuing Authority:</span>
                    <span className="font-medium text-slate-800 text-[11px]">{doc.issuingAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Valid Until:</span>
                    <span className={`font-mono font-bold text-[11px] ${isExpiring ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {doc.expiryDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Document Size:</span>
                    <span className="text-[11px]">{doc.fileSize} (PDF)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">{doc.notes}</p>

                <div className="pt-1.5 border-t border-slate-100 flex justify-end">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-orange-600 font-bold hover:underline"
                  >
                    <span>View Official Certificate</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: AI Building Code Search */}
      {activeTab === 'aiSearch' && (
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>AI Construction Regulatory & Safety Assistant</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Grounding with Google Search to fetch verified Indian Standards (IS), OSHA, and NBC building codes
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Deep excavation slope benching angles in IS 3764..."
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleSearchSafetyStandards}
              disabled={isSearchingAi}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-xs"
            >
              {isSearchingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search Codes</span>
            </button>
          </div>

          {isSearchingAi && (
            <div className="py-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Querying construction safety databases, OSHA manuals, and IS standards...
              </p>
            </div>
          )}

          {searchResults && !isSearchingAi && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {searchResults.answer}
              </div>

              {searchResults.sources && searchResults.sources.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grounding Search Citations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResults.sources.map((s: any, idx: number) => (
                      <a
                        key={idx}
                        href={s.web?.uri || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 truncate max-w-sm flex items-center gap-1 font-medium"
                      >
                        <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{s.web?.title || 'Regulatory Source ' + (idx + 1)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Incident Modal */}
      {showAddIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>Report Site Safety Hazard</span>
              </h2>
              <button onClick={() => setShowAddIncidentModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Hazard Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unsecured opening in concourse floor slab"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Incident Type</label>
                  <select
                    value={incidentForm.type}
                    onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    {['Near Miss', 'PPE Non-Compliance', 'Equipment Hazard', 'Fall Risk', 'Electrical Hazard', 'Fire Hazard', 'Excavation Collapse'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Severity Level</label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Exact Location on Site</label>
                <input
                  type="text"
                  placeholder="e.g. Pier 150 Level 2 Scaffolding Deck"
                  value={incidentForm.locationOnSite}
                  onChange={(e) => setIncidentForm({ ...incidentForm, locationOnSite: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hazard Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe observed conditions, risks, and required corrective interventions..."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddIncidentModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Log Hazard Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-orange-500" />
                <span>Add Compliance Permit</span>
              </h2>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Pollution Control Board Consent to Operate"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    {['Building Permit', 'Environmental Clearance', 'Structural Stability', 'Fire NOC', 'Labor Insurance', 'Soil Testing Report'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Issuing Department</label>
                  <input
                    type="text"
                    placeholder="e.g. MMRDA / Municipal Corp"
                    value={docForm.issuingAuthority}
                    onChange={(e) => setDocForm({ ...docForm, issuingAuthority: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={docForm.issueDate}
                    onChange={(e) => setDocForm({ ...docForm, issueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={docForm.expiryDate}
                    onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Save Compliance Permit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
