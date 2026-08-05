'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import NotificationPanel from '@/components/NotificationPanel'
import { toast } from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let subscription: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch initial unread count
      const { count } = await supabase
        .from('app_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      
      setUnreadCount(count || 0)

      // Subscribe to real-time inserts
      subscription = supabase
        .channel(`notifications-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'app_notifications', filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            setUnreadCount((prev) => prev + 1)
            toast.success(`New Notification: ${payload.new?.title || 'Check your notifications'}`, {
              icon: '🔔',
              style: { borderRadius: '10px', background: '#333', color: '#fff' }
            })
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [supabase])

  const handleNotificationsClose = () => {
    setIsNotificationsOpen(false)
    // Refresh unread count after closing panel (assuming user might have read some)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('app_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
          .then(({ count }) => setUnreadCount(count || 0))
      }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'All Meetings', href: '/dashboard/meetings', icon: 'video_camera_front' },
    { label: 'Projects', href: '/dashboard/projects', icon: 'folder_open' },
    { label: 'Meeting Series', href: '/dashboard/series', icon: 'dynamic_feed' },
    { label: 'Ask MeetSense', href: '/dashboard/ask', icon: 'forum' },
    { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
  ]

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href) && href !== '/dashboard'
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      
      {/* Mobile Hamburger Header (Only visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-panel border-b border-outline-variant/30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MeetSense Logo" className="h-7 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="p-2 bg-white/40 rounded-full text-on-surface hover:bg-white/60 transition-colors shadow-sm relative"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border border-white animate-pulse"></span>}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white/40 rounded-lg text-primary hover:bg-white/60 transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed inset-0 z-50 md:z-0 md:relative md:flex md:w-[280px] flex-col glass-panel border-r border-white/40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile Overlay */}
        <div 
          className={`md:hidden absolute inset-0 bg-on-surface/40 backdrop-blur-sm -z-10 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Content */}
        <aside className="w-[280px] h-full flex flex-col p-6 bg-white/40 md:bg-transparent shadow-2xl md:shadow-none overflow-y-auto z-10 relative">
          <div className="flex items-center justify-between mb-10">
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/logo.png" alt="MeetSense Logo" className="h-8 object-contain cursor-pointer drop-shadow-sm" />
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="hidden md:flex p-2 bg-white/50 rounded-full text-on-surface hover:bg-white/70 hover:text-primary transition-colors shadow-sm relative"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border border-white animate-pulse"></span>}
              </button>
              <button className="md:hidden p-2 bg-white/50 rounded-lg text-on-surface-variant hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          
          <nav className="flex flex-col flex-1 gap-3">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
                  isActive(item.href, item.exact) 
                  ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-premium -translate-y-0.5' 
                  : 'text-on-surface-variant hover:bg-white/60 hover:text-primary hover:shadow-sm'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-body-lg tracking-wide">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div 
            className="mt-auto pt-6 border-t border-white/50 flex items-center gap-4 cursor-pointer group px-2" 
            onClick={handleSignOut}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-error/80 to-error text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <div className="flex flex-col">
              <span className="text-body-lg font-bold text-on-surface group-hover:text-error transition-colors">Sign Out</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto relative pt-16 md:pt-0">
        {children}
      </div>

      <NotificationPanel isOpen={isNotificationsOpen} onClose={handleNotificationsClose} />
    </div>
  )
}
