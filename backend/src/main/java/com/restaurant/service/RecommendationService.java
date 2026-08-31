package com.restaurant.service;

import com.restaurant.dto.FoodResponse;
import com.restaurant.dto.UpsellResponse;
import java.util.List;

public interface RecommendationService {
    UpsellResponse getUpsellsForCart(List<Long> cartFoodIds);
    List<FoodResponse> getSmartRecommendations(List<Long> pastFoodIds);
    List<FoodResponse> getFrequentlyBoughtTogether(Long foodId);
}
