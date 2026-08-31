package com.restaurant.service;

import com.restaurant.dto.FoodResponse;
import com.restaurant.entity.Favorite;
import com.restaurant.entity.FoodItem;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FavoriteRepository;
import com.restaurant.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final FoodItemRepository foodItemRepository;

    public FavoriteServiceImpl(FavoriteRepository favoriteRepository, FoodItemRepository foodItemRepository) {
        this.favoriteRepository = favoriteRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoodResponse> getFavorites(String customerPhone) {
        if (customerPhone == null || customerPhone.trim().isEmpty()) {
            return List.of();
        }

        return favoriteRepository.findByCustomerPhoneOrderByCreatedAtDesc(customerPhone.trim()).stream()
                .map(Favorite::getFoodItem)
                .filter(item -> item != null)
                .map(FoodResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public boolean toggleFavorite(String customerPhone, Long foodId) {
        if (customerPhone == null || customerPhone.trim().isEmpty() || foodId == null) {
            return false;
        }

        String phone = customerPhone.trim();
        Optional<Favorite> existing = favoriteRepository.findByCustomerPhoneAndFoodItemId(phone, foodId);

        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // removed
        } else {
            FoodItem foodItem = foodItemRepository.findById(foodId)
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + foodId));

            Favorite favorite = new Favorite(phone, foodItem);
            favoriteRepository.save(favorite);
            return true; // added
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(String customerPhone, Long foodId) {
        if (customerPhone == null || customerPhone.trim().isEmpty() || foodId == null) {
            return false;
        }
        return favoriteRepository.existsByCustomerPhoneAndFoodItemId(customerPhone.trim(), foodId);
    }
}
