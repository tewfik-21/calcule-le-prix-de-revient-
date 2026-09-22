import React from 'react';
import { X, Filter, MapPin, Tag, Box, RotateCcw } from 'lucide-react';
import { ALGERIAN_WILAYAS } from '../../App';
import type { CategoryType } from '../../types';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterWilaya: string;
  setFilterWilaya: (w: string) => void;
  minPrice: number | '';
  setMinPrice: (p: number | '') => void;
  maxPrice: number | '';
  setMaxPrice: (p: number | '') => void;
  filterCondition: 'all' | 'new' | 'used' | 'refurbished';
  setFilterCondition: (c: 'all' | 'new' | 'used' | 'refurbished') => void;
  activeCategory: CategoryType | 'all';
  setActiveCategory: (c: CategoryType | 'all') => void;
  t: any;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  filterWilaya,
  setFilterWilaya,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  filterCondition,
  setFilterCondition,
  activeCategory,
  setActiveCategory,
  t
}) => {
  if (!isOpen) return null;

  const resetFilters = () => {
    setFilterWilaya('all');
    setMinPrice('');
    setMaxPrice('');
    setFilterCondition('all');
    setActiveCategory('all');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Filter className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">{t('filtres') || 'Filtres'}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* Category */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Box className="h-4 w-4" />
              Catégorie
            </label>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as any)}
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-orange-500 focus:outline-none appearance-none"
            >
              <option value="all">{t('all') || 'Toutes'}</option>
              <option value="mines_carrieres">{t('mines_carrieres')}</option>
              <option value="ceramique_briqueterie">{t('ceramique_briqueterie')}</option>
              <option value="btp">{t('btp')}</option>
              <option value="transport_logistique">{t('transport_logistique')}</option>
              <option value="pieces_detachees">{t('pieces_detachees')}</option>
              <option value="outils">{t('outils')}</option>
              <option value="services_experts">{t('services_experts')}</option>
            </select>
          </div>

          {/* Wilaya */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('wilaya')}
            </label>
            <select
              value={filterWilaya}
              onChange={(e) => setFilterWilaya(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-orange-500 focus:outline-none appearance-none"
            >
              <option value="all">{t('all_wilayas')}</option>
              {ALGERIAN_WILAYAS.map((w: string) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Prix (DA)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-orange-500 focus:outline-none"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              État de l'équipement
            </label>
            <div className="flex flex-wrap gap-2">
              {['all', 'new', 'used', 'refurbished'].map(condition => (
                <button
                  key={condition}
                  onClick={() => setFilterCondition(condition as any)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition border ${
                    filterCondition === condition 
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                      : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {condition === 'all' ? 'Tous' : condition === 'new' ? 'Neuf' : condition === 'used' ? 'Occasion' : 'Rénové'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-slate-950/50 flex gap-3">
          <button
            onClick={resetFilters}
            className="px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
          >
            Appliquer
          </button>
        </div>

      </div>
    </div>
  );
};
