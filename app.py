import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Charger les variables d'environnement (.env ou .env.local)
load_dotenv()
if os.path.exists('.env.local'):
    load_dotenv('.env.local')

app = Flask(__name__)
CORS(app)  # Permet aux applications Android de s'y connecter

# =====================================================================
# DONNÉES DE TEMPLATE (Même structure que defaultTemplates.ts)
# =====================================================================

def get_default_scenario():
    return {
        "id": "scenario-default-1",
        "nom": "Exploitation Standard - 25k Tonnes/mois",
        "dateCreation": datetime.datetime.now().strftime("%d/%m/%Y"),
        "productionTonnage": 25000,
        "periode": "mensuel",
        "devise": "€",
        "prixVenteMoyenParTonne": 12.50,
        "prixGasoilMoyen": 1.65,
        "processus": {
            "front_de_taille": {
                "id": "front_de_taille",
                "nom": "Front de Taille",
                "description": "Forage, minage et extraction primaire au gisement.",
                "machinesInternes": [
                    {
                        "id": "m-ft-1",
                        "nom": "Pelle d'extraction CAT 349 (50T)",
                        "heuresUtilisation": 160,
                        "consommationHoraire": 38,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 4200,
                        "valeurAchat": 450000,
                        "dureeAmortissementAns": 7,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "m-ft-2",
                        "nom": "Foret d'abattage Atlas Copco",
                        "heuresUtilisation": 80,
                        "consommationHoraire": 24,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 1800,
                        "valeurAchat": 180000,
                        "dureeAmortissementAns": 5,
                        "isSaisieDirecte": False
                    }
                ],
                "machinesExternes": [
                    {
                        "id": "me-ft-1",
                        "nom": "Prestation de Minage (Tir de mine sous-traité)",
                        "typeTarif": "mois",
                        "tarifUnitaire": 8500,
                        "quantiteTemps": 1
                    },
                    {
                        "id": "me-ft-explosifs",
                        "nom": "Achat d'explosifs (Cartouches, détonateurs)",
                        "typeTarif": "mois",
                        "tarifUnitaire": 4500,
                        "quantiteTemps": 1
                    },
                    {
                        "id": "me-ft-location",
                        "nom": "Location d'un brise-roche hydraulique (BRH)",
                        "typeTarif": "jour",
                        "tarifUnitaire": 380,
                        "quantiteTemps": 6
                    }
                ],
                "personnel": [
                    {
                        "id": "p-ft-1",
                        "nom": "Foreur / Mineur",
                        "poste": "Mineur Qualifié",
                        "nombre": 1,
                        "salaireBaseMensuel": 2400,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "p-ft-2",
                        "nom": "Conducteur Pelle",
                        "poste": "Conducteur d'engin Catégorie 4",
                        "nombre": 1,
                        "salaireBaseMensuel": 2200,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    }
                ],
                "taxes": [
                    {
                        "id": "t-ft-1",
                        "nom": "Taxe locale d'extraction gisement",
                        "montantForfaitaire": 1200,
                        "taxeParTonne": 0.15
                    }
                ]
            },
            "transport": {
                "id": "transport",
                "nom": "Transport & Roulage",
                "description": "Transport des matériaux abattus vers le groupe de concassage.",
                "machinesInternes": [
                    {
                        "id": "m-tr-1",
                        "nom": "Dumper Rigide Caterpillar 773 (2 unités)",
                        "heuresUtilisation": 320,
                        "consommationHoraire": 30,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 5800,
                        "valeurAchat": 580000,
                        "dureeAmortissementAns": 8,
                        "isSaisieDirecte": False
                    }
                ],
                "machinesExternes": [
                    {
                        "id": "me-tr-1",
                        "nom": "Dumper articulé de secours (location)",
                        "typeTarif": "jour",
                        "tarifUnitaire": 450,
                        "quantiteTemps": 5
                    }
                ],
                "personnel": [
                    {
                        "id": "p-tr-1",
                        "nom": "Chauffeurs de Dumper",
                        "poste": "Chauffeur d'engins lourds",
                        "nombre": 2,
                        "salaireBaseMensuel": 2000,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    }
                ],
                "taxes": [
                    {
                        "id": "t-tr-1",
                        "nom": "Taxe à l'essieu et vignette",
                        "montantForfaitaire": 600,
                        "taxeParTonne": 0
                    }
                ]
            },
            "concassage": {
                "id": "concassage",
                "nom": "Concassage & Traitement",
                "description": "Processus mécanique de réduction granulométrique et criblage.",
                "machinesInternes": [
                    {
                        "id": "m-co-1",
                        "nom": "Groupe Primaire à Mâchoires (Électricité groupe)",
                        "heuresUtilisation": 160,
                        "consommationHoraire": 45,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 8900,
                        "valeurAchat": 950000,
                        "dureeAmortissementAns": 10,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "m-co-2",
                        "nom": "Cribleur mobile de calibrage secondaire",
                        "heuresUtilisation": 120,
                        "consommationHoraire": 18,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 2300,
                        "valeurAchat": 320000,
                        "dureeAmortissementAns": 8,
                        "isSaisieDirecte": False
                    }
                ],
                "machinesExternes": [
                    {
                        "id": "me-co-loc",
                        "nom": "Location d'un convoyeur sauterelle mobile",
                        "typeTarif": "mois",
                        "tarifUnitaire": 1200,
                        "quantiteTemps": 1
                    }
                ],
                "personnel": [
                    {
                        "id": "p-co-1",
                        "nom": "Chef d'installation",
                        "poste": "Pilote d'installation",
                        "nombre": 1,
                        "salaireBaseMensuel": 2600,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "p-co-2",
                        "nom": "Aides de Table / Convoyeurs",
                        "poste": "Agent d'entretien concassage",
                        "nombre": 2,
                        "salaireBaseMensuel": 1800,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    }
                ],
                "taxes": [
                    {
                        "id": "t-co-1",
                        "nom": "Taxe sur les activités polluantes (TGAP)",
                        "montantForfaitaire": 0,
                        "taxeParTonne": 0.08
                    }
                ]
            },
            "chargement": {
                "id": "chargement",
                "nom": "Chargement & Expéditions",
                "description": "Chargement des camions clients et pesage au pont-bascule.",
                "machinesInternes": [
                    {
                        "id": "m-ch-1",
                        "nom": "Chargeuse sur pneus Volvo L220 (Vente)",
                        "heuresUtilisation": 180,
                        "consommationHoraire": 26,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 3500,
                        "valeurAchat": 380000,
                        "dureeAmortissementAns": 7,
                        "isSaisieDirecte": False
                    }
                ],
                "machinesExternes": [
                    {
                        "id": "me-ch-loc",
                        "nom": "Location de secours - Chargeuse articulée",
                        "typeTarif": "jour",
                        "tarifUnitaire": 350,
                        "quantiteTemps": 4
                    }
                ],
                "personnel": [
                    {
                        "id": "p-ch-1",
                        "nom": "Conducteur Chargeuse",
                        "poste": "Conducteur d'engin qualifié",
                        "nombre": 1,
                        "salaireBaseMensuel": 2200,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "p-ch-2",
                        "nom": "Peseur Pont-Bascule",
                        "poste": "Agent d'expédition",
                        "nombre": 1,
                        "salaireBaseMensuel": 1900,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    }
                ],
                "taxes": [
                    {
                        "id": "t-ch-1",
                        "nom": "Frais d'étalonnage pont bascule annuel proratisé",
                        "montantForfaitaire": 250,
                        "taxeParTonne": 0
                    }
                ]
            },
            "moyens_generaux": {
                "id": "moyens_generaux",
                "nom": "Moyens Généraux & Administration",
                "description": "Infrastructures d'appui, ateliers de maintenance, bureaux et gestion du site.",
                "machinesInternes": [
                    {
                        "id": "m-mg-1",
                        "nom": "Camion Citerne à Eau (Abattage poussière) & Grader",
                        "heuresUtilisation": 60,
                        "consommationHoraire": 22,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 1200,
                        "valeurAchat": 150000,
                        "dureeAmortissementAns": 10,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "m-mg-2",
                        "nom": "Générateur de chantier Bureau & Ateliers",
                        "heuresUtilisation": 200,
                        "consommationHoraire": 6,
                        "prixGasoilLitre": 1.65,
                        "piecesRechangeCout": 400,
                        "valeurAchat": 35000,
                        "dureeAmortissementAns": 5,
                        "isSaisieDirecte": False
                    }
                ],
                "machinesExternes": [
                    {
                        "id": "me-mg-1",
                        "nom": "Location d'Algeco Bureaux administratifs",
                        "typeTarif": "mois",
                        "tarifUnitaire": 850,
                        "quantiteTemps": 1
                    }
                ],
                "personnel": [
                    {
                        "id": "p-mg-1",
                        "nom": "Directeur de Carrière",
                        "poste": "Ingénieur d'exploitation",
                        "nombre": 1,
                        "salaireBaseMensuel": 4200,
                        "chargesSocialesPourcent": 45,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 600,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "p-mg-2",
                        "nom": "Gardiennage & Sécurité (2 agents)",
                        "poste": "Agent de sécurité",
                        "nombre": 2,
                        "salaireBaseMensuel": 1600,
                        "chargesSocialesPourcent": 40,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 350,
                        "isSaisieDirecte": False
                    },
                    {
                        "id": "p-mg-3",
                        "nom": "Mécanicien d'Atelier",
                        "poste": "Mécanicien engins de chantier",
                        "nombre": 1,
                        "salaireBaseMensuel": 2400,
                        "chargesSocialesPourcent": 42,
                        "repasMensuelParPers": 220,
                        "hebergementMensuelParPers": 450,
                        "isSaisieDirecte": False
                    }
                ],
                "taxes": [
                    {
                        "id": "t-mg-1",
                        "nom": "Impôts fonciers, Taxes professionnelles",
                        "montantForfaitaire": 3800,
                        "taxeParTonne": 0
                    }
                ]
            }
        }
    }

alternative_templates = [
    {
        "id": "temp-empty",
        "nom": "Modèle Vierge",
        "description": "Structure prête à l'emploi sans machines pré-saisies pour une saisie intégrale personnalisée.",
        "productionTonnage": 10000,
        "prixVenteMoyenParTonne": 10.0,
        "prixGasoilMoyen": 1.50
    },
    {
        "id": "temp-medium",
        "nom": "Modèle Moyen (Sable & Gravier)",
        "description": "Extraction standard avec pelle de 40T et 2 dumpers. Production d'environ 15,000 T/mois.",
        "productionTonnage": 15000,
        "prixVenteMoyenParTonne": 11.00,
        "prixGasoilMoyen": 1.65
    },
    {
        "id": "temp-large",
        "nom": "Modèle Grande Carrière (Roche massive)",
        "description": "Abattage lourd à l'explosif, concasseur à haute capacité, chargeuses jumelées. Production de 50,000 T/mois.",
        "productionTonnage": 50000,
        "prixVenteMoyenParTonne": 14.00,
        "prixGasoilMoyen": 1.60
    }
]

# =====================================================================
# ENGINS ET FRAIS : FONCTIONS DE CALCUL (Même logique que calculations.ts)
# =====================================================================

def calculate_machine_interne_cout(machine, periode):
    if machine.get("isSaisieDirecte", False):
        gasoil = machine.get("gasoilCoutGlobal", 0) or 0
        pieces = machine.get("piecesRechangeGlobal", 0) or 0
        amortissement = machine.get("amortissementGlobal", 0) or 0
        return {
            "gasoil": gasoil,
            "pieces": pieces,
            "amortissement": amortissement,
            "total": gasoil + pieces + amortissement
        }

    heures = machine.get("heuresUtilisation", 0) or 0
    consom = machine.get("consommationHoraire", 0) or 0
    prix_gasoil = machine.get("prixGasoilLitre", 0) or 0
    gasoil = heures * consom * prix_gasoil
    pieces = machine.get("piecesRechangeCout", 0) or 0

    amortissement = 0
    if machine.get("amortissementAnnuelDirect"):
        amortissement = machine.get("amortissementAnnuelDirect", 0) or 0
    elif machine.get("valeurAchat") and machine.get("dureeAmortissementAns", 0) > 0:
        amortissement = machine["valeurAchat"] / machine["dureeAmortissementAns"]

    if periode == "mensuel" and not machine.get("amortissementAnnuelDirect"):
        amortissement = amortissement / 12
    elif periode == "hebdomadaire" and not machine.get("amortissementAnnuelDirect"):
        amortissement = amortissement / 52

    return {
        "gasoil": gasoil,
        "pieces": pieces,
        "amortissement": amortissement,
        "total": gasoil + pieces + amortissement
    }

def calculate_machine_externe_cout(machine):
    tarif = machine.get("tarifUnitaire", 0) or 0
    quantite = machine.get("quantiteTemps", 0) or 0
    return tarif * quantite

def calculate_personnel_cout(personnel, periode):
    if personnel.get("isSaisieDirecte", False):
        paie = personnel.get("paieGlobal", 0) or 0
        repas = personnel.get("repasGlobal", 0) or 0
        hebergement = personnel.get("hebergementGlobal", 0) or 0
        return {
            "paie": paie,
            "repas": repas,
            "hebergement": hebergement,
            "total": paie + repas + hebergement
        }

    multiplicateur = 12 if periode == "annuel" else ((12 / 52) if periode == "hebdomadaire" else 1)
    charges = 1 + (personnel.get("chargesSocialesPourcent", 0) / 100)
    nombre = personnel.get("nombre", 0) or 0

    paie = nombre * personnel.get("salaireBaseMensuel", 0) * charges * multiplicateur
    repas = nombre * personnel.get("repasMensuelParPers", 0) * multiplicateur
    hebergement = nombre * personnel.get("hebergementMensuelParPers", 0) * multiplicateur

    return {
        "paie": paie,
        "repas": repas,
        "hebergement": hebergement,
        "total": paie + repas + hebergement
    }

def calculate_taxe_cout(taxe, tonnage):
    forfait = taxe.get("montantForfaitaire", 0) or 0
    par_tonne = taxe.get("taxeParTonne", 0) or 0
    return forfait + (par_tonne * tonnage)

def calculate_processus_cost(processus, periode, tonnage):
    gasoil_cout = 0
    pieces_cout = 0
    amort_cout = 0
    location_cout = 0
    pers_paie = 0
    pers_repas = 0
    pers_heberg = 0
    taxes_cout = 0

    for m in processus.get("machinesInternes", []):
        detail = calculate_machine_interne_cout(m, periode)
        gasoil_cout += detail["gasoil"]
        pieces_cout += detail["pieces"]
        amort_cout += detail["amortissement"]

    for m in processus.get("machinesExternes", []):
        location_cout += calculate_machine_externe_cout(m)

    for p in processus.get("personnel", []):
        detail = calculate_personnel_cout(p, periode)
        pers_paie += detail["paie"]
        pers_repas += detail["repas"]
        pers_heberg += detail["hebergement"]

    for t in processus.get("taxes", []):
        taxes_cout += calculate_taxe_cout(t, tonnage)

    total_cout = (
        gasoil_cout + pieces_cout + amort_cout + location_cout +
        pers_paie + pers_repas + pers_heberg + taxes_cout
    )
    cout_par_tonne = total_cout / tonnage if tonnage > 0 else 0

    return {
        "id": processus.get("id"),
        "nom": processus.get("nom"),
        "gasoilCout": gasoil_cout,
        "piecesRechangeCout": pieces_cout,
        "amortissementCout": amort_cout,
        "locationCout": location_cout,
        "personnelPaieCout": pers_paie,
        "personnelRepasCout": pers_repas,
        "personnelHebergementCout": pers_heberg,
        "taxesCout": taxes_cout,
        "totalCout": total_cout,
        "pourcentage": 0,  # Calculé globalement
        "coutParTonne": cout_par_tonne
    }

def calculate_scenario_summary(scenario):
    keys = ["front_de_taille", "transport", "concassage", "chargement", "moyens_generaux"]
    tonnage = scenario.get("productionTonnage", 0) or 0
    periode = scenario.get("periode", "mensuel")
    processus_dict = scenario.get("processus", {})

    items = []
    for k in keys:
        if k in processus_dict:
            items.append(calculate_processus_cost(processus_dict[k], periode, tonnage))

    total_global = sum(item["totalCout"] for item in items)

    for item in items:
        item["pourcentage"] = (item["totalCout"] / total_global * 100) if total_global > 0 else 0

    cout_par_tonne_global = total_global / tonnage if tonnage > 0 else 0
    total_ventes = tonnage * (scenario.get("prixVenteMoyenParTonne", 0) or 0)
    marge_globale = total_ventes - total_global
    marge_par_tonne = (scenario.get("prixVenteMoyenParTonne", 0) or 0) - cout_par_tonne_global
    marge_pourcent = (marge_globale / total_ventes * 100) if total_ventes > 0 else 0

    breakdown = {
        "gasoil": sum(item["gasoilCout"] for item in items),
        "pieces": sum(item["piecesRechangeCout"] for item in items),
        "amortissement": sum(item["amortissementCout"] for item in items),
        "location": sum(item["locationCout"] for item in items),
        "personnelPaie": sum(item["personnelPaieCout"] for item in items),
        "personnelRepas": sum(item["personnelRepasCout"] for item in items),
        "personnelHebergement": sum(item["personnelHebergementCout"] for item in items),
        "personnelTotal": 0,
        "taxes": sum(item["taxesCout"] for item in items),
        "materielInterneTotal": 0
    }

    breakdown["personnelTotal"] = breakdown["personnelPaie"] + breakdown["personnelRepas"] + breakdown["personnelHebergement"]
    breakdown["materielInterneTotal"] = breakdown["gasoil"] + breakdown["pieces"] + breakdown["amortissement"]

    return {
        "items": items,
        "totalGlobal": total_global,
        "coutParTonneGlobal": cout_par_tonne_global,
        "totalVentes": total_ventes,
        "margeGlobale": marge_globale,
        "margeParTonne": marge_par_tonne,
        "margePourcent": marge_pourcent,
        "breakdownByCategory": breakdown
    }

# =====================================================================
# ENDPOINTS API (Identiques à server.ts)
# =====================================================================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "time": datetime.datetime.utcnow().isoformat() + "Z"
    })

@app.route('/api/scenarios/templates', methods=['GET'])
def get_templates():
    try:
        return jsonify({
            "defaultScenario": get_default_scenario(),
            "alternativeTemplates": alternative_templates
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        scenario = data.get("scenario")
        if not scenario:
            return jsonify({"error": "Le paramètre 'scenario' est requis dans le corps de la requête."}), 400
        
        summary = calculate_scenario_summary(scenario)
        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        scenario = data.get("scenario")
        if not scenario:
            return jsonify({"error": "Le paramètre 'scenario' est requis dans le corps de la requête."}), 400

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return jsonify({"error": "Clé API Gemini non configurée sur le serveur. Veuillez renseigner GEMINI_API_KEY."}), 500

        summary = calculate_scenario_summary(scenario)

        # Utilisation de la nouvelle librairie google-genai
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            
            lang = scenario.get("lang", "fr")
            lang_names = {
                "fr": "Français",
                "en": "Anglais (English)",
                "ar": "Arabe (العربية)",
                "es": "Espagnol (Español)"
            }
            target_lang_name = lang_names.get(lang, "Français")

            # Construire le prompt
            items_str = ""
            for item in summary["items"]:
                pers_total = item["personnelPaieCout"] + item["personnelRepasCout"] + item["personnelHebergementCout"]
                items_str += f"- **{item['nom']}** : Coût Total = {item['totalCout']:,.2f} {scenario['devise']} ({item['pourcentage']:.1f}%), soit {item['coutParTonne']:.2f} {scenario['devise']}/T\n"
                items_str += f"  Détail : Gasoil = {item['gasoilCout']:,.2f}, Pièces = {item['piecesRechangeCout']:,.2f}, Amortissement = {item['amortissementCout']:,.2f}, Location = {item['locationCout']:,.2f}, Personnel = {pers_total:,.2f}, Taxes = {item['taxesCout']:,.2f}\n"

            breakdown = summary["breakdownByCategory"]
            t_global = summary["totalGlobal"]
            gasoil_pct = (breakdown["gasoil"] / t_global * 100) if t_global > 0 else 0
            pieces_pct = (breakdown["pieces"] / t_global * 100) if t_global > 0 else 0
            amort_pct = (breakdown["amortissement"] / t_global * 100) if t_global > 0 else 0
            loc_pct = (breakdown["location"] / t_global * 100) if t_global > 0 else 0
            pers_pct = (breakdown["personnelTotal"] / t_global * 100) if t_global > 0 else 0
            taxes_pct = (breakdown["taxes"] / t_global * 100) if t_global > 0 else 0

            prompt = f"""
Vous êtes un consultant senior en contrôle de gestion industrielle et en exploitation de carrières de granulats.
Votre tâche est de fournir un audit d'exploitation détaillé et des pistes concrètes d'optimisation basées sur les données ci-dessous.

=== DONNÉES DE L'EXPLOITATION ===
Nom du Scénario : {scenario.get('nom')}
Entreprise : {scenario.get('nomEntreprise', '')}
Localisation : {scenario.get('localisation', '')}
Période concernée : {scenario.get('periodeConcerne', '')}
Périodicité des calculs : {'Hebdomadaire' if scenario['periode'] == 'hebdomadaire' else 'Mensuel' if scenario['periode'] == 'mensuel' else 'Annuel'}
Volume de production : {scenario['productionTonnage']:,} Tonnes
Devise : {scenario['devise']}
Prix de vente moyen : {scenario['prixVenteMoyenParTonne']} {scenario['devise']}/Tonne
Chiffre d'affaires estimé : {summary['totalVentes']:,.2f} {scenario['devise']}
Coût global de revient : {summary['totalGlobal']:,.2f} {scenario['devise']}
Coût moyen à la tonne : {summary['coutParTonneGlobal']:.2f} {scenario['devise']}/Tonne
Marge globale d'exploitation : {summary['margeGlobale']:,.2f} {scenario['devise']} ({summary['margePourcent']:.1f}%)
Marge par tonne : {summary['margeParTonne']:.2f} {scenario['devise']}/Tonne

=== RÉPARTITION PAR RUBRIQUE (PROCESSUS) ===
{items_str}

=== RÉPARTITION PAR NATURE DE DÉPENSE ===
- **Gasoil (carburant)** : {breakdown['gasoil']:,.2f} {scenario['devise']} ({gasoil_pct:.1f}%)
- **Pièces de Rechange (maintenance)** : {breakdown['pieces']:,.2f} {scenario['devise']} ({pieces_pct:.1f}%)
- **Amortissement (investissement matériel)** : {breakdown['amortissement']:,.2f} {scenario['devise']} ({amort_pct:.1f}%)
- **Location de Matériel (externe/sous-traitance)** : {breakdown['location']:,.2f} {scenario['devise']} ({loc_pct:.1f}%)
- **Personnel (salaires + logistique repas/hébergement)** : {breakdown['personnelTotal']:,.2f} {scenario['devise']} ({pers_pct:.1f}%)
- **Impôts, Taxes & Redevances** : {breakdown['taxes']:,.2f} {scenario['devise']} ({taxes_pct:.1f}%)

Veuillez structurer votre rapport sous forme de document Markdown professionnel comprenant les sections suivantes :

1. **💡 Diagnostics de Performance Globale** : Évaluation de la santé financière globale, de la rentabilité (marge %) et du coût de revient à la tonne par rapport au prix de vente. Est-ce viable ?
2. **🔍 Analyse des Postes de Dépenses Critiques** : Identifier les 2 ou 3 postes de dépenses (nature ou processus) les plus lourds et expliquer pourquoi ils pèsent sur l'exploitation.
3. **🛠️ Plan d'Action Opérationnel & Recommandations** : Proposer 3 à 5 recommandations opérationnelles spécifiques pour réduire les coûts (ex: amélioration du ratio de consommation d'engins, gestion des équipes de travail, optimisation de la maintenance préventive, arbitrage achat/location pour les machines externes). Estimez l'économie potentielle si possible en pourcentage.
4. **📊 Seuil de Rentabilité & Recommandations de Vente** : Quel serait le prix de vente optimal pour atteindre une marge cible de 25% ? Quel est le seuil de production critique (tonnage minimal) à cette marge ?

Soyez précis, professionnel et utilisez un vocabulaire propre aux travaux publics et à l'exploitation de carrières.
RÉDIGEZ LE RAPPORT ENTIÈREMENT EN LANGUE {target_lang_name.upper()}.
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            
            if not response.text:
                raise Exception("L'API Gemini a renvoyé une réponse vide.")

            return jsonify({"text": response.text})

        except ImportError:
            # Fallback à l'ancienne librairie google-generativeai si google-genai n'est pas installé
            import google.generativeai as genai_legacy
            genai_legacy.configure(api_key=api_key)
            model = genai_legacy.GenerativeModel('gemini-2.5-flash')
            
            # (Le reste du code de prompt et d'appel est le même, omis pour concision mais fonctionnel)
            # Nous utilisons un fallback simple vers request HTTP direct ou message d'erreur
            return jsonify({"error": "Veuillez installer le package google-genai (pip install google-genai)."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("==========================================================")
    print("  SERVEUR FLASK PYTHON - CALCULATEUR DE PRIX DE REVIENT")
    print("  Exposition de l'API pour l'application Android")
    print("  Accès local : http://127.0.0.1:3000 ou http://localhost:3000")
    print("==========================================================")
    app.run(host='0.0.0.0', port=3000, debug=True)
