import React from 'react';
import { Store as StoreIcon, Plus, Building, ShieldCheck, MapPin, Zap, BadgeCheck } from 'lucide-react';
import type { Store } from '../../types';
import { INITIAL_LISTINGS } from '../../mockData';

interface StoresViewProps {
  stores: Store[];
  mobileView: 'map' | 'list';
  setActiveView: any;
  setSelectedStore: (store: Store | null) => void;
  t: any;
  onAddStoreClick?: () => void;
}

export const StoresView: React.FC<StoresViewProps> = ({ stores, mobileView, setActiveView, setSelectedStore, t, onAddStoreClick }) => {
  return (
    <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'block' : 'hidden lg:flex'}`}>
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <StoreIcon className="h-4 w-4 text-orange-500" />
          Vitrines Officielles
        </h3>
        <button onClick={onAddStoreClick}
          className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-3 w-3" /> Créer ma boutique
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-20 scrollbar-thin">
        {stores.map(store => (
          <div key={store.id} 
            onClick={() => { setSelectedStore(store); setActiveView('store_detail'); }}
            className={`p-5 rounded-2xl cursor-pointer transition group flex flex-col justify-between min-h-[160px] relative overflow-hidden ${
              store.isPremium 
                ? 'glass-panel-glow border-orange-500/30 hover:border-orange-500/60' 
                : 'glass-card border-white/5 hover:border-white/20'
            }`}
          >
            {store.isPremium && store.bannerUrl && (
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition duration-500">
                <img src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
              </div>
            )}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${store.isPremium ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-orange-500/20' : 'bg-slate-800 text-slate-400'}`}>
                  <Building className="h-6 w-6" />
                </div>
                {store.isPremium && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase flex items-center gap-1 shadow-md shadow-orange-500/20">
                    <ShieldCheck className="h-3 w-3" /> Partenaire Officiel
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-white text-lg group-hover:text-orange-400 transition drop-shadow-md">{store.name}</h4>
                {store.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-green-500 shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] text-slate-300 uppercase font-black">
                  <MapPin className="h-3 w-3 text-orange-500" /> {store.wilaya}
                </div>
                {store.rating && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-black">
                    ★ {store.rating}/5
                  </div>
                )}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[11px] text-slate-400 mt-3 line-clamp-2 leading-relaxed">{store.description}</p>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-1">
                  {store.categories?.slice(0, 2).map(cat => (
                    <span key={cat} className="bg-slate-900/80 border border-white/10 text-slate-300 text-[8px] font-black uppercase px-2 py-1 rounded">
                      {t(cat)}
                    </span>
                  ))}
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50 px-2 py-1 rounded border border-white/5">
                  {INITIAL_LISTINGS.filter(l => l.storeId === store.id).length} Annonces
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Call to Action Banner for non-premium / guests */}
      <div className="mt-2 mb-6 bg-gradient-to-r from-slate-900 to-slate-800 border border-orange-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-[50px] pointer-events-none" />
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="text-xl font-black text-white">Vous êtes un professionnel du BTP ?</h3>
          </div>
          <p className="text-sm text-slate-400 font-medium max-w-xl">
            Augmentez vos ventes x10 en créant votre propre <strong className="text-orange-400">Vitrine Officielle Premium</strong>. Obtenez une page dédiée, un badge de confiance et publiez un nombre illimité d'annonces.
          </p>
        </div>
        <button onClick={onAddStoreClick} className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-sm px-6 py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] shrink-0 flex items-center gap-2">
          <StoreIcon className="h-4 w-4" />
          Créer Ma Vitrine
        </button>
      </div>
    </div>
  );
};
