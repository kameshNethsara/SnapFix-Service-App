package com.ijse.snapfix.back_end.service.impl;

import com.ijse.snapfix.back_end.dto.RatingDTO;
import com.ijse.snapfix.back_end.entity.Rating;
import com.ijse.snapfix.back_end.entity.ServiceRequest;
import com.ijse.snapfix.back_end.repository.RatingRepository;
import com.ijse.snapfix.back_end.repository.ServiceRequestRepository;
import com.ijse.snapfix.back_end.service.RatingService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    @Override
    public RatingDTO saveRating(RatingDTO ratingDTO) {
        ServiceRequest sr = null;
        if (ratingDTO.getServiceRequestId() != null) {
            sr = serviceRequestRepository.findById(ratingDTO.getServiceRequestId())
                    .orElseThrow(() -> new EntityNotFoundException("ServiceRequest not found with id: " + ratingDTO.getServiceRequestId()));

            // check existing rating for that service request
            if (ratingRepository.findByServiceRequest_RequestId(ratingDTO.getServiceRequestId()).isPresent()) {
                throw new IllegalStateException("Rating already exists for serviceRequestId: " + ratingDTO.getServiceRequestId());
            }
        }

        Rating rating = Rating.builder()
                .userId(ratingDTO.getUserId())
                .technicianId(ratingDTO.getTechnicianId())
                .stars(ratingDTO.getStars())
                .comment(ratingDTO.getComment())
                .serviceRequest(sr)
                .build();

        rating = ratingRepository.save(rating);
        return mapToDTO(rating);
    }

    @Override
    public RatingDTO updateRating(RatingDTO ratingDTO) {
        Rating rating = ratingRepository.findById(ratingDTO.getRatingId())
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        rating.setStars(ratingDTO.getStars());
        rating.setComment(ratingDTO.getComment());

        rating = ratingRepository.save(rating);
        return mapToDTO(rating);
    }

    @Override
    public void deleteRating(Long ratingId) {
        ratingRepository.deleteById(ratingId);
    }

    @Override
    public RatingDTO getRatingById(Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));
        return mapToDTO(rating);
    }

    @Override
    public List<RatingDTO> getRatingsByTechnician(int technicianId) {
        return ratingRepository.findByTechnicianId(technicianId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RatingDTO> getAllRatings() {
        return ratingRepository.findAll()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public RatingDTO getRatingByServiceRequest(Long serviceRequestId) {
        if (serviceRequestId == null) return null;
        Optional<Rating> opt = ratingRepository.findByServiceRequest_RequestId(serviceRequestId);
        return opt.map(this::mapToDTO).orElse(null);
    }

    private RatingDTO mapToDTO(Rating rating) {
        Long srId = rating.getServiceRequest() != null ? rating.getServiceRequest().getRequestId() : null;
        return RatingDTO.builder()
                .ratingId(rating.getRatingId())
                .userId(rating.getUserId())
                .technicianId(rating.getTechnicianId())
                .serviceRequestId(srId)
                .stars(rating.getStars())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .build();
    }

}
