package com.be.service.impl;

import com.be.config.PaymentConfig;
import com.be.dto.payment.PaymentRequest;
import com.be.dto.payment.PaymentResponse;
import com.be.entity.Order;
import com.be.entity.OrderStatus;
import com.be.entity.PaymentMethod;
import com.be.entity.PaymentStatus;
import com.be.exception.PaymentException;
import com.be.exception.ResourceNotFoundException;
import com.be.repository.OrderRepository;
import com.be.service.PaymentService;
import com.be.util.PaymentUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private final OrderRepository orderRepository;
    private final PaymentConfig.VNPayConfig vnPayConfig;

    public String getSerectKey() {
        return vnPayConfig.getHashSecret();
    }

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        var order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (request.getAmount().compareTo(order.getTotal()) != 0) {
            throw new PaymentException("Payment amount does not match order total");
        }

        return switch (request.getPaymentMethod()) {
            case VNPAY -> processVNPayPayment(request, order);
            default -> PaymentResponse.builder()
                    .status(PaymentStatus.FAILED)
                    .paymentMethod(request.getPaymentMethod())
                    .amount(request.getAmount())
                    .errorMessage("Unsupported payment method")
                    .processedAt(LocalDateTime.now())
                    .build();
        };
    }

    @Override
    public void updatePayment(String txnRef, OrderStatus status) {
        var o = orderRepository.findByTrackingNumber(txnRef);
        o.ifPresent(order -> {
            order.setStatus(status);
            orderRepository.save(order);
        });
    }

    @Override
    public void updatePayment(Long id, OrderStatus status) {
        var o = orderRepository.findById(id);
        o.ifPresent(order -> {
            order.setStatus(status);
            orderRepository.save(order);
        });
    }

    private PaymentResponse processVNPayPayment(PaymentRequest request, Order order) {
        try {
            var amount = PaymentUtils.formatAmountForGateway(request.getAmount());
            var orderInfo = PaymentUtils.generateOrderDescription(order.getId(), order.getPhone());
            var vnpParams = new HashMap<String, String>();
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", order.getTrackingNumber());
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            vnpParams.put("vnp_CreateDate", PaymentUtils.getVNPayTimestamp());
            vnpParams.put("vnp_ExpireDate", PaymentUtils.getVNPayExpireDate());
            var queryString = PaymentUtils.createQueryString(vnpParams);
            var signature = PaymentUtils.createVNPaySignature(vnpParams, vnPayConfig.getHashSecret());
            var paymentUrl = vnPayConfig.getUrl() + "?" + queryString + "&vnp_SecureHash=" + signature;
            var paymentResponse = new PaymentResponse();
            paymentResponse.setOrderId(order.getId());
            paymentResponse.setTransactionId(order.getTrackingNumber());
            paymentResponse.setPaymentMethod(PaymentMethod.VNPAY);
            paymentResponse.setStatus(PaymentStatus.PENDING);
            paymentResponse.setAmount(request.getAmount());
            paymentResponse.setPaymentUrl(paymentUrl);
            paymentResponse.setGatewayTransactionId(order.getTrackingNumber());
            paymentResponse.setCreatedAt(LocalDateTime.now());
            System.out.println("VNPay Payment URL: " + paymentUrl);
            return paymentResponse;
        } catch (Exception e) {
            throw new PaymentException("Failed to process VNPay payment: " + e.getMessage());
        }
    }
}