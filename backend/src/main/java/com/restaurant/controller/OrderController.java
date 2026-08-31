package com.restaurant.controller;

import com.restaurant.dto.*;
import com.restaurant.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse created = orderService.createOrder(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<List<OrderResponse>> getOrdersByPhone(@PathVariable String phone) {
        return ResponseEntity.ok(orderService.getOrdersByPhone(phone));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse updated = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest request) {
        if (request == null) {
            request = new CancelOrderRequest("", "Customer requested cancellation");
        }
        OrderResponse cancelled = orderService.cancelOrder(id, request);
        return ResponseEntity.ok(cancelled);
    }

    @GetMapping("/kitchen")
    public ResponseEntity<List<KitchenOrderResponse>> getKitchenOrders() {
        return ResponseEntity.ok(orderService.getKitchenOrders());
    }

    @GetMapping("/wait-time")
    public ResponseEntity<Map<String, Object>> getEstimatedWaitTime() {
        int waitTime = orderService.getEstimatedWaitTime();
        return ResponseEntity.ok(Map.of(
                "estimatedMinutes", waitTime,
                "message", String.format("Current estimated prep time: ~%d mins", waitTime)
        ));
    }
}

