package com.restaurant.service;

import com.restaurant.dto.LoyaltyRedeemRequest;
import com.restaurant.dto.LoyaltyResponse;

public interface LoyaltyService {
    LoyaltyResponse getLoyaltyAccount(String phone);
    double calculateDiscountForPoints(int points);
    int calculatePointsForOrder(double orderSubtotal);
    void awardPointsForDeliveredOrder(Long orderId, String phone, double orderSubtotal);
    void reversePointsForCancelledOrder(Long orderId, String phone);
    double redeemPoints(LoyaltyRedeemRequest request, Long orderId);
}
