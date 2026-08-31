package com.restaurant.dto;

import java.util.Map;

public class CancellationAnalyticsResponse {

    private Long totalOrders;
    private Long cancelledOrders;
    private Double cancellationRate;
    private Double totalLostRevenue;
    private Map<String, Long> reasonsBreakdown;

    public CancellationAnalyticsResponse() {
    }

    public CancellationAnalyticsResponse(Long totalOrders, Long cancelledOrders, Double cancellationRate, Double totalLostRevenue, Map<String, Long> reasonsBreakdown) {
        this.totalOrders = totalOrders;
        this.cancelledOrders = cancelledOrders;
        this.cancellationRate = (cancellationRate != null) ? Math.round(cancellationRate * 10.0) / 10.0 : 0.0;
        this.totalLostRevenue = totalLostRevenue;
        this.reasonsBreakdown = reasonsBreakdown;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(Long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }

    public Double getCancellationRate() {
        return cancellationRate;
    }

    public void setCancellationRate(Double cancellationRate) {
        this.cancellationRate = cancellationRate;
    }

    public Double getTotalLostRevenue() {
        return totalLostRevenue;
    }

    public void setTotalLostRevenue(Double totalLostRevenue) {
        this.totalLostRevenue = totalLostRevenue;
    }

    public Map<String, Long> getReasonsBreakdown() {
        return reasonsBreakdown;
    }

    public void setReasonsBreakdown(Map<String, Long> reasonsBreakdown) {
        this.reasonsBreakdown = reasonsBreakdown;
    }
}