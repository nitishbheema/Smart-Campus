import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/Navbar'
import AnnouncementBanner from './components/AnnouncementBanner'
import LoginPage    from './pages/LoginPage'
import Dashboard    from './pages/Dashboard'
import EventsPage   from './pages/EventsPage'
import MyEventsPage from './pages/MyEventsPage'
import AdminPanel   from './pages/AdminPanel'
import ProfilePage  from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AnnouncementBanner />
      <main className="flex-1">{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute><AppLayout><EventsPage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/my-events" element={
          <ProtectedRoute><AppLayout><MyEventsPage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><AppLayout><AdminPanel /></AppLayout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </NotificationProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
