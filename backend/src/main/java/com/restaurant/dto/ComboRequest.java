package com.restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ComboRequest {

    @NotBlank(message = "Combo name is required")
    private String name;

    private String description;

    @NotNull(message = "Combo price is required")
    private Double comboPrice;

    private String imageUrl;
    private Boolean active = true;

    @NotEmpty(message = "Combo must contain at least one food item")
    @Valid
    private List<ComboItemRequest> items;

    public ComboRequest() {
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

    public List<ComboItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ComboItemRequest> items) {
        this.items = items;
    }
}
