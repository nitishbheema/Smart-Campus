import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchRegCount, sendOTPEmail, sendOTPWhatsApp } from '../api/api'
import {
  X, CalendarDays, MapPin, Clock, Users, Tag, BookOpen,
  UserCheck, Building2, Sparkles, CheckCircle2, AlertCircle, Mail, Phone, KeyRound
} from 'lucide-react'

const typeColors = {
  Workshop:  'bg-brand-500/15 text-brand-300 border-brand-500/30',
  Seminar:   'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Sports:    'bg-green-500/15 text-green-300 border-green-500/30',
  Cultural:  'bg-pink-500/15 text-pink-300 border-pink-500/30',
  Technical: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
  Other:     'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

export default function EventDetailModal({
  event, onClose, isRegistered, onRegister, onUnregister, isAdmin
}) {
  const { user } = useAuth()
  const [regCount, setRegCount]   = useState(null)
  const [loading, setLoading]     = useState(false)
  
  // Registration Form State
  const [showRegForm, setShowRegForm] = useState(false)
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [regError, setRegError] = useState('')

  useEffect(() => {
    if (!event) return
    fetchRegCount(event.id)
      .then(res => setRegCount(res.data.count))
      .catch(() => {})
    // Prevent scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [event])

  if (!event) return null

  const typeColor = typeColors[event.type] || typeColors.Other
  const spotsLeft = event.maxCapacity ? event.maxCapacity - (regCount ?? 0) : null
  const isFull = spotsLeft !== null && spotsLeft <= 0

  const handleSendOTP = async (type) => {
    if (type === 'email' && (!email || !email.includes('@'))) {
      setRegError('Please enter a valid email address.')
      return
    }
    if (type === 'phone' && (!phone || phone.length < 10)) {
      setRegError('Please enter a valid phone number.')
      return
    }

    setRegError('')
    setSendingOtp(true)
    try {
      if (type === 'email') {
        await sendOTPEmail({ email })
      } else {
        await sendOTPWhatsApp({ phone })
      }
      setOtpSent(true)
    } catch (err) {
      setRegError(`Failed to send OTP to ${type}. Try again.`)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleAction = async () => {
    if (isRegistered) {
      setLoading(true)
      try {
        await onUnregister(event.id)
      } finally {
        setLoading(false)
      }
    } else {
      // Must be showing form and have all fields
      if (!email || !phone || !otp) {
        setRegError('Please fill all fields and OTP.')
        return
      }
      setLoading(true)
      try {
        await onRegister(event.id, email, phone, otp)
        setShowRegForm(false)
      } catch (err) {
        setRegError(err.response?.data?.error || 'Registration failed')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl
                      w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-brand-900/40 via-slate-900 to-accent-900/20
                        p-6 border-b border-slate-800/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeColor}`}>
                  {event.type}
                </span>
                {isRegistered && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full
                                   bg-green-500/15 text-green-300 border border-green-500/30
                                   flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Registered
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-100 leading-tight">{event.title}</h2>
              {event.organizer && (
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                  Organized by <span className="text-slate-300">{event.organizer}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-xl text-slate-500 hover:text-white
                         hover:bg-slate-800/60 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Quick info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {event.date && (
              <InfoChip icon={CalendarDays} label="Date" value={event.date} />
            )}
            {event.time && (
              <InfoChip icon={Clock} label="Time" value={event.time} />
            )}
            {event.venue && (
              <InfoChip icon={MapPin} label="Venue" value={event.venue} />
            )}
            {event.department && (
              <InfoChip icon={Building2} label="Dept" value={event.department} />
            )}
          </div>

          {/* Capacity bar */}
          {event.maxCapacity && regCount !== null && (
            <div className="glass-card-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-400" /> Capacity
                </span>
                <span className={`text-sm font-bold ${isFull ? 'text-red-400' : 'text-green-400'}`}>
                  {regCount} / {event.maxCapacity}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFull ? 'bg-red-500' :
                    spotsLeft <= event.maxCapacity * 0.2 ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${Math.min(100, (regCount / event.maxCapacity) * 100)}%` }}
                />
              </div>
              {isFull ? (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Event is full
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1.5">{spotsLeft} spots remaining</p>
              )}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-accent-400" /> About
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {event.tags && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-400" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-slate-800 rounded-full
                                             text-slate-400 border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {user?.role === 'STUDENT' && (
          <div className="p-5 border-t border-slate-800/60 flex flex-col gap-3">
            {isRegistered ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm
                             bg-red-500/10 border border-red-500/30 text-red-400
                             hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Cancel Registration'}
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-700
                                                      text-slate-400 hover:text-white hover:bg-slate-800/50
                                                      text-sm font-medium transition-all">
                  Close
                </button>
              </div>
            ) : showRegForm ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 animate-fade-in space-y-4">
                <h4 className="text-sm font-semibold text-slate-200">Registration Details</h4>
                {regError && <p className="text-xs text-red-400">{regError}</p>}
                
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <input type="email" placeholder="Email Address" 
                           className="glass-input w-full pl-10 text-sm py-2.5" 
                           value={email} onChange={e => setEmail(e.target.value)}
                           disabled={otpSent} />
                  </div>
                  
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input type="tel" placeholder="Phone Number (+91...)" 
                           className="glass-input w-full pl-10 text-sm py-2.5" 
                           value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>

                  {!otpSent ? (
                    <div className="flex gap-3">
                      <button onClick={() => handleSendOTP('email')} disabled={sendingOtp}
                              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" /> Email OTP
                      </button>
                      <button onClick={() => handleSendOTP('phone')} disabled={sendingOtp}
                              className="flex-1 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" /> WhatsApp OTP
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Verification Code</label>
                        <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Edit</button>
                      </div>
                      <div className="flex justify-between gap-1.5">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <input
                            key={idx}
                            id={`reg-otp-${idx}`}
                            type="text"
                            maxLength={1}
                            className="w-full h-12 bg-slate-900/50 border border-white/10 rounded-lg text-center text-lg font-black text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                            value={otp[idx] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!/^\d*$/.test(val)) return;
                              const newOtp = otp.split('');
                              newOtp[idx] = val;
                              setOtp(newOtp.join(''));
                              if (val && idx < 5) document.getElementById(`reg-otp-${idx + 1}`).focus();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                                document.getElementById(`reg-otp-${idx - 1}`).focus();
                              }
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 text-center font-medium">
                        Send "join glass-cow" to +14155238886 if WhatsApp fails.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAction}
                    disabled={loading || !otpSent || !otp}
                    className="flex-1 py-2 rounded-lg font-semibold text-sm btn-primary
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registering...' : 'Confirm Registration'}
                  </button>
                  <button onClick={() => setShowRegForm(false)} 
                          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRegForm(true)}
                  disabled={loading || isFull}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm
                             flex items-center justify-center gap-2 transition-all
                             ${isFull
                               ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                               : 'btn-primary'}`}
                >
                  <CalendarDays className="w-4 h-4" />
                  {isFull ? 'Event Full' : 'Register Now'}
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-700
                                                      text-slate-400 hover:text-white hover:bg-slate-800/50
                                                      text-sm font-medium transition-all">
                  Close
                </button>
              </div>
            )}
          </div>
        )}
        {isAdmin && (
          <div className="p-5 border-t border-slate-800/60">
            <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-700
                                                   text-slate-400 hover:text-white hover:bg-slate-800/50
                                                   text-sm font-medium transition-all">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <p className="text-slate-200 text-sm font-medium truncate">{value}</p>
    </div>
  )
}
