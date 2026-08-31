package com.restaurant.service;

import com.restaurant.dto.FoodRequest;
import com.restaurant.dto.FoodResponse;

import java.util.List;

public interface FoodService {

    List<FoodResponse> getAllFoods(String category, Boolean availableOnly);

    FoodResponse getFoodById(Long id);

    FoodResponse createFood(FoodRequest request);

    FoodResponse updateFood(Long id, FoodRequest request);

    void deleteFood(Long id);
}
