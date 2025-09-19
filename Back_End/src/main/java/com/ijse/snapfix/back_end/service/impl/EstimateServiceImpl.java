package com.ijse.snapfix.back_end.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ijse.snapfix.back_end.dto.EstimateRequestDTO;
import com.ijse.snapfix.back_end.service.EstimateService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class EstimateServiceImpl implements EstimateService {

    @Value("${huggingface.api.key:}")
    private String hfApiKey;

    @Value("${openRouter.api.key:}")
    private String openRouterKey;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newHttpClient();

    @Override
    public String generateEstimate(EstimateRequestDTO request) {
        try {
            String prompt = buildPrompt(request);

            // 1. Try OpenRouter
            String estimate = tryOpenRouter(prompt);

            if (estimate.startsWith("Error:")) {
                // 2. Try HuggingFace
                estimate = tryHuggingFace(prompt);
            }

            if (estimate.startsWith("Error:")) {
                // 3. Rule-based fallback
                estimate = generateRuleBasedEstimate(request);
            }

            return estimate;

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

//    private String buildPrompt(EstimateRequestDTO request) {
//        return "You are a professional service estimator in Sri Lanka. Provide an estimate for:\n" +
//                "Title: " + request.getTitle() + "\n" +
//                "Category: " + request.getCategory() + "\n" +
//                "Description: " + request.getDescription() + "\n\n" +
//                "Provide a JSON response with these fields:\n" +
//                "- Price Range (in LKR, format: 'XXXX-XXXX LKR')\n" +
//                "- Time Estimate (e.g., '2-3 hours', '1 day')\n" +
//                "- Travel Cost (in LKR, if applicable)\n" +
//                "- Notes (any additional considerations)\n\n" +
//                "Response:";
//    }

    private String buildPrompt(EstimateRequestDTO request) {
        return "You are a professional service estimator in Sri Lanka. " +
                "Provide ONLY a raw JSON object, no explanations, no markdown, no ```json tags. " +
                "The JSON must include these fields exactly: " +
                "price_range, time_estimate, travel_cost, notes.\n\n" +
                "Here is the service request:\n" +
                "Title: " + request.getTitle() + "\n" +
                "Category: " + request.getCategory() + "\n" +
                "Description: " + request.getDescription() + "\n\n" +
                "Return only the JSON object.";
    }
    
    private String tryOpenRouter(String prompt) {
        if (openRouterKey == null || openRouterKey.isEmpty()) {
            return "Error: No OpenRouter API key configured";
        }

        try {
            Map<String, Object> payload = Map.of(
                    "model", "google/gemini-flash-1.5",
                    "messages", new Object[]{
                            Map.of("role", "user", "content", prompt)
                    },
                    "temperature", 0.1,
                    "max_tokens", 500
            );

            String requestBody = mapper.writeValueAsString(payload);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                    .header("Authorization", "Bearer " + openRouterKey)
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "http://localhost:8080")
                    .header("X-Title", "SnapFix Service Estimator")
                    .timeout(java.time.Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "Error: OpenRouter API returned status " + response.statusCode();
            }

            JsonNode rootNode = mapper.readTree(response.body());
            return rootNode.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String tryHuggingFace(String prompt) {
        if (hfApiKey == null || hfApiKey.isEmpty()) {
            return "Error: No HuggingFace API key configured";
        }

        try {
            Map<String, Object> payload = Map.of(
                    "inputs", prompt,
                    "parameters", Map.of(
                            "max_new_tokens", 200,
                            "return_full_text", false
                    ),
                    "options", Map.of("wait_for_model", true)
            );

            String requestBody = mapper.writeValueAsString(payload);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"))
                    .header("Authorization", "Bearer " + hfApiKey)
                    .header("Content-Type", "application/json")
                    .timeout(java.time.Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "Error: HuggingFace API returned status " + response.statusCode();
            }

            JsonNode responseJson = mapper.readTree(response.body());
            if (responseJson.isArray() && responseJson.size() > 0) {
                return responseJson.get(0).path("generated_text").asText();
            }

            return "Error: Invalid response format from HuggingFace";

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String generateRuleBasedEstimate(EstimateRequestDTO request) {
        String category = request.getCategory().toLowerCase();
        String description = request.getDescription().toLowerCase();
        int descLength = description.length();

        int basePrice = 2000;
        int timeEstimateHours = 2;

        if (category.contains("plumb")) {
            basePrice = 2500;
            timeEstimateHours = 3;
        } else if (category.contains("electr")) {
            basePrice = 3000;
            timeEstimateHours = 2;
        } else if (category.contains("ac") || category.contains("hvac")) {
            basePrice = 4000;
            timeEstimateHours = 4;
        } else if (category.contains("paint")) {
            basePrice = 3500;
            timeEstimateHours = 5;
        } else if (category.contains("carpentry")) {
            basePrice = 3000;
            timeEstimateHours = 3;
        } else if (category.contains("cleaning")) {
            basePrice = 1500;
            timeEstimateHours = 2;
        } else if (category.contains("networking") || category.contains("ict")) {
            basePrice = 3500;
            timeEstimateHours = 3;
        } else if (category.contains("appliance")) {
            basePrice = 2500;
            timeEstimateHours = 2;
        } else if (category.contains("masonry") || category.contains("roofing")) {
            basePrice = 4000;
            timeEstimateHours = 5;
        } else if (category.contains("pest")) {
            basePrice = 2000;
            timeEstimateHours = 2;
        } else if (category.contains("hardware")) {
            basePrice = 2000;
            timeEstimateHours = 2;
        } else {
            basePrice = 2500;
            timeEstimateHours = 3;
        }

        if (descLength > 100) {
            basePrice += 1000;
            timeEstimateHours += 1;
        }

        if (descLength > 200) {
            basePrice += 1500;
            timeEstimateHours += 2;
        }

        int travelCost = 500;

        return String.format("{\"price_range\": \"%d-%d LKR\", \"time_estimate\": \"%d-%d hours\", \"travel_cost\": \"%d LKR\", \"notes\": \"This is an automated estimate based on category and description length. For a precise quote, please contact a technician directly.\"}",
                basePrice, basePrice + 1000, timeEstimateHours, timeEstimateHours + 2, travelCost);
    }
}
