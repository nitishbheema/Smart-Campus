import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser, sendOTPEmail, sendOTPWhatsApp } from '../api/api'
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Phone, KeyRound, User } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', password: '', role: 'STUDENT', email: '', phone: '', otp: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSendOTP = async (type) => {
    if (type === 'email' && (!form.email || !form.email.includes('@'))) {
      setError('Please enter a valid email address.')
      return
    }
    if (type === 'phone' && (!form.phone || form.phone.length < 10)) {
      setError('Please enter a valid phone number.')
      return
    }
    
    setError('')
    setSendingOtp(true)
    try {
      if (type === 'email') {
        await sendOTPEmail({ email: form.email })
      } else {
        await sendOTPWhatsApp({ phone: form.phone })
      }
      setOtpSent(true)
    } catch (err) {
      setError(`Failed to send OTP to ${type}. Try again.`)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        const res = await loginUser({ username: form.username, password: form.password })
        login(res.data.user)
        navigate('/dashboard')
      } else {
        await registerUser(form)
        setIsLogin(true)
        setForm({ username: '', password: '', role: 'STUDENT', email: '', phone: '', otp: '' })
        setOtpSent(false)
        setError('')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      {/* Left Side: Simplified Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-slate-900 to-slate-950"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-brand-500 rounded-full blur-[120px]" />
           <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-accent-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-20 w-full">
          <div className="w-16 h-16 rounded-3xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-8">
            <GraduationCap className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="text-6xl font-black text-white leading-tight mb-4 tracking-tighter">
            CAMPUS <br />
            <span className="text-gradient">PORTAL.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-md leading-relaxed">
            The intelligent hub for academic events and campus engagements.
          </p>
          
          <div className="mt-12 flex gap-8">
            <div className="glass-card-sm px-6 py-4 border-white/5">
              <p className="text-white font-bold text-2xl tracking-tight">Active</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Status</p>
            </div>
            <div className="glass-card-sm px-6 py-4 border-white/5">
              <p className="text-white font-bold text-2xl tracking-tight">Secure</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
             <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-xl mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gradient tracking-tight">CampusHub</h2>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join the Community'}
            </h2>
            <p className="text-slate-400 font-medium">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Create an account to start exploring campus events'}
            </p>
          </div>

          {/* Form */}
          <div className="glass-card p-1 sm:p-2 mb-8 border-white/5">
            <div className="flex p-1.5 bg-slate-900/50 rounded-2xl">
              <button
                onClick={() => { setIsLogin(true); setError('') }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isLogin ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError('') }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  !isLogin ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="input-label">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  className="glass-input w-full pl-11"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="input-label">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="glass-input w-full pl-11 pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-5 animate-slide-up">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="input-label">I am a...</label>
                    <select
                      className="glass-input w-full appearance-none"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="input-label">Phone</label>
                    <input
                      type="tel"
                      className="glass-input w-full"
                      placeholder="+91..."
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="glass-input w-full"
                    placeholder="name@university.edu"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={otpSent}
                  />
                </div>

                {!otpSent ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => handleSendOTP('email')} disabled={sendingOtp}
                            className="btn-secondary text-xs py-3 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> Email OTP
                    </button>
                    <button type="button" onClick={() => handleSendOTP('phone')} disabled={sendingOtp}
                            className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> WhatsApp OTP
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="input-label text-brand-400">Verification Code</label>
                      <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Change Info</button>
                    </div>
                    <div className="flex justify-between gap-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          className="w-12 h-14 bg-slate-900/50 border border-white/10 rounded-xl text-center text-xl font-black text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                          value={form.otp[idx] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!/^\d*$/.test(val)) return;
                            const newOtp = form.otp.split('');
                            newOtp[idx] = val;
                            setForm({ ...form, otp: newOtp.join('') });
                            if (val && idx < 5) document.getElementById(`otp-${idx + 1}`).focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !form.otp[idx] && idx > 0) {
                              document.getElementById(`otp-${idx - 1}`).focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 text-center font-medium">
                      Didn't get the code? Check your WhatsApp Sandbox or spam folder.
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-3">
                <div className="mt-0.5 min-w-[18px]">⚠️</div>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && !otpSent)}
              className="btn-primary w-full py-4 mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In to Hub' : 'Create Account')}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm font-medium">
            {isLogin ? "Don't have an account?" : "Already a member?"} {' '}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-brand-400 hover:text-brand-300 font-bold hover:underline"
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
