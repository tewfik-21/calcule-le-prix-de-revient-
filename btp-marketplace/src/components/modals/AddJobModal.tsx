import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import type { JobOffer, UserSession } from '../../types';
import { ALGERIAN_WILAYAS } from '../../App';

interface AddJobModalProps {
  user: UserSession | null;
  onClose: () => void;
  onSubmit: (job: JobOffer, cvFile?: File) => void;
  t: any;
  lang: 'fr' | 'ar';
}

export const AddJobModal: React.FC<AddJobModalProps> = ({ /* user, */ onClose, onSubmit, t, lang }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<any>('offer');
  const [profession, setProfession] = useState('Ingénieur Civil');
  const [experience, setExperience] = useState('3-5 ans');
  const [companyName, setCompanyName] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [desc, setDesc] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !wilaya || !desc) return;
    if (type === 'offer' && !companyName) return;
    if (type === 'request' && !candidateName) return;

    const job: JobOffer = {
      id: `job-${Date.now()}`,
      title,
      type,
      companyName: type === 'offer' ? companyName : undefined,
      candidateName: type === 'request' ? candidateName : undefined,
      description: desc,
      wilaya,
      profession,
      experience,
      cvUrl: '',
      dateAdded: new Date().toISOString()
    };

    onSubmit(job, cvFile || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-[#0a0d16] border border-emerald-500/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between shrink-0 bg-emerald-500/5">
          <div>
            <h3 className="font-black text-white text-base uppercase tracking-wider">Publier une Offre/Demande d'Emploi</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-slate-900 rounded-xl transition text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4.5 flex-1 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Type d'annonce *</label>
              <select value={type} onChange={e => setType(e.target.value as 'request' | 'offer')} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-emerald-500 focus:outline-none">
                <option value="offer">Offre d'emploi (Je recrute)</option>
                <option value="request">Demande d'emploi (Je cherche un travail)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Titre de l'annonce *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-semibold" placeholder="Ex: Conducteur d'engins, Ingénieur GC..." />
            </div>

            {type === 'offer' ? (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Nom de l'entreprise *</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold" />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Votre Nom Complet *</label>
                <input type="text" required value={candidateName} onChange={e => setCandidateName(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold" />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Profession *</label>
              <select value={profession} onChange={e => setProfession(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-emerald-500 focus:outline-none">
                <option value="Ingénieur Civil">Ingénieur Civil</option>
                <option value="Architecte">Architecte</option>
                <option value="Conducteur de Travaux">Conducteur de Travaux</option>
                <option value="Chef de Projet">Chef de Projet</option>
                <option value="Conducteur d'Engins">Conducteur d'Engins</option>
                <option value="Ouvrier Qualifié">Ouvrier Qualifié</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Expérience Requise / Acquise</label>
              <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-emerald-500 focus:outline-none">
                <option value="Débutant">Débutant (0-2 ans)</option>
                <option value="3-5 ans">3 à 5 ans</option>
                <option value="5-10 ans">5 à 10 ans</option>
                <option value="+10 ans">+10 ans</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('wilaya')} *</label>
              <select value={wilaya} onChange={e => setWilaya(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-emerald-500 focus:outline-none">
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

                        {type === 'request' && (
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Télécharger votre CV (Optionnel)</label>
                <div className="relative">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => e.target.files && setCvFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                  <div className={`w-full bg-slate-900/60 border ${cvFile ? 'border-emerald-500' : 'border-white/5'} border-dashed rounded-xl px-3.5 py-4 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition`}>
                    <FileText className={`h-4 w-4 ${cvFile ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <span>{cvFile ? cvFile.name : 'Cliquez ici pour joindre votre CV (PDF, Word)'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Description détaillée *</label>
              <textarea required rows={4} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-emerald-500 focus:outline-none font-medium resize-none" placeholder="Détails du poste ou de vos compétences..." />
            </div>

          </div>
        </div>

        <div className="px-6 py-4.5 border-t border-white/5 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider px-4.5 py-2 rounded-xl border border-white/5 transition">{t('cancel')}</button>
          <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition duration-300">Publier</button>
        </div>
      </form>
    </div>
  );
};
