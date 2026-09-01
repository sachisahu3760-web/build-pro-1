import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Award,
  RefreshCw,
  Download,
  LogIn,
  LogOut,
  Radio,
  LocateFixed,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  History,
  Timer,
  Navigation,
  Check,
  Building,
} from 'lucide-react';
import { WorkerProfile, WorkerPunchRecord, LanguageCode, Role, ProjectSite } from '../types';
import { getTranslation } from '../lib/i18n';
import { store, calculateDistanceMeters } from '../lib/offlineStore';
import { fetchGoogleContacts } from '../lib/workspaceService';

interface WorkersViewProps {
  workers: WorkerProfile[];
  project: ProjectSite;
  punchRecords?: WorkerPunchRecord[];
  currentLang: LanguageCode;
  currentRole: Role;
  onOpenAddUserModal?: () => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers = [],
  project,
  punchRecords,
  currentLang,
  currentRole,
  onOpenAddUserModal,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    coordinates: { lat: 19.0596, lng: 72.8875 },
    geofenceRadiusMeters: 450,
  };

  const projCoords = safeProject.coordinates || { lat: 19.0596, lng: 72.8875 };
  const geofenceRadius = safeProject.geofenceRadiusMeters || 450;

  // Tabs: 'roster' | 'terminal' | 'history'
  const [activeTab, setActiveTab] = useState<'roster' | 'terminal' | 'history'>('roster');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active On-Site' | 'Off-Duty'>('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'ALL' | 'PUNCH_IN' | 'PUNCH_OUT'>('ALL');

  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [punchModalWorker, setPunchModalWorker] = useState<WorkerProfile | null>(null);
  const [punchModalType, setPunchModalType] = useState<'PUNCH_IN' | 'PUNCH_OUT'>('PUNCH_IN');

  // Live Location & Geolocation state for punch actions
  const [liveGpsCoords, setLiveGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);
  const [punchNotes, setPunchNotes] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<WorkerPunchRecord['verificationMethod']>('GPS Telemetry');
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  // Import Contacts state
  const [isImportingContacts, setIsImportingContacts] = useState(false);
  const [importedStatus, setImportedStatus] = useState<string | null>(null);

  // Terminal Quick Select state
  const [terminalSelectedWorkerId, setTerminalSelectedWorkerId] = useState<string>(workers[0]?.id || '');

  // New Worker Form
  const [formData, setFormData] = useState<Partial<WorkerProfile>>({
    name: '',
    role: 'Skilled Tradesperson',
    trade: 'Steel Fixer',
    phone: '',
    emergencyContact: '',
    dailyWage: 1200,
    shift: 'Morning (07:00 - 15:30)',
    status: 'Active On-Site',
  });

  const trades = [
    'ALL',
    'Steel Fixer',
    'Mason',
    'Electrician',
    'Carpenter',
    'Welder',
    'Heavy Equipment Operator',
    'Safety Marshal',
    'Site Engineer',
    'General Labor',
  ];

  // All punch records from store state or props
  const allPunchRecords: WorkerPunchRecord[] = punchRecords || store.punchRecords || [];
  const projectPunchRecords = allPunchRecords.filter(
    (p) => !p.projectId || p.projectId === safeProject.id || p.projectName === safeProject.name
  );

  // Acquire real-time browser GPS
  const handleAcquireLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocation not supported by browser. Using site telemetry.');
      return;
    }
    setIsAcquiringGps(true);
    setGpsStatusMessage('Acquiring real-time high precision satellite lock...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setLiveGpsCoords(coords);
        setIsAcquiringGps(false);
        const dist = calculateDistanceMeters(projCoords.lat, projCoords.lng, coords.lat, coords.lng);
        const isInside = dist <= geofenceRadius;
        setGpsStatusMessage(
          `GPS Acquired: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (±${Math.round(coords.accuracy || 5)}m) • ${dist}m from site center (${isInside ? 'Inside Site' : 'Outside Boundary'})`
        );
      },
      (err) => {
        setIsAcquiringGps(false);
        setGpsStatusMessage(`Device GPS Notice: ${err.message}. Using simulated field station GPS.`);
        // Fallback to slight offset around site
        setLiveGpsCoords({
          lat: projCoords.lat + (Math.random() - 0.5) * 0.0012,
          lng: projCoords.lng + (Math.random() - 0.5) * 0.0012,
          accuracy: 12,
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Open Punch In / Punch Out modal for a specific worker
  const openPunchModal = (worker: WorkerProfile, type: 'PUNCH_IN' | 'PUNCH_OUT') => {
    setPunchModalWorker(worker);
    setPunchModalType(type);
    setPunchNotes('');
    setGpsStatusMessage(null);
    // Initialize GPS coordinates based on worker's live location or project coords
    setLiveGpsCoords({
      lat: worker.liveLocation?.lat || projCoords.lat + (Math.random() - 0.5) * 0.001,
      lng: worker.liveLocation?.lng || projCoords.lng + (Math.random() - 0.5) * 0.001,
      accuracy: 8,
    });
  };

  // Execute Punch In / Out from Modal
  const handleConfirmPunch = () => {
    if (!punchModalWorker) return;

    const lat = liveGpsCoords?.lat || projCoords.lat;
    const lng = liveGpsCoords?.lng || projCoords.lng;
    const dist = calculateDistanceMeters(projCoords.lat, projCoords.lng, lat, lng);
    const isInside = dist <= geofenceRadius;

    if (punchModalType === 'PUNCH_IN') {
      store.recordPunchIn(punchModalWorker.id, {
        lat,
        lng,
        accuracyMeters: liveGpsCoords?.accuracy || 8,
        address: `${safeProject.name} - Work Front (${dist}m)`,
        isInsideGeofence: isInside,
        method: verificationMethod,
        notes: punchNotes || undefined,
      });
      setLastActionFeedback(`Punched IN: ${punchModalWorker.name} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } else {
      store.recordPunchOut(punchModalWorker.id, {
        lat,
        lng,
        accuracyMeters: liveGpsCoords?.accuracy || 8,
        address: `${safeProject.name} - Gate Hub (${dist}m)`,
        isInsideGeofence: isInside,
        method: verificationMethod,
        notes: punchNotes || undefined,
      });
      setLastActionFeedback(`Punched OUT: ${punchModalWorker.name} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }

    setPunchModalWorker(null);
    setTimeout(() => setLastActionFeedback(null), 5000);
  };

  // Quick 1-click Punch In/Out from card
  const handleQuickPunchToggle = (worker: WorkerProfile) => {
    const isCurrentlyActive = worker.status === 'Active On-Site';
    const lat = projCoords.lat + (Math.random() - 0.5) * 0.001;
    const lng = projCoords.lng + (Math.random() - 0.5) * 0.001;

    if (isCurrentlyActive) {
      store.recordPunchOut(worker.id, {
        lat,
        lng,
        method: 'Kiosk Quick-Punch',
        notes: 'Quick punch-out from roster view',
      });
      setLastActionFeedback(`Punched OUT: ${worker.name}`);
    } else {
      store.recordPunchIn(worker.id, {
        lat,
        lng,
        method: 'Kiosk Quick-Punch',
        notes: 'Quick punch-in from roster view',
      });
      setLastActionFeedback(`Punched IN: ${worker.name}`);
    }
    setTimeout(() => setLastActionFeedback(null), 4000);
  };

  // Filtered workers list
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone.includes(searchTerm);
    const matchesTrade = selectedTrade === 'ALL' || w.trade === selectedTrade;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Active On-Site' && w.status === 'Active On-Site') ||
      (statusFilter === 'Off-Duty' && w.status !== 'Active On-Site');
    return matchesSearch && matchesTrade && matchesStatus;
  });

  // Filtered punch history
  const filteredHistory = projectPunchRecords.filter((p) => {
    const matchesType = historyTypeFilter === 'ALL' || p.type === historyTypeFilter;
    const matchesSearch =
      p.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.workerTrade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.locationAddress && p.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const activeOnSiteCount = workers.filter((w) => w.status === 'Active On-Site').length;
  const offDutyCount = workers.length - activeOnSiteCount;
  const totalDailyWagePayout = workers.reduce(
    (sum, w) => (w.status === 'Active On-Site' ? sum + w.dailyWage : sum),
    0
  );

  const handleRegisterWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const coords = safeProject.coordinates || { lat: 19.0596, lng: 72.8875 };

    store.addWorker({
      name: formData.name,
      role: formData.role || 'Skilled Tradesperson',
      trade: (formData.trade as any) || 'General Labor',
      assignedProjectId: safeProject.id,
      phone: formData.phone || '+91 98000 00000',
      emergencyContact: formData.emergencyContact || '+91 98000 99999',
      dailyWage: Number(formData.dailyWage) || 1200,
      shift: formData.shift as any,
      status: formData.status as any,
      checkInTime:
        formData.status === 'Active On-Site'
          ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : undefined,
      liveLocation: {
        lat: coords.lat + (Math.random() - 0.5) * 0.0015,
        lng: coords.lng + (Math.random() - 0.5) * 0.0015,
        address: `${safeProject.name} - Work Front`,
        lastUpdated: 'Just now',
        isInsideGeofence: true,
      },
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?auto=format&fit=crop&w=150&q=80`,
      certifications: ['Site Safety Pass Level 1'],
    });

    setShowRegisterModal(false);
    setFormData({
      name: '',
      role: 'Skilled Tradesperson',
      trade: 'Steel Fixer',
      phone: '',
      emergencyContact: '',
      dailyWage: 1200,
      shift: 'Morning (07:00 - 15:30)',
      status: 'Active On-Site',
    });
  };

  const handleImportGoogleContacts = async () => {
    setIsImportingContacts(true);
    setImportedStatus(null);
    try {
      const contacts = await fetchGoogleContacts();
      const coords = safeProject.coordinates || { lat: 19.0596, lng: 72.8875 };
      if (contacts && contacts.length > 0) {
        contacts.slice(0, 3).forEach((c: any) => {
          store.addWorker({
            name: c.name,
            role: c.company || 'Subcontractor Lead',
            trade: 'General Labor',
            assignedProjectId: safeProject.id,
            phone: c.phone || '+91 98111 00000',
            emergencyContact: 'Contractor Dispatch',
            dailyWage: 1500,
            shift: 'Morning (07:00 - 15:30)',
            status: 'Off-Duty',
            liveLocation: {
              lat: coords.lat,
              lng: coords.lng,
              address: 'Off-Site Dispatch Hub',
              lastUpdated: 'Imported',
              isInsideGeofence: false,
            },
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            certifications: ['Verified Contractor'],
          });
        });
        setImportedStatus(`Imported ${Math.min(3, contacts.length)} contacts to crew roster!`);
      } else {
        setImportedStatus('No contact phone numbers found in Google account.');
      }
    } catch (err: any) {
      setImportedStatus(`Import Notice: ${err.message || 'Please sign in with Google'}`);
    } finally {
      setIsImportingContacts(false);
    }
  };

  const exportPunchHistoryCSV = () => {
    const headers = [
      'Record ID',
      'Worker Name',
      'Trade',
      'Punch Type',
      'Timestamp',
      'Time Display',
      'Date Display',
      'Latitude',
      'Longitude',
      'Distance (Meters)',
      'Geofence Compliant',
      'Verification Method',
      'Shift Duration',
      'Notes',
    ];

    const rows = projectPunchRecords.map((r) => [
      r.id,
      `"${r.workerName}"`,
      `"${r.workerTrade}"`,
      r.type,
      `"${r.timestamp}"`,
      `"${r.timeDisplay}"`,
      `"${r.dateDisplay}"`,
      r.coordinates.lat,
      r.coordinates.lng,
      r.distanceFromSiteMeters,
      r.isInsideGeofence ? 'YES' : 'NO',
      `"${r.verificationMethod}"`,
      `"${r.shiftDurationFormatted || 'N/A'}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buildpulse_punch_attendance_${safeProject.code || 'site'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedTerminalWorker = workers.find((w) => w.id === terminalSelectedWorkerId) || workers[0];

  return (
    <div className="space-y-4 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <span>{getTranslation(currentLang, 'workers')} & Live Punch Attendance</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            GPS geofence verified shift punch in/out, telemetry tracking & digital labor ledger
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAddUserModal && (
            <button
              id="btn-provision-system-user"
              onClick={onOpenAddUserModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold shadow-2xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-600" />
              <span>+ Provision System User</span>
            </button>
          )}

          <button
            id="btn-import-contacts"
            onClick={handleImportGoogleContacts}
            disabled={isImportingContacts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            {isImportingContacts ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Import Google Contacts</span>
          </button>

          <button
            id="btn-register-worker"
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{getTranslation(currentLang, 'addWorker')}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {lastActionFeedback && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastActionFeedback}</span>
          </div>
          <button onClick={() => setLastActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 text-sm">✕</button>
        </div>
      )}

      {importedStatus && (
        <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between font-medium">
          <span>{importedStatus}</span>
          <button onClick={() => setImportedStatus(null)} className="text-blue-600 font-bold">✕</button>
        </div>
      )}

      {/* Workforce & Attendance KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Registered Crew</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{workers.length} Personnel</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to {safeProject.name}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active On-Site (Punched In)</span>
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{activeOnSiteCount} Workers</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Inside {geofenceRadius}m geofence perimeter</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Off-Duty / En Route</span>
          <div className="text-xl font-bold text-slate-700 mt-1">{offDutyCount} Workers</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for next shift punch-in</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today's Wage Accrual</span>
          <div className="text-xl font-bold text-orange-600 mt-1">
            ₹{totalDailyWagePayout.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Direct verified field labor payout</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            id="tab-crew-roster"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Crew Roster & Punch Actions ({workers.length})</span>
          </button>

          <button
            id="tab-punch-terminal"
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-500" />
            <span>Live Punch Terminal & GPS Geofence</span>
          </button>

          <button
            id="tab-punch-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4 text-blue-500" />
            <span>Attendance & Punch Audit Log ({projectPunchRecords.length})</span>
          </button>
        </div>

        {activeTab === 'history' && (
          <button
            onClick={exportPunchHistoryCSV}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded mb-1 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* ================= TAB 1: CREW ROSTER & PUNCH ACTIONS ================= */}
      {activeTab === 'roster' && (
        <div className="space-y-3">
          {/* Filters Bar */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by worker name, role, trade, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                {(['ALL', 'Active On-Site', 'Off-Duty'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'Active On-Site' ? '🟢 Active On-Site' : st === 'Off-Duty' ? '⚪ Off-Duty' : 'All Status'}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {trades.map((tr) => (
                <button
                  key={tr}
                  onClick={() => setSelectedTrade(tr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedTrade === tr
                      ? 'bg-orange-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>

          {/* Workers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredWorkers.map((worker) => {
              const isActive = worker.status === 'Active On-Site';
              const lat = worker.liveLocation?.lat || projCoords.lat;
              const lng = worker.liveLocation?.lng || projCoords.lng;
              const distFromCenter = calculateDistanceMeters(projCoords.lat, projCoords.lng, lat, lng);
              const isInsideGeofence = distFromCenter <= geofenceRadius;

              return (
                <div
                  key={worker.id}
                  className={`p-4 rounded-xl bg-white border transition-all shadow-xs space-y-3 ${
                    isActive ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className={`w-11 h-11 rounded-xl object-cover border-2 shadow-xs ${
                          isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                        }`}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-bold text-slate-900 truncate">{worker.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {worker.status}
                        </span>
                      </div>
                      <div className="text-xs text-orange-600 font-bold truncate mt-0.5">{worker.role}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {worker.trade} • {worker.shift.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Attendance & Live Location Details */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>Shift Attendance:</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-[11px]">
                        {isActive ? `In: ${worker.checkInTime || 'Active'}` : worker.checkOutTime ? `Out: ${worker.checkOutTime}` : 'Off Duty'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>Live Geolocation:</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          isInsideGeofence ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        <span>{distFromCenter}m from site</span>
                        <span>({isInsideGeofence ? 'Inside' : 'Outside'})</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                      <span className="text-slate-500 text-[11px]">Daily Shift Wage:</span>
                      <span className="font-mono font-bold text-emerald-700 text-[11px]">
                        ₹{worker.dailyWage} / shift
                      </span>
                    </div>
                  </div>

                  {/* Certifications */}
                  {worker.certifications && worker.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {worker.certifications.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 flex items-center gap-1 font-medium"
                        >
                          <Award className="w-2.5 h-2.5 text-orange-500" />
                          <span>{c}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons: Phone & Punch In/Out */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={`tel:${worker.phone}`}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Call Worker"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                    </a>

                    {/* Verified Punch Modal Trigger */}
                    <button
                      onClick={() => openPunchModal(worker, isActive ? 'PUNCH_OUT' : 'PUNCH_IN')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Open GPS Verified Punch Form"
                    >
                      <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verify GPS</span>
                    </button>

                    {/* Direct Punch In/Out Toggle Button */}
                    {isActive ? (
                      <button
                        onClick={() => handleQuickPunchToggle(worker)}
                        className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Punch Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickPunchToggle(worker)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Punch In</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: LIVE PUNCH TERMINAL & GPS GEOFENCE ================= */}
      {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Interactive Punch Terminal Kiosk (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Site Attendance Punch Terminal</h2>
                    <p className="text-[11px] text-slate-500">
                      Digital kiosk for high-precision GPS geofenced shift check-in and check-out
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Terminal Online</span>
                </span>
              </div>

              {/* Select Field Worker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Field Crew Member *
                </label>
                <select
                  value={terminalSelectedWorkerId}
                  onChange={(e) => setTerminalSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.trade} ({w.status === 'Active On-Site' ? '🟢 Punched IN' : '⚪ Off-Duty'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Worker Profile Snapshot */}
              {selectedTerminalWorker && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedTerminalWorker.avatar}
                      alt={selectedTerminalWorker.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{selectedTerminalWorker.name}</h4>
                      <p className="text-[11px] text-orange-600 font-semibold">{selectedTerminalWorker.role}</p>
                      <p className="text-[10px] text-slate-500">
                        {selectedTerminalWorker.trade} • Shift: {selectedTerminalWorker.shift}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        selectedTerminalWorker.status === 'Active On-Site'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {selectedTerminalWorker.status}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {selectedTerminalWorker.checkInTime ? `Checked in: ${selectedTerminalWorker.checkInTime}` : 'Not checked in'}
                    </div>
                  </div>
                </div>
              )}

              {/* Live Location Telemetry Box */}
              <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-orange-600" />
                    <span>Real-Time GPS Telemetry</span>
                  </span>

                  <button
                    onClick={handleAcquireLiveGps}
                    disabled={isAcquiringGps}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold transition-colors"
                  >
                    {isAcquiringGps ? <RefreshCw className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                    <span>{isAcquiringGps ? 'Locking Satellite...' : 'Get Device GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Latitude / Longitude</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {liveGpsCoords ? `${liveGpsCoords.lat.toFixed(5)}, ${liveGpsCoords.lng.toFixed(5)}` : `${projCoords.lat.toFixed(5)}, ${projCoords.lng.toFixed(5)}`}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Distance from Center</span>
                    <span className="font-mono font-bold text-orange-600 text-[11px]">
                      {calculateDistanceMeters(
                        projCoords.lat,
                        projCoords.lng,
                        liveGpsCoords?.lat || projCoords.lat,
                        liveGpsCoords?.lng || projCoords.lng
                      )} meters
                    </span>
                  </div>

                  <div className="p-2 rounded bg-white border border-orange-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Geofence Compliance</span>
                    <span
                      className={`text-[11px] font-bold ${
                        calculateDistanceMeters(
                          projCoords.lat,
                          projCoords.lng,
                          liveGpsCoords?.lat || projCoords.lat,
                          liveGpsCoords?.lng || projCoords.lng
                        ) <= geofenceRadius
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {calculateDistanceMeters(
                        projCoords.lat,
                        projCoords.lng,
                        liveGpsCoords?.lat || projCoords.lat,
                        liveGpsCoords?.lng || projCoords.lng
                      ) <= geofenceRadius
                        ? '🟢 Inside Geofence'
                        : '⚠️ Outside Perimeter'}
                    </span>
                  </div>
                </div>

                {gpsStatusMessage && (
                  <p className="text-[11px] text-orange-800 font-medium bg-orange-100/70 p-2 rounded border border-orange-200">
                    {gpsStatusMessage}
                  </p>
                )}
              </div>

              {/* Verification Method & Shift Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Verification Method</label>
                  <select
                    value={verificationMethod}
                    onChange={(e) => setVerificationMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="GPS Telemetry">GPS Telemetry (Automated)</option>
                    <option value="Browser Geolocation">Browser Geolocation (Device)</option>
                    <option value="Kiosk Quick-Punch">Kiosk Quick-Punch</option>
                    <option value="Supervisor Manual">Supervisor Manual Authorization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Shift Notes / Station</label>
                  <input
                    type="text"
                    placeholder="e.g. Pier 142 concrete pour station"
                    value={punchNotes}
                    onChange={(e) => setPunchNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                  </input>
                </div>
              </div>

              {/* Terminal Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    if (selectedTerminalWorker) {
                      store.recordPunchIn(selectedTerminalWorker.id, {
                        lat: liveGpsCoords?.lat || projCoords.lat,
                        lng: liveGpsCoords?.lng || projCoords.lng,
                        method: verificationMethod,
                        notes: punchNotes || undefined,
                      });
                      setLastActionFeedback(`Punched IN: ${selectedTerminalWorker.name}`);
                      setTimeout(() => setLastActionFeedback(null), 4000);
                    }
                  }}
                  disabled={!selectedTerminalWorker || selectedTerminalWorker.status === 'Active On-Site'}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                    selectedTerminalWorker?.status === 'Active On-Site'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Punch IN Shift (Check In)</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedTerminalWorker) {
                      store.recordPunchOut(selectedTerminalWorker.id, {
                        lat: liveGpsCoords?.lat || projCoords.lat,
                        lng: liveGpsCoords?.lng || projCoords.lng,
                        method: verificationMethod,
                        notes: punchNotes || undefined,
                      });
                      setLastActionFeedback(`Punched OUT: ${selectedTerminalWorker.name}`);
                      setTimeout(() => setLastActionFeedback(null), 4000);
                    }
                  }}
                  disabled={!selectedTerminalWorker || selectedTerminalWorker.status !== 'Active On-Site'}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                    selectedTerminalWorker?.status !== 'Active On-Site'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Punch OUT Shift (Check Out)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Geofence Radar / Station Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-orange-500" />
                <span>Geofence Boundary Parameters</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Project Site:</span>
                  <span className="font-bold text-slate-900">{safeProject.name}</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Center Coordinates:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {projCoords.lat.toFixed(5)}, {projCoords.lng.toFixed(5)}
                  </span>
                </div>

                <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Allowed Perimeter:</span>
                  <span className="font-bold text-emerald-700">{geofenceRadius} meters radius</span>
                </div>
              </div>

              {/* Quick Status Roll Call */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Live Crew Roll Call</h4>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {workers.map((w) => {
                    const isActive = w.status === 'Active On-Site';
                    return (
                      <div
                        key={w.id}
                        onClick={() => setTerminalSelectedWorkerId(w.id)}
                        className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          terminalSelectedWorkerId === w.id
                            ? 'bg-orange-50 border-orange-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={w.avatar} alt={w.name} className="w-6 h-6 rounded-md object-cover" />
                          <div>
                            <div className="font-bold text-slate-900">{w.name}</div>
                            <div className="text-[10px] text-slate-400">{w.trade}</div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isActive ? 'IN' : 'OUT'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ATTENDANCE & PUNCH AUDIT LOG ================= */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {/* History Controls */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter punch logs by worker, trade, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-1">
                {(['ALL', 'PUNCH_IN', 'PUNCH_OUT'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHistoryTypeFilter(t)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      historyTypeFilter === t
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'PUNCH_IN' ? '🟢 Punch IN' : t === 'PUNCH_OUT' ? '🟠 Punch OUT' : 'All Events'}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredHistory.length} verified audit records
            </span>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Worker Profile</th>
                    <th className="py-3 px-4">Timestamp & Date</th>
                    <th className="py-3 px-4">GPS Coordinates</th>
                    <th className="py-3 px-4">Distance & Geofence</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Duration / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((record) => {
                      const isPunchIn = record.type === 'PUNCH_IN';

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Type */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isPunchIn
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {isPunchIn ? <LogIn className="w-3 h-3 text-emerald-600" /> : <LogOut className="w-3 h-3 text-amber-600" />}
                              <span>{isPunchIn ? 'PUNCH IN' : 'PUNCH OUT'}</span>
                            </span>
                          </td>

                          {/* Worker */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={record.workerAvatar}
                                alt={record.workerName}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{record.workerName}</div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {record.workerTrade}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-slate-900">{record.timeDisplay}</div>
                            <div className="text-[10px] text-slate-400">{record.dateDisplay}</div>
                          </td>

                          {/* Coordinates */}
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-700">
                            {record.coordinates?.lat?.toFixed(5)}, {record.coordinates?.lng?.toFixed(5)}
                          </td>

                          {/* Distance & Geofence */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  record.isInsideGeofence ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              <span className="font-bold text-slate-800">
                                {record.distanceFromSiteMeters}m
                              </span>
                              <span
                                className={`text-[10px] font-semibold ${
                                  record.isInsideGeofence ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                ({record.isInsideGeofence ? 'Inside Site' : 'Perimeter Alert'})
                              </span>
                            </div>
                          </td>

                          {/* Verification Method */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-700">
                              {record.verificationMethod}
                            </span>
                          </td>

                          {/* Shift Duration / Notes */}
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {record.shiftDurationFormatted && (
                              <span className="font-bold text-slate-900 block text-[11px]">
                                Duration: {record.shiftDurationFormatted}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500">{record.notes || 'Verified standard shift'}</span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No punch audit records match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= PUNCH IN / PUNCH OUT VERIFICATION MODAL ================= */}
      {punchModalWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl text-white ${
                    punchModalType === 'PUNCH_IN' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                >
                  {punchModalType === 'PUNCH_IN' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {punchModalType === 'PUNCH_IN' ? 'Shift Punch-In Verification' : 'Shift Punch-Out Verification'}
                  </h2>
                  <p className="text-[11px] text-slate-500">Confirm field crew GPS telemetry</p>
                </div>
              </div>
              <button onClick={() => setPunchModalWorker(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {/* Worker Card Summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <img
                src={punchModalWorker.avatar}
                alt={punchModalWorker.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{punchModalWorker.name}</h4>
                <p className="text-[11px] text-orange-600 font-bold">{punchModalWorker.role}</p>
                <p className="text-[10px] text-slate-500">{punchModalWorker.trade} • ₹{punchModalWorker.dailyWage}/shift</p>
              </div>
            </div>

            {/* Live GPS Telemetry acquisition block */}
            <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>GPS Geolocation Telemetry</span>
                </span>

                <button
                  type="button"
                  onClick={handleAcquireLiveGps}
                  disabled={isAcquiringGps}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold transition-colors"
                >
                  {isAcquiringGps ? <RefreshCw className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                  <span>{isAcquiringGps ? 'Locating...' : 'Refresh GPS'}</span>
                </button>
              </div>

              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lock Coordinates:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {liveGpsCoords?.lat.toFixed(5)}, {liveGpsCoords?.lng.toFixed(5)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Site Center Distance:</span>
                  <span className="font-bold text-orange-700">
                    {calculateDistanceMeters(
                      projCoords.lat,
                      projCoords.lng,
                      liveGpsCoords?.lat || projCoords.lat,
                      liveGpsCoords?.lng || projCoords.lng
                    )} meters
                  </span>
                </div>

                <div className="flex justify-between pt-1 border-t border-orange-200">
                  <span className="text-slate-500">Geofence Compliance:</span>
                  <span
                    className={`font-bold ${
                      calculateDistanceMeters(
                        projCoords.lat,
                        projCoords.lng,
                        liveGpsCoords?.lat || projCoords.lat,
                        liveGpsCoords?.lng || projCoords.lng
                      ) <= geofenceRadius
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {calculateDistanceMeters(
                      projCoords.lat,
                      projCoords.lng,
                      liveGpsCoords?.lat || projCoords.lat,
                      liveGpsCoords?.lng || projCoords.lng
                    ) <= geofenceRadius
                      ? '🟢 Inside Geofenced Site'
                      : '⚠️ Outside Geofence Perimeter'}
                  </span>
                </div>
              </div>

              {gpsStatusMessage && (
                <p className="text-[10px] text-orange-800 bg-orange-100 p-1.5 rounded font-medium">
                  {gpsStatusMessage}
                </p>
              )}
            </div>

            {/* Verification Method */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Authorization Method</label>
                <select
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  <option value="GPS Telemetry">GPS Telemetry (Automated Satellite)</option>
                  <option value="Browser Geolocation">Browser Geolocation (Field Device)</option>
                  <option value="Supervisor Manual">Supervisor Manual Check</option>
                  <option value="Kiosk Quick-Punch">Kiosk Quick-Punch</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Shift Work / Handover Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Completed Pier 142 reinforcement cage tie-off"
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPunchModalWorker(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmPunch}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                  punchModalType === 'PUNCH_IN'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{punchModalType === 'PUNCH_IN' ? 'Confirm Shift Punch-In' : 'Confirm Shift Punch-Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REGISTER WORKER MODAL ================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-3.5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-500" />
                <span>Register Worker / Field Crew</span>
              </h2>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRegisterWorker} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Worker Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Steel Fixer Foreman"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Building Trade</label>
                  <select
                    value={formData.trade}
                    onChange={(e) => setFormData({ ...formData, trade: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    {trades.filter((t) => t !== 'ALL').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Daily Wage (₹)</label>
                  <input
                    type="number"
                    value={formData.dailyWage}
                    onChange={(e) => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
                    <option value="Evening (15:30 - 23:30)">Evening (15:30 - 23:30)</option>
                    <option value="Night (23:30 - 07:00)">Night (23:30 - 07:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Active On-Site">Active On-Site (Punch In)</option>
                    <option value="Off-Duty">Off-Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
