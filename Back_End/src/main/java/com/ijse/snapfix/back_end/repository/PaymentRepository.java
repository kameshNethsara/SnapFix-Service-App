package com.ijse.snapfix.back_end.repository;

import com.ijse.snapfix.back_end.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p WHERE p.serviceRequest.requestId = :srId")
    Payment findByServiceRequestId(@Param("srId") Long serviceRequestId);
}
