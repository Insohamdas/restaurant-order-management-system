package com.restaurant.controller;

import com.restaurant.dto.*;
import com.restaurant.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidateCouponResponse> validateCoupon(@Valid @RequestBody ValidateCouponRequest request) {
        ValidateCouponResponse response = couponService.validateCoupon(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CouponResponse>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponResponse created = couponService.createCoupon(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(@PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        CouponResponse updated = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/toggle", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<CouponResponse> toggleCouponActive(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
    }
}
