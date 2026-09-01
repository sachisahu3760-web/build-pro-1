import React, { useState, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Radio,
  Sparkles,
  Globe2,
  Mail,
  Mic,
  RefreshCw,
  PhoneCall,
  Users,
  CheckCheck,
  Languages,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileCode,
  FileSpreadsheet,
  X,
  Download,
  Eye,
  Maximize2,
  UploadCloud,
  Layers,
  ShieldAlert,
  HardHat,
  Share2,
  Check,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { ChatMessage, ChatAttachment, LanguageCode, Role, ProjectSite } from '../types';
import { store } from '../lib/offlineStore';
import { getTranslation } from '../lib/i18n';
import { sendGmailBroadcast } from '../lib/workspaceService';

interface TeamChatViewProps {
  messages: ChatMessage[];
  project: ProjectSite;
  currentLang: LanguageCode;
  currentRole: Role;
}

// Preset site assets for quick one-click field attachments
const SAMPLE_SITE_ASSETS: Array<{
  name: string;
  type: 'image' | 'pdf' | 'dwg' | 'doc';
  size: string;
  url: string;
  category: string;
}> = [
  {
    name: 'Pier_146_SlumpCone_Test_Photo.jpg',
    type: 'image',
    size: '3.2 MB',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
    category: 'Quality Testing',
  },
  {
    name: 'M45_RMC_Batching_Test_Certificate.pdf',
    type: 'pdf',
    size: '1.2 MB',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    category: 'Material Challan',
  },
  {
    name: 'PierCap_Reinforcement_DWG_Rev4.dwg',
    type: 'dwg',
    size: '4.8 MB',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    category: 'Structural Drawings',
  },
  {
    name: 'HSE_Scaffolding_Safety_Inspection.jpg',
    type: 'image',
    size: '2.5 MB',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    category: 'HSE Safety',
  },
  {
    name: 'Metro_Girders_PrePour_Checklist.pdf',
    type: 'pdf',
    size: '950 KB',
    url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
    category: 'QA/QC Inspection',
  },
];

export const TeamChatView: React.FC<TeamChatViewProps> = ({
  messages = [],
  project,
  currentLang,
  currentRole,
}) => {
  const safeProject = project || {
    id: 'proj-01',
    name: 'Metro Corridor Line 4',
    code: 'METRO-L4',
    progressPercentage: 68,
  };

  const [selectedChannel, setSelectedChannel] = useState<string>('General Site Operations');
  const [inputText, setInputText] = useState('');
  const [targetTranslationLang, setTargetTranslationLang] = useState<string>('hi');
  const [isTranslatingId, setIsTranslatingId] = useState<string | null>(null);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Attachments State
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [showAssetDrawer, setShowAssetDrawer] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<ChatAttachment | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('Critical Shift Briefing & Inspection Notice');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState('ALL_CHANNELS');
  const [broadcastWithGmail, setBroadcastWithGmail] = useState(true);
  const [broadcastWithRadio, setBroadcastWithRadio] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Walkie-Talkie Radio State
  const [isRadioTransmitting, setIsRadioTransmitting] = useState(false);
  const [radioFrequency, setRadioFrequency] = useState('CH-04 • 462.5625 MHz (Site Main)');
  const [radioVolume, setRadioVolume] = useState(85);

  const channels = [
    { name: 'General Site Operations', icon: '📢', unread: 0 },
    { name: 'Safety & HSE Alerts', icon: '⚠️', unread: 2 },
    { name: 'RMC Concrete & Materials', icon: '🚛', unread: 0 },
    { name: 'Structural Engineering', icon: '📐', unread: 1 },
    { name: 'Electrical & MEP', icon: '⚡', unread: 0 },
  ];

  const handlePushToTalk = () => {
    setIsRadioTransmitting(true);
    // Simulate radio sound chime and auto-message
    setTimeout(() => {
      setIsRadioTransmitting(false);

      const attachedPayload = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;

      store.addChatMessage({
        projectId: safeProject.id,
        channel: selectedChannel,
        senderId: 'user-radio',
        senderName: currentRole === 'worker' ? 'Labor Crew Radio' : 'Site Supervisor Radio',
        senderRole: currentRole,
        text: `[📻 RADIO DISPATCH @ ${radioFrequency.split('•')[0].trim()}]: 10-4, crew active on ${safeProject.name}. All clear. ${
          attachedPayload ? `(Attached: ${attachedPayload.map((a) => a.name).join(', ')})` : ''
        }`,
        language: currentLang,
        avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150',
        attachments: attachedPayload,
      });

      if (attachedPayload) {
        setPendingAttachments([]);
      }
    }, 2500);
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.channel === selectedChannel ||
      (!m.channel && selectedChannel === 'General Site Operations') ||
      (m.channel === 'safety-emergency' && selectedChannel === 'Safety & HSE Alerts') ||
      (m.channel === 'materials-logistics' && selectedChannel === 'RMC Concrete & Materials')
  );

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (files: File[]) => {
    const newAttachments: ChatAttachment[] = [];

    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isDwg = file.name.endsWith('.dwg') || file.name.endsWith('.dxf');
      const isDoc =
        file.type.includes('word') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.txt');

      let fileType: ChatAttachment['type'] = 'other';
      if (isImage) fileType = 'image';
      else if (isPdf) fileType = 'pdf';
      else if (isDwg) fileType = 'dwg';
      else if (isDoc) fileType = 'doc';

      // Read image as base64 for instant preview or use object URL
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const url = (uploadEvent.target?.result as string) || URL.createObjectURL(file);
          setPendingAttachments((prev) => [
            ...prev,
            {
              id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              name: file.name,
              type: 'image',
              size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              url,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        const url = URL.createObjectURL(file);
        newAttachments.push({
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          type: fileType,
          size:
            file.size > 1024 * 1024
              ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
              : Math.round(file.size / 1024) + ' KB',
          url,
        });
      }
    });

    if (newAttachments.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleAddSampleAsset = (asset: typeof SAMPLE_SITE_ASSETS[0]) => {
    const newAtt: ChatAttachment = {
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: asset.name,
      type: asset.type,
      size: asset.size,
      url: asset.url,
    };
    setPendingAttachments((prev) => [...prev, newAtt]);
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    store.addChatMessage({
      projectId: safeProject.id,
      channel: selectedChannel,
      senderId: 'user-me',
      senderName: currentRole === 'master_admin' ? 'Chief Project Director' : 'Field Supervisor',
      senderRole: currentRole,
      text: inputText.trim() || (pendingAttachments.length > 0 ? `Shared ${pendingAttachments.length} site attachment(s)` : ''),
      language: currentLang,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
    });

    setInputText('');
    setPendingAttachments([]);
  };

  const handleTranslateMessage = async (msgId: string, text: string) => {
    setIsTranslatingId(msgId);
    try {
      const res = await fetch('/api/gemini/translate-multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: targetTranslationLang,
        }),
      });
      const data = await res.json();
      if (data.success && data.translatedText) {
        setTranslatedMessages((prev) => ({ ...prev, [msgId]: data.translatedText }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslatingId(null);
    }
  };

  const handleExecuteBroadcast = async () => {
    if (!broadcastMessage.trim() && pendingAttachments.length === 0) {
      alert('Please enter a broadcast message or attach a site photo/document.');
      return;
    }

    setIsBroadcasting(true);
    try {
      const targetChannels =
        broadcastChannel === 'ALL_CHANNELS'
          ? channels.map((c) => c.name)
          : [broadcastChannel];

      const attachmentNames = pendingAttachments.map((a) => a.name).join(', ');

      // Broadcast to selected chat channels
      targetChannels.forEach((chan) => {
        store.addChatMessage({
          projectId: safeProject.id,
          channel: chan,
          senderId: 'broadcast-system',
          senderName: `📢 SITE BROADCAST (${currentRole.toUpperCase()})`,
          senderRole: currentRole,
          text: `[🚨 PRIORITY BROADCAST - ${broadcastTitle}]:\n${broadcastMessage}${
            attachmentNames ? `\n\n📎 Attached Files: ${attachmentNames}` : ''
          }`,
          language: currentLang,
          avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150',
          attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
        });
      });

      // Send Gmail Broadcast if toggled
      if (broadcastWithGmail) {
        try {
          await sendGmailBroadcast(
            'site-stakeholders@buildpulse.org',
            `[BROADCAST] ${safeProject.name}: ${broadcastTitle}`,
            `Urgent Site Broadcast Notification:\n\nProject: ${safeProject.name}\nTitle: ${broadcastTitle}\nMessage: ${broadcastMessage}\nAttachments: ${
              attachmentNames || 'None'
            }\n\nBroadcast sent via BuildPulse Command Engine.`
          );
        } catch (emailErr) {
          console.warn('Gmail broadcast fallback:', emailErr);
        }
      }

      store.addNotification({
        title: `Site Broadcast: ${broadcastTitle}`,
        message: `Dispatched to ${targetChannels.length} radio channels with ${pendingAttachments.length} attached media files.`,
        type: 'alert',
        category: 'chat',
      });

      setEmailStatus(`Broadcast successfully sent with ${pendingAttachments.length} attached photo/documents!`);
      setShowBroadcastModal(false);
      setBroadcastMessage('');
      setPendingAttachments([]);
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleBroadcastGmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const attNames = pendingAttachments.map((a) => a.name).join(', ');
      await sendGmailBroadcast(
        'site-stakeholders@buildpulse.org',
        `Site Update: ${safeProject.name} Shift Briefing`,
        `Urgent notification for ${safeProject.name}:\n\nCurrent Progress: ${
          safeProject.progressPercentage
        }%\nChannel: ${selectedChannel}\n${
          attNames ? `Attached Documents/Photos: ${attNames}\n` : ''
        }\nBroadcast sent via BuildPulse Pro Command Engine.`
      );
      setEmailStatus('Broadcast sent to stakeholders via Google Workspace Gmail API!');
    } catch (err: any) {
      setEmailStatus(`Gmail Notification: ${err.message || 'Ready for Google OAuth connection'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getAttachmentIcon = (type: ChatAttachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'dwg':
        return <FileCode className="w-4 h-4 text-purple-500" />;
      case 'doc':
        return <FileSpreadsheet className="w-4 h-4 text-blue-500" />;
      default:
        return <Paperclip className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Hidden File Input for uploading images and documents */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.dwg,.dxf,.txt,.xls,.xlsx"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-orange-500" />
            <span>{getTranslation(currentLang, 'teamChat')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant site walkie-talkie messaging, photo & CAD document broadcast, Gemini multilingual translation & Gmail dispatch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Photo / Document Broadcast Trigger Button */}
          <button
            id="btn-broadcast-photo-doc"
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm shadow-orange-600/20"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Broadcast Photo / Doc</span>
          </button>

          <button
            id="btn-broadcast-gmail"
            onClick={handleBroadcastGmail}
            disabled={isSendingEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors"
          >
            {isSendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
            <span>Email Broadcast (Gmail)</span>
          </button>
        </div>
      </div>

      {emailStatus && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>{emailStatus}</span>
          </div>
          <button onClick={() => setEmailStatus(null)} className="text-blue-500 font-bold hover:text-blue-800">✕</button>
        </div>
      )}

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 h-[620px]">
        {/* Left Channel Sidebar */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1.5">
            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Site Radio Channels
            </div>

            {channels.map((ch) => (
              <button
                key={ch.name}
                onClick={() => setSelectedChannel(ch.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedChannel === ch.name
                    ? 'bg-orange-50 text-orange-900 border border-orange-200 font-extrabold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{ch.icon}</span>
                  <span className="truncate">{ch.name}</span>
                </div>
                {ch.unread > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Walkie-Talkie Radio Dispatch Controls */}
          <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                <span>Site Walkie-Talkie</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="bg-black/50 p-2 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 flex items-center justify-between">
              <span className="truncate">{radioFrequency.split('•')[0]}</span>
              <span className="text-slate-400">VOL: {radioVolume}%</span>
            </div>

            {pendingAttachments.length > 0 && (
              <div className="text-[10px] text-amber-300 font-medium truncate flex items-center gap-1 bg-amber-950/60 p-1.5 rounded border border-amber-800/60">
                <Paperclip className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Attaching {pendingAttachments.length} media file(s) to dispatch</span>
              </div>
            )}

            <button
              id="btn-push-to-talk"
              type="button"
              onClick={handlePushToTalk}
              disabled={isRadioTransmitting}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                isRadioTransmitting
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
              }`}
            >
              <Mic className={`w-4 h-4 ${isRadioTransmitting ? 'animate-bounce' : ''}`} />
              <span>{isRadioTransmitting ? 'TRANSMITTING VOICE...' : 'PUSH TO TALK (PTT)'}</span>
            </button>
          </div>

          {/* Quick Preset Site Assets Vault Drawer Button */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span>Site Documents & Photos</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAssetDrawer(!showAssetDrawer)}
                className="text-[10px] font-bold text-orange-600 hover:underline"
              >
                {showAssetDrawer ? 'Hide Presets' : 'Quick Pick'}
              </button>
            </div>

            {showAssetDrawer && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1 animate-in fade-in">
                {SAMPLE_SITE_ASSETS.map((asset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSampleAsset(asset)}
                    className="w-full text-left p-1.5 rounded-lg bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-colors flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {getAttachmentIcon(asset.type)}
                      <span className="truncate font-medium text-slate-800">{asset.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 ml-1 shrink-0">{asset.size}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Indian Language Selector widget */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>AI Instant Language Switch</span>
            </span>
            <select
              value={targetTranslationLang}
              onChange={(e) => setTargetTranslationLang(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="hi">Translate to Hindi (हिन्दी)</option>
              <option value="mr">Translate to Marathi (मराठी)</option>
              <option value="ta">Translate to Tamil (தமிழ்)</option>
              <option value="te">Translate to Telugu (తెలుగు)</option>
              <option value="kn">Translate to Kannada (ಕನ್ನಡ)</option>
              <option value="bn">Translate to Bengali (বাংলা)</option>
              <option value="gu">Translate to Gujarati (ગુજરાતી)</option>
              <option value="en">Translate to English</option>
            </select>
          </div>
        </div>

        {/* Right Main Chat Window */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`md:col-span-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between h-full relative transition-all ${
            isDraggingOver ? 'ring-2 ring-orange-500 bg-orange-50/20' : ''
          }`}
        >
          {/* Drag Overlay Hint */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-30 bg-orange-500/10 backdrop-blur-2xs rounded-xl flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-orange-500">
              <UploadCloud className="w-12 h-12 text-orange-600 animate-bounce mb-2" />
              <div className="font-extrabold text-slate-900 text-sm">Drop Site Photos or Documents Here</div>
              <div className="text-xs text-slate-600 mt-0.5">Supports PDF, DWG, PNG, JPG, and DOC files</div>
            </div>
          )}

          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{selectedChannel}</h3>
                <span className="text-[10px] text-slate-400 block">{safeProject.name} • Live Dispatch Channel</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title="Attach photo or drawing"
              >
                <Paperclip className="w-3.5 h-3.5 text-orange-500" />
                <span>Add Files</span>
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300" />
                <p>No radio messages in this channel yet. Type or attach a site photo below to broadcast.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderId === 'user-me';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={msg.avatar || msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                    />

                    <div className={`max-w-[80%] space-y-1.5 ${isMe ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-800">{msg.senderName}</span>
                        <span className="text-orange-600 font-mono font-bold">({msg.senderRole})</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                          isMe
                            ? 'bg-orange-600 text-white font-medium rounded-tr-xs shadow-xs'
                            : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                        {/* Attached Photos & Documents Display */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="pt-2 border-t border-white/20 dark:border-slate-200/80 space-y-2">
                            {/* Image Grid */}
                            {msg.attachments.filter((a) => a.type === 'image').length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {msg.attachments
                                  .filter((a) => a.type === 'image')
                                  .map((img) => (
                                    <div
                                      key={img.id}
                                      onClick={() => setPreviewAttachment(img)}
                                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-black/10 bg-black/5"
                                    >
                                      <img
                                        src={img.url}
                                        alt={img.name}
                                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2 text-white">
                                        <span className="text-[10px] truncate max-w-[130px] font-semibold">{img.name}</span>
                                        <Maximize2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Non-Image Document Cards (PDF, DWG, DOC) */}
                            {msg.attachments.filter((a) => a.type !== 'image').length > 0 && (
                              <div className="space-y-1.5">
                                {msg.attachments
                                  .filter((a) => a.type !== 'image')
                                  .map((doc) => (
                                    <div
                                      key={doc.id}
                                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                                        isMe
                                          ? 'bg-white/15 border-white/30 text-white'
                                          : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
                                          {getAttachmentIcon(doc.type)}
                                        </div>
                                        <div className="truncate">
                                          <div className="font-bold text-xs truncate">{doc.name}</div>
                                          <div className="text-[10px] opacity-75 uppercase font-mono">
                                            {doc.type.toUpperCase()} • {doc.size || '1.2 MB'}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => setPreviewAttachment(doc)}
                                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            isMe
                                              ? 'hover:bg-white/20 text-white'
                                              : 'hover:bg-slate-100 text-slate-700'
                                          }`}
                                          title="View Document Details"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <a
                                          href={doc.url}
                                          download={doc.name}
                                          target="_blank"
                                          rel="noreferrer"
                                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            isMe
                                              ? 'hover:bg-white/20 text-white'
                                              : 'hover:bg-slate-100 text-slate-700'
                                          }`}
                                          title="Download File"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Translated version if available */}
                        {translatedMessages[msg.id] && (
                          <div className={`mt-1.5 pt-1.5 border-t ${isMe ? 'border-white/20 text-white' : 'border-slate-200 text-slate-700'} font-normal`}>
                            <span className="text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                              <span>AI Translation:</span>
                            </span>
                            <p className="mt-0.5 text-[11px]">{translatedMessages[msg.id]}</p>
                          </div>
                        )}
                      </div>

                      {/* Translate button */}
                      {!isMe && (
                        <button
                          onClick={() => handleTranslateMessage(msg.id, msg.text)}
                          disabled={isTranslatingId === msg.id}
                          className="text-[10px] text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                        >
                          {isTranslatingId === msg.id ? (
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-orange-500" />
                          ) : (
                            <Languages className="w-2.5 h-2.5" />
                          )}
                          <span>Translate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pending Attachments Bar (Staged files ready to send) */}
          {pendingAttachments.length > 0 && (
            <div className="pt-2 pb-2 px-1 border-t border-slate-100 flex flex-wrap items-center gap-2 animate-in fade-in">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Attached ({pendingAttachments.length}):
              </span>

              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-950 text-xs font-medium shadow-2xs"
                >
                  {getAttachmentIcon(att.type)}
                  <span className="truncate max-w-[140px] text-[11px] font-semibold">{att.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">({att.size})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setPendingAttachments([])}
                className="text-[10px] text-rose-600 font-bold hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Input Box with Photo/Doc Attach Actions */}
          <form onSubmit={handleSendMessage} className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
            {/* Attachment Button */}
            <button
              id="btn-chat-attach-file"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0"
              title="Add Photo / Documents"
            >
              <Paperclip className="w-4 h-4 text-orange-500" />
            </button>

            {/* Camera Snapshot Quick Button */}
            <button
              id="btn-chat-camera-snap"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors hidden sm:flex items-center justify-center shrink-0"
              title="Capture Site Photo"
            >
              <Camera className="w-4 h-4 text-slate-600" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={`Message ${selectedChannel} (or drag photos/drawings here)...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {/* Send Button */}
            <button
              id="btn-chat-send"
              type="submit"
              disabled={!inputText.trim() && pendingAttachments.length === 0}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                inputText.trim() || pendingAttachments.length > 0
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Broadcast Photo / Document Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-orange-500" />
                <h2 className="text-base font-black text-slate-900">Broadcast Site Photo / Document</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Channel */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Broadcast Channel</label>
                <select
                  value={broadcastChannel}
                  onChange={(e) => setBroadcastChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                >
                  <option value="ALL_CHANNELS">📢 ALL Site Radio Channels (Site-Wide Priority Alert)</option>
                  {channels.map((ch) => (
                    <option key={ch.name} value={ch.name}>
                      {ch.icon} {ch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Broadcast Subject / Heading</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g., Urgent HSE Hazard Barricade Snapshot / Pre-pour Card"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Broadcast Details & Instructions</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter detailed shift instructions, safety directives, or testing parameters..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-orange-500" />
                    <span>Attached Photos & Documents ({pendingAttachments.length})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold text-[11px] hover:bg-orange-700 transition-colors"
                    >
                      + Upload Files
                    </button>
                  </div>
                </div>

                {pendingAttachments.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 border border-dashed border-slate-300 rounded-lg">
                    No files attached yet. Upload site inspection photos, drawings, or select from presets below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {pendingAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getAttachmentIcon(att.type)}
                          <span className="truncate font-semibold text-slate-800">{att.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-slate-400 hover:text-rose-600 font-bold ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Presets in Modal */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">
                    Quick Preset Site Assets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_SITE_ASSETS.map((asset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddSampleAsset(asset)}
                        className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50 text-[10px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
                      >
                        {getAttachmentIcon(asset.type)}
                        <span>{asset.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-channel dispatch options */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={broadcastWithGmail}
                    onChange={(e) => setBroadcastWithGmail(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Send Google Workspace Gmail Notification to Stakeholders</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={broadcastWithRadio}
                    onChange={(e) => setBroadcastWithRadio(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Announce on Site Walkie-Talkie Radio Channel</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                id="btn-execute-broadcast"
                type="button"
                disabled={isBroadcasting}
                onClick={handleExecuteBroadcast}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to Crew...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Dispatch Site Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / High-Res Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {getAttachmentIcon(previewAttachment.type)}
                <div className="truncate">
                  <h3 className="font-bold text-sm truncate">{previewAttachment.name}</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {previewAttachment.type} • {previewAttachment.size || '3.4 MB'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.url}
                  download={previewAttachment.name}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/40">
              {previewAttachment.type === 'image' ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-lg"
                />
              ) : (
                <div className="text-center p-8 space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center">
                    {getAttachmentIcon(previewAttachment.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{previewAttachment.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Ready for offline field CAD / PDF viewer & cloud sync.
                    </p>
                  </div>
                  <a
                    href={previewAttachment.url}
                    download={previewAttachment.name}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Open & Download Document</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
