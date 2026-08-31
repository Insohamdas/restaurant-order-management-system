package com.restaurant.service;

import com.restaurant.dto.FoodRequest;
import com.restaurant.dto.FoodResponse;
import com.restaurant.entity.FoodItem;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FoodServiceImpl implements FoodService {

    private final FoodItemRepository foodItemRepository;

    public FoodServiceImpl(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoodResponse> getAllFoods(String category, Boolean availableOnly) {
        List<FoodItem> items;

        if (category != null && !category.trim().isEmpty()) {
            if (Boolean.TRUE.equals(availableOnly)) {
                items = foodItemRepository.findByCategoryIgnoreCaseAndAvailableTrue(category.trim());
            } else {
                items = foodItemRepository.findByCategoryIgnoreCase(category.trim());
            }
        } else {
            if (Boolean.TRUE.equals(availableOnly)) {
                items = foodItemRepository.findByAvailableTrue();
            } else {
                items = foodItemRepository.findAll();
            }
        }

        return items.stream()
                .map(FoodResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FoodResponse getFoodById(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
        return new FoodResponse(item);
    }

    @Override
    public FoodResponse createFood(FoodRequest request) {
        FoodItem item = new FoodItem(
                request.getName().trim(),
                request.getDescription() != null ? request.getDescription().trim() : "",
                request.getPrice(),
                request.getCategory().trim(),
                request.getImageUrl() != null ? request.getImageUrl().trim() : "",
                request.getAvailable() != null ? request.getAvailable() : true
        );
        if (request.getStockQuantity() != null) item.setStockQuantity(request.getStockQuantity());
        if (request.getLowStockThreshold() != null) item.setLowStockThreshold(request.getLowStockThreshold());
        if (request.getTrackInventory() != null) item.setTrackInventory(request.getTrackInventory());
        if (request.getUpsellFoodIds() != null) item.setUpsellFoodIds(request.getUpsellFoodIds().trim());

        FoodItem saved = foodItemRepository.save(item);
        return new FoodResponse(saved);
    }

    @Override
    public FoodResponse updateFood(Long id, FoodRequest request) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));

        item.setName(request.getName().trim());
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory().trim());
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        if (request.getStockQuantity() != null) {
            item.setStockQuantity(request.getStockQuantity());
        }
        if (request.getLowStockThreshold() != null) {
            item.setLowStockThreshold(request.getLowStockThreshold());
        }
        if (request.getTrackInventory() != null) {
            item.setTrackInventory(request.getTrackInventory());
        }
        if (request.getUpsellFoodIds() != null) {
            item.setUpsellFoodIds(request.getUpsellFoodIds().trim());
        }

        FoodItem updated = foodItemRepository.save(item);
        return new FoodResponse(updated);
    }

    @Override
    public void deleteFood(Long id) {
        if (!foodItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Food item not found with ID: " + id);
        }
        foodItemRepository.deleteById(id);
    }
}

