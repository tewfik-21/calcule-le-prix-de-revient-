import React from 'react';
import { X, QrCode } from 'lucide-react';

interface QrModalProps {
  onClose: () => void;
  t: any;
}

export const QrModal: React.FC<QrModalProps> = ({ onClose, t }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#0a0d16] border border-orange-500/30 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-fade-in p-6 space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-900 rounded-xl transition text-slate-400 hover:text-white border border-white/5"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
            <QrCode className="h-6 w-6 text-orange-500" />
          </div>
          <h3 className="font-black text-white text-base uppercase tracking-wider">{t('qr_title')}</h3>
          <p className="text-[11px] text-slate-450 leading-relaxed max-w-xs mx-auto">{t('qr_desc')}</p>
        </div>

        {/* QR image */}
        <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-inner">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin.replace('localhost', '10.43.198.140'))}`} 
            alt="QR Code" 
            className="w-40 h-40"
          />
        </div>

        {/* Address display */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">URL Address</p>
          <span className="text-xs font-bold font-mono text-orange-400 select-all block break-all">{window.location.origin.replace('localhost', '10.43.198.140')}</span>
        </div>

      </div>
    </div>
  );
};
