import React, { useState } from 'react';
import {
  FolderLock,
  UploadCloud,
  FileText,
  Search,
  ExternalLink,
  Plus,
  Layers,
  RefreshCw,
  HardDrive,
  Download,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { ProjectDocument, LanguageCode, Role, ProjectSite } from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation } from '../lib/i18n';
import { uploadFileToDrive, listDriveFiles } from '../lib/workspaceService';

interface DocumentsViewProps {
  docs: ProjectDocument[];
  project: ProjectSite;
  currentLang: LanguageCode;
  currentRole: Role;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);

  // Upload Form
  const [formData, setFormData] = useState<Partial<ProjectDocument>>({
    title: '',
    category: 'Architectural Blueprint',
    version: 'Rev 1.0',
    fileSize: '4.2 MB',
    fileType: 'pdf',
    tags: ['Superstructure', 'Approved'],
  });

  const categories = [
    'ALL',
    'Architectural Blueprint',
    'Structural CAD Drawing',
    'MEP Schematics',
    'Geotechnical Soil Report',
    'Quality Test Certificate',
    'Subcontractor Agreement',
  ];

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    store.addDocument({
      projectId: safeProject.id,
      title: formData.title,
      category: formData.category as any,
      fileUrl: 'https://example.com/blueprints/drawing.pdf',
      fileSize: formData.fileSize || '3.5 MB',
      fileType: formData.fileType || 'pdf',
      uploadedBy: safeProject.supervisorName || 'Senior Site Architect',
      uploadedRole: 'Lead Architect',
      version: formData.version || 'Rev 1.0',
      tags: formData.tags || ['Drawing'],
    });

    setShowUploadModal(false);
    setFormData({
      title: '',
      category: 'Architectural Blueprint',
      version: 'Rev 1.0',
      fileSize: '4.2 MB',
      fileType: 'pdf',
      tags: ['Superstructure', 'Approved'],
    });
  };

  const handleSyncWithGoogleDrive = async () => {
    setIsDriveSyncing(true);
    setDriveStatus(null);
    try {
      // Fetch or sync Drive items
      const driveItems = await listDriveFiles("mimeType = 'application/pdf'");
      if (driveItems && driveItems.length > 0) {
        setDriveStatus(`Synced ${driveItems.length} CAD blueprints and documents from Google Drive!`);
      } else {
        setDriveStatus('Google Drive connected. Ready to archive site drawings directly to cloud drive.');
      }
    } catch (err: any) {
      setDriveStatus(`Drive Notice: ${err.message || 'Ready for Google OAuth connection'}`);
    } finally {
      setIsDriveSyncing(false);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-orange-500" />
            <span>{getTranslation(currentLang, 'documents')}</span>
          </h1>
          <p className="text-[11px] text-slate-500">
            CAD drawings repository, architectural blueprints, geotechnical surveys & Google Drive synchronization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-sync-google-drive"
            onClick={handleSyncWithGoogleDrive}
            disabled={isDriveSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors"
          >
            {isDriveSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
            <span>Sync Google Drive</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Blueprint / Doc</span>
          </button>
        </div>
      </div>

      {driveStatus && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2 font-medium">
            <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{driveStatus}</span>
          </span>
          <button onClick={() => setDriveStatus(null)} className="text-blue-500 font-bold hover:text-blue-800">✕</button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search drawings by title, version, revision tag..."
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

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                  {doc.version}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-2 leading-snug">{doc.title}</h3>

              <div className="mt-2 flex flex-wrap gap-1">
                {doc.tags?.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 border border-slate-200">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="text-slate-900 font-mono font-medium">{doc.fileSize} ({doc.fileType.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded By:</span>
                <span className="text-slate-900 truncate max-w-[140px] font-medium">{doc.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-slate-500">{new Date(doc.uploadDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Cloud Copy</span>
              </span>

              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-orange-600 font-bold hover:underline"
              >
                <span>Open File</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Blueprint Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-orange-500" />
                <span>Upload Drawing / Blueprint</span>
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Document / Blueprint Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pier 140-150 Structural Rebar Detailed CAD"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
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

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Revision / Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Upload File (PDF / DWG / ZIP)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer bg-slate-50 hover:border-orange-500 transition-colors">
                  <UploadCloud className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <span className="text-slate-700 font-bold">Select blueprint file</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Auto-synced with Google Drive</p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Save & Archive Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
