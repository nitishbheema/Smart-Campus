package com.campus.eventmanagement.service;

import com.campus.eventmanagement.model.Event;
import com.campus.eventmanagement.model.User;
import com.campus.eventmanagement.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Service
@EnableScheduling
public class EventReminderService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WhatsAppService whatsappService;

    // Runs every 15 minutes to check for upcoming events
    @Scheduled(fixedRate = 900000)
    public void sendEventReminders() {
        System.out.println("Running scheduled check for upcoming events...");
        
        List<Event> allEvents = eventRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter12 = DateTimeFormatter.ofPattern("hh:mm a");
        DateTimeFormatter timeFormatter24 = DateTimeFormatter.ofPattern("HH:mm");

        for (Event event : allEvents) {
            if (event.getDate() == null || event.getTime() == null) continue;

            try {
                LocalDate eventDate = LocalDate.parse(event.getDate(), dateFormatter);
                
                // Only process events happening today
                if (!eventDate.equals(today)) continue;

                LocalTime eventTime;
                try {
                    eventTime = LocalTime.parse(event.getTime().toUpperCase(), timeFormatter12);
                } catch (DateTimeParseException e) {
                    eventTime = LocalTime.parse(event.getTime(), timeFormatter24);
                }

                // If event is exactly between 45 and 60 minutes from now
                if (now.isBefore(eventTime) && now.plusMinutes(60).isAfter(eventTime)) {
                    
                    List<Map<String, Object>> registeredUsers = registrationService.getRegisteredUsersForEvent(event.getId());
                    
                    if (!registeredUsers.isEmpty()) {
                        System.out.println("Sending 1-hour reminders for event: " + event.getTitle());
                        
                        String subject = "Reminder: " + event.getTitle() + " starts in 1 hour!";
                        String body = "Hi there!\n\nThis is a quick reminder that the event '" + event.getTitle() 
                                    + "' is starting in about an hour at " + event.getVenue() + ".\n\n"
                                    + "See you soon!";

                        for (Map<String, Object> userMap : registeredUsers) {
                            User user = (User) userMap.get("user");
                            
                            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                                try { emailService.sendEmail(user.getEmail(), subject, body); } catch (Exception ignored) {}
                            }
                            if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                                try { whatsappService.sendWhatsAppMessage(user.getPhone(), body); } catch (Exception ignored) {}
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore parse errors for badly formatted dates
            }
        }
    }
}
