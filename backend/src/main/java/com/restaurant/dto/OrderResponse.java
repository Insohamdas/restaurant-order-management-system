package com.restaurant.dto;

import com.restaurant.entity.Order;
import com.restaurant.entity.OrderStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {

    private Long id;
    private Long userId;
    private String customerName;
    private String phone;
    private String customerEmail;
    private String address;
    private Double subtotal;
    private Double discountAmount = 0.0;
    private String couponCode;
    private Double loyaltyDiscount = 0.0;
    private Double taxAmount = 0.0;
    private Double deliveryFee = 40.0;
    private Double totalAmount;
    private OrderStatus status;
    private Integer estimatedPrepTimeMinutes = 25;
    private String cancellationReason;
    private Boolean canCancel = false;
    private String orderSource;
    private String tableNumber;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items = new ArrayList<>();

    public OrderResponse() {
    }

    public OrderResponse(Order order) {
        this.id = order.getId();
        this.userId = order.getUserId();
        this.customerName = order.getCustomerName();
        this.phone = order.getPhone();
        this.customerEmail = order.getCustomerEmail();
        this.address = order.getAddress();
        this.discountAmount = (order.getDiscountAmount() != null) ? order.getDiscountAmount() : 0.0;
        this.couponCode = order.getCouponCode();
        this.loyaltyDiscount = (order.getLoyaltyDiscount() != null) ? order.getLoyaltyDiscount() : 0.0;
        this.taxAmount = (order.getTaxAmount() != null) ? order.getTaxAmount() : 0.0;
        this.deliveryFee = (order.getDeliveryFee() != null) ? order.getDeliveryFee() : 40.0;
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.estimatedPrepTimeMinutes = (order.getEstimatedPrepTimeMinutes() != null) ? order.getEstimatedPrepTimeMinutes() : 25;
        this.cancellationReason = order.getCancellationReason();
        this.canCancel = (order.getStatus() == OrderStatus.PLACED || order.getStatus() == OrderStatus.CONFIRMED);
        this.orderSource = order.getOrderSource();
        this.tableNumber = order.getTableNumber();
        this.specialInstructions = order.getSpecialInstructions();
        this.createdAt = order.getCreatedAt();
        
        if (order.getItems() != null) {
            this.items = order.getItems().stream()
                    .map(OrderItemResponse::new)
                    .collect(Collectors.toList());
        }
        
        if (order.getSubtotal() != null && order.getSubtotal() > 0) {
            this.subtotal = order.getSubtotal();
        } else if (!this.items.isEmpty()) {
            this.subtotal = this.items.stream()
                    .mapToDouble(OrderItemResponse::getSubtotal)
                    .sum();
        } else {
            this.subtotal = (order.getTotalAmount() != null) ? Math.max(0.0, order.getTotalAmount() - this.deliveryFee) : 0.0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public Double getLoyaltyDiscount() {
        return loyaltyDiscount;
    }

    public void setLoyaltyDiscount(Double loyaltyDiscount) {
        this.loyaltyDiscount = loyaltyDiscount;
    }

    public Double getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(Double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public Double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
        this.canCancel = (status == OrderStatus.PLACED || status == OrderStatus.CONFIRMED);
    }

    public Integer getEstimatedPrepTimeMinutes() {
        return estimatedPrepTimeMinutes;
    }

    public void setEstimatedPrepTimeMinutes(Integer estimatedPrepTimeMinutes) {
        this.estimatedPrepTimeMinutes = estimatedPrepTimeMinutes;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public Boolean getCanCancel() {
        return canCancel;
    }

    public void setCanCancel(Boolean canCancel) {
        this.canCancel = canCancel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
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

