package com.restaurant.service;

import com.restaurant.dto.*;
import com.restaurant.entity.Coupon;
import com.restaurant.entity.CouponUsage;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.CouponRepository;
import com.restaurant.repository.CouponUsageRepository;
import com.restaurant.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final OrderRepository orderRepository;

    public CouponServiceImpl(CouponRepository couponRepository, CouponUsageRepository couponUsageRepository, OrderRepository orderRepository) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ValidateCouponResponse validateCoupon(ValidateCouponRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return new ValidateCouponResponse(false, "", 0.0, "Coupon code cannot be empty");
        }

        String code = request.getCode().trim().toUpperCase();
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(code);

        if (couponOpt.isEmpty()) {
            return new ValidateCouponResponse(false, code, 0.0, "Invalid coupon code");
        }

        Coupon coupon = couponOpt.get();

        if (Boolean.FALSE.equals(coupon.getActive())) {
            return new ValidateCouponResponse(false, code, 0.0, "This coupon is no longer active");
        }

        LocalDate today = LocalDate.now();
        if (coupon.getStartDate() != null && today.isBefore(coupon.getStartDate())) {
            return new ValidateCouponResponse(false, code, 0.0, "This coupon is not yet valid");
        }

        if (coupon.getExpiryDate() != null && today.isAfter(coupon.getExpiryDate())) {
            return new ValidateCouponResponse(false, code, 0.0, "This coupon has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return new ValidateCouponResponse(false, code, 0.0, "This coupon has reached its maximum usage limit");
        }

        double subtotal = request.getSubtotal() != null ? request.getSubtotal() : 0.0;
        if (coupon.getMinimumOrderAmount() != null && subtotal < coupon.getMinimumOrderAmount()) {
            return new ValidateCouponResponse(false, code, 0.0,
                    String.format("Minimum order of ₹%.0f required to use this coupon", coupon.getMinimumOrderAmount()));
        }

        // First order check
        if (Boolean.TRUE.equals(coupon.getFirstOrderOnly()) && request.getCustomerPhone() != null && !request.getCustomerPhone().trim().isEmpty()) {
            boolean hasPriorOrders = !orderRepository.findByPhoneOrderByCreatedAtDesc(request.getCustomerPhone().trim()).isEmpty();
            if (hasPriorOrders) {
                return new ValidateCouponResponse(false, code, 0.0, "This coupon is only valid for first-time customers");
            }
        }

        // Calculate discount
        double discount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = (subtotal * coupon.getDiscountValue()) / 100.0;
            if (coupon.getMaximumDiscount() != null && discount > coupon.getMaximumDiscount()) {
                discount = coupon.getMaximumDiscount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        // Discount cannot exceed subtotal
        discount = Math.min(discount, subtotal);
        discount = Math.round(discount * 100.0) / 100.0;

        return new ValidateCouponResponse(true, code, discount,
                String.format("Coupon '%s' applied! You saved ₹%.0f", code, discount));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(CouponResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getActiveCoupons() {
        return couponRepository.findByActiveTrue().stream()
                .map(CouponResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        return new CouponResponse(coupon);
    }

    @Override
    public CouponResponse createCoupon(CouponRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Coupon with code '" + code + "' already exists");
        }

        Coupon coupon = new Coupon(
                code,
                request.getDiscountType(),
                request.getDiscountValue(),
                request.getMinimumOrderAmount(),
                request.getMaximumDiscount(),
                request.getUsageLimit(),
                request.getFirstOrderOnly(),
                request.getStartDate(),
                request.getExpiryDate(),
                request.getActive()
        );

        Coupon saved = couponRepository.save(coupon);
        return new CouponResponse(saved);
    }

    @Override
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));

        String code = request.getCode().trim().toUpperCase();
        if (!code.equalsIgnoreCase(coupon.getCode()) && couponRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Coupon with code '" + code + "' already exists");
        }

        coupon.setCode(code);
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinimumOrderAmount(request.getMinimumOrderAmount());
        coupon.setMaximumDiscount(request.getMaximumDiscount());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setFirstOrderOnly(request.getFirstOrderOnly());
        coupon.setStartDate(request.getStartDate());
        coupon.setExpiryDate(request.getExpiryDate());
        if (request.getActive() != null) {
            coupon.setActive(request.getActive());
        }

        Coupon updated = couponRepository.save(coupon);
        return new CouponResponse(updated);
    }

    @Override
    public CouponResponse toggleActive(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));

        coupon.setActive(!Boolean.TRUE.equals(coupon.getActive()));
        Coupon updated = couponRepository.save(coupon);
        return new CouponResponse(updated);
    }

    @Override
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        couponRepository.delete(coupon);
    }

    @Override
    public void recordCouponUsage(String couponCode, Long orderId, String customerPhone, Double discountAmount) {
        if (couponCode == null || couponCode.trim().isEmpty()) return;

        couponRepository.findByCodeIgnoreCase(couponCode.trim()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);

            CouponUsage usage = new CouponUsage(coupon, orderId, customerPhone, discountAmount);
            couponUsageRepository.save(usage);
        });
    }
}
