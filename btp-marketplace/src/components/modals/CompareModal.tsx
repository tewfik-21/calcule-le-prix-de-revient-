import React from 'react';
import { X, Check, CheckCircle2, Zap } from 'lucide-react';
import type { Listing } from '../../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Listing[];
  t: any;
  removeFromCompare: (id: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, compareList, t, removeFromCompare }) => {
  if (!isOpen || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Comparaison des Équipements</h2>
              <p className="text-xs text-slate-400 font-bold">{compareList.length} équipements sélectionnés</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto scrollbar-thin">
          <div className="flex gap-4 min-w-max">
            {/* Features Label Column */}
            <div className="w-48 shrink-0 flex flex-col space-y-2 mt-[180px]">
              <div className="h-12 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Secteur</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Prix</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Marque & Année</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Heures de travail</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Lieu</div>
              <div className="h-12 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Garantie / Vérifié</div>
            </div>

            {/* Comparison Cards */}
            {compareList.map((listing) => (
              <div key={listing.id} className="w-80 shrink-0 bg-slate-950/50 border border-white/10 rounded-2xl overflow-hidden relative">
                <button 
                  onClick={() => removeFromCompare(listing.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition z-10 border border-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* Header Card */}
                <div className="h-44 p-5 border-b border-white/5 flex flex-col justify-end relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10">
                    <h3 className="text-sm font-black text-white leading-snug mb-2 line-clamp-2">{listing.title}</h3>
                    <div className="text-[10px] font-bold text-slate-400">{listing.companyName}</div>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex flex-col space-y-2 p-4">
                  <div className="h-12 flex items-center text-xs font-bold text-slate-300 border-b border-white/5">
                    {t(listing.category)}
                  </div>
                  <div className="h-12 flex items-center text-sm font-black text-orange-400 border-b border-white/5 font-mono">
                    {listing.price > 0 ? `${listing.price.toLocaleString('fr-FR')} DA` : t('price_on_demand')}
                  </div>
                  <div className="h-12 flex items-center text-xs font-bold text-slate-300 border-b border-white/5">
                    {listing.brand || '-'} ({listing.year || '-'})
                  </div>
                  <div className="h-12 flex items-center text-xs font-bold text-slate-300 border-b border-white/5">
                    {listing.hoursOfUse ? `${listing.hoursOfUse} H` : '-'}
                  </div>
                  <div className="h-12 flex items-center text-xs font-bold text-slate-300 border-b border-white/5">
                    {listing.wilaya}
                  </div>
                  <div className="h-12 flex items-center border-b border-white/5">
                    {listing.inspectionBadge ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : '-'}
                  </div>
                </div>

                {/* Technical Specs List */}
                {listing.features && listing.features.length > 0 && (
                  <div className="p-4 bg-slate-900/50">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Spécifications additionnelles</h4>
                    <ul className="space-y-2">
                      {listing.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <Check className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {/* Add More Placeholder */}
            {compareList.length < 3 && (
              <div 
                onClick={onClose}
                className="w-80 shrink-0 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition text-slate-500 hover:text-orange-400"
              >
                <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                  <span className="text-2xl font-light">+</span>
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Ajouter un équipement</span>
                <span className="text-[10px] mt-1">({compareList.length}/3 sélectionnés)</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
