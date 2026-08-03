'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }


  return (
    <div className="bg-background-page text-on-surface min-h-screen">
      {/* Navigation Drawer */}
      <div className={`fixed inset-0 z-50 ${isDrawerOpen ? '' : 'pointer-events-none'}`} id="nav-drawer-container">
        <div 
          className={`drawer-overlay absolute inset-0 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto bg-on-surface/40 backdrop-blur-[2px]' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setIsDrawerOpen(false)}
        ></div>
        <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant pointer-events-auto flex flex-col gap-unit p-4 transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`} id="nav-drawer">
          <div className="flex items-center justify-between mb-stack-lg">
            <img src="/logo.png" alt="MeetSense Logo" className="h-8 object-contain" />
            <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors" onClick={() => setIsDrawerOpen(false)}>
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
          <nav className="flex flex-col flex-1 gap-2">
            <a className="bg-primary-container text-on-primary rounded-lg px-4 py-3 flex items-center gap-3 transition-all" href="/dashboard">
              <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              <span className="text-button">Dashboard</span>
            </a>
            <a className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg px-4 py-3 flex items-center gap-3 transition-all" href="/dashboard/settings">
              <span className="material-symbols-outlined" data-icon="settings">settings</span>
              <span className="text-button">Settings</span>
            </a>
          </nav>
          <div className="mt-auto border-t border-outline-variant pt-4 px-2 flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={handleSignOut}>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold overflow-hidden border border-outline-variant">
              M
            </div>
            <div className="flex flex-col text-left">
              <span className="text-body-md font-semibold text-error">Sign Out</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Top AppBar */}
      <header className="w-full sticky top-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-4 py-4 md:px-margin-desktop">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-surface-container-low transition-colors rounded-lg cursor-pointer active:opacity-80" onClick={() => setIsDrawerOpen(true)}>
            <span className="material-symbols-outlined text-primary" data-icon="menu">menu</span>
          </button>
          <img src="/logo.png" alt="MeetSense Logo" className="h-8 object-contain" />
        </div>
        <button onClick={() => router.push('/dashboard/new')} className="bg-primary text-on-primary text-button px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">New Meeting</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-margin-mobile py-stack-md max-w-2xl mx-auto">
        <div className="mb-stack-lg flex gap-unit">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
              placeholder="Search meetings..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
             <div className="flex justify-center p-8 text-sm text-on-surface-variant">Loading your meetings...</div>
          ) : meetings?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
              <h3 className="text-headline-sm font-semibold text-on-surface">No meetings yet</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">Get started by analyzing your first meeting transcript.</p>
              <button 
                onClick={() => router.push('/dashboard/new')}
                className="mt-6 bg-primary text-on-primary text-button px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                New Meeting
              </button>
            </div>
          ) : meetings?.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.summary?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
                  <h3 className="text-headline-sm font-semibold text-on-surface">No results found</h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">We couldn't find any meetings matching your search.</p>
                </div>
              ) : (
                meetings?.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.summary?.toLowerCase().includes(searchQuery.toLowerCase())).map(meeting => (
                  <div key={meeting.id} onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-outline">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-headline-sm font-semibold text-on-surface truncate">{meeting.title}</h3>
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {new Date(meeting.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-label-md font-semibold border ${meeting.status === 'completed' ? 'bg-surface-container-high text-secondary border-outline-variant' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed-dim'}`}>
                    {meeting.status}
                  </span>
                </div>
                {meeting.summary && (
                  <p className="text-body-md text-on-surface-variant mb-4 line-clamp-2">{meeting.summary}</p>
                )}
                {meeting.status === 'completed' && (
                  <div className="flex justify-end items-center">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-label-md font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Analyzed
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

    </div>
  )
}
