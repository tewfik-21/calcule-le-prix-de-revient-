import React, { useState } from 'react';
import { X, BellRing, Search, DollarSign, ListFilter, CheckCircle2 } from 'lucide-react';
import type { CategoryType } from '../../types';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, t }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<CategoryType | ''>('');
  const [maxPrice, setMaxPrice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <BellRing className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Créer une Alerte</h2>
              <p className="text-xs text-slate-400 font-bold">Soyez notifié des nouvelles annonces</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wider">Alerte Activée !</h3>
              <p className="text-sm text-slate-400 text-center font-bold">
                Vous recevrez une notification dès qu'un équipement correspondant à vos critères sera publié.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Mot-clé (Marque, Modèle...)
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Caterpillar D8T, Komatsu..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Catégorie
                </label>
                <div className="relative">
                  <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <select 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold appearance-none focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="" disabled>Sélectionnez une catégorie...</option>
                    <option value="mines_carrieres">{t('mines_carrieres')}</option>
                    <option value="btp">{t('btp')}</option>
                    <option value="pieces_detachees">{t('pieces_detachees')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Budget Maximum (DA) - Optionnel
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input 
                    type="number" 
                    placeholder="Budget max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 border border-blue-400/20"
              >
                <BellRing className="h-5 w-5" />
                Activer l'Alerte
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
