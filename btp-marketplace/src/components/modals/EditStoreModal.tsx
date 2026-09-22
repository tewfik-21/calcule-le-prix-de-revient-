import React, { useState } from 'react';
import { X, ImagePlus, CheckCircle2 } from 'lucide-react';
import type { Store, UserSession } from '../../types';
import { ALGERIAN_WILAYAS } from '../../App';

interface EditStoreModalProps {
  initialStore: Store;
  user: UserSession | null;
  onClose: () => void;
  onSubmit: (store: Store, logoFile?: File, bannerFile?: File) => void;
  t: any;
  lang: 'fr' | 'ar';
}

export const EditStoreModal: React.FC<EditStoreModalProps> = ({ initialStore, onClose, onSubmit, t, lang }) => {
  const [name, setName] = useState(initialStore.name || '');
  const [description, setDescription] = useState(initialStore.description || '');
  const [wilaya, setWilaya] = useState(initialStore.wilaya || 'Alger');
  const [phone, setPhone] = useState(initialStore.phone || '');
  
  // Custom categories for stores
  const storeCategoriesList = [
    'Équipements BTP', 'Location Engins', 'Matériaux de Construction', 
    'Pièces de Rechange', 'Transport & Logistique', 'Bureau d\'Études'
  ];
  const [selectedCats, setSelectedCats] = useState<string[]>(initialStore.categories || []);

  // Files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !wilaya || !phone || !description || isSubmitting) return;

    setIsSubmitting(true);
    const store: Store = {
      ...initialStore,
      name,
      description,
      wilaya,
      phone,
      categories: selectedCats as any,
    };

    onSubmit(store, logoFile || undefined, bannerFile || undefined);
  };

  const toggleCat = (cat: string) => {
    setSelectedCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-[#0a0d16] border border-blue-500/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between shrink-0 bg-blue-500/5">
          <div>
            <h3 className="font-black text-white text-base uppercase tracking-wider">{t('edit_store') || 'Modifier ma Vitrine'}</h3>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">Mise à jour</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-900 rounded-xl transition text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4.5 flex-1 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Nom de l'entreprise / Magasin *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-semibold" placeholder="Ex: Sarl Equipements Pro..." />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('wilaya')} *</label>
              <select value={wilaya} onChange={e => setWilaya(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-blue-500 focus:outline-none">
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Numéro de Contact *</label>
              <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono font-bold" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description de la société *</label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-medium resize-none" placeholder="Présentez vos services, votre historique..." />
            </div>

            {/* Categories */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Domaines d'activité (Sélectionnez plusieurs)</label>
              <div className="flex flex-wrap gap-2">
                {storeCategoriesList.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 ${
                      selectedCats.includes(cat) ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {selectedCats.includes(cat) && <CheckCircle2 className="h-3 w-3" />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo and Banner */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Logo de l'entreprise</label>
              <div className="flex gap-3 items-center">
                <div className="h-16 w-16 rounded-2xl border border-dashed border-slate-600 bg-slate-900/50 flex items-center justify-center overflow-hidden relative">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} className="h-full w-full object-cover" alt="logo" />
                  ) : initialStore.logoUrl ? (
                    <img src={initialStore.logoUrl} className="h-full w-full object-cover" alt="logo" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-slate-500" />
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && setLogoFile(e.target.files[0])} />
                </div>
                <div className="text-[9px] text-slate-400">Recommandé: Carré (1:1)</div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Image de Couverture</label>
              <div className="flex gap-3 items-center">
                <div className="h-16 w-24 rounded-2xl border border-dashed border-slate-600 bg-slate-900/50 flex items-center justify-center overflow-hidden relative">
                  {bannerFile ? (
                    <img src={URL.createObjectURL(bannerFile)} className="h-full w-full object-cover" alt="banner" />
                  ) : initialStore.bannerUrl ? (
                    <img src={initialStore.bannerUrl} className="h-full w-full object-cover" alt="banner" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-slate-500" />
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && setBannerFile(e.target.files[0])} />
                </div>
                <div className="text-[9px] text-slate-400">Recommandé: Paysage (16:9)</div>
              </div>
            </div>

          </div>
        </div>

        <div className="px-6 py-4.5 border-t border-white/5 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider px-4.5 py-2 rounded-xl border border-white/5 transition">{t('cancel')}</button>
          <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition duration-300 disabled:opacity-50">
            {isSubmitting ? 'ENREGISTREMENT...' : 'MODIFIER MA VITRINE'}
          </button>
        </div>
      </form>
    </div>
  );
};
