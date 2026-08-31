package com.restaurant.dto;

public class BusinessSettingRequest {

    private String restaurantName = "Harvest Kitchen";
    private Double deliveryFee = 40.0;
    private Double freeDeliveryThreshold = 499.0;
    private Double minimumOrderAmount = 99.0;
    private Double taxRatePercent = 5.0;
    private Integer avgPrepTimeMinutes = 25;
    private Boolean restaurantOpen = true;

    public BusinessSettingRequest() {
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public Double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public Double getFreeDeliveryThreshold() {
        return freeDeliveryThreshold;
    }

    public void setFreeDeliveryThreshold(Double freeDeliveryThreshold) {
        this.freeDeliveryThreshold = freeDeliveryThreshold;
    }

    public Double getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(Double minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }

    public Double getTaxRatePercent() {
        return taxRatePercent;
    }

    public void setTaxRatePercent(Double taxRatePercent) {
        this.taxRatePercent = taxRatePercent;
    }

    public Integer getAvgPrepTimeMinutes() {
        return avgPrepTimeMinutes;
    }

    public void setAvgPrepTimeMinutes(Integer avgPrepTimeMinutes) {
        this.avgPrepTimeMinutes = avgPrepTimeMinutes;
    }

    public Boolean getRestaurantOpen() {
        return restaurantOpen;
    }

    public void setRestaurantOpen(Boolean restaurantOpen) {
        this.restaurantOpen = restaurantOpen;
    }
}
