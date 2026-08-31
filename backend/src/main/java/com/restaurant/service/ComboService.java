package com.restaurant.service;

import com.restaurant.dto.ComboRequest;
import com.restaurant.dto.ComboResponse;
import java.util.List;

public interface ComboService {
    List<ComboResponse> getActiveCombos();
    List<ComboResponse> getAllCombos();
    ComboResponse getComboById(Long id);
    ComboResponse createCombo(ComboRequest request);
    ComboResponse updateCombo(Long id, ComboRequest request);
    ComboResponse toggleActive(Long id);
    void deleteCombo(Long id);
}
