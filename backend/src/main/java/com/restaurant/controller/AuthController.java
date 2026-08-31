package com.restaurant.controller;

import com.restaurant.dto.*;
import com.restaurant.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long userId) {
        UserProfileResponse response = authService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/by-phone/{phone}")
    public ResponseEntity<UserProfileResponse> getProfileByPhone(@PathVariable String phone) {
        UserProfileResponse response = authService.getUserProfileByPhone(phone);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<UserProfileResponse> updateProfile(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        UserProfileResponse response = authService.updateProfile(userId, body.get("name"), body.get("email"));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/addresses/{userId}")
    public ResponseEntity<AddressResponse> addAddress(@PathVariable Long userId, @Valid @RequestBody AddressRequest request) {
        AddressResponse response = authService.addAddress(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/addresses/{userId}")
    public ResponseEntity<List<AddressResponse>> getAddresses(@PathVariable Long userId) {
        List<AddressResponse> addresses = authService.getAddresses(userId);
        return ResponseEntity.ok(addresses);
    }

    @DeleteMapping("/addresses/{userId}/{addressId}")
    public ResponseEntity<Map<String, String>> deleteAddress(@PathVariable Long userId, @PathVariable Long addressId) {
        authService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
    }
}
