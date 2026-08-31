package com.restaurant.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "discount_type", nullable = false)
    private String discountType = "PERCENTAGE"; // "PERCENTAGE" or "FIXED_AMOUNT"

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "minimum_order_amount")
    private Double minimumOrderAmount = 0.0;

    @Column(name = "maximum_discount")
    private Double maximumDiscount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "first_order_only", nullable = false)
    private Boolean firstOrderOnly = false;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Coupon() {
    }

    public Coupon(String code, String discountType, Double discountValue, Double minimumOrderAmount, Double maximumDiscount, Integer usageLimit, Boolean firstOrderOnly, LocalDate startDate, LocalDate expiryDate, Boolean active) {
        this.code = (code != null) ? code.trim().toUpperCase() : "";
        this.discountType = (discountType != null) ? discountType : "PERCENTAGE";
        this.discountValue = discountValue;
        this.minimumOrderAmount = (minimumOrderAmount != null) ? minimumOrderAmount : 0.0;
        this.maximumDiscount = maximumDiscount;
        this.usageLimit = usageLimit;
        this.usedCount = 0;
        this.firstOrderOnly = (firstOrderOnly != null) ? firstOrderOnly : false;
        this.startDate = startDate;
        this.expiryDate = expiryDate;
        this.active = (active != null) ? active : true;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.usedCount == null) {
            this.usedCount = 0;
        }
        if (this.active == null) {
            this.active = true;
        }
        if (this.firstOrderOnly == null) {
            this.firstOrderOnly = false;
        }
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = (code != null) ? code.trim().toUpperCase() : null;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public Double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(Double discountValue) {
        this.discountValue = discountValue;
    }

    public Double getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(Double minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }

    public Double getMaximumDiscount() {
        return maximumDiscount;
    }

    public void setMaximumDiscount(Double maximumDiscount) {
        this.maximumDiscount = maximumDiscount;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public Integer getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(Integer usedCount) {
        this.usedCount = usedCount;
    }

    public Boolean getFirstOrderOnly() {
        return firstOrderOnly;
    }

    public void setFirstOrderOnly(Boolean firstOrderOnly) {
        this.firstOrderOnly = firstOrderOnly;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
