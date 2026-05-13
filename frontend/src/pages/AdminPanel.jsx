import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchEvents, createEvent, updateEvent, deleteEvent,
  fetchAllAnnouncements, createAnnouncement, deleteAnnouncement, deactivateAnnouncement,
  fetchAnalytics, broadcastNotification,
} from '../api/api'
import Toast from '../components/Toast'
import {
  ShieldCheck, Plus, Trash2, CalendarDays, Loader2, X, Pencil, Save,
  Megaphone, BarChart3, Bell, TrendingUp, Users, LayoutDashboard,
  CheckCircle2, XCircle, Send,
} from 'lucide-react'

const DEPARTMENTS = ['Computer Science','Electronics','Mechanical','Civil','Business','Arts','Sciences','Other']
const TYPES       = ['Workshop','Seminar','Sports','Cultural','Technical','Other']
const emptyForm   = { title:'', description:'', date:'', department:'Computer Science', type:'Workshop', venue:'', time:'', maxCapacity:'', organizer:'', tags:'' }

const TABS = [
  { id:'events',       label:'Events',        icon: CalendarDays },
  { id:'analytics',    label:'Analytics',     icon: BarChart3 },
  { id:'announcements',label:'Announcements', icon: Megaphone },
  { id:'broadcast',    label:'Broadcast',     icon: Bell },
]

export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab]                   = useState('events')
  const [events, setEvents]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [form, setForm]                 = useState(emptyForm)
  const [submitting, setSubmitting]     = useState(false)
  const [toast, setToast]               = useState(null)
  const [showForm, setShowForm]         = useState(false)
  const [editingId, setEditingId]       = useState(null)
  // Announcements
  const [announcements, setAnnouncements] = useState([])
  const [annMsg, setAnnMsg]             = useState('')
  const [annType, setAnnType]           = useState('INFO')
  const [annSubmitting, setAnnSubmitting] = useState(false)
  // Analytics
  const [analytics, setAnalytics]       = useState(null)
  // Broadcast
  const [bcastMsg, setBcastMsg]         = useState('')
  const [bcastType, setBcastType]       = useState('INFO')
  const [bcastSending, setBcastSending] = useState(false)
  // Users (Owner Only)
  const [usersList, setUsersList]       = useState([])
  const [usersLoading, setUsersLoading] = useState(false)

  const activeTabs = user?.role === 'OWNER' ? [...TABS, { id:'users', label:'Users', icon: Users }] : TABS;

  const showToast = (msg, type='success') => { setToast({message:msg,type}); setTimeout(()=>setToast(null),3500) }

  const load = () => {
    setLoading(true)
    fetchEvents().then(r=>setEvents(r.data)).catch(()=>showToast('Failed to load events','error')).finally(()=>setLoading(false))
  }
  const loadAnnouncements = () => fetchAllAnnouncements().then(r=>setAnnouncements(r.data)).catch(()=>{})
  const loadAnalytics     = () => fetchAnalytics().then(r=>setAnalytics(r.data)).catch(()=>{})
  const loadUsers         = async () => {
    if (user?.role !== 'OWNER') return;
    setUsersLoading(true);
    import('../api/api').then(m => m.fetchUsers(user.id).then(r=>setUsersList(r.data)).catch(()=>{}).finally(()=>setUsersLoading(false)));
  }

  useEffect(()=>{ load() },[])
  useEffect(()=>{ if(tab==='announcements') loadAnnouncements() },[tab])
  useEffect(()=>{ if(tab==='analytics') loadAnalytics() },[tab])
  useEffect(()=>{ if(tab==='users') loadUsers() },[tab])

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true) }
  const openEdit   = (e) => { setEditingId(e.id); setForm({ title:e.title||'', description:e.description||'', date:e.date||'', department:e.department||'Computer Science', type:e.type||'Workshop', venue:e.venue||'', time:e.time||'', maxCapacity:e.maxCapacity||'', organizer:e.organizer||'', tags:e.tags||'' }); setShowForm(true) }
  const closeForm  = () => { setShowForm(false); setEditingId(null); setForm(emptyForm) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return showToast('Title is required','error')
    setSubmitting(true)
    try {
      const payload = { ...form, maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null, adminId: user.id }
      if (editingId) {
        const res = await updateEvent(editingId, payload, user.id)
        setEvents(prev=>prev.map(ev=>ev.id===editingId?res.data:ev))
        showToast(`Event "${res.data.title}" updated! ✏️`)
      } else {
        const res = await createEvent(payload)
        setEvents(prev=>[...prev, res.data])
        showToast(`Event "${res.data.title}" created! 🎉`)
      }
      closeForm()
    } catch(err) {
      showToast(err.response?.data?.error||'Failed to save event','error')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    try { await deleteEvent(id, user.id); setEvents(prev=>prev.filter(e=>e.id!==id)); showToast('Event deleted') }
    catch { showToast('Failed to delete event','error') }
  }

  const handleAnnounce = async (e) => {
    e.preventDefault()
    if (!annMsg.trim()) return showToast('Message required','error')
    setAnnSubmitting(true)
    try {
      await createAnnouncement({ message:annMsg, type:annType, createdBy:user?.username })
      showToast('Announcement published! 📢')
      setAnnMsg(''); loadAnnouncements()
    } catch { showToast('Failed to publish','error') }
    finally { setAnnSubmitting(false) }
  }

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!bcastMsg.trim()) return showToast('Message required','error')
    setBcastSending(true)
    try {
      await broadcastNotification({ message:bcastMsg, type:bcastType })
      showToast('Notification sent to all users! 🔔')
      setBcastMsg('')
    } catch { showToast('Failed to send','error') }
    finally { setBcastSending(false) }
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'OWNER') return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="glass-card p-10">
        <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-200 mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm">You need Admin privileges to access this panel.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent-400" /> Admin Panel
          </h1>
          <p className="section-subtitle flex items-center gap-2">
            <span>{events.length} events · Full control</span>
            <span className="bg-slate-800 text-brand-300 px-2 py-0.5 rounded text-xs border border-brand-500/30">
              Your Admin ID: <strong>{user.id}</strong>
            </span>
          </p>
        </div>
        {tab==='events' && (
          <button id="btn-toggle-form" onClick={showForm?closeForm:openCreate}
            className={showForm?'flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-800/50 transition-all font-medium text-sm':'btn-accent flex items-center gap-2'}>
            {showForm?<><X className="w-4 h-4"/>Cancel</>:<><Plus className="w-4 h-4"/>Add Event</>}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 mb-7 overflow-x-auto">
        {activeTabs.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${tab===id?'bg-slate-700 text-slate-100 shadow-sm':'text-slate-500 hover:text-slate-300'}`}>
            <Icon className="w-4 h-4"/>{label}
          </button>
        ))}
      </div>

      {/* ── EVENTS TAB ─────────────────────────────────────────────────── */}
      {tab==='events' && (
        <>
          {showForm && (
            <div className="glass-card p-6 mb-8 animate-slide-up border border-brand-500/20">
              <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
                {editingId?<><Pencil className="w-5 h-5 text-accent-400"/>Edit Event</>:<><Plus className="w-5 h-5 text-brand-400"/>New Event</>}
              </h2>
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Event Title *</label>
                  <input id="input-event-title" type="text" className="glass-input w-full" placeholder="e.g. Python Workshop 2025"
                    value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                  <textarea id="input-event-desc" className="glass-input w-full resize-none" rows={3}
                    placeholder="Describe the event..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                  <input type="date" className="glass-input w-full" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Time</label>
                  <input type="time" className="glass-input w-full" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Venue</label>
                  <input type="text" className="glass-input w-full" placeholder="e.g. Auditorium A"
                    value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Capacity</label>
                  <input type="number" className="glass-input w-full" placeholder="Leave blank for unlimited"
                    value={form.maxCapacity} onChange={e=>setForm({...form,maxCapacity:e.target.value})} min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
                  <select className="glass-input w-full" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
                    {DEPARTMENTS.map(d=><option key={d} value={d} className="bg-slate-900">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Event Type</label>
                  <select className="glass-input w-full" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    {TYPES.map(t=><option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Organizer</label>
                  <input type="text" className="glass-input w-full" placeholder="e.g. CS Department"
                    value={form.organizer} onChange={e=>setForm({...form,organizer:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags (comma-separated)</label>
                  <input type="text" className="glass-input w-full" placeholder="e.g. python, coding, ai"
                    value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
                </div>
                <div className="flex items-end gap-3 sm:col-span-2">
                  <button id="btn-save-event" type="submit" disabled={submitting}
                    className="btn-primary flex items-center gap-2 flex-1 justify-center">
                    {submitting?<Loader2 className="w-4 h-4 animate-spin"/>:editingId?<Save className="w-4 h-4"/>:<Plus className="w-4 h-4"/>}
                    {submitting?'Saving...':editingId?'Save Changes':'Create Event'}
                  </button>
                  <button type="button" onClick={closeForm}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all text-sm font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">All Events</h2>
              <span className="text-xs text-slate-500">{events.length} total</span>
            </div>
            {loading?(
              <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-brand-500"/></div>
            ):events.length===0?(
              <div className="py-16 text-center">
                <CalendarDays className="w-14 h-14 text-slate-700 mx-auto mb-3"/>
                <p className="text-slate-400 font-medium">No events yet</p>
                <button onClick={openCreate} className="text-brand-400 hover:text-brand-300 text-sm mt-2">+ Create the first event</button>
              </div>
            ):(
              <div className="divide-y divide-slate-800/60">
                {events.map(event=>(
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-slate-800/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-100 truncate">{event.title}</span>
                        <span className="badge badge-type">{event.type}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        {event.date&&<span>📅 {event.date}</span>}
                        {event.time&&<span>🕐 {event.time}</span>}
                        {event.venue&&<span>📍 {event.venue}</span>}
                        {event.department&&<span>🏛 {event.department}</span>}
                        {event.maxCapacity&&<span>👥 Max {event.maxCapacity}</span>}
                      </div>
                    </div>
                    {(user.role === 'OWNER' || event.adminId === user.id) && (
                      <div className="flex items-center gap-2 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button id={`btn-edit-${event.id}`} onClick={()=>openEdit(event)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white text-xs font-medium transition-all active:scale-95">
                          <Pencil className="w-3.5 h-3.5"/>Edit
                        </button>
                        <button id={`btn-delete-${event.id}`} onClick={()=>handleDelete(event.id,event.title)}
                          className="btn-danger flex items-center gap-1.5 text-xs py-1.5">
                          <Trash2 className="w-3.5 h-3.5"/>Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ANALYTICS TAB ──────────────────────────────────────────────── */}
      {tab==='analytics' && (
        <div className="space-y-6">
          {!analytics?(
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500"/></div>
          ):(
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="glass-card-sm p-5">
                  <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center mb-3">
                    <CalendarDays className="w-5 h-5 text-brand-400"/>
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mb-0.5">{analytics.totalEvents}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Events</div>
                </div>
                <div className="glass-card-sm p-5">
                  <div className="w-10 h-10 bg-accent-500/10 rounded-xl flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-accent-400"/>
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mb-0.5">{analytics.totalUsers}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Users</div>
                </div>
                <div className="glass-card-sm p-5 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5 text-green-400"/>
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mb-0.5">{analytics.totalRegistrations}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Registrations</div>
                </div>
              </div>

              {/* Event-wise registrations */}
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60">
                  <h2 className="font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-accent-400"/>Registration Stats per Event
                  </h2>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {analytics.eventStats?.length===0 && (
                    <div className="py-10 text-center text-slate-500 text-sm">No events yet</div>
                  )}
                  {analytics.eventStats?.map(stat=>{
                    const pct = stat.capacity ? Math.min(100, Math.round((stat.registrations/stat.capacity)*100)) : null
                    return (
                      <div key={stat.eventId} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-slate-200 text-sm">{stat.title}</span>
                            <span className="ml-2 text-xs text-slate-500">{stat.type} · {stat.department}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-300">
                            {stat.registrations}{stat.capacity?` / ${stat.capacity}`:''}
                          </span>
                        </div>
                        {stat.capacity&&(
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pct>=100?'bg-red-500':pct>=80?'bg-amber-500':'bg-brand-500'}`}
                              style={{width:`${pct}%`}}/>
                          </div>
                        )}
                        {!stat.capacity&&stat.registrations>0&&(
                          <div className="h-1.5 bg-brand-500/30 rounded-full"/>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ANNOUNCEMENTS TAB ──────────────────────────────────────────── */}
      {tab==='announcements' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-accent-400"/>Post Announcement
            </h2>
            <form onSubmit={handleAnnounce} className="space-y-4">
              <textarea className="input-field resize-none" rows={3}
                placeholder="Write your announcement here..." value={annMsg}
                onChange={e=>setAnnMsg(e.target.value)} />
              <div className="flex gap-3">
                <select className="input-field flex-1" value={annType} onChange={e=>setAnnType(e.target.value)}>
                  <option value="INFO">ℹ️ Info</option>
                  <option value="SUCCESS">✅ Success</option>
                  <option value="WARNING">⚠️ Warning</option>
                  <option value="DANGER">🚨 Danger</option>
                </select>
                <button type="submit" disabled={annSubmitting}
                  className="btn-accent flex items-center gap-2 px-6">
                  {annSubmitting?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
                  Publish
                </button>
              </div>
            </form>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/60">
              <h2 className="font-bold text-slate-100">All Announcements</h2>
            </div>
            {announcements.length===0?(
              <div className="py-10 text-center text-slate-500 text-sm">No announcements yet</div>
            ):(
              <div className="divide-y divide-slate-800/50">
                {announcements.map(a=>(
                  <div key={a.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border
                          ${a.type==='INFO'?'bg-brand-500/10 text-brand-300 border-brand-500/30':
                            a.type==='SUCCESS'?'bg-green-500/10 text-green-300 border-green-500/30':
                            a.type==='WARNING'?'bg-amber-500/10 text-amber-300 border-amber-500/30':
                            'bg-red-500/10 text-red-300 border-red-500/30'}`}>{a.type}</span>
                        {a.active?(
                          <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>Active</span>
                        ):(
                          <span className="text-xs text-slate-500 flex items-center gap-1"><XCircle className="w-3 h-3"/>Inactive</span>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm">{a.message}</p>
                      <p className="text-xs text-slate-600 mt-1">By {a.createdBy}</p>
                    </div>
                    <div className="flex gap-2">
                      {a.active&&(
                        <button onClick={()=>deactivateAnnouncement(a.id).then(loadAnnouncements)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 transition-all">
                          Deactivate
                        </button>
                      )}
                      <button onClick={()=>deleteAnnouncement(a.id).then(loadAnnouncements)}
                        className="btn-danger text-xs py-1.5 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BROADCAST TAB ──────────────────────────────────────────────── */}
      {tab==='broadcast' && (
        <div className="max-w-2xl">
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
                <Bell className="w-6 h-6 text-accent-400"/>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Broadcast Notification</h2>
                <p className="text-sm text-slate-400">Send a push notification to all registered users</p>
              </div>
            </div>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notification Type</label>
                <select className="input-field" value={bcastType} onChange={e=>setBcastType(e.target.value)}>
                  <option value="INFO">ℹ️ Info</option>
                  <option value="SUCCESS">✅ Success</option>
                  <option value="WARNING">⚠️ Warning</option>
                  <option value="EVENT">📅 Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
                <textarea className="input-field resize-none" rows={4}
                  placeholder="Write your notification message here..."
                  value={bcastMsg} onChange={e=>setBcastMsg(e.target.value)} />
              </div>
              <button type="submit" disabled={bcastSending}
                className="btn-accent w-full flex items-center justify-center gap-2 py-3">
                {bcastSending?<Loader2 className="w-5 h-5 animate-spin"/>:<Send className="w-5 h-5"/>}
                {bcastSending?'Sending...':'Send to All Users'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── USERS TAB (OWNER ONLY) ─────────────────────────────────────── */}
      {tab==='users' && user?.role==='OWNER' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60">
            <h2 className="font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400"/>System Users
            </h2>
          </div>
          {usersLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-brand-500"/></div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {usersList.length === 0 && <div className="py-10 text-center text-slate-500">No users found</div>}
              {usersList.map(u => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{u.username}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${u.role==='OWNER'?'bg-red-500/10 text-red-400 border-red-500/30':u.role==='ADMIN'?'bg-brand-500/10 text-brand-400 border-brand-500/30':'bg-slate-700 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>ID: {u.id}</span>
                      <span>📧 {u.email}</span>
                      <span>📞 {u.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
