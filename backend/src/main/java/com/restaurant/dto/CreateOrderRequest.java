package com.restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public class CreateOrderRequest {

    private Long userId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+ \\-()]{7,15}$", message = "Please enter a valid phone number")
    private String phone;

    private String customerEmail;

    @NotBlank(message = "Delivery address is required")
    private String address;

    private String couponCode;

    private Integer loyaltyPointsToRedeem = 0;

    private String orderSource = "DIRECT"; // "DINE_IN", "ZOMATO", "SWIGGY", "MAGICPIN", "DIRECT", "TAKEAWAY"

    private String tableNumber;

    private String specialInstructions;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(String customerName, String phone, String address, List<OrderItemRequest> items) {
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.items = items;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public Integer getLoyaltyPointsToRedeem() {
        return loyaltyPointsToRedeem;
    }

    public void setLoyaltyPointsToRedeem(Integer loyaltyPointsToRedeem) {
        this.loyaltyPointsToRedeem = loyaltyPointsToRedeem;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public String getOrderSource() {
        return (orderSource != null) ? orderSource : "DIRECT";
    }

    public void setOrderSource(String orderSource) {
        this.orderSource = orderSource;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
}

