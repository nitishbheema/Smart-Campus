package com.campus.eventmanagement.dto;

public class RegistrationRequest {
    private Long userId;
    private Long eventId;
    private String email;
    private String phone;
    private String otp;

    public RegistrationRequest() {}

    public Long getUserId()  { return userId; }
    public void setUserId(Long userId)   { this.userId = userId; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
