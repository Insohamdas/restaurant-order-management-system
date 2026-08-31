package com.restaurant.service;

import com.restaurant.dto.FoodReviewSummary;
import com.restaurant.dto.ReviewRequest;
import com.restaurant.dto.ReviewResponse;
import com.restaurant.entity.FoodItem;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderStatus;
import com.restaurant.entity.Review;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FoodItemRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final FoodItemRepository foodItemRepository;
    private final OrderRepository orderRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, FoodItemRepository foodItemRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.foodItemRepository = foodItemRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public ReviewResponse submitReview(ReviewRequest request) {
        FoodItem foodItem = foodItemRepository.findById(request.getFoodId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + request.getFoodId()));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        // Check if order was delivered
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Reviews can only be submitted for completed and delivered orders");
        }

        // Verify the customer ordered this food item
        boolean itemInOrder = order.getItems().stream()
                .anyMatch(i -> i.getFoodItem().getId().equals(request.getFoodId()));
        if (!itemInOrder) {
            throw new BadRequestException("You can only review food items that were part of your order");
        }

        // Prevent duplicate reviews for same order and food item
        if (reviewRepository.existsByOrderIdAndFoodItemId(request.getOrderId(), request.getFoodId())) {
            throw new BadRequestException("You have already submitted a review for this dish on Order #" + request.getOrderId());
        }

        Review review = new Review(
                foodItem,
                order.getId(),
                request.getCustomerName().trim(),
                request.getCustomerPhone().trim(),
                request.getRating(),
                request.getComment() != null ? request.getComment().trim() : ""
        );

        Review saved = reviewRepository.save(review);

        // Update cached averages on FoodItem
        Double avgRating = reviewRepository.getAverageRatingForFood(foodItem.getId());
        Long reviewCount = reviewRepository.getReviewCountForFood(foodItem.getId());

        foodItem.setAvgRating((avgRating != null) ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        foodItem.setReviewCount((reviewCount != null) ? reviewCount.intValue() : 0);
        foodItemRepository.save(foodItem);

        return new ReviewResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FoodReviewSummary getReviewsForFood(Long foodId) {
        FoodItem foodItem = foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + foodId));

        List<ReviewResponse> reviews = reviewRepository.findByFoodItemOrderByCreatedAtDesc(foodItem).stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());

        return new FoodReviewSummary(foodId, foodItem.getAvgRating(), foodItem.getReviewCount(), reviews);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(ReviewResponse::new)
                .collect(Collectors.toList());
    }
}
