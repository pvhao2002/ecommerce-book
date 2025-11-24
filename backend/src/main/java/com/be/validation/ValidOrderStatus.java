package com.be.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = OrderStatusValidator.class)
@Documented
public @interface ValidOrderStatus {
    
    String message() default "Invalid order status";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}