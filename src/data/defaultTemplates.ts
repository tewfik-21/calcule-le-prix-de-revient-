import { QuarryScenario, ProcessusCostData } from '../types';

export const generateDefaultScenario = (): QuarryScenario => {
  return {
    id: 'scenario-default-1',
    nom: 'Exploitation Standard - 25k Tonnes/mois',
    dateCreation: new Date().toLocaleDateString('fr-FR'),
    productionTonnage: 25000,
    periode: 'mensuel',
    devise: '€',
    prixVenteMoyenParTonne: 12.50,
    prixGasoilMoyen: 1.65,
    processus: {
      front_de_taille: {
        id: 'front_de_taille',
        nom: 'Front de Taille',
        description: 'Forage, minage et extraction primaire au gisement.',
        machinesInternes: [
          {
            id: 'm-ft-1',
            nom: 'Pelle d\'extraction CAT 349 (50T)',
            heuresUtilisation: 160,
            consommationHoraire: 38,
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 4200,
            valeurAchat: 450000,
            dureeAmortissementAns: 7,
            isSaisieDirecte: false
          },
          {
            id: 'm-ft-2',
            nom: 'Foret d\'abattage Atlas Copco',
            heuresUtilisation: 80,
            consommationHoraire: 24,
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 1800,
            valeurAchat: 180000,
            dureeAmortissementAns: 5,
            isSaisieDirecte: false
          }
        ],
        machinesExternes: [
          {
            id: 'me-ft-1',
            nom: 'Prestation de Minage (Tir de mine sous-traité)',
            typeTarif: 'mois',
            tarifUnitaire: 8500,
            quantiteTemps: 1
          },
          {
            id: 'me-ft-explosifs',
            nom: 'Achat d\'explosifs (Cartouches, détonateurs)',
            typeTarif: 'mois',
            tarifUnitaire: 4500,
            quantiteTemps: 1
          },
          {
            id: 'me-ft-location',
            nom: 'Location d\'un brise-roche hydraulique (BRH)',
            typeTarif: 'jour',
            tarifUnitaire: 380,
            quantiteTemps: 6
          }
        ],
        personnel: [
          {
            id: 'p-ft-1',
            nom: 'Foreur / Mineur',
            poste: 'Mineur Qualifié',
            nombre: 1,
            salaireBaseMensuel: 2400,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          },
          {
            id: 'p-ft-2',
            nom: 'Conducteur Pelle',
            poste: 'Conducteur d\'engin Catégorie 4',
            nombre: 1,
            salaireBaseMensuel: 2200,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          }
        ],
        taxes: [
          {
            id: 't-ft-1',
            nom: 'Taxe locale d\'extraction gisement',
            montantForfaitaire: 1200,
            taxeParTonne: 0.15
          }
        ]
      },
      transport: {
        id: 'transport',
        nom: 'Transport & Roulage',
        description: 'Transport des matériaux abattus vers le groupe de concassage.',
        machinesInternes: [
          {
            id: 'm-tr-1',
            nom: 'Dumper Rigide Caterpillar 773 (2 unités)',
            heuresUtilisation: 320, // 160h chacun
            consommationHoraire: 30,
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 5800,
            valeurAchat: 580000, // pour deux
            dureeAmortissementAns: 8,
            isSaisieDirecte: false
          }
        ],
        machinesExternes: [
          {
            id: 'me-tr-1',
            nom: 'Dumper articulé de secours (location)',
            typeTarif: 'jour',
            tarifUnitaire: 450,
            quantiteTemps: 5
          }
        ],
        personnel: [
          {
            id: 'p-tr-1',
            nom: 'Chauffeurs de Dumper',
            poste: 'Chauffeur d\'engins lourds',
            nombre: 2,
            salaireBaseMensuel: 2000,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          }
        ],
        taxes: [
          {
            id: 't-tr-1',
            nom: 'Taxe à l\'essieu et vignette',
            montantForfaitaire: 600,
            taxeParTonne: 0
          }
        ]
      },
      concassage: {
        id: 'concassage',
        nom: 'Concassage & Traitement',
        description: 'Processus mécanique de réduction granulométrique et criblage.',
        machinesInternes: [
          {
            id: 'm-co-1',
            nom: 'Groupe Primaire à Mâchoires (Électricité groupe)',
            heuresUtilisation: 160,
            consommationHoraire: 45, // equivalent gasoil du groupe electrogène
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 8900, // machoires, grilles, convoyeurs
            valeurAchat: 950000,
            dureeAmortissementAns: 10,
            isSaisieDirecte: false
          },
          {
            id: 'm-co-2',
            nom: 'Cribleur mobile de calibrage secondaire',
            heuresUtilisation: 120,
            consommationHoraire: 18,
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 2300,
            valeurAchat: 320000,
            dureeAmortissementAns: 8,
            isSaisieDirecte: false
          }
        ],
        machinesExternes: [
          {
            id: 'me-co-loc',
            nom: 'Location d\'un convoyeur sauterelle mobile',
            typeTarif: 'mois',
            tarifUnitaire: 1200,
            quantiteTemps: 1
          }
        ],
        personnel: [
          {
            id: 'p-co-1',
            nom: 'Chef d\'installation',
            poste: 'Pilote d\'installation',
            nombre: 1,
            salaireBaseMensuel: 2600,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          },
          {
            id: 'p-co-2',
            nom: 'Aides de Table / Convoyeurs',
            poste: 'Agent d\'entretien concassage',
            nombre: 2,
            salaireBaseMensuel: 1800,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          }
        ],
        taxes: [
          {
            id: 't-co-1',
            nom: 'Taxe sur les activités polluantes (TGAP)',
            montantForfaitaire: 0,
            taxeParTonne: 0.08
          }
        ]
      },
      chargement: {
        id: 'chargement',
        nom: 'Chargement & Expéditions',
        description: 'Chargement des camions clients et pesage au pont-bascule.',
        machinesInternes: [
          {
            id: 'm-ch-1',
            nom: 'Chargeuse sur pneus Volvo L220 (Vente)',
            heuresUtilisation: 180,
            consommationHoraire: 26,
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 3500,
            valeurAchat: 380000,
            dureeAmortissementAns: 7,
            isSaisieDirecte: false
          }
        ],
        machinesExternes: [
          {
            id: 'me-ch-loc',
            nom: 'Location de secours - Chargeuse articulée',
            typeTarif: 'jour',
            tarifUnitaire: 350,
            quantiteTemps: 4
          }
        ],
        personnel: [
          {
            id: 'p-ch-1',
            nom: 'Conducteur Chargeuse',
            poste: 'Conducteur d\'engin qualifié',
            nombre: 1,
            salaireBaseMensuel: 2200,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          },
          {
            id: 'p-ch-2',
            nom: 'Peseur Pont-Bascule',
            poste: 'Agent d\'expédition',
            nombre: 1,
            salaireBaseMensuel: 1900,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          }
        ],
        taxes: [
          {
            id: 't-ch-1',
            nom: 'Frais d\'étalonnage pont bascule annuel proratisé',
            montantForfaitaire: 250,
            taxeParTonne: 0
          }
        ]
      },
      moyens_generaux: {
        id: 'moyens_generaux',
        nom: 'Moyens Généraux & Administration',
        description: 'Infrastructures d\'appui, ateliers de maintenance, bureaux et gestion du site.',
        machinesInternes: [
          {
            id: 'm-mg-1',
            nom: 'Camion Citerne à Eau (Abattage poussière) & Grader',
            heuresUtilisation: 60,
            consommationHoraire: 22,
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 1200,
            valeurAchat: 150000,
            dureeAmortissementAns: 10,
            isSaisieDirecte: false
          },
          {
            id: 'm-mg-2',
            nom: 'Générateur de chantier Bureau & Ateliers',
            heuresUtilisation: 200,
            consommationHoraire: 6,
            prixGasoilLitre: 1.65,
            piecesRechangeCout: 400,
            valeurAchat: 35000,
            dureeAmortissementAns: 5,
            isSaisieDirecte: false
          }
        ],
        machinesExternes: [
          {
            id: 'me-mg-1',
            nom: 'Location d\'Algeco Bureaux administratifs',
            typeTarif: 'mois',
            tarifUnitaire: 850,
            quantiteTemps: 1
          }
        ],
        personnel: [
          {
            id: 'p-mg-1',
            nom: 'Directeur de Carrière',
            poste: 'Ingénieur d\'exploitation',
            nombre: 1,
            salaireBaseMensuel: 4200,
            chargesSocialesPourcent: 45,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 600,
            isSaisieDirecte: false
          },
          {
            id: 'p-mg-2',
            nom: 'Gardiennage & Sécurité (2 agents)',
            poste: 'Agent de sécurité',
            nombre: 2,
            salaireBaseMensuel: 1600,
            chargesSocialesPourcent: 40,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 350,
            isSaisieDirecte: false
          },
          {
            id: 'p-mg-3',
            nom: 'Mécanicien d\'Atelier',
            poste: 'Mécanicien engins de chantier',
            nombre: 1,
            salaireBaseMensuel: 2400,
            chargesSocialesPourcent: 42,
            repasMensuelParPers: 220,
            hebergementMensuelParPers: 450,
            isSaisieDirecte: false
          }
        ],
        taxes: [
          {
            id: 't-mg-1',
            nom: 'Impôts fonciers, Taxes professionnelles',
            montantForfaitaire: 3800,
            taxeParTonne: 0
          }
        ]
      }
    }
  };
};

export const alternativeTemplates = [
  {
    id: 'temp-empty',
    nom: 'Modèle Vierge',
    description: 'Structure prête à l\'emploi sans machines pré-saisies pour une saisie intégrale personnalisée.',
    productionTonnage: 10000,
    prixVenteMoyenParTonne: 10,
    prixGasoilMoyen: 1.50
  },
  {
    id: 'temp-medium',
    nom: 'Modèle Moyen (Sable & Gravier)',
    description: 'Extraction standard avec pelle de 40T et 2 dumpers. Production d\'environ 15,000 T/mois.',
    productionTonnage: 15000,
    prixVenteMoyenParTonne: 11.00,
    prixGasoilMoyen: 1.65
  },
  {
    id: 'temp-large',
    nom: 'Modèle Grande Carrière (Roche massive)',
    description: 'Abattage lourd à l\'explosif, concasseur à haute capacité, chargeuses jumelées. Production de 50,000 T/mois.',
    productionTonnage: 50000,
    prixVenteMoyenParTonne: 14.00,
    prixGasoilMoyen: 1.60
  }
];
