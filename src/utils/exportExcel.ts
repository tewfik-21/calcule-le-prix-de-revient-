import * as XLSX from 'xlsx';
import { QuarryScenario } from '../types';
import { calculateScenarioSummary } from './calculations';

export const exportScenarioToExcel = (scenario: QuarryScenario) => {
  const summary = calculateScenarioSummary(scenario);

  // Format data for the main overview sheet
  const overviewData = [
    ['Paramètres Globaux', 'Valeur'],
    ['Nom du Scénario', scenario.nom],
    ['Tonnage de Production', `${scenario.productionTonnage.toLocaleString()} ${scenario.unitePrincipale || 'T'}`],
    ['Densité', scenario.densite],
    ['Volume Produit', `${summary.volumeTotal.toLocaleString()} m3`],
    ['', ''],
    ['Résumé Financier', 'Valeur (' + scenario.devise + ')'],
    ['Chiffre d\'Affaires Total', summary.totalVentes],
    ['Coût de Revient Total', summary.totalGlobal],
    ['Marge Nette', summary.totalVentes - summary.totalGlobal],
    ['Coût unitaire (/Tonne)', summary.coutParTonneGlobal],
    ['', ''],
    ['Répartition des Dépenses', 'Total (' + scenario.devise + ')', 'Coût / Tonne'],
  ];

  summary.details.forEach(detail => {
    overviewData.push([
      detail.nom,
      detail.totalCout,
      detail.coutParTonne
    ]);
  });

  // Create workbook and add sheets
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Overview
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Résumé");

  // Sheet 2: Detailed Process Costs
  const detailedData: (string | number)[][] = [
    ['Processus', 'Gasoil', 'Pièces', 'Salaires', 'Location', 'Amortissement', 'Taxes', 'TOTAL']
  ];
  
  summary.details.forEach(detail => {
    detailedData.push([
      detail.nom,
      detail.gasoilCout,
      detail.piecesRechangeCout,
      detail.personnelPaieCout + detail.personnelRepasCout + detail.personnelHebergementCout,
      detail.locationCout,
      detail.amortissementCout,
      detail.taxesCout,
      detail.totalCout
    ]);
  });

  const wsDetails = XLSX.utils.aoa_to_sheet(detailedData);
  XLSX.utils.book_append_sheet(wb, wsDetails, "Détails Coûts");

  // Generate Excel file
  XLSX.writeFile(wb, `Rapport_Carriere_${scenario.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
