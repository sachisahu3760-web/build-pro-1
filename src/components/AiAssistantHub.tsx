import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  Search,
  MapPin,
  Camera,
  Languages,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { ProjectSite, MaterialItem, WorkerProfile } from '../types';

interface AiAssistantHubProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSite;
  materials: MaterialItem[];
  workers: WorkerProfile[];
}

export const AiAssistantHub: React.FC<AiAssistantHubProps> = ({
  isOpen,
  onClose,
  project,
  materials = [],
  workers = [],
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    location: 'Mumbai, Maharashtra',
    progressPercentage: 68,
  };

  const [activeTab, setActiveTab] = useState<'thinking' | 'search' | 'maps' | 'translate'>('thinking');

  // High Thinking State
  const [scheduleTask, setScheduleTask] = useState('Pouring 350m³ M40 Grade Concrete for Pier 146 Pier Cap under 33°C heat');
  const [thinkingOutput, setThinkingOutput] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Regulatory Search State
  const [safetyQuery, setSafetyQuery] = useState('IS 456 minimum curing duration for OPC concrete in hot weather');
  const [searchOutput, setSearchOutput] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Maps Grounding State
  const [materialQuery, setMaterialQuery] = useState('Ready Mix Concrete (RMC) Batching Plants & Mobile Crane Rentals');
  const [mapsOutput, setMapsOutput] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Multilingual Translator
  const [inputText, setInputText] = useState('All workers must wear safety harnesses and tie off to lifeline on Level 3 scaffold.');
  const [targetLang, setTargetLang] = useState('hi');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  if (!isOpen) return null;

  // Run Gemini 3.1 Pro Thinking Mode
  const handleRunThinkingOptimizer = async () => {
    setIsThinking(true);
    setThinkingOutput(null);
    try {
      const res = await fetch('/api/gemini/high-thinking-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskDescription: scheduleTask,
          constraints: [
            `Current project: ${safeProject.name} (${safeProject.code})`,
            `Physical progress: ${safeProject.progressPercentage}%`,
            `Materials available: ${materials.filter((m) => m.quantity > m.minThreshold).map((m) => m.name).join(', ')}`,
            `Active laborers on site: ${workers.filter((w) => w.status === 'Active On-Site').length}`,
            `Weather constraint: High daytime ambient temperature`,
          ],
          availableResources: {
            materialsCount: materials.length,
            laborCount: workers.length,
          },
        }),
      });
      const data = await res.json();
      setThinkingOutput(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  // Run Search Grounding
  const handleRunSafetySearch = async () => {
    setIsSearching(true);
    setSearchOutput(null);
    try {
      const res = await fetch('/api/gemini/safety-regulatory-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: safetyQuery,
          jurisdiction: 'National Building Code / IS Construction Norms',
        }),
      });
      const data = await res.json();
      setSearchOutput(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Run Maps Grounding
  const handleRunMapsLocator = async () => {
    setIsLocating(true);
    setMapsOutput(null);
    try {
      const res = await fetch('/api/gemini/supplier-equipment-locator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: safeProject.location || 'Mumbai, Maharashtra',
          materialType: materialQuery,
          radius: '30km',
        }),
      });
      const data = await res.json();
      setMapsOutput(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLocating(false);
    }
  };

  // Run Multilingual Translation
  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/gemini/translate-multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLang,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedText(data.translatedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg max-w-3xl w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Gemini Intelligence Hub</h2>
                <span className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 font-mono text-[10px] font-bold border border-orange-200">
                  Thinking + Search + Maps
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Advanced construction engineering reasoning, real-time grounding & multilingual safety translation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('thinking')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'thinking'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>High-Thinking Optimizer (3.1 Pro)</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'search'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Safety Search Grounding</span>
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'maps'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Supplier Locator</span>
          </button>

          <button
            onClick={() => setActiveTab('translate')}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'translate'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Indian Language Voice & Text</span>
          </button>
        </div>

        {/* TAB 1: High Thinking Mode */}
        {activeTab === 'thinking' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                Gemini 3.1 Pro (ThinkingLevel.HIGH)
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Complex Site Schedule & Risk Mitigation Optimizer</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Performs multi-step causal reasoning across concrete batching timelines, crane lifting radiuses, curing windows, and labor crew constraints.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Target Critical Task / Construction Challenge</label>
              <textarea
                rows={2}
                value={scheduleTask}
                onChange={(e) => setScheduleTask(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={handleRunThinkingOptimizer}
              disabled={isThinking}
              className="w-full py-2 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {isThinking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
              <span>{isThinking ? 'Analyzing Multi-Tier Site Constraints...' : 'Generate High-Thinking Plan'}</span>
            </button>

            {thinkingOutput && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-orange-700 font-bold border-b border-slate-200 pb-1.5">
                  <span>Thinking Engine Recommendations:</span>
                  <span className="text-[10px] font-mono text-slate-400">Gemini 3.1 Pro Preview</span>
                </div>

                <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs">
                  {thinkingOutput.plan}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Search Grounding */}
        {activeTab === 'search' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Gemini 2.5 Flash + Google Search Grounding
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Live Regulatory Building Codes & Safety Standards</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Search exact clauses, scaffolding load factors, and concrete curing criteria with direct live web citations.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={safetyQuery}
                onChange={(e) => setSafetyQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900"
              />
              <button
                onClick={handleRunSafetySearch}
                disabled={isSearching}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </div>

            {searchOutput && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs">{searchOutput.answer}</p>
                {searchOutput.sources && searchOutput.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                    {searchOutput.sources.map((s: any, i: number) => (
                      <a
                        key={i}
                        href={s.web?.uri || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <span>{s.web?.title || 'Source ' + (i + 1)}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Maps Grounding */}
        {activeTab === 'maps' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Gemini 2.5 Flash + Google Maps Grounding
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Local Supplier & Heavy Equipment Locator</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Locates verified batching plants, mobile cranes, and TMT steel stockists near the site with live map links.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={materialQuery}
                onChange={(e) => setMaterialQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900"
              />
              <button
                onClick={handleRunMapsLocator}
                disabled={isLocating}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors"
              >
                {isLocating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                <span>Locate</span>
              </button>
            </div>

            {mapsOutput && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs">{mapsOutput.recommendations}</p>
                {mapsOutput.sources && mapsOutput.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                    {mapsOutput.sources.map((s: any, i: number) => (
                      <a
                        key={i}
                        href={s.web?.uri || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{s.web?.title || 'Map Place ' + (i + 1)}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Indian Multilingual Translation */}
        {activeTab === 'translate' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                Gemini 2.5 Multilingual Engine
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Instant Safety Briefing & Worker Voice Translation</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Translates site technical jargon and safety directives into 8 Indian regional languages.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Safety Briefing / Message Text</label>
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900"
              >
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="or">Odia (ଓଡ଼ିଆ)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="en">English</option>
              </select>

              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors"
              >
                {isTranslating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                <span>Translate</span>
              </button>
            </div>

            {translatedText && (
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 space-y-1">
                <span className="text-[10px] font-bold text-orange-700 uppercase">Translated Output:</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">{translatedText}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
