package com.restaurant.dto;

import com.restaurant.entity.BusinessSetting;

public class BusinessSettingResponse {

    private String restaurantName;
    private Double deliveryFee;
    private Double freeDeliveryThreshold;
    private Double minimumOrderAmount;
    private Double taxRatePercent;
    private Integer avgPrepTimeMinutes;
    private Boolean restaurantOpen;

    public BusinessSettingResponse() {
    }

    public BusinessSettingResponse(BusinessSetting setting) {
        if (setting != null) {
            this.restaurantName = setting.getRestaurantName();
            this.deliveryFee = setting.getDeliveryFee();
            this.freeDeliveryThreshold = setting.getFreeDeliveryThreshold();
            this.minimumOrderAmount = setting.getMinimumOrderAmount();
            this.taxRatePercent = setting.getTaxRatePercent();
            this.avgPrepTimeMinutes = setting.getAvgPrepTimeMinutes();
            this.restaurantOpen = setting.getRestaurantOpen();
        } else {
            this.restaurantName = "Harvest Kitchen";
            this.deliveryFee = 40.0;
            this.freeDeliveryThreshold = 499.0;
            this.minimumOrderAmount = 99.0;
            this.taxRatePercent = 5.0;
            this.avgPrepTimeMinutes = 25;
            this.restaurantOpen = true;
        }
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
