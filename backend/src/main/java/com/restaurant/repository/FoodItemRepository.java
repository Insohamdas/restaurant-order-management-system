package com.restaurant.repository;

import com.restaurant.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByCategoryIgnoreCase(String category);

    List<FoodItem> findByAvailableTrue();

    List<FoodItem> findByCategoryIgnoreCaseAndAvailableTrue(String category);

    long countByAvailableTrue();

    @Query("SELECT f FROM FoodItem f WHERE f.trackInventory = true AND f.stockQuantity <= f.lowStockThreshold ORDER BY f.stockQuantity ASC")
    List<FoodItem> findLowStockItems();

    List<FoodItem> findTop6ByAvailableTrueOrderByAvgRatingDesc();
    
    List<FoodItem> findTop4ByCategoryIgnoreCaseAndAvailableTrueAndIdNot(String category, Long id);
}

