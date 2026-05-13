package com.campus.eventmanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String date;
    private String department;
    private String type;

    // New fields
    private String venue;
    private String time;
    private Integer maxCapacity;
    private String organizer;
    private String tags;       // comma-separated
    private Long adminId;      // The ID of the ADMIN who created this event

    public Event() {}

    public Event(Long id, String title, String description, String date, String department, String type) {
        this.id = id; this.title = title; this.description = description;
        this.date = date; this.department = department; this.type = type;
    }

    // Getters
    public Long getId()             { return id; }
    public String getTitle()        { return title; }
    public String getDescription()  { return description; }
    public String getDate()         { return date; }
    public String getDepartment()   { return department; }
    public String getType()         { return type; }
    public String getVenue()        { return venue; }
    public String getTime()         { return time; }
    public Integer getMaxCapacity() { return maxCapacity; }
    public String getOrganizer()    { return organizer; }
    public String getTags()         { return tags; }
    public Long getAdminId()        { return adminId; }

    // Setters
    public void setId(Long id)                   { this.id = id; }
    public void setTitle(String title)           { this.title = title; }
    public void setDescription(String d)         { this.description = d; }
    public void setDate(String date)             { this.date = date; }
    public void setDepartment(String dept)       { this.department = dept; }
    public void setType(String type)             { this.type = type; }
    public void setVenue(String venue)           { this.venue = venue; }
    public void setTime(String time)             { this.time = time; }
    public void setMaxCapacity(Integer capacity) { this.maxCapacity = capacity; }
    public void setOrganizer(String organizer)   { this.organizer = organizer; }
    public void setTags(String tags)             { this.tags = tags; }
    public void setAdminId(Long adminId)         { this.adminId = adminId; }
}
