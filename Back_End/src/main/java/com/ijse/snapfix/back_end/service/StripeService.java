package com.ijse.snapfix.back_end.service;

import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Payout;
import com.stripe.model.Transfer;
import com.stripe.net.RequestOptions;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PayoutCreateParams;
import com.stripe.param.TransferCreateParams;

import java.math.BigDecimal;

public interface StripeService {
    public PaymentIntent createPayment(BigDecimal amount, String currency) throws StripeException;
    public Account createConnectedAccount(String email, String country) throws StripeException;
    public Transfer transferToConnectedAccount(BigDecimal amount, String currency, String connectedAccountId) throws StripeException;
    public Payout payoutToBank(BigDecimal amount, String currency, String connectedAccountId) throws StripeException;

}
