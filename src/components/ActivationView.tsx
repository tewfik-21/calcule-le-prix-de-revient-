import React, { useState } from 'react';
import { validateLicenseKey, generateLicenseKeyWithDate, LicenseInfo } from '../utils/license';
import { 
  Key, 
  User, 
  ShieldAlert, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  HelpCircle,
  Lock,
  Unlock,
  Calendar,
  Mail,
  UserCircle2,
  Gem
} from 'lucide-react';

interface ActivationViewProps {
  onActivate: (info: LicenseInfo) => void;
}

type AuthMode = 'guest' | 'free' | 'premium';

export const ActivationView: React.FC<ActivationViewProps> = ({ onActivate }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('premium');

  // Premium State
  const [licensee, setLicensee] = useState('');
  const [quarryName, setQuarryName] = useState('');
  const [location, setLocation] = useState('');
  const [permisNumber, setPermisNumber] = useState('');
  const [dateOctroi, setDateOctroi] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  
  // Free State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Global State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [genName, setGenName] = useState('BEDRI KHAOULA');
  const [genQuarryName, setGenQuarryName] = useState('CARRIÈRE NORD');
  const [genLocation, setGenLocation] = useState('Wilaya');
  const [genPermisNumber, setGenPermisNumber] = useState('001/2026');
  const [genDateOctroi, setGenDateOctroi] = useState(() => new Date().toISOString().split('T')[0]);
  const [genType, setGenType] = useState<'demo' | 'standard' | 'enterprise'>('standard');
  const [genExpiry, setGenExpiry] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [generatedKeyResult, setGeneratedKeyResult] = useState('');

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (authMode === 'guest') {
      setSuccess("Connexion en mode invité réussie...");
      setTimeout(() => {
        onActivate({
          key: 'GUEST-TIER',
          licensee: 'Invité (Non enregistré)',
          type: 'guest',
          expiryDate: '2099-12-31',
          activatedAt: new Date().toISOString().split('T')[0]
        });
      }, 1000);
      return;
    }

    if (authMode === 'free') {
      if (!email.trim() || !password.trim()) {
        setError("Veuillez saisir votre email et mot de passe.");
        return;
      }
      setSuccess("Connexion réussie...");
      setTimeout(() => {
        onActivate({
          key: 'FREE-TIER',
          licensee: email.split('@')[0], // Mock name
          type: 'free',
          expiryDate: '2099-12-31',
          activatedAt: new Date().toISOString().split('T')[0]
        });
      }, 1000);
      return;
    }

    if (authMode === 'premium') {
      if (!licensee.trim() || !quarryName.trim() || !permisNumber.trim()) {
        setError("Veuillez remplir les informations obligatoires de la carrière.");
        return;
      }
      if (!licenseKey.trim()) {
        setError("Veuillez saisir la clé de licence.");
        return;
      }

      const validation = validateLicenseKey(licenseKey, licensee, quarryName, location, permisNumber, dateOctroi);

      if (validation.isValid && validation.info) {
        setSuccess("Licence validée avec succès ! Démarrage de l'application...");
        setTimeout(() => {
          onActivate({
            ...validation.info!,
            activatedAt: new Date().toISOString().split('T')[0]
          });
        }, 1500);
      } else {
        setError(validation.error || "Clé de licence ou informations invalides.");
      }
    }
  };

  const handleGenerateKey = () => {
    if (!genName.trim()) {
      alert("Veuillez saisir un nom pour générer la clé.");
      return;
    }
    try {
      const key = generateLicenseKeyWithDate(genName, genType, genExpiry, genQuarryName, genLocation, genPermisNumber, genDateOctroi);
      setGeneratedKeyResult(key);
    } catch (e: any) {
      alert("Erreur: " + e.message);
    }
  };

  const handleApplyGeneratedKey = () => {
    if (generatedKeyResult) {
      setLicensee(genName);
      setQuarryName(genQuarryName);
      setLocation(genLocation);
      setPermisNumber(genPermisNumber);
      setDateOctroi(genDateOctroi);
      setLicenseKey(generatedKeyResult);
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      {/* Background ambient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-zinc-900/80 border-2 border-zinc-800 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden" id="activation-card">
        {/* Top styling bar */}
        <div className={`absolute top-0 left-0 w-full h-1 ${authMode === 'premium' ? 'bg-emerald-500' : authMode === 'free' ? 'bg-blue-500' : 'bg-zinc-500'}`}></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`mx-auto h-12 w-12 flex items-center justify-center text-black font-black text-xl mb-4 shadow-lg ${authMode === 'premium' ? 'bg-emerald-500 shadow-emerald-500/20' : authMode === 'free' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-zinc-300 shadow-zinc-500/20'}`}>
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter leading-none text-white">
            QUARRY_CORE<span className={authMode === 'premium' ? 'text-emerald-500' : authMode === 'free' ? 'text-blue-500' : 'text-zinc-500'}>.v1</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-2">
            Système d'Authentification
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-zinc-950/50 p-1 border border-zinc-800 mb-6 relative rounded">
          <button
            type="button"
            onClick={() => setAuthMode('guest')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[9px] font-black uppercase tracking-wider transition-colors rounded-sm z-10 ${authMode === 'guest' ? 'text-black bg-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <UserCircle2 className="h-4 w-4 mb-1" /> Invité
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('free')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[9px] font-black uppercase tracking-wider transition-colors rounded-sm z-10 ${authMode === 'free' ? 'text-white bg-blue-600' : 'text-zinc-500 hover:text-blue-400'}`}
          >
            <Mail className="h-4 w-4 mb-1" /> Gratuit
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('premium')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[9px] font-black uppercase tracking-wider transition-colors rounded-sm z-10 ${authMode === 'premium' ? 'text-black bg-emerald-500' : 'text-zinc-500 hover:text-emerald-400'}`}
          >
            <Gem className="h-4 w-4 mb-1" /> Premium
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-semibold flex items-start gap-2.5 mb-6 rounded-none animate-shake">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-start gap-2.5 mb-6 rounded-none">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleActivation} className="space-y-5">
          
          {authMode === 'guest' && (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Le mode <strong className="text-zinc-200">Invité</strong> vous permet d'explorer l'application avec des fonctionnalités limitées. 
                Les sauvegardes et les exports professionnels sont désactivés.
              </p>
            </div>
          )}

          {authMode === 'free' && (
            <div className="space-y-4">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 text-center">Inscription / Connexion Gratuite</p>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Email ou Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex: contact@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
              <p className="text-[9px] text-zinc-500 text-center">Permet de sauvegarder vos scénarios sur cet appareil.</p>
            </div>
          )}

          {authMode === 'premium' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-500" /> Titulaire (Société)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entreprise SARL"
                  value={licensee}
                  onChange={(e) => setLicensee(e.target.value)}
                  className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Nom Carrière</label>
                  <input
                    type="text"
                    placeholder="Ex: Carrière Nord"
                    value={quarryName}
                    onChange={(e) => setQuarryName(e.target.value)}
                    className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Localisation</label>
                  <input
                    type="text"
                    placeholder="Ex: Wilaya"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Permis N°</label>
                  <input
                    type="text"
                    placeholder="Ex: 001/2026"
                    value={permisNumber}
                    onChange={(e) => setPermisNumber(e.target.value)}
                    className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Date d'Octroi
                  </label>
                  <input
                    type="date"
                    value={dateOctroi}
                    onChange={(e) => setDateOctroi(e.target.value)}
                    className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-emerald-500" /> Clé de Licence
                </label>
                <input
                  type="text"
                  placeholder="QCRY-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full bg-zinc-950 border-2 border-zinc-850 px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-400 placeholder-zinc-700 tracking-wider focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`w-full font-black uppercase tracking-wider text-xs py-3.5 transition duration-150 cursor-pointer flex items-center justify-center gap-2 border ${
              authMode === 'premium' 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 shadow-emerald-500/10 hover:shadow-emerald-500/20' 
                : authMode === 'free'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-blue-500/10 hover:shadow-blue-500/20'
                  : 'bg-zinc-200 hover:bg-white text-black border-zinc-400 shadow-zinc-500/10'
            }`}
          >
            <Unlock className="h-4 w-4" /> 
            {authMode === 'guest' ? 'Continuer sans compte' : authMode === 'free' ? 'Se connecter' : 'Activer la Licence Pro'}
          </button>
        </form>

        {/* Collapsible Developer/Admin Key Generator Panel */}
        {authMode === 'premium' && (
          <div className="mt-8 border border-zinc-800 bg-zinc-950/50">
            <button
              type="button"
              onClick={() => setShowGenerator(!showGenerator)}
              className="w-full px-4 py-2.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center justify-between hover:text-white transition"
            >
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-emerald-500 animate-spin-slow" />
                Générateur de Clés Premium
              </span>
              {showGenerator ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showGenerator && (
              <div className="p-4 border-t border-zinc-850 space-y-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Nom du licencié :</label>
                    <input
                      type="text"
                      value={genName}
                      onChange={(e) => setGenName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-semibold text-white focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Carrière :</label>
                      <input
                        type="text"
                        value={genQuarryName}
                        onChange={(e) => setGenQuarryName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-semibold text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Lieu :</label>
                      <input
                        type="text"
                        value={genLocation}
                        onChange={(e) => setGenLocation(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-semibold text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Permis N° :</label>
                      <input
                        type="text"
                        value={genPermisNumber}
                        onChange={(e) => setGenPermisNumber(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-semibold text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Date d'octroi :</label>
                      <input
                        type="date"
                        value={genDateOctroi}
                        onChange={(e) => setGenDateOctroi(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Type :</label>
                      <select
                        value={genType}
                        onChange={(e) => setGenType(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] text-white focus:outline-none font-semibold"
                      >
                        <option value="demo">Démo (30j)</option>
                        <option value="standard">Standard (1 an)</option>
                        <option value="enterprise">Entreprise (Illimité)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Expire :</label>
                      <input
                        type="date"
                        value={genExpiry}
                        onChange={(e) => setGenExpiry(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateKey}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-black uppercase tracking-wider py-2 transition"
                  >
                    Calculer la Clé
                  </button>

                  {generatedKeyResult && (
                    <div className="space-y-2 pt-2 border-t border-zinc-900">
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase">Clé générée :</label>
                      <div className="p-2 bg-zinc-900 border border-zinc-850 text-center font-mono text-[11px] text-emerald-400 font-bold select-all break-all tracking-wider">
                        {generatedKeyResult}
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyGeneratedKey}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black uppercase tracking-wider py-1.5 transition"
                      >
                        Appliquer au Formulaire
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer disclaimer */}
      <div className="mt-8 text-center text-[10px] text-zinc-600 font-mono tracking-tight flex items-center gap-1.5">
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Toutes les vérifications s'effectuent localement et de manière autonome.</span>
      </div>
    </div>
  );
};
