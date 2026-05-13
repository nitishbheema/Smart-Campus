import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CalendarDays, LayoutDashboard, Ticket, ShieldCheck, LogOut, GraduationCap, User } from 'lucide-react'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events',    label: 'Explore',    icon: CalendarDays },
    { to: '/my-events', label: 'My Tickets', icon: Ticket },
    { to: '/profile',   label: 'Profile',   icon: User },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Console', icon: ShieldCheck }] : []),
  ]

  return (
    <header className="sticky top-4 z-50 px-4 mb-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-4 sm:px-6 h-20 flex items-center justify-between border-white/5 shadow-2xl">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/40 group-hover:scale-105 transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tighter leading-tight">
                <span className="text-gradient">CAMPUS</span>
                <span className="text-slate-200">HUB</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Event Portal</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link 
                key={to} 
                to={to} 
                className={isActive(to) 
                  ? 'nav-link-active' 
                  : 'nav-link hover:translate-y-[-1px]'
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-100 leading-none mb-1">{user?.username}</p>
                <span className={user?.role === 'ADMIN' ? 'badge-accent' : 'badge-brand'}>
                  {user?.role}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-brand-400 font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 
                         border border-transparent hover:border-red-500/30 transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden mt-3 glass-card-sm p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'nav-link-active whitespace-nowrap' : 'nav-link whitespace-nowrap text-xs'}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
