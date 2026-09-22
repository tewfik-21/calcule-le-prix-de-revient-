package com.quarry.calculator.model

import com.google.gson.annotations.SerializedName

// Représente le scénario global
data class QuarryScenario(
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String,
    @SerializedName("dateCreation") val dateCreation: String,
    @SerializedName("productionTonnage") val productionTonnage: Double,
    @SerializedName("periode") val periode: String, // "hebdomadaire", "mensuel" ou "annuel"
    @SerializedName("devise") val devise: String, // "€", "DA", etc.
    @SerializedName("prixVenteMoyenParTonne") val prixVenteMoyenParTonne: Double,
    @SerializedName("prixGasoilMoyen") val prixGasoilMoyen: Double,
    @SerializedName("processus") val processus: ProcessusContainer,
    @SerializedName("nomEntreprise") val nomEntreprise: String? = null,
    @SerializedName("localisation") val localisation: String? = null,
    @SerializedName("logoUrl") val logoUrl: String? = null, // Base64
    @SerializedName("periodeConcerne") val periodeConcerne: String? = null,
    @SerializedName("lang") val lang: String? = "fr",
    @SerializedName("substance") val substance: String? = null,
    @SerializedName("destination") val destination: String? = null
)

// Regroupe les 5 processus de la carrière
data class ProcessusContainer(
    @SerializedName("front_de_taille") val frontDeTaille: ProcessusCostData,
    @SerializedName("transport") val transport: ProcessusCostData,
    @SerializedName("concassage") val concassage: ProcessusCostData,
    @SerializedName("chargement") val chargement: ProcessusCostData,
    @SerializedName("moyens_generaux") val moyensGeneraux: ProcessusCostData
)

// Détail d'un processus
data class ProcessusCostData(
    @SerializedName("id") val id: String, // "front_de_taille", etc.
    @SerializedName("nom") val nom: String,
    @SerializedName("description") val description: String,
    @SerializedName("machinesInternes") val machinesInternes: List<MachineInterne>,
    @SerializedName("machinesExternes") val machinesExternes: List<MachineExterne>,
    @SerializedName("personnel") val personnel: List<PersonnelCharges>,
    @SerializedName("taxes") val taxes: List<TaxeRubrique>
)

// Engin interne (amorti, consommant du gasoil)
data class MachineInterne(
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String,
    @SerializedName("heuresUtilisation") val heuresUtilisation: Double,
    @SerializedName("consommationHoraire") val consommationHoraire: Double,
    @SerializedName("prixGasoilLitre") val prixGasoilLitre: Double,
    @SerializedName("piecesRechangeCout") val piecesRechangeCout: Double,
    @SerializedName("valeurAchat") val valeurAchat: Double,
    @SerializedName("dureeAmortissementAns") val dureeAmortissementAns: Double,
    @SerializedName("amortissementAnnuelDirect") val amortissementAnnuelDirect: Double? = null,
    @SerializedName("isSaisieDirecte") val isSaisieDirecte: Boolean = false,
    @SerializedName("gasoilCoutGlobal") val gasoilCoutGlobal: Double? = null,
    @SerializedName("piecesRechangeGlobal") val piecesRechangeGlobal: Double? = null,
    @SerializedName("amortissementGlobal") val amortissementGlobal: Double? = null
)

// Engin externe (location)
data class MachineExterne(
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String,
    @SerializedName("typeTarif") val typeTarif: String, // "heure", "jour", "mois"
    @SerializedName("tarifUnitaire") val tarifUnitaire: Double,
    @SerializedName("quantiteTemps") val quantiteTemps: Double
)

// Charges salariales et logistiques du personnel
data class PersonnelCharges(
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String? = null,
    @SerializedName("poste") val poste: String,
    @SerializedName("nombre") val nombre: Int,
    @SerializedName("salaireBaseMensuel") val salaireBaseMensuel: Double,
    @SerializedName("chargesSocialesPourcent") val chargesSocialesPourcent: Double,
    @SerializedName("repasMensuelParPers") val repasMensuelParPers: Double,
    @SerializedName("hebergementMensuelParPers") val hebergementMensuelParPers: Double,
    @SerializedName("isSaisieDirecte") val isSaisieDirecte: Boolean = false,
    @SerializedName("paieGlobal") val paieGlobal: Double? = null,
    @SerializedName("repasGlobal") val repasGlobal: Double? = null,
    @SerializedName("hebergementGlobal") val hebergementGlobal: Double? = null
)

// Taxes sur l'exploitation
data class TaxeRubrique(
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String,
    @SerializedName("montantForfaitaire") val montantForfaitaire: Double,
    @SerializedName("taxeParTonne") val taxeParTonne: Double
)

// Structure retournée après calcul
data class CalculationSummaryResponse(
    @SerializedName("items") val items: List<CostSummaryItem>,
    @SerializedName("totalGlobal") val totalGlobal: Double,
    @SerializedName("coutParTonneGlobal") val coutParTonneGlobal: Double,
    @SerializedName("totalVentes") val totalVentes: Double,
    @SerializedName("margeGlobale") val margeGlobale: Double,
    @SerializedName("margeParTonne") val margeParTonne: Double,
    @SerializedName("margePourcent") val margePourcent: Double,
    @SerializedName("breakdownByCategory") val breakdownByCategory: CategoryBreakdown
)

// Résumé des coûts consolidés d'un processus
data class CostSummaryItem(
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String,
    @SerializedName("gasoilCout") val gasoilCout: Double,
    @SerializedName("piecesRechangeCout") val piecesRechangeCout: Double,
    @SerializedName("amortissementCout") val amortissementCout: Double,
    @SerializedName("locationCout") val locationCout: Double,
    @SerializedName("personnelPaieCout") val personnelPaieCout: Double,
    @SerializedName("personnelRepasCout") val personnelRepasCout: Double,
    @SerializedName("personnelHebergementCout") val personnelHebergementCout: Double,
    @SerializedName("taxesCout") val taxesCout: Double,
    @SerializedName("totalCout") val totalCout: Double,
    @SerializedName("pourcentage") val pourcentage: Double,
    @SerializedName("coutParTonne") val coutParTonne: Double
)

// Consolidation par nature de charge
data class CategoryBreakdown(
    @SerializedName("gasoil") val gasoil: Double,
    @SerializedName("pieces") val pieces: Double,
    @SerializedName("amortissement") val amortissement: Double,
    @SerializedName("location") val location: Double,
    @SerializedName("personnelPaie") val personnelPaie: Double,
    @SerializedName("personnelRepas") val personnelRepas: Double,
    @SerializedName("personnelHebergement") val personnelHebergement: Double,
    @SerializedName("personnelTotal") val personnelTotal: Double,
    @SerializedName("taxes") val taxes: Double,
    @SerializedName("materielInterneTotal") val materielInterneTotal: Double
)

// Modèles pour charger les modèles par défaut
data class TemplatesResponse(
    @SerializedName("defaultScenario") val defaultScenario: QuarryScenario,
    @SerializedName("alternativeTemplates") val alternativeTemplates: List<AlternativeTemplate>
)

data class AlternativeTemplate(
    @SerializedName("id") val id: String,
    @SerializedName("nom") val nom: String,
    @SerializedName("productionTonnage") val productionTonnage: Double,
    @SerializedName("prixVenteMoyenParTonne") val prixVenteMoyenParTonne: Double,
    @SerializedName("prixGasoilMoyen") val prixGasoilMoyen: Double
)

data class AiAnalysisResponse(
    @SerializedName("text") val text: String
)

data class SharedScenarioResponse(
    @SerializedName("scenario") val scenario: QuarryScenario,
    @SerializedName("summary") val summary: CalculationSummaryResponse,
    @SerializedName("aiReport") val aiReport: String? = null,
    @SerializedName("sharedAt") val sharedAt: String
)

