package com.restaurant.controller;

import com.restaurant.dto.SpecialOfferRequest;
import com.restaurant.dto.SpecialOfferResponse;
import com.restaurant.service.SpecialOfferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
public class SpecialOfferController {

    private final SpecialOfferService specialOfferService;

    public SpecialOfferController(SpecialOfferService specialOfferService) {
        this.specialOfferService = specialOfferService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<SpecialOfferResponse>> getActiveOffers() {
        return ResponseEntity.ok(specialOfferService.getActiveOffers());
    }

    @GetMapping
    public ResponseEntity<List<SpecialOfferResponse>> getAllOffers() {
        return ResponseEntity.ok(specialOfferService.getAllOffers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialOfferResponse> getOfferById(@PathVariable Long id) {
        return ResponseEntity.ok(specialOfferService.getOfferById(id));
    }

    @PostMapping
    public ResponseEntity<SpecialOfferResponse> createOffer(@Valid @RequestBody SpecialOfferRequest request) {
        SpecialOfferResponse created = specialOfferService.createOffer(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpecialOfferResponse> updateOffer(@PathVariable Long id, @Valid @RequestBody SpecialOfferRequest request) {
        SpecialOfferResponse updated = specialOfferService.updateOffer(id, request);
        return ResponseEntity.ok(updated);
    }

    @RequestMapping(value = "/{id}/toggle", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<SpecialOfferResponse> toggleOfferActive(@PathVariable Long id) {
        return ResponseEntity.ok(specialOfferService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOffer(@PathVariable Long id) {
        specialOfferService.deleteOffer(id);
        return ResponseEntity.ok(Map.of("message", "Special offer deleted successfully"));
    }
}
