package com.campus.eventmanagement.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class WhatsAppService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.number}")
    private String twilioWhatsAppNumber;

    @PostConstruct
    public void initTwilio() {
        if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
        }
    }

    public void sendWhatsAppMessage(String toPhoneNumber, String messageBody) {
        if (accountSid == null || accountSid.isEmpty() || accountSid.equals("your_account_sid")) {
            System.out.println("[WhatsApp] Twilio not configured. Mock send to " + toPhoneNumber + ": " + messageBody);
            return;
        }

        // Normalize: strip whitespace, ensure leading +
        String cleanPhoneNumber = toPhoneNumber.replaceAll("\\s+", "");
        if (!cleanPhoneNumber.startsWith("+")) {
            cleanPhoneNumber = "+" + cleanPhoneNumber;
        }

        System.out.println("[WhatsApp] Sending to whatsapp:" + cleanPhoneNumber);

        Message message = Message.creator(
                new PhoneNumber("whatsapp:" + cleanPhoneNumber),
                new PhoneNumber("whatsapp:" + twilioWhatsAppNumber),
                messageBody
        ).create();

        System.out.println("[WhatsApp] Message sent, SID=" + message.getSid());
    }
}
