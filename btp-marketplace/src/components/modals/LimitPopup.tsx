import React from 'react';
import { Info } from 'lucide-react';

interface LimitPopupProps {
  onClose: () => void;
  onUpgrade: () => void;
  t: any;
}

export const LimitPopup: React.FC<LimitPopupProps> = ({ onClose, onUpgrade, t }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#0a0d16] border border-rose-500/50 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in p-6 space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <Info className="h-6 w-6 text-rose-500" />
          </div>
          <h3 className="font-black text-white text-sm uppercase tracking-wider">{t('free_limit_title')}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{t('free_limit_desc')}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl border border-white/5 transition"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 rounded-xl shadow-lg transition"
          >
            {t('upgrade_premium')}
          </button>
        </div>

      </div>
    </div>
  );
};
