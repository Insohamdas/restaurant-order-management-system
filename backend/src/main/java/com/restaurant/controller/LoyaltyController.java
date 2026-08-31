package com.restaurant.controller;

import com.restaurant.dto.LoyaltyRedeemRequest;
import com.restaurant.dto.LoyaltyResponse;
import com.restaurant.service.LoyaltyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/{phone}")
    public ResponseEntity<LoyaltyResponse> getLoyaltyAccount(@PathVariable String phone) {
        return ResponseEntity.ok(loyaltyService.getLoyaltyAccount(phone));
    }

    @PostMapping("/calculate-discount")
    public ResponseEntity<Map<String, Object>> calculateDiscount(@Valid @RequestBody LoyaltyRedeemRequest request) {
        double discount = loyaltyService.calculateDiscountForPoints(request.getPointsToRedeem());
        return ResponseEntity.ok(Map.of(
                "points", request.getPointsToRedeem(),
                "discountAmount", discount
        ));
    }
}
