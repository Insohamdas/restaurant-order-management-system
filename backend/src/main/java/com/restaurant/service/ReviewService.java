package com.restaurant.service;

import com.restaurant.dto.FoodReviewSummary;
import com.restaurant.dto.ReviewRequest;
import com.restaurant.dto.ReviewResponse;
import java.util.List;

public interface ReviewService {
    ReviewResponse submitReview(ReviewRequest request);
    FoodReviewSummary getReviewsForFood(Long foodId);
    List<ReviewResponse> getAllReviews();
}
