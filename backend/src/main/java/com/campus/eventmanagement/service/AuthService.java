package com.campus.eventmanagement.service;

import com.campus.eventmanagement.dto.LoginRequest;
import com.campus.eventmanagement.dto.RegisterRequest;
import com.campus.eventmanagement.model.User;
import com.campus.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OTPService otpService;

    public AuthService(UserRepository userRepository, OTPService otpService) {
        this.userRepository = userRepository;
        this.otpService = otpService;
    }

    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        // Ensure email and phone are provided
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new RuntimeException("Valid email is required");
        }
        if (request.getPhone() == null || request.getPhone().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }

        // Verify OTP
        if (request.getOtp() == null || 
            (!otpService.validateOTP(request.getEmail(), request.getOtp()) && 
             !otpService.validateOTP(request.getPhone(), request.getOtp()))) {
            throw new RuntimeException("Invalid or missing OTP");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .role(request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT")
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();
        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }
}
