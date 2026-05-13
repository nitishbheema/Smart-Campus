import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser   = (data) => API.post('/auth/register', data)
export const loginUser      = (data) => API.post('/auth/login', data)
export const fetchUsers     = (uid)  => API.get(`/auth/users?userId=${uid}`)

// ── Events ───────────────────────────────────────────────────────────────────
export const fetchEvents    = ()          => API.get('/events')
export const createEvent    = (data)      => API.post('/events', data)
export const updateEvent    = (id, data, uid) => API.put(`/events/${id}?userId=${uid}`, data)
export const deleteEvent    = (id, uid)       => API.delete(`/events/${id}?userId=${uid}`)
export const fetchAnalytics = ()          => API.get('/events/analytics')

// ── Registrations ─────────────────────────────────────────────────────────────
export const registerEvent    = (data)       => API.post('/register-event', data)
export const unregisterEvent  = (data)       => API.delete('/unregister-event', { data })
export const fetchMyEvents    = (uid)        => API.get(`/my-events/${uid}`)
export const fetchRegCount    = (eventId)    => API.get(`/events/${eventId}/registration-count`)

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchNotifications   = (uid)       => API.get(`/notifications/${uid}`)
export const fetchUnreadCount     = (uid)       => API.get(`/notifications/${uid}/unread-count`)
export const markAllRead          = (uid)       => API.put(`/notifications/${uid}/mark-all-read`)
export const markNotificationRead = (id)        => API.put(`/notifications/read/${id}`)
export const broadcastNotification = (data)     => API.post('/notifications/broadcast', data)
export const deleteNotification   = (id)        => API.delete(`/notifications/${id}`)

// ── OTP & Alerts ─────────────────────────────────────────────────────────────
export const sendOTPEmail         = (data)      => API.post('/notifications/otp/send/email', data)
export const sendOTPWhatsApp      = (data)      => API.post('/notifications/otp/send/whatsapp', data)
export const verifyOTP            = (data)      => API.post('/notifications/otp/verify', data)

// ── Announcements ─────────────────────────────────────────────────────────────
export const fetchActiveAnnouncements = ()      => API.get('/announcements/active')
export const fetchAllAnnouncements    = ()      => API.get('/announcements')
export const createAnnouncement       = (data)  => API.post('/announcements', data)
export const deactivateAnnouncement   = (id)    => API.put(`/announcements/${id}/deactivate`)
export const deleteAnnouncement       = (id)    => API.delete(`/announcements/${id}`)

export default API
