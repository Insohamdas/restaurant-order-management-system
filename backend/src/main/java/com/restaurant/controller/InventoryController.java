package com.restaurant.controller;

import com.restaurant.dto.FoodResponse;
import com.restaurant.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<FoodResponse>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @PutMapping("/stock/{foodId}")
    public ResponseEntity<Map<String, String>> updateStock(@PathVariable Long foodId, @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        if (quantity == null) quantity = 0;
        inventoryService.updateStockQuantity(foodId, quantity);
        return ResponseEntity.ok(Map.of("message", "Stock quantity updated successfully"));
    }
}
