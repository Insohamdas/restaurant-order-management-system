package com.restaurant.service;

import com.restaurant.dto.FoodResponse;
import com.restaurant.dto.UpsellResponse;
import com.restaurant.entity.FoodItem;
import com.restaurant.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RecommendationServiceImpl implements RecommendationService {

    private final FoodItemRepository foodItemRepository;

    public RecommendationServiceImpl(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @Override
    public UpsellResponse getUpsellsForCart(List<Long> cartFoodIds) {
        if (cartFoodIds == null || cartFoodIds.isEmpty()) {
            // Return top rated drinks / sides
            List<FoodResponse> defaultUpsells = foodItemRepository.findTop6ByAvailableTrueOrderByAvgRatingDesc().stream()
                    .map(FoodResponse::new)
                    .limit(3)
                    .collect(Collectors.toList());
            return new UpsellResponse("Complete Your Meal", "Popular drinks & sides loved by our guests", defaultUpsells);
        }

        Set<Long> cartSet = new HashSet<>(cartFoodIds);
        Set<Long> recommendedIds = new LinkedHashSet<>();

        // 1. Check direct configured upsells on items in cart
        for (Long foodId : cartFoodIds) {
            foodItemRepository.findById(foodId).ifPresent(food -> {
                if (food.getUpsellFoodIds() != null && !food.getUpsellFoodIds().trim().isEmpty()) {
                    for (String idStr : food.getUpsellFoodIds().split(",")) {
                        try {
                            long upsellId = Long.parseLong(idStr.trim());
                            if (!cartSet.contains(upsellId)) {
                                recommendedIds.add(upsellId);
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }
            });
        }

        // 2. Rule-based pairings if no direct upsell configured:
        // If Pizza/Burger in cart -> recommend Drinks & Appetizers (e.g. Fries, Coke, Garlic Bread)
        // If Main Course in cart -> recommend Drinks & Desserts (e.g. Cold Drink, Brownie, Gulab Jamun)
        if (recommendedIds.isEmpty()) {
            List<FoodItem> allAvailable = foodItemRepository.findByAvailableTrue();
            for (FoodItem item : allAvailable) {
                if (!cartSet.contains(item.getId())) {
                    if ("Drinks".equalsIgnoreCase(item.getCategory()) || 
                        "Appetizers".equalsIgnoreCase(item.getCategory()) || 
                        "Dessert".equalsIgnoreCase(item.getCategory())) {
                        recommendedIds.add(item.getId());
                    }
                }
            }
        }

        List<FoodResponse> items = recommendedIds.stream()
                .map(foodItemRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .filter(f -> Boolean.TRUE.equals(f.getAvailable()))
                .limit(4)
                .map(FoodResponse::new)
                .collect(Collectors.toList());

        return new UpsellResponse("Complete Your Meal", "Recommended pairings for your selection", items);
    }

    @Override
    public List<FoodResponse> getSmartRecommendations(List<Long> pastFoodIds) {
        if (pastFoodIds == null || pastFoodIds.isEmpty()) {
            return foodItemRepository.findTop6ByAvailableTrueOrderByAvgRatingDesc().stream()
                    .map(FoodResponse::new)
                    .collect(Collectors.toList());
        }

        Set<String> categories = pastFoodIds.stream()
                .map(foodItemRepository::findById)
                .filter(Optional::isPresent)
                .map(opt -> opt.get().getCategory())
                .collect(Collectors.toSet());

        List<FoodItem> recommendations = new ArrayList<>();
        for (String cat : categories) {
            recommendations.addAll(foodItemRepository.findByCategoryIgnoreCaseAndAvailableTrue(cat));
        }

        return recommendations.stream()
                .distinct()
                .limit(6)
                .map(FoodResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoodResponse> getFrequentlyBoughtTogether(Long foodId) {
        FoodItem food = foodItemRepository.findById(foodId).orElse(null);
        if (food == null) return List.of();

        // Get complementary items from other categories (Drinks / Appetizers / Desserts)
        List<FoodItem> candidates = foodItemRepository.findByAvailableTrue().stream()
                .filter(f -> !f.getId().equals(foodId) && !f.getCategory().equalsIgnoreCase(food.getCategory()))
                .limit(3)
                .collect(Collectors.toList());

        return candidates.stream().map(FoodResponse::new).collect(Collectors.toList());
    }
}
