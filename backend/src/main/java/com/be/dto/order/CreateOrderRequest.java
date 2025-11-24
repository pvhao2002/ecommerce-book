package com.be.dto.order;

import com.be.entity.PaymentMethod;
import com.be.validation.ValidPaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    @NotEmpty(message = "Phone cannot be empty")
    private String phone;

    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    private List<CreateOrderItemRequest> items;

    @NotNull(message = "Shipping address is required")
    private String shippingAddress;

    @NotNull(message = "Payment method is required")
    @ValidPaymentMethod
    private PaymentMethod paymentMethod;
}