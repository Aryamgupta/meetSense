'use client'

import { createClient } from '@/utils/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const projectId = params.id as string

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      if (error) throw error
      return data
    }
  })

  const { data: meetings, isLoading: isMeetingsLoading } = useQuery({
    queryKey: ['project-meetings', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*, series:meeting_series(name)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  return (
    <div className="text-on-surface h-full w-full flex flex-col">
      {/* Hero Header */}
      <header className="px-margin-mobile py-8 md:py-12 max-w-5xl mx-auto w-full border-b border-outline-variant/30">
        <button onClick={() => router.push('/dashboard/projects')} className="mb-6 flex items-center gap-2 text-primary hover:underline font-bold text-label-lg">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Projects
        </button>
        {isProjectLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-outline-variant/30 rounded w-1/3 mb-4"></div>
            <div className="h-5 bg-outline-variant/30 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-secondary">folder_open</span>
              <h1 className="text-display font-display font-bold text-on-surface">{project?.name}</h1>
            </div>
            {project?.description && (
              <p className="text-body-lg text-on-surface-variant max-w-2xl mt-2">{project.description}</p>
            )}
            <div className="mt-4 flex gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-label-md font-bold">
                <span className="material-symbols-outlined text-[16px]">video_camera_front</span>
                {meetings?.length || 0} Meetings
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-label-md font-bold">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Created {new Date(project?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-margin-mobile py-stack-lg max-w-5xl mx-auto w-full">
        {isMeetingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="glass-panel rounded-3xl p-6 h-40 animate-pulse">
                <div className="h-6 bg-outline-variant/30 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-outline-variant/30 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : meetings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center glass-panel rounded-3xl animate-in fade-in">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">videocam_off</span>
            <h3 className="text-headline-md font-semibold text-on-surface">No meetings in this project</h3>
            <p className="mt-3 text-body-lg text-on-surface-variant max-w-md mx-auto mb-8">Upload a new meeting and assign it to this project.</p>
            <button 
              onClick={() => router.push('/dashboard/new')}
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-button px-8 py-4 rounded-full flex items-center gap-2 shadow-premium hover:opacity-90 transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Meeting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meetings?.map((meeting, idx) => (
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
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5 flex-shrink-0">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </p>
                      {meeting.series && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
                          <span className="material-symbols-outlined text-[12px]">layers</span>
                          {meeting.series.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-label-md font-bold shadow-sm backdrop-blur-md ${meeting.status === 'completed' ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                    {meeting.status}
                  </span>
                </div>
                {meeting.summary && (
                  <p className="text-body-lg text-on-surface-variant mb-4 line-clamp-2 bg-white/40 p-3 rounded-xl border border-white/50">{meeting.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
