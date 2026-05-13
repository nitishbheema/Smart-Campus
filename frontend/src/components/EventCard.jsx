import { Eye, Trash2, CheckCircle, MapPin, Clock } from 'lucide-react'

export default function EventCard({ event, onDelete, onRegister, isAdmin, isRegistered, onViewDetail }) {
  const typeColors = {
    Workshop:   'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30',
    Seminar:    'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
    Sports:     'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    Cultural:   'from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/30',
    Technical:  'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
    Other:      'from-slate-500/20 to-slate-700/10 text-slate-300 border-slate-500/30',
  }

  const gradientClass = typeColors[event.type] || typeColors.Other

  return (
    <div className="glass-card-sm overflow-hidden flex flex-col group hover:border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      {/* Visual Header */}
      <div className={`h-24 bg-gradient-to-br ${gradientClass} relative flex items-center justify-center border-b border-white/5`}>
        <div className="absolute top-3 right-3">
          <span className={`badge border-none backdrop-blur-md bg-white/10 text-white`}>
            {event.type || 'Other'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
          {event.type === 'Sports' && <span className="text-2xl">⚽</span>}
          {event.type === 'Workshop' && <span className="text-2xl">💡</span>}
          {event.type === 'Seminar' && <span className="text-2xl">📚</span>}
          {event.type === 'Cultural' && <span className="text-2xl">🎭</span>}
          {event.type === 'Technical' && <span className="text-2xl">💻</span>}
          {!['Sports', 'Workshop', 'Seminar', 'Cultural', 'Technical'].includes(event.type) && <span className="text-2xl">✨</span>}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-white text-lg leading-snug mb-2 group-hover:text-brand-300 transition-colors line-clamp-1">
          {event.title}
        </h3>

        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed h-10">
          {event.description || 'No description provided.'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span className="truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-accent-400" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <button
            onClick={() => onViewDetail(event)}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> View Details
          </button>

          {isAdmin ? (
            <button
              onClick={() => onDelete(event.id)}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => isRegistered ? null : onViewDetail(event)}
              disabled={isRegistered}
              className={`text-xs px-4 py-2 rounded-xl font-bold transition-all duration-300
                ${isRegistered
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                  : 'btn-primary'
                }`}
            >
              {isRegistered ? '✓ Registered' : 'Get Tickets'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
