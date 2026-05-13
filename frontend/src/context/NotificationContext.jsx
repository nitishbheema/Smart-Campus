import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { fetchNotifications, fetchUnreadCount, markAllRead, markNotificationRead, deleteNotification } from '../api/api'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const pollRef = useRef(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [notifRes, countRes] = await Promise.all([
        fetchNotifications(user.id),
        fetchUnreadCount(user.id),
      ])
      setNotifications(notifRes.data)
      setUnreadCount(countRes.data.count)
    } catch {/* silent */}
  }, [user])

  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); return }
    load()
    // Poll every 15 seconds for new notifications
    pollRef.current = setInterval(load, 15000)
    return () => clearInterval(pollRef.current)
  }, [user, load])

  const markRead = async (id) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAll = async () => {
    if (!user) return
    await markAllRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const remove = async (id) => {
    await deleteNotification(id)
    const removed = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (removed && !removed.read) setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const refresh = load

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAll, remove, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
