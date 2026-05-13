package com.campus.eventmanagement.service;

import com.campus.eventmanagement.model.Event;
import com.campus.eventmanagement.model.Registration;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final com.campus.eventmanagement.repository.UserRepository userRepository;

    public RegistrationService(RegistrationRepository registrationRepository, EventRepository eventRepository, com.campus.eventmanagement.repository.UserRepository userRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Registration registerEvent(Long userId, Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Event not found");
        }
        if (registrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Already registered for this event");
        }
        // Check capacity
        Event event = eventRepository.findById(eventId).orElseThrow();
        if (event.getMaxCapacity() != null) {
            long count = registrationRepository.countByEventId(eventId);
            if (count >= event.getMaxCapacity()) {
                throw new RuntimeException("Event is at full capacity");
            }
        }
        Registration registration = Registration.builder()
                .userId(userId)
                .eventId(eventId)
                .build();
        return registrationRepository.save(registration);
    }

    public void unregisterEvent(Long userId, Long eventId) {
        if (!registrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Not registered for this event");
        }
        registrationRepository.deleteByUserIdAndEventId(userId, eventId);
    }

    public List<Event> getMyEvents(Long userId) {
        List<Registration> registrations = registrationRepository.findByUserId(userId);
        List<Long> eventIds = registrations.stream()
                .map(Registration::getEventId)
                .collect(Collectors.toList());
        return eventRepository.findAllById(eventIds);
    }

    public long getRegistrationCount(Long eventId) {
        return registrationRepository.countByEventId(eventId);
    }

    public List<Map<String, Object>> getRegisteredUsersForEvent(Long eventId) {
        List<Registration> registrations = registrationRepository.findByEventId(eventId);
        List<Long> userIds = registrations.stream()
                .map(Registration::getUserId)
                .collect(Collectors.toList());
        
        List<com.campus.eventmanagement.model.User> users = userRepository.findAllById(userIds);
        return users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("user", user);
            return map;
        }).collect(Collectors.toList());
    }
}
