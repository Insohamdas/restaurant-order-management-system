package com.restaurant.repository;

import com.restaurant.entity.BusinessSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessSettingRepository extends JpaRepository<BusinessSetting, Long> {
}
