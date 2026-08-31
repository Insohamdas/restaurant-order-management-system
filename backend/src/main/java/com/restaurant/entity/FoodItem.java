package com.restaurant.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_items")
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 50;

    @Column(name = "low_stock_threshold", nullable = false)
    private Integer lowStockThreshold = 5;

    @Column(name = "track_inventory", nullable = false)
    private Boolean trackInventory = true;

    @Column(name = "avg_rating")
    private Double avgRating = 0.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "upsell_food_ids")
    private String upsellFoodIds;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FoodItem() {
    }

    public FoodItem(String name, String description, Double price, String category, String imageUrl, Boolean available) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.available = (available != null) ? available : true;
        this.stockQuantity = 50;
        this.lowStockThreshold = 5;
        this.trackInventory = true;
        this.avgRating = 0.0;
        this.reviewCount = 0;
        this.createdAt = LocalDateTime.now();
    }

    public FoodItem(String name, String description, Double price, String category, String imageUrl, Boolean available, Integer stockQuantity, Integer lowStockThreshold) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.available = (available != null) ? available : true;
        this.stockQuantity = (stockQuantity != null) ? stockQuantity : 50;
        this.lowStockThreshold = (lowStockThreshold != null) ? lowStockThreshold : 5;
        this.trackInventory = true;
        this.avgRating = 0.0;
        this.reviewCount = 0;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.available == null) {
            this.available = true;
        }
        if (this.stockQuantity == null) {
            this.stockQuantity = 50;
        }
        if (this.lowStockThreshold == null) {
            this.lowStockThreshold = 5;
        }
        if (this.trackInventory == null) {
            this.trackInventory = true;
        }
        if (this.avgRating == null) {
            this.avgRating = 0.0;
        }
        if (this.reviewCount == null) {
            this.reviewCount = 0;
        }
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

