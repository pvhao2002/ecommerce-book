package com.be.repository;
import java.time.LocalDateTime;
import java.util.List;

public interface DashboardRepository {

    Object[] getDashboardOverview();

    List<Object[]> getTopProductsByRevenue(int limit);

    Object[] getCustomerAnalytics();

    Object[] getInventoryStatus(int lowStockThreshold);

    Object[] getRecentActivity(LocalDateTime since);

    List<Object[]> getMonthlyGrowthTrends(LocalDateTime startDate, LocalDateTime endDate);
}