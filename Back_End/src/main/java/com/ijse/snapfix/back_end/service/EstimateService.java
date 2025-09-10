package com.ijse.snapfix.back_end.service;

import com.ijse.snapfix.back_end.dto.EstimateRequestDTO;

public interface EstimateService {
    String generateEstimate(EstimateRequestDTO request);
}
