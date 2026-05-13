package com.campus.eventmanagement.dto;

public class RegisterRequest {
    private String username;
    private String password;
    private String role;
    private String email;
    private String phone;
    private String otp;

    public RegisterRequest() {}
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getRole()     { return role; }
    public String getEmail()    { return email; }
    public String getPhone()    { return phone; }
    public String getOtp()      { return otp; }

    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role)         { this.role = role; }
    public void setEmail(String email)       { this.email = email; }
    public void setPhone(String phone)       { this.phone = phone; }
    public void setOtp(String otp)           { this.otp = otp; }
}
