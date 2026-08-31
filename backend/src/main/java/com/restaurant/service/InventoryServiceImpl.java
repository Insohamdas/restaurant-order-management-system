package com.restaurant.service;

import com.restaurant.dto.FoodResponse;
import com.restaurant.entity.FoodItem;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final FoodItemRepository foodItemRepository;

    public InventoryServiceImpl(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @Override
    public void deductStockForOrder(Long foodId, int quantity) {
        FoodItem foodItem = foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + foodId));

        if (Boolean.TRUE.equals(foodItem.getTrackInventory())) {
            int currentStock = foodItem.getStockQuantity() != null ? foodItem.getStockQuantity() : 0;
            if (currentStock < quantity) {
                throw new BadRequestException(String.format("Insufficient stock for '%s'. Only %d available.", foodItem.getName(), currentStock));
            }

            int newStock = currentStock - quantity;
            foodItem.setStockQuantity(newStock);

            if (newStock <= 0) {
                foodItem.setAvailable(false);
            }

            foodItemRepository.save(foodItem);
        }
    }

    @Override
    public void restoreStockForCancelledOrder(Long foodId, int quantity) {
        foodItemRepository.findById(foodId).ifPresent(foodItem -> {
            if (Boolean.TRUE.equals(foodItem.getTrackInventory())) {
                int currentStock = foodItem.getStockQuantity() != null ? foodItem.getStockQuantity() : 0;
                foodItem.setStockQuantity(currentStock + quantity);
                if (currentStock + quantity > 0) {
                    foodItem.setAvailable(true);
                }
                foodItemRepository.save(foodItem);
            }
        });
    }

    @Override
    public void updateStockQuantity(Long foodId, int quantity) {
        FoodItem foodItem = foodItemRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + foodId));

        foodItem.setStockQuantity(Math.max(0, quantity));
        if (quantity > 0) {
            foodItem.setAvailable(true);
        } else {
            foodItem.setAvailable(false);
        }
        foodItemRepository.save(foodItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FoodResponse> getLowStockItems() {
        return foodItemRepository.findLowStockItems().stream()
                .map(FoodResponse::new)
                .collect(Collectors.toList());
    }
}
