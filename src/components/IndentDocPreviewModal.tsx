import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Download,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { MaterialAttachment, MaterialTransactionRecord } from '../types';

interface IndentDocPreviewModalProps {
  attachment: MaterialAttachment | null;
  transaction?: MaterialTransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IndentDocPreviewModal: React.FC<IndentDocPreviewModalProps> = ({
  attachment,
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !attachment) return null;

  const isImage =
    attachment.fileType === 'image' ||
    attachment.url.startsWith('data:image') ||
    attachment.url.includes('images.unsplash.com');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 truncate max-w-md">
                {attachment.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-orange-600">{attachment.docCategory}</span>
                <span>•</span>
                <span>{attachment.fileSize || '1.2 MB'}</span>
                <span>•</span>
                <span>{attachment.timestamp}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Associated Transaction metadata if present */}
        {transaction && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Indent No.</span>
              <span className="font-bold text-slate-800">{transaction.clientIndentNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Gate Pass</span>
              <span className="font-semibold text-slate-700">{transaction.gatePassNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Material</span>
              <span className="font-semibold text-slate-700">
                {transaction.materialName} ({transaction.quantity} {transaction.unit})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">OTP Status</span>
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  transaction.otpRecord?.verified ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {transaction.otpRecord?.verified ? 'Authorized' : 'Pending OTP'}
              </span>
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-100 rounded-lg p-3 min-h-[260px] flex items-center justify-center">
          {isImage ? (
            <div className="relative group max-h-full">
              <img
                src={attachment.url}
                alt={attachment.name}
                referrerPolicy="no-referrer"
                className="max-h-[380px] w-auto object-contain rounded border border-slate-200 shadow-xs"
              />
              <div className="mt-2 text-center text-xs text-slate-500">
                Attached Indent Slip / Physical Delivery Challan
              </div>
            </div>
          ) : (
            <div className="text-center p-8 space-y-3">
              <FileText className="w-16 h-16 text-slate-400 mx-auto" />
              <div>
                <p className="font-bold text-slate-800">{attachment.name}</p>
                <p className="text-xs text-slate-500 mt-1">PDF Digital Delivery Challan / Formatted Indent</p>
              </div>
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Full Viewer</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer info & download */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Category: <span className="font-semibold text-slate-700">{attachment.docCategory}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Close
            </button>
            <a
              href={attachment.url}
              download={attachment.name}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Attachment</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
