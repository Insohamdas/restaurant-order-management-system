package com.restaurant.dto;

import java.util.List;

public class FoodReviewSummary {

    private Long foodId;
    private Double averageRating = 0.0;
    private Integer totalReviews = 0;
    private List<ReviewResponse> reviews;

    public FoodReviewSummary() {
    }

    public FoodReviewSummary(Long foodId, Double averageRating, Integer totalReviews, List<ReviewResponse> reviews) {
        this.foodId = foodId;
        this.averageRating = (averageRating != null) ? Math.round(averageRating * 10.0) / 10.0 : 0.0;
        this.totalReviews = (totalReviews != null) ? totalReviews : 0;
        this.reviews = reviews;
    }

    public Long getFoodId() {
        return foodId;
    }

    public void setFoodId(Long foodId) {
        this.foodId = foodId;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }

    public List<ReviewResponse> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewResponse> reviews) {
        this.reviews = reviews;
    }
}
