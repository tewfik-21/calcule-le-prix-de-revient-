export interface MachineInterne {
  id: string;
  nom: string;
  heuresUtilisation: number; // heures par mois ou an
  consommationHoraire: number; // litres par heure
  prixGasoilLitre: number; // €/litre
  piecesRechangeCout: number; // € (total ou annuel/mensuel)
  valeurAchat: number; // € (pour l'amortissement)
  dureeAmortissementAns: number; // en années
  amortissementAnnuelDirect?: number; // si saisie directe de l'amortissement
  isSaisieDirecte: boolean; // si vrai, saisie directe des coûts globaux
  gasoilCoutGlobal?: number;
  piecesRechangeGlobal?: number;
  amortissementGlobal?: number;
}

export interface MachineExterne {
  id: string;
  nom: string;
  typeTarif: 'heure' | 'jour' | 'mois';
  tarifUnitaire: number; // € par unité de temps
  quantiteTemps: number; // nombre d'heures/jours/mois
}

export interface PersonnelCharges {
  id: string;
  nom?: string;
  poste: string;
  nombre: number;
  salaireBaseMensuel: number; // par personne
  chargesSocialesPourcent: number; // pourcentage de charges patronales
  repasMensuelParPers: number; // coût repas par personne par mois
  hebergementMensuelParPers: number; // coût hébergement par personne par mois
  isSaisieDirecte: boolean;
  paieGlobal?: number;
  repasGlobal?: number;
  hebergementGlobal?: number;
}

export interface TaxeRubrique {
  id: string;
  nom: string;
  montantForfaitaire: number; // coût fixe
  taxeParTonne: number; // € par tonne de production
}

export interface ProcessusCostData {
  id: 'front_de_taille' | 'transport' | 'concassage' | 'chargement' | 'moyens_generaux';
  nom: string;
  description: string;
  machinesInternes: MachineInterne[];
  machinesExternes: MachineExterne[];
  personnel: PersonnelCharges[];
  taxes: TaxeRubrique[];
  modeAbattage?: 'explosif' | 'mecanique';
}

export interface QuarryScenario {
  id: string;
  nom: string;
  dateCreation: string;
  productionTonnage: number; // Tonnage produit sur la période
  periode: 'hebdomadaire' | 'mensuel' | 'annuel';
  devise: string; // € ou DA ou $
  prixVenteMoyenParTonne: number; // Pour l'analyse de rentabilité
  prixGasoilMoyen: number; // Prix du carburant global par défaut
  processus: {
    front_de_taille: ProcessusCostData;
    transport: ProcessusCostData;
    concassage: ProcessusCostData;
    chargement: ProcessusCostData;
    moyens_generaux: ProcessusCostData;
  };
  nomEntreprise?: string;
  localisation?: string;
  logoUrl?: string; // Image encodée en Base64
  periodeConcerne?: string;
  lang?: 'fr' | 'en' | 'ar' | 'es';
  substance?: string;
  destination?: string;
  densite?: number; // Masse volumique (T/m3) pour convertir les m3 en Tonnes
  unitePrincipale?: 'T' | 'm3'; // Unité d'analyse principale
  observations?: string; // Notes et observations d'exploitation (pannes, arrêts, absences)
}

export interface CostSummaryItem {
  id: string;
  nom: string;
  gasoilCout: number;
  piecesRechangeCout: number;
  amortissementCout: number;
  locationCout: number;
  personnelPaieCout: number;
  personnelRepasCout: number;
  personnelHebergementCout: number;
  taxesCout: number;
  totalCout: number;
  pourcentage: number;
  coutParTonne: number;
}
