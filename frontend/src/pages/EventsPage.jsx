import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchEvents, registerEvent, fetchMyEvents, deleteEvent, unregisterEvent } from '../api/api'
import EventCard from '../components/EventCard'
import Toast from '../components/Toast'
import EventDetailModal from '../components/EventDetailModal'
import { Search, Filter, CalendarDays, Loader2, LayoutGrid, List, SlidersHorizontal } from 'lucide-react'

const TYPES = ['All', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Other']

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents]           = useState([])
  const [myEventIds, setMyEventIds]   = useState(new Set())
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState(null)
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState('All')
  const [filterDept, setFilterDept]   = useState('All')
  const [filterAdmin, setFilterAdmin] = useState('')
  const [viewMode, setViewMode]       = useState('grid') // 'grid' | 'list'
  const [selectedEvent, setSelectedEvent] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [evRes, myRes] = await Promise.all([
        fetchEvents(),
        user?.role === 'STUDENT' ? fetchMyEvents(user.id) : Promise.resolve({ data: [] }),
      ])
      setEvents(evRes.data)
      setMyEventIds(new Set(myRes.data.map(e => e.id)))
    } catch {
      showToast('Failed to load events', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user])

  const handleRegister = async (eventId, email, phone, otp) => {
    try {
      await registerEvent({ userId: user.id, eventId, email, phone, otp })
      setMyEventIds(prev => new Set([...prev, eventId]))
      showToast('Successfully registered for the event! 🎉')
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed', 'error')
    }
  }

  const handleUnregister = async (eventId) => {
    try {
      await unregisterEvent({ userId: user.id, eventId })
      setMyEventIds(prev => { const s = new Set(prev); s.delete(eventId); return s })
      showToast('Registration cancelled successfully')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to unregister', 'error')
    }
  }

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await deleteEvent(eventId)
      setEvents(prev => prev.filter(e => e.id !== eventId))
      showToast('Event deleted successfully')
    } catch {
      showToast('Failed to delete event', 'error')
    }
  }

  const depts = ['All', ...new Set(events.map(e => e.department).filter(Boolean))]

  const filtered = events.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase()) ||
                        e.description?.toLowerCase().includes(search.toLowerCase()) ||
                        e.tags?.toLowerCase().includes(search.toLowerCase())
    const matchType   = filterType === 'All' || e.type === filterType
    const matchDept   = filterDept === 'All' || e.department === filterDept
    const matchAdmin  = !filterAdmin || e.adminId === Number(filterAdmin)
    return matchSearch && matchType && matchDept && matchAdmin
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isRegistered={myEventIds.has(selectedEvent.id)}
          onRegister={async (id, email, phone, otp) => { await handleRegister(id, email, phone, otp); setSelectedEvent(null) }}
          onUnregister={async (id) => { await handleUnregister(id); setSelectedEvent(null) }}
          isAdmin={user?.role === 'ADMIN'}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">All Events</h1>
          <p className="section-subtitle">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <List className="w-4 h-4" /> List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="search-events"
            type="text"
            placeholder="Search events, tags..."
            className="input-field pl-9 py-2.5"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <select
              id="filter-type"
              className="input-field pl-8 py-2.5 pr-8 text-sm min-w-[120px]"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <select
            id="filter-dept"
            className="input-field py-2.5 px-3 text-sm min-w-[130px]"
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input
            id="filter-admin"
            type="number"
            placeholder="Admin ID"
            className="input-field py-2.5 px-3 text-sm w-[100px]"
            value={filterAdmin}
            onChange={e => setFilterAdmin(e.target.value)}
          />
        </div>
      </div>

      {/* Event Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-1">No events found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isAdmin={user?.role === 'ADMIN'}
              isRegistered={myEventIds.has(event.id)}
              onRegister={handleRegister}
              onDelete={handleDelete}
              onViewDetail={setSelectedEvent}
            />
          ))}
        </div>
      ) : (
        // List view
        <div className="glass-card divide-y divide-slate-800/60 overflow-hidden">
          {filtered.map(event => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="flex items-center justify-between gap-4 px-5 py-4
                         hover:bg-slate-800/30 transition-colors cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-slate-100 text-sm">{event.title}</span>
                  <span className="badge badge-type">{event.type}</span>
                  {myEventIds.has(event.id) && (
                    <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20
                                     px-1.5 py-0.5 rounded-full font-semibold">✓ Registered</span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  {event.date && <span>📅 {event.date}</span>}
                  {event.venue && <span>📍 {event.venue}</span>}
                  {event.department && <span>🏛 {event.department}</span>}
                </div>
              </div>
              <div className="text-slate-600 group-hover:text-slate-400 transition-colors text-xs">
                View →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
