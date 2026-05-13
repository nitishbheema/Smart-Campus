package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.model.Notification;
import com.campus.eventmanagement.service.NotificationService;
import com.campus.eventmanagement.service.EmailService;
import com.campus.eventmanagement.service.OTPService;
import com.campus.eventmanagement.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    private OTPService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WhatsAppService whatsappService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** GET /api/notifications/{userId} */
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    /** GET /api/notifications/{userId}/unread-count */
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    /** PUT /api/notifications/{userId}/mark-all-read */
    @PutMapping("/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    /** PUT /api/notifications/read/{id} */
    @PutMapping("/read/{id}")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok().build();
    }

    /** POST /api/notifications/broadcast - Admin only */
    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcast(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        String type = body.getOrDefault("type", "INFO");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }
        notificationService.broadcastToAll(message, type, null);
        return ResponseEntity.ok(Map.of("message", "Broadcast sent successfully"));
    }

    /** DELETE /api/notifications/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.ok().build();
    }

    // --- OTP AND ALERT ENDPOINTS ---

    @PostMapping("/otp/send/email")
    public ResponseEntity<?> sendOTPEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        otpService.sendOTPViaEmail(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + email));
    }

    @PostMapping("/otp/send/whatsapp")
    public ResponseEntity<?> sendOTPWhatsApp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        }
        otpService.sendOTPViaWhatsApp(phone);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + phone));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier"); // email or phone
        String otp = request.get("otp");
        
        if (identifier == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Identifier and OTP are required"));
        }

        boolean isValid = otpService.validateOTP(identifier, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }
    }

    @PostMapping("/alert/email")
    public ResponseEntity<?> sendAlertEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String subject = request.get("subject");
        String body = request.get("body");
        
        try {
            emailService.sendEmail(email, subject, body);
            return ResponseEntity.ok(Map.of("message", "Alert email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to send email. Check configuration."));
        }
    }

    @PostMapping("/alert/whatsapp")
    public ResponseEntity<?> sendAlertWhatsApp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String body = request.get("body");
        
        try {
            whatsappService.sendWhatsAppMessage(phone, body);
            return ResponseEntity.ok(Map.of("message", "WhatsApp alert sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to send WhatsApp message. Check configuration."));
        }
    }
}
