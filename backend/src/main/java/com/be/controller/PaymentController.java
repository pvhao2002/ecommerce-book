package com.be.controller;

import com.be.dto.common.ApiResponse;
import com.be.dto.payment.PaymentRequest;
import com.be.entity.OrderStatus;
import com.be.exception.ResourceNotFoundException;
import com.be.repository.OrderRepository;
import com.be.service.PaymentService;
import com.be.util.NetworkUtils;
import com.be.util.PaymentUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payment")
public class PaymentController {
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    @PostMapping("/process")
    public Object processPayment(
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.processPayment(request)));
    }

    @GetMapping("/cancel/{id}")
    public Object cancelPayment(@PathVariable Long id) {
        paymentService.updatePayment(id, OrderStatus.CANCELLED);
        return ResponseEntity.ok(ApiResponse.success("Cancel order success"));
    }

    @GetMapping("web/vnpay/return")
    public void webReturn(@RequestParam Map<String, String> params, HttpServletResponse response, HttpServletRequest request)
            throws IOException {
        var txnRef = params.get("vnp_TxnRef");
        var orderOpt = orderRepository.findByTrackingNumber(txnRef).orElseThrow(() ->
                new ResourceNotFoundException("Order not found with tracking number: " + txnRef));
        var isValid = PaymentUtils.validateVNPaySignature(params, paymentService.getSerectKey());
        if (!isValid) {
            paymentService.updatePayment(txnRef, OrderStatus.CANCELLED);
            response.sendRedirect("localhost:3001/b/order-failed");
            return;
        }

        var responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            paymentService.updatePayment(txnRef, OrderStatus.PROCESSING);
        } else {
            paymentService.updatePayment(txnRef, OrderStatus.CANCELLED);
        }
        response.sendRedirect("localhost:3001/b/order-success/" + orderOpt.getId());
    }

    @GetMapping("/vnpay/return")
    public RedirectView handleVNPayReturn(@RequestParam Map<String, String> params) {
        var deeplink = "exp://%s:8081/--/payment/success?".formatted(NetworkUtils.getLocalIpAddress());
        var txnRef = params.get("vnp_TxnRef");
        var isValid = PaymentUtils.validateVNPaySignature(params, paymentService.getSerectKey());
        if (!isValid) {
            paymentService.updatePayment(txnRef, OrderStatus.CANCELLED);
            return new RedirectView(deeplink);
        }

        var responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            paymentService.updatePayment(txnRef, OrderStatus.PROCESSING);
        } else {
            paymentService.updatePayment(txnRef, OrderStatus.CANCELLED);
        }
        return new RedirectView(deeplink);
    }
}
