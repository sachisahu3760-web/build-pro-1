import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Users,
  Radio,
  LocateFixed,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  LogIn,
  LogOut,
} from 'lucide-react';
import { ProjectSite, WorkerProfile, LanguageCode, Role } from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation } from '../lib/i18n';

interface LiveLocationViewProps {
  project: ProjectSite;
  workers: WorkerProfile[];
  currentLang: LanguageCode;
  currentRole: Role;
}

export const LiveLocationView: React.FC<LiveLocationViewProps> = ({
  project,
  workers = [],
  currentLang,
  currentRole,
}) => {
  const projectCoords = project?.coordinates || { lat: 19.0596, lng: 72.8875 };
  const projectCode = project?.code || 'METRO-L4';
  const projectAddress = project?.address || 'Site Center Ground';

  const [userGps, setUserGps] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState(project?.geofenceRadiusMeters || 450);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState(false);

  // Request actual browser geolocation if supported
  const handleGetLiveGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }
    setIsLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setUserGps(coords);
        setIsLocating(false);

        // Update active user in workers list
        if (workers.length > 0) {
          store.updateWorker(workers[0].id, {
            liveLocation: {
              lat: coords.lat,
              lng: coords.lng,
              address: `Field GPS Lock (±${Math.round(coords.accuracy || 10)}m)`,
              lastUpdated: 'Just now',
              isInsideGeofence: true,
            },
          });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(err.message || 'Failed to acquire GPS location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Simulate real-time worker movement on the site canvas
  useEffect(() => {
    if (!isSimulatingMovement) return;
    const interval = setInterval(() => {
      workers.forEach((w) => {
        if (w.status === 'Active On-Site') {
          const latShift = (Math.random() - 0.5) * 0.0003;
          const lngShift = (Math.random() - 0.5) * 0.0003;
          store.updateWorker(w.id, {
            liveLocation: {
              ...w.liveLocation,
              lat: w.liveLocation.lat + latShift,
              lng: w.liveLocation.lng + lngShift,
              lastUpdated: '10s ago',
            },
          });
        }
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulatingMovement, workers]);

  // Calculate distance in meters from site center
  function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  const activeWorkers = workers.filter((w) => w.status === 'Active On-Site');
  const insideGeofenceCount = activeWorkers.filter((w) => {
    const dist = getDistanceMeters(projectCoords.lat, projectCoords.lng, w.liveLocation.lat, w.liveLocation.lng);
    return dist <= geofenceRadius;
  }).length;

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-orange-500" />
            <span>{getTranslation(currentLang, 'liveLocation')}</span>
          </h1>
          <p className="text-[11px] text-slate-500">
            Real-time GPS telemetry, geofenced site perimeters & field workforce accountability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-simulate-gps"
            onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all border ${
              isSimulatingMovement
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${isSimulatingMovement ? 'animate-spin text-orange-600' : ''}`} />
            <span>{isSimulatingMovement ? 'Simulation Active' : 'Simulate Movement'}</span>
          </button>

          <button
            id="btn-get-live-gps"
            onClick={handleGetLiveGPS}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            {isLocating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
            <span>Lock Device GPS</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>GPS Notice: {gpsError} (Using simulated high-precision site telemetry).</span>
          </span>
          <button onClick={() => setGpsError(null)} className="text-amber-700 font-bold">✕</button>
        </div>
      )}

      {/* Geofence Status KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Site Center Anchor</span>
          <div className="text-xs font-mono font-bold text-slate-900 mt-1">
            {projectCoords.lat.toFixed(4)}° N, {projectCoords.lng.toFixed(4)}° E
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">{projectAddress}</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Geofence Radius</span>
          <div className="text-xl font-bold text-orange-600 mt-1">{geofenceRadius} meters</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Automatic perimeter breach alert</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Inside Perimeter</span>
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{insideGeofenceCount} / {activeWorkers.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified on-site personnel</div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Perimeter Breaches</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeWorkers.length - insideGeofenceCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Personnel outside boundary</div>
        </div>
      </div>

      {/* Main Map Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* Interactive Site GPS Canvas (2 cols) */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Live Geofenced Site Telemetry Radar</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-100 border border-orange-500" />
                <span>Geofence ({geofenceRadius}m)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>On-Site Crew</span>
              </span>
            </div>
          </div>

          {/* Interactive Radar Visualizer */}
          <div className="relative h-88 w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
            
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

            {/* Geofence Circles */}
            <div
              className="absolute rounded-full border-2 border-dashed border-orange-400/50 bg-orange-500/10"
              style={{ width: '280px', height: '280px' }}
            />
            <div
              className="absolute rounded-full border border-slate-700/60"
              style={{ width: '380px', height: '380px' }}
            />

            {/* Center Anchor (Project Head Office / Tower) */}
            <div className="absolute z-20 flex flex-col items-center">
              <div className="p-1.5 rounded-full bg-orange-500 text-white font-bold shadow-md ring-4 ring-orange-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="mt-1 px-1.5 py-0.2 rounded bg-slate-900/95 border border-orange-500/40 text-[9px] font-bold text-orange-300 whitespace-nowrap">
                Site Hub ({projectCode})
              </span>
            </div>

            {/* Worker GPS Pins */}
            {workers.map((w, idx) => {
              // Calculate relative offset for radar canvas
              const latDiff = (w.liveLocation.lat - projectCoords.lat) * 120000;
              const lngDiff = (w.liveLocation.lng - projectCoords.lng) * 120000;
              const dist = getDistanceMeters(projectCoords.lat, projectCoords.lng, w.liveLocation.lat, w.liveLocation.lng);
              const isInside = dist <= geofenceRadius;
              const isSelected = selectedWorker?.id === w.id;

              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorker(w)}
                  className={`absolute z-30 transition-all duration-500 cursor-pointer flex flex-col items-center group ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                  style={{
                    transform: `translate(${lngDiff}px, ${-latDiff}px)`,
                  }}
                >
                  <div className="relative">
                    <img
                      src={w.avatar}
                      alt={w.name}
                      className={`w-6 h-6 rounded-full object-cover border-2 shadow-xs ${
                        isInside ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-orange-400 ring-2 ring-orange-500/30'
                      }`}
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
                        isInside ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                    />
                  </div>

                  <span className="mt-1 px-1 py-0.2 rounded bg-slate-900/95 border border-slate-700 text-[8px] font-semibold text-slate-200 whitespace-nowrap opacity-80 group-hover:opacity-100 shadow">
                    {w.name.split(' ')[0]} ({dist}m)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Worker / Live Crew Telemetry List (1 col) */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">Field Crew GPS Telemetry Feed</h3>
            <p className="text-[11px] text-slate-500">Click any worker to focus GPS coordinates</p>
          </div>

          {/* Selected Worker Highlight Box */}
          {selectedWorker ? (
            <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selectedWorker.avatar} alt={selectedWorker.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedWorker.name}</h4>
                    <p className="text-[10px] text-orange-700 font-medium">{selectedWorker.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedWorker(null)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="pt-2 border-t border-orange-200/60 space-y-1 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Latitude / Longitude:</span>
                  <span className="font-mono text-slate-900 font-medium">{selectedWorker.liveLocation.lat.toFixed(5)}, {selectedWorker.liveLocation.lng.toFixed(5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance from Center:</span>
                  <span className="font-bold text-orange-600">
                    {getDistanceMeters(projectCoords.lat, projectCoords.lng, selectedWorker.liveLocation.lat, selectedWorker.liveLocation.lng)} meters
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status / Attendance:</span>
                  <span className={`font-bold ${selectedWorker.status === 'Active On-Site' ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {selectedWorker.status} {selectedWorker.checkInTime ? `(${selectedWorker.checkInTime})` : ''}
                  </span>
                </div>
              </div>

              {/* Quick Punch In / Out Button */}
              <div className="pt-2 border-t border-orange-200/60 flex items-center gap-2">
                {selectedWorker.status === 'Active On-Site' ? (
                  <button
                    onClick={() => {
                      store.recordPunchOut(selectedWorker.id, {
                        lat: selectedWorker.liveLocation.lat,
                        lng: selectedWorker.liveLocation.lng,
                        method: 'GPS Telemetry',
                      });
                      setSelectedWorker({ ...selectedWorker, status: 'Off-Duty' });
                    }}
                    className="w-full py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Punch Out at Current GPS</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      store.recordPunchIn(selectedWorker.id, {
                        lat: selectedWorker.liveLocation.lat,
                        lng: selectedWorker.liveLocation.lng,
                        method: 'GPS Telemetry',
                      });
                      setSelectedWorker({ ...selectedWorker, status: 'Active On-Site' });
                    }}
                    className="w-full py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Punch In at Current GPS</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              Select a field worker from the radar or list below to inspect live coordinates.
            </div>
          )}

          {/* Worker Telemetry Scroll list */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {workers.map((w) => {
              const dist = getDistanceMeters(projectCoords.lat, projectCoords.lng, w.liveLocation.lat, w.liveLocation.lng);
              const isInside = dist <= geofenceRadius;

              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorker(w)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    selectedWorker?.id === w.id
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <img src={w.avatar} alt={w.name} className="w-6 h-6 rounded object-cover" />
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate">{w.name}</div>
                      <div className="text-[10px] text-slate-400">{w.trade}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-bold font-mono text-[11px] ${isInside ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {dist}m
                    </div>
                    <div className="text-[9px] text-slate-400">{w.liveLocation.lastUpdated}</div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
