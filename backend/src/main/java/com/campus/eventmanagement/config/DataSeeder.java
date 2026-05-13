package com.campus.eventmanagement.config;

import com.campus.eventmanagement.model.Event;
import com.campus.eventmanagement.model.User;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public DataSeeder(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed users if empty
        if (userRepository.count() == 0) {
            User owner = new User(null, "owner", "owner123", "OWNER", "owner@campus.edu", "9999999990");
            User admin1 = new User(null, "admin1", "admin123", "ADMIN", "admin1@campus.edu", "9999999991");
            userRepository.saveAll(List.of(owner, admin1));
            System.out.println("✅ DataSeeder: Default users (owner, admin1) loaded into database!");
        }

        // Only seed events if DB is empty
        if (eventRepository.count() == 0) {
            Long admin1Id = userRepository.findByUsername("admin1").map(User::getId).orElse(1L);

            List<Event> events = List.of(
                event("Python & AI Workshop", "Hands-on workshop on Python basics and AI/ML fundamentals using scikit-learn and pandas.", "2026-04-27", "Computer Science", "Workshop", admin1Id),
                event("Inter-College Hackathon 2026", "24-hour hackathon open to all departments. Build innovative solutions for real-world problems.", "2026-04-29", "Computer Science", "Technical", admin1Id),
                event("Web Development Bootcamp", "Full-stack web dev bootcamp covering HTML, CSS, React and Node.js over 2 days.", "2026-05-02", "Computer Science", "Workshop", admin1Id),
                event("Cloud Computing Seminar", "Industry experts talk about AWS, Azure, and GCP — career opportunities in cloud.", "2026-05-05", "Electronics", "Seminar", admin1Id),
                event("Robotics Expo 2026", "Student-built robots showcase and live demonstrations. Open to all departments.", "2026-05-08", "Electronics", "Technical", admin1Id),
                event("Campus Football Championship", "Annual inter-department football tournament. Register your team of 11.", "2026-05-12", "Sports", "Sports", admin1Id),
                event("Annual Cultural Fest — Utsav", "2-day cultural extravaganza with dance, music, drama, and art competitions.", "2026-05-15", "Arts", "Cultural", admin1Id),
                event("Entrepreneurship Summit", "Startup pitching event with investor panels and mentorship sessions.", "2026-05-18", "Business", "Seminar", admin1Id),
                event("Data Science & Analytics Talk", "Expert session on data science career paths, tools, and live case studies.", "2026-05-21", "Computer Science", "Seminar", admin1Id),
                event("Mechanical Engineering Expo", "Students present innovative mechanical models and prototypes.", "2026-05-24", "Mechanical", "Technical", admin1Id),
                event("Classical Music Night", "An evening of Carnatic and Hindustani classical music performances by students.", "2026-05-28", "Arts", "Cultural", admin1Id),
                event("Smart Cities Seminar", "Civil engineering students present smart city infrastructure projects.", "2026-05-30", "Civil", "Seminar", admin1Id),
                event("Yoga & Wellness Day", "Campus-wide yoga and mental health awareness day. Open to all students.", "2026-06-02", "Sciences", "Other", admin1Id),
                event("Business Plan Competition", "Present your business idea to a panel of judges and win seed funding.", "2026-06-05", "Business", "Technical", admin1Id),
                event("Cybersecurity Awareness Workshop", "Learn about ethical hacking, network security, and protecting digital identity.", "2026-06-10", "Computer Science", "Workshop", admin1Id),
                event("Photography Exhibition", "Student photography showcase on the theme 'Life on Campus'.", "2026-06-14", "Arts", "Cultural", admin1Id),
                event("Cricket Tournament — Summer Cup", "Inter-department cricket tournament. Teams of 15. Register before May 30.", "2026-06-18", "Sports", "Sports", admin1Id),
                event("VLSI Design Workshop", "Hands-on VLSI and embedded systems design using industry tools.", "2026-06-22", "Electronics", "Workshop", admin1Id),
                event("Environment & Sustainability Talks", "Panel discussion on green technology, climate change, and campus sustainability.", "2026-06-25", "Sciences", "Seminar", admin1Id),
                event("Freshers Welcome Party 2026", "Grand welcome event for new students with games, music, and dinner.", "2026-06-30", "Other", "Cultural", admin1Id)
            );
            eventRepository.saveAll(events);
            System.out.println("✅ DataSeeder: 20 default events loaded into database!");
        } else {
            System.out.println("ℹ️ DataSeeder: Events already exist, skipping seed.");
        }
    }

    private Event event(String title, String desc, String date, String dept, String type, Long adminId) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(desc);
        e.setDate(date);
        e.setDepartment(dept);
        e.setType(type);
        e.setAdminId(adminId);
        return e;
    }
}
