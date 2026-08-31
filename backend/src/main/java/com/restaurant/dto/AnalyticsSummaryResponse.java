package com.restaurant.dto;

import java.util.List;

public class AnalyticsSummaryResponse {

    private Double todayRevenue;
    private Long todayOrders;
    private Double monthRevenue;
    private Double totalRevenue;
    private Double averageOrderValue;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private Double cancellationRate;
    private Long totalCustomers;
    private Long totalFoodItems;
    private Long lowStockCount;
    private List<ProductPerformanceResponse> topSellingDishes;
    private List<CategoryPerformanceResponse> categorySales;

    public AnalyticsSummaryResponse() {
    }

    public Double getMonthRevenue() {
        return monthRevenue;
    }

    public void setMonthRevenue(Double monthRevenue) {
        this.monthRevenue = monthRevenue;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Double getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(Double todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public Long getTodayOrders() {
        return todayOrders;
    }

    public void setTodayOrders(Long todayOrders) {
        this.todayOrders = todayOrders;
    }

    public Double getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(Double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public Long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
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

    public Double getCancellationRate() {
        return cancellationRate;
    }

    public void setCancellationRate(Double cancellationRate) {
        this.cancellationRate = cancellationRate;
    }

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Long getTotalFoodItems() {
        return totalFoodItems;
    }

    public void setTotalFoodItems(Long totalFoodItems) {
        this.totalFoodItems = totalFoodItems;
    }

    public Long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(Long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public List<ProductPerformanceResponse> getTopSellingDishes() {
        return topSellingDishes;
    }

    public void setTopSellingDishes(List<ProductPerformanceResponse> topSellingDishes) {
        this.topSellingDishes = topSellingDishes;
    }

    public List<CategoryPerformanceResponse> getCategorySales() {
        return categorySales;
    }

    public void setCategorySales(List<CategoryPerformanceResponse> categorySales) {
        this.categorySales = categorySales;
    }
}
