package com.be.service;

import com.be.dto.common.PagedResponse;
import com.be.dto.product.*;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    List<ProductResponse> topTrendingProducts();

    List<ProductResponse> getFlashSaleProducts();

    List<ProductResponse> top20NewProducts();

    PagedResponse<ProductResponse> getAllProducts(int page, int size, Long categoryId, String search,
                                                  BigDecimal minPrice, BigDecimal maxPrice);

    ProductDetailResponse getProductById(Long id);

    PagedResponse<ProductResponse> searchProducts(String query, int page, int size);

    List<CategoryResponse> getAllCategories();

    ProductResponse createProduct(CreateProductRequest request);

    ProductResponse updateProduct(Long id, UpdateProductRequest request);

    void deleteProduct(Long id);

    ProductResponse updateProductStatus(Long id, UpdateProductStatusRequest request);

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);

    void deleteCategory(Long id);
}