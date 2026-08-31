package com.restaurant.controller;

import com.restaurant.dto.FoodReviewSummary;
import com.restaurant.dto.ReviewRequest;
import com.restaurant.dto.ReviewResponse;
import com.restaurant.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse created = reviewService.submitReview(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/food/{foodId}")
    public ResponseEntity<FoodReviewSummary> getReviewsForFood(@PathVariable Long foodId) {
        return ResponseEntity.ok(reviewService.getReviewsForFood(foodId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
}
