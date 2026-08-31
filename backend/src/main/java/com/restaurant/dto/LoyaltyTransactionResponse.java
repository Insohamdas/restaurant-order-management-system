package com.restaurant.dto;

import com.restaurant.entity.LoyaltyTransaction;
import java.time.LocalDateTime;

public class LoyaltyTransactionResponse {

    private Long id;
    private String phone;
    private Long orderId;
    private Integer points;
    private String transactionType;
    private String description;
    private LocalDateTime createdAt;

    public LoyaltyTransactionResponse() {
    }

    public LoyaltyTransactionResponse(LoyaltyTransaction tx) {
        this.id = tx.getId();
        this.phone = tx.getPhone();
        this.orderId = tx.getOrderId();
        this.points = tx.getPoints();
        this.transactionType = tx.getTransactionType();
        this.description = tx.getDescription();
        this.createdAt = tx.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
