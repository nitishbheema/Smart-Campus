package com.campus.eventmanagement.service;

import com.campus.eventmanagement.model.Announcement;
import com.campus.eventmanagement.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Announcement create(String message, String type, String createdBy) {
        Announcement a = new Announcement(message, type, createdBy);
        return announcementRepository.save(a);
    }

    public void deactivate(Long id) {
        announcementRepository.findById(id).ifPresent(a -> {
            a.setActive(false);
            announcementRepository.save(a);
        });
    }

    public void delete(Long id) {
        announcementRepository.deleteById(id);
    }
}
