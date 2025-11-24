package com.be.repository;

import com.be.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    @Query("SELECT DISTINCT c FROM Category c WHERE EXISTS (SELECT p FROM Medicine p WHERE p.category = c AND p.isActive = true)")
    List<Category> findCategoriesWithActiveProducts();
}