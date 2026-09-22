import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CategoryType, Tender } from '../../types';
import { ALGERIAN_WILAYAS } from '../../App';

interface AddTenderModalProps {
  onClose: () => void;
  onSubmit: (tender: Tender) => void;
  t: any;
  lang: 'fr' | 'ar';
}

export const AddTenderModal: React.FC<AddTenderModalProps> = ({ onClose, onSubmit, t, lang }) => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState<CategoryType>('btp');
  const [deadline, setDeadline] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [budget, setBudget] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyName || !category || !deadline || !wilaya || !desc) return;

    const tender: Tender = {
      id: `tender-${Date.now()}`,
      title,
      companyName,
      category,
      deadline,
      wilaya,
      budget,
      description: desc,
      dateAdded: new Date().toISOString(),
      isPremiumOnly: true
    };

    onSubmit(tender);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <form 
        onSubmit={handleSubmit}
        className="relative bg-[#0a0d16] border border-orange-500/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 animate-fade-in flex flex-col max-h-[90vh]"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between shrink-0 bg-orange-500/5">
          <div>
            <h3 className="font-black text-white text-base uppercase tracking-wider">Publier un Appel d'Offre</h3>
            <p className="text-[10px] text-orange-450 font-bold uppercase tracking-widest font-mono">Marché public ou privé</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-900 rounded-xl transition text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-6 overflow-y-auto space-y-4.5 flex-1 scrollbar-thin">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Titre de l'Appel d'Offre *</label>
              <input
                type="text"
                required
                placeholder="Ex: Fourniture de 10 Pelles Hydrauliques..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none font-semibold"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Maitre d'Ouvrage (Entreprise) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Cosider, Sonatrach..."
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Domaine / Secteur *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="mines_carrieres">{t('mines_carrieres')}</option>
                <option value="ceramique_briqueterie">{t('ceramique_briqueterie')}</option>
                <option value="btp">{t('btp')}</option>
                <option value="transport_logistique">{t('transport_logistique')}</option>
                <option value="services_experts">{t('services_experts')}</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Date limite de soumission *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
              />
            </div>

            {/* Wilaya */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('wilaya')} du projet *</label>
              <select
                value={wilaya}
                onChange={e => setWilaya(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-orange-500 focus:outline-none"
              >
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Budget Estimatif (Optionnel)</label>
              <input
                type="text"
                placeholder="Ex: 50 Millions DA, ou laissez vide pour 'Sur Devis'"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description et Cahier des charges *</label>
              <textarea
                required
                rows={4}
                placeholder="Décrivez les besoins de l'appel d'offre..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-medium resize-none"
              />
            </div>

          </div>

        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4.5 border-t border-white/5 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider px-4.5 py-2 rounded-xl border border-white/5 transition"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 border border-white/10 transition duration-300 flex items-center gap-2"
          >
            Publier
          </button>
        </div>

      </form>
    </div>
  );
};
