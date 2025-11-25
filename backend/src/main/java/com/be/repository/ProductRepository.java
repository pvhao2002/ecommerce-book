package com.be.repository;

import com.be.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("""
                    SELECT p
                  FROM OrderItem oi
                  JOIN oi.medicine p
                  GROUP BY p.id
                  ORDER BY SUM(oi.quantity) DESC
            """)
    List<Product> findTrendingProducts(Pageable pageable);
    List<Product> findTop20ByIsActiveTrueOrderByUnitPrice();

    List<Product> findTop20ByIsActiveTrueOrderByCreatedAtDesc();

    List<Product> findAllByIdIn(List<Long> ids);

    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.images " +
            "WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND p.isActive = true")
    Page<Product> searchByNameOrDescription(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "(:minPrice IS NULL OR p.unitPrice >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.unitPrice <= :maxPrice) AND " +
            "p.isActive = true")
    Page<Product> findWithFilters(@Param("categoryId") Long categoryId,
                                  @Param("searchTerm") String searchTerm,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  Pageable pageable);
}