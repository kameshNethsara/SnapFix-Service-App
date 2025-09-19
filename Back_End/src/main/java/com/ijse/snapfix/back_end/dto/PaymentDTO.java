package com.ijse.snapfix.back_end.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class PaymentDTO {
    private Long serviceRequestId;
    private double amount;
    private String description;
    private String billImageUrl;
    private String method;
    private String status;
}
