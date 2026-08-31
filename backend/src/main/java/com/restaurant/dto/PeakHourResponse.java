package com.restaurant.dto;

public class PeakHourResponse {

    private Integer hour;
    private String hourLabel; // e.g. "12 PM"
    private Long orderCount;
    private Double totalSales;

    public PeakHourResponse() {
    }

    public PeakHourResponse(Integer hour, String hourLabel, Long orderCount, Double totalSales) {
        this.hour = hour;
        this.hourLabel = hourLabel;
        this.orderCount = (orderCount != null) ? orderCount : 0L;
        this.totalSales = (totalSales != null) ? totalSales : 0.0;
    }

    public Integer getHour() {
        return hour;
    }

    public void setHour(Integer hour) {
        this.hour = hour;
    }

    public String getHourLabel() {
        return hourLabel;
    }

    public void setHourLabel(String hourLabel) {
        this.hourLabel = hourLabel;
    }

    public Long getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(Long orderCount) {
        this.orderCount = orderCount;
    }

    public Double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(Double totalSales) {
        this.totalSales = totalSales;
    }
}
