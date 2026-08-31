package com.restaurant.repository;

import com.restaurant.entity.Combo;
import com.restaurant.entity.ComboItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboItemRepository extends JpaRepository<ComboItem, Long> {
    List<ComboItem> findByCombo(Combo combo);
}
