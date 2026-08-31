package com.restaurant.dto;

public class CancelOrderRequest {

    private String customerPhone;
    private String reason;

    public CancelOrderRequest() {
    }

    public CancelOrderRequest(String customerPhone, String reason) {
        this.customerPhone = customerPhone;
        this.reason = reason;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
