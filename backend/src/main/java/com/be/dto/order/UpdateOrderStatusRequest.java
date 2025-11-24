package com.be.dto.order;

import com.be.entity.OrderStatus;
import com.be.validation.ValidOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusRequest {
    
    @NotNull(message = "Order status is required")
    @ValidOrderStatus
    private OrderStatus status;
    
    private String notes;
}