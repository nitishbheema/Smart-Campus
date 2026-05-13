import { useState, useEffect } from 'react'
import { fetchActiveAnnouncements } from '../api/api'
import { Megaphone, X, ChevronRight, ChevronLeft } from 'lucide-react'

const typeStyles = {
  INFO:    { bg: 'bg-brand-600/20 border-brand-500/30',    text: 'text-brand-200',    icon: 'text-brand-400' },
  SUCCESS: { bg: 'bg-green-600/20 border-green-500/30',    text: 'text-green-200',    icon: 'text-green-400' },
  WARNING: { bg: 'bg-amber-600/20 border-amber-500/30',    text: 'text-amber-200',    icon: 'text-amber-400' },
  DANGER:  { bg: 'bg-red-600/20 border-red-500/30',        text: 'text-red-200',      icon: 'text-red-400' },
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([])
  const [dismissed, setDismissed]         = useState(new Set())
  const [current, setCurrent]             = useState(0)

  useEffect(() => {
    fetchActiveAnnouncements()
      .then(res => setAnnouncements(res.data))
      .catch(() => {})
  }, [])

  const visible = announcements.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  const announcement = visible[Math.min(current, visible.length - 1)]
  const styles = typeStyles[announcement?.type] || typeStyles.INFO

  const dismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]))
    setCurrent(0)
  }

  return (
    <div className={`border-b ${styles.bg} border ${styles.bg} px-4 py-2.5 relative`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Megaphone className={`w-4 h-4 flex-shrink-0 ${styles.icon}`} />
        <p className={`text-sm flex-1 font-medium ${styles.text}`}>
          {announcement?.message}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {visible.length > 1 && (
            <>
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 mx-1">
                {Math.min(current, visible.length - 1) + 1}/{visible.length}
              </span>
              <button
                onClick={() => setCurrent(c => Math.min(visible.length - 1, c + 1))}
                disabled={current >= visible.length - 1}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => dismiss(announcement?.id)}
            className="p-1 rounded text-slate-400 hover:text-white ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
