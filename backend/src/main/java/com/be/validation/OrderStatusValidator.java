package com.be.validation;

import com.be.entity.OrderStatus;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class OrderStatusValidator implements ConstraintValidator<ValidOrderStatus, OrderStatus> {
    @Override
    public boolean isValid(OrderStatus orderStatus, ConstraintValidatorContext context) {
        if (orderStatus == null) {
            return false;
        }

        return orderStatus == OrderStatus.PENDING ||
                orderStatus == OrderStatus.PROCESSING ||
                orderStatus == OrderStatus.SHIPPED ||
                orderStatus == OrderStatus.DELIVERED ||
                orderStatus == OrderStatus.CANCELLED;
    }
}