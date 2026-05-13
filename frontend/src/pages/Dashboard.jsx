import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchEvents, fetchMyEvents } from '../api/api'
import { CalendarDays, Ticket, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchEvents(),
      user?.role === 'STUDENT' ? fetchMyEvents(user.id) : Promise.resolve({ data: [] }),
    ]).then(([evRes, myRes]) => {
      setEvents(evRes.data)
      setMyEvents(myRes.data)
    }).finally(() => setLoading(false))
  }, [user])

  const upcomingEvents = events.slice(0, 3)

  const stats = [
    {
      label: 'Live Events',
      value: events.length,
      icon: CalendarDays,
      color: 'text-brand-400',
      bg: 'bg-brand-500/20',
    },
    {
      label: user?.role === 'ADMIN' ? 'Manage Hub' : 'My Tickets',
      value: user?.role === 'ADMIN' ? events.length : myEvents.length,
      icon: Ticket,
      color: 'text-accent-400',
      bg: 'bg-accent-500/20',
    },
    {
      label: 'Active Depts',
      value: [...new Set(events.map(e => e.department).filter(Boolean))].length || 0,
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
    },
    {
      label: 'Categories',
      value: [...new Set(events.map(e => e.type).filter(Boolean))].length || 0,
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-500/20',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Hero Section */}
      <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-accent-500/10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
        
        <div className="relative px-8 py-12 sm:px-12 sm:py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em]">Personalized Portal</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
              Welcome back, <br />
              <span className="text-gradient">{user?.username}</span>
            </h1>
            
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed mb-8">
              {user?.role === 'ADMIN'
                ? 'Your central command for campus engagement. Orchestrate events and empower the student community.'
                : 'Your journey through campus life starts here. Explore a world of workshops, seminars, and cultural festivals.'}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link to="/events" className="btn-primary group">
                Browse Events <ArrowRight className="inline-block w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {user?.role === 'ADMIN' ? (
                <Link to="/admin" className="btn-secondary">
                  Open Console
                </Link>
              ) : (
                <Link to="/my-events" className="btn-secondary">
                  View My Tickets
                </Link>
              )}
            </div>
          </div>

          {/* Hero visual removed per user request */}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-1 shadow-inner`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight">
                {loading ? '...' : value}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Spotlight / Upcoming */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Featured Spotlight</h2>
              <p className="text-sm text-slate-500 font-medium tracking-wide">Highly anticipated campus happenings</p>
            </div>
            <Link to="/events" className="text-brand-400 hover:text-brand-300 text-sm font-bold flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-64 glass-card-sm animate-pulse" />)
            ) : upcomingEvents.length === 0 ? (
              <div className="col-span-full py-20 glass-card flex flex-col items-center justify-center text-slate-500">
                <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold tracking-tight">No upcoming events scheduled</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="glass-card-sm p-6 group hover:bg-white/5 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="badge-brand">{event.type}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{event.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-300 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-6">
                    {event.description}
                  </p>
                  <Link to="/events" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                    Learn More →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar / Schedule */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 h-full">
            <h2 className="text-xl font-black text-white mb-6 tracking-tight">Your Schedule</h2>
            {loading ? (
               <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
               </div>
            ) : myEvents.length === 0 ? (
               <div className="text-center py-10">
                  <p className="text-sm text-slate-500 mb-4">No registrations yet.</p>
                  <Link to="/events" className="text-xs font-bold text-brand-400 uppercase tracking-widest hover:underline">
                    Find Events →
                  </Link>
               </div>
            ) : (
               <div className="space-y-4">
                  {myEvents.slice(0, 4).map(ev => (
                    <div key={ev.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="w-5 h-5 text-brand-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{ev.date}</p>
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
