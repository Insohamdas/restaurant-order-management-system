package com.restaurant.dto;

public class ValidateCouponResponse {

    private boolean valid;
    private String code;
    private Double discountAmount = 0.0;
    private String message;

    public ValidateCouponResponse() {
    }

    public ValidateCouponResponse(boolean valid, String code, Double discountAmount, String message) {
        this.valid = valid;
        this.code = code;
        this.discountAmount = (discountAmount != null) ? discountAmount : 0.0;
        this.message = message;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
