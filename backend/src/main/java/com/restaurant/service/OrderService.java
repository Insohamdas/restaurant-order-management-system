package com.restaurant.service;

import com.restaurant.dto.*;
import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getOrdersByPhone(String phone);

    List<OrderResponse> getOrdersByUserId(Long userId);

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    OrderResponse cancelOrder(Long id, CancelOrderRequest request);

    List<KitchenOrderResponse> getKitchenOrders();

    int getEstimatedWaitTime();

    DashboardStatsResponse getDashboardStats();
}

