package com.restaurant.repository;

import com.restaurant.entity.Order;
import com.restaurant.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByPhoneOrderByCreatedAtDesc(String phone);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatusInOrderByCreatedAtAsc(Collection<OrderStatus> statuses);

    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    long countByStatusIn(Collection<OrderStatus> statuses);

    long countByStatus(OrderStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByCreatedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, OrderStatus status);

    long countByCreatedAtBetweenAndStatusIn(LocalDateTime start, LocalDateTime end, Collection<OrderStatus> statuses);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.status != 'CANCELLED'")
    Double getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.status != 'CANCELLED' AND o.createdAt BETWEEN :start AND :end")
    Double getRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT oi.foodItem.name, oi.foodItem.category, SUM(oi.quantity), SUM(oi.quantity * oi.price) " +
           "FROM OrderItem oi WHERE oi.order.status != 'CANCELLED' " +
           "GROUP BY oi.foodItem.id, oi.foodItem.name, oi.foodItem.category " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> getTopSellingItemsAllTime();

    @Query("SELECT oi.foodItem.name, oi.foodItem.category, SUM(oi.quantity), SUM(oi.quantity * oi.price) " +
           "FROM OrderItem oi WHERE oi.order.status != 'CANCELLED' AND oi.order.createdAt BETWEEN :start AND :end " +
           "GROUP BY oi.foodItem.id, oi.foodItem.name, oi.foodItem.category " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> getTopSellingItemsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT oi.foodItem.category, SUM(oi.quantity * oi.price), SUM(oi.quantity) " +
           "FROM OrderItem oi WHERE oi.order.status != 'CANCELLED' AND oi.order.createdAt BETWEEN :start AND :end " +
           "GROUP BY oi.foodItem.category " +
           "ORDER BY SUM(oi.quantity * oi.price) DESC")
    List<Object[]> getCategoryPerformanceBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT oi.foodItem.category, SUM(oi.quantity * oi.price), SUM(oi.quantity) " +
           "FROM OrderItem oi WHERE oi.order.status != 'CANCELLED' " +
           "GROUP BY oi.foodItem.category " +
           "ORDER BY SUM(oi.quantity * oi.price) DESC")
    List<Object[]> getCategoryPerformanceAllTime();

    @Query("SELECT COUNT(DISTINCT o.phone) FROM Order o")
    Long countDistinctCustomers();

    @Query("SELECT o.phone, COUNT(o) FROM Order o GROUP BY o.phone HAVING COUNT(o) > 1")
    List<Object[]> getReturningCustomers();
}

