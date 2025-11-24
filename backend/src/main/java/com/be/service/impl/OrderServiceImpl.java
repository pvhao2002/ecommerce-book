package com.be.service.impl;

import com.be.dto.admin.DashboardResponse;
import com.be.dto.common.PagedResponse;
import com.be.dto.order.*;
import com.be.entity.*;
import com.be.exception.ResourceNotFoundException;
import com.be.exception.ValidationException;
import com.be.repository.DashboardRepository;
import com.be.repository.OrderRepository;
import com.be.repository.ProductRepository;
import com.be.repository.UserRepository;
import com.be.service.OrderService;
import com.be.util.PaymentUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final DashboardRepository dashboardRepository;

    private static final BigDecimal TAX_RATE = new BigDecimal(0);
    private static final BigDecimal SHIPPING_COST = new BigDecimal(0);

    @Override
    public OrderResponse createOrder(CreateOrderRequest request, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var orderItems = new HashSet<OrderItem>();
        var subtotal = BigDecimal.ZERO;

        for (var itemRequest : request.getItems()) {
            var product = productRepository.findById(itemRequest.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.getMedicineId()));

            if (!product.getIsActive()) {
                throw new ValidationException("Medicine is not available: " + product.getName());
            }
            var unitPrice = product.getUnitPrice();

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new ValidationException("Insufficient stock for product: " + product.getId() + " " + product.getName());
            }

            var itemTotal = unitPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            var orderItem = OrderItem.builder()
                    .medicine(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .subTotal(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        var tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        var total = subtotal.add(tax).add(SHIPPING_COST);

        var order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .phone(request.getPhone())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .trackingNumber(PaymentUtils.generateTransactionId(request.getPaymentMethod()))
                .subtotal(subtotal)
                .tax(tax)
                .shipping(SHIPPING_COST)
                .total(total)
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        order.setItems(orderItems);

        var savedOrder = orderRepository.save(order);

        for (var item : orderItems) {
            if (item.getMedicine() != null) {
                var p = item.getMedicine();
                p.setQuantity(p.getQuantity() - item.getQuantity());
                productRepository.save(p);
            }
        }

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(String userEmail, int page, int size) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var orderPage = orderRepository.findByUser(user, pageable);

        var orderResponses = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return PagedResponse.<OrderResponse>builder()
                .content(orderResponses)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .first(orderPage.isFirst())
                .last(orderPage.isLast())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderById(Long orderId, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ValidationException("You don't have permission to access this order");
        }

        return mapToOrderDetailResponse(order);
    }

    @Override
    public void cancelOrder(Long orderId, String userEmail) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ValidationException("You don't have permission to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ValidationException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        for (var item : order.getItems()) {
            if (item.getMedicine() != null) {
                var p = item.getMedicine();
                p.setQuantity(p.getQuantity() + item.getQuantity());
                productRepository.save(p);
            }
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .fullName(order.getUser().getFullName())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .phone(order.getPhone())
                .tax(order.getTax())
                .shipping(order.getShipping())
                .total(order.getTotal())
                .itemCount(order.getItems().size())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }


    private OrderDetailResponse mapToOrderDetailResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return OrderDetailResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .fullName(order.getUser().getFullName())
                .items(itemResponses)
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .status(order.getStatus())
                .phone(order.getPhone())
                .shippingDate(order.getShippedAt())
                .deliveryDate(order.getDeliveredAt())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shipping(order.getShipping())
                .total(order.getTotal())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }


    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        Medicine medicine = item.getMedicine();

        return OrderItemResponse.builder()
                .id(item.getId())
                .medicineId(medicine.getId())
                .medicineName(medicine.getName())
                .medicineImages(new HashSet<>(medicine.getImages()))
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getSubTotal())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrders(int page, int size, OrderStatus status,
                                                     LocalDateTime startDate, LocalDateTime endDate) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Order> spec = Specification.where(null);

        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status));
        }

        if (startDate != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
        }

        if (endDate != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate));
        }

        var orderPage = orderRepository.findAll(spec, pageable);

        var orderResponses = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return PagedResponse.<OrderResponse>builder()
                .content(orderResponses)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .first(orderPage.isFirst())
                .last(orderPage.isLast())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        var oldStatus = order.getStatus();
        var newStatus = request.getStatus();

        if (!isValidStatusTransition(oldStatus, newStatus)) {
            throw new ValidationException("Invalid status transition from " + oldStatus + " to " + newStatus);
        }

        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (var item : order.getItems()) {
                if (item.getMedicine() != null) {
                    var p = item.getMedicine();
                    p.setQuantity(p.getQuantity() + item.getQuantity());
                    productRepository.save(p);
                }
            }
        }

        if (OrderStatus.SHIPPED.equals(newStatus)) {
            order.setShippedAt(LocalDateTime.now());
        }
        if (OrderStatus.DELIVERED.equals(newStatus)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics() {
        var now = LocalDateTime.now();
        var last30Days = now.minusDays(30);
        var last12Months = now.minusMonths(12);

        var overview = dashboardRepository.getDashboardOverview();

        var recentActivity = dashboardRepository.getRecentActivity(last30Days);

        var inventoryStatus = dashboardRepository.getInventoryStatus(10);

        var customerAnalytics = dashboardRepository.getCustomerAnalytics();

        var topProductsData = dashboardRepository.getTopProductsByRevenue(5);
        var topProducts = topProductsData.stream()
                .map(data -> DashboardResponse.TopProductResponse.builder()
                        .productId(((Number) data[0]).longValue())
                        .productName((String) data[1])
                        .totalRevenue(((Number) data[2]).doubleValue())
                        .totalQuantitySold(((Number) data[3]).longValue())
                        .orderCount(((Number) data[4]).longValue())
                        .build())
                .toList();

        var monthlyGrowthData = dashboardRepository.getMonthlyGrowthTrends(last12Months, now);
        var monthlyGrowth = monthlyGrowthData.stream()
                .map(data -> DashboardResponse.MonthlyGrowthResponse.builder()
                        .month((String) data[0])
                        .orders(((Number) data[1]).longValue())
                        .revenue(((Number) data[2]).doubleValue())
                        .newCustomers(((Number) data[3]).longValue())
                        .build())
                .toList();

        return DashboardResponse.builder()
                .totalCustomers(((Number) overview[0]).longValue())
                .totalProducts(((Number) overview[1]).longValue())
                .totalOrders(((Number) overview[2]).longValue())
                .completedOrders(((Number) overview[3]).longValue())
                .totalRevenue(((Number) overview[4]).doubleValue())
                .averageOrderValue(((Number) overview[5]).doubleValue())
                .totalCategories(((Number) overview[6]).longValue())
                .pendingOrders(((Number) overview[7]).longValue())

                .recentOrders(((Number) recentActivity[0]).longValue())
                .newCustomers(((Number) recentActivity[1]).longValue())
                .newProducts(((Number) recentActivity[2]).longValue())
                .recentPendingOrders(((Number) recentActivity[3]).longValue())

                .productsInStock(((Number) inventoryStatus[1]).longValue())
                .outOfStockProducts(((Number) inventoryStatus[2]).longValue())
                .lowStockProducts(((Number) inventoryStatus[3]).longValue())
                .totalInventoryUnits(((Number) inventoryStatus[4]).longValue())

                .customersWithOrders(((Number) customerAnalytics[1]).longValue())
                .averageOrdersPerCustomer(((Number) customerAnalytics[2]).doubleValue())
                .averageSpentPerCustomer(((Number) customerAnalytics[3]).doubleValue())

                .topProducts(topProducts)
                .monthlyGrowth(monthlyGrowth)

                .generatedAt(now)
                .build();
    }

    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == to) {
            return true;
        }

        return switch (from) {
            case PENDING -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED -> to == OrderStatus.DELIVERED;
            default -> false;
        };
    }
}