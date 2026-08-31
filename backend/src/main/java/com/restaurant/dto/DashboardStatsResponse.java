package com.restaurant.dto;

public class DashboardStatsResponse {

    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private long totalFoodItems;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalOrders, long pendingOrders, long completedOrders, long totalFoodItems) {
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.completedOrders = completedOrders;
        this.totalFoodItems = totalFoodItems;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public long getTotalFoodItems() {
        return totalFoodItems;
    }

    public void setTotalFoodItems(long totalFoodItems) {
        this.totalFoodItems = totalFoodItems;
    }
}
