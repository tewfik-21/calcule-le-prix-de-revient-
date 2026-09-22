package com.quarry.calculator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.quarry.calculator.model.CostSummaryItem
import com.quarry.calculator.model.CalculationSummaryResponse
import com.quarry.calculator.viewmodel.QuarryViewModel


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF07080D),
                    surface = Color(0xFF121420),
                    primary = Color(0xFF10B981), // Emerald
                    secondary = Color(0xFF3B82F6), // Blue
                    onBackground = Color(0xFFF4F4F5),
                    onSurface = Color(0xFFF4F4F5)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    QuarryApp()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuarryApp(viewModel: QuarryViewModel = viewModel()) {
    val scenario = viewModel.activeScenario
    val result = viewModel.calculationResult
    val aiReport = viewModel.aiReport
    
    var activeTab by remember { mutableStateOf("dashboard") } // "dashboard", "ia"

    Column(modifier = Modifier.fillMaxSize()) {
        // App Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(Color(0xFF064E3B), Color(0xFF07080D))
                    )
                )
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    Text(
                        text = "QUARRY_CORE.v1 (Suivi)",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        text = scenario?.nom ?: "En attente de partage...",
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFF10B981)
                    )
                }
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val languages = listOf("fr" to "🇫🇷", "en" to "🇬🇧", "ar" to "🇩🇿", "es" to "🇪🇸")
                    val currentLang = scenario?.lang ?: "fr"
                    val currentFlag = languages.find { it.first == currentLang }?.second ?: "🇫🇷"

                    Text(
                        text = currentFlag,
                        fontSize = 18.sp,
                        modifier = Modifier.padding(8.dp)
                    )

                    IconButton(onClick = { viewModel.loadSharedScenario() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Actualiser le suivi",
                            tint = Color.White
                        )
                    }
                }
            }
        }

        // Tab Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF0B0C14))
                .border(1.dp, Color(0xFF1E293B))
        ) {
            listOf(
                "dashboard" to "Tableau de Bord",
                "ia" to "Audit IA"
            ).forEach { (tabId, label) ->
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeTab = tabId }
                        .padding(vertical = 12.dp)
                        .background(if (activeTab == tabId) Color(0xFF121420) else Color.Transparent)
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = if (activeTab == tabId) FontWeight.Bold else FontWeight.Normal,
                        color = if (activeTab == tabId) Color(0xFF10B981) else Color.Gray
                    )
                }
            }
        }

        // Error message notification
        viewModel.errorMessage?.let { error ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF7F1D1D)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Text(
                    text = error,
                    color = Color.White,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        // Loader
        if (viewModel.isLoading && result == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF10B981))
            }
        } else {
            // Main content based on active tab
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                if (scenario == null) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF121420)),
                        modifier = Modifier.fillMaxWidth().padding(32.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("📱", fontSize = 48.sp)
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Aucune donnée partagée",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 16.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Ouvrez le calculateur sur votre ordinateur, modifiez vos données de carrière et cliquez sur 'Partager pour mobile' dans le menu de partage pour visualiser les résultats ici en temps réel.",
                                color = Color.Gray,
                                fontSize = 11.sp,
                                textAlign = TextAlign.Center,
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.loadSharedScenario() },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                            ) {
                                Text("Rechercher un partage", color = Color.Black, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                } else {
                    when (activeTab) {
                        "dashboard" -> {
                            // Branding Header info if exists
                            if (!scenario.nomEntreprise.isNullOrBlank() || 
                                !scenario.localisation.isNullOrBlank() || 
                                !scenario.substance.isNullOrBlank() || 
                                !scenario.destination.isNullOrBlank()
                            ) {
                                BrandingBanner(
                                    entreprise = scenario.nomEntreprise ?: "",
                                    localisation = scenario.localisation ?: "",
                                    periode = scenario.periodeConcerne ?: "",
                                    substance = scenario.substance ?: "",
                                    destination = scenario.destination ?: ""
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                            }

                            // Read-only Details
                            Card(
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF121420)),
                                modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                        Text("FICHE DE SUIVI INDUSTRIEL", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color.LightGray)
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0xFF064E3B), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text("SUIVI ACTIF", fontSize = 8.sp, fontWeight = FontWeight.Black, color = Color(0xFF10B981))
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                        Column {
                                            Text("Production cible", fontSize = 9.sp, color = Color.Gray)
                                            Text("${scenario.productionTonnage.toInt()} T", fontWeight = FontWeight.Black, fontSize = 16.sp, color = Color.White)
                                        }
                                        Column(horizontalAlignment = Alignment.End) {
                                            Text("Périodicité", fontSize = 9.sp, color = Color.Gray)
                                            val periodName = when(scenario.periode) {
                                                "hebdomadaire" -> "Semaine"
                                                "mensuel" -> "Mois"
                                                "annuel" -> "Année"
                                                else -> "Mois"
                                            }
                                            Text(periodName, fontWeight = FontWeight.Black, fontSize = 16.sp, color = Color(0xFF10B981))
                                        }
                                    }
                                    if (viewModel.sharedScenarioData != null) {
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(Color(0xFF1E293B)))
                                        Spacer(modifier = Modifier.height(10.dp))
                                        Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                            Text("Synchro ordinateur :", fontSize = 9.sp, color = Color.Gray)
                                            val sharedTime = viewModel.sharedScenarioData?.sharedAt?.let { if (it.length >= 16) it.replace("T", " ").substring(0, 16) else it } ?: "-"
                                            Text(sharedTime, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.LightGray)
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // KPI Cards
                            if (result != null) {
                                KpiGrid(result = result, devise = scenario.devise)
                                
                                Spacer(modifier = Modifier.height(20.dp))
                                
                                // Process Breakdown
                                Text(
                                    text = "RÉPARTITION PAR RUBRIQUE",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Gray,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                result.items.forEach { item ->
                                    ProcessCostCard(item = item, devise = scenario.devise)
                                    Spacer(modifier = Modifier.height(8.dp))
                                }
                            }
                        }
                        
                        "ia" -> {
                            if (aiReport != null) {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFF121420)),
                                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(8.dp))
                                ) {
                                    Column(modifier = Modifier.padding(16.dp)) {
                                        Text(
                                            text = "AUDIT OPÉRATIONNEL & RECOMMANDATIONS",
                                            fontWeight = FontWeight.Black,
                                            color = Color(0xFF10B981),
                                            fontSize = 14.sp,
                                            modifier = Modifier.padding(bottom = 8.dp)
                                        )
                                        Text(
                                            text = aiReport,
                                            fontSize = 13.sp,
                                            color = Color(0xFFF4F4F5),
                                            fontFamily = FontFamily.SansSerif,
                                            lineHeight = 20.sp
                                        )
                                    }
                                }
                            } else {
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFF121420)),
                                    modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(8.dp))
                                ) {
                                    Column(
                                        modifier = Modifier.padding(24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text("🤖", fontSize = 36.sp)
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Text(
                                            text = "Aucun rapport d'audit disponible",
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White,
                                            fontSize = 14.sp,
                                            textAlign = TextAlign.Center
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Générez un audit IA (Gemini) sur l'ordinateur, puis partagez le scénario à nouveau pour pouvoir le lire sur votre téléphone.",
                                            color = Color.Gray,
                                            fontSize = 11.sp,
                                            textAlign = TextAlign.Center,
                                            lineHeight = 16.sp
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BrandingBanner(entreprise: String, localisation: String, periode: String, substance: String, destination: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF10B981).copy(alpha = 0.2f), RoundedCornerShape(12.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            if (entreprise.isNotBlank()) {
                Text(entreprise.uppercase(), fontWeight = FontWeight.Black, fontSize = 16.sp, color = Color.White)
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                if (localisation.isNotBlank()) {
                    Text("📍 $localisation", fontSize = 11.sp, color = Color.LightGray)
                }
                if (periode.isNotBlank()) {
                    Text("📅 $periode", fontSize = 11.sp, color = Color(0xFF3B82F6))
                }
            }
            if (substance.isNotBlank() || destination.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .background(Color(0xFF1E293B), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("🪨 ", fontSize = 11.sp)
                    Text(substance.ifBlank { "-" }, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    if (destination.isNotBlank()) {
                        Text(" ➔ ", fontSize = 11.sp, color = Color.Gray)
                        Text(destination, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                    }
                }
            }
        }
    }
}

@Composable
fun IndustrialControls(
    tonnageValue: String,
    onTonnageChange: (String) -> Unit,
    period: String,
    onPeriodChange: (String) -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF121420)),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("PARAMÈTRES INDUSTRIELS", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color.LightGray)
            Spacer(modifier = Modifier.height(12.dp))

            // Tonnage input
            OutlinedTextField(
                value = tonnageValue,
                onValueChange = onTonnageChange,
                label = { Text("Tonnage de Production") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFF1E293B)
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Period select buttons
            Text("Périodicité des Calculs", fontSize = 11.sp, color = Color.Gray)
            Spacer(modifier = Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                listOf(
                    "hebdomadaire" to "Semaine",
                    "mensuel" to "Mois",
                    "annuel" to "An"
                ).forEach { (id, label) ->
                    val selected = period == id
                    Button(
                        onClick = { onPeriodChange(id) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selected) Color(0xFF10B981) else Color(0xFF1E293B),
                            contentColor = if (selected) Color.Black else Color.White
                        ),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun KpiGrid(result: CalculationSummaryResponse, devise: String) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KpiCard(
                title = "Coût Global",
                value = "${result.totalGlobal.toInt()} $devise",
                subText = "Total dépenses",
                modifier = Modifier.weight(1f),
                borderColor = Color(0xFF10B981)
            )
            KpiCard(
                title = "Coût / Tonne",
                value = String.format("%.2f %s/T", result.coutParTonneGlobal, devise),
                subText = "Prix de revient moyen",
                modifier = Modifier.weight(1f),
                borderColor = Color(0xFF3B82F6)
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KpiCard(
                title = "Chiffre d'Affaires",
                value = "${result.totalVentes.toInt()} $devise",
                subText = "Ventes estimées",
                modifier = Modifier.weight(1f),
                borderColor = Color(0xFF10B981)
            )
            KpiCard(
                title = "Marge",
                value = String.format("%.1f%%", result.margePourcent),
                subText = "${result.margeGlobale.toInt()} $devise",
                modifier = Modifier.weight(1f),
                borderColor = if (result.margeGlobale >= 0) Color(0xFF10B981) else Color(0xFFEF4444)
            )
        }
    }
}

@Composable
fun KpiCard(title: String, value: String, subText: String, modifier: Modifier = Modifier, borderColor: Color) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF121420)),
        modifier = modifier.border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .background(borderColor, RoundedCornerShape(3.dp))
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(title.uppercase(), fontSize = 9.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
            Spacer(modifier = Modifier.height(2.dp))
            Text(subText, fontSize = 9.sp, color = Color.LightGray)
        }
    }
}

@Composable
fun ProcessCostCard(item: CostSummaryItem, devise: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(item.nom, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                Text(
                    text = "${item.pourcentage.toInt()}%",
                    fontSize = 12.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            LinearProgressIndicator(
                progress = { item.pourcentage.toFloat() / 100f },
                modifier = Modifier.fillMaxWidth().height(4.dp),
                color = Color(0xFF10B981),
                trackColor = Color(0xFF334155)
            )
            
            Spacer(modifier = Modifier.height(6.dp))
            
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text("Coût: ${item.totalCout.toInt()} $devise", fontSize = 11.sp, color = Color.LightGray)
                Text(String.format("Revient: %.2f %s/T", item.coutParTonne, devise), fontSize = 11.sp, color = Color.LightGray)
            }
        }
    }
}

@Composable
fun BrandingForm(
    initialEntreprise: String,
    initialLocalisation: String,
    initialPeriodeConcerne: String,
    initialSubstance: String,
    initialDestination: String,
    onSave: (String, String, String, String, String) -> Unit
) {
    var entreprise by remember { mutableStateOf(initialEntreprise) }
    var localisation by remember { mutableStateOf(initialLocalisation) }
    var periodeConcerne by remember { mutableStateOf(initialPeriodeConcerne) }
    var substance by remember { mutableStateOf(initialSubstance) }
    var destination by remember { mutableStateOf(initialDestination) }

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF121420)),
        modifier = Modifier.fillMaxWidth().border(1.dp, Color(0xFF1E293B), RoundedCornerShape(12.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("IDENTIFICATION DE L'ENTREPRISE", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color.LightGray)

            OutlinedTextField(
                value = entreprise,
                onValueChange = { entreprise = it },
                label = { Text("Nom de l'entreprise") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFF1E293B)
                )
            )

            OutlinedTextField(
                value = localisation,
                onValueChange = { localisation = it },
                label = { Text("Localisation") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFF1E293B)
                )
            )

            OutlinedTextField(
                value = periodeConcerne,
                onValueChange = { periodeConcerne = it },
                label = { Text("Période concernée") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFF1E293B)
                )
            )

            OutlinedTextField(
                value = substance,
                onValueChange = { substance = it },
                label = { Text("Substance exploitée (ex: Calcaire, Argile)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFF1E293B)
                )
            )

            OutlinedTextField(
                value = destination,
                onValueChange = { destination = it },
                label = { Text("Destination du produit (ex: Agrégats, Produit rouge)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFF1E293B)
                )
            )

            Button(
                onClick = { onSave(entreprise, localisation, periodeConcerne, substance, destination) },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Enregistrer les réglages", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }
    }
}
