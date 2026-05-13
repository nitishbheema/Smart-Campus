package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    long countByEventId(Long eventId);
    List<Registration> findByEventId(Long eventId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Registration r WHERE r.userId = :userId AND r.eventId = :eventId")
    void deleteByUserIdAndEventId(Long userId, Long eventId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Registration r WHERE r.eventId = :eventId")
    void deleteByEventId(Long eventId);
}
