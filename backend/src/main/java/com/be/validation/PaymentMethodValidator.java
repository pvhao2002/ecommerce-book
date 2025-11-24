package com.be.validation;

import com.be.entity.PaymentMethod;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PaymentMethodValidator implements ConstraintValidator<ValidPaymentMethod, PaymentMethod> {
    @Override
    public boolean isValid(PaymentMethod paymentMethod, ConstraintValidatorContext context) {
        if (paymentMethod == null) {
            return false;
        }
        return paymentMethod == PaymentMethod.VNPAY || paymentMethod == PaymentMethod.COD;
    }
}