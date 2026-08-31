package com.restaurant.service;

import com.restaurant.dto.*;
import com.restaurant.entity.*;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.BusinessSettingRepository;
import com.restaurant.repository.FoodItemRepository;
import com.restaurant.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final BusinessSettingRepository businessSettingRepository;
    private final CouponService couponService;
    private final LoyaltyService loyaltyService;
    private final InventoryService inventoryService;

    public OrderServiceImpl(OrderRepository orderRepository,
                            FoodItemRepository foodItemRepository,
                            BusinessSettingRepository businessSettingRepository,
                            CouponService couponService,
                            LoyaltyService loyaltyService,
                            InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
        this.businessSettingRepository = businessSettingRepository;
        this.couponService = couponService;
        this.loyaltyService = loyaltyService;
        this.inventoryService = inventoryService;
    }

    private BusinessSetting getSettings() {
        return businessSettingRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> businessSettingRepository.save(new BusinessSetting()));
    }

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }

        BusinessSetting settings = getSettings();
        if (Boolean.FALSE.equals(settings.getRestaurantOpen())) {
            throw new BadRequestException("Harvest Kitchen is currently closed and not accepting online orders.");
        }

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setCustomerName(request.getCustomerName().trim());
        order.setPhone(request.getPhone().trim());
        order.setCustomerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null);
        order.setAddress(request.getAddress().trim());
        order.setOrderSource(request.getOrderSource() != null ? request.getOrderSource().trim().toUpperCase() : "DIRECT");
        order.setTableNumber(request.getTableNumber() != null ? request.getTableNumber().trim() : null);
        order.setSpecialInstructions(request.getSpecialInstructions() != null ? request.getSpecialInstructions().trim() : null);
        order.setStatus(OrderStatus.PLACED);

        double subtotal = 0.0;

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than 0 for all items");
            }

            FoodItem foodItem = foodItemRepository.findById(itemReq.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + itemReq.getFoodId()));

            if (Boolean.FALSE.equals(foodItem.getAvailable())) {
                throw new BadRequestException("Food item '" + foodItem.getName() + "' is currently unavailable");
            }

            // Check and deduct inventory stock
            inventoryService.deductStockForOrder(foodItem.getId(), itemReq.getQuantity());

            double itemPrice = foodItem.getPrice();
            subtotal += itemPrice * itemReq.getQuantity();

            OrderItem orderItem = new OrderItem(order, foodItem, itemReq.getQuantity(), itemPrice);
            order.addItem(orderItem);
        }

        // Validate minimum order amount
        if (settings.getMinimumOrderAmount() != null && subtotal < settings.getMinimumOrderAmount()) {
            throw new BadRequestException(String.format("Minimum order amount is ₹%.0f (Current subtotal: ₹%.0f)",
                    settings.getMinimumOrderAmount(), subtotal));
        }

        order.setSubtotal(subtotal);

        // 1. Coupon calculation
        double couponDiscount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            ValidateCouponResponse val = couponService.validateCoupon(
                    new ValidateCouponRequest(request.getCouponCode(), subtotal, request.getPhone())
            );
            if (val.isValid()) {
                couponDiscount = val.getDiscountAmount();
                order.setCouponCode(val.getCode());
                order.setDiscountAmount(couponDiscount);
            }
        }

        // 2. Loyalty discount calculation
        double loyaltyDiscount = 0.0;
        if (request.getLoyaltyPointsToRedeem() != null && request.getLoyaltyPointsToRedeem() >= 100) {
            loyaltyDiscount = loyaltyService.calculateDiscountForPoints(request.getLoyaltyPointsToRedeem());
            order.setLoyaltyDiscount(loyaltyDiscount);
        }

        // 3. Delivery fee calculation (Free Delivery rule)
        double deliveryFee = settings.getDeliveryFee() != null ? settings.getDeliveryFee() : 40.0;
        if (settings.getFreeDeliveryThreshold() != null && subtotal >= settings.getFreeDeliveryThreshold()) {
            deliveryFee = 0.0;
        }
        order.setDeliveryFee(deliveryFee);

        // 4. Tax calculation (e.g. 5% GST)
        double discountedSubtotal = Math.max(0.0, subtotal - couponDiscount - loyaltyDiscount);
        double taxRate = (settings.getTaxRatePercent() != null) ? settings.getTaxRatePercent() : 5.0;
        double taxAmount = (discountedSubtotal * taxRate) / 100.0;
        taxAmount = Math.round(taxAmount * 100.0) / 100.0;
        order.setTaxAmount(taxAmount);

        // 5. Final Total calculation
        double finalTotal = discountedSubtotal + taxAmount + deliveryFee;
        finalTotal = Math.round(finalTotal * 100.0) / 100.0;
        order.setTotalAmount(finalTotal);

        // 6. Estimated Prep Time calculation
        int activeKitchenOrders = (int) orderRepository.countByStatusIn(List.of(
                OrderStatus.PLACED,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING
        ));
        int basePrep = settings.getAvgPrepTimeMinutes() != null ? settings.getAvgPrepTimeMinutes() : 25;
        int estimatedPrepTime = basePrep + (activeKitchenOrders * 3);
        order.setEstimatedPrepTimeMinutes(estimatedPrepTime);

        Order savedOrder = orderRepository.save(order);

        // Record coupon redemption usage
        if (couponDiscount > 0 && order.getCouponCode() != null) {
            couponService.recordCouponUsage(order.getCouponCode(), savedOrder.getId(), savedOrder.getPhone(), couponDiscount);
        }

        // Deduct loyalty points if redeemed
        if (request.getLoyaltyPointsToRedeem() != null && request.getLoyaltyPointsToRedeem() >= 100) {
            try {
                loyaltyService.redeemPoints(
                        new LoyaltyRedeemRequest(savedOrder.getPhone(), request.getLoyaltyPointsToRedeem()),
                        savedOrder.getId()
                );
            } catch (Exception e) {
                // Ignore if already deducted
            }
        }

        return new OrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        return new OrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByPhone(String phone) {
        return orderRepository.findByPhoneOrderByCreatedAtDesc(phone.trim()).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("Invalid order status: " + request.getStatus() +
                    ". Allowed statuses are: " + Arrays.toString(OrderStatus.values()));
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        // Lifecycle Hooks:
        if (newStatus == OrderStatus.DELIVERED && oldStatus != OrderStatus.DELIVERED) {
            // Award loyalty points to customer
            double subtotal = order.getSubtotal() != null ? order.getSubtotal() : order.getTotalAmount();
            loyaltyService.awardPointsForDeliveredOrder(order.getId(), order.getPhone(), subtotal);
        } else if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            // Restore inventory & loyalty points
            for (OrderItem item : order.getItems()) {
                inventoryService.restoreStockForCancelledOrder(item.getFoodItem().getId(), item.getQuantity());
            }
            loyaltyService.reversePointsForCancelledOrder(order.getId(), order.getPhone());
        }

        return new OrderResponse(updated);
    }

    @Override
    public OrderResponse cancelOrder(Long id, CancelOrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException(String.format("Order #%d cannot be cancelled because it is already %s.",
                    id, order.getStatus()));
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.getReason() != null ? request.getReason().trim() : "Customer cancelled");

        // Restore stock
        for (OrderItem item : order.getItems()) {
            inventoryService.restoreStockForCancelledOrder(item.getFoodItem().getId(), item.getQuantity());
        }

        // Restore loyalty points
        loyaltyService.reversePointsForCancelledOrder(order.getId(), order.getPhone());

        Order saved = orderRepository.save(order);
        return new OrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<KitchenOrderResponse> getKitchenOrders() {
        List<Order> activeOrders = orderRepository.findByStatusInOrderByCreatedAtAsc(List.of(
                OrderStatus.PLACED,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
                OrderStatus.READY
        ));

        return activeOrders.stream()
                .map(KitchenOrderResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public int getEstimatedWaitTime() {
        int activeKitchenOrders = (int) orderRepository.countByStatusIn(List.of(
                OrderStatus.PLACED,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING
        ));
        BusinessSetting settings = getSettings();
        int basePrep = settings.getAvgPrepTimeMinutes() != null ? settings.getAvgPrepTimeMinutes() : 25;
        return basePrep + (activeKitchenOrders * 3);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatusIn(List.of(
                OrderStatus.PLACED,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.OUT_FOR_DELIVERY
        ));
        long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long totalFoodItems = foodItemRepository.count();

        return new DashboardStatsResponse(totalOrders, pendingOrders, completedOrders, totalFoodItems);
    }
}

