package com.campus.eventmanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(unique = true)
    private String email;

    @Column
    private String phone;

    public User() {}

    public User(Long id, String username, String password, String role, String email, String phone) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.email = email;
        this.phone = phone;
    }

    // Getters
    public Long getId()       { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getRole()     { return role; }
    public String getEmail()    { return email; }
    public String getPhone()    { return phone; }

    // Setters
    public void setId(Long id)               { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role)         { this.role = role; }
    public void setEmail(String email)       { this.email = email; }
    public void setPhone(String phone)       { this.phone = phone; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String username, password, role, email, phone;
        public Builder id(Long id)             { this.id = id; return this; }
        public Builder username(String u)      { this.username = u; return this; }
        public Builder password(String p)      { this.password = p; return this; }
        public Builder role(String r)          { this.role = r; return this; }
        public Builder email(String e)         { this.email = e; return this; }
        public Builder phone(String p)         { this.phone = p; return this; }
        public User build() { return new User(id, username, password, role, email, phone); }
    }
}
