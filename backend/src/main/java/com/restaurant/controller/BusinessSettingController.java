package com.restaurant.controller;

import com.restaurant.dto.BusinessSettingRequest;
import com.restaurant.dto.BusinessSettingResponse;
import com.restaurant.service.BusinessSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class BusinessSettingController {

    private final BusinessSettingService businessSettingService;

    public BusinessSettingController(BusinessSettingService businessSettingService) {
        this.businessSettingService = businessSettingService;
    }

    @GetMapping
    public ResponseEntity<BusinessSettingResponse> getSettings() {
        return ResponseEntity.ok(businessSettingService.getSettings());
    }

    @PutMapping
    public ResponseEntity<BusinessSettingResponse> updateSettings(@RequestBody BusinessSettingRequest request) {
        return ResponseEntity.ok(businessSettingService.updateSettings(request));
    }
}
