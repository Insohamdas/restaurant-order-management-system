package com.restaurant.dto;

public class ProductPerformanceResponse {

    private String productName;
    private String category;
    private Long quantitySold;
    private Double totalRevenue;

    public ProductPerformanceResponse() {
    }

    public ProductPerformanceResponse(String productName, String category, Long quantitySold, Double totalRevenue) {
        this.productName = productName;
        this.category = category;
        this.quantitySold = (quantitySold != null) ? quantitySold : 0L;
        this.totalRevenue = (totalRevenue != null) ? totalRevenue : 0.0;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(Long quantitySold) {
        this.quantitySold = quantitySold;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
