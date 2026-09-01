import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Check,
  Send,
} from 'lucide-react';
import { MaterialTransactionRecord } from '../types';
import { store } from '../lib/offlineStore';

interface OtpVerificationModalProps {
  transaction: MaterialTransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tx: MaterialTransactionRecord) => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  // Timer countdown for resend
  useEffect(() => {
    if (!isOpen || !transaction) return;
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, transaction, resendCooldown]);

  if (!isOpen || !transaction) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      const nextInput = document.getElementById(`otp-input-${nextFocus}`);
      nextInput?.focus();
      return;
    }

    const clean = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (clean && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    setErrorMsg('');
    setSuccessMsg('');
    const fullCode = otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const result = store.verifyTransactionOtp(transaction.id, fullCode);
      setIsVerifying(false);

      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          if (result.transaction && onSuccess) {
            onSuccess(result.transaction);
          }
          onClose();
        }, 1200);
      } else {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  const handleQuickFillCode = () => {
    if (transaction.otpRecord?.otpCode) {
      const chars = transaction.otpRecord.otpCode.split('');
      setOtpDigits(chars);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setTimeout(() => {
      const newOtp = store.resendTransactionOtp(transaction.id);
      setIsResending(false);
      setResendCooldown(45);
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessMsg(newOtp ? `New OTP code dispatched to ${newOtp.recipientPhone}!` : 'Failed to generate new OTP');
    }, 500);
  };

  const typeColor =
    transaction.type === 'RECEIVE_FROM_CLIENT'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : transaction.type === 'RETURN_TO_CLIENT'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : transaction.type === 'SHIFT_FROM_MAIN_STOCK'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const typeName =
    transaction.type === 'RECEIVE_FROM_CLIENT'
      ? 'Material Receiving from Client'
      : transaction.type === 'RETURN_TO_CLIENT'
      ? 'Material Return to Client'
      : transaction.type === 'SHIFT_FROM_MAIN_STOCK'
      ? 'Material Shift (Main Stock to Site)'
      : 'Material Shift (Site to Site)';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>OTP Authorization Required</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Verification Pending
                </span>
              </h2>
              <p className="text-xs text-slate-500">Secure material release & hand-over verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${typeColor}`}>
              {typeName}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-600">
              Indent #{transaction.clientIndentNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Material Item</span>
              <span className="font-bold text-slate-800">{transaction.materialName}</span>
              <span className="text-slate-500 ml-1 font-medium">
                ({transaction.quantity} {transaction.unit})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Gate Pass / Challan</span>
              <span className="font-semibold text-slate-700">{transaction.gatePassNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Origin</span>
              <span className="font-medium text-slate-700 truncate block">{transaction.sourceLocation}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Destination</span>
              <span className="font-medium text-slate-700 truncate block">{transaction.destinationLocation}</span>
            </div>
          </div>
        </div>

        {/* Recipient Notice & Simulator Banner */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900 space-y-1">
            <p className="font-semibold">
              OTP sent via {transaction.otpRecord?.verificationChannel || 'SMS'} to {transaction.otpRecord?.recipientName} ({transaction.otpRecord?.recipientPhone}):
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-300 font-bold text-blue-700 text-sm tracking-wider">
                {transaction.otpRecord?.otpCode || '123456'}
              </span>
              <button
                type="button"
                onClick={handleQuickFillCode}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                Auto-fill Code
              </button>
            </div>
          </div>
        </div>

        {/* 6-Digit OTP Inputs */}
        <div className="space-y-2 py-2">
          <label className="text-xs font-bold text-slate-700 block text-center">
            Enter 6-Digit Verification Code:
          </label>
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
              />
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="text-xs font-medium text-slate-600 hover:text-orange-600 disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend New OTP'}
            </span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || otpDigits.join('').length !== 6}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm shadow-orange-600/20"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Verify & Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
