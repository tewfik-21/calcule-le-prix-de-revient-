import React, { useState } from 'react';
import { X, Send, Wrench, PackageSearch, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SparePartRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SparePartRequestModal: React.FC<SparePartRequestModalProps> = ({ isOpen, onClose }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [partName, setPartName] = useState('');
  const [brand, setBrand] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 1000);
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
            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <Wrench className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Pièce Express</h2>
              <p className="text-xs text-slate-400 font-bold">Trouvez votre pièce en un clic</p>
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
              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wider text-center">Demande Envoyée !</h3>
              <p className="text-sm text-slate-400 text-center font-bold">
                Votre demande a été diffusée à tous nos fournisseurs agréés. Vous recevrez des devis sous peu.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-3 mb-4">
                <PackageSearch className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-orange-200 uppercase tracking-wider leading-relaxed">
                  Gagnez du temps ! Décrivez la pièce recherchée et recevez des devis directement des fournisseurs.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Nom de la pièce
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Pompe Hydraulique, Injecteur..."
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Marque & Modèle de la machine
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Komatsu PC200-8"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  Numéro de Série / Référence (Optionnel)
                </label>
                <input 
                  type="text" 
                  placeholder="Pour plus de précision"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                  Niveau d'Urgence
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUrgency('normal')}
                    className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border ${
                      urgency === 'normal' 
                        ? 'bg-slate-700 text-white border-slate-500' 
                        : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition border flex items-center justify-center gap-1.5 ${
                      urgency === 'urgent' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                        : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    Urgent
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20 border border-orange-400/20"
              >
                <Send className="h-5 w-5" />
                Diffuser la demande
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
