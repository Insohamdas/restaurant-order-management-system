package com.restaurant.controller;

import com.restaurant.dto.*;
import com.restaurant.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary());
    }

    @GetMapping("/revenue")
    public ResponseEntity<RevenueAnalyticsResponse> getRevenue(
            @RequestParam(defaultValue = "LAST_30_DAYS") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(analyticsService.getRevenueAnalytics(period, startDate, endDate));
    }

    @GetMapping({"/top-dishes", "/products"})
    public ResponseEntity<List<ProductPerformanceResponse>> getTopDishes(
            @RequestParam(defaultValue = "LAST_30_DAYS") String period) {
        return ResponseEntity.ok(analyticsService.getTopProducts(period));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryPerformanceResponse>> getCategoryPerformance(
            @RequestParam(defaultValue = "LAST_30_DAYS") String period) {
        return ResponseEntity.ok(analyticsService.getCategoryPerformance(period));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<List<PeakHourResponse>> getPeakHours() {
        return ResponseEntity.ok(analyticsService.getPeakHourAnalytics());
    }

    @GetMapping("/cancellations")
    public ResponseEntity<CancellationAnalyticsResponse> getCancellations() {
        return ResponseEntity.ok(analyticsService.getCancellationAnalytics());
    }

    @GetMapping("/retention")
    public ResponseEntity<CustomerRetentionResponse> getCustomerRetention() {
        return ResponseEntity.ok(analyticsService.getCustomerRetentionAnalytics());
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<CouponAnalyticsResponse>> getCouponAnalytics() {
        return ResponseEntity.ok(analyticsService.getCouponAnalytics());
    }
}
