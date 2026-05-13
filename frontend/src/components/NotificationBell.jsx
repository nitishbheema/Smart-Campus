import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { Bell, X, CheckCheck, Trash2, CalendarDays, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const typeConfig = {
  SUCCESS: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  INFO:    { icon: Info,         color: 'text-brand-400',  bg: 'bg-brand-500/10',  border: 'border-brand-500/20' },
  WARNING: { icon: AlertTriangle,color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  EVENT:   { icon: CalendarDays, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
}

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAll, remove } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = (notif) => {
    if (!notif.read) markRead(notif.id)
    if (notif.eventId) navigate('/events')
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        id="btn-notifications"
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl
                   text-slate-400 hover:text-slate-200 hover:bg-slate-800/60
                   transition-all duration-200 border border-transparent hover:border-slate-700/50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                           bg-accent-500 text-white text-[10px] font-bold rounded-full
                           flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-96 max-h-[520px] flex flex-col
                        bg-slate-900/95 backdrop-blur-xl border border-slate-700/60
                        rounded-2xl shadow-2xl shadow-black/60 z-[100] animate-slide-up overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-400" />
              <span className="font-semibold text-slate-100 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-accent-500 text-white text-[10px] font-bold
                                 rounded-full px-1.5 py-0.5">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAll}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300
                             px-2 py-1 rounded-lg hover:bg-brand-500/10 transition-all"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Bell className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const cfg = typeConfig[notif.type] || typeConfig.INFO
                const Icon = cfg.icon
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer
                                border-b border-slate-800/40 last:border-0 group
                                hover:bg-slate-800/40 transition-colors
                                ${!notif.read ? 'bg-slate-800/20' : ''}`}
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-0.5 relative">
                      <div className={`w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border}
                                      flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      {!notif.read && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5
                                         bg-accent-500 rounded-full border-2 border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${notif.read ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                        {notif.message}
                      </p>
                      <span className="text-[11px] text-slate-600 mt-0.5 block">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); remove(notif.id) }}
                      className="opacity-0 group-hover:opacity-100 text-slate-600
                                 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
