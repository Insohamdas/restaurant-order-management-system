package com.restaurant.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String phone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(name = "subtotal")
    private Double subtotal = 0.0;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "loyalty_discount")
    private Double loyaltyDiscount = 0.0;

    @Column(name = "tax_amount")
    private Double taxAmount = 0.0;

    @Column(name = "delivery_fee")
    private Double deliveryFee = 40.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PLACED;

    @Column(name = "estimated_prep_time_minutes")
    private Integer estimatedPrepTimeMinutes = 25;

    @Column(name = "order_source")
    private String orderSource = "DIRECT"; // "DINE_IN", "ZOMATO", "SWIGGY", "MAGICPIN", "DIRECT", "TAKEAWAY"

    @Column(name = "table_number")
    private String tableNumber;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
    }

    public Order(String customerName, String phone, String address, Double totalAmount, OrderStatus status) {
        this.customerName = customerName;
        this.phone = phone;
        this.address = address;
        this.totalAmount = totalAmount;
        this.status = (status != null) ? status : OrderStatus.PLACED;
        this.subtotal = (totalAmount != null) ? Math.max(0.0, totalAmount - 40.0) : 0.0;
        this.deliveryFee = 40.0;
        this.discountAmount = 0.0;
        this.loyaltyDiscount = 0.0;
        this.taxAmount = 0.0;
        this.estimatedPrepTimeMinutes = 25;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = OrderStatus.PLACED;
        }
        if (this.discountAmount == null) {
            this.discountAmount = 0.0;
        }
        if (this.loyaltyDiscount == null) {
            this.loyaltyDiscount = 0.0;
        }
        if (this.taxAmount == null) {
            this.taxAmount = 0.0;
        }
        if (this.deliveryFee == null) {
            this.deliveryFee = 40.0;
        }
        if (this.estimatedPrepTimeMinutes == null) {
            this.estimatedPrepTimeMinutes = 25;
        }
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public Double getLoyaltyDiscount() {
        return loyaltyDiscount;
    }

    public void setLoyaltyDiscount(Double loyaltyDiscount) {
        this.loyaltyDiscount = loyaltyDiscount;
    }

    public Double getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(Double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public Double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Integer getEstimatedPrepTimeMinutes() {
        return estimatedPrepTimeMinutes;
    }

    public void setEstimatedPrepTimeMinutes(Integer estimatedPrepTimeMinutes) {
        this.estimatedPrepTimeMinutes = estimatedPrepTimeMinutes;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public String getOrderSource() {
        return (orderSource != null) ? orderSource : "DIRECT";
    }

    public void setOrderSource(String orderSource) {
        this.orderSource = orderSource;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
}

