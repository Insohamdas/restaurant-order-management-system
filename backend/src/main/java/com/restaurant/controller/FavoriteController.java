package com.restaurant.controller;

import com.restaurant.dto.FoodResponse;
import com.restaurant.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping("/{phone}")
    public ResponseEntity<List<FoodResponse>> getFavorites(@PathVariable String phone) {
        return ResponseEntity.ok(favoriteService.getFavorites(phone));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@RequestBody Map<String, Object> body) {
        String phone = (String) body.get("phone");
        Long foodId = Long.valueOf(body.get("foodId").toString());
        boolean isFavorite = favoriteService.toggleFavorite(phone, foodId);
        return ResponseEntity.ok(Map.of(
                "foodId", foodId,
                "isFavorite", isFavorite,
                "message", isFavorite ? "Item added to favorites" : "Item removed from favorites"
        ));
    }

    @GetMapping("/{phone}/check/{foodId}")
    public ResponseEntity<Map<String, Boolean>> isFavorite(@PathVariable String phone, @PathVariable Long foodId) {
        boolean fav = favoriteService.isFavorite(phone, foodId);
        return ResponseEntity.ok(Map.of("isFavorite", fav));
    }
}
