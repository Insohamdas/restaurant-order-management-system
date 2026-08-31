package com.restaurant.repository;

import com.restaurant.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);
    Optional<Favorite> findByCustomerPhoneAndFoodItemId(String customerPhone, Long foodItemId);
    boolean existsByCustomerPhoneAndFoodItemId(String customerPhone, Long foodItemId);
    void deleteByCustomerPhoneAndFoodItemId(String customerPhone, Long foodItemId);
}
