import React from 'react';
import { X, ClipboardList } from 'lucide-react';
import type { Listing } from '../../types';

interface DevisModalProps {
  selectedListing: Listing;
  onClose: () => void;
}

export const DevisModal: React.FC<DevisModalProps> = ({ selectedListing, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-orange-500/10 p-6 border-b border-orange-500/20 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 rounded-full transition"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center mb-3">
            <ClipboardList className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Demande de Devis</h3>
          <p className="text-[10px] text-orange-400 font-bold mt-1 uppercase tracking-wider">{selectedListing.title}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {selectedListing.dealType === 'location' ? 'Durée souhaitée (Jours/Mois)' : 'Quantité souhaitée'}
            </label>
            <input 
              type="text" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder={selectedListing.dealType === 'location' ? 'ex: 5 Jours' : 'ex: 2 Pièces'}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Lieu de livraison / Chantier (Wilaya, Commune)
            </label>
            <input 
              type="text" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="ex: Alger, Rouiba"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Détails supplémentaires
            </label>
            <textarea 
              rows={3}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
              placeholder="Veuillez préciser vos besoins..."
            ></textarea>
          </div>

          <button 
            onClick={() => {
              alert('Votre demande de devis a été envoyée avec succès au fournisseur.');
              onClose();
            }}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20"
          >
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
};
