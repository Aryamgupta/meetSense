'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard', exact: true },
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
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-white/40 rounded-lg text-primary hover:bg-white/60 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`fixed inset-0 z-50 md:z-0 md:relative md:flex md:w-[280px] flex-col glass-panel border-r border-white/40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile Overlay */}
        <div 
          className={`md:hidden absolute inset-0 bg-on-surface/40 backdrop-blur-sm -z-10 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Content */}
        <aside className="w-[280px] h-full flex flex-col p-6 bg-white/40 md:bg-transparent shadow-2xl md:shadow-none overflow-y-auto z-10">
          <div className="flex items-center justify-between mb-10">
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/logo.png" alt="MeetSense Logo" className="h-8 object-contain cursor-pointer drop-shadow-sm" />
            </Link>
            <button className="md:hidden p-2 bg-white/50 rounded-lg text-on-surface-variant hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
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
    </div>
  )
}
