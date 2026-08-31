package com.restaurant.controller;

import com.restaurant.dto.ComboRequest;
import com.restaurant.dto.ComboResponse;
import com.restaurant.service.ComboService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/combos")
public class ComboController {

    private final ComboService comboService;

    public ComboController(ComboService comboService) {
        this.comboService = comboService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<ComboResponse>> getActiveCombos() {
        return ResponseEntity.ok(comboService.getActiveCombos());
    }

    @GetMapping
    public ResponseEntity<List<ComboResponse>> getAllCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboResponse> getComboById(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.getComboById(id));
    }

    @PostMapping
    public ResponseEntity<ComboResponse> createCombo(@Valid @RequestBody ComboRequest request) {
        ComboResponse created = comboService.createCombo(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComboResponse> updateCombo(@PathVariable Long id, @Valid @RequestBody ComboRequest request) {
        ComboResponse updated = comboService.updateCombo(id, request);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/toggle", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ComboResponse> toggleComboActive(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCombo(@PathVariable Long id) {
        comboService.deleteCombo(id);
        return ResponseEntity.ok(Map.of("message", "Combo deleted successfully"));
    }
}
