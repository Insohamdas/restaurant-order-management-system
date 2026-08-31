package com.restaurant.service;

import com.restaurant.dto.BusinessSettingRequest;
import com.restaurant.dto.BusinessSettingResponse;

public interface BusinessSettingService {
    BusinessSettingResponse getSettings();
    BusinessSettingResponse updateSettings(BusinessSettingRequest request);
}
