import React, { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import type { Auction, UserSession } from '../../types';
import { ALGERIAN_WILAYAS } from '../../App';

interface AddAuctionModalProps {
  user: UserSession | null;
  onClose: () => void;
  onSubmit: (auction: Auction, imageFiles: File[]) => void;
  t: any;
  lang: 'fr' | 'ar';
}

export const AddAuctionModal: React.FC<AddAuctionModalProps> = ({ onClose, onSubmit, t, lang }) => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [commune, setCommune] = useState('');
  const [startingPrice, setStartingPrice] = useState<number | ''>('');
  const [endDate, setEndDate] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<any>('Véhicules & Engins');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyName || !wilaya || !startingPrice || !endDate || !desc) return;

    const auction: Auction = {
      id: `auction-${Date.now()}`,
      title,
      companyName,
      description: desc,
      wilaya,
      commune,
      startingPrice: Number(startingPrice),
      currentBid: Number(startingPrice),
      endDate,
      category,
      images: [], // Images handled by parent
      isVerified: false
    };

    onSubmit(auction, imageFiles);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-[#0a0d16] border border-fuchsia-500/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between shrink-0 bg-fuchsia-500/5">
          <div>
            <h3 className="font-black text-white text-base uppercase tracking-wider">Créer une Mazaad (Enchère)</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-900 rounded-xl transition text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4.5 flex-1 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Titre de l'enchère *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none font-semibold" placeholder="Ex: Lot de {MAX_IMAGES} Camions Renault Kerax..." />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Nom de l'entreprise *</label>
              <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none font-semibold" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Catégorie *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-fuchsia-500 focus:outline-none">
                <option value="Véhicules & Engins">Véhicules & Engins</option>
                <option value="Équipements Industriels">Équipements Industriels</option>
                <option value="Matériaux & Lots">Matériaux & Lots</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Prix de départ (DA) *</label>
              <input type="number" required value={startingPrice} onChange={e => setStartingPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none font-mono font-bold" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Date de fin *</label>
              <input type="datetime-local" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none font-mono" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('wilaya')} *</label>
              <select value={wilaya} onChange={e => setWilaya(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-fuchsia-500 focus:outline-none">
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('commune')} *</label>
              <input type="text" required value={commune} onChange={e => setCommune(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none font-semibold" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description & Conditions *</label>
              <textarea required rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-fuchsia-500 focus:outline-none font-medium resize-none" placeholder="État du matériel, conditions de paiement, visite du site..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Photos (Obligatoire)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((src, i) => (
                  <div key={i} className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 relative group">
                    <img src={src} className="h-full w-full object-cover" alt="" />
                    <button type="button" onClick={() => {
                      setImages(prev => prev.filter((_, idx) => idx !== i));
                      setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                    }} className="absolute inset-0 bg-red-500/50 hidden group-hover:flex items-center justify-center text-white transition"><X className="h-4 w-4"/></button>
                  </div>
                ))}
                <label className="relative h-16 w-16 rounded-xl border border-dashed border-slate-600 bg-slate-900/30 hover:bg-slate-900/60 transition flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-fuchsia-500 overflow-hidden">
                  <ImagePlus className="h-5 w-5 z-10" />
                  <input type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={e => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      const urls = files.map(f => URL.createObjectURL(f));
                      setImages(prev => [...prev, ...urls]);
                      setImageFiles(prev => [...prev, ...files]);
                    }
                  }} />
                </label>
              </div>
            </div>

          </div>
        </div>

        <div className="px-6 py-4.5 border-t border-white/5 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider px-4.5 py-2 rounded-xl border border-white/5 transition">{t('cancel')}</button>
          <button type="submit" className="bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition duration-300">Publier l'enchère</button>
        </div>
      </form>
    </div>
  );
};
