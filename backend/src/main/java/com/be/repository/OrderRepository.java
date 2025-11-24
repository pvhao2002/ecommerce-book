package com.be.repository;

import com.be.entity.Order;
import com.be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByTrackingNumber(String txn);

    Page<Order> findByUser(User user, Pageable pageable);

    long countByUser(User user);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.user = :user AND o.status = 'DELIVERED'")
    BigDecimal getTotalSpentByUser(@Param("user") User user);

    @Query("SELECT MAX(o.createdAt) FROM Order o WHERE o.user = :user")
    LocalDateTime getLastOrderDateByUser(@Param("user") User user);
}