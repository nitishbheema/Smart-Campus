package com.campus.eventmanagement.service;

import com.campus.eventmanagement.model.Event;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.RegistrationRepository;
import com.campus.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
                        RegistrationRepository registrationRepository,
                        UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event updated) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setDate(updated.getDate());
        existing.setDepartment(updated.getDepartment());
        existing.setType(updated.getType());
        existing.setVenue(updated.getVenue());
        existing.setTime(updated.getTime());
        existing.setMaxCapacity(updated.getMaxCapacity());
        existing.setOrganizer(updated.getOrganizer());
        existing.setTags(updated.getTags());
        return eventRepository.save(existing);
    }

    public void deleteEvent(Long id) {
        registrationRepository.deleteByEventId(id);
        eventRepository.deleteById(id);
    }

    /** Return analytics summary for admin panel */
    public Map<String, Object> getAnalytics() {
        List<Event> events = eventRepository.findAll();
        long totalUsers = userRepository.count();
        long totalRegistrations = registrationRepository.count();

        // Registrations per event
        List<Map<String, Object>> eventStats = events.stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("eventId", e.getId());
            m.put("title", e.getTitle());
            m.put("type", e.getType());
            m.put("department", e.getDepartment());
            m.put("registrations", registrationRepository.countByEventId(e.getId()));
            m.put("capacity", e.getMaxCapacity());
            return m;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("totalEvents", events.size());
        result.put("totalUsers", totalUsers);
        result.put("totalRegistrations", totalRegistrations);
        result.put("eventStats", eventStats);
        return result;
    }
}
