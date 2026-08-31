package com.restaurant.service;

import com.restaurant.dto.*;
import java.util.List;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse loginWithGoogle(GoogleLoginRequest request);
    UserProfileResponse getUserProfile(Long userId);
    UserProfileResponse getUserProfileByPhone(String phone);
    UserProfileResponse updateProfile(Long userId, String name, String email);
    AddressResponse addAddress(Long userId, AddressRequest request);
    List<AddressResponse> getAddresses(Long userId);
    void deleteAddress(Long userId, Long addressId);
}
