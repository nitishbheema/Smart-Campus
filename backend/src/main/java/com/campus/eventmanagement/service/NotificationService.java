package com.campus.eventmanagement.service;

import com.campus.eventmanagement.model.Notification;
import com.campus.eventmanagement.repository.NotificationRepository;
import com.campus.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /** Get all notifications for a user */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** Get unread count for a user */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /** Mark all notifications as read for a user */
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    /** Mark a single notification as read */
    public void markRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    /** Create a notification for a specific user */
    public Notification createForUser(Long userId, String message, String type, Long eventId) {
        Notification n = new Notification(userId, message, type, eventId);
        return notificationRepository.save(n);
    }

    /** Broadcast a notification to ALL users in the system */
    public void broadcastToAll(String message, String type, Long eventId) {
        userRepository.findAll().forEach(user -> {
            Notification n = new Notification(user.getId(), message, type, eventId);
            notificationRepository.save(n);
        });
    }

    /** Delete a notification */
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }
}
