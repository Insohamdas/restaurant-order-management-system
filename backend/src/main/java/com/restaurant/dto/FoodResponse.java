package com.restaurant.dto;

import com.restaurant.entity.FoodItem;
import java.time.LocalDateTime;

public class FoodResponse {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private String imageUrl;
    private Boolean available;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private Boolean trackInventory;
    private Boolean isLowStock;
    private Double avgRating;
    private Integer reviewCount;
    private String upsellFoodIds;
    private LocalDateTime createdAt;

    public FoodResponse() {
    }

    public FoodResponse(FoodItem item) {
        this.id = item.getId();
        this.name = item.getName();
        this.description = item.getDescription();
        this.price = item.getPrice();
        this.category = item.getCategory();
        this.imageUrl = item.getImageUrl();
        this.available = item.getAvailable();
        this.stockQuantity = item.getStockQuantity();
        this.lowStockThreshold = item.getLowStockThreshold();
        this.trackInventory = item.getTrackInventory();
        this.isLowStock = Boolean.TRUE.equals(item.getTrackInventory()) && 
                          item.getStockQuantity() != null && 
                          item.getLowStockThreshold() != null && 
                          item.getStockQuantity() <= item.getLowStockThreshold();
        this.avgRating = item.getAvgRating() != null ? Math.round(item.getAvgRating() * 10.0) / 10.0 : 0.0;
        this.reviewCount = item.getReviewCount() != null ? item.getReviewCount() : 0;
        this.upsellFoodIds = item.getUpsellFoodIds();
        this.createdAt = item.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public Boolean getTrackInventory() {
        return trackInventory;
    }

    public void setTrackInventory(Boolean trackInventory) {
        this.trackInventory = trackInventory;
    }

    public Boolean getIsLowStock() {
        return isLowStock;
    }

    public void setIsLowStock(Boolean isLowStock) {
        this.isLowStock = isLowStock;
    }

    public Double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public String getUpsellFoodIds() {
        return upsellFoodIds;
    }

    public void setUpsellFoodIds(String upsellFoodIds) {
        this.upsellFoodIds = upsellFoodIds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

