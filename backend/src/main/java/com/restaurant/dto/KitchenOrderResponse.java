package com.restaurant.dto;

import com.restaurant.entity.Order;
import com.restaurant.entity.OrderStatus;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class KitchenOrderResponse {

    private Long orderId;
    private String customerName;
    private String phone;
    private OrderStatus status;
    private Long elapsedMinutes;
    private Integer estimatedPrepTimeMinutes;
    private String urgencyLevel; // "NORMAL", "URGENT", "OVERDUE"
    private LocalDateTime createdAt;
    private String orderSource; // "DINE_IN", "ZOMATO", "SWIGGY", "MAGICPIN", "DIRECT", "TAKEAWAY"
    private String tableNumber;
    private String address;
    private String specialInstructions;
    private List<OrderItemResponse> items;

    public KitchenOrderResponse() {
    }

    public KitchenOrderResponse(Order order) {
        this.orderId = order.getId();
        this.customerName = order.getCustomerName();
        this.phone = order.getPhone();
        this.status = order.getStatus();
        this.createdAt = order.getCreatedAt();
        this.orderSource = order.getOrderSource();
        this.tableNumber = order.getTableNumber();
        this.address = order.getAddress();
        this.specialInstructions = order.getSpecialInstructions();
        this.estimatedPrepTimeMinutes = (order.getEstimatedPrepTimeMinutes() != null) ? order.getEstimatedPrepTimeMinutes() : 25;
        
        if (order.getCreatedAt() != null) {
            this.elapsedMinutes = Duration.between(order.getCreatedAt(), LocalDateTime.now()).toMinutes();
        } else {
            this.elapsedMinutes = 0L;
        }

        if (this.elapsedMinutes > this.estimatedPrepTimeMinutes) {
            this.urgencyLevel = "OVERDUE";
        } else if (this.elapsedMinutes > 12) {
            this.urgencyLevel = "URGENT";
        } else {
            this.urgencyLevel = "NORMAL";
        }

        if (order.getItems() != null) {
            this.items = order.getItems().stream()
                    .map(OrderItemResponse::new)
                    .collect(Collectors.toList());
        }
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
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

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Long getElapsedMinutes() {
        return elapsedMinutes;
    }

    public void setElapsedMinutes(Long elapsedMinutes) {
        this.elapsedMinutes = elapsedMinutes;
    }

    public Integer getEstimatedPrepTimeMinutes() {
        return estimatedPrepTimeMinutes;
    }

    public void setEstimatedPrepTimeMinutes(Integer estimatedPrepTimeMinutes) {
        this.estimatedPrepTimeMinutes = estimatedPrepTimeMinutes;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
}
