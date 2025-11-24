package com.be.service;

import com.be.dto.admin.DashboardResponse;
import com.be.dto.common.PagedResponse;
import com.be.dto.order.CreateOrderRequest;
import com.be.dto.order.OrderDetailResponse;
import com.be.dto.order.OrderResponse;
import com.be.dto.order.UpdateOrderStatusRequest;
import com.be.entity.OrderStatus;

import java.time.LocalDateTime;


public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request, String userEmail);

    PagedResponse<OrderResponse> getUserOrders(String userEmail, int page, int size);

    OrderDetailResponse getOrderById(Long orderId, String userEmail);

    void cancelOrder(Long orderId, String userEmail);

    PagedResponse<OrderResponse> getAllOrders(int page, int size, OrderStatus status,
                                              LocalDateTime startDate, LocalDateTime endDate);

    OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);

    DashboardResponse getDashboardMetrics();
}