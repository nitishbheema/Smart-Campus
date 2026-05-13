export default function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'bg-green-500/20 border-green-500/40 text-green-300',
    error:   'bg-red-500/20   border-red-500/40   text-red-300',
    info:    'bg-brand-500/20 border-brand-500/40 text-brand-300',
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ' }

  return (
    <div className={`fixed top-20 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl
                     border backdrop-blur-lg shadow-2xl animate-slide-up max-w-sm ${colors[type]}`}>
      <span className="text-lg font-bold">{icons[type]}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity text-lg leading-none">×</button>
    </div>
  )
}
