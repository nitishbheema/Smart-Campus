package com.campus.eventmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // null means broadcast to all

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private String type; // INFO, SUCCESS, WARNING, EVENT

    private boolean read = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Long eventId; // optional reference to event

    public Notification() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(Long userId, String message, String type, Long eventId) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.eventId = eventId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public boolean isRead() { return read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getEventId() { return eventId; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setMessage(String message) { this.message = message; }
    public void setType(String type) { this.type = type; }
    public void setRead(boolean read) { this.read = read; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
}
