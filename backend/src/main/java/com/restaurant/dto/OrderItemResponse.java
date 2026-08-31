package com.restaurant.dto;

import com.restaurant.entity.OrderItem;

public class OrderItemResponse {

    private Long id;
    private Long foodId;
    private String foodName;
    private Integer quantity;
    private Double price;
    private Double subtotal;
    private String imageUrl;

    public OrderItemResponse() {
    }

    public OrderItemResponse(OrderItem item) {
        this.id = item.getId();
        if (item.getFoodItem() != null) {
            this.foodId = item.getFoodItem().getId();
            this.foodName = item.getFoodItem().getName();
            this.imageUrl = item.getFoodItem().getImageUrl();
        }
        this.quantity = item.getQuantity();
        this.price = item.getPrice();
        this.subtotal = item.getPrice() * item.getQuantity();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFoodId() {
        return foodId;
    }

    public void setFoodId(Long foodId) {
        this.foodId = foodId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
