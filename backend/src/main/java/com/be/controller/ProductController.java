package com.be.controller;

import com.be.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    private final ProductService productService;

    @GetMapping("newest")
    public Object getNewestProducts() {
        return ResponseEntity.ok(productService.top20NewProducts());
    }

    @GetMapping("/trending")
    public Object getTrendingProducts() {
        return ResponseEntity.ok(productService.topTrendingProducts());
    }

    @GetMapping("/flash-sale")
    public Object getFlashSaleProducts() {
        return ResponseEntity.ok(productService.getFlashSaleProducts());
    }

    @GetMapping
    public Object getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > 100) {
            size = 20;
        }

        return ResponseEntity.ok(productService.getAllProducts(page, size, category, search, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public Object getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    public Object searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > 100) {
            size = 20;
        }
        return ResponseEntity.ok(productService.searchProducts(query, page, size));
    }

    @GetMapping("/categories")
    public Object getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    private int getPage(int page) {
        return Math.max(page, 1);
    }
}