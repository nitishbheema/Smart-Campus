package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.model.Event;
import com.campus.eventmanagement.service.EventService;
import com.campus.eventmanagement.service.NotificationService;
import com.campus.eventmanagement.service.EmailService;
import com.campus.eventmanagement.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public EventController(EventService eventService, 
                           NotificationService notificationService,
                           EmailService emailService,
                           UserRepository userRepository) {
        this.eventService = eventService;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            Event created = eventService.createEvent(event);
            // Notify all users about the new event
            notificationService.broadcastToAll(
                "📢 New event added: \"" + created.getTitle() + "\" – Check it out!",
                "EVENT",
                created.getId()
            );

            // Send Email to all users
            userRepository.findAll().forEach(user -> {
                try {
                    String email = user.getUsername(); // Assuming username is email
                    if (email != null && email.contains("@")) {
                        emailService.sendEmail(
                            email,
                            "New Event Alert: " + created.getTitle(),
                            "A new event has been created! Join us for " + created.getTitle() + " on " + created.getDate() + ".\n\nDescription: " + created.getDescription()
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send new event email: " + e.getMessage());
                }
            });

            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestParam Long userId, @RequestBody Event event) {
        try {
            com.campus.eventmanagement.model.User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            Event existing = eventService.getAllEvents().stream().filter(e -> e.getId().equals(id)).findFirst().orElseThrow(() -> new RuntimeException("Event not found"));
            
            if (!"OWNER".equals(user.getRole()) && !user.getId().equals(existing.getAdminId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Only the OWNER or the creating ADMIN can update this event"));
            }

            Event updated = eventService.updateEvent(id, event);
            
            // Notify all users about the event update
            notificationService.broadcastToAll(
                "🔄 Event Updated: \"" + updated.getTitle() + "\" – Check the new details!",
                "EVENT",
                updated.getId()
            );

            // Send Email to all users about the update
            userRepository.findAll().forEach(user -> {
                try {
                    String email = user.getUsername();
                    if (email != null && email.contains("@")) {
                        emailService.sendEmail(
                            email,
                            "Event Update Alert: " + updated.getTitle(),
                            "An event you might be interested in has been updated.\nNew Details for " + updated.getTitle() + " on " + updated.getDate() + ".\n\n" + updated.getDescription()
                        );
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send update email: " + e.getMessage());
                }
            });

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, @RequestParam Long userId) {
        try {
            com.campus.eventmanagement.model.User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            Event existing = eventService.getAllEvents().stream().filter(e -> e.getId().equals(id)).findFirst().orElseThrow(() -> new RuntimeException("Event not found"));
            
            if (!"OWNER".equals(user.getRole()) && !user.getId().equals(existing.getAdminId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Only the OWNER or the creating ADMIN can delete this event"));
            }

            eventService.deleteEvent(id);
            return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(eventService.getAnalytics());
    }
}
