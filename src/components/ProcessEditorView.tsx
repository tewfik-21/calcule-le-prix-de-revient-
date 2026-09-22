import React, { useState } from 'react';
import { ProcessusCostData, MachineInterne, MachineExterne, PersonnelCharges, TaxeRubrique } from '../types';
import { formatCurrency, formatPercent } from '../utils/format';
import { calculateMachineInterneCout, calculateMachineExterneCout, calculatePersonnelCout, calculateTaxeCout } from '../utils/calculations';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Fuel, 
  Wrench, 
  Clock, 
  DollarSign, 
  Users, 
  Receipt, 
  Eye,
  Info,
  Layers,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { t } from '../utils/translations';

interface ProcessEditorViewProps {
  processus: ProcessusCostData;
  periode: 'hebdomadaire' | 'mensuel' | 'annuel';
  productionTonnage: number;
  onUpdateProcessus: (updated: ProcessusCostData) => void;
  devise: string;
  lang?: 'fr' | 'en' | 'ar' | 'es';
  prixGasoilMoyen?: number;
}

type TabType = 'interne' | 'externe' | 'personnel' | 'taxes';

const adjustProcessForAbattageMode = (
  process: ProcessusCostData,
  mode: 'explosif' | 'mecanique'
): ProcessusCostData => {
  const updated = { ...process, modeAbattage: mode };

  if (mode === 'mecanique') {
    // Mode mécanique : filtrer les engins et personnels liés aux explosifs
    updated.machinesInternes = (updated.machinesInternes || []).filter(
      m => m.id !== 'm-ft-2' && !m.nom.toLowerCase().includes('foret')
    );
    updated.machinesExternes = (updated.machinesExternes || []).filter(
      m => m.id !== 'me-ft-1' && m.id !== 'me-ft-explosifs' && 
           !m.nom.toLowerCase().includes('minage') && !m.nom.toLowerCase().includes('explosif')
    );
    updated.personnel = (updated.personnel || []).filter(
      p => p.id !== 'p-ft-1' && !p.poste.toLowerCase().includes('mineur') && !p.poste.toLowerCase().includes('foreur')
    );
  } else {
    // Mode explosif : rétablir les éléments standards d'explosifs
    const ftExternes = updated.machinesExternes || [];
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
    updated.machinesExternes = ftExternes;

    if (!updated.machinesInternes.some(m => m.id === 'm-ft-2' || m.nom.toLowerCase().includes('foret'))) {
      updated.machinesInternes.push({
        id: 'm-ft-2',
        nom: "Foret d'abattage Atlas Copco",
        heuresUtilisation: 80,
        consommationHoraire: 24,
        prixGasoilLitre: 1.65,
        piecesRechangeCout: 1800,
        valeurAchat: 180000,
        dureeAmortissementAns: 5,
        isSaisieDirecte: false
      });
    }

    if (!updated.personnel.some(p => p.id === 'p-ft-1' || p.poste.toLowerCase().includes('mineur') || p.poste.toLowerCase().includes('foreur'))) {
      updated.personnel.push({
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

  // Assurer le BRH dans les deux modes (obligatoire pour mécanique, utile pour explosif)
  const ftExternes = updated.machinesExternes || [];
  if (!ftExternes.some(m => m.id === 'me-ft-location' || m.nom.toLowerCase().includes('brh'))) {
    ftExternes.push({
      id: 'me-ft-location',
      nom: "Location d'un brise-roche hydraulique (BRH)",
      typeTarif: 'jour',
      tarifUnitaire: 380,
      quantiteTemps: 6
    });
  }
  updated.machinesExternes = [...ftExternes];

  return updated;
};

export const ProcessEditorView: React.FC<ProcessEditorViewProps> = ({
  processus,
  periode,
  productionTonnage,
  onUpdateProcessus,
  devise,
  lang,
  prixGasoilMoyen
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('interne');

  // État pour les formulaires d'édition/ajout
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulaire Machine Interne
  const [formInterne, setFormInterne] = useState<Partial<MachineInterne>>({
    nom: '',
    heuresUtilisation: 160,
    consommationHoraire: 20,
    prixGasoilLitre: 1.65,
    piecesRechangeCout: 2000,
    valeurAchat: 250000,
    dureeAmortissementAns: 5,
    isSaisieDirecte: false,
    gasoilCoutGlobal: 0,
    piecesRechangeGlobal: 0,
    amortissementGlobal: 0
  });

  // Formulaire Machine Externe
  const [formExterne, setFormExterne] = useState<Partial<MachineExterne>>({
    nom: '',
    typeTarif: 'jour',
    tarifUnitaire: 350,
    quantiteTemps: 10
  });

  // Formulaire Personnel
  const [formPersonnel, setFormPersonnel] = useState<Partial<PersonnelCharges>>({
    poste: '',
    nombre: 1,
    salaireBaseMensuel: 2000,
    chargesSocialesPourcent: 42,
    repasMensuelParPers: 220,
    hebergementMensuelParPers: 450,
    isSaisieDirecte: false,
    paieGlobal: 0,
    repasGlobal: 0,
    hebergementGlobal: 0
  });

  // Formulaire Taxes
  const [formTaxes, setFormTaxes] = useState<Partial<TaxeRubrique>>({
    nom: '',
    montantForfaitaire: 500,
    taxeParTonne: 0.10
  });

  // Réinitialiser les formulaires
  const resetFormInterne = () => {
    setFormInterne({
      nom: '',
      heuresUtilisation: 160,
      consommationHoraire: 20,
      prixGasoilLitre: 1.65,
      piecesRechangeCout: 2000,
      valeurAchat: 250000,
      dureeAmortissementAns: 5,
      isSaisieDirecte: false,
      gasoilCoutGlobal: 0,
      piecesRechangeGlobal: 0,
      amortissementGlobal: 0
    });
    setEditingId(null);
  };

  const resetFormExterne = () => {
    setFormExterne({
      nom: '',
      typeTarif: 'jour',
      tarifUnitaire: 350,
      quantiteTemps: 10
    });
    setEditingId(null);
  };

  const resetFormPersonnel = () => {
    setFormPersonnel({
      poste: '',
      nombre: 1,
      salaireBaseMensuel: 2000,
      chargesSocialesPourcent: 42,
      repasMensuelParPers: 220,
      hebergementMensuelParPers: 450,
      isSaisieDirecte: false,
      paieGlobal: 0,
      repasGlobal: 0,
      hebergementGlobal: 0
    });
    setEditingId(null);
  };

  const resetFormTaxes = () => {
    setFormTaxes({
      nom: '',
      montantForfaitaire: 500,
      taxeParTonne: 0.10
    });
    setEditingId(null);
  };

  // --- ACTIONS MACHINE INTERNE ---
  const handleSaveInterne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInterne.nom) return;

    const updatedMachines = [...processus.machinesInternes];
    const newMachine: MachineInterne = {
      id: editingId || `m-int-${Date.now()}`,
      nom: formInterne.nom,
      heuresUtilisation: Number(formInterne.heuresUtilisation ?? 0),
      consommationHoraire: Number(formInterne.consommationHoraire ?? 0),
      prixGasoilLitre: Number(formInterne.prixGasoilLitre ?? prixGasoilMoyen ?? 1.65),
      piecesRechangeCout: Number(formInterne.piecesRechangeCout ?? 0),
      valeurAchat: Number(formInterne.valeurAchat ?? 0),
      dureeAmortissementAns: Number(formInterne.dureeAmortissementAns ?? 5),
      isSaisieDirecte: !!formInterne.isSaisieDirecte,
      gasoilCoutGlobal: Number(formInterne.gasoilCoutGlobal ?? 0),
      piecesRechangeGlobal: Number(formInterne.piecesRechangeGlobal ?? 0),
      amortissementGlobal: Number(formInterne.amortissementGlobal ?? 0),
      amortissementAnnuelDirect: formInterne.amortissementAnnuelDirect ? Number(formInterne.amortissementAnnuelDirect) : undefined
    };

    if (editingId) {
      const idx = updatedMachines.findIndex(m => m.id === editingId);
      if (idx !== -1) updatedMachines[idx] = newMachine;
    } else {
      updatedMachines.push(newMachine);
    }

    onUpdateProcessus({
      ...processus,
      machinesInternes: updatedMachines
    });
    resetFormInterne();
  };

  const handleEditInterne = (m: MachineInterne) => {
    setEditingId(m.id);
    setFormInterne(m);
  };

  const handleDeleteInterne = (id: string) => {
    onUpdateProcessus({
      ...processus,
      machinesInternes: processus.machinesInternes.filter(m => m.id !== id)
    });
  };

  // --- ACTIONS MACHINE EXTERNE ---
  const handleSaveExterne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExterne.nom) return;

    const updatedMachines = [...processus.machinesExternes];
    const newMachine: MachineExterne = {
      id: editingId || `m-ext-${Date.now()}`,
      nom: formExterne.nom,
      typeTarif: formExterne.typeTarif as 'heure' | 'jour' | 'mois',
      tarifUnitaire: Number(formExterne.tarifUnitaire ?? 0),
      quantiteTemps: Number(formExterne.quantiteTemps ?? 0)
    };

    if (editingId) {
      const idx = updatedMachines.findIndex(m => m.id === editingId);
      if (idx !== -1) updatedMachines[idx] = newMachine;
    } else {
      updatedMachines.push(newMachine);
    }

    onUpdateProcessus({
      ...processus,
      machinesExternes: updatedMachines
    });
    resetFormExterne();
  };

  const handleEditExterne = (m: MachineExterne) => {
    setEditingId(m.id);
    setFormExterne(m);
  };

  const handleDeleteExterne = (id: string) => {
    onUpdateProcessus({
      ...processus,
      machinesExternes: processus.machinesExternes.filter(m => m.id !== id)
    });
  };

  // --- ACTIONS PERSONNEL ---
  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPersonnel.poste) return;

    const updatedPersonnel = [...processus.personnel];
    const newPers: PersonnelCharges = {
      id: editingId || `p-pers-${Date.now()}`,
      poste: formPersonnel.poste,
      nombre: Number(formPersonnel.nombre ?? 1),
      salaireBaseMensuel: Number(formPersonnel.salaireBaseMensuel ?? 0),
      chargesSocialesPourcent: Number(formPersonnel.chargesSocialesPourcent ?? 0),
      repasMensuelParPers: Number(formPersonnel.repasMensuelParPers ?? 0),
      hebergementMensuelParPers: Number(formPersonnel.hebergementMensuelParPers ?? 0),
      isSaisieDirecte: !!formPersonnel.isSaisieDirecte,
      paieGlobal: Number(formPersonnel.paieGlobal ?? 0),
      repasGlobal: Number(formPersonnel.repasGlobal ?? 0),
      hebergementGlobal: Number(formPersonnel.hebergementGlobal ?? 0)
    };

    if (editingId) {
      const idx = updatedPersonnel.findIndex(p => p.id === editingId);
      if (idx !== -1) updatedPersonnel[idx] = newPers;
    } else {
      updatedPersonnel.push(newPers);
    }

    onUpdateProcessus({
      ...processus,
      personnel: updatedPersonnel
    });
    resetFormPersonnel();
  };

  const handleEditPersonnel = (p: PersonnelCharges) => {
    setEditingId(p.id);
    setFormPersonnel(p);
  };

  const handleDeletePersonnel = (id: string) => {
    onUpdateProcessus({
      ...processus,
      personnel: processus.personnel.filter(p => p.id !== id)
    });
  };

  // --- ACTIONS TAXES ---
  const handleSaveTaxes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTaxes.nom) return;

    const updatedTaxes = [...processus.taxes];
    const newTaxe: TaxeRubrique = {
      id: editingId || `t-tax-${Date.now()}`,
      nom: formTaxes.nom,
      montantForfaitaire: Number(formTaxes.montantForfaitaire ?? 0),
      taxeParTonne: Number(formTaxes.taxeParTonne ?? 0)
    };

    if (editingId) {
      const idx = updatedTaxes.findIndex(t => t.id === editingId);
      if (idx !== -1) updatedTaxes[idx] = newTaxe;
    } else {
      updatedTaxes.push(newTaxe);
    }

    onUpdateProcessus({
      ...processus,
      taxes: updatedTaxes
    });
    resetFormTaxes();
  };

  const handleEditTaxes = (t: TaxeRubrique) => {
    setEditingId(t.id);
    setFormTaxes(t);
  };

  const handleDeleteTaxes = (id: string) => {
    onUpdateProcessus({
      ...processus,
      taxes: processus.taxes.filter(t => t.id !== id)
    });
  };

  return (
    <div className="space-y-6" id={`process-editor-${processus.id}`}>
      {/* Sélecteur de mode d'abattage (Front de Taille uniquement) */}
      {processus.id === 'front_de_taille' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>⛏️</span> Mode d'abattage au Front de Taille
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Sélectionnez la méthode d'extraction du matériau brut pour adapter la structure de vos coûts.
            </p>
          </div>
          <div>
            <select
              value={processus.modeAbattage || 'explosif'}
              onChange={(e) => {
                const mode = e.target.value as 'explosif' | 'mecanique';
                const updatedProcess = adjustProcessForAbattageMode(processus, mode);
                onUpdateProcessus(updatedProcess);
              }}
              className="bg-zinc-950 text-white border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="explosif">🧨 Abattage par l'explosif</option>
              <option value="mecanique">⚙️ Abattage mécanique (BRH / Ripage)</option>
            </select>
          </div>
        </div>
      )}
      {/* Tab Navigation */}
      <div className="border-2 border-zinc-800 bg-zinc-900 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveTab('interne'); resetFormInterne(); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-2 ${
            activeTab === 'interne'
              ? 'bg-emerald-500 text-black border-emerald-500'
              : 'text-zinc-400 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white'
          }`}
          id="btn-tab-interne"
        >
          <Fuel className="h-4 w-4" />
          {t('internal_machines', lang)} ({processus.machinesInternes.length})
        </button>
        <button
          onClick={() => { setActiveTab('externe'); resetFormExterne(); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-2 ${
            activeTab === 'externe'
              ? 'bg-emerald-500 text-black border-emerald-500'
              : 'text-zinc-400 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white'
          }`}
          id="btn-tab-externe"
        >
          <Clock className="h-4 w-4" />
          {t('external_machines', lang)} ({processus.machinesExternes.length})
        </button>
        <button
          onClick={() => { setActiveTab('personnel'); resetFormPersonnel(); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-2 ${
            activeTab === 'personnel'
              ? 'bg-emerald-500 text-black border-emerald-500'
              : 'text-zinc-400 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white'
          }`}
          id="btn-tab-personnel"
        >
          <Users className="h-4 w-4" />
          {t('personnel', lang)} ({processus.personnel.length})
        </button>
        <button
          onClick={() => { setActiveTab('taxes'); resetFormTaxes(); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-2 ${
            activeTab === 'taxes'
              ? 'bg-emerald-500 text-black border-emerald-500'
              : 'text-zinc-400 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white'
          }`}
          id="btn-tab-taxes"
        >
          <Receipt className="h-4 w-4" />
          {t('taxes', lang)} ({processus.taxes.length})
        </button>
      </div>

      {/* Main Tab Content - Two Column Layout (List on Left, Form on Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: List Table (2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* TAB: MATERIEL INTERNE */}
          {activeTab === 'interne' && (
            <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-semibold text-slate-800 text-sm">Liste du Matériel Interne</h4>
                <p className="text-xs text-slate-500">Engins et groupes du site de production</p>
              </div>
              {processus.machinesInternes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Aucun matériel interne saisi. Utilisez le formulaire pour en ajouter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Équipement</th>
                        <th className="py-2.5 px-3 text-right">Gasoil</th>
                        <th className="py-2.5 px-3 text-right">Pièces / Entretien</th>
                        <th className="py-2.5 px-3 text-right">Amortissement</th>
                        <th className="py-2.5 px-4 text-right bg-blue-50/30 text-blue-900">Total Coût</th>
                        <th className="py-2.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {processus.machinesInternes.map((m) => {
                        const mWithGlobalGasoil = {
                          ...m,
                          prixGasoilLitre: (prixGasoilMoyen !== undefined && !m.isSaisieDirecte) ? prixGasoilMoyen : (m.prixGasoilLitre || 0)
                        };
                        const couts = calculateMachineInterneCout(mWithGlobalGasoil, periode);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/40">
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              <div>{m.nom}</div>
                              {m.isSaisieDirecte ? (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px]">Saisie Globale</span>
                              ) : (
                                <div className="text-[10px] text-slate-500 font-normal mt-0.5 flex flex-wrap gap-x-2">
                                  <span><Clock className="inline h-3 w-3 mr-0.5" />{m.heuresUtilisation} h</span>
                                  <span>• Cons: {m.consommationHoraire} L/h</span>
                                  <span>• Amort: {m.dureeAmortissementAns} ans ({formatCurrency(m.valeurAchat, '')} d'achat)</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(couts.gasoil, devise)}</td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(couts.pieces, devise)}</td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(couts.amortissement, devise)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold bg-blue-50/10 text-blue-900">{formatCurrency(couts.total, devise)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditInterne(m)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                  title="Modifier"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteInterne(m.id)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: MATERIEL EXTERNE */}
          {activeTab === 'externe' && (
            <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-semibold text-slate-800 text-sm">Liste des Engins Loués (Matériel Externe)</h4>
                <p className="text-xs text-slate-500">Machines prises en location sur l'exercice</p>
              </div>
              {processus.machinesExternes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Aucun matériel externe loué. Utilisez le formulaire pour en ajouter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Nom de la Location / Prestation</th>
                        <th className="py-2.5 px-3 text-right">Tarif Unitaire</th>
                        <th className="py-2.5 px-3 text-right">Durée / Quantité</th>
                        <th className="py-2.5 px-4 text-right bg-blue-50/30 text-blue-900">Total Coût</th>
                        <th className="py-2.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {processus.machinesExternes.map((m) => {
                        const total = calculateMachineExterneCout(m);
                        const labelTarif = m.typeTarif === 'heure' ? 'h' : m.typeTarif === 'jour' ? 'j' : 'mois';
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/40">
                            <td className="py-3 px-4 font-semibold text-slate-800">{m.nom}</td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(m.tarifUnitaire, devise)} / {m.typeTarif}</td>
                            <td className="py-3 px-3 text-right font-mono">{m.quantiteTemps} {labelTarif}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold bg-blue-50/10 text-blue-900">{formatCurrency(total, devise)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditExterne(m)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExterne(m.id)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PERSONNEL */}
          {activeTab === 'personnel' && (
            <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-semibold text-slate-800 text-sm">Liste du Personnel rattaché</h4>
                <p className="text-xs text-slate-500">Salaires, charges, frais de repas et logement par poste</p>
              </div>
              {processus.personnel.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Aucun personnel enregistré. Utilisez le formulaire pour en ajouter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Poste & Effectif</th>
                        <th className="py-2.5 px-3 text-right">Total à payer</th>
                        <th className="py-2.5 px-3 text-right">Repas</th>
                        <th className="py-2.5 px-3 text-right">Hébergement</th>
                        <th className="py-2.5 px-4 text-right bg-blue-50/30 text-blue-900">Total Personnel</th>
                        <th className="py-2.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {processus.personnel.map((p) => {
                        const couts = calculatePersonnelCout(p, periode);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/40">
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              <div>{p.poste}</div>
                              {p.isSaisieDirecte ? (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px]">Saisie Globale</span>
                              ) : (
                                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                                  <span>Effectif: {p.nombre} pers. | Base: {formatCurrency(p.salaireBaseMensuel, devise)}/mois (+{p.chargesSocialesPourcent}% charges)</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(couts.paie, devise)}</td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(couts.repas, devise)}</td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(couts.hebergement, devise)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold bg-blue-50/10 text-blue-900">{formatCurrency(couts.total, devise)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditPersonnel(p)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePersonnel(p.id)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: TAXES */}
          {activeTab === 'taxes' && (
            <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="font-semibold text-slate-800 text-sm">Liste des Impôts & Taxes du Processus</h4>
                <p className="text-xs text-slate-500">Taxes foncières, redevances d'extraction et redevances environnementales</p>
              </div>
              {processus.taxes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Aucune taxe spécifique à cette rubrique. Utilisez le formulaire pour en ajouter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4">Libellé de la Taxe / Redevance</th>
                        <th className="py-2.5 px-3 text-right">Part Forfaitaire</th>
                        <th className="py-2.5 px-3 text-right">Taux Variable</th>
                        <th className="py-2.5 px-4 text-right bg-blue-50/30 text-blue-900">Total Coût</th>
                        <th className="py-2.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {processus.taxes.map((t) => {
                        const total = calculateTaxeCout(t, productionTonnage);
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/40">
                            <td className="py-3 px-4 font-semibold text-slate-800">{t.nom}</td>
                            <td className="py-3 px-3 text-right font-mono">{formatCurrency(t.montantForfaitaire, devise)}</td>
                            <td className="py-3 px-3 text-right font-mono">{t.taxeParTonne > 0 ? `${formatCurrency(t.taxeParTonne, devise)} / Tonne` : '-'}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold bg-blue-50/10 text-blue-900">{formatCurrency(total, devise)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditTaxes(t)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTaxes(t.id)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Form to Add/Edit (1/3 width) */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs h-fit">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600" />
              {editingId ? 'Modifier l\'élément' : 'Ajouter un élément'}
            </h4>
            <p className="text-[11px] text-slate-500">
              Saisie des coûts pour la rubrique <strong className="text-slate-700">{processus.nom}</strong>
            </p>
          </div>

          {/* FORM: MACHINE INTERNE */}
          {activeTab === 'interne' && (
            <form onSubmit={handleSaveInterne} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nom du matériel interne *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Pelle CAT 336D / Concasseur..."
                  value={formInterne.nom || ''}
                  onChange={e => setFormInterne({ ...formInterne, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Toggle Saisie Directe */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <input
                  type="checkbox"
                  id="toggle-saisie-directe"
                  checked={!!formInterne.isSaisieDirecte}
                  onChange={e => setFormInterne({ ...formInterne, isSaisieDirecte: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="toggle-saisie-directe" className="text-[11px] font-semibold text-slate-700 select-none cursor-pointer">
                  Saisie globale simplifiée (factures globales)
                </label>
              </div>

              {formInterne.isSaisieDirecte ? (
                /* Saisie directe des coûts globaux */
                <div className="space-y-3 p-3 bg-amber-50/40 border border-amber-100 rounded-lg">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Coût Total Gasoil ({devise})</label>
                    <input
                      type="number"
                      min="0"
                      value={formInterne.gasoilCoutGlobal || 0}
                      onChange={e => setFormInterne({ ...formInterne, gasoilCoutGlobal: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Coût Pièces de Rechange / Entretien ({devise})</label>
                    <input
                      type="number"
                      min="0"
                      value={formInterne.piecesRechangeGlobal || 0}
                      onChange={e => setFormInterne({ ...formInterne, piecesRechangeGlobal: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Coût d'Amortissement affecté ({devise})</label>
                    <input
                      type="number"
                      min="0"
                      value={formInterne.amortissementGlobal || 0}
                      onChange={e => setFormInterne({ ...formInterne, amortissementGlobal: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                /* Calculateur détaillé */
                <div className="space-y-3.5">
                  <div className="bg-blue-50/30 p-2.5 rounded-lg border border-blue-50 space-y-2">
                    <h5 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                      <Fuel className="h-3 w-3" /> Consommation Carburant
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-500 mb-0.5">Heures util.</label>
                        <input
                          type="number"
                          min="0"
                          value={formInterne.heuresUtilisation || ''}
                          onChange={e => setFormInterne({ ...formInterne, heuresUtilisation: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 mb-0.5">L/heure</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formInterne.consommationHoraire || ''}
                          onChange={e => setFormInterne({ ...formInterne, consommationHoraire: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/20 p-2.5 rounded-lg border border-emerald-50 space-y-1">
                    <h5 className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> Entretien & Rechanges
                    </h5>
                    <div>
                      <label className="block text-[9px] text-slate-500 mb-0.5">Coût d'entretien pour la période ({devise})</label>
                      <input
                        type="number"
                        min="0"
                        value={formInterne.piecesRechangeCout || ''}
                        onChange={e => setFormInterne({ ...formInterne, piecesRechangeCout: Number(e.target.value) })}
                        className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50/30 p-2.5 rounded-lg border border-purple-50 space-y-2">
                    <h5 className="text-[10px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                      Amortissement du Matériel
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-500 mb-0.5">Valeur d'Achat</label>
                        <input
                          type="number"
                          min="0"
                          value={formInterne.valeurAchat || ''}
                          onChange={e => setFormInterne({ ...formInterne, valeurAchat: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 mb-0.5">Durée (Ans)</label>
                        <input
                          type="number"
                          min="1"
                          value={formInterne.dureeAmortissementAns || ''}
                          onChange={e => setFormInterne({ ...formInterne, dureeAmortissementAns: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400 leading-tight">
                      Note: L'amortissement calculé est linéaire sur la durée spécifiée (proratisé à {periode === 'hebdomadaire' ? '1/52 par semaine' : periode === 'mensuel' ? '1/12 par mois' : '1 an'}).
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition"
                >
                  <Save className="h-3.5 w-3.5" /> Enregistrer
                </button>
                <button
                  type="button"
                  onClick={resetFormInterne}
                  className="px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* FORM: MACHINE EXTERNE (LOCATION) */}
          {activeTab === 'externe' && (
            <form onSubmit={handleSaveExterne} className="space-y-4">
              {/* Raccourcis de chargement rapide */}
              {processus.id === 'front_de_taille' && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <span>🧨</span> Raccourcis Front de Taille :
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormExterne({
                          id: 'me-ft-explosifs',
                          nom: "Achat d'explosifs (Cartouches, détonateurs)",
                          typeTarif: 'mois',
                          tarifUnitaire: 4500,
                          quantiteTemps: 1
                        });
                      }}
                      className="text-left text-[11px] bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-950 px-2 py-1 rounded font-semibold transition cursor-pointer"
                    >
                      + Charger : Achat d'explosifs (4 500 {devise}/mois)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormExterne({
                          id: 'me-ft-location',
                          nom: "Location d'un brise-roche hydraulique (BRH)",
                          typeTarif: 'jour',
                          tarifUnitaire: 380,
                          quantiteTemps: 6
                        });
                      }}
                      className="text-left text-[11px] bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-950 px-2 py-1 rounded font-semibold transition cursor-pointer"
                    >
                      + Charger : Location BRH (380 {devise}/jour)
                    </button>
                  </div>
                </div>
              )}

              {processus.id === 'transport' && (
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                  <div className="font-bold text-zinc-800 mb-1 flex items-center gap-1">
                    <span>🚛</span> Raccourcis Transport :
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormExterne({
                        id: 'me-tr-1',
                        nom: "Dumper articulé de secours (location)",
                        typeTarif: 'jour',
                        tarifUnitaire: 450,
                        quantiteTemps: 5
                      });
                    }}
                    className="w-full text-left text-[11px] bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-950 px-2 py-1 rounded font-semibold transition cursor-pointer"
                  >
                    + Charger : Dumper de secours (450 {devise}/jour)
                  </button>
                </div>
              )}

              {processus.id === 'concassage' && (
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                  <div className="font-bold text-zinc-800 mb-1 flex items-center gap-1">
                    <span>⚙️</span> Raccourcis Concassage :
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormExterne({
                        id: 'me-co-loc',
                        nom: "Location d'un convoyeur sauterelle mobile",
                        typeTarif: 'mois',
                        tarifUnitaire: 1200,
                        quantiteTemps: 1
                      });
                    }}
                    className="w-full text-left text-[11px] bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-950 px-2 py-1 rounded font-semibold transition cursor-pointer"
                  >
                    + Charger : Convoyeur mobile (1 200 {devise}/mois)
                  </button>
                </div>
              )}

              {processus.id === 'chargement' && (
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                  <div className="font-bold text-zinc-800 mb-1 flex items-center gap-1">
                    <span>🚜</span> Raccourcis Chargement :
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormExterne({
                        id: 'me-ch-loc',
                        nom: "Location de secours - Chargeuse articulée",
                        typeTarif: 'jour',
                        tarifUnitaire: 350,
                        quantiteTemps: 4
                      });
                    }}
                    className="w-full text-left text-[11px] bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-950 px-2 py-1 rounded font-semibold transition cursor-pointer"
                  >
                    + Charger : Chargeuse secours (350 {devise}/jour)
                  </button>
                </div>
              )}

              {processus.id === 'moyens_generaux' && (
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                  <div className="font-bold text-zinc-800 mb-1 flex items-center gap-1">
                    <span>🏢</span> Raccourcis Moyens Généraux :
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormExterne({
                        id: 'me-mg-1',
                        nom: "Location d'Algeco Bureaux administratifs",
                        typeTarif: 'mois',
                        tarifUnitaire: 850,
                        quantiteTemps: 1
                      });
                    }}
                    className="w-full text-left text-[11px] bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-950 px-2 py-1 rounded font-semibold transition cursor-pointer"
                  >
                    + Charger : Algeco Bureau (850 {devise}/mois)
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nom du matériel loué *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Pelle de secours louée..."
                  value={formExterne.nom || ''}
                  onChange={e => setFormExterne({ ...formExterne, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Unité tarifaire</label>
                  <select
                    value={formExterne.typeTarif || 'jour'}
                    onChange={e => setFormExterne({ ...formExterne, typeTarif: e.target.value as 'heure' | 'jour' | 'mois' })}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500"
                  >
                    <option value="heure">Par heure</option>
                    <option value="jour">Par jour</option>
                    <option value="mois">Par mois</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Tarif unitaire ({devise})</label>
                  <input
                    type="number"
                    min="0"
                    value={formExterne.tarifUnitaire || ''}
                    onChange={e => setFormExterne({ ...formExterne, tarifUnitaire: Number(e.target.value) })}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Quantité (heures/jours/mois)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formExterne.quantiteTemps || ''}
                  onChange={e => setFormExterne({ ...formExterne, quantiteTemps: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Save className="h-3.5 w-3.5" /> Enregistrer
                </button>
                <button
                  type="button"
                  onClick={resetFormExterne}
                  className="px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* FORM: PERSONNEL */}
          {activeTab === 'personnel' && (
            <form onSubmit={handleSavePersonnel} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Désignation du poste *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Conducteur d'engins / Chef de poste"
                  value={formPersonnel.poste || ''}
                  onChange={e => setFormPersonnel({ ...formPersonnel, poste: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500"
                />
              </div>

              {/* Toggle Saisie Directe */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <input
                  type="checkbox"
                  id="toggle-personnel-direct"
                  checked={!!formPersonnel.isSaisieDirecte}
                  onChange={e => setFormPersonnel({ ...formPersonnel, isSaisieDirecte: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="toggle-personnel-direct" className="text-[11px] font-semibold text-slate-700 select-none cursor-pointer">
                  Saisie globale simplifiée
                </label>
              </div>

              {formPersonnel.isSaisieDirecte ? (
                /* Saisie globale personnel */
                <div className="space-y-3 p-3 bg-amber-50/40 border border-amber-100 rounded-lg">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Total à payer global ({devise})</label>
                    <input
                      type="number"
                      min="0"
                      value={formPersonnel.paieGlobal || 0}
                      onChange={e => setFormPersonnel({ ...formPersonnel, paieGlobal: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Frais de repas globaux ({devise})</label>
                    <input
                      type="number"
                      min="0"
                      value={formPersonnel.repasGlobal || 0}
                      onChange={e => setFormPersonnel({ ...formPersonnel, repasGlobal: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Frais d'hébergement globaux ({devise})</label>
                    <input
                      type="number"
                      min="0"
                      value={formPersonnel.hebergementGlobal || 0}
                      onChange={e => setFormPersonnel({ ...formPersonnel, hebergementGlobal: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                /* Saisie détaillée personnel */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Effectif (Nombre)</label>
                      <input
                        type="number"
                        min="1"
                        value={formPersonnel.nombre || ''}
                        onChange={e => setFormPersonnel({ ...formPersonnel, nombre: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-0.5">Salaire mensuel base</label>
                      <input
                        type="number"
                        min="0"
                        value={formPersonnel.salaireBaseMensuel || ''}
                        onChange={e => setFormPersonnel({ ...formPersonnel, salaireBaseMensuel: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1">Charges Patronales & Sociales (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formPersonnel.chargesSocialesPourcent || 0}
                      onChange={e => setFormPersonnel({ ...formPersonnel, chargesSocialesPourcent: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Repas / pers / mois</label>
                      <input
                        type="number"
                        min="0"
                        value={formPersonnel.repasMensuelParPers || ''}
                        onChange={e => setFormPersonnel({ ...formPersonnel, repasMensuelParPers: Number(e.target.value) })}
                        className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 mb-0.5">Hébergem. / pers / m</label>
                      <input
                        type="number"
                        min="0"
                        value={formPersonnel.hebergementMensuelParPers || ''}
                        onChange={e => setFormPersonnel({ ...formPersonnel, hebergementMensuelParPers: Number(e.target.value) })}
                        className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Note : Les frais de paie, repas et hébergement saisis au mois sont recalculés automatiquement si la période globale est configurée en mode hebdomadaire ou annuel.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Save className="h-3.5 w-3.5" /> Enregistrer
                </button>
                <button
                  type="button"
                  onClick={resetFormPersonnel}
                  className="px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* FORM: TAXES */}
          {activeTab === 'taxes' && (
            <form onSubmit={handleSaveTaxes} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nom de l'impôt / taxe *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: TGAP / Redevance d'abattage..."
                  value={formTaxes.nom || ''}
                  onChange={e => setFormTaxes({ ...formTaxes, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Part Forfaitaire Fixe ({devise})</label>
                <input
                  type="number"
                  min="0"
                  value={formTaxes.montantForfaitaire || ''}
                  onChange={e => setFormTaxes({ ...formTaxes, montantForfaitaire: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Taux Variable par Tonne ({devise} / Tonne)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formTaxes.taxeParTonne || ''}
                  onChange={e => setFormTaxes({ ...formTaxes, taxeParTonne: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-500 leading-tight">
                Calculé variable : <strong className="text-slate-700">{formatCurrency(calculateTaxeCout(formTaxes as TaxeRubrique, productionTonnage), devise)}</strong> (sur la base des {productionTonnage.toLocaleString()} Tonnes du scénario actuel).
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Save className="h-3.5 w-3.5" /> Enregistrer
                </button>
                <button
                  type="button"
                  onClick={resetFormTaxes}
                  className="px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
