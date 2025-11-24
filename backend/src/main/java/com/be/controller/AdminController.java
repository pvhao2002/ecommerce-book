package com.be.controller;

import com.be.dto.admin.DashboardResponse;
import com.be.dto.admin.UpdateUserStatusRequest;
import com.be.dto.admin.UserResponse;
import com.be.dto.common.MessageResponse;
import com.be.dto.common.PagedResponse;
import com.be.dto.order.OrderResponse;
import com.be.dto.order.UpdateOrderStatusRequest;
import com.be.dto.product.*;
import com.be.entity.OrderStatus;
import com.be.service.OrderService;
import com.be.service.ProductService;
import com.be.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;

    @PostMapping("/products")
    public Object createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse createdProduct = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping("/products/{id}")
    public Object updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse updatedProduct = productService.updateProduct(id, request);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/products/{id}")
    public Object deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Product deleted successfully")
                .build());
    }

    @PutMapping("/products/{id}/status")
    public Object updateProductStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        ProductResponse updatedProduct = productService.updateProductStatus(id, request);
        return ResponseEntity.ok(updatedProduct);
    }

    @PostMapping("/categories")
    public Object createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse createdCategory = productService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }

    @PutMapping("/categories/{id}")
    public Object updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse updatedCategory = productService.updateCategory(id, request);
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/categories/{id}")
    public Object deleteCategory(@PathVariable Long id) {
        productService.deleteCategory(id);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Category deleted successfully")
                .build());
    }

    @GetMapping("/orders")
    public Object getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PagedResponse<OrderResponse> orders = orderService.getAllOrders(page, size, status, startDate, endDate);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public Object updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/users")
    public Object getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        PagedResponse<UserResponse> users = userService.getAllUsers(page, size, search);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public Object getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/status")
    public Object updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        UserResponse updatedUser = userService.updateUserStatus(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/dashboard")
    public Object getDashboardMetrics() {
        DashboardResponse dashboard = orderService.getDashboardMetrics();
        return ResponseEntity.ok(dashboard);
    }
}