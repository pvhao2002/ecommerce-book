package com.be.service;

import com.be.dto.payment.PaymentRequest;
import com.be.dto.payment.PaymentResponse;
import com.be.entity.OrderStatus;

public interface PaymentService {
    String getSerectKey();

    PaymentResponse processPayment(PaymentRequest request);

    void updatePayment(String txnRef, OrderStatus status);

    void updatePayment(Long id, OrderStatus status);
}