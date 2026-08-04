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
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing'>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

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


  const filteredMeetings = meetings?.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || m.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="text-on-surface h-full w-full">
      <main className="px-margin-mobile py-stack-lg max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-display font-display font-bold gradient-text">Dashboard</h1>
          <button onClick={() => router.push('/dashboard/new')} className="bg-gradient-to-r from-primary to-secondary text-white text-button px-6 py-3 rounded-full flex items-center gap-2 shadow-premium hover:shadow-lg hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">New Meeting</span>
          </button>
        </div>

        <div className="mb-10 flex gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[24px]">search</span>
            <input 
              className="w-full glass-input rounded-full pl-14 pr-6 py-4 text-body-lg shadow-sm focus:shadow-premium outline-none transition-all" 
              placeholder="Search meetings by title or content..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <div className="relative flex-shrink-0">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-4 glass-panel rounded-full hover:text-secondary hover:shadow-premium transition-all ${filterStatus !== 'all' ? 'text-secondary bg-white/60 border-primary/50' : 'text-primary'}`}
            >
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-panel shadow-premium rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 bg-surface/80 backdrop-blur-xl border border-outline-variant/30">
                <button onClick={() => {setFilterStatus('all'); setShowFilterMenu(false)}} className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${filterStatus === 'all' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-white/40'}`}>All Meetings</button>
                <button onClick={() => {setFilterStatus('completed'); setShowFilterMenu(false)}} className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${filterStatus === 'completed' ? 'bg-status-success/20 text-status-success font-bold' : 'hover:bg-white/40'}`}>Completed</button>
                <button onClick={() => {setFilterStatus('processing'); setShowFilterMenu(false)}} className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${filterStatus === 'processing' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-white/40'}`}>Processing</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                <div className="animate-pulse flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-6 bg-outline-variant/30 rounded w-3/4"></div>
                      <div className="h-4 bg-outline-variant/30 rounded w-1/4 mt-1"></div>
                    </div>
                    <div className="h-7 w-20 bg-outline-variant/30 rounded-full flex-shrink-0"></div>
                  </div>
                  <div className="h-4 bg-outline-variant/30 rounded w-full mb-2 mt-4"></div>
                  <div className="h-4 bg-outline-variant/30 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMeetings?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center glass-panel rounded-3xl animate-in fade-in">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">mic</span>
              <h3 className="text-headline-md font-semibold text-on-surface">No meetings yet</h3>
              <p className="mt-3 text-body-lg text-on-surface-variant max-w-md mx-auto mb-8">Get started by analyzing your first meeting transcript.</p>
              <button 
                onClick={() => router.push('/dashboard/new')}
                className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-button px-8 py-4 rounded-full flex items-center gap-2 shadow-premium hover:opacity-90 transition-all hover:scale-105"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Analyze Meeting
              </button>
            </div>
          ) : filteredMeetings?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center glass-panel rounded-3xl animate-in fade-in">
                  <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">search_off</span>
                  <h3 className="text-headline-md font-semibold text-on-surface">No results found</h3>
                  <p className="mt-3 text-body-lg text-on-surface-variant">We couldn't find any meetings matching your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMeetings?.map((meeting, idx) => (
                    <div 
                      key={meeting.id} 
                      onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)} 
                      className="glass-panel rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-premium hover:-translate-y-1 group relative overflow-hidden animate-in fade-in zoom-in-95"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div className="flex flex-col gap-2 min-w-0">
                          <h3 className="text-headline-md font-bold text-on-surface truncate group-hover:text-primary transition-colors" title={meeting.title}>{meeting.title}</h3>
                          <p className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5 flex-shrink-0">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {new Date(meeting.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-label-md font-bold shadow-sm backdrop-blur-md ${meeting.status === 'completed' ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                          {meeting.status}
                        </span>
                      </div>
                      {meeting.summary && (
                        <p className="text-body-lg text-on-surface-variant mb-4 line-clamp-2 bg-white/40 p-3 rounded-xl border border-white/50">{meeting.summary}</p>
                      )}
                      {meeting.status === 'completed' && (
                        <div className="flex justify-end items-center mt-4">
                          <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1.5 rounded-full text-label-md font-bold flex items-center gap-1.5 shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                            Analyzed
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
          )}
        </div>
      </main>
    </div>
  )
}
