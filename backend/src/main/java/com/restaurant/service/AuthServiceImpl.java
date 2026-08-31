package com.restaurant.service;

import com.restaurant.dto.*;
import com.restaurant.entity.Address;
import com.restaurant.entity.LoyaltyAccount;
import com.restaurant.entity.User;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.AddressRepository;
import com.restaurant.repository.LoyaltyAccountRepository;
import com.restaurant.repository.UserRepository;
import com.restaurant.util.PasswordUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;

    public AuthServiceImpl(UserRepository userRepository, AddressRepository addressRepository, LoyaltyAccountRepository loyaltyAccountRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email '" + email + "' already exists");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new BadRequestException("An account with phone number '" + phone + "' already exists");
        }

        String salt = PasswordUtils.generateSalt();
        String passwordHash = PasswordUtils.hashPassword(request.getPassword(), salt);

        User user = new User(request.getName().trim(), email, phone, passwordHash, salt, "CUSTOMER");
        User saved = userRepository.save(user);

        // Auto-create loyalty account if not present
        if (loyaltyAccountRepository.findByPhone(phone).isEmpty()) {
            loyaltyAccountRepository.save(new LoyaltyAccount(phone, saved.getName()));
        }

        String token = UUID.randomUUID().toString();
        return new AuthResponse(saved, token, "Registration successful");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        User user = null;

        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        } else {
            user = userRepository.findByPhone(identifier)
                    .orElseThrow(() -> new BadRequestException("Invalid phone number or password"));
        }

        boolean valid = PasswordUtils.verifyPassword(request.getPassword(), user.getPasswordSalt(), user.getPasswordHash());
        if (!valid) {
            throw new BadRequestException("Invalid credentials provided");
        }

        String token = UUID.randomUUID().toString();
        return new AuthResponse(user, token, "Login successful");
    }

    @Override
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String name = (request.getName() != null && !request.getName().trim().isEmpty()) 
                ? request.getName().trim() 
                : email.split("@")[0];

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            String phone = (request.getPhone() != null && !request.getPhone().trim().isEmpty()) 
                    ? request.getPhone().trim() 
                    : ("98" + String.format("%08d", Math.abs(email.hashCode()) % 100000000));

            // Ensure phone uniqueness
            if (userRepository.existsByPhone(phone)) {
                phone = "9" + String.format("%09d", (System.currentTimeMillis() + Math.abs(email.hashCode())) % 1000000000L);
            }

            String salt = PasswordUtils.generateSalt();
            String passwordHash = PasswordUtils.hashPassword(UUID.randomUUID().toString(), salt);

            user = new User(name, email, phone, passwordHash, salt, "CUSTOMER");
            user = userRepository.save(user);

            // Auto-create loyalty account
            if (loyaltyAccountRepository.findByPhone(phone).isEmpty()) {
                loyaltyAccountRepository.save(new LoyaltyAccount(phone, user.getName()));
            }
        } else {
            // Update name if changed
            if (request.getName() != null && !request.getName().trim().isEmpty() && !user.getName().equals(name)) {
                user.setName(name);
                user = userRepository.save(user);
            }
        }

        String token = UUID.randomUUID().toString();
        return new AuthResponse(user, token, "Google Sign-In successful");
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        int loyaltyPoints = loyaltyAccountRepository.findByPhone(user.getPhone())
                .map(LoyaltyAccount::getPointsBalance)
                .orElse(0);

        return new UserProfileResponse(user, loyaltyPoints);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfileByPhone(String phone) {
        User user = userRepository.findByPhone(phone.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found for phone: " + phone));

        int loyaltyPoints = loyaltyAccountRepository.findByPhone(user.getPhone())
                .map(LoyaltyAccount::getPointsBalance)
                .orElse(0);

        return new UserProfileResponse(user, loyaltyPoints);
    }

    @Override
    public UserProfileResponse updateProfile(Long userId, String name, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (name != null && !name.trim().isEmpty()) {
            user.setName(name.trim());
        }
        if (email != null && !email.trim().isEmpty()) {
            String newEmail = email.trim().toLowerCase();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email '" + newEmail + "' is already in use by another account");
            }
            user.setEmail(newEmail);
        }

        User updated = userRepository.save(user);
        int loyaltyPoints = loyaltyAccountRepository.findByPhone(updated.getPhone())
                .map(LoyaltyAccount::getPointsBalance)
                .orElse(0);

        return new UserProfileResponse(updated, loyaltyPoints);
    }

    @Override
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Address address = new Address(user, request.getLabel(), request.getAddressText().trim(), request.getIsDefault());
        Address saved = addressRepository.save(address);
        return new AddressResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(AddressResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to delete this address");
        }

        addressRepository.delete(address);
    }
}
