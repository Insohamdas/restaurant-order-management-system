package com.restaurant.service;

import com.restaurant.dto.*;
import java.util.List;

public interface CouponService {
    ValidateCouponResponse validateCoupon(ValidateCouponRequest request);
    List<CouponResponse> getAllCoupons();
    List<CouponResponse> getActiveCoupons();
    CouponResponse getCouponById(Long id);
    CouponResponse createCoupon(CouponRequest request);
    CouponResponse updateCoupon(Long id, CouponRequest request);
    CouponResponse toggleActive(Long id);
    void deleteCoupon(Long id);
    void recordCouponUsage(String couponCode, Long orderId, String customerPhone, Double discountAmount);
}
