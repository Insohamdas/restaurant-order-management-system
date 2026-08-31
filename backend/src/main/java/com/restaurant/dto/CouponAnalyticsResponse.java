package com.restaurant.dto;

public class CouponAnalyticsResponse {

    private String code;
    private String discountType;
    private Double discountValue;
    private Long timesUsed;
    private Double totalDiscountGiven;

    public CouponAnalyticsResponse() {
    }

    public CouponAnalyticsResponse(String code, String discountType, Double discountValue, Long timesUsed, Double totalDiscountGiven) {
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.timesUsed = (timesUsed != null) ? timesUsed : 0L;
        this.totalDiscountGiven = (totalDiscountGiven != null) ? totalDiscountGiven : 0.0;
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

    public Long getTimesUsed() {
        return timesUsed;
    }

    public void setTimesUsed(Long timesUsed) {
        this.timesUsed = timesUsed;
    }

    public Double getTotalDiscountGiven() {
        return totalDiscountGiven;
    }

    public void setTotalDiscountGiven(Double totalDiscountGiven) {
        this.totalDiscountGiven = totalDiscountGiven;
    }
}
