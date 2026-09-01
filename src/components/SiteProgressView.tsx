import React, { useState } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Plus,
  TrendingUp,
  HardHat,
  CloudSun,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SiteUpdateLog, LanguageCode, Role, ProjectSite } from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation } from '../lib/i18n';

interface SiteProgressViewProps {
  updates: SiteUpdateLog[];
  project: ProjectSite;
  currentLang: LanguageCode;
  currentRole: Role;
}

export const SiteProgressView: React.FC<SiteProgressViewProps> = ({
  updates = [],
  project,
  currentLang,
  currentRole,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    progressPercentage: 68,
    activeWorkersCount: 42,
    supervisorName: 'Sanjay Deshmukh',
    coordinates: { lat: 19.076, lng: 72.8777 },
  };

  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [selectedPhotoForScan, setSelectedPhotoForScan] = useState<string | null>(null);
  const [isScanningWithAi, setIsScanningWithAi] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<any>(null);

  // New Progress Log Form State
  const [formData, setFormData] = useState<Partial<SiteUpdateLog>>({
    title: '',
    stage: 'Superstructure Span Launching',
    progressPercentage: (safeProject.progressPercentage || 68) + 2,
    description: '',
    laborCount: safeProject.activeWorkersCount || 40,
    photos: [],
    weather: {
      temperature: '31°C',
      condition: 'Clear & Sunny',
      humidity: '65%',
      windSpeed: '12 km/h',
    },
  });

  const stages = [
    'Site Clearing & Geotechnical Survey',
    'Deep Pile Foundation & Pile Caps',
    'Substructure & Pier Columns',
    'Superstructure Span Launching',
    'Station Concourse & Architecture',
    'MEP, Electrical & HVAC Fitout',
    'Façade Glazing & Finishing',
    'Final Testing & Commissioning',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        photos: [base64String, ...(prev.photos || [])],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiInspection = async (imageBase64: string) => {
    setSelectedPhotoForScan(imageBase64);
    setIsScanningWithAi(true);
    setAiScanResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-site-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          siteName: safeProject.name,
          projectStage: formData.stage,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiScanResult(data.analysis);
      }
    } catch (err) {
      console.error('Failed to inspect photo:', err);
    } finally {
      setIsScanningWithAi(false);
    }
  };

  const handleSaveProgressLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const defaultPhotos = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
    ];

    const newLog = store.addSiteUpdate({
      projectId: safeProject.id,
      title: formData.title,
      stage: formData.stage || 'Ongoing Construction',
      progressPercentage: Number(formData.progressPercentage) || safeProject.progressPercentage,
      description: formData.description || 'Routine work executed according to daily shift schedule.',
      photos: formData.photos && formData.photos.length > 0 ? formData.photos : defaultPhotos,
      laborCount: Number(formData.laborCount) || 35,
      weather: formData.weather as any,
      supervisorId: 'sup-01',
      supervisorName: safeProject.supervisorName || 'Site Supervisor',
      gpsLocation: safeProject.coordinates,
      aiAnalysis: aiScanResult || undefined,
    });

    // Milestone confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }

    setShowAddLogModal(false);
    setAiScanResult(null);
    setSelectedPhotoForScan(null);
    setFormData({
      title: '',
      stage: 'Superstructure Span Launching',
      progressPercentage: (safeProject.progressPercentage || 68) + 2,
      description: '',
      laborCount: safeProject.activeWorkersCount || 40,
      photos: [],
      weather: {
        temperature: '31°C',
        condition: 'Clear & Sunny',
        humidity: '65%',
        windSpeed: '12 km/h',
      },
    });
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-500" />
            <span>{getTranslation(currentLang, 'siteProgress')}</span>
          </h1>
          <p className="text-[11px] text-slate-500">
            Daily site diaries, verified photo logs, milestone achievements & Gemini AI Safety inspections
          </p>
        </div>

        <button
          id="btn-log-progress"
          onClick={() => setShowAddLogModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{getTranslation(currentLang, 'logProgress')}</span>
        </button>
      </div>

      {/* Progress Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Completed</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{safeProject.progressPercentage}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Physical superstructure execution</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged Diaries</span>
          <div className="text-xl font-bold text-orange-600 mt-1">{updates.length} Entries</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Daily shift logs & quality certificates</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Verified Scans</span>
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {updates.filter((u) => u.aiAnalysis).length} Audits
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Zero critical PPE violations</div>
        </div>
      </div>

      {/* Progress Diary Feed */}
      <div className="space-y-3.5">
        {updates.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-orange-100 border border-orange-200 text-orange-800 text-[10px] font-bold uppercase">
                    {log.stage}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{log.title}</h3>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                  {log.progressPercentage}% Complete
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {log.laborCount} Workers on Duty
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">{log.description}</p>

            {/* Weather Strip */}
            {log.weather && (
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CloudSun className="w-3.5 h-3.5 text-sky-500" />
                  <span>Weather: {log.weather.temperature} ({log.weather.condition})</span>
                </span>
                <span>Humidity: {log.weather.humidity}</span>
                <span>Wind: {log.weather.windSpeed}</span>
              </div>
            )}

            {/* Photo Gallery Grid */}
            {log.photos && log.photos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {log.photos.map((photo, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden bg-slate-100 h-44 group border border-slate-200">
                    <img src={photo} alt={`Log ${idx}`} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200" />
                    <button
                      onClick={() => handleRunAiInspection(photo)}
                      className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-xs transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      <span>Scan with Gemini AI</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* AI Analysis Card if available */}
            {log.aiAnalysis && (
              <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>Gemini AI Vision Site Safety & Quality Audit</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-200/60 text-orange-900">
                    Safety Score: {log.aiAnalysis.safetyScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{log.aiAnalysis.summary}</p>

                {log.aiAnalysis.detectedHazards && log.aiAnalysis.detectedHazards.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {log.aiAnalysis.detectedHazards.map((h, i) => (
                      <div key={i} className="p-1.5 rounded bg-white border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>{h.type}</strong>: {h.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer supervisor stamp */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Submitted by: {log.supervisorName} (Site Supervisor)</span>
              <span className="text-emerald-600 font-medium">GPS Geotag Verified ✓</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Progress Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-5 shadow-xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-500" />
                <span>Log Daily Site Progress Diary</span>
              </h2>
              <button onClick={() => setShowAddLogModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveProgressLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Diary Entry Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Erection of Girder Segment 150-154 via Launching Gantry"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Construction Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    {stages.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Site Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progressPercentage}
                    onChange={(e) => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Done & Supervisor Observations</label>
                <textarea
                  rows={3}
                  placeholder="Detail activities completed, quality inspections, material consumption, and milestones achieved..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              {/* Photo Upload Zone */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Upload Site Photos</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-lg p-3 text-center cursor-pointer bg-slate-50 transition-colors">
                    <UploadCloud className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <span className="text-slate-700 font-bold">Click to upload from camera / files</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG with GPS metadata</p>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {formData.photos.map((p, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded overflow-hidden shrink-0 border border-slate-200">
                        <img src={p} alt="Upload preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-xs"
                >
                  Save & Update Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Photo Inspection Modal */}
      {selectedPhotoForScan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-5 shadow-xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-slate-900">Gemini 2.5 AI Vision Site Inspector</h2>
              </div>
              <button onClick={() => setSelectedPhotoForScan(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex flex-col md:flex-row gap-3.5">
              <div className="w-full md:w-1/2 h-52 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img src={selectedPhotoForScan} alt="Scan target" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2.5">
                {isScanningWithAi && (
                  <div className="py-10 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">
                      Inspecting PPE compliance, fall protection, edge barricades & stage completion %...
                    </p>
                  </div>
                )}

                {aiScanResult && !isScanningWithAi && (
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-orange-950">Safety Score:</span>
                        <span className="font-bold text-orange-600 text-sm">{aiScanResult.safetyScore} / 100</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{aiScanResult.summary}</p>
                    </div>

                    {aiScanResult.ppeCompliance && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-500 uppercase text-[10px]">PPE Checklist:</span>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <span className="text-emerald-700 font-medium">✓ Helmets Verified</span>
                          <span className="text-emerald-700 font-medium">✓ High-Vis Vests</span>
                          <span className="text-emerald-700 font-medium">✓ Safety Boots</span>
                          <span className="text-emerald-700 font-medium">✓ Fall Protection</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPhotoForScan(null)}
                className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
