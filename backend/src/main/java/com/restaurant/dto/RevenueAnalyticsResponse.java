package com.restaurant.dto;

import java.util.List;

public class RevenueAnalyticsResponse {

    private String period;
    private Double totalRevenue;
    private Long totalOrders;
    private Double averageOrderValue;
    private Long completedOrders;
    private Long cancelledOrders;
    private List<ProductPerformanceResponse> topProducts;
    private List<CategoryPerformanceResponse> categoryBreakdown;

    public RevenueAnalyticsResponse() {
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Double getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(Double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public Long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public Long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(Long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }

    public List<ProductPerformanceResponse> getTopProducts() {
        return topProducts;
    }

    public void setTopProducts(List<ProductPerformanceResponse> topProducts) {
        this.topProducts = topProducts;
    }

    public List<CategoryPerformanceResponse> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<CategoryPerformanceResponse> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
}
