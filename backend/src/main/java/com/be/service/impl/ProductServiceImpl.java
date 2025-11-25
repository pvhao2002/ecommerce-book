package com.be.service.impl;

import com.be.dto.common.PagedResponse;
import com.be.dto.product.*;
import com.be.entity.Category;
import com.be.entity.Product;
import com.be.exception.ResourceNotFoundException;
import com.be.exception.ValidationException;
import com.be.repository.CategoryRepository;
import com.be.repository.ProductRepository;
import com.be.service.ProductService;
import com.be.util.PagingUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<ProductResponse> topTrendingProducts() {
        var pageable = PageRequest.of(0, PagingUtil.DEFAULT_PAGE_NUMBER);
        var productPage = productRepository.findTrendingProducts(pageable);

        return productPage
                .stream()
                .map(this::convertToProductResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getFlashSaleProducts() {
        var productPage = productRepository.findTop20ByIsActiveTrueOrderByUnitPrice();
        return productPage
                .stream()
                .map(this::convertToProductResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> top20NewProducts() {
        var productPage = productRepository.findTop20ByIsActiveTrueOrderByCreatedAtDesc();

        return productPage
                .stream()
                .map(this::convertToProductResponse)
                .toList();
    }

    @Override
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, Long categoryId, String search,
                                                         BigDecimal minPrice, BigDecimal maxPrice) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage;

        productPage = productRepository.findWithFilters(categoryId, search, minPrice, maxPrice, pageable);

        return PagedResponse.<ProductResponse>builder()
                .content(productPage.getContent().stream()
                        .map(this::convertToProductResponse)
                        .toList())
                .page(page)
                .size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }

    @Override
    public ProductDetailResponse getProductById(Long id) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (!product.getIsActive()) {
            throw new ResourceNotFoundException("Product", "id", id);
        }

        return convertToProductDetailResponse(product);
    }

    @Override
    public PagedResponse<ProductResponse> searchProducts(String query, int page, int size) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts(page, size, null, null, null, null);
        }

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var productPage = productRepository.searchByNameOrDescription(query.trim(), pageable);
        var productResponses = productPage.getContent().stream()
                .map(this::convertToProductResponse)
                .toList();

        return PagedResponse.<ProductResponse>builder()
                .content(productResponses)
                .page(page)
                .size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        var categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::convertToCategoryResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .unitPrice(request.getPrice())
                .quantity(request.getStock())
                .category(category)
                .images(new HashSet<>(request.getImages()))
                .isActive(true)
                .build();

        var savedProduct = productRepository.save(product);
        return new ProductResponse();
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        var category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnitPrice(request.getPrice());
        product.setQuantity(request.getStock());
        product.setCategory(category);
        product.setImages(request.getImages() != null ? new HashSet<>(request.getImages()) : new HashSet<>());

        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        var savedProduct = productRepository.save(product);
        return new ProductResponse();
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setIsActive(false);
        productRepository.save(product);
    }

    @Override
    public ProductResponse updateProductStatus(Long id, UpdateProductStatusRequest request) {
        var product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setIsActive(request.getIsActive());
        var savedProduct = productRepository.save(product);
        return convertToProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ValidationException("Category with name '" + request.getName() + "' already exists");
        }

        var category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        var savedCategory = categoryRepository.save(category);
        return convertToCategoryResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        var category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        categoryRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existingCategory -> {
                    if (!existingCategory.getId().equals(id)) {
                        throw new ValidationException("Category with name '" + request.getName() + "' already exists");
                    }
                });

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        var savedCategory = categoryRepository.save(category);
        return convertToCategoryResponse(savedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        var category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.getProducts().isEmpty()) {
            throw new ValidationException("Cannot delete category that contains products");
        }

        categoryRepository.delete(category);
    }

    private ProductResponse convertToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getUnitPrice())
                .images(product.getImages().stream().toList())
                .category(convertToCategoryResponse(product.getCategory()))
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .stock(product.getQuantity())
                .build();
    }

    private ProductDetailResponse convertToProductDetailResponse(Product product) {
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getUnitPrice())
                .images(product.getImages().stream().toList())
                .category(convertToCategoryResponse(product.getCategory()))
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .stock(product.getQuantity())
                .build();
    }

    private CategoryResponse convertToCategoryResponse(Category category) {
        if (category == null) {
            return null;
        }

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .productCount(category.getProducts().size())
                .build();
    }
}