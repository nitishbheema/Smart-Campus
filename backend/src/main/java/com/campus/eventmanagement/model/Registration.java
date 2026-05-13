package com.campus.eventmanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long eventId;

    public Registration() {}

    public Registration(Long id, Long userId, Long eventId) {
        this.id = id; this.userId = userId; this.eventId = eventId;
    }

    // Getters
    public Long getId()      { return id; }
    public Long getUserId()  { return userId; }
    public Long getEventId() { return eventId; }

    // Setters
    public void setId(Long id)        { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id, userId, eventId;
        public Builder id(Long id)           { this.id = id; return this; }
        public Builder userId(Long userId)   { this.userId = userId; return this; }
        public Builder eventId(Long eventId) { this.eventId = eventId; return this; }
        public Registration build() { return new Registration(id, userId, eventId); }
    }
}
