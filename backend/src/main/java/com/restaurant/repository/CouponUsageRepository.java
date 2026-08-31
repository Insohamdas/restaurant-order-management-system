package com.restaurant.repository;

import com.restaurant.entity.Coupon;
import com.restaurant.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    long countByCoupon(Coupon coupon);
    long countByCouponAndCustomerPhone(Coupon coupon, String customerPhone);
    List<CouponUsage> findByCoupon(Coupon coupon);

    @Query("SELECT u.coupon.code as code, COUNT(u) as usedCount, SUM(u.discountApplied) as totalDiscount " +
           "FROM CouponUsage u GROUP BY u.coupon.code")
    List<Object[]> getCouponAnalytics();
}
