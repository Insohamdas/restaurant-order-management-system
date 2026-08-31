package com.restaurant.service;

import com.restaurant.dto.FoodResponse;
import java.util.List;

public interface FavoriteService {
    List<FoodResponse> getFavorites(String customerPhone);
    boolean toggleFavorite(String customerPhone, Long foodId);
    boolean isFavorite(String customerPhone, Long foodId);
}
