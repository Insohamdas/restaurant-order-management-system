package com.restaurant.dto;

import com.restaurant.entity.Combo;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ComboResponse {

    private Long id;
    private String name;
    private String description;
    private Double comboPrice;
    private Double originalPrice;
    private Double savings;
    private String imageUrl;
    private Boolean active;
    private LocalDateTime createdAt;
    private List<ComboItemResponse> items = new ArrayList<>();

    public ComboResponse() {
    }

    public ComboResponse(Combo combo) {
        this.id = combo.getId();
        this.name = combo.getName();
        this.description = combo.getDescription();
        this.comboPrice = combo.getComboPrice();
        this.originalPrice = combo.getOriginalPrice();
        this.savings = Math.max(0.0, (combo.getOriginalPrice() != null ? combo.getOriginalPrice() : 0.0) - (combo.getComboPrice() != null ? combo.getComboPrice() : 0.0));
        this.imageUrl = combo.getImageUrl();
        this.active = combo.getActive();
        this.createdAt = combo.getCreatedAt();
        if (combo.getItems() != null) {
            this.items = combo.getItems().stream()
                    .map(ComboItemResponse::new)
                    .collect(Collectors.toList());
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getComboPrice() {
        return comboPrice;
    }

    public void setComboPrice(Double comboPrice) {
        this.comboPrice = comboPrice;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Double getSavings() {
        return savings;
    }

    public void setSavings(Double savings) {
        this.savings = savings;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public List<ComboItemResponse> getItems() {
        return items;
    }

    public void setItems(List<ComboItemResponse> items) {
        this.items = items;
    }
}
