package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.dto.RegistrationRequest;
import com.campus.eventmanagement.model.Event;
import com.campus.eventmanagement.model.Registration;
import com.campus.eventmanagement.service.NotificationService;
import com.campus.eventmanagement.service.RegistrationService;
import com.campus.eventmanagement.service.OTPService;
import com.campus.eventmanagement.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.regex.Pattern;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final RegistrationService registrationService;
    private final NotificationService notificationService;
    private final OTPService otpService;
    private final EmailService emailService;

    public RegistrationController(RegistrationService registrationService,
                                   NotificationService notificationService,
                                   OTPService otpService,
                                   EmailService emailService) {
        this.registrationService = registrationService;
        this.notificationService = notificationService;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    @PostMapping("/api/register-event")
    public ResponseEntity<?> registerEvent(@RequestBody RegistrationRequest request) {
        try {
            // 1. Validate Phone Number (Basic check: 10 to 15 digits optionally starting with +)
            if (request.getPhone() == null || !Pattern.matches("^\\+?[0-9]{10,15}$", request.getPhone())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number format"));
            }

            // 2. Validate Email
            if (request.getEmail() == null || !request.getEmail().contains("@")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }

            // 3. Verify OTP (phone-first, then email fallback)
            // OTPService handles phone-number normalisation internally.
            String otp = request.getOtp();
            if (otp == null || otp.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
            }
            boolean otpValid = otpService.validateOTP(request.getPhone(), otp)
                            || otpService.validateOTP(request.getEmail(), otp);
            System.out.println("[Register] OTP validation result=" + otpValid
                + " phone=" + request.getPhone() + " email=" + request.getEmail());
            if (!otpValid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP. Please request a new one."));
            }

            Registration reg = registrationService.registerEvent(request.getUserId(), request.getEventId());
            
            // 4. Send In-App Notification
            notificationService.createForUser(
                request.getUserId(),
                "You have successfully registered for the event! 🎉",
                "SUCCESS",
                request.getEventId()
            );

            // 5. Send Confirmation Email
            try {
                String subject = "Event Registration Confirmed!";
                String body = "Hello,\n\nYou have successfully registered for Event ID: " + request.getEventId() + ".\nWe look forward to seeing you!\n\nBest,\nCampus Event Team";
                emailService.sendEmail(request.getEmail(), subject, body);
            } catch (Exception e) {
                System.err.println("Could not send confirmation email: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "message", "Successfully registered for event. Confirmation email sent.",
                "registrationId", reg.getId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/unregister-event")
    public ResponseEntity<?> unregisterEvent(@RequestBody RegistrationRequest request) {
        try {
            registrationService.unregisterEvent(request.getUserId(), request.getEventId());
            // Send notification
            notificationService.createForUser(
                request.getUserId(),
                "You have been unregistered from the event.",
                "INFO",
                request.getEventId()
            );
            return ResponseEntity.ok(Map.of("message", "Successfully unregistered from event"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/my-events/{userId}")
    public ResponseEntity<List<Event>> getMyEvents(@PathVariable Long userId) {
        List<Event> events = registrationService.getMyEvents(userId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/api/events/{eventId}/registration-count")
    public ResponseEntity<Map<String, Long>> getRegistrationCount(@PathVariable Long eventId) {
        return ResponseEntity.ok(Map.of("count", registrationService.getRegistrationCount(eventId)));
    }
}
