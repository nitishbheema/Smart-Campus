import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchMyEvents, unregisterEvent } from '../api/api'
import Toast from '../components/Toast'
import EventDetailModal from '../components/EventDetailModal'
import { Ticket, CalendarDays, Loader2, ArrowRight, Clock, MapPin, UserMinus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MyEventsPage() {
  const { user } = useAuth()
  const [events, setEvents]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [toast, setToast]             = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [tab, setTab]                 = useState('upcoming') // 'upcoming' | 'past'

  const showToast = (msg, type='success') => { setToast({message:msg,type}); setTimeout(()=>setToast(null),3500) }

  const load = () => {
    fetchMyEvents(user.id)
      .then(res => setEvents(res.data))
      .catch(() => setError('Failed to load your events'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [user])

  const handleUnregister = async (eventId) => {
    try {
      await unregisterEvent({ userId: user.id, eventId })
      setEvents(prev => prev.filter(e => e.id !== eventId))
      showToast('Unregistered successfully')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to unregister', 'error')
    }
  }

  const typeColors = {
    Workshop:  'border-l-purple-500 bg-purple-500/5',
    Seminar:   'border-l-blue-500   bg-blue-500/5',
    Sports:    'border-l-green-500  bg-green-500/5',
    Cultural:  'border-l-pink-500   bg-pink-500/5',
    Technical: 'border-l-cyan-500   bg-cyan-500/5',
    Other:     'border-l-slate-500  bg-slate-500/5',
  }

  const now = new Date()
  const upcoming = events.filter(e => !e.date || new Date(e.date) >= now)
  const past     = events.filter(e => e.date && new Date(e.date) < now)
  const displayed = tab === 'upcoming' ? upcoming : past

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isRegistered={true}
          onRegister={() => {}}
          onUnregister={async (id) => { await handleUnregister(id); setSelectedEvent(null) }}
          isAdmin={false}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Ticket className="w-6 h-6 text-brand-400" /> My Events
          </h1>
          <p className="section-subtitle">Events you've registered for</p>
        </div>
        <Link to="/events" className="btn-ghost border border-slate-700 flex items-center gap-2 text-sm">
          Browse Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
        {[['upcoming','Upcoming',upcoming.length],['past','Past',past.length]].map(([id,label,count])=>(
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab===id?'bg-slate-700 text-slate-100':'text-slate-500 hover:text-slate-300'}`}>
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full
              ${tab===id?'bg-slate-600 text-slate-200':'bg-slate-800 text-slate-500'}`}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center text-red-400">{error}</div>
      ) : events.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Ticket className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No registrations yet</h3>
          <p className="text-slate-500 text-sm mb-6">Browse and join an event!</p>
          <Link to="/events" className="btn-primary inline-flex items-center gap-2">
            Browse Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>No {tab} events.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="glass-card-sm px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Showing <span className="font-bold text-brand-400">{displayed.length}</span> {tab} event{displayed.length !== 1 ? 's' : ''}
            </span>
          </div>

          {displayed.map(event => {
            const borderClass = typeColors[event.type] || typeColors.Other
            const isPast = event.date && new Date(event.date) < now
            return (
              <div key={event.id}
                className={`glass-card-sm border-l-4 ${borderClass} p-5 hover:border-l-brand-500
                            transition-all duration-300 hover:-translate-y-0.5 animate-slide-up`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h2 className="font-bold text-slate-100 text-base">{event.title}</h2>
                      <span className="badge badge-type">{event.type || 'Other'}</span>
                      <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">✓ Registered</span>
                      {isPast && <span className="badge bg-slate-700 text-slate-400 border border-slate-600">Past</span>}
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                      {event.description || 'No description.'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      {event.date && <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-brand-400"/>{event.date}</span>}
                      {event.time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/>{event.time}</span>}
                      {event.venue && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>  {event.venue}</span>}
                      {event.department && <span>🏛 {event.department}</span>}
                    </div>
                  </div>
                  {!isPast && (
                    <button
                      onClick={() => { if (confirm(`Unregister from "${event.title}"?`)) handleUnregister(event.id) }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                                 border border-red-500/30 bg-red-500/10 text-red-400
                                 hover:bg-red-500/20 transition-all flex-shrink-0"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Unregister
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
