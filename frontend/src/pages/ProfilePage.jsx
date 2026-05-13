import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchMyEvents, fetchAnalytics } from '../api/api'
import { User, CalendarDays, Ticket, ShieldCheck, GraduationCap, Award, TrendingUp, Clock } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [myEvents, setMyEvents]     = useState([])
  const [analytics, setAnalytics]   = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const promises = [
      user?.role === 'STUDENT' ? fetchMyEvents(user.id) : Promise.resolve({ data: [] }),
      user?.role === 'ADMIN'   ? fetchAnalytics()       : Promise.resolve({ data: null }),
    ]
    Promise.all(promises)
      .then(([myRes, anRes]) => {
        setMyEvents(myRes.data)
        setAnalytics(anRes.data)
      })
      .finally(() => setLoading(false))
  }, [user])

  const avatarLetter = user?.username?.[0]?.toUpperCase() || '?'

  const upcomingEvents = myEvents.filter(e => e.date && new Date(e.date) >= new Date())
  const pastEvents     = myEvents.filter(e => e.date && new Date(e.date) < new Date())

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">

      {/* User Identity Section */}
      <div className="relative glass-card p-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-accent-500/10 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px]" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10 text-center md:text-left">
          {/* Avatar Container */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-indigo-600 p-1 shadow-2xl shadow-brand-900/40">
              <div className="w-full h-full rounded-[2.3rem] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
                {avatarLetter}
              </div>
            </div>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg
                             ${user?.role === 'ADMIN' ? 'bg-accent-500 text-white' : 'bg-brand-500 text-white'}`}>
              {user?.role}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">{user?.username}</h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                {user?.role === 'ADMIN'
                  ? 'System Administrator'
                  : 'Student Ambassador • Active Participant'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-brand-400" />
                </div>
                <span className="text-sm font-bold tracking-wide">University Hub</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-bold tracking-wide">Verified Account</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics / Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user?.role === 'STUDENT' ? (
          <>
            <StatCard icon={Ticket} label="Total Events" value={myEvents.length} color="text-brand-400" bg="bg-brand-500/20" />
            <StatCard icon={CalendarDays} label="Confirmed" value={upcomingEvents.length} color="text-emerald-400" bg="bg-emerald-500/20" />
            <StatCard icon={Clock} label="Past History" value={pastEvents.length} color="text-slate-400" bg="bg-slate-500/20" />
          </>
        ) : analytics && (
          <>
            <StatCard icon={CalendarDays} label="Global Events" value={analytics.totalEvents} color="text-brand-400" bg="bg-brand-500/20" />
            <StatCard icon={User} label="Hub Population" value={analytics.totalUsers} color="text-accent-400" bg="bg-accent-500/20" />
            <StatCard icon={TrendingUp} label="Engagements" value={analytics.totalRegistrations} color="text-emerald-400" bg="bg-emerald-500/20" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Achievements Column */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-black text-white px-2 tracking-tight flex items-center gap-3">
             <Award className="w-6 h-6 text-accent-400" /> Merit System
          </h2>
          <div className="space-y-4">
            {myEvents.length === 0 ? (
              <div className="glass-card p-6 text-center text-slate-500">
                <p className="text-sm font-medium">Unlock achievements by participating in events.</p>
              </div>
            ) : (
              <>
                {myEvents.length >= 1 && <BadgeItem label="Newcomer" icon="🎯" desc="First hub registration" />}
                {myEvents.length >= 3 && <BadgeItem label="Enthusiast" icon="⚡" desc="3+ events attended" />}
                {myEvents.length >= 5 && <BadgeItem label="Hub Explorer" icon="🗺️" desc="5+ events explored" />}
                {myEvents.length >= 10 && <BadgeItem label="Grand Master" icon="🏆" desc="Top tier participant" />}
              </>
            )}
          </div>
        </div>

        {/* Timeline Column */}
        <div className="lg:col-span-2">
           <h2 className="text-xl font-black text-white px-2 tracking-tight mb-6 flex items-center gap-3">
             <Ticket className="w-6 h-6 text-brand-400" /> Event Timeline
          </h2>
          <div className="glass-card overflow-hidden border-white/5">
            {loading ? (
              <div className="p-20 text-center text-slate-500 animate-pulse">Synchronizing...</div>
            ) : myEvents.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <CalendarDays className="w-16 h-16 text-slate-800 mb-4" />
                <p className="text-slate-500 font-bold">Your timeline is empty.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {myEvents.map(event => (
                  <div key={event.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/5 transition-colors group">
                    <div className="space-y-1">
                      <p className="font-bold text-white group-hover:text-brand-400 transition-colors">{event.title}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>📅 {event.date}</span>
                        <span>🏛 {event.department}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge-brand lowercase tracking-normal">{event.type}</span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                                       ${new Date(event.date) >= new Date()
                                         ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                         : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                        {new Date(event.date) >= new Date() ? 'LIVE' : 'ENDED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-1 shadow-inner`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  )
}

function BadgeItem({ label, icon, desc }) {
  return (
    <div className="flex items-center gap-4 p-4 glass-card-sm border-white/5 hover:border-white/20 transition-all group">
      <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300">{icon}</span>
      <div>
        <p className="text-sm font-black text-white tracking-tight group-hover:text-accent-400 transition-colors">{label}</p>
        <p className="text-xs font-medium text-slate-500">{desc}</p>
      </div>
    </div>
  )
}
