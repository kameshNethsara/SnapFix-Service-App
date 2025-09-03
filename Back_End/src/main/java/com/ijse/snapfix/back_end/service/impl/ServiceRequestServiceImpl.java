package com.ijse.snapfix.back_end.service.impl;

import com.ijse.snapfix.back_end.dto.ServiceRequestDTO;
import com.ijse.snapfix.back_end.entity.JobAssignment;
import com.ijse.snapfix.back_end.entity.ServiceRequest;
import com.ijse.snapfix.back_end.entity.User;
import com.ijse.snapfix.back_end.repository.ServiceRequestRepository;
import com.ijse.snapfix.back_end.repository.UserRepository;
import com.ijse.snapfix.back_end.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository repository;
    private final UserRepository userRepository;

    // Example helper to calculate distance (Haversine formula)
    private boolean isWithinRange(double lat1, double lon1, double lat2, double lon2, double km) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;
        return distance <= km;
    }

    @Override
    public ServiceRequestDTO createRequest(ServiceRequestDTO dto) {
        // ===================== Find User =====================
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));

        // ===================== Set user location =====================
        Double userLat = user.getLatitude();
        Double userLon = user.getLongitude();
        dto.setLatitude(userLat);
        dto.setLongitude(userLon);

        // ===================== Handle photos =====================
        List<String> photoUrls = (dto.getPhotoUrls() != null && !dto.getPhotoUrls().isEmpty())
                ? dto.getPhotoUrls()
                : List.of("No images uploaded");

        // ===================== Build ServiceRequest Entity =====================
        ServiceRequest req = ServiceRequest.builder()
                .title(dto.getTitle())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .preferredDateTime(dto.getPreferredDateTime())
                .phone(dto.getPhone())
                .street(dto.getStreet())
                .city(dto.getCity() != null ? dto.getCity() : user.getUserAddress().getCity())
                .postalCode(dto.getPostalCode())
                .photoUrls(photoUrls)
                .status("PENDING")
                .user(user)
                .build();

        // ===================== Assign nearest available technicians =====================
        List<User> availableTechs = userRepository.findAvailableTechnicians();

        List<User> nearestTechs = availableTechs.stream()
                .filter(t -> t.getUserDepartment() != null
                        && t.getUserDepartment().equalsIgnoreCase(dto.getCategory()))
                .filter(t -> {
                    if (userLat != null && userLon != null && t.getLatitude() != null && t.getLongitude() != null) {
                        return isWithinRange(userLat, userLon, t.getLatitude(), t.getLongitude(), 30);
                    }
                    return t.getUserAddress() != null
                            && t.getUserAddress().getCity() != null
                            && t.getUserAddress().getCity().equalsIgnoreCase(
                            dto.getCity() != null ? dto.getCity() : user.getUserAddress().getCity());
                })
                .collect(Collectors.toList());

        List<Integer> techIds = nearestTechs.stream().map(User::getUserId).collect(Collectors.toList());
        req.setAssignedTechnicianIds(techIds);

        // ===================== Set technician info in DTO =====================
        if (!nearestTechs.isEmpty()) {
            User firstTech = nearestTechs.get(0);
            dto.setTechnicianId(firstTech.getUserId());
            dto.setTechnicianName(firstTech.getUserFullName());
            dto.setTechnicianPhone(firstTech.getUserMobile());
            dto.setAssignedTechnicianIds(techIds);

            // ===================== Create JobAssignment =====================
            JobAssignment assignment = new JobAssignment();
            assignment.setAssignedDate(LocalDate.now());
            assignment.setAssignmentStatus("PENDING");
            assignment.setTechnician(firstTech);
            assignment.setServiceRequest(req); // owner side
            req.setJobAssignment(assignment); // inverse side

        } else {
            dto.setTechnicianId(0);
            dto.setTechnicianName("No technician available");
            dto.setTechnicianPhone("N/A");
            dto.setAssignedTechnicianIds(List.of(0));
        }

        // ===================== Save request =====================
        ServiceRequest saved = repository.save(req);

        // ===================== Map back to DTO =====================
        ServiceRequestDTO responseDto = mapToDTO(saved);
        responseDto.setAssignedTechnicianIds(dto.getAssignedTechnicianIds());
        responseDto.setTechnicianId(dto.getTechnicianId());
        responseDto.setTechnicianName(dto.getTechnicianName());
        responseDto.setTechnicianPhone(dto.getTechnicianPhone());
        responseDto.setLatitude(dto.getLatitude());
        responseDto.setLongitude(dto.getLongitude());

        return responseDto;
    }


    @Override
    public List<ServiceRequestDTO> getAllRequests() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceRequestDTO> getRequestsByUserId(int userId) {
        return repository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceRequestDTO getRequestById(Long id) {
        ServiceRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with ID: " + id));
        return mapToDTO(req);
    }

    @Override
    public ServiceRequestDTO updateStatus(Long id, String status) {
        ServiceRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!isValidStatusTransition(req.getStatus(), status)) {
            throw new RuntimeException("Invalid status transition from " + req.getStatus() + " to " + status);
        }

        req.setStatus(status);
        ServiceRequest updated = repository.save(req);
        return mapToDTO(updated);
    }

    @Override
    public ServiceRequestDTO updateRequest(Long id, ServiceRequestDTO dto) {
        ServiceRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Update basic fields
        req.setTitle(dto.getTitle());
        req.setDescription(dto.getDescription());
        req.setPriority(dto.getPriority());
        req.setPreferredDateTime(dto.getPreferredDateTime());
        req.setPhone(dto.getPhone());
        req.setStreet(dto.getStreet());
        req.setCity(dto.getCity());
        req.setPostalCode(dto.getPostalCode());

        // Update photos if provided
        if (dto.getPhotoUrls() != null && !dto.getPhotoUrls().isEmpty()) {
            req.setPhotoUrls(dto.getPhotoUrls());
        } else {
            // If no images provided, set a placeholder text
            req.setPhotoUrls(List.of("No images uploaded"));
        }

        ServiceRequest updated = repository.save(req);
        return mapToDTO(updated);
    }


    @Override
    public void deleteRequest(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Request not found");
        }
        repository.deleteById(id);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Define valid status transitions
        switch (currentStatus) {
            case "PENDING":
                return List.of("APPROVED", "CANCELLED").contains(newStatus);
            case "APPROVED":
                return List.of("IN_PROGRESS", "CANCELLED").contains(newStatus);
            case "IN_PROGRESS":
                return List.of("COMPLETED", "CANCELLED").contains(newStatus);
            case "COMPLETED":
            case "CANCELLED":
                return false; // Final states
            default:
                return false;
        }
    }

    private ServiceRequestDTO mapToDTO(ServiceRequest entity) {
        ServiceRequestDTO dto = ServiceRequestDTO.builder()
                .requestId(entity.getRequestId())
                .title(entity.getTitle())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .priority(entity.getPriority())
                .preferredDateTime(entity.getPreferredDateTime())
                .phone(entity.getPhone())
                .street(entity.getStreet())
                .city(entity.getCity())
                .postalCode(entity.getPostalCode())
                .photoUrls(entity.getPhotoUrls())
                .status(entity.getStatus())
                .userId(entity.getUser().getUserId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .latitude(entity.getUser().getLatitude())
                .longitude(entity.getUser().getLongitude())
                .build();

        // Assign first technician info if exists
        if (entity.getAssignedTechnicianIds() != null && !entity.getAssignedTechnicianIds().isEmpty()) {
            Integer techId = entity.getAssignedTechnicianIds().get(0);
            User tech = userRepository.findById(techId)
                    .orElse(null);
            if (tech != null) {
                dto.setTechnicianId(tech.getUserId());
                dto.setTechnicianName(tech.getUserName());
                dto.setTechnicianPhone(tech.getUserMobile());
            }
        }

        return dto;
    }

}