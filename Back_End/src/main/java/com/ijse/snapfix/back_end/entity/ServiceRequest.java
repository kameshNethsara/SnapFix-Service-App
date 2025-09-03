package com.ijse.snapfix.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private String title;
    private String category;

    @Column(length = 2000)
    private String description;

    private String priority;
    private LocalDateTime preferredDateTime;
    private String phone;
    private String street;
    private String city;
    private String postalCode;

    @ElementCollection
    private List<String> photoUrls;

    private String status; // PENDING, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED

    @ElementCollection
    private List<Integer> assignedTechnicianIds; // store assigned technician IDs

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(mappedBy = "serviceRequest", cascade = CascadeType.ALL)
    private JobAssignment jobAssignment;

    @OneToOne(mappedBy = "serviceRequest", cascade = CascadeType.ALL)
    private Rating rating;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
