package com.restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LoyaltyRedeemRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Points to redeem is required")
    @Min(value = 100, message = "Minimum 100 points required to redeem")
    private Integer pointsToRedeem;

    public LoyaltyRedeemRequest() {
    }

    public LoyaltyRedeemRequest(String phone, Integer pointsToRedeem) {
        this.phone = phone;
        this.pointsToRedeem = pointsToRedeem;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getPointsToRedeem() {
        return pointsToRedeem;
    }

    public void setPointsToRedeem(Integer pointsToRedeem) {
        this.pointsToRedeem = pointsToRedeem;
    }
}
