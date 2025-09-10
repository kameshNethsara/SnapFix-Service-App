package com.ijse.snapfix.back_end.controller;

import com.ijse.snapfix.back_end.dto.EstimateRequestDTO;
import com.ijse.snapfix.back_end.service.EstimateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/snapfix")
public class EstimateAIGenController {

    private final EstimateService estimateService;

    public EstimateAIGenController(EstimateService estimateService) {
        this.estimateService = estimateService;
    }

    @PostMapping("/generate-estimate")
    public ResponseEntity<?> generateEstimate(@RequestBody EstimateRequestDTO request) {
        try {
            String estimate = estimateService.generateEstimate(request);
            return ResponseEntity.ok(Map.of("estimate", estimate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("estimate", "Failed to generate estimate: " + e.getMessage()));
        }
    }
}
