package com.restaurant.service;

import com.restaurant.dto.*;
import java.util.List;

public interface AnalyticsService {
    AnalyticsSummaryResponse getAnalyticsSummary();
    RevenueAnalyticsResponse getRevenueAnalytics(String period, String customStartDate, String customEndDate);
    List<ProductPerformanceResponse> getTopProducts(String period);
    List<CategoryPerformanceResponse> getCategoryPerformance(String period);
    List<PeakHourResponse> getPeakHourAnalytics();
    CancellationAnalyticsResponse getCancellationAnalytics();
    CustomerRetentionResponse getCustomerRetentionAnalytics();
    List<CouponAnalyticsResponse> getCouponAnalytics();
}
