package com.ijse.snapfix.back_end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int assignmentId;

    private LocalDate assignedDate;
    private String assignmentStatus;

    @OneToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician; // userRole = TECHNICIAN
}
