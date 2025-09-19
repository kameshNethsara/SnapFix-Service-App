package com.ijse.snapfix.back_end.dto;

import lombok.*;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserPaymentDTO {
    private Long requestId;
    private Long paymentId;
    private String title;
    private String description;
    private String paydesc;
    private int userId;
    private String userName;
    private int technicianId;
    private String technicianName;
    private Double amount;
    private String method;
    private String status;
    private LocalDate paymentDate;
    private String billImageUrl;
}
