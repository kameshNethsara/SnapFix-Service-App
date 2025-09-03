package com.ijse.snapfix.back_end.service;

import com.ijse.snapfix.back_end.dto.ServiceRequestDTO;
import java.util.List;

public interface ServiceRequestService {

    public ServiceRequestDTO createRequest(ServiceRequestDTO dto);
    public List<ServiceRequestDTO> getAllRequests();
    public List<ServiceRequestDTO> getRequestsByUserId(int userId);
    public ServiceRequestDTO getRequestById(Long id);
    public ServiceRequestDTO updateStatus(Long id, String status);
    public ServiceRequestDTO updateRequest(Long id, ServiceRequestDTO dto);
    public void deleteRequest(Long id);

}
