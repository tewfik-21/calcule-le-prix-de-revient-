import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { calculateScenarioSummary } from './src/utils/calculations';
import { generateDefaultScenario, alternativeTemplates } from './src/data/defaultTemplates';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' })); // Support base64 image uploading up to 10MB
app.use(express.static(path.join(__dirname, 'dist')));

// CORS middleware to allow Android apps or other clients to connect
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Scenarios Templates endpoint for Android Integration
app.get('/api/scenarios/templates', (req, res) => {
  try {
    res.json({
      defaultScenario: generateDefaultScenario(),
      alternativeTemplates: alternativeTemplates
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Calculation endpoint (processes raw inputs and returns summary & breakdown)
app.post('/api/calculate', (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) {
      return res.status(400).json({ error: "Le paramètre 'scenario' est requis dans le corps de la requête." });
    }
    const summary = calculateScenarioSummary(scenario);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erreur de calcul" });
  }
});

// Secure Server-side Gemini AI Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) {
      return res.status(400).json({ error: "Le paramètre 'scenario' est requis dans le corps de la requête." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Clé API Gemini non configurée sur le serveur. Veuillez renseigner GEMINI_API_KEY." });
    }

    const summary = calculateScenarioSummary(scenario);
    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error("L'API Gemini a renvoyé une réponse vide.");
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erreur de génération d'analyse Gemini :", error);
    res.status(500).json({ error: error.message || "Erreur de connexion avec l'API Gemini." });
  }
});


// In-memory store for shared scenario
let sharedScenarioData: any = null;

// Endpoint to share/publish the scenario
app.post('/api/scenario/share', (req, res) => {
  try {
    const { scenario, summary, aiReport } = req.body;
    if (!scenario) {
      return res.status(400).json({ error: "Le paramètre 'scenario' est requis." });
    }
    const calculatedSummary = summary || calculateScenarioSummary(scenario);
    sharedScenarioData = {
      scenario,
      summary: calculatedSummary,
      aiReport: aiReport || null,
      sharedAt: new Date().toISOString()
    };
    console.log("📱 [PARTAGE] Nouveau scénario partagé :", scenario.nom, "à", sharedScenarioData.sharedAt);
    res.json({ success: true, message: "Scénario partagé avec succès !", sharedAt: sharedScenarioData.sharedAt });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erreur de partage" });
  }
});

// Endpoint to retrieve the last shared scenario
app.get('/api/scenario/share', (req, res) => {
  if (!sharedScenarioData) {
    return res.status(404).json({ error: "Aucun scénario n'a été partagé pour le moment." });
  }
  console.log("📱 [LECTURE] Le mobile a récupéré le scénario :", sharedScenarioData.scenario.nom);
  res.json(sharedScenarioData);
});

// Fallback to React app index.html for any other routing requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// Start listening
app.listen(port, () => {
  console.log(`==========================================================`);
  console.log(`  CALCULATEUR DE PRIX DE REVIENT CARRIÈRE - RUNNING`);
  console.log(`  Serveur accessible sur : http://localhost:${port}`);
  console.log(`  API exposée pour intégration Android.`);
  console.log(`==========================================================`);
});
