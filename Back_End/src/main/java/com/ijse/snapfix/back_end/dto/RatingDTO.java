package com.ijse.snapfix.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDTO {
    private Long ratingId;
    private int userId;
    private int technicianId;
    private Long serviceRequestId;
    private int stars;
    private String comment;
    private LocalDateTime createdAt;
}

