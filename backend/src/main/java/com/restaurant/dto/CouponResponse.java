package com.restaurant.dto;

import com.restaurant.entity.Coupon;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class CouponResponse {

    private Long id;
    private String code;
    private String discountType;
    private Double discountValue;
    private Double minimumOrderAmount;
    private Double maximumDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean firstOrderOnly;
    private LocalDate startDate;
    private LocalDate expiryDate;
    private Boolean active;
    private LocalDateTime createdAt;

    public CouponResponse() {
    }

    public CouponResponse(Coupon coupon) {
        this.id = coupon.getId();
        this.code = coupon.getCode();
        this.discountType = coupon.getDiscountType();
        this.discountValue = coupon.getDiscountValue();
        this.minimumOrderAmount = coupon.getMinimumOrderAmount();
        this.maximumDiscount = coupon.getMaximumDiscount();
        this.usageLimit = coupon.getUsageLimit();
        this.usedCount = coupon.getUsedCount();
        this.firstOrderOnly = coupon.getFirstOrderOnly();
        this.startDate = coupon.getStartDate();
        this.expiryDate = coupon.getExpiryDate();
        this.active = coupon.getActive();
        this.createdAt = coupon.getCreatedAt();
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
        this.code = code;
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
