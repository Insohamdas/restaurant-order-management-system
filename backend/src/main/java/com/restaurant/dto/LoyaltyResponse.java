package com.restaurant.dto;

import com.restaurant.entity.LoyaltyAccount;
import java.util.List;

public class LoyaltyResponse {

    private String phone;
    private String customerName;
    private Integer pointsBalance;
    private Integer totalPointsEarned;
    private Integer totalPointsRedeemed;
    private Double maxDiscountAllowed;
    private List<LoyaltyTransactionResponse> transactions;

    public LoyaltyResponse() {
    }

    public LoyaltyResponse(LoyaltyAccount account, List<LoyaltyTransactionResponse> transactions) {
        if (account != null) {
            this.phone = account.getPhone();
            this.customerName = account.getCustomerName();
            this.pointsBalance = account.getPointsBalance();
            this.totalPointsEarned = account.getTotalPointsEarned();
            this.totalPointsRedeemed = account.getTotalPointsRedeemed();
            // Calculate discount (approx: 100 pts = ₹20)
            this.maxDiscountAllowed = Math.floor(account.getPointsBalance() / 100.0) * 20.0;
        } else {
            this.pointsBalance = 0;
            this.totalPointsEarned = 0;
            this.totalPointsRedeemed = 0;
            this.maxDiscountAllowed = 0.0;
        }
        this.transactions = transactions;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getPointsBalance() {
        return pointsBalance;
    }

    public void setPointsBalance(Integer pointsBalance) {
        this.pointsBalance = pointsBalance;
    }

    public Integer getTotalPointsEarned() {
        return totalPointsEarned;
    }

    public void setTotalPointsEarned(Integer totalPointsEarned) {
        this.totalPointsEarned = totalPointsEarned;
    }

    public Integer getTotalPointsRedeemed() {
        return totalPointsRedeemed;
    }

    public void setTotalPointsRedeemed(Integer totalPointsRedeemed) {
        this.totalPointsRedeemed = totalPointsRedeemed;
    }

    public Double getMaxDiscountAllowed() {
        return maxDiscountAllowed;
    }

    public void setMaxDiscountAllowed(Double maxDiscountAllowed) {
        this.maxDiscountAllowed = maxDiscountAllowed;
    }

    public List<LoyaltyTransactionResponse> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<LoyaltyTransactionResponse> transactions) {
        this.transactions = transactions;
    }
}
