package com.restaurant.dto;

public class CustomerRetentionResponse {

    private Long totalUniqueCustomers;
    private Long singleOrderCustomers;
    private Long repeatCustomers;
    private Double repeatOrderRate;
    private Double averageCustomerSpend;

    public CustomerRetentionResponse() {
    }

    public CustomerRetentionResponse(Long totalUniqueCustomers, Long singleOrderCustomers, Long repeatCustomers, Double repeatOrderRate, Double averageCustomerSpend) {
        this.totalUniqueCustomers = totalUniqueCustomers;
        this.singleOrderCustomers = singleOrderCustomers;
        this.repeatCustomers = repeatCustomers;
        this.repeatOrderRate = (repeatOrderRate != null) ? Math.round(repeatOrderRate * 10.0) / 10.0 : 0.0;
        this.averageCustomerSpend = (averageCustomerSpend != null) ? Math.round(averageCustomerSpend * 10.0) / 10.0 : 0.0;
    }

    public Long getTotalUniqueCustomers() {
        return totalUniqueCustomers;
    }

    public void setTotalUniqueCustomers(Long totalUniqueCustomers) {
        this.totalUniqueCustomers = totalUniqueCustomers;
    }

    public Long getSingleOrderCustomers() {
        return singleOrderCustomers;
    }

    public void setSingleOrderCustomers(Long singleOrderCustomers) {
        this.singleOrderCustomers = singleOrderCustomers;
    }

    public Long getRepeatCustomers() {
        return repeatCustomers;
    }

    public void setRepeatCustomers(Long repeatCustomers) {
        this.repeatCustomers = repeatCustomers;
    }

    public Double getRepeatOrderRate() {
        return repeatOrderRate;
    }

    public void setRepeatOrderRate(Double repeatOrderRate) {
        this.repeatOrderRate = repeatOrderRate;
    }

    public Double getAverageCustomerSpend() {
        return averageCustomerSpend;
    }

    public void setAverageCustomerSpend(Double averageCustomerSpend) {
        this.averageCustomerSpend = averageCustomerSpend;
    }
}
