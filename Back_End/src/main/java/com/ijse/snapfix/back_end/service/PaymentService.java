package com.ijse.snapfix.back_end.service;

import com.ijse.snapfix.back_end.dto.PaymentDTO;
import com.ijse.snapfix.back_end.dto.UserPaymentDTO;
import com.ijse.snapfix.back_end.entity.Payment;
import com.stripe.exception.StripeException;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {

    Payment savePayment(PaymentDTO paymentDTO);

    public Payment updatePaymentMethod(Long serviceRequestId, String method);

    public Payment stripePaymentHandle(PaymentDTO paymentDTO) throws StripeException;

    List<PaymentDTO> getAllPayments();

    public List<UserPaymentDTO> getAllUserPayments();

    PaymentDTO getPaymentByServiceRequestId(Long serviceRequestId);

    public Payment updateStatus(Long requestId, String status);

}
