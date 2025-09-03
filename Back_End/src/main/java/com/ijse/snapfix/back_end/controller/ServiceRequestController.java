package com.ijse.snapfix.back_end.controller;

import com.ijse.snapfix.back_end.dto.ServiceRequestDTO;
import com.ijse.snapfix.back_end.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("snapfix/service-requests")
@RequiredArgsConstructor
@CrossOrigin
public class ServiceRequestController {

    private final ServiceRequestService service;

    @PostMapping
    public ResponseEntity<ServiceRequestDTO> createRequest(@RequestBody ServiceRequestDTO dto) {
        ServiceRequestDTO created = service.createRequest(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceRequestDTO>> getRequestsByUser(@PathVariable int userId) {
        return ResponseEntity.ok(service.getRequestsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceRequestDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> updateRequest(
            @PathVariable Long id,
            @RequestBody ServiceRequestDTO dto) {
        return ResponseEntity.ok(service.updateRequest(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        service.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ServiceRequestDTO>> getRequestsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getAllRequests().stream()
                .filter(req -> req.getStatus().equalsIgnoreCase(status))
                .collect(java.util.stream.Collectors.toList()));
    }
}
