package com.restaurant.service;

import com.restaurant.dto.BusinessSettingRequest;
import com.restaurant.dto.BusinessSettingResponse;
import com.restaurant.entity.BusinessSetting;
import com.restaurant.repository.BusinessSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BusinessSettingServiceImpl implements BusinessSettingService {

    private final BusinessSettingRepository businessSettingRepository;

    public BusinessSettingServiceImpl(BusinessSettingRepository businessSettingRepository) {
        this.businessSettingRepository = businessSettingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessSettingResponse getSettings() {
        BusinessSetting setting = businessSettingRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> businessSettingRepository.save(new BusinessSetting()));
        return new BusinessSettingResponse(setting);
    }

    @Override
    public BusinessSettingResponse updateSettings(BusinessSettingRequest request) {
        BusinessSetting setting = businessSettingRepository.findAll().stream()
                .findFirst()
                .orElseGet(BusinessSetting::new);

        if (request.getRestaurantName() != null) setting.setRestaurantName(request.getRestaurantName().trim());
        if (request.getDeliveryFee() != null) setting.setDeliveryFee(request.getDeliveryFee());
        if (request.getFreeDeliveryThreshold() != null) setting.setFreeDeliveryThreshold(request.getFreeDeliveryThreshold());
        if (request.getMinimumOrderAmount() != null) setting.setMinimumOrderAmount(request.getMinimumOrderAmount());
        if (request.getTaxRatePercent() != null) setting.setTaxRatePercent(request.getTaxRatePercent());
        if (request.getAvgPrepTimeMinutes() != null) setting.setAvgPrepTimeMinutes(request.getAvgPrepTimeMinutes());
        if (request.getRestaurantOpen() != null) setting.setRestaurantOpen(request.getRestaurantOpen());

        BusinessSetting saved = businessSettingRepository.save(setting);
        return new BusinessSettingResponse(saved);
    }
}
