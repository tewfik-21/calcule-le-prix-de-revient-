import React from 'react';
import { Zap } from 'lucide-react';
import type { Tender, UserSession } from '../../types';

interface TendersViewProps {
  mobileView: 'map' | 'list';
  tenders: Tender[];
  t: any;
  user: UserSession | null;
  handlePostTenderButtonClick: () => void;
  setShowPremiumModal: (show: boolean) => void;
}

export const TendersView: React.FC<TendersViewProps> = ({
  mobileView,
  tenders,
  t,
  user,
  handlePostTenderButtonClick,
  setShowPremiumModal
}) => {
  return (
    <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'block' : 'hidden lg:flex'} overflow-y-auto pr-2 scrollbar-thin pb-20`}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">Appels d'Offres</h2>
          <p className="text-xs text-slate-400">Marchés publics et projets privés (Réservé aux membres Premium)</p>
        </div>
        <button onClick={handlePostTenderButtonClick} className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
          + Publier
        </button>
      </div>
      <div className="space-y-4">
        {tenders.map(tender => (
          <div key={tender.id} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl premium-glow-card relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2 inline-block">
                  {t(tender.category)}
                </span>
                <h3 className="text-sm font-black text-white mb-1">{tender.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold">{tender.companyName} • {tender.wilaya}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 mb-0.5">Date limite</p>
                <p className="text-xs font-black text-rose-400">{tender.deadline}</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-4 line-clamp-2">{tender.description}</p>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="text-[10px] text-slate-400">
                <span className="font-bold">Budget:</span> {tender.budget}
              </div>
              {user?.isPremium ? (
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
                  Soumissionner
                </button>
              ) : (
                <button onClick={() => setShowPremiumModal(true)} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase px-4 py-2 rounded-xl transition border border-white/5">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Devenir Premium
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
