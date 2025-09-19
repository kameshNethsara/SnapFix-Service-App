package com.ijse.snapfix.back_end.repository;

import com.ijse.snapfix.back_end.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByTechnicianId(int technicianId);
    Optional<Rating> findByServiceRequest_RequestId(Long serviceRequestId);

//    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.technicianId = :techId")
//    Double findAverageRatingByTechnicianId(@Param("techId") int technicianId);

    List<Rating> findByUserId(int userId);
}
