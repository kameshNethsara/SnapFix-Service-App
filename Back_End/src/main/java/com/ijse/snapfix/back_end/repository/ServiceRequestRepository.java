package com.ijse.snapfix.back_end.repository;

import com.ijse.snapfix.back_end.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByUserUserIdOrderByCreatedAtDesc(int userId);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    //List<ServiceRequest> findByStatusOrderByCreatedAtDesc(String status);
}