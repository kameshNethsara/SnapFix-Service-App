package com.ijse.snapfix.back_end.controller;


import com.ijse.snapfix.back_end.dto.PaymentDTO;
import com.ijse.snapfix.back_end.dto.UserPaymentDTO;
import com.ijse.snapfix.back_end.entity.Payment;
import com.ijse.snapfix.back_end.service.PaymentService;

import com.ijse.snapfix.back_end.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/snapfix/payments")
@RequiredArgsConstructor
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeService stripeService;

    @PostMapping("/create")
    public ResponseEntity<PaymentDTO> createPayment(@RequestBody PaymentDTO paymentDto) {
        Payment savedPayment = paymentService.savePayment(paymentDto);
        PaymentDTO dto = new PaymentDTO(
                savedPayment.getServiceRequest().getRequestId(),
                savedPayment.getAmount(),
                savedPayment.getDescription(),
                savedPayment.getBillImageUrl(),
                savedPayment.getMethod(),
                savedPayment.getStatus()
        );
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/service/{serviceRequestId}")
    public ResponseEntity<PaymentDTO> updatePaymentMethod(
            @PathVariable Long serviceRequestId,
            @RequestBody Map<String, String> body
    ) {
        String method = body.get("method");
        if (method == null || method.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Payment updatedPayment = paymentService.updatePaymentMethod(serviceRequestId, method);
        PaymentDTO dto = new PaymentDTO(
                updatedPayment.getServiceRequest().getRequestId(),
                updatedPayment.getAmount(),
                updatedPayment.getDescription(),
                updatedPayment.getBillImageUrl(),
                updatedPayment.getMethod(),
                updatedPayment.getStatus()
        );

        return ResponseEntity.ok(dto);
    }


    @GetMapping("/getAll")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/user-payments")
    public ResponseEntity<List<UserPaymentDTO>> getAllUserPayments() {
        List<UserPaymentDTO> payments = paymentService.getAllUserPayments();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/service/{serviceRequestId}")
    public ResponseEntity<PaymentDTO> getPaymentByService(@PathVariable Long serviceRequestId) {
        return ResponseEntity.ok(paymentService.getPaymentByServiceRequestId(serviceRequestId));
    }

    // Create a Stripe payment for a service request
    @PostMapping("/service/{serviceRequestId}/stripe")
    public ResponseEntity<?> createStripePayment(
            @PathVariable Long serviceRequestId,
            @RequestBody Map<String, String> body
    ) {
        String currency = body.get("currency");
        String paymentMethod = body.get("method");
        BigDecimal amount = new BigDecimal(body.get("amount"));

        if (paymentMethod == null || paymentMethod.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Create PaymentIntent with Stripe
            PaymentIntent paymentIntent = stripeService.createPayment(amount, currency);

            // Update payment record in database
            Payment payment = paymentService.stripePaymentHandle(
                    new PaymentDTO(serviceRequestId, amount.doubleValue(), "", null, paymentMethod, "PENDING")
            );

            // Return the client secret to frontend
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentId", payment.getPaymentId().toString());

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Stripe error: " + e.getMessage());
        }
    }
}
