package com.restaurant.dto;

import com.restaurant.entity.ComboItem;

public class ComboItemResponse {

    private Long foodId;
    private String foodName;
    private Double foodPrice;
    private String foodImageUrl;
    private Integer quantity;

    public ComboItemResponse() {
    }

    public ComboItemResponse(ComboItem comboItem) {
        if (comboItem.getFoodItem() != null) {
            this.foodId = comboItem.getFoodItem().getId();
            this.foodName = comboItem.getFoodItem().getName();
            this.foodPrice = comboItem.getFoodItem().getPrice();
            this.foodImageUrl = comboItem.getFoodItem().getImageUrl();
        }
        this.quantity = comboItem.getQuantity();
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

    public Double getFoodPrice() {
        return foodPrice;
    }

    public void setFoodPrice(Double foodPrice) {
        this.foodPrice = foodPrice;
    }

    public String getFoodImageUrl() {
        return foodImageUrl;
    }

    public void setFoodImageUrl(String foodImageUrl) {
        this.foodImageUrl = foodImageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
