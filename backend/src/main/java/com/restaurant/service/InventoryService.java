package com.restaurant.service;

import com.restaurant.dto.FoodResponse;
import java.util.List;

public interface InventoryService {
    void deductStockForOrder(Long foodId, int quantity);
    void restoreStockForCancelledOrder(Long foodId, int quantity);
    void updateStockQuantity(Long foodId, int quantity);
    List<FoodResponse> getLowStockItems();
}
