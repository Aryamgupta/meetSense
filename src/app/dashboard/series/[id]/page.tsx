'use client'

import { createClient } from '@/utils/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'

export default function SeriesDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const seriesId = params.id as string

  const { data: series, isLoading: isSeriesLoading } = useQuery({
    queryKey: ['series', seriesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_series')
        .select('*')
        .eq('id', seriesId)
        .single()
      if (error) throw error
      return data
    }
  })

  const { data: meetings, isLoading: isMeetingsLoading } = useQuery({
    queryKey: ['series-meetings', seriesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*, project:projects(name)')
        .eq('series_id', seriesId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  return (
    <div className="text-on-surface h-full w-full flex flex-col">
      {/* Hero Header */}
      <header className="px-margin-mobile py-8 md:py-12 max-w-5xl mx-auto w-full border-b border-outline-variant/30">
        <button onClick={() => router.push('/dashboard/series')} className="mb-6 flex items-center gap-2 text-primary hover:underline font-bold text-label-lg">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Series
        </button>
        {isSeriesLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-outline-variant/30 rounded w-1/3 mb-4"></div>
            <div className="h-5 bg-outline-variant/30 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-primary">dynamic_feed</span>
              <h1 className="text-display font-display font-bold text-on-surface">{series?.name}</h1>
            </div>
            {series?.description && (
              <p className="text-body-lg text-on-surface-variant max-w-2xl mt-2">{series.description}</p>
            )}
            <div className="mt-4 flex gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-label-md font-bold">
                <span className="material-symbols-outlined text-[16px]">video_camera_front</span>
                {meetings?.length || 0} Meetings
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-label-md font-bold">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Created {new Date(series?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto px-margin-mobile py-stack-lg max-w-4xl mx-auto w-full">
        {isMeetingsLoading ? (
          <div className="flex flex-col gap-8">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="w-4 h-full flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-outline-variant/30 animate-pulse"></div>
                  <div className="w-0.5 h-32 bg-outline-variant/20 mt-2"></div>
                </div>
                <div className="flex-1 glass-panel rounded-3xl p-6 h-32 animate-pulse">
                   <div className="h-6 bg-outline-variant/30 rounded w-1/2 mb-4"></div>
                   <div className="h-4 bg-outline-variant/30 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : meetings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center glass-panel rounded-3xl animate-in fade-in">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">dynamic_feed</span>
            <h3 className="text-headline-md font-semibold text-on-surface">No meetings in this series</h3>
            <p className="mt-3 text-body-lg text-on-surface-variant max-w-md mx-auto mb-8">Upload a new meeting and assign it to this recurring series.</p>
            <button 
              onClick={() => router.push('/dashboard/new')}
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-button px-8 py-4 rounded-full flex items-center gap-2 shadow-premium hover:opacity-90 transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Meeting
            </button>
          </div>
        ) : (
          <div className="relative border-l-2 border-primary/20 ml-6 md:ml-8 pb-12">
            {meetings?.map((meeting, idx) => (
              <div 
                key={meeting.id} 
                className="mb-12 last:mb-0 relative pl-8 md:pl-12 animate-in slide-in-from-bottom-4 fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Timeline Node */}
                <div className="absolute -left-[11px] top-4 w-[20px] h-[20px] rounded-full bg-primary border-4 border-background-page shadow-sm z-10"></div>
                
                {/* Meeting Card */}
                <div 
                  onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
                  className="glass-panel rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-premium hover:-translate-y-1 group border border-white/40"
                >
                  <div className="flex justify-between items-start mb-4 gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex flex-col gap-2 min-w-0">
                      <h3 className="text-headline-md font-bold text-on-surface truncate group-hover:text-primary transition-colors" title={meeting.title}>{meeting.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5 flex-shrink-0">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(meeting.created_at).toLocaleDateString()}
                        </p>
                        {meeting.project && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[11px] font-bold border border-secondary/20">
                            <span className="material-symbols-outlined text-[12px]">folder</span>
                            {meeting.project.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-label-md font-bold shadow-sm backdrop-blur-md ${meeting.status === 'completed' ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                      {meeting.status}
                    </span>
                  </div>
                  {meeting.summary && (
                    <p className="text-body-lg text-on-surface-variant mb-4 line-clamp-3 bg-white/40 p-3 rounded-xl border border-white/50">{meeting.summary}</p>
                  )}
                  {meeting.status === 'completed' && (
                    <div className="flex justify-start items-center mt-4">
                      <span className="text-primary text-label-md font-bold flex items-center gap-1.5 group-hover:underline">
                        View Full Details
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
