import React, { useState, useEffect } from 'react';
import { QuarryScenario, ProcessusCostData } from './types';
import { generateDefaultScenario } from './data/defaultTemplates';
import { calculateScenarioSummary } from './utils/calculations';
import { formatCurrency, formatCostPerTon, formatTonnage, formatVolume } from './utils/format';
import { DashboardView } from './components/DashboardView';
import { ProcessEditorView } from './components/ProcessEditorView';
import { ScenarioManagerView } from './components/ScenarioManagerView';
import { ActivationView } from './components/ActivationView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIAssistantView } from './components/AIAssistantView';
import { validateLicenseKey, LicenseInfo } from './utils/license';
import { t } from './utils/translations';
import { exportScenarioToExcel } from './utils/exportExcel';
import { 
  BarChart3, 
  Activity,
  Layers, 
  Truck, 
  Hammer, 
  PackageCheck, 
  Settings2, 
  FolderLock, 
  Printer, 
  Mail,
  Flame, 
  RefreshCcw,
  FileSpreadsheet,
  Lock,
  BookOpen,
  Calendar,
  DollarSign,
  Briefcase,
  Layers2,
  Menu,
  X,
  Brain,
  Lock,
  Unlock,
  Key,
  Share2,
  Send,
  Copy,
  Check,
  QrCode,
  Globe
} from 'lucide-react';


function ensureRequiredItems(sc: QuarryScenario): QuarryScenario {
  const updated = { ...sc };
  if (!updated.processus) return sc;
  
  if (!updated.densite) {
    updated.densite = 1.6;
  }
  if (!updated.unitePrincipale) {
    updated.unitePrincipale = 'T';
  }
  
  const ft = updated.processus.front_de_taille;
  if (ft) {
    if (!ft.modeAbattage) {
      ft.modeAbattage = 'explosif';
    }
    
    const mode = ft.modeAbattage;
    if (mode === 'mecanique') {
      // Mode mécanique : filtrer les éléments liés aux explosifs
      ft.machinesInternes = (ft.machinesInternes || []).filter(
        m => m.id !== 'm-ft-2' && !m.nom.toLowerCase().includes('foret')
      );
      ft.machinesExternes = (ft.machinesExternes || []).filter(
        m => m.id !== 'me-ft-1' && m.id !== 'me-ft-explosifs' && 
             !m.nom.toLowerCase().includes('minage') && !m.nom.toLowerCase().includes('explosif')
      );
      ft.personnel = (ft.personnel || []).filter(
        p => p.id !== 'p-ft-1' && !p.poste.toLowerCase().includes('mineur') && !p.poste.toLowerCase().includes('foreur')
      );
    } else {
      // Mode explosif : s'assurer que les éléments requis sont présents
      const ftExternes = ft.machinesExternes || [];
      if (!ftExternes.some(m => m.id === 'me-ft-explosifs')) {
        ftExternes.push({
          id: 'me-ft-explosifs',
          nom: "Achat d'explosifs (Cartouches, détonateurs)",
          typeTarif: 'mois',
          tarifUnitaire: 4500,
          quantiteTemps: 1
        });
      }
      if (!ftExternes.some(m => m.id === 'me-ft-1' || m.nom.toLowerCase().includes('minage'))) {
        ftExternes.push({
          id: 'me-ft-1',
          nom: "Prestation de Minage (Tir de mine sous-traité)",
          typeTarif: 'mois',
          tarifUnitaire: 8500,
          quantiteTemps: 1
        });
      }
      ft.machinesExternes = ftExternes;

      if (!ft.machinesInternes.some(m => m.id === 'm-ft-2' || m.nom.toLowerCase().includes('foret'))) {
        ft.machinesInternes.push({
          id: 'm-ft-2',
          nom: "Foret d'abattage Atlas Copco",
          heuresUtilisation: 80,
          consommationHoraire: 24,
          prixGasoilLitre: sc.prixGasoilMoyen || 1.65,
          piecesRechangeCout: 1800,
          valeurAchat: 180000,
          dureeAmortissementAns: 5,
          isSaisieDirecte: false
        });
      }

      if (!ft.personnel.some(p => p.id === 'p-ft-1' || p.poste.toLowerCase().includes('mineur') || p.poste.toLowerCase().includes('foreur'))) {
        ft.personnel.push({
          id: 'p-ft-1',
          nom: 'Foreur / Mineur',
          poste: 'Mineur Qualifié',
          nombre: 1,
          salaireBaseMensuel: 2400,
          chargesSocialesPourcent: 42,
          repasMensuelParPers: 220,
          hebergementMensuelParPers: 450,
          isSaisieDirecte: false
        });
      }
    }

    // Assurer le BRH dans les deux modes (souvent utilisé, mais obligatoire pour mécanique)
    const ftExternes = ft.machinesExternes || [];
    if (!ftExternes.some(m => m.id === 'me-ft-location' || m.nom.toLowerCase().includes('brh'))) {
      ftExternes.push({
        id: 'me-ft-location',
        nom: "Location d'un brise-roche hydraulique (BRH)",
        typeTarif: 'jour',
        tarifUnitaire: 380,
        quantiteTemps: 6
      });
    }
    ft.machinesExternes = [...ftExternes];
  }

  // 2. Transport external machine
  const trExternes = updated.processus.transport?.machinesExternes || [];
  if (trExternes.length === 0) {
    trExternes.push({
      id: 'me-tr-1',
      nom: 'Dumper articulé de secours (location)',
      typeTarif: 'jour',
      tarifUnitaire: 450,
      quantiteTemps: 5
    });
  }
  updated.processus.transport.machinesExternes = [...trExternes];

  // 3. Concassage external machine
  const coExternes = updated.processus.concassage?.machinesExternes || [];
  if (!coExternes.some(m => m.id === 'me-co-loc')) {
    coExternes.push({
      id: 'me-co-loc',
      nom: "Location d'un convoyeur sauterelle mobile",
      typeTarif: 'mois',
      tarifUnitaire: 1200,
      quantiteTemps: 1
    });
  }
  updated.processus.concassage.machinesExternes = [...coExternes];

  // 4. Chargement external machine
  const chExternes = updated.processus.chargement?.machinesExternes || [];
  if (!chExternes.some(m => m.id === 'me-ch-loc')) {
    chExternes.push({
      id: 'me-ch-loc',
      nom: "Location de secours - Chargeuse articulée",
      typeTarif: 'jour',
      tarifUnitaire: 350,
      quantiteTemps: 4
    });
  }
  updated.processus.chargement.machinesExternes = [...chExternes];

  // 5. Moyens généraux external machine
  const mgExternes = updated.processus.moyens_generaux?.machinesExternes || [];
  if (mgExternes.length === 0) {
    mgExternes.push({
      id: 'me-mg-1',
      nom: "Location d'Algeco Bureaux administratifs",
      typeTarif: 'mois',
      tarifUnitaire: 850,
      quantiteTemps: 1
    });
  }
  updated.processus.moyens_generaux.machinesExternes = [...mgExternes];

  return updated;
}

export default function App() {
  // Charger le scénario par défaut
  const [scenario, setScenario] = useState<QuarryScenario>(() => {
    // Essayer de charger le dernier scénario actif depuis localStorage
    try {
      const activeId = localStorage.getItem('quarry_active_scenario_id');
      if (activeId) {
        const saved = localStorage.getItem(`quarry_scenario_${activeId}`);
        if (saved) {
          return ensureRequiredItems(JSON.parse(saved) as QuarryScenario);
        }
      }
    } catch (e) {
      console.error("Erreur de restauration de session", e);
    }
    return ensureRequiredItems(generateDefaultScenario());
  });

  // État de la licence
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(() => {
    try {
      const saved = localStorage.getItem('quarry_license_info');
      if (saved) {
        const parsed = JSON.parse(saved) as LicenseInfo;
        const validation = validateLicenseKey(parsed.key, parsed.licensee);
        if (validation.isValid) {
          return parsed;
        } else {
          localStorage.removeItem('quarry_license_info');
        }
      }
    } catch (e) {
      console.error("Erreur de chargement de licence", e);
    }
    return null;
  });

  const handleActivateLicense = (info: LicenseInfo) => {
    try {
      localStorage.setItem('quarry_license_info', JSON.stringify(info));
      setLicenseInfo(info);
    } catch (e) {
      console.error("Erreur d'enregistrement de licence", e);
    }
  };

  const handleDeactivateLicense = () => {
    if (window.confirm("Voulez-vous vraiment désactiver cette licence ? Vous retournerez à l'écran de verrouillage.")) {
      try {
        localStorage.removeItem('quarry_license_info');
        setLicenseInfo(null);
      } catch (e) {
        console.error("Erreur de désactivation de licence", e);
      }
    }
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'front_de_taille' | 'transport' | 'concassage' | 'chargement' | 'moyens_generaux' | 'scenarios' | 'ia_assistant'>('dashboard');
  const [showGlobalSettings, setShowGlobalSettings] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [shareMenuOpen, setShareMenuOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileShared, setMobileShared] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Sauvegarde automatique du scénario actif
  useEffect(() => {
    try {
      localStorage.setItem(`quarry_scenario_${scenario.id}`, JSON.stringify(scenario));
      localStorage.setItem('quarry_active_scenario_id', scenario.id);
    } catch (e) {
      console.error("Erreur d'auto-sauvegarde", e);
    }
  }, [scenario]);

  // Recalculateur global pour le résumé actuel
  const summary = calculateScenarioSummary(scenario);

  // Actions de mise à jour de données
  const handleUpdateProcessus = (updatedProcessus: ProcessusCostData) => {
    setScenario(prev => ({
      ...prev,
      processus: {
        ...prev.processus,
        [updatedProcessus.id]: updatedProcessus
      }
    }));
  };

  const handleSaveCurrentScenario = (customName: string) => {
    setScenario(prev => {
      const updated = {
        ...prev,
        nom: customName,
        dateCreation: new Date().toLocaleDateString('fr-FR')
      };
      // Sauvegarder immédiatement
      localStorage.setItem(`quarry_scenario_${updated.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleLoadScenario = (loaded: QuarryScenario) => {
    setScenario(ensureRequiredItems(loaded));
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };

  // Aligner le prix du gasoil pour TOUTES les machines internes d'un seul coup
  const handleSyncGasoilPrice = () => {
    const updated = { ...scenario };
    const keys: ('front_de_taille' | 'transport' | 'concassage' | 'chargement' | 'moyens_generaux')[] = [
      'front_de_taille',
      'transport',
      'concassage',
      'chargement',
      'moyens_generaux'
    ];

    keys.forEach(key => {
      updated.processus[key].machinesInternes = updated.processus[key].machinesInternes.map(m => ({
        ...m,
        prixGasoilLitre: scenario.prixGasoilMoyen
      }));
    });

    setScenario(updated);
    alert(`Le prix du gasoil de toutes les machines internes a été synchronisé à ${scenario.prixGasoilMoyen} ${scenario.devise}/L !`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert("L'image est trop grande (max. 800 Ko). Veuillez choisir un logo plus compressé ou plus léger.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScenario(prev => ({ ...prev, logoUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setScenario(prev => ({ ...prev, logoUrl: undefined }));
  };

  // Imprimer
  const handlePrint = () => {
    window.print();
  };

  // Helper to generate text report for email, WhatsApp, Telegram, Clipboard
  const generateReportText = () => {
    const summary = calculateScenarioSummary(scenario);
    const dens = scenario.densite || 1.6;
    const vol = Math.round(scenario.productionTonnage / dens);
    
    let text = `*RAPPORT ANALYTIQUE DE PRIX DE REVIENT*\n`;
    text += `*Entreprise :* ${licenseInfo?.licensee || scenario.nomEntreprise || 'Non spécifiée'}\n`;
    if (licenseInfo?.quarryName) text += `*Carrière :* ${licenseInfo.quarryName}\n`;
    text += `*Localisation :* ${licenseInfo?.location || scenario.localisation || 'Non spécifiée'}\n`;
    if (licenseInfo?.permisNumber) text += `*Permis N° :* ${licenseInfo.permisNumber}\n`;
    if (licenseInfo?.dateOctroi) text += `*Date d'octroi :* ${licenseInfo.dateOctroi}\n`;
    text += `*Période :* ${scenario.periodeConcerne || 'Non spécifiée'} (${scenario.periode === 'hebdomadaire' ? 'Hebdomadaire' : scenario.periode === 'mensuel' ? 'Mensuel' : 'Annuel'})\n`;
    text += `*Date :* ${scenario.dateCreation}\n\n`;
    
    text += `*--- PROD ET PARAMÈTRES ---*\n`;
    text += `• Production (Tonnes) : ${scenario.productionTonnage.toLocaleString('fr-FR')} T\n`;
    text += `• Production (Volume) : ${vol.toLocaleString('fr-FR')} m³\n`;
    text += `• Masse Volumique : ${dens} T/m³\n`;
    text += `• Prix de vente moyen : ${scenario.prixVenteMoyenParTonne.toLocaleString('fr-FR')} ${scenario.devise}/T (${(scenario.prixVenteMoyenParTonne * dens).toLocaleString('fr-FR')} ${scenario.devise}/m³)\n\n`;
    
    text += `*--- RÉSULTATS GLOBAUX ---*\n`;
    text += `• Coût global de revient : ${summary.totalGlobal.toLocaleString('fr-FR')} ${scenario.devise}\n`;
    
    const costPerT = summary.coutParTonneGlobal;
    const costPerM = costPerT * dens;
    text += `• Coût moyen de revient : ${costPerT.toFixed(2)} ${scenario.devise}/T (${costPerM.toFixed(2)} ${scenario.devise}/m³)\n`;
    text += `• Chiffre d'affaires estimé : ${summary.totalVentes.toLocaleString('fr-FR')} ${scenario.devise}\n`;
    text += `• Marge d'exploitation : ${summary.margeGlobale.toLocaleString('fr-FR')} ${scenario.devise} (${summary.margePourcent.toFixed(1)}%)\n\n`;
    
    text += `*--- RÉPARTITION PAR RUBRIQUE ---*\n`;
    summary.items.forEach(item => {
      const uCost = item.coutParTonne;
      const uCostM = uCost * dens;
      text += `• ${item.nom} : ${item.totalCout.toLocaleString('fr-FR')} ${scenario.devise} (${item.pourcentage.toFixed(1)}%), soit ${uCost.toFixed(2)} ${scenario.devise}/T (${uCostM.toFixed(2)} ${scenario.devise}/m³)\n`;
    });
    
    if (scenario.observations) {
      text += `\n*--- OBSERVATIONS ---*\n`;
      text += `${scenario.observations}\n`;
    }
    
    text += `\n_Généré par QuarryCore.v1_`;
    return text;
  };

  const handleSendEmail = () => {
    const bodyText = generateReportText().replace(/\*/g, ''); // Remove markdown bold for standard emails
    const subject = encodeURIComponent(`Rapport Analytique de Prix de Revient - ${scenario.nomEntreprise || 'Exploitation Carrière'}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
    setShareMenuOpen(false);
  };

  const handleSendWhatsApp = () => {
    const text = generateReportText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShareMenuOpen(false);
  };

  const handleSendTelegram = () => {
    const text = generateReportText();
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://quarrycore.app')}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShareMenuOpen(false);
  };

  const handleCopyToClipboard = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShareMenuOpen(false);
  };

  const handleShareToMobile = async () => {
    try {
      const savedAiReport = localStorage.getItem(`quarry_ai_analysis_${scenario.id}`);
      const response = await fetch('/api/scenario/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          summary,
          aiReport: savedAiReport,
        }),
      });
      if (response.ok) {
        setMobileShared(true);
        setTimeout(() => setMobileShared(false), 2000);
      } else {
        alert("Erreur de partage avec le serveur.");
      }
    } catch (e) {
      console.error(e);
      alert("Impossible de se connecter au serveur pour le partage mobile.");
    }
    setShareMenuOpen(false);
  };

  if (!licenseInfo) {
    return <ActivationView onActivate={handleActivateLicense} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 relative overflow-hidden" id="app-root" dir={scenario.lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background ambient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-2/3 w-[450px] h-[450px] bg-violet-600/8 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" style={{ animationDelay: '4s' }}></div>
      
      {/* Header Bar */}
      <header className="bg-zinc-950/40 backdrop-blur-md text-white py-4 px-6 sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800/80 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 hover:bg-zinc-800 rounded-xl transition border border-zinc-700/60"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-extrabold text-lg shadow-md shadow-emerald-500/5 rounded-xl">
            ⚒️
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none text-white">QUARRY_CORE<span className="text-emerald-400">.v1</span></h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{scenario.nom}</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={scenario.lang || 'fr'}
            onChange={e => setScenario(prev => ({ ...prev, lang: e.target.value as 'fr' | 'en' | 'ar' | 'es' }))}
            className="bg-zinc-900 text-white border border-zinc-800 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer print:hidden"
          >
            <option value="fr">🇫🇷 FR</option>
            <option value="en">🇬🇧 EN</option>
            <option value="ar">🇩🇿 AR</option>
            <option value="es">🇪🇸 ES</option>
          </select>

          {/* Mobile QR Access */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-1.5 bg-zinc-900/60 hover:bg-zinc-850/60 border border-zinc-800/80 rounded-xl text-zinc-300 hover:text-white transition flex items-center gap-1 cursor-pointer print:hidden animate-pulse"
            title={t('qr_btn', scenario.lang)}
          >
            <QrCode className="h-4 w-4 text-emerald-450" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">{t('qr_btn', scenario.lang)}</span>
          </button>

          <button
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition rounded-xl border ${
              showGlobalSettings 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 font-extrabold shadow-sm' 
                : 'bg-zinc-900/60 hover:bg-zinc-800/60 text-zinc-300 border-zinc-800/80'
            }`}
            id="toggle-settings-bar"
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('global_settings', scenario.lang)}</span>
          </button>

          <button
            onClick={() => {
              if (licenseInfo?.type === 'guest') {
                alert("L'impression PDF n'est pas disponible en mode Invité.");
                return;
              }
              handlePrint();
            }}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition rounded-xl ${
              licenseInfo?.type === 'guest'
                ? 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/40 cursor-not-allowed'
                : 'bg-zinc-900/60 hover:bg-zinc-800/60 text-zinc-300 border border-zinc-800/80'
            }`}
            title={licenseInfo?.type === 'guest' ? 'Non disponible en mode invité' : ''}
          >
            {licenseInfo?.type === 'guest' ? <Lock className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
            <span className="hidden sm:inline">{t('print_pdf', scenario.lang)}</span>
          </button>

          <button
            onClick={() => {
              if (licenseInfo?.type === 'guest' || licenseInfo?.type === 'free') {
                alert("L'export Excel est réservé à la version Premium.");
                return;
              }
              exportScenarioToExcel(scenario);
            }}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition rounded-xl ${
              licenseInfo?.type === 'guest' || licenseInfo?.type === 'free'
                ? 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/40 cursor-not-allowed'
                : 'bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-400 border border-emerald-500/30'
            }`}
            title={licenseInfo?.type === 'guest' || licenseInfo?.type === 'free' ? 'Version Premium requise' : ''}
          >
            {(licenseInfo?.type === 'guest' || licenseInfo?.type === 'free') ? <Lock className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {/* Share Dropdown Button */}
          <div className="relative print:hidden">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className={`bg-zinc-900/60 hover:bg-zinc-800/60 text-zinc-300 border border-zinc-800/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition rounded-xl ${
                shareMenuOpen ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : ''
              }`}
              id="btn-share-report"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('share_report', scenario.lang)}</span>
            </button>
            
            {shareMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setShareMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-2 shadow-2xl shadow-black/80 z-50 backdrop-blur-xl animate-fade-in">
                  
                  {/* Share by Email */}
                  <button
                    onClick={handleSendEmail}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition text-left"
                  >
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span>{t('send_email', scenario.lang)}</span>
                  </button>
                  
                  {/* Share by WhatsApp */}
                  <button
                    onClick={handleSendWhatsApp}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition text-left"
                  >
                    <Send className="h-4 w-4 text-emerald-400" />
                    <span>{t('share_whatsapp', scenario.lang)}</span>
                  </button>
                  
                  {/* Share by Telegram */}
                  <button
                    onClick={handleSendTelegram}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition text-left"
                  >
                    <Send className="h-4 w-4 text-sky-400" />
                    <span>{t('share_telegram', scenario.lang)}</span>
                  </button>
                  
                  <div className="border-t border-zinc-900 my-1.5" />

                  {/* Share to Mobile */}
                  <button
                    onClick={handleShareToMobile}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition text-left"
                  >
                    {mobileShared ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <span className="text-sm">📱</span>
                    )}
                    <span>{mobileShared ? 'Partagé !' : 'Partager pour mobile'}</span>
                  </button>

                  <div className="border-t border-zinc-900 my-1.5" />
                  
                  {/* Copy to Clipboard */}
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition text-left"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-zinc-400" />
                    )}
                    <span>{copied ? 'Copié !' : t('copy_report', scenario.lang)}</span>
                  </button>
                  
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main layout container */}
      <div className="flex-1 flex relative">
        
        {/* Left Side Navigation Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 bg-zinc-950/40 backdrop-blur-md border-r border-zinc-800/60 p-5 flex flex-col justify-between z-30 print:hidden shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:block'}
        `} id="main-sidebar">
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">{t('main_menu', scenario.lang)}</span>
              <nav className="space-y-2">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition rounded-xl border ${
                    activeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border-emerald-500/30 font-extrabold shadow-md shadow-emerald-500/5'
                      : 'text-zinc-400 bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-900/60 hover:border-emerald-500/20 hover:text-white'
                  }`}
                  id="nav-btn-dashboard"
                >
                  <BarChart3 className="h-4.5 w-4.5" />
                  {t('dashboard', scenario.lang)}
                </button>
                <button
                  onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition rounded-xl border ${
                    activeTab === 'analytics'
                      ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border-emerald-500/30 font-extrabold shadow-md shadow-emerald-500/5'
                      : 'text-zinc-400 bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-900/60 hover:border-emerald-500/20 hover:text-white'
                  }`}
                  id="nav-btn-analytics"
                >
                  <Activity className="h-4.5 w-4.5" />
                  Analyses & Graphiques
                </button>
                <button
                  onClick={() => { setActiveTab('scenarios'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition rounded-xl border ${
                    activeTab === 'scenarios'
                      ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border-emerald-500/30 font-extrabold shadow-md shadow-emerald-500/5'
                      : 'text-zinc-400 bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-900/60 hover:border-emerald-500/20 hover:text-white'
                  }`}
                  id="nav-btn-scenarios"
                >
                  <FolderLock className="h-4.5 w-4.5" />
                  {t('scenario_manager', scenario.lang)}
                </button>
                <button
                  onClick={() => { setActiveTab('ia_assistant'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition rounded-xl border ${
                    activeTab === 'ia_assistant'
                      ? 'bg-gradient-to-r from-purple-500/15 to-purple-500/5 text-purple-400 border-purple-500/30 font-extrabold shadow-md shadow-purple-500/5'
                      : 'text-zinc-400 bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-900/60 hover:border-purple-500/20 hover:text-white'
                  }`}
                  id="nav-btn-ia-assistant"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="h-4.5 w-4.5" />
                    <span>{t('ai_audit', scenario.lang)}</span>
                  </div>
                  <span className="text-[8px] bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold px-1.5 py-0.5 rounded-full shrink-0">Nouveau</span>
                </button>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition rounded-xl border text-amber-400 bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/40 hover:border-amber-500/50 hover:text-amber-300 shadow-md shadow-amber-500/5`}
                  id="nav-btn-marketplace"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4.5 w-4.5" />
                    <span>BTP & Mine Market</span>
                  </div>
                  <span className="text-[8px] bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold px-1.5 py-0.5 rounded-full shrink-0">BETA</span>
                </a>
              </nav>
            </div>
 
            {/* Production categories */}
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">{t('production_sections', scenario.lang)}</span>
              <nav className="space-y-2">
                {[
                  { id: 'front_de_taille', label: t('front_de_taille', scenario.lang), desc: t('front_de_taille_desc', scenario.lang), icon: <Flame className="h-4 w-4" /> },
                  { id: 'transport', label: t('transport', scenario.lang), desc: t('transport_desc', scenario.lang), icon: <Truck className="h-4 w-4" /> },
                  { id: 'concassage', label: t('concassage', scenario.lang), desc: t('concassage_desc', scenario.lang), icon: <Hammer className="h-4 w-4" /> },
                  { id: 'chargement', label: t('chargement', scenario.lang), desc: t('chargement_desc', scenario.lang), icon: <PackageCheck className="h-4 w-4" /> },
                  { id: 'moyens_generaux', label: t('moyens_generaux', scenario.lang), desc: t('moyens_generaux_desc', scenario.lang), icon: <Briefcase className="h-4 w-4" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }}
                    className={`w-full text-left p-4 rounded-xl border transition flex flex-col ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border-emerald-500/30 font-bold shadow-md shadow-emerald-500/5'
                        : 'text-zinc-400 bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-900/60 hover:border-emerald-500/20 hover:text-white'
                    }`}
                    id={`nav-btn-${item.id}`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-semibold mt-1 block tracking-tight ${activeTab === item.id ? 'text-emerald-400/90' : 'text-zinc-500'}`}>{item.desc}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
 
          {/* Quick Stats Widget in Sidebar */}
          <div className="pt-4 border-t border-zinc-850 mt-6 space-y-2.5 text-xs font-medium" id="sidebar-stats-widget">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('current_cost', scenario.lang)}</span>
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl space-y-2 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-[10px] uppercase font-semibold">{t('total', scenario.lang)} :</span>
                <span className="font-bold text-white">{formatCurrency(summary.totalGlobal, scenario.devise)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-[10px] uppercase font-semibold">{t('tonne', scenario.lang)} :</span>
                <span className="font-bold text-emerald-400 text-sm">{formatCostPerTon(summary.coutParTonneGlobal, scenario.devise)}</span>
              </div>
            </div>
          </div>
 
          {/* License Widget */}
          {licenseInfo && (
            <div className="pt-4 border-t border-zinc-850 mt-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">{t('license_active', scenario.lang)}</span>
              <div className="bg-zinc-900/35 border border-zinc-800/60 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">
                    <Key className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-[11px] truncate leading-tight">{licenseInfo.licensee}</div>
                    <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">
                      {licenseInfo.type === 'enterprise' ? 'Entreprise' : licenseInfo.type === 'standard' ? 'Standard' : 'Démo'}
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-zinc-550 font-mono flex items-center justify-between border-t border-zinc-850 pt-2 mt-2">
                  <span>Expire : {licenseInfo.expiryDate}</span>
                  <button
                    onClick={handleDeactivateLicense}
                    className="text-[9px] text-rose-450 hover:text-rose-350 transition hover:underline cursor-pointer"
                  >
                    Désactiver
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6" id="main-content-panel">
          
          {/* Top Global Parameter Editor Bar */}
          {showGlobalSettings && (
            <div className="bg-zinc-900/50 backdrop-blur-md text-white rounded-2xl p-6 border border-zinc-800/80 flex flex-col xl:flex-row gap-6 print:hidden shadow-xl shadow-black/20" id="global-settings-panel">
              {/* Card 1: Industrial Settings */}
              <div className="flex-1 space-y-4">
                <div className="border-b border-zinc-800/80 pb-2">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    ⚙️ {t('industrial_settings', scenario.lang)}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Unité Principale */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      📊 Unité Principale
                    </label>
                    <select
                      value={scenario.unitePrincipale || 'T'}
                      onChange={e => setScenario(prev => ({ ...prev, unitePrincipale: e.target.value as 'T' | 'm3' }))}
                      className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none rounded-lg"
                    >
                      <option value="T">Tonnes (T)</option>
                      <option value="m3">Mètres cubes (m³)</option>
                    </select>
                  </div>

                  {/* Tonnage */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Tonnage Produit (T)
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <input
                        type="number"
                        min="1"
                        value={scenario.productionTonnage}
                        onChange={e => {
                          const valT = Math.max(1, Number(e.target.value));
                          const dens = scenario.densite || 1.6;
                          setScenario(prev => ({
                            ...prev,
                            productionTonnage: valT,
                            productionM3: Math.round(valT / dens)
                          }));
                        }}
                        className="w-full bg-transparent px-3 py-1.5 text-xs font-mono font-bold focus:outline-none border-none"
                      />
                      <span className="bg-zinc-900 border-l border-zinc-800 px-3 text-[10px] font-black text-zinc-400 flex items-center">
                        T
                      </span>
                    </div>
                  </div>

                  {/* Volume (m³) */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      ⛏️ Volume Produit (m³)
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <input
                        type="number"
                        min="1"
                        value={Math.round(scenario.productionTonnage / (scenario.densite || 1.6))}
                        onChange={e => {
                          const valM3 = Math.max(1, Number(e.target.value));
                          const dens = scenario.densite || 1.6;
                          setScenario(prev => ({
                            ...prev,
                            productionTonnage: Math.round(valM3 * dens),
                            productionM3: valM3
                          }));
                        }}
                        className="w-full bg-transparent px-3 py-1.5 text-xs font-mono font-bold focus:outline-none border-none"
                      />
                      <span className="bg-zinc-900 border-l border-zinc-800 px-3 text-[10px] font-black text-zinc-400 flex items-center">
                        m³
                      </span>
                    </div>
                  </div>

                  {/* Masse Volumique / Densité */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      ⚖️ Masse Volumique (Densité)
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        value={scenario.densite || 1.6}
                        onChange={e => {
                          const newDens = Math.max(0.1, Number(e.target.value));
                          setScenario(prev => ({
                            ...prev,
                            densite: newDens,
                            productionM3: Math.round(prev.productionTonnage / newDens)
                          }));
                        }}
                        className="w-full bg-transparent px-3 py-1.5 text-xs font-mono font-bold focus:outline-none border-none"
                      />
                      <span className="bg-zinc-900 border-l border-zinc-800 px-3 text-[10px] font-black text-zinc-400 flex items-center whitespace-nowrap">
                        T/m³
                      </span>
                    </div>
                  </div>

                  {/* Périodicité */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">{t('calculation_period', scenario.lang)}</label>
                    <select
                      value={scenario.periode}
                      onChange={e => setScenario(prev => ({ ...prev, periode: e.target.value as 'hebdomadaire' | 'mensuel' | 'annuel' }))}
                      className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none rounded-lg"
                    >
                      <option value="hebdomadaire">{t('weekly_calc', scenario.lang)}</option>
                      <option value="mensuel">{t('monthly_calc', scenario.lang)}</option>
                      <option value="annuel">{t('annual_calc', scenario.lang)}</option>
                    </select>
                  </div>

                  {/* Prix Vente */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> {t('avg_sales_price', scenario.lang)}
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={scenario.prixVenteMoyenParTonne}
                        onChange={e => setScenario(prev => ({ ...prev, prixVenteMoyenParTonne: Math.max(0, Number(e.target.value)) }))}
                        className="w-full bg-transparent px-3 py-1.5 text-xs font-mono font-bold focus:outline-none border-none"
                      />
                      <span className="bg-zinc-900 border-l border-zinc-800 px-3 text-[10px] font-black text-zinc-400 flex items-center">
                        {scenario.devise}/T
                      </span>
                    </div>
                  </div>

                  {/* Devise */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">{t('display_currency', scenario.lang)}</label>
                    <select
                      value={scenario.devise}
                      onChange={e => setScenario(prev => ({ ...prev, devise: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none rounded-lg"
                    >
                      <option value="€">Euro (€)</option>
                      <option value="DA">Dinar Algérien (DA)</option>
                      <option value="DA (Dinars)">DA (Dinars)</option>
                      <option value="$">Dollar ($)</option>
                      <option value="CFA">Franc CFA (CFA)</option>
                      <option value="DH">Dirham (DH)</option>
                    </select>
                  </div>

                  {/* Gasoil */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      ⛽ {t('avg_fuel_price', scenario.lang)}
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={scenario.prixGasoilMoyen}
                        onChange={e => setScenario(prev => ({ ...prev, prixGasoilMoyen: Math.max(0.01, Number(e.target.value)) }))}
                        className="w-full bg-transparent px-3 py-1.5 text-xs font-mono font-bold focus:outline-none border-none"
                      />
                      <span className="bg-zinc-900 border-l border-zinc-800 px-3 text-[10px] font-black text-zinc-400 flex items-center whitespace-nowrap">
                        {scenario.devise}/L
                      </span>
                    </div>
                  </div>


                </div>
              </div>

              {/* Card 2: Branding & Identification */}
              <div className="flex-1 space-y-4 border-t xl:border-t-0 xl:border-l border-zinc-800/80 pt-6 xl:pt-0 xl:pl-6">
                <div className="border-b border-zinc-800/80 pb-2">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    🏢 {t('identification_reports', scenario.lang)}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nom Entreprise */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-500" /> {t('company_name', scenario.lang)}</label>
                    <input
                      type="text"
                      value={licenseInfo?.licensee || scenario.nomEntreprise || ''}
                      readOnly
                      className="w-full bg-zinc-900/50 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none rounded-lg cursor-not-allowed"
                    />
                  </div>

                  {/* Nom Carrière */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-500" /> {t('quarry_name', scenario.lang)}</label>
                    <input
                      type="text"
                      value={licenseInfo?.quarryName || ''}
                      readOnly
                      className="w-full bg-zinc-900/50 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none rounded-lg cursor-not-allowed"
                    />
                  </div>

                  {/* Localisation */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-500" /> {t('location', scenario.lang)}</label>
                    <input
                      type="text"
                      value={licenseInfo?.location || scenario.localisation || ''}
                      readOnly
                      className="w-full bg-zinc-900/50 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none rounded-lg cursor-not-allowed"
                    />
                  </div>

                  {/* Permis Number */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-500" /> {t('permis_number', scenario.lang)}</label>
                    <input
                      type="text"
                      value={licenseInfo?.permisNumber || ''}
                      readOnly
                      className="w-full bg-zinc-900/50 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none rounded-lg cursor-not-allowed font-mono"
                    />
                  </div>

                  {/* Date d'octroi */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-500" /> {t('date_octroi', scenario.lang)}</label>
                    <input
                      type="date"
                      value={licenseInfo?.dateOctroi || ''}
                      readOnly
                      className="w-full bg-zinc-900/50 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none rounded-lg cursor-not-allowed font-mono"
                    />
                  </div>

                  {/* Période Concernée */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5">{t('period_concerned', scenario.lang)}</label>
                    <input
                      type="text"
                      value={scenario.periodeConcerne || ''}
                      placeholder={t('period_placeholder', scenario.lang)}
                      onChange={e => setScenario(prev => ({ ...prev, periodeConcerne: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3 py-1.5 text-xs font-bold text-white focus:outline-none rounded-lg"
                    />
                  </div>

                  {/* Substance Exploitée */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5">{t('substance', scenario.lang)}</label>
                    <input
                      type="text"
                      value={scenario.substance || ''}
                      placeholder={t('substance_placeholder', scenario.lang)}
                      onChange={e => setScenario(prev => ({ ...prev, substance: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3 py-1.5 text-xs font-bold text-white focus:outline-none rounded-lg"
                    />
                  </div>

                  {/* Destination du Produit */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5">{t('destination', scenario.lang)}</label>
                    <input
                      type="text"
                      value={scenario.destination || ''}
                      placeholder={t('destination_placeholder', scenario.lang)}
                      onChange={e => setScenario(prev => ({ ...prev, destination: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-850 px-3 py-1.5 text-xs font-bold text-white focus:outline-none rounded-lg"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider mb-1.5">{t('company_logo', scenario.lang)}</label>
                    {scenario.logoUrl ? (
                      <div className="flex items-center justify-between gap-3 bg-zinc-950/60 p-1.5 border border-zinc-800 rounded-lg h-[34px]">
                        <img src={scenario.logoUrl} alt="Logo" className="h-6 max-w-[90px] object-contain rounded" />
                        <button
                          onClick={handleRemoveLogo}
                          className="text-rose-500 hover:text-rose-450 p-1 text-[10px] font-bold cursor-pointer hover:bg-rose-500/10 rounded-md transition"
                        >
                          {t('remove_logo', scenario.lang)}
                        </button>
                      </div>
                    ) : (
                      <div className="relative border border-dashed border-zinc-700 hover:border-emerald-500/50 bg-zinc-950 p-2 rounded-lg flex items-center justify-center cursor-pointer transition h-[34px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('upload_logo', scenario.lang)}</span>
                      </div>
                    )}
                  </div>

                  {/* Observations / Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      📝 Observations & Notes d'exploitation (pannes, arrêts, absences...)
                    </label>
                    <textarea
                      value={scenario.observations || ''}
                      placeholder="Ex: Panne excavatrice 3h le 12/07, absence de 2 conducteurs, retards de livraison de pièces..."
                      onChange={e => setScenario(prev => ({ ...prev, observations: e.target.value }))}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-bold text-white focus:outline-none rounded-lg resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Printable Report Header (Only visible when printing) */}
          <div className="hidden print:block border-b-2 border-slate-300 pb-5 mb-5">
            <div className="flex justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                {scenario.logoUrl && (
                  <img src={scenario.logoUrl} alt="Logo" className="h-14 max-w-[140px] object-contain" />
                )}
                <div>
                  {(licenseInfo?.licensee || scenario.nomEntreprise) ? (
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider leading-none mb-1">{licenseInfo?.licensee || scenario.nomEntreprise}</h2>
                  ) : (
                    <h2 className="text-xl font-black text-slate-900 leading-none mb-1">CALCULATEUR PRIX DE REVIENT</h2>
                  )}
                  {licenseInfo?.quarryName && (
                    <p className="text-xs text-slate-700 font-bold uppercase tracking-wider">{licenseInfo.quarryName}</p>
                  )}
                  {(licenseInfo?.location || scenario.localisation) && (
                    <p className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-wider">Lieu : {licenseInfo?.location || scenario.localisation}</p>
                  )}
                  {licenseInfo?.permisNumber && (
                    <div className="mt-1.5 flex gap-3 text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-fit">
                      <span>Permis N° : {licenseInfo.permisNumber}</span>
                      {licenseInfo?.dateOctroi && <span>Octroi : {licenseInfo.dateOctroi}</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-base font-black text-slate-800 uppercase tracking-wider leading-none mb-1">{t('cost_matrix', scenario.lang)}</h1>
                <p className="text-xs text-slate-500 font-mono">{t('scenario_manager', scenario.lang)} : {scenario.nom} | Date : {scenario.dateCreation}</p>
                {scenario.periodeConcerne && (
                  <div className="text-xs text-slate-600 font-bold mt-1">{t('period_concerned', scenario.lang)} : {scenario.periodeConcerne}</div>
                )}
                {(scenario.substance || scenario.destination) && (
                  <div className="text-[10px] text-slate-700 font-semibold uppercase mt-0.5 tracking-wider">
                    {scenario.substance && `${t('substance', scenario.lang)} : ${scenario.substance}`}
                    {scenario.substance && scenario.destination && ' | '}
                    {scenario.destination && `${t('destination', scenario.lang)} : ${scenario.destination}`}
                  </div>
                )}
                <div className="text-sm font-black text-emerald-700 mt-1">PROD : {formatTonnage(scenario.productionTonnage)} ({formatVolume(scenario.productionTonnage / (scenario.densite || 1.6))}) / {scenario.periode === 'hebdomadaire' ? t('weekly', scenario.lang) : scenario.periode === 'mensuel' ? t('monthly', scenario.lang) : t('annual', scenario.lang)}</div>
              </div>
            </div>
          </div>

          {/* Core App View Router */}
          {activeTab === 'dashboard' && (
            <DashboardView scenario={scenario} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView scenario={scenario} />
          )}

          {activeTab === 'scenarios' && (
            <ScenarioManagerView
              currentScenario={scenario}
              onLoadScenario={handleLoadScenario}
              onSaveCurrentScenario={handleSaveCurrentScenario}
            />
          )}

          {activeTab === 'ia_assistant' && (
            <AIAssistantView scenario={scenario} />
          )}

          {activeTab !== 'dashboard' && activeTab !== 'scenarios' && activeTab !== 'ia_assistant' && (
            <div className="space-y-6">
              {/* Process Description Header */}
              <div className="border-2 border-zinc-800 bg-zinc-900 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-zinc-950 text-emerald-500 border border-zinc-800">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      {t(activeTab as any, scenario.lang)}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {t(`${activeTab}_desc` as any, scenario.lang)}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-850 text-[11px] text-zinc-300 leading-normal flex gap-1.5 mt-4">
                  <BookOpen className="h-4.5 w-4.5 shrink-0 text-emerald-500 mt-0.5" />
                  <span>
                    {t('process_instructions', scenario.lang)}
                  </span>
                </div>
              </div>

              <ProcessEditorView
                processus={scenario.processus[activeTab]}
                periode={scenario.periode}
                productionTonnage={scenario.productionTonnage}
                onUpdateProcessus={handleUpdateProcessus}
                devise={scenario.devise}
                lang={scenario.lang}
                prixGasoilMoyen={scenario.prixGasoilMoyen}
              />
            </div>
          )}

          {/* Printable Notes (Only visible when printing) */}
          {scenario.observations && (
            <div className="hidden print:block border-t border-slate-350 pt-4 mt-6 print:break-inside-avoid">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Observations & Notes d'Exploitation :</h4>
              <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded-lg">{scenario.observations}</p>
            </div>
          )}

          {/* Printing disclaimer */}
          <div className="hidden print:block text-center text-[10px] text-slate-400 border-t border-slate-200 pt-8 mt-12 font-mono">
            Généré automatiquement par l'application Calculateur Prix de Revient Carrière. Sauvegardes stockées localement dans le navigateur.
          </div>

        </main>
      </div>

      {/* QR Mobile Connection Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          />

          <div className="relative bg-zinc-950 border border-zinc-800/80 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
            
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-white border border-zinc-800/60"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <QrCode className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-black text-white text-base uppercase tracking-wider">{t('qr_title', scenario.lang)}</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">{t('qr_desc', scenario.lang)}</p>
            </div>

            {/* QR image */}
            <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin.replace('localhost', '10.43.198.140'))}`} 
                alt="QR Code" 
                className="w-40 h-40"
              />
            </div>

            {/* Address display */}
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-3 text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">URL Address</p>
              <span className="text-xs font-bold font-mono text-emerald-400 select-all block break-all">{window.location.origin.replace('localhost', '10.43.198.140')}</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
