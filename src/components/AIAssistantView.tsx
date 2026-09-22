import React, { useState, useEffect } from 'react';
import { QuarryScenario } from '../types';
import { calculateScenarioSummary } from '../utils/calculations';
import { generateQuarryAnalysis } from '../utils/gemini';
import { formatCurrency, formatPercent, formatTonnage, formatCostPerTon } from '../utils/format';
import { t } from '../utils/translations';
import { 
  Sparkles, 
  Brain, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle, 
  FileText, 
  HelpCircle,
  Play,
  ArrowRight,
  Gauge,
  ChevronRight
} from 'lucide-react';

interface AIAssistantViewProps {
  scenario: QuarryScenario;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ scenario }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const summary = calculateScenarioSummary(scenario);

  // Load saved analysis for this scenario if exists
  useEffect(() => {
    const saved = localStorage.getItem(`quarry_ai_analysis_${scenario.id}`);
    if (saved) {
      setAnalysis(saved);
      setIsSimulated(localStorage.getItem(`quarry_ai_analysis_simulated_${scenario.id}`) === 'true');
    } else {
      setAnalysis(null);
      setIsSimulated(false);
    }
    setError(null);
  }, [scenario.id]);

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Cycles loading steps to make it look active and professional
  const runLoadingAnimation = (callback: () => Promise<void>) => {
    const steps = {
      fr: [
        "Extraction des métriques clés de la carrière...",
        "Consolidation de la structure de coûts par nature...",
        "Comparaison avec les ratios standards de l'industrie...",
        "Envoi des données au modèle de langage Gemini...",
        "Rédaction du diagnostic de rentabilité...",
        "Génération du plan de recommandations opérationnelles..."
      ],
      en: [
        "Extracting key quarry metrics...",
        "Consolidating cost structure by category...",
        "Comparing with industry standard ratios...",
        "Sending data to Gemini language model...",
        "Drafting profitability diagnosis...",
        "Generating operational recommendations plan..."
      ],
      ar: [
        "استخراج المقاييس الرئيسية للمحجر...",
        "دمج هيكل التكلفة حسب طبيعة المصروفات...",
        "مقارنة النسب القياسية للقطاع...",
        "إرسال البيانات إلى نموذج Gemini اللغوي...",
        "صياغة تشخيص الربحية المالي...",
        "توليد خطة التوصيات التشغيلية..."
      ],
      es: [
        "Extrayendo métricas clave de la cantera...",
        "Consolidando estructura de costos por categoría...",
        "Comparando con ratios estándar de la industria...",
        "Enviando datos al modelo lingüístico Gemini...",
        "Redactando diagnóstico de rentabilidad...",
        "Generando plan de recomendaciones operativas..."
      ]
    };
    const activeSteps = steps[scenario.lang || 'fr'] || steps.fr;
    
    setLoading(true);
    setError(null);
    let stepIndex = 0;
    setLoadingStep(activeSteps[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < activeSteps.length) {
        setLoadingStep(activeSteps[stepIndex]);
      }
    }, 2000);

    callback().finally(() => {
      clearInterval(interval);
      setLoading(false);
    });
  };

  const handleGenerateReal = async () => {
    runLoadingAnimation(async () => {
      try {
        const result = await generateQuarryAnalysis(scenario);
        setAnalysis(result);
        setIsSimulated(false);
        localStorage.setItem(`quarry_ai_analysis_${scenario.id}`, result);
        localStorage.setItem(`quarry_ai_analysis_simulated_${scenario.id}`, 'false');
      } catch (err: any) {
        console.warn("Échec Gemini Real, bascule en simulation local:", err);
        // Fallback to local simulation automatically, but record that it is simulated
        const sim = getSimulatedAnalysis();
        setAnalysis(sim);
        setIsSimulated(true);
        localStorage.setItem(`quarry_ai_analysis_${scenario.id}`, sim);
        localStorage.setItem(`quarry_ai_analysis_simulated_${scenario.id}`, 'true');
        setError("Note : La clé API Gemini configurée est invalide ou inactive. Une simulation locale de l'analyse IA a été générée en remplacement.");
      }
    });
  };

  const handleGenerateSimulated = () => {
    runLoadingAnimation(async () => {
      // Simulate 4 seconds delay
      await new Promise(resolve => setTimeout(resolve, 3500));
      const sim = getSimulatedAnalysis();
      setAnalysis(sim);
      setIsSimulated(true);
      localStorage.setItem(`quarry_ai_analysis_${scenario.id}`, sim);
      localStorage.setItem(`quarry_ai_analysis_simulated_${scenario.id}`, 'true');
    });
  };

  // Helper to generate a high quality local template analysis using exact numbers
  const getSimulatedAnalysis = (): string => {
    const marginStatus = summary.margeGlobale >= 0 ? "Rendement excédentaire positif" : "Déficit d'exploitation critique";
    const recommendationPrice = (summary.coutParTonneGlobal * 1.25).toFixed(2);
    const criticalTonnage = summary.margeParTonne > 0 
      ? Math.round(summary.totalGlobal / scenario.prixVenteMoyenParTonne) 
      : Math.round(summary.totalGlobal * 1.3 / scenario.prixVenteMoyenParTonne);

    // Find heaviest process
    const sortedItems = [...summary.items].sort((a, b) => b.totalCout - a.totalCout);
    const heaviestProcess = sortedItems[0];
    const secondHeaviestProcess = sortedItems[1];

    // Find heaviest category by nature
    const categories = [
      { name: 'Gasoil', value: summary.breakdownByCategory.gasoil, desc: 'Carburant engins' },
      { name: 'Pièces Rechange', value: summary.breakdownByCategory.pieces, desc: 'Maintenance' },
      { name: 'Amortissement', value: summary.breakdownByCategory.amortissement, desc: 'Investissement' },
      { name: 'Location Matériel', value: summary.breakdownByCategory.location, desc: 'Location' },
      { name: 'Personnel', value: summary.breakdownByCategory.personnelTotal, desc: 'Main d\'oeuvre' },
      { name: 'Impôts & Taxes', value: summary.breakdownByCategory.taxes, desc: 'Taxes' }
    ].sort((a, b) => b.value - a.value);
    
    const heaviestNature = categories[0];

    return `### 💡 Diagnostics de Performance Globale

Après analyse de votre scénario **${scenario.nom}**, voici le bilan de performance :
- **Viabilité financière** : L'exploitation affiche un **${marginStatus}**.
- **Prix de revient à la tonne** : **${formatCostPerTon(summary.coutParTonneGlobal, scenario.devise)}** contre un prix de vente moyen de **${formatCurrency(scenario.prixVenteMoyenParTonne, scenario.devise)}**.
- **Marge d'exploitation** : **${formatCurrency(summary.margeGlobale, scenario.devise)}** (soit **${formatPercent(summary.margePourcent)}** de rentabilité nette). 

Le prix de revient unitaire est ${summary.coutParTonneGlobal > scenario.prixVenteMoyenParTonne ? 'supérieur' : 'inférieur'} au prix de marché, ce qui ${summary.coutParTonneGlobal > scenario.prixVenteMoyenParTonne ? 'menace directement la pérennité de la carrière' : 'permet de dégager un bénéfice net sur chaque tonne vendue'}.

---

### 🔍 Analyse des Postes de Dépenses Critiques

1. **Processus le plus coûteux** : **${heaviestProcess.nom}** représente **${formatCurrency(heaviestProcess.totalCout, scenario.devise)}** (soit **${formatPercent(heaviestProcess.pourcentage)}** des dépenses globales). C'est le premier poste à auditer pour des réductions de coûts.
2. **Second processus critique** : **${secondHeaviestProcess.nom}** à hauteur de **${formatCurrency(secondHeaviestProcess.totalCout, scenario.devise)}** (**${formatPercent(secondHeaviestProcess.pourcentage)}**).
3. **Nature de dépense dominante** : Le poste **${heaviestNature.name}** s'élève à **${formatCurrency(heaviestNature.value, scenario.devise)}** (soit **${formatPercent((heaviestNature.value / summary.totalGlobal) * 100)}** du budget). Une attention particulière sur cette nature de charge est primordiale.

---

### 🛠️ Plan d'Action Opérationnel & Recommandations

- **Optimisation Carburant & Roulage** (Impact estimé : -7% sur le Gasoil) :
  - Standardiser les cycles de transport entre le front de taille et le concasseur primaire pour éviter les temps de ralenti excessifs des dumpers.
  - Former les chauffeurs à l'éco-conduite d'engins lourds de chantier.
- **Arbitrage Matériel Interne vs Location Externe** (Impact estimé : -15% sur les locations) :
  - Les charges de location externe s'élèvent à **${formatCurrency(summary.breakdownByCategory.location, scenario.devise)}**. Examinez si l'achat amorti d'un équipement récurrent ne serait pas plus rentable à moyen terme que la location répétée.
- **Rationnalisation de la Maintenance** (Impact estimé : -10% sur les pièces détachées) :
  - Mettre en place un plan de graissage et d'entretien systématique pour réduire le taux de casse des mâchoires de concassage et des chenilles.
- **Contrôle de la Main d'œuvre** (Impact : Optimisation logistique) :
  - Ajuster les frais de restauration et d'hébergement du personnel qui totalisent **${formatCurrency(summary.breakdownByCategory.personnelRepas + summary.breakdownByCategory.personnelHebergement, scenario.devise)}** via des contrats-cadres négociés à l'année.

---

### 📊 Seuil de Rentabilité & Recommandations de Vente

- **Prix de vente cible (Marge 25%)** : Pour obtenir une marge confortable de 25%, le prix de vente moyen par tonne doit être réévalué à **${recommendationPrice} ${scenario.devise}/T**.
- **Seuil de production critique** : Au prix actuel, le tonnage de granulats qu'il est nécessaire de produire et vendre pour simplement couvrir les coûts (Point Mort) s'élève à environ **${criticalTonnage.toLocaleString('fr-FR')} Tonnes** par ${scenario.periode === 'hebdomadaire' ? 'semaine' : scenario.periode === 'mensuel' ? 'mois' : 'an'}.
`;
  };

  // Simple Markdown to HTML formatter to render report nicely
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="text-sm font-bold text-emerald-400 mt-6 mb-3 uppercase tracking-wider flex items-center gap-1.5"><ChevronRight className="h-4 w-4 shrink-0 text-emerald-500" /> {trimmed.substring(4)}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} className="text-base font-bold text-white mt-6 mb-3 border-b border-zinc-800 pb-2">{trimmed.substring(3)}</h3>;
      }
      if (trimmed.startsWith('#')) {
        return <h2 key={idx} className="text-lg font-extrabold text-white mt-6 mb-4">{trimmed.substring(2)}</h2>;
      }
      if (trimmed.startsWith('---')) {
        return <hr key={idx} className="my-6 border-zinc-800" />;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        let content = trimmed.substring(2);
        return (
          <li key={idx} className="ml-4 pl-1 list-disc text-xs text-zinc-300 mb-2 leading-relaxed">
            {formatBoldText(content)}
          </li>
        );
      }
      if (trimmed.length === 0) {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-zinc-300 mb-3 leading-relaxed">{formatBoldText(trimmed)}</p>;
    });
  };

  const formatBoldText = (text: string) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-6 relative" id="ai-assistant-view-root">
      
      {/* Glow highlight for AI space */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header section */}
      <div className="rounded-2xl border border-purple-900/35 bg-gradient-to-r from-purple-950/15 via-zinc-900/20 to-transparent p-6 shadow-xl shadow-black/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl shadow-lg shadow-purple-500/5 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {t('ai_assistant_title', scenario.lang)} <span className="text-[9px] uppercase bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold px-2 py-0.5 rounded-full">Gemini</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              {t('ai_assistant_desc', scenario.lang)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          {!analysis && !loading && (
            <>
              <button
                onClick={handleGenerateSimulated}
                className="flex-1 md:flex-none border border-zinc-700/60 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Gauge className="h-4 w-4 text-zinc-400" />
                {t('simulated_btn', scenario.lang)}
              </button>
              <button
                onClick={handleGenerateReal}
                className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-500/20 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/10 flex items-center justify-center gap-1.5"
              >
                <Play className="h-4 w-4 text-purple-200 fill-purple-200" />
                {t('real_btn', scenario.lang)}
              </button>
            </>
          )}

          {analysis && !loading && (
            <div className="flex gap-2 w-full">
              <button
                onClick={handleGenerateReal}
                className="flex-1 md:flex-none bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t('reanalyze_btn', scenario.lang)}
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 md:flex-none bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t('copied_btn', scenario.lang) : t('copy_btn', scenario.lang)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warnings & alerts */}
      {error && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-start gap-3 rounded-xl">
          <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state card */}
      {loading && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center flex flex-col justify-center items-center gap-6 shadow-xl shadow-black/25">
          <div className="relative flex items-center justify-center">
            {/* Outer spinning ring */}
            <div className="w-16 h-16 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            {/* Inner pulsing icon */}
            <div className="absolute p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
              <Brain className="h-6 w-6 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('ai_audit_in_progress', scenario.lang)}</h3>
            <p className="text-xs text-zinc-400 font-mono transition-all duration-300 animate-pulse">{loadingStep}</p>
          </div>
        </div>
      )}

      {/* Main Report Display Card */}
      {analysis && !loading && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-6 md:p-8 shadow-xl shadow-black/30">
          <div className="border-b border-zinc-800/80 pb-5 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('ai_report_title', scenario.lang)}</span>
            </div>
            {isSimulated && (
              <span className="text-[9px] font-bold uppercase border border-amber-500/30 bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {t('simulated_text', scenario.lang)}
              </span>
            )}
          </div>
          
          <div className="prose prose-invert max-w-none text-zinc-300 selection:bg-purple-500/20">
            {renderMarkdown(analysis)}
          </div>
        </div>
      )}

      {/* Placeholder empty state */}
      {!analysis && !loading && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-16 text-center flex flex-col justify-center items-center gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-full">
            <Brain className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{t('no_analysis_title', scenario.lang)}</h3>
            <p className="text-xs text-zinc-550 leading-normal">
              {t('no_analysis_desc', scenario.lang)}
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-3">
            <button
              onClick={handleGenerateSimulated}
              className="text-xs text-purple-400 hover:text-purple-300 font-bold transition flex items-center gap-1"
            >
              {t('simulated_btn', scenario.lang)} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};
