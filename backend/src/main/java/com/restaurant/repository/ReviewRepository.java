package com.restaurant.repository;

import com.restaurant.entity.FoodItem;
import com.restaurant.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByFoodItemOrderByCreatedAtDesc(FoodItem foodItem);
    List<Review> findByFoodItemIdOrderByCreatedAtDesc(Long foodItemId);
    List<Review> findByOrderId(Long orderId);
    boolean existsByOrderIdAndFoodItemId(Long orderId, Long foodItemId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.foodItem.id = :foodId")
    Double getAverageRatingForFood(@Param("foodId") Long foodId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.foodItem.id = :foodId")
    Long getReviewCountForFood(@Param("foodId") Long foodId);
}
