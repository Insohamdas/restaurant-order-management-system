package com.restaurant.service;

import com.restaurant.dto.LoyaltyRedeemRequest;
import com.restaurant.dto.LoyaltyResponse;
import com.restaurant.dto.LoyaltyTransactionResponse;
import com.restaurant.entity.LoyaltyAccount;
import com.restaurant.entity.LoyaltyTransaction;
import com.restaurant.exception.BadRequestException;
import com.restaurant.repository.LoyaltyAccountRepository;
import com.restaurant.repository.LoyaltyTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LoyaltyServiceImpl implements LoyaltyService {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    public LoyaltyServiceImpl(LoyaltyAccountRepository loyaltyAccountRepository, LoyaltyTransactionRepository loyaltyTransactionRepository) {
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public LoyaltyResponse getLoyaltyAccount(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return new LoyaltyResponse(null, List.of());
        }

        LoyaltyAccount account = loyaltyAccountRepository.findByPhone(phone.trim())
                .orElseGet(() -> new LoyaltyAccount(phone.trim(), ""));

        List<LoyaltyTransactionResponse> txs = loyaltyTransactionRepository.findByPhoneOrderByCreatedAtDesc(phone.trim()).stream()
                .map(LoyaltyTransactionResponse::new)
                .collect(Collectors.toList());

        return new LoyaltyResponse(account, txs);
    }

    @Override
    public double calculateDiscountForPoints(int points) {
        // Tiers: 100 pts -> ₹20, 250 pts -> ₹60, 500 pts -> ₹150
        if (points >= 500) {
            return 150.0 + ((points - 500) / 100) * 20.0;
        } else if (points >= 250) {
            return 60.0 + ((points - 250) / 100) * 20.0;
        } else if (points >= 100) {
            return (points / 100) * 20.0;
        }
        return 0.0;
    }

    @Override
    public int calculatePointsForOrder(double orderSubtotal) {
        // Business Rule: ₹100 spent = 10 points
        return (int) Math.floor(orderSubtotal / 10.0);
    }

    @Override
    public void awardPointsForDeliveredOrder(Long orderId, String phone, double orderSubtotal) {
        if (phone == null || phone.trim().isEmpty()) return;

        // Check if already awarded
        List<LoyaltyTransaction> existing = loyaltyTransactionRepository.findByOrderId(orderId);
        boolean alreadyAwarded = existing.stream().anyMatch(t -> "EARNED".equalsIgnoreCase(t.getTransactionType()));
        if (alreadyAwarded) return;

        int pointsToAward = calculatePointsForOrder(orderSubtotal);
        if (pointsToAward <= 0) return;

        LoyaltyAccount account = loyaltyAccountRepository.findByPhone(phone.trim())
                .orElseGet(() -> loyaltyAccountRepository.save(new LoyaltyAccount(phone.trim(), "")));

        account.setPointsBalance(account.getPointsBalance() + pointsToAward);
        account.setTotalPointsEarned(account.getTotalPointsEarned() + pointsToAward);
        loyaltyAccountRepository.save(account);

        LoyaltyTransaction tx = new LoyaltyTransaction(
                phone.trim(),
                orderId,
                pointsToAward,
                "EARNED",
                String.format("Earned %d points for Order #%d (₹%.0f)", pointsToAward, orderId, orderSubtotal)
        );
        loyaltyTransactionRepository.save(tx);
    }

    @Override
    public void reversePointsForCancelledOrder(Long orderId, String phone) {
        if (phone == null || phone.trim().isEmpty()) return;

        List<LoyaltyTransaction> txs = loyaltyTransactionRepository.findByOrderId(orderId);
        for (LoyaltyTransaction tx : txs) {
            if ("REDEEMED".equalsIgnoreCase(tx.getTransactionType())) {
                // Restore redeemed points
                LoyaltyAccount account = loyaltyAccountRepository.findByPhone(phone.trim()).orElse(null);
                if (account != null) {
                    account.setPointsBalance(account.getPointsBalance() + tx.getPoints());
                    account.setTotalPointsRedeemed(Math.max(0, account.getTotalPointsRedeemed() - tx.getPoints()));
                    loyaltyAccountRepository.save(account);

                    LoyaltyTransaction reverseTx = new LoyaltyTransaction(
                            phone.trim(),
                            orderId,
                            tx.getPoints(),
                            "REVERSED",
                            String.format("Restored %d points due to cancellation of Order #%d", tx.getPoints(), orderId)
                    );
                    loyaltyTransactionRepository.save(reverseTx);
                }
            }
        }
    }

    @Override
    public double redeemPoints(LoyaltyRedeemRequest request, Long orderId) {
        if (request.getPointsToRedeem() == null || request.getPointsToRedeem() < 100) {
            throw new BadRequestException("Minimum 100 points required to redeem rewards");
        }

        LoyaltyAccount account = loyaltyAccountRepository.findByPhone(request.getPhone().trim())
                .orElseThrow(() -> new BadRequestException("No loyalty account found for phone: " + request.getPhone()));

        if (account.getPointsBalance() < request.getPointsToRedeem()) {
            throw new BadRequestException(String.format("Insufficient points. You have %d points, but tried to redeem %d",
                    account.getPointsBalance(), request.getPointsToRedeem()));
        }

        double discount = calculateDiscountForPoints(request.getPointsToRedeem());

        account.setPointsBalance(account.getPointsBalance() - request.getPointsToRedeem());
        account.setTotalPointsRedeemed(account.getTotalPointsRedeemed() + request.getPointsToRedeem());
        loyaltyAccountRepository.save(account);

        LoyaltyTransaction tx = new LoyaltyTransaction(
                request.getPhone().trim(),
                orderId,
                request.getPointsToRedeem(),
                "REDEEMED",
                String.format("Redeemed %d points for ₹%.0f discount on Order #%d", request.getPointsToRedeem(), discount, orderId)
        );
        loyaltyTransactionRepository.save(tx);

        return discount;
    }
}
