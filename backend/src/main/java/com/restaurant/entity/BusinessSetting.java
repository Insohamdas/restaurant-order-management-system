package com.restaurant.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "business_settings")
public class BusinessSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "restaurant_name", nullable = false)
    private String restaurantName = "Harvest Kitchen";

    @Column(name = "delivery_fee", nullable = false)
    private Double deliveryFee = 40.0;

    @Column(name = "free_delivery_threshold", nullable = false)
    private Double freeDeliveryThreshold = 499.0;

    @Column(name = "minimum_order_amount", nullable = false)
    private Double minimumOrderAmount = 99.0;

    @Column(name = "tax_rate_percent", nullable = false)
    private Double taxRatePercent = 5.0;

    @Column(name = "avg_prep_time_minutes", nullable = false)
    private Integer avgPrepTimeMinutes = 25;

    @Column(name = "restaurant_open", nullable = false)
    private Boolean restaurantOpen = true;

    public BusinessSetting() {
    }

    public BusinessSetting(String restaurantName, Double deliveryFee, Double freeDeliveryThreshold, Double minimumOrderAmount, Double taxRatePercent, Integer avgPrepTimeMinutes, Boolean restaurantOpen) {
        this.restaurantName = (restaurantName != null) ? restaurantName : "Harvest Kitchen";
        this.deliveryFee = (deliveryFee != null) ? deliveryFee : 40.0;
        this.freeDeliveryThreshold = (freeDeliveryThreshold != null) ? freeDeliveryThreshold : 499.0;
        this.minimumOrderAmount = (minimumOrderAmount != null) ? minimumOrderAmount : 99.0;
        this.taxRatePercent = (taxRatePercent != null) ? taxRatePercent : 5.0;
        this.avgPrepTimeMinutes = (avgPrepTimeMinutes != null) ? avgPrepTimeMinutes : 25;
        this.restaurantOpen = (restaurantOpen != null) ? restaurantOpen : true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
