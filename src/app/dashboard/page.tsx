'use client'

import { createClient } from '@/utils/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OverviewDashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [meetings, projects, series] = await Promise.all([
        supabase.from('meetings').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('meeting_series').select('id', { count: 'exact', head: true })
      ])
      
      return {
        totalMeetings: meetings.count || 0,
        totalProjects: projects.count || 0,
        totalSeries: series.count || 0
      }
    }
  })

  const { data: recentMeetings, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*, project:projects(name), series:meeting_series(name)')
        .order('created_at', { ascending: false })
        .limit(3)
      if (error) throw error
      return data
    }
  })

  return (
    <div className="text-on-surface h-full w-full">
      <main className="px-margin-mobile py-stack-lg max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-display font-display font-bold gradient-text mb-2">Overview</h1>
            <p className="text-body-lg text-on-surface-variant">Welcome to your intelligence hub.</p>
          </div>
          <button onClick={() => router.push('/dashboard/new')} className="bg-gradient-to-r from-primary to-secondary text-white text-button px-6 py-3 rounded-full flex items-center gap-2 shadow-premium hover:shadow-lg hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">New Meeting</span>
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel p-6 rounded-3xl border border-primary/20 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => router.push('/dashboard/meetings')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">video_camera_front</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface-variant">Total Meetings</h3>
            </div>
            <div className="text-4xl font-display font-bold text-on-surface">
              {statsLoading ? <span className="animate-pulse">--</span> : stats?.totalMeetings}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-secondary/20 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => router.push('/dashboard/projects')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">folder_open</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface-variant">Active Projects</h3>
            </div>
            <div className="text-4xl font-display font-bold text-on-surface">
              {statsLoading ? <span className="animate-pulse">--</span> : stats?.totalProjects}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-primary/20 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer group" onClick={() => router.push('/dashboard/series')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">dynamic_feed</span>
              </div>
              <h3 className="text-headline-sm font-bold text-on-surface-variant">Active Series</h3>
            </div>
            <div className="text-4xl font-display font-bold text-on-surface">
              {statsLoading ? <span className="animate-pulse">--</span> : stats?.totalSeries}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-md font-bold text-on-surface">Recent Activity</h2>
            <Link href="/dashboard/meetings" className="text-primary font-bold hover:underline">View All</Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentLoading ? (
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-2xl animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-outline-variant/30 rounded-full flex-shrink-0"></div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-5 bg-outline-variant/30 rounded w-1/3"></div>
                    <div className="h-4 bg-outline-variant/30 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : recentMeetings?.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-on-surface-variant">
                No recent activity. Upload a meeting to get started!
              </div>
            ) : (
              recentMeetings?.map((meeting) => (
                <div 
                  key={meeting.id}
                  onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
                  className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-premium hover:-translate-y-0.5 transition-all cursor-pointer border border-white/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined">mic</span>
                    </div>
                    <div>
                      <h4 className="text-headline-sm font-bold text-on-surface truncate max-w-[300px] md:max-w-md">{meeting.title}</h4>
                      <p className="text-label-md text-on-surface-variant">
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    {meeting.project && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-label-sm font-bold border border-secondary/20">
                        <span className="material-symbols-outlined text-[14px]">folder</span>
                        {meeting.project.name}
                      </span>
                    )}
                    {meeting.series && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-label-sm font-bold border border-primary/20">
                        <span className="material-symbols-outlined text-[14px]">layers</span>
                        {meeting.series.name}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${meeting.status === 'completed' ? 'bg-status-success/20 text-status-success' : 'bg-primary/20 text-primary'}`}>
                      {meeting.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
