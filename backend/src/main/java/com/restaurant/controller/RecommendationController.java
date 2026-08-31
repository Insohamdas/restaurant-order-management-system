package com.restaurant.controller;

import com.restaurant.dto.FoodResponse;
import com.restaurant.dto.UpsellResponse;
import com.restaurant.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/upsell")
    public ResponseEntity<UpsellResponse> getUpsellsForCart(@RequestParam(required = false) String foodIds) {
        List<Long> idList = List.of();
        if (foodIds != null && !foodIds.trim().isEmpty()) {
            idList = Arrays.stream(foodIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(recommendationService.getUpsellsForCart(idList));
    }

    @GetMapping("/for-you")
    public ResponseEntity<List<FoodResponse>> getSmartRecommendations(@RequestParam(required = false) String pastFoodIds) {
        List<Long> idList = List.of();
        if (pastFoodIds != null && !pastFoodIds.trim().isEmpty()) {
            idList = Arrays.stream(pastFoodIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(recommendationService.getSmartRecommendations(idList));
    }

    @GetMapping("/pairings/{foodId}")
    public ResponseEntity<List<FoodResponse>> getPairings(@PathVariable Long foodId) {
        return ResponseEntity.ok(recommendationService.getFrequentlyBoughtTogether(foodId));
    }
}
