package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.model.Announcement;
import com.campus.eventmanagement.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    /** GET /api/announcements/active */
    @GetMapping("/active")
    public ResponseEntity<List<Announcement>> getActive() {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements());
    }

    /** GET /api/announcements */
    @GetMapping
    public ResponseEntity<List<Announcement>> getAll() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    /** POST /api/announcements */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        String type = body.getOrDefault("type", "INFO");
        String createdBy = body.getOrDefault("createdBy", "Admin");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }
        Announcement a = announcementService.create(message, type, createdBy);
        return ResponseEntity.ok(a);
    }

    /** PUT /api/announcements/{id}/deactivate */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        announcementService.deactivate(id);
        return ResponseEntity.ok().build();
    }

    /** DELETE /api/announcements/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.ok().build();
    }
}
