package com.campus.eventmanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OTPService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private WhatsAppService whatsappService;

    private static final long OTP_EXPIRY_SECONDS = 600; // 10 minutes

    // Stores OTP + expiry timestamp per identifier
    private final Map<String, String[]> otpStorage = new HashMap<>();

    /**
     * Normalises a phone number to E.164 Indian format (+91XXXXXXXXXX).
     * Handles inputs like: 9876543210 / +919876543210 / 919876543210 / 91
     * 9876543210
     */
    private String normalisePhone(String raw) {
        if (raw == null)
            return null;
        String digits = raw.replaceAll("[^0-9]", ""); // strip spaces, +, dashes
        if (digits.startsWith("91") && digits.length() == 12) {
            return "+" + digits; // 91XXXXXXXXXX -> +91XXXXXXXXXX
        } else if (digits.length() == 10) {
            return "+91" + digits; // XXXXXXXXXX -> +91XXXXXXXXXX
        }
        // Already has country code but not 91, or unusual length – keep as +digits
        return "+" + digits;
    }

    /**
     * Returns the storage key for an identifier.
     * Emails are kept as-is; phone-like strings are normalised.
     */
    private String toKey(String identifier) {
        if (identifier == null)
            return null;
        // Simple heuristic: if it contains '@' it's an email
        if (identifier.contains("@"))
            return identifier.toLowerCase().trim();
        return normalisePhone(identifier);
    }

    public String generateOTP(String identifier) {
        String key = toKey(identifier);
        String otp = String.format("%06d", new Random().nextInt(999999));
        long expiresAt = Instant.now().getEpochSecond() + OTP_EXPIRY_SECONDS;
        otpStorage.put(key, new String[] { otp, String.valueOf(expiresAt) });
        System.out.println("[OTP] Stored OTP for key=" + key + " (expires in " + OTP_EXPIRY_SECONDS + "s)");
        return otp;
    }

    public boolean validateOTP(String identifier, String otp) {
        String key = toKey(identifier);
        String[] entry = otpStorage.get(key);
        if (entry == null) {
            System.out.println("[OTP] No OTP found for key=" + key);
            return false;
        }
        long expiresAt = Long.parseLong(entry[1]);
        if (Instant.now().getEpochSecond() > expiresAt) {
            otpStorage.remove(key);
            System.out.println("[OTP] OTP expired for key=" + key);
            return false;
        }
        if (entry[0].equals(otp)) {
            otpStorage.remove(key);
            System.out.println("[OTP] OTP validated successfully for key=" + key);
            return true;
        }
        System.out.println("[OTP] OTP mismatch for key=" + key + " (expected=" + entry[0] + ", got=" + otp + ")");
        return false;
    }

    public void sendOTPViaEmail(String email) {
        String otp = generateOTP(email);
        String subject = "Your Campus Event System OTP";
        String body = "Your OTP for verification is: " + otp + "\nThis OTP is valid for 10 minutes. Do not share it.";
        try {
            emailService.sendEmail(email, subject, body);
        } catch (Exception e) {
            System.err.println("[OTP] Email send failed. Mock OTP: " + otp);
        }
    }

    public void sendOTPViaWhatsApp(String phoneNumber) {
        String normalisedPhone = normalisePhone(phoneNumber);
        String otp = generateOTP(normalisedPhone); // store with normalised key
        String message = "Your Campus Event System OTP is: *" + otp + "*. Valid for 10 minutes. Do not share it.";
        try {
            whatsappService.sendWhatsAppMessage(normalisedPhone, message);
        } catch (Exception e) {
            System.err.println("[OTP] WhatsApp send failed. Mock OTP: " + otp);
        }
    }
}
