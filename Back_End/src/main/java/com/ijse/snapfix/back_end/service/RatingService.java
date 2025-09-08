package com.ijse.snapfix.back_end.service;

import com.ijse.snapfix.back_end.dto.RatingDTO;

import java.util.List;

public interface RatingService {

    RatingDTO saveRating(RatingDTO ratingDTO);

    RatingDTO updateRating(RatingDTO ratingDTO);

    void deleteRating(Long ratingId);

    RatingDTO getRatingById(Long ratingId);

    List<RatingDTO> getRatingsByTechnician(int technicianId);

    List<RatingDTO> getAllRatings();

    RatingDTO getRatingByServiceRequest(Long serviceRequestId);
}
