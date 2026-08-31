package com.restaurant.dto;

public class CategoryPerformanceResponse {

    private String category;
    private Double totalRevenue;
    private Long totalQuantitySold;
    private Double percentageOfTotal;

    public CategoryPerformanceResponse() {
    }

    public CategoryPerformanceResponse(String category, Double totalRevenue, Long totalQuantitySold, Double percentageOfTotal) {
        this.category = category;
        this.totalRevenue = (totalRevenue != null) ? totalRevenue : 0.0;
        this.totalQuantitySold = (totalQuantitySold != null) ? totalQuantitySold : 0L;
        this.percentageOfTotal = (percentageOfTotal != null) ? Math.round(percentageOfTotal * 10.0) / 10.0 : 0.0;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalQuantitySold() {
        return totalQuantitySold;
    }

    public void setTotalQuantitySold(Long totalQuantitySold) {
        this.totalQuantitySold = totalQuantitySold;
    }

    public Double getPercentageOfTotal() {
        return percentageOfTotal;
    }

    public void setPercentageOfTotal(Double percentageOfTotal) {
        this.percentageOfTotal = percentageOfTotal;
    }
}
