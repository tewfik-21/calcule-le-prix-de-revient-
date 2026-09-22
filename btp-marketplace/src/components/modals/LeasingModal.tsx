import React, { useState, useEffect } from 'react';
import { X, Calculator, CreditCard, CalendarDays, DollarSign } from 'lucide-react';
import type { Listing } from '../../types';

interface LeasingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  t: any;
}

export const LeasingModal: React.FC<LeasingModalProps> = ({ isOpen, onClose, listing }) => {
  const [price, setPrice] = useState(listing?.price || 0);
  const [downPayment, setDownPayment] = useState((listing?.price || 0) * 0.3); // 30% default
  const [duration, setDuration] = useState(36); // 36 months default
  
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Principal loan amount
    const principal = price - downPayment;
    
    if (principal <= 0) {
      setMonthlyPayment(0);
      setTotalCost(price);
      return;
    }

    const m = principal / duration;
    
    setMonthlyPayment(m);
    setTotalCost(downPayment + (m * duration));
  }, [price, downPayment, duration]);

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Calculator className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Simulateur de Leasing</h2>
              <p className="text-xs text-slate-400 font-bold">{listing.title}</p>
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
        <div className="p-6 overflow-y-auto scrollbar-thin">
          
          <div className="space-y-5">
            
            {/* Prix d'équipement */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Prix de l'équipement (DA)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                />
              </div>
            </div>

            {/* Apport Initial */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Apport Initial (DA)
                </label>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                  {((downPayment / price) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative mb-2">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="number" 
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                />
              </div>
              <input 
                type="range" 
                min="0" 
                max={price} 
                step={price * 0.05}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Durée */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Durée (Mois)
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  <option value="12">12 Mois (1 an)</option>
                  <option value="24">24 Mois (2 ans)</option>
                  <option value="36">36 Mois (3 ans)</option>
                  <option value="48">48 Mois (4 ans)</option>
                  <option value="60">60 Mois (5 ans)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Results Box */}
          <div className="mt-8 bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h3 className="text-center text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                Mensualité Estimée
              </h3>
              <div className="text-center text-4xl font-black text-white tracking-tight mb-4">
                {Math.round(monthlyPayment).toLocaleString('fr-FR')} <span className="text-lg text-slate-400">DA</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                <div className="text-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Montant Financé</div>
                  <div className="text-sm font-black text-slate-300">
                    {Math.round(price - downPayment).toLocaleString('fr-FR')} DA
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Coût Total Leasing</div>
                  <div className="text-sm font-black text-slate-300">
                    {Math.round(totalCost).toLocaleString('fr-FR')} DA
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-500 text-center mt-4 px-4 font-medium">
            * Cette simulation est donnée à titre indicatif et ne constitue pas une offre commerciale. Les frais de dossier et assurances ne sont pas inclus.
          </p>
        </div>

      </div>
    </div>
  );
};
