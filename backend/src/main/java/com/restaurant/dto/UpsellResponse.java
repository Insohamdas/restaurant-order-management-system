package com.restaurant.dto;

import java.util.List;

public class UpsellResponse {

    private String title;
    private String subtitle;
    private List<FoodResponse> items;

    public UpsellResponse() {
    }

    public UpsellResponse(String title, String subtitle, List<FoodResponse> items) {
        this.title = title;
        this.subtitle = subtitle;
        this.items = items;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public List<FoodResponse> getItems() {
        return items;
    }

    public void setItems(List<FoodResponse> items) {
        this.items = items;
    }
}
