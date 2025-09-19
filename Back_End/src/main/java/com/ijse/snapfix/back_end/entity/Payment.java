package com.ijse.snapfix.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private double amount;
    private String description;
    private String method; // e.g., CASH, CARD
    private LocalDate paymentDate;
    private String billImageUrl;

    @Column(nullable = false)
    private String status = "PENDING"; // default status

    @OneToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;
}

