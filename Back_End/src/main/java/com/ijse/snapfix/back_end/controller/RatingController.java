package com.ijse.snapfix.back_end.controller;

import com.ijse.snapfix.back_end.dto.RatingDTO;
import com.ijse.snapfix.back_end.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/snapfix/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingDTO> createRating(@RequestBody RatingDTO ratingDTO) {
        return ResponseEntity.ok(ratingService.saveRating(ratingDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingDTO> updateRating(@PathVariable Long id, @RequestBody RatingDTO ratingDTO) {
        ratingDTO.setRatingId(id);
        return ResponseEntity.ok(ratingService.updateRating(ratingDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRating(@PathVariable Long id) {
        ratingService.deleteRating(id);
        return ResponseEntity.ok("Rating deleted successfully!");
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingDTO> getRatingById(@PathVariable Long id) {
        return ResponseEntity.ok(ratingService.getRatingById(id));
    }

    @GetMapping
    public ResponseEntity<List<RatingDTO>> getAllRatings() {
        return ResponseEntity.ok(ratingService.getAllRatings());
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<RatingDTO>> getRatingsByTechnician(@PathVariable int technicianId) {
        return ResponseEntity.ok(ratingService.getRatingsByTechnician(technicianId));
    }

    @GetMapping("/service-request/{serviceRequestId}")
    public ResponseEntity<RatingDTO> getRatingByServiceRequest(@PathVariable Long serviceRequestId) {
        return ResponseEntity.ok(ratingService.getRatingByServiceRequest(serviceRequestId));
    }
}
