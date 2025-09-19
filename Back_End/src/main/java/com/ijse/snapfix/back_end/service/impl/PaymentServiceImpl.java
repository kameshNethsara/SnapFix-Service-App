package com.ijse.snapfix.back_end.service.impl;

import com.ijse.snapfix.back_end.dto.PaymentDTO;
import com.ijse.snapfix.back_end.dto.UserPaymentDTO;
import com.ijse.snapfix.back_end.entity.Payment;
import com.ijse.snapfix.back_end.entity.ServiceRequest;
import com.ijse.snapfix.back_end.entity.User;
import com.ijse.snapfix.back_end.repository.PaymentRepository;
import com.ijse.snapfix.back_end.repository.ServiceRequestRepository;
import com.ijse.snapfix.back_end.repository.UserRepository;
import com.ijse.snapfix.back_end.service.PaymentService;
import com.ijse.snapfix.back_end.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;

    @Override
    public Payment savePayment(PaymentDTO paymentDto) {
        ServiceRequest sr = serviceRequestRepository.findById(paymentDto.getServiceRequestId())
                .orElseThrow(() -> new RuntimeException("Service Request not found"));

        Payment payment = new Payment();
        payment.setServiceRequest(sr);
        payment.setAmount(paymentDto.getAmount());
        payment.setDescription(paymentDto.getDescription());
        payment.setBillImageUrl(paymentDto.getBillImageUrl());
        payment.setPaymentDate(LocalDate.now());
        //payment.setMethod("CASH"); // default method
        payment.setMethod(paymentDto.getMethod());

        return paymentRepository.save(payment);
    }

    @Override
    public Payment updatePaymentMethod(Long serviceRequestId, String method) {
        Payment payment = paymentRepository.findByServiceRequestId(serviceRequestId);
        if (payment == null) {
            // If no payment yet, create new with default fields
            PaymentDTO dto = new PaymentDTO(serviceRequestId, 0.0, "", null, method, "PENDING");
            return savePayment(dto);
        }

        payment.setMethod(method);

        if ("CASH".equalsIgnoreCase(method)) {
            payment.setPaymentDate(LocalDate.now());
            payment.setStatus("PAID");
        } else {
            payment.setStatus("PENDING");
        }

        return paymentRepository.save(payment);
    }

    @Override
    public Payment stripePaymentHandle(PaymentDTO paymentDTO) throws StripeException {

        PaymentIntent paymentIntent = stripeService.createPayment(
                BigDecimal.valueOf(paymentDTO.getAmount()), "usd");

        Payment payment = paymentRepository.findByServiceRequestId(paymentDTO.getServiceRequestId());
        if (payment == null) {
            // If no payment yet, create new with default fields
            PaymentDTO dto = new PaymentDTO(paymentDTO.getServiceRequestId(), 0.0, "", null, paymentDTO.getMethod(), "PENDING");
            return savePayment(dto);
        }

        payment.setMethod(paymentDTO.getMethod());

        if ("CASH".equalsIgnoreCase(paymentDTO.getMethod())) {
            payment.setPaymentDate(LocalDate.now());
            payment.setStatus("PAID");
        } else {
            payment.setStatus("PENDING");
        }

        return paymentRepository.save(payment);
    }

    @Override
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(p -> new PaymentDTO(
                        p.getServiceRequest().getRequestId(),
                        p.getAmount(),
                        p.getDescription(),
                        p.getBillImageUrl(),
                        p.getMethod(),
                        p.getStatus()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserPaymentDTO> getAllUserPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(p -> {
                    ServiceRequest sr = p.getServiceRequest();

                    // Technician info
                    int technicianId = 0;
                    String technicianName = "Not assigned";
                    if (sr.getAssignedTechnicianIds() != null && !sr.getAssignedTechnicianIds().isEmpty()) {
                        technicianId = sr.getAssignedTechnicianIds().get(0);
                        technicianName = userRepository.findById(technicianId)
                                .map(User::getUserFullName)
                                .orElse("Not assigned");
                    }

                    // User info
                    int userId = sr.getUser() != null ? sr.getUser().getUserId() : 0;
                    String userName = sr.getUser() != null ? sr.getUser().getUserFullName() : "Unknown";

                    return new UserPaymentDTO(
                            sr.getRequestId(),
                            p.getPaymentId(),
                            sr.getTitle(),
                            sr.getDescription(),
                            p.getDescription(),
                            userId,
                            userName,
                            technicianId,
                            technicianName,
                            p.getAmount(),
                            p.getMethod() != null ? p.getMethod() : "Pending",
                            p.getStatus(),
                            p.getPaymentDate(),
                            p.getBillImageUrl()
                    );
                })
                .collect(Collectors.toList());
    }


    @Override
    public PaymentDTO getPaymentByServiceRequestId(Long serviceRequestId) {
        Payment payment = paymentRepository.findByServiceRequestId(serviceRequestId);
        if (payment == null) return null;

        return new PaymentDTO(
                payment.getServiceRequest().getRequestId(),
                payment.getAmount(),
                payment.getDescription(),
                payment.getBillImageUrl(),
                payment.getMethod(),
                payment.getStatus()
        );
    }

}
