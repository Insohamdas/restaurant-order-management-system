package com.restaurant.dto;

import com.restaurant.entity.SpecialOffer;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class SpecialOfferResponse {

    private Long id;
    private String title;
    private String description;
    private Double discountPercent;
    private LocalTime startTime;
    private LocalTime endTime;
    private String daysOfWeek;
    private Boolean active;
    private Boolean isCurrentlyActive;
    private LocalDateTime createdAt;

    public SpecialOfferResponse() {
    }

    public SpecialOfferResponse(SpecialOffer offer, boolean isCurrentlyActive) {
        this.id = offer.getId();
        this.title = offer.getTitle();
        this.description = offer.getDescription();
        this.discountPercent = offer.getDiscountPercent();
        this.startTime = offer.getStartTime();
        this.endTime = offer.getEndTime();
        this.daysOfWeek = offer.getDaysOfWeek();
        this.active = offer.getActive();
        this.isCurrentlyActive = isCurrentlyActive;
        this.createdAt = offer.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(String daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getIsCurrentlyActive() {
        return isCurrentlyActive;
    }

    public void setIsCurrentlyActive(Boolean isCurrentlyActive) {
        this.isCurrentlyActive = isCurrentlyActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
