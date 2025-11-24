package com.be.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Long totalCustomers;
    private Long totalProducts;
    private Long totalOrders;
    private Long completedOrders;
    private Double totalRevenue;
    private Double averageOrderValue;
    private Long totalCategories;
    private Long pendingOrders;
    
    private Long recentOrders;
    private Long newCustomers;
    private Long newProducts;
    private Long recentPendingOrders;
    
    private Long productsInStock;
    private Long outOfStockProducts;
    private Long lowStockProducts;
    private Long totalInventoryUnits;

    private Long customersWithOrders;
    private Double averageOrdersPerCustomer;
    private Double averageSpentPerCustomer;

    private List<TopProductResponse> topProducts;
    private List<MonthlyGrowthResponse> monthlyGrowth;
    private LocalDateTime generatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductResponse {
        private Long productId;
        private String productName;
        private Double totalRevenue;
        private Long totalQuantitySold;
        private Long orderCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyGrowthResponse {
        private String month;
        private Long orders;
        private Double revenue;
        private Long newCustomers;
    }
}