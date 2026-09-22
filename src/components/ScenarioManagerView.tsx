import React, { useState, useEffect } from 'react';
import { QuarryScenario } from '../types';
import { generateDefaultScenario, alternativeTemplates } from '../data/defaultTemplates';
import { 
  FolderOpen, 
  Save, 
  Trash2, 
  Download, 
  Upload, 
  FilePlus, 
  Check, 
  RefreshCw,
  FileText,
  AlertTriangle,
  Layers3
} from 'lucide-react';

interface ScenarioManagerViewProps {
  currentScenario: QuarryScenario;
  onLoadScenario: (scenario: QuarryScenario) => void;
  onSaveCurrentScenario: (name: string) => void;
}

export const ScenarioManagerView: React.FC<ScenarioManagerViewProps> = ({
  currentScenario,
  onLoadScenario,
  onSaveCurrentScenario
}) => {
  const [savedList, setSavedList] = useState<{ id: string; nom: string; date: string; tonnage: number }[]>([]);
  const [saveName, setSaveName] = useState<string>(currentScenario.nom);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('temp-medium');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Charger la liste des scénarios sauvegardés dans localStorage
  useEffect(() => {
    refreshSavedList();
  }, [currentScenario]);

  const refreshSavedList = () => {
    try {
      const keys = Object.keys(localStorage);
      const scenarios = keys
        .filter(key => key.startsWith('quarry_scenario_'))
        .map(key => {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item) as QuarryScenario;
            return {
              id: parsed.id,
              nom: parsed.nom,
              date: parsed.dateCreation,
              tonnage: parsed.productionTonnage
            };
          }
          return null;
        })
        .filter(Boolean) as { id: string; nom: string; date: string; tonnage: number }[];
      
      setSavedList(scenarios);
    } catch (e) {
      console.error("Erreur de chargement de l'historique", e);
    }
  };

  const showFeedback = (msg: string, isError: boolean = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    onSaveCurrentScenario(saveName.trim());
    showFeedback("Scénario enregistré dans le navigateur !");
  };

  const handleLoad = (id: string) => {
    const raw = localStorage.getItem(`quarry_scenario_${id}`);
    if (raw) {
      try {
        const scenario = JSON.parse(raw) as QuarryScenario;
        onLoadScenario(scenario);
        setSaveName(scenario.nom);
        showFeedback(`Scénario "${scenario.nom}" chargé avec succès.`);
      } catch (e) {
        showFeedback("Erreur de décodage du fichier sauvegardé.", true);
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le scénario "${name}" ?`)) {
      localStorage.removeItem(`quarry_scenario_${id}`);
      refreshSavedList();
      showFeedback("Scénario supprimé définitivement.");
    }
  };

  const handleCreateFromTemplate = () => {
    const t = alternativeTemplates.find(item => item.id === selectedTemplate);
    if (!t) return;

    // Créer un scénario par défaut complet
    const base = generateDefaultScenario();
    base.id = `scenario-${Date.now()}`;
    base.nom = `${t.nom} (${new Date().toLocaleDateString('fr-FR')})`;
    base.productionTonnage = t.productionTonnage;
    base.prixVenteMoyenParTonne = t.prixVenteMoyenParTonne;
    base.prixGasoilMoyen = t.prixGasoilMoyen;
    base.dateCreation = new Date().toLocaleDateString('fr-FR');

    // Mettre à jour les prix du carburant de toutes les machines internes
    const keys: ('front_de_taille' | 'transport' | 'concassage' | 'chargement' | 'moyens_generaux')[] = [
      'front_de_taille',
      'transport',
      'concassage',
      'chargement',
      'moyens_generaux'
    ];

    keys.forEach(key => {
      base.processus[key].machinesInternes.forEach(m => {
        m.prixGasoilLitre = t.prixGasoilMoyen;
      });
    });

    if (selectedTemplate === 'temp-empty') {
      // Vider tous les tableaux de données
      keys.forEach(key => {
        base.processus[key].machinesInternes = [];
        base.processus[key].machinesExternes = [];
        base.processus[key].personnel = [];
        base.processus[key].taxes = [];
      });
    }

    onLoadScenario(base);
    setSaveName(base.nom);
    showFeedback("Nouveau scénario initialisé à partir du modèle !");
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentScenario, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${currentScenario.nom.replace(/\s+/g, '_')}_prix_de_revient.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFeedback("Fichier JSON téléchargé !");
    } catch (e) {
      showFeedback("Erreur lors de l'exportation.", true);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          if (event.target?.result) {
            const parsed = JSON.parse(event.target.result as string) as QuarryScenario;
            // Vérification simple de la structure
            if (parsed.id && parsed.nom && parsed.processus) {
              // Réassigner un ID de sauvegarde unique
              parsed.id = `scenario-imported-${Date.now()}`;
              onLoadScenario(parsed);
              setSaveName(parsed.nom);
              showFeedback(`Scénario "${parsed.nom}" importé avec succès !`);
            } else {
              showFeedback("Structure de fichier non valide.", true);
            }
          }
        } catch (err) {
          showFeedback("Échec de la lecture ou JSON corrompu.", true);
        }
      };
    }
  };

  return (
    <div className="space-y-8" id="scenario-manager-root">
      {/* Alert Messaging */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4.5 w-4.5 text-emerald-600" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-150 text-rose-900 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Card: Create / Save current scenario */}
        <div className="space-y-6">
          
          {/* Section: Save Current */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Save className="h-4 w-4 text-blue-600" /> Enregistrer le scénario actif
            </h3>
            <p className="text-xs text-slate-500">
              Enregistre l'ensemble de vos données actuelles (pelles, dumpers, équipes de travail, tonnages) dans la mémoire locale de votre navigateur.
            </p>
            <form onSubmit={handleSave} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Nom du scénario (ex: Budget Carrière Q3)"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:outline-hidden font-medium text-slate-800"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Check className="h-4 w-4" /> Enregistrer
              </button>
            </form>
          </div>

          {/* Section: Templates loader */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FilePlus className="h-4 w-4 text-indigo-600" /> Charger un modèle type (Simulation rapide)
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Initialisez un tout nouveau scénario d'exploitation. Attention, cette action écrasera vos modifications en cours si elles ne sont pas sauvegardées.
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                {alternativeTemplates.map((temp) => (
                  <label 
                    key={temp.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      selectedTemplate === temp.id 
                        ? 'border-indigo-200 bg-indigo-50/20 shadow-2xs' 
                        : 'border-slate-150 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scenario-template"
                      value={temp.id}
                      checked={selectedTemplate === temp.id}
                      onChange={() => setSelectedTemplate(temp.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-800">{temp.nom}</div>
                      <div className="text-slate-500 font-normal mt-0.5 leading-relaxed">{temp.description}</div>
                      <div className="text-[10px] text-slate-600 font-mono mt-1">
                        Production cible : {temp.productionTonnage.toLocaleString('fr-FR')} T | Gasoil moyen : {temp.prixGasoilMoyen} {currentScenario.devise}/L
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={handleCreateFromTemplate}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Layers3 className="h-4 w-4" /> Initialiser ce modèle de carrière
              </button>
            </div>
          </div>

        </div>

        {/* Right Card: Saved list & JSON file import/export */}
        <div className="space-y-6">
          
          {/* Section: Saved List */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-amber-600" /> Liste de vos Scénarios Sauvegardés
            </h3>
            {savedList.length === 0 ? (
              <div className="py-8 px-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                Aucun scénario enregistré localement dans ce navigateur.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                {savedList.map((sc) => (
                  <div key={sc.id} className="p-3 bg-white hover:bg-slate-50/50 flex items-center justify-between gap-4 text-xs">
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate">{sc.nom}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Sauvegardé le {sc.date} | {sc.tonnage.toLocaleString('fr-FR')} Tonnes
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleLoad(sc.id)}
                        className="px-2.5 py-1.5 text-amber-700 hover:bg-amber-50 rounded-md font-bold text-[11px] transition"
                        title="Charger"
                      >
                        Charger
                      </button>
                      <button
                        onClick={() => handleDelete(sc.id, sc.nom)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: File Transfer */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-600" /> Exportation & Importation (Fichiers .json)
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Partagez ou sauvegardez vos calculs de prix de revient sous forme de fichiers physiques utilisables dans n'importe quel autre navigateur.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Export Button */}
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 border border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50 text-emerald-800 py-2.5 rounded-lg text-xs font-bold transition"
              >
                <Download className="h-4 w-4" /> Exporter (.json)
              </button>

              {/* Import Upload */}
              <label className="flex items-center justify-center gap-2 border border-slate-200 bg-slate-50/30 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition">
                <Upload className="h-4 w-4" /> Importer (.json)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
            <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-100 text-[10px] text-blue-800 leading-normal flex gap-2">
              <FileText className="h-4.5 w-4.5 shrink-0 text-blue-500 mt-0.5" />
              <span>
                <strong>Pratique :</strong> Les fichiers exportés contiennent l'ensemble des formules et structures de coûts. Vous pouvez les joindre à vos rapports administratifs ou de contrôle de gestion.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
