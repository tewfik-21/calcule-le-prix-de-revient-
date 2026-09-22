import { MachineInterne, MachineExterne, PersonnelCharges, TaxeRubrique, ProcessusCostData, QuarryScenario, CostSummaryItem } from '../types';

export const calculateMachineInterneCout = (machine: MachineInterne, periode: 'hebdomadaire' | 'mensuel' | 'annuel'): {
  gasoil: number;
  pieces: number;
  amortissement: number;
  total: number;
} => {
  if (machine.isSaisieDirecte) {
    return {
      gasoil: machine.gasoilCoutGlobal || 0,
      pieces: machine.piecesRechangeGlobal || 0,
      amortissement: machine.amortissementGlobal || 0,
      total: (machine.gasoilCoutGlobal || 0) + (machine.piecesRechangeGlobal || 0) + (machine.amortissementGlobal || 0)
    };
  }

  const gasoil = machine.heuresUtilisation * machine.consommationHoraire * machine.prixGasoilLitre;
  const pieces = machine.piecesRechangeCout;

  // Calcul d'amortissement
  let amortissement = 0;
  if (machine.amortissementAnnuelDirect) {
    amortissement = machine.amortissementAnnuelDirect;
  } else if (machine.valeurAchat && machine.dureeAmortissementAns > 0) {
    amortissement = machine.valeurAchat / machine.dureeAmortissementAns;
  }

  // Si l'amortissement est annuel mais qu'on calcule au mois, on divise par 12. Si hebdomadaire, on divise par 52.
  if (periode === 'mensuel' && !machine.amortissementAnnuelDirect) {
    amortissement = amortissement / 12;
  } else if (periode === 'hebdomadaire' && !machine.amortissementAnnuelDirect) {
    amortissement = amortissement / 52;
  }

  return {
    gasoil,
    pieces,
    amortissement,
    total: gasoil + pieces + amortissement
  };
};

export const calculateMachineExterneCout = (machine: MachineExterne): number => {
  return machine.tarifUnitaire * machine.quantiteTemps;
};

export const calculatePersonnelCout = (personnel: PersonnelCharges, periode: 'hebdomadaire' | 'mensuel' | 'annuel'): {
  paie: number;
  repas: number;
  hebergement: number;
  total: number;
} => {
  if (personnel.isSaisieDirecte) {
    return {
      paie: personnel.paieGlobal || 0,
      repas: personnel.repasGlobal || 0,
      hebergement: personnel.hebergementGlobal || 0,
      total: (personnel.paieGlobal || 0) + (personnel.repasGlobal || 0) + (personnel.hebergementGlobal || 0)
    };
  }

  const multiplicateurMois = periode === 'annuel' ? 12 : (periode === 'hebdomadaire' ? (12 / 52) : 1);
  const tauxCharges = 1 + (personnel.chargesSocialesPourcent / 100);

  const paie = personnel.nombre * personnel.salaireBaseMensuel * tauxCharges * multiplicateurMois;
  const repas = personnel.nombre * personnel.repasMensuelParPers * multiplicateurMois;
  const hebergement = personnel.nombre * personnel.hebergementMensuelParPers * multiplicateurMois;

  return {
    paie,
    repas,
    hebergement,
    total: paie + repas + hebergement
  };
};

export const calculateTaxeCout = (taxe: TaxeRubrique, productionTonnage: number): number => {
  return taxe.montantForfaitaire + (taxe.taxeParTonne * productionTonnage);
};

export const calculateProcessusCost = (
  processus: ProcessusCostData,
  periode: 'hebdomadaire' | 'mensuel' | 'annuel',
  productionTonnage: number,
  prixGasoilMoyen?: number
): CostSummaryItem => {
  let gasoilCout = 0;
  let piecesRechangeCout = 0;
  let amortissementCout = 0;
  let locationCout = 0;
  let personnelPaieCout = 0;
  let personnelRepasCout = 0;
  let personnelHebergementCout = 0;
  let taxesCout = 0;

  // Machines internes
  processus.machinesInternes.forEach(m => {
    const machineWithGlobalGasoil = {
      ...m,
      prixGasoilLitre: (prixGasoilMoyen !== undefined && !m.isSaisieDirecte) ? prixGasoilMoyen : (m.prixGasoilLitre || 0)
    };
    const detail = calculateMachineInterneCout(machineWithGlobalGasoil, periode);
    gasoilCout += detail.gasoil;
    piecesRechangeCout += detail.pieces;
    amortissementCout += detail.amortissement;
  });

  // Machines externes
  processus.machinesExternes.forEach(m => {
    locationCout += calculateMachineExterneCout(m);
  });

  // Personnel
  processus.personnel.forEach(p => {
    const detail = calculatePersonnelCout(p, periode);
    personnelPaieCout += detail.paie;
    personnelRepasCout += detail.repas;
    personnelHebergementCout += detail.hebergement;
  });

  // Taxes
  processus.taxes.forEach(t => {
    taxesCout += calculateTaxeCout(t, productionTonnage);
  });

  const totalCout =
    gasoilCout +
    piecesRechangeCout +
    amortissementCout +
    locationCout +
    personnelPaieCout +
    personnelRepasCout +
    personnelHebergementCout +
    taxesCout;

  const coutParTonne = productionTonnage > 0 ? totalCout / productionTonnage : 0;

  return {
    id: processus.id,
    nom: processus.nom,
    gasoilCout,
    piecesRechangeCout,
    amortissementCout,
    locationCout,
    personnelPaieCout,
    personnelRepasCout,
    personnelHebergementCout,
    taxesCout,
    totalCout,
    pourcentage: 0, // Sera calculé par rapport au global
    coutParTonne
  };
};

export const calculateScenarioSummary = (scenario: QuarryScenario): {
  items: CostSummaryItem[];
  totalGlobal: number;
  coutParTonneGlobal: number;
  totalVentes: number;
  margeGlobale: number;
  margeParTonne: number;
  margePourcent: number;
  breakdownByCategory: {
    gasoil: number;
    pieces: number;
    amortissement: number;
    location: number;
    personnelPaie: number;
    personnelRepas: number;
    personnelHebergement: number;
    personnelTotal: number;
    taxes: number;
    materielInterneTotal: number;
  };
} => {
  const keys: ('front_de_taille' | 'transport' | 'concassage' | 'chargement' | 'moyens_generaux')[] = [
    'front_de_taille',
    'transport',
    'concassage',
    'chargement',
    'moyens_generaux'
  ];

  const items: CostSummaryItem[] = keys.map(key => {
    return calculateProcessusCost(scenario.processus[key], scenario.periode, scenario.productionTonnage, scenario.prixGasoilMoyen);
  });

  const totalGlobal = items.reduce((sum, item) => sum + item.totalCout, 0);

  // Mettre à jour les pourcentages
  items.forEach(item => {
    item.pourcentage = totalGlobal > 0 ? (item.totalCout / totalGlobal) * 100 : 0;
  });

  const coutParTonneGlobal = scenario.productionTonnage > 0 ? totalGlobal / scenario.productionTonnage : 0;

  // Éléments de chiffre d'affaires et de rentabilité
  const totalVentes = scenario.productionTonnage * scenario.prixVenteMoyenParTonne;
  const margeGlobale = totalVentes - totalGlobal;
  const margeParTonne = scenario.prixVenteMoyenParTonne - coutParTonneGlobal;
  const margePourcent = totalVentes > 0 ? (margeGlobale / totalVentes) * 100 : 0;

  // Consolider par nature de dépense
  const breakdown = {
    gasoil: items.reduce((sum, item) => sum + item.gasoilCout, 0),
    pieces: items.reduce((sum, item) => sum + item.piecesRechangeCout, 0),
    amortissement: items.reduce((sum, item) => sum + item.amortissementCout, 0),
    location: items.reduce((sum, item) => sum + item.locationCout, 0),
    personnelPaie: items.reduce((sum, item) => sum + item.personnelPaieCout, 0),
    personnelRepas: items.reduce((sum, item) => sum + item.personnelRepasCout, 0),
    personnelHebergement: items.reduce((sum, item) => sum + item.personnelHebergementCout, 0),
    personnelTotal: 0,
    taxes: items.reduce((sum, item) => sum + item.taxesCout, 0),
    materielInterneTotal: 0
  };

  breakdown.personnelTotal = breakdown.personnelPaie + breakdown.personnelRepas + breakdown.personnelHebergement;
  breakdown.materielInterneTotal = breakdown.gasoil + breakdown.pieces + breakdown.amortissement;

  return {
    items,
    totalGlobal,
    coutParTonneGlobal,
    totalVentes,
    margeGlobale,
    margeParTonne,
    margePourcent,
    breakdownByCategory: breakdown
  };
};
