package com.quarry.calculator.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.quarry.calculator.api.RetrofitClient
import com.quarry.calculator.api.ScenarioRequest
import com.quarry.calculator.model.AlternativeTemplate
import com.quarry.calculator.model.CalculationSummaryResponse
import com.quarry.calculator.model.QuarryScenario
import com.quarry.calculator.model.SharedScenarioResponse
import kotlinx.coroutines.launch

class QuarryViewModel : ViewModel() {

    var activeScenario by mutableStateOf<QuarryScenario?>(null)
        private set

    var alternativeTemplates by mutableStateOf<List<AlternativeTemplate>>(emptyList())
        private set

    var calculationResult by mutableStateOf<CalculationSummaryResponse?>(null)
        private set

    var aiReport by mutableStateOf<String?>(null)
        private set

    var isLoading by mutableStateOf(false)
        private set

    var isAiLoading by mutableStateOf(false)
        private set

    var errorMessage by mutableStateOf<String?>(null)
        private set

    var sharedScenarioData by mutableStateOf<SharedScenarioResponse?>(null)
        private set

    init {
        loadSharedScenario()
    }

    fun loadSharedScenario() {
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            try {
                val response = RetrofitClient.service.getSharedScenario()
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    sharedScenarioData = body
                    activeScenario = body.scenario
                    calculationResult = body.summary
                    aiReport = body.aiReport
                } else {
                    errorMessage = "Aucun scénario partagé disponible ou erreur du serveur: ${response.code()}"
                }
            } catch (e: Exception) {
                errorMessage = "Impossible de se connecter au serveur: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun loadTemplates() {
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            try {
                val response = RetrofitClient.service.getTemplates()
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    activeScenario = body.defaultScenario
                    alternativeTemplates = body.alternativeTemplates
                    // Trigger initial calculations
                    calculateCurrent()
                } else {
                    errorMessage = "Erreur de chargement des modèles: ${response.code()}"
                }
            } catch (e: Exception) {
                errorMessage = "Impossible de se connecter au serveur: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun calculateCurrent() {
        val scenario = activeScenario ?: return
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            try {
                val response = RetrofitClient.service.calculateCosts(ScenarioRequest(scenario))
                if (response.isSuccessful && response.body() != null) {
                    calculationResult = response.body()
                } else {
                    errorMessage = "Erreur de calcul: ${response.code()}"
                }
            } catch (e: Exception) {
                errorMessage = "Erreur réseau de calcul: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun generateAiAnalysis() {
        val scenario = activeScenario ?: return
        viewModelScope.launch {
            isAiLoading = true
            aiReport = null
            errorMessage = null
            try {
                val response = RetrofitClient.service.getAiAnalysis(ScenarioRequest(scenario))
                if (response.isSuccessful && response.body() != null) {
                    aiReport = response.body()!!.text
                } else {
                    errorMessage = "Erreur d'analyse: ${response.code()}"
                }
            } catch (e: Exception) {
                errorMessage = "Erreur réseau d'analyse: ${e.message}"
            } finally {
                isAiLoading = false
            }
        }
    }

    fun updateTonnage(tonnage: Double) {
        val scenario = activeScenario ?: return
        activeScenario = scenario.copy(productionTonnage = tonnage)
        calculateCurrent()
    }

    fun updateLanguage(languageCode: String) {
        val scenario = activeScenario ?: return
        activeScenario = scenario.copy(lang = languageCode)
        calculateCurrent()
    }

    fun updatePeriod(period: String) {
        val scenario = activeScenario ?: return
        activeScenario = scenario.copy(periode = period)
        calculateCurrent()
    }

    fun updateBranding(entreprise: String, localisation: String, periodeConcerne: String, substance: String, destination: String) {
        val scenario = activeScenario ?: return
        activeScenario = scenario.copy(
            nomEntreprise = entreprise,
            localisation = localisation,
            periodeConcerne = periodeConcerne,
            substance = substance,
            destination = destination
        )
    }

    fun loadAlternativeTemplate(template: AlternativeTemplate) {
        val currentScenario = activeScenario ?: return
        activeScenario = currentScenario.copy(
            nom = template.nom,
            productionTonnage = template.productionTonnage,
            prixVenteMoyenParTonne = template.prixVenteMoyenParTonne,
            prixGasoilMoyen = template.prixGasoilMoyen
        )
        calculateCurrent()
    }
}
