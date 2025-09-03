package com.ijse.snapfix.back_end.dto;

import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestDTO {
    private Long requestId;
    private String title;
    private String category;
    private String description;
    private String priority;
    private LocalDateTime preferredDateTime;
    private String phone;
    private String street;
    private String city;
    private String postalCode;

    private List<String> photoUrls;
    private String status;
    private int userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // For assigned technician info
    private List<Integer> assignedTechnicianIds;
    private Integer technicianId;
    private String technicianName;
    private String technicianPhone;

    //For assigned Live location
    private Double latitude;
    private Double longitude;
}
