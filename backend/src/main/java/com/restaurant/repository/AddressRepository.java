package com.restaurant.repository;

import com.restaurant.entity.Address;
import com.restaurant.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
}
