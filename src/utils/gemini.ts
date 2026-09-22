import { GoogleGenAI } from '@google/genai';
import { QuarryScenario } from '../types';
import { calculateScenarioSummary } from './calculations';

// Initialize the Google GenAI SDK
// Using the compiled constant process.env.GEMINI_API_KEY
const apiKey = (process.env as any).GEMINI_API_KEY || '';

export const isApiKeyConfigured = (): boolean => {
  return typeof apiKey === 'string' && apiKey.trim().length > 0 && !apiKey.startsWith('AQ.');
};

// Check if the API key in .env has been modified from the default placeholder (which starts with AQ.)
// Wait, if it is still a placeholder, it might fail, but let's allow trying.
const getAiClient = () => {
  if (!apiKey) {
    throw new Error("Clé API Gemini manquante. Veuillez configurer GEMINI_API_KEY dans votre fichier .env.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends quarry data to Gemini and returns a comprehensive markdown analysis report
 */
export async function generateQuarryAnalysis(scenario: QuarryScenario): Promise<string> {
  // 1. Try calling the secure server backend API first (useful for production / Android integration)
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        return data.text;
      }
    }
  } catch (e) {
    console.warn("Le serveur API n'a pas répondu, tentative en direct côté client...", e);
  }

  // 2. Fallback to client-side API execution if the backend is not running (e.g. Vite dev mode)
  const summary = calculateScenarioSummary(scenario);
  const ai = getAiClient();

    const languageNames = {
      fr: 'Français',
      en: 'Anglais (English)',
      ar: 'Arabe (العربية)',
      es: 'Espagnol (Español)'
    };
    const targetLangName = languageNames[scenario.lang || 'fr'] || 'Français';

    const prompt = `
Vous êtes un consultant senior en contrôle de gestion industrielle et en exploitation de carrières de granulats.
Votre tâche est de fournir un audit d'exploitation détaillé et des pistes concrètes d'optimisation basées sur les données ci-dessous.

=== DONNÉES DE L'EXPLOITATION ===
Nom du Scénario : ${scenario.nom}
${scenario.nomEntreprise ? `Entreprise : ${scenario.nomEntreprise}` : ''}
${scenario.localisation ? `Localisation : ${scenario.localisation}` : ''}
${scenario.substance ? `Substance exploitée : ${scenario.substance}` : ''}
${scenario.destination ? `Destination du produit : ${scenario.destination}` : ''}
${scenario.periodeConcerne ? `Période concernée : ${scenario.periodeConcerne}` : ''}
Périodicité des calculs : ${scenario.periode === 'hebdomadaire' ? 'Hebdomadaire' : scenario.periode === 'mensuel' ? 'Mensuel' : 'Annuel'}
Volume de production : ${scenario.productionTonnage.toLocaleString('fr-FR')} Tonnes (${Math.round(scenario.productionTonnage / (scenario.densite || 1.6)).toLocaleString('fr-FR')} m³ à une densité de ${scenario.densite || 1.6} T/m³)
Devise : ${scenario.devise}
Prix de vente moyen : ${scenario.prixVenteMoyenParTonne} ${scenario.devise}/Tonne (${(scenario.prixVenteMoyenParTonne * (scenario.densite || 1.6)).toFixed(2)} ${scenario.devise}/m³)
Chiffre d'affaires estimé : ${summary.totalVentes.toLocaleString('fr-FR')} ${scenario.devise}
Coût global de revient : ${summary.totalGlobal.toLocaleString('fr-FR')} ${scenario.devise}
Coût moyen de revient : ${summary.coutParTonneGlobal.toFixed(2)} ${scenario.devise}/Tonne (${(summary.coutParTonneGlobal * (scenario.densite || 1.6)).toFixed(2)} ${scenario.devise}/m³)
Marge globale d'exploitation : ${summary.margeGlobale.toLocaleString('fr-FR')} ${scenario.devise} (${summary.margePourcent.toFixed(1)}%)
Marge unitaire : ${summary.margeParTonne.toFixed(2)} ${scenario.devise}/Tonne (${(summary.margeParTonne * (scenario.densite || 1.6)).toFixed(2)} ${scenario.devise}/m³)

=== RÉPARTITION PAR RUBRIQUE (PROCESSUS) ===
${summary.items.map(item => `- **${item.nom}** : Coût Total = ${item.totalCout.toLocaleString('fr-FR')} ${scenario.devise} (${item.pourcentage.toFixed(1)}%), soit ${item.coutParTonne.toFixed(2)} ${scenario.devise}/T
  Détail : Gasoil = ${item.gasoilCout.toLocaleString('fr-FR')}, Pièces = ${item.piecesRechangeCout.toLocaleString('fr-FR')}, Amortissement = ${item.amortissementCout.toLocaleString('fr-FR')}, Location = ${item.locationCout.toLocaleString('fr-FR')}, Personnel = ${(item.personnelPaieCout + item.personnelRepasCout + item.personnelHebergementCout).toLocaleString('fr-FR')}, Taxes = ${item.taxesCout.toLocaleString('fr-FR')}`).join('\n')}

=== RÉPARTITION PAR NATURE DE DÉPENSE ===
- **Gasoil (carburant)** : ${summary.breakdownByCategory.gasoil.toLocaleString('fr-FR')} ${scenario.devise} (${summary.totalGlobal > 0 ? ((summary.breakdownByCategory.gasoil / summary.totalGlobal) * 100).toFixed(1) : 0}%)
- **Pièces de Rechange (maintenance)** : ${summary.breakdownByCategory.pieces.toLocaleString('fr-FR')} ${scenario.devise} (${summary.totalGlobal > 0 ? ((summary.breakdownByCategory.pieces / summary.totalGlobal) * 100).toFixed(1) : 0}%)
- **Amortissement (investissement matériel)** : ${summary.breakdownByCategory.amortissement.toLocaleString('fr-FR')} ${scenario.devise} (${summary.totalGlobal > 0 ? ((summary.breakdownByCategory.amortissement / summary.totalGlobal) * 100).toFixed(1) : 0}%)
- **Location de Matériel (externe/sous-traitance)** : ${summary.breakdownByCategory.location.toLocaleString('fr-FR')} ${scenario.devise} (${summary.totalGlobal > 0 ? ((summary.breakdownByCategory.location / summary.totalGlobal) * 100).toFixed(1) : 0}%)
- **Personnel (salaires + logistique repas/hébergement)** : ${summary.breakdownByCategory.personnelTotal.toLocaleString('fr-FR')} ${scenario.devise} (${summary.totalGlobal > 0 ? ((summary.breakdownByCategory.personnelTotal / summary.totalGlobal) * 100).toFixed(1) : 0}%)
- **Impôts, Taxes & Redevances** : ${summary.breakdownByCategory.taxes.toLocaleString('fr-FR')} ${scenario.devise} (${summary.totalGlobal > 0 ? ((summary.breakdownByCategory.taxes / summary.totalGlobal) * 100).toFixed(1) : 0}%)

Veuillez structurer votre rapport sous forme de document Markdown professionnel comprenant les sections suivantes :

1. **💡 Diagnostics de Performance Globale** : Évaluation de la santé financière globale, de la rentabilité (marge %) et du coût de revient à la tonne par rapport au prix de vente. Est-ce viable ?
2. **🔍 Analyse des Postes de Dépenses Critiques** : Identifier les 2 ou 3 postes de dépenses (nature ou processus) les plus lourds et expliquer pourquoi ils pèsent sur l'exploitation.
3. **🛠️ Plan d'Action Opérationnel & Recommandations** : Proposer 3 à 5 recommandations opérationnelles spécifiques pour réduire les coûts (ex: amélioration du ratio de consommation d'engins, gestion des équipes de travail, optimisation de la maintenance préventive, arbitrage achat/location pour les machines externes). Estimez l'économie potentielle si possible en pourcentage.
4. **📊 Seuil de Rentabilité & Recommandations de Vente** : Quel serait le prix de vente optimal pour atteindre une marge cible de 25% ? Quel est le seuil de production critique (tonnage minimal) à cette marge ?

Soyez précis, professionnel et utilisez un vocabulaire propre aux travaux publics et à l'exploitation de carrières.
RÉDIGEZ LE RAPPORT ENTIÈREMENT EN LANGUE ${targetLangName.toUpperCase()}.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("L'API Gemini a renvoyé une réponse vide.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Erreur de génération Gemini:", error);
    throw new Error(error.message || "Erreur de connexion avec l'API Gemini.");
  }
}
