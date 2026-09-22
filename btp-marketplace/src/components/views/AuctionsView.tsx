import React from 'react';
import { Gavel, Clock, MapPin, Building, ShieldCheck, ArrowRight } from 'lucide-react';
import type { Auction } from '../../types';

interface AuctionsViewProps {
  auctions: Auction[];
  t: any;
  onAddAuctionClick?: () => void;
}

export const AuctionsView: React.FC<AuctionsViewProps> = ({ auctions, t, onAddAuctionClick }) => {
  if (!auctions || auctions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Gavel className="h-16 w-16 mb-4 opacity-20" />
        <p className="font-bold text-lg mb-6">Aucune enchère en cours</p>
        <button 
          onClick={onAddAuctionClick}
          className="bg-rose-500 hover:bg-rose-600 text-white font-black text-sm uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-lg shadow-rose-500/20"
        >
          Créer une enchère
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-end mb-6">
        <button 
          onClick={onAddAuctionClick}
          className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-lg shadow-rose-500/20"
        >
          <Gavel className="h-4 w-4" />
          Créer une enchère
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {auctions.map((auction) => {
        const endDate = new Date(auction.endDate);
        const now = new Date();
        const diffTime = Math.abs(endDate.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return (
          <div key={auction.id} className="glass-card border border-rose-500/20 hover:border-rose-500/50 rounded-2xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300">
            {/* Image Section */}
            <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden">
              <img 
                src={auction.images[0]} 
                alt={auction.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent md:bg-gradient-to-r" />
              
              <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-rose-400/50 flex items-center gap-1.5 shadow-lg shadow-rose-500/30">
                <Gavel className="h-3 w-3" />
                Enchère / Liquidation
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {t(auction.category)}
                  </span>
                  {auction.isVerified && (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Vérifié</span>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-black text-white leading-snug mb-2 group-hover:text-rose-400 transition">
                  {auction.title}
                </h3>
                
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {auction.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-bold">
                    <Building className="h-3.5 w-3.5 text-slate-500" />
                    <span className="truncate">{auction.companyName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-bold">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span className="truncate">{auction.commune}, {auction.wilaya}</span>
                  </div>
                </div>
              </div>

              {/* Bidding Info */}
              <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center justify-between mt-auto">
                <div>
                  <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Mise Actuelle</div>
                  <div className="text-lg font-black text-rose-500 font-mono">
                    {auction.currentBid.toLocaleString('fr-FR')} DA
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" /> Finit dans
                  </div>
                  <div className="text-xs font-bold text-amber-400">
                    {diffDays} Jours
                  </div>
                </div>
              </div>

              <button className="w-full mt-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2">
                Participer à l'enchère <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
};
