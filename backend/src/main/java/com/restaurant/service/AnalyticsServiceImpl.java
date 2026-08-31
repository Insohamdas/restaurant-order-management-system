package com.restaurant.service;

import com.restaurant.dto.*;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderStatus;
import com.restaurant.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final CouponUsageRepository couponUsageRepository;

    public AnalyticsServiceImpl(OrderRepository orderRepository, FoodItemRepository foodItemRepository, CouponUsageRepository couponUsageRepository) {
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
        this.couponUsageRepository = couponUsageRepository;
    }

    private DateRange resolveDateRange(String period, String customStartDate, String customEndDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end = now;

        if ("TODAY".equalsIgnoreCase(period)) {
            start = LocalDate.now().atStartOfDay();
        } else if ("YESTERDAY".equalsIgnoreCase(period)) {
            start = LocalDate.now().minusDays(1).atStartOfDay();
            end = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);
        } else if ("LAST_7_DAYS".equalsIgnoreCase(period)) {
            start = now.minusDays(7);
        } else if ("LAST_30_DAYS".equalsIgnoreCase(period)) {
            start = now.minusDays(30);
        } else if ("THIS_MONTH".equalsIgnoreCase(period)) {
            start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        } else if ("CUSTOM".equalsIgnoreCase(period) && customStartDate != null && !customStartDate.trim().isEmpty()) {
            start = LocalDate.parse(customStartDate.trim()).atStartOfDay();
            if (customEndDate != null && !customEndDate.trim().isEmpty()) {
                end = LocalDate.parse(customEndDate.trim()).atTime(LocalTime.MAX);
            }
        } else {
            // Default: All time / Last 30 Days
            start = now.minusDays(30);
        }

        return new DateRange(start, end);
    }

    private static class DateRange {
        final LocalDateTime start;
        final LocalDateTime end;
        DateRange(LocalDateTime start, LocalDateTime end) {
            this.start = start;
            this.end = end;
        }
    }

    @Override
    public AnalyticsSummaryResponse getAnalyticsSummary() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDateTime.now();

        Double todayRevenue = orderRepository.getRevenueBetween(todayStart, todayEnd);
        if (todayRevenue == null) todayRevenue = 0.0;

        long todayOrders = orderRepository.countByCreatedAtBetween(todayStart, todayEnd);
        long pendingOrders = orderRepository.countByStatusIn(List.of(
                OrderStatus.PLACED,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.OUT_FOR_DELIVERY
        ));
        long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long totalOrders = orderRepository.count();

        double aov = (todayOrders > 0) ? (todayRevenue / todayOrders) : 0.0;
        double cancellationRate = (totalOrders > 0) ? ((double) cancelledOrders / totalOrders) * 100.0 : 0.0;

        Long totalCustomers = orderRepository.countDistinctCustomers();
        long totalFoodItems = foodItemRepository.count();
        long lowStockCount = foodItemRepository.findLowStockItems().size();

        List<ProductPerformanceResponse> topSelling = getTopProducts("LAST_30_DAYS").stream()
                .limit(5)
                .collect(Collectors.toList());

        List<CategoryPerformanceResponse> catSales = getCategoryPerformance("LAST_30_DAYS");

        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        Double monthRevenue = orderRepository.getRevenueBetween(monthStart, todayEnd);
        if (monthRevenue == null) monthRevenue = 0.0;

        Double totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;

        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse();
        summary.setTodayRevenue(Math.round(todayRevenue * 100.0) / 100.0);
        summary.setTodayOrders(todayOrders);
        summary.setMonthRevenue(Math.round(monthRevenue * 100.0) / 100.0);
        summary.setTotalRevenue(Math.round(totalRevenue * 100.0) / 100.0);
        summary.setAverageOrderValue(Math.round(aov * 10.0) / 10.0);
        summary.setPendingOrders(pendingOrders);
        summary.setCompletedOrders(completedOrders);
        summary.setCancelledOrders(cancelledOrders);
        summary.setCancellationRate(Math.round(cancellationRate * 10.0) / 10.0);
        summary.setTotalCustomers((totalCustomers != null) ? totalCustomers : 0L);
        summary.setTotalFoodItems(totalFoodItems);
        summary.setLowStockCount(lowStockCount);
        summary.setTopSellingDishes(topSelling);
        summary.setCategorySales(catSales);

        return summary;
    }

    @Override
    public RevenueAnalyticsResponse getRevenueAnalytics(String period, String customStartDate, String customEndDate) {
        DateRange range = resolveDateRange(period, customStartDate, customEndDate);

        Double revenue = orderRepository.getRevenueBetween(range.start, range.end);
        if (revenue == null) revenue = 0.0;

        long totalOrders = orderRepository.countByCreatedAtBetween(range.start, range.end);
        long completed = orderRepository.countByCreatedAtBetweenAndStatus(range.start, range.end, OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByCreatedAtBetweenAndStatus(range.start, range.end, OrderStatus.CANCELLED);
        double aov = (totalOrders > 0) ? (revenue / totalOrders) : 0.0;

        List<ProductPerformanceResponse> topProducts = getTopProducts(period);
        List<CategoryPerformanceResponse> categoryBreakdown = getCategoryPerformance(period);

        RevenueAnalyticsResponse resp = new RevenueAnalyticsResponse();
        resp.setPeriod(period != null ? period.toUpperCase() : "LAST_30_DAYS");
        resp.setTotalRevenue(Math.round(revenue * 100.0) / 100.0);
        resp.setTotalOrders(totalOrders);
        resp.setAverageOrderValue(Math.round(aov * 10.0) / 10.0);
        resp.setCompletedOrders(completed);
        resp.setCancelledOrders(cancelled);
        resp.setTopProducts(topProducts);
        resp.setCategoryBreakdown(categoryBreakdown);

        return resp;
    }

    @Override
    public List<ProductPerformanceResponse> getTopProducts(String period) {
        DateRange range = resolveDateRange(period, null, null);
        List<Object[]> raw = orderRepository.getTopSellingItemsBetween(range.start, range.end);

        if (raw == null || raw.isEmpty()) {
            raw = orderRepository.getTopSellingItemsAllTime();
        }

        List<ProductPerformanceResponse> results = new ArrayList<>();
        if (raw != null) {
            for (Object[] row : raw) {
                String name = (String) row[0];
                String cat = (String) row[1];
                Long qty = ((Number) row[2]).longValue();
                Double rev = ((Number) row[3]).doubleValue();
                results.add(new ProductPerformanceResponse(name, cat, qty, Math.round(rev * 100.0) / 100.0));
            }
        }
        return results;
    }

    @Override
    public List<CategoryPerformanceResponse> getCategoryPerformance(String period) {
        DateRange range = resolveDateRange(period, null, null);
        List<Object[]> raw = orderRepository.getCategoryPerformanceBetween(range.start, range.end);

        if (raw == null || raw.isEmpty()) {
            raw = orderRepository.getCategoryPerformanceAllTime();
        }

        double grandTotal = 0.0;
        List<CategoryPerformanceResponse> list = new ArrayList<>();

        if (raw != null) {
            for (Object[] row : raw) {
                String cat = (String) row[0];
                Double rev = ((Number) row[1]).doubleValue();
                Long qty = ((Number) row[2]).longValue();
                grandTotal += rev;
                list.add(new CategoryPerformanceResponse(cat, Math.round(rev * 100.0) / 100.0, qty, 0.0));
            }

            // Calculate percentage
            for (CategoryPerformanceResponse item : list) {
                if (grandTotal > 0) {
                    item.setPercentageOfTotal(Math.round((item.getTotalRevenue() / grandTotal) * 1000.0) / 10.0);
                }
            }
        }
        return list;
    }

    @Override
    public List<PeakHourResponse> getPeakHourAnalytics() {
        List<Order> orders = orderRepository.findAll();
        Map<Integer, Long> hourCounts = new TreeMap<>();
        Map<Integer, Double> hourSales = new HashMap<>();

        // Initialize 0-23
        for (int h = 0; h < 24; h++) {
            hourCounts.put(h, 0L);
            hourSales.put(h, 0.0);
        }

        for (Order o : orders) {
            if (o.getCreatedAt() != null && o.getStatus() != OrderStatus.CANCELLED) {
                int hour = o.getCreatedAt().getHour();
                hourCounts.put(hour, hourCounts.get(hour) + 1);
                hourSales.put(hour, hourSales.get(hour) + (o.getTotalAmount() != null ? o.getTotalAmount() : 0.0));
            }
        }

        List<PeakHourResponse> result = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            String label;
            if (h == 0) label = "12 AM";
            else if (h < 12) label = h + " AM";
            else if (h == 12) label = "12 PM";
            else label = (h - 12) + " PM";

            result.add(new PeakHourResponse(h, label, hourCounts.get(h), Math.round(hourSales.get(h) * 100.0) / 100.0));
        }

        return result;
    }

    @Override
    public CancellationAnalyticsResponse getCancellationAnalytics() {
        long totalOrders = orderRepository.count();
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.DELIVERED.CANCELLED);
        double cancellationRate = (totalOrders > 0) ? ((double) cancelledOrders / totalOrders) * 100.0 : 0.0;

        List<Order> allOrders = orderRepository.findAll();
        double lostRev = 0.0;
        Map<String, Long> reasons = new LinkedHashMap<>();

        for (Order o : allOrders) {
            if (o.getStatus() == OrderStatus.CANCELLED) {
                lostRev += (o.getTotalAmount() != null ? o.getTotalAmount() : 0.0);
                String reason = (o.getCancellationReason() != null && !o.getCancellationReason().trim().isEmpty())
                        ? o.getCancellationReason().trim()
                        : "Customer changed mind / other";
                reasons.put(reason, reasons.getOrDefault(reason, 0L) + 1);
            }
        }

        return new CancellationAnalyticsResponse(
                totalOrders,
                cancelledOrders,
                cancellationRate,
                Math.round(lostRev * 100.0) / 100.0,
                reasons
        );
    }

    @Override
    public CustomerRetentionResponse getCustomerRetentionAnalytics() {
        Long distinctCustomers = orderRepository.countDistinctCustomers();
        List<Object[]> repeatRaw = orderRepository.getReturningCustomers();

        long totalUnique = (distinctCustomers != null) ? distinctCustomers : 0L;
        long repeat = (repeatRaw != null) ? repeatRaw.size() : 0L;
        long single = Math.max(0, totalUnique - repeat);
        double repeatRate = (totalUnique > 0) ? ((double) repeat / totalUnique) * 100.0 : 0.0;

        Double totalRevenue = orderRepository.getTotalRevenue();
        double avgSpend = (totalUnique > 0 && totalRevenue != null) ? (totalRevenue / totalUnique) : 0.0;

        return new CustomerRetentionResponse(totalUnique, single, repeat, repeatRate, avgSpend);
    }

    @Override
    public List<CouponAnalyticsResponse> getCouponAnalytics() {
        List<Object[]> raw = couponUsageRepository.getCouponAnalytics();
        List<CouponAnalyticsResponse> list = new ArrayList<>();

        if (raw != null) {
            for (Object[] row : raw) {
                String code = (String) row[0];
                Long timesUsed = ((Number) row[1]).longValue();
                Double totalDiscount = ((Number) row[2]).doubleValue();
                list.add(new CouponAnalyticsResponse(code, "COUPON", 0.0, timesUsed, Math.round(totalDiscount * 100.0) / 100.0));
            }
        }
        return list;
    }
}
