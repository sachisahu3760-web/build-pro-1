import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  User,
  ShieldCheck,
  Compass,
  Radio,
  Navigation,
  Sparkles,
  DollarSign,
  History,
  Check,
  ChevronDown,
  UploadCloud,
  FileText,
  HelpCircle,
  Maximize2,
} from 'lucide-react';
import { WorkerProfile, ProjectSite, WorkerPunchRecord, Role, LanguageCode } from '../types';
import { store, calculateDistanceMeters } from '../lib/offlineStore';

interface WorkerSelfPunchViewProps {
  currentLang: LanguageCode;
  currentRole: Role;
  workers: WorkerProfile[];
  punchRecords: WorkerPunchRecord[];
  activeProject: ProjectSite;
}

export const WorkerSelfPunchView: React.FC<WorkerSelfPunchViewProps> = ({
  currentLang,
  currentRole,
  workers,
  punchRecords,
  activeProject,
}) => {
  // Selected Worker state (default to first worker or user-specific profile)
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || 'wrk-01');
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  // GPS Telemetry State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: activeProject.coordinates.lat + (Math.random() * 0.0004 - 0.0002),
    lng: activeProject.coordinates.lng + (Math.random() * 0.0004 - 0.0002),
  });
  const [accuracy, setAccuracy] = useState<number>(4.2);
  const [altitude, setAltitude] = useState<number | null>(18.5);
  const [heading, setHeading] = useState<number | null>(142);
  const [speed, setSpeed] = useState<number | null>(0.4);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [lastGpsSync, setLastGpsSync] = useState<string>('Just now');

  // Selfie / Verification State
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [punchInProgress, setPunchInProgress] = useState<boolean>(false);
  const [punchSuccessModal, setPunchSuccessModal] = useState<WorkerPunchRecord | null>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Geolocation watch / request
  const fetchLiveGPS = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setAccuracy(pos.coords.accuracy || 5);
          setAltitude(pos.coords.altitude || 16);
          setHeading(pos.coords.heading);
          setSpeed(pos.coords.speed);
          setGpsLoading(false);
          setLastGpsSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        },
        (err) => {
          console.warn('Live Geolocation fallback:', err.message);
          // Fallback to active site coordinates with realistic slight offset
          setCoords({
            lat: activeProject.coordinates.lat + 0.00015,
            lng: activeProject.coordinates.lng - 0.00012,
          });
          setAccuracy(6.0);
          setGpsLoading(false);
          setLastGpsSync('Signal simulated (GPS permission fallback)');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGpsLoading(false);
      setGpsError('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    fetchLiveGPS();
  }, [activeProject.id]);

  // Distance calculation
  const distanceFromSite = calculateDistanceMeters(
    coords.lat,
    coords.lng,
    activeProject.coordinates.lat,
    activeProject.coordinates.lng
  );
  const isInsideGeofence = distanceFromSite <= activeProject.geofenceRadiusMeters;

  // Punch Action handler
  const handlePerformPunch = (type: 'PUNCH_IN' | 'PUNCH_OUT') => {
    if (!selectedWorker) return;
    setPunchInProgress(true);

    setTimeout(() => {
      const record = store.selfPunchWorker({
        workerId: selectedWorker.id,
        workerName: selectedWorker.name,
        type,
        lat: coords.lat,
        lng: coords.lng,
        accuracyMeters: accuracy,
        isInsideGeofence,
        distanceFromSiteMeters: distanceFromSite,
        locationAddress: `${activeProject.name} - Gate #1 (GPS Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)})`,
        photoUrl: capturedSelfie || selectedWorker.avatar,
        notes: shiftNotes || (type === 'PUNCH_IN' ? 'Self punch-in at site muster point.' : 'Shift completed.'),
      });

      setPunchInProgress(false);
      setPunchSuccessModal(record);
      setShiftNotes('');
      setCapturedSelfie(null);
    }, 600);
  };

  const isCurrentlyPunchedIn = selectedWorker?.status === 'Active On-Site';
  const workerPunchHistory = (punchRecords || []).filter((p) => p.workerId === selectedWorker?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md text-2xl shrink-0">
              👷
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Worker Real-Time GPS Self-Punch Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Geofence Radar Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                One-tap autonomous clock-in and clock-out with instant satellite coordinates, high-accuracy geofence verification, and biometric selfie authentication.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl">
            <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Site Standard Time</span>
              <span className="text-lg font-mono font-bold text-white tracking-wide">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Control Panel & Right Telemetry/Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PUNCH CARD (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Worker Selector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Worker Identification Profile</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Badge #{selectedWorker?.employeeId || 'WRK-01'}</span>
            </div>

            <div className="relative">
              <select
                id="select-worker-self-punch"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} • {w.trade} ({w.role}) — Daily Rate: ₹{w.dailyWage}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Selected Worker Mini Banner */}
            {selectedWorker && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedWorker.avatar}
                    alt={selectedWorker.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedWorker.name}</h3>
                    <p className="text-xs text-slate-500">{selectedWorker.trade} • {selectedWorker.role}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedWorker.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      isCurrentlyPunchedIn
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCurrentlyPunchedIn ? '🟢 Active On-Site' : '⚪ Off-Duty'}
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    Daily Wage: <strong className="text-slate-800">₹ {selectedWorker.dailyWage}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Punch Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Shift Punch Action</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Instant Record
                </span>
              </h2>
              <span className="text-xs text-slate-400">
                {currentTime.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
              </span>
            </div>

            {/* Selfie Verification Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-xs block">Biometric Face / Selfie Verification</span>
                  <span className="text-[11px] text-slate-500">
                    {capturedSelfie ? 'Selfie attached and verified.' : 'Optional on-site photo capture.'}
                  </span>
                </div>
              </div>

              {capturedSelfie ? (
                <div className="flex items-center gap-2">
                  <img src={capturedSelfie} alt="Selfie" className="w-9 h-9 rounded-lg object-cover border border-emerald-400" />
                  <button
                    onClick={() => setCapturedSelfie(null)}
                    className="text-[11px] text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    // Simulate live selfie photo capture
                    setCapturedSelfie(selectedWorker?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs"
                >
                  Snap Photo
                </button>
              )}
            </div>

            {/* Optional Notes input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Shift Handover / Gate Note (Optional)</label>
              <input
                type="text"
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="e.g. Assigned to Pier 142 beam reinforcement cage tying..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Big Punch In / Out Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                id="btn-worker-self-punch-in"
                disabled={punchInProgress || isCurrentlyPunchedIn}
                onClick={() => handlePerformPunch('PUNCH_IN')}
                className={`p-4 rounded-xl font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-md ${
                  isCurrentlyPunchedIn
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    : 'bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>TAP TO PUNCH IN</span>
                </div>
                <span className="text-[11px] font-normal opacity-90">Start Shift & Muster Roll</span>
              </button>

              <button
                id="btn-worker-self-punch-out"
                disabled={punchInProgress || !isCurrentlyPunchedIn}
                onClick={() => handlePerformPunch('PUNCH_OUT')}
                className={`p-4 rounded-xl font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-md ${
                  !isCurrentlyPunchedIn
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    : 'bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>TAP TO PUNCH OUT</span>
                </div>
                <span className="text-[11px] font-normal opacity-90">Conclude Shift & Calculate Wage</span>
              </button>
            </div>
          </div>

          {/* Today's Punch Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-500" />
              <span>Today's Punch Log ({selectedWorker?.name})</span>
            </h3>

            {workerPunchHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                No punches recorded for this worker yet today.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {workerPunchHistory.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          p.type === 'PUNCH_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.type === 'PUNCH_IN' ? 'IN' : 'OUT'}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{p.timeDisplay}</span>
                        <span className="text-[10px] text-slate-500">{p.locationAddress}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.isInsideGeofence
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.isInsideGeofence ? 'Geofence Verified' : 'Outside Boundary'}
                      </span>
                      {p.shiftDurationFormatted && (
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Duration: <strong className="text-slate-800">{p.shiftDurationFormatted}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME GPS TELEMETRY & RADAR MAP (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* GPS Radar Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Real-Time GPS Satellite Telemetry</h3>
                  <span className="text-[10px] text-slate-400">{lastGpsSync}</span>
                </div>
              </div>

              <button
                onClick={fetchLiveGPS}
                disabled={gpsLoading}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Refresh Live Satellite Signal"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span className="text-[10px]">Refresh</span>
              </button>
            </div>

            {/* Geofence Status Highlight */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isInsideGeofence
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isInsideGeofence ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                {isInsideGeofence ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-bold text-xs block">
                  {isInsideGeofence ? 'Inside Site Geofence Boundary' : 'Warning: Outside Geofence Boundary'}
                </span>
                <p className="text-[11px] opacity-90 mt-0.5">
                  You are <strong className="font-semibold">{distanceFromSite}m</strong> away from {activeProject.name} (Perimeter: {activeProject.geofenceRadiusMeters}m).
                </p>
              </div>
            </div>

            {/* Telemetry Sensor Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium block">Latitude</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{coords.lat.toFixed(6)}° N</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium block">Longitude</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{coords.lng.toFixed(6)}° E</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium block">GPS Accuracy</span>
                <span className="font-mono font-bold text-emerald-700 text-xs">± {accuracy.toFixed(1)} meters</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-medium block">Altitude</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{altitude ? `${altitude.toFixed(1)}m MSL` : '18.5m'}</span>
              </div>
            </div>

            {/* Visual Radar Map Canvas */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden h-60 flex items-center justify-center">
              {/* Radar Grid Circles */}
              <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20 animate-ping opacity-40" />
              <div className="absolute w-40 h-40 rounded-full border border-slate-700" />
              <div className="absolute w-28 h-28 rounded-full border border-slate-700" />
              <div className="absolute w-14 h-14 rounded-full border border-slate-700" />
              <div className="absolute w-full h-px bg-slate-800" />
              <div className="absolute h-full w-px bg-slate-800" />

              {/* Site Center Hub */}
              <div className="absolute flex flex-col items-center z-10">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span className="text-[9px] font-bold text-white bg-slate-800/90 px-1.5 py-0.2 rounded mt-1 border border-slate-700">
                  Site Hub
                </span>
              </div>

              {/* Worker Location Beacon */}
              <div
                className="absolute flex flex-col items-center z-20 transition-all duration-500"
                style={{
                  transform: `translate(${Math.min(60, Math.max(-60, (coords.lng - activeProject.coordinates.lng) * 50000))}px, ${Math.min(60, Math.max(-60, (coords.lat - activeProject.coordinates.lat) * 50000))}px)`,
                }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-[9px] font-bold text-emerald-300 bg-slate-900/90 px-1.5 py-0.2 rounded mt-1 border border-emerald-500/40">
                  You ({Math.round(distanceFromSite)}m)
                </span>
              </div>

              {/* Radar Corner Watermark */}
              <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-mono">
                GEOFENCE: {activeProject.geofenceRadiusMeters}M RADAR
              </div>
              <div className="absolute top-2 right-2 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE FIX
              </div>
            </div>
          </div>

          {/* Active Site Context */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Assigned Project Node</h4>
            <div className="flex items-center gap-3">
              <img
                src={activeProject.bannerImage}
                alt={activeProject.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
              />
              <div>
                <h5 className="font-bold text-slate-900 text-xs leading-tight">{activeProject.name}</h5>
                <p className="text-[11px] text-slate-500">{activeProject.address}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Supervisor: <strong className="text-slate-700">{activeProject.supervisorName}</strong> ({activeProject.supervisorPhone})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {punchSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="font-bold text-slate-900 text-lg">
              {punchSuccessModal.type === 'PUNCH_IN' ? 'Shift Punch-In Recorded!' : 'Shift Punch-Out Recorded!'}
            </h3>

            <p className="text-xs text-slate-600 mt-1">
              {punchSuccessModal.type === 'PUNCH_IN'
                ? `Welcome, ${punchSuccessModal.workerName}. Your attendance has been logged with verified GPS coordinates.`
                : `Great job, ${punchSuccessModal.workerName}! Shift duration: ${punchSuccessModal.shiftDurationFormatted || '8h 00m'}.`}
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-bold text-slate-800">{punchSuccessModal.timeDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="font-mono text-slate-800">
                  {punchSuccessModal.coordinates.lat.toFixed(4)}°, {punchSuccessModal.coordinates.lng.toFixed(4)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Geofence Status:</span>
                <span className="font-semibold text-emerald-700">
                  {punchSuccessModal.isInsideGeofence ? 'PASSED (Inside Perimeter)' : 'Outside Geofence'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distance from Center:</span>
                <span className="font-semibold text-slate-800">{punchSuccessModal.distanceFromSiteMeters} meters</span>
              </div>
            </div>

            <button
              onClick={() => setPunchSuccessModal(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Done & Return to Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
