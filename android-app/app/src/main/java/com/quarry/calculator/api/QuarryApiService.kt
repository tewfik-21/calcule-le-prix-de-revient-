package com.quarry.calculator.api

import com.quarry.calculator.model.TemplatesResponse
import com.quarry.calculator.model.QuarryScenario
import com.quarry.calculator.model.CalculationSummaryResponse
import com.quarry.calculator.model.AiAnalysisResponse
import com.quarry.calculator.model.SharedScenarioResponse
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.Response

interface QuarryApiService {
    @GET("api/scenarios/templates")
    suspend fun getTemplates(): Response<TemplatesResponse>

    @POST("api/calculate")
    suspend fun calculateCosts(@Body request: ScenarioRequest): Response<CalculationSummaryResponse>

    @POST("api/analyze")
    suspend fun getAiAnalysis(@Body request: ScenarioRequest): Response<AiAnalysisResponse>

    @GET("api/scenario/share")
    suspend fun getSharedScenario(): Response<SharedScenarioResponse>
}

data class ScenarioRequest(
    val scenario: QuarryScenario
)

object RetrofitClient {
    // Local IP address of the host machine for physical device or emulator connectivity
    private const val BASE_URL = "http://10.43.198.140:3000/"

    val service: QuarryApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(QuarryApiService::class.java)
    }
}
