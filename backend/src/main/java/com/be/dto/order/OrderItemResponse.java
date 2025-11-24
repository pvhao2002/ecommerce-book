package com.be.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private Set<String> medicineImages;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}