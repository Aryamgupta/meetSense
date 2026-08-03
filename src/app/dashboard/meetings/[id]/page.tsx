'use client'

import { createClient } from '@/utils/supabase/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id as string
  const supabase = createClient()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showTranscript, setShowTranscript] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState("")

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) return
    const { error } = await supabase
      .from('meetings')
      .update({ title: newTitle })
      .eq('id', meetingId)
    
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
      setIsEditingTitle(false)
    }
  }

  const handleDeleteMeeting = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this meeting? This action cannot be undone.")
    if (!confirmDelete) return

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId)
    
    if (!error) {
      router.push('/dashboard')
    }
  }

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      const { data: mData, error: mError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single()
      
      if (mError) throw mError

      const { data: dData } = await supabase
        .from('decisions')
        .select('*')
        .eq('meeting_id', meetingId)
      
      const { data: aData } = await supabase
        .from('action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('id', { ascending: true })

      return {
        ...mData,
        decisions: dData || [],
        action_items: aData || []
      }
    }
  })

  const toggleActionItem = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending'
    
    // Optimistic UI update could go here, but a quick invalidate is safest
    await supabase.from('action_items').update({ status: newStatus }).eq('id', id)
    
    // Invalidate the query so it re-fetches and re-renders with new status
    queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
  }

  if (isLoading) return (
    <div className="min-h-screen bg-background-page flex items-center justify-center">
      <div className="p-8 text-body-md text-on-surface-variant">Loading meeting details...</div>
    </div>
  )
  if (!meeting) return (
    <div className="min-h-screen bg-background-page flex items-center justify-center">
      <div className="p-8 text-body-md text-error">Meeting not found</div>
    </div>
  )

  return (
    <div className="bg-background-page text-on-surface min-h-screen">
      <header className="w-full sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-40">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-full mx-auto">
          <div 
            className="flex items-center gap-4 cursor-pointer active:opacity-80 transition-all hover:bg-surface-container p-2 rounded-lg -ml-2" 
            onClick={() => router.push('/dashboard')}
          >
            <span className="material-symbols-outlined text-primary" data-icon="arrow_back">arrow_back</span>
            <img src="/logo.png" alt="MeetSense Logo" className="hidden sm:block h-6 object-contain" />
            <div className="hidden sm:block h-6 w-px bg-outline-variant mx-2"></div>
            <span className="text-label-md font-label-md text-on-surface-variant">Back to Dashboard</span>
          </div>
          <div className="flex items-center gap-stack-md">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-button hover:bg-primary-container transition-all" onClick={() => router.push('/dashboard')}>
              <span className="material-symbols-outlined text-[20px]" data-icon="add">add</span>
              <span className="hidden sm:inline">New Meeting</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1280px] mx-auto space-y-gutter">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-display font-display text-on-surface tracking-tight bg-transparent border-b border-primary focus:outline-none w-full max-w-xl"
                  autoFocus
                />
                <button onClick={handleUpdateTitle} className="p-2 text-status-success hover:bg-status-success/10 rounded-lg">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button onClick={() => setIsEditingTitle(false)} className="p-2 text-error hover:bg-error/10 rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h2 className="text-display font-display text-on-surface tracking-tight">{meeting.title}</h2>
                <button 
                  onClick={() => { setNewTitle(meeting.title); setIsEditingTitle(true); }}
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:bg-surface-container-low rounded-lg"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
            )}
            <p className="text-body-md font-body-md text-on-surface-variant flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-sm" data-icon="calendar_today">calendar_today</span>
              {new Date(meeting.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-stack-sm">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-button text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[20px]" data-icon="share">share</span>
              <span>Share</span>
            </button>
            <button onClick={handleDeleteMeeting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error/10 text-error text-button hover:bg-error/20 transition-colors">
              <span className="material-symbols-outlined text-[20px]">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </section>

        {meeting.summary && (
          <section className="relative overflow-hidden bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
            <div className="flex items-center gap-2 mb-stack-md text-primary">
              <span className="material-symbols-outlined" data-icon="auto_awesome" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-label-md uppercase tracking-wider font-semibold">AI Summary</span>
            </div>
            <p className="text-body-lg font-body-lg text-on-surface leading-relaxed max-w-4xl">
                {meeting.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <section className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm h-fit">
            <div className="flex items-center justify-between mb-stack-lg">
              <h3 className="text-headline-md font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" data-icon="gavel">gavel</span>
                Decisions
              </h3>
            </div>
            {meeting.decisions.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">No decisions recorded.</p>
            ) : (
              <ul className="space-y-stack-md">
                {meeting.decisions.map((d: any) => (
                  <li key={d.id} className="flex gap-stack-sm group">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    <p className="text-body-md font-body-md text-on-surface">{d.decision_text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
            <div className="flex items-center justify-between mb-stack-lg">
              <h3 className="text-headline-md font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" data-icon="checklist">checklist</span>
                Action Items
              </h3>
              {meeting.action_items.filter((a: any) => a.status === 'pending').length > 0 && (
                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-label-md">
                  {meeting.action_items.filter((a: any) => a.status === 'pending').length} Remaining
                </span>
              )}
            </div>
            {meeting.action_items.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">No action items assigned.</p>
            ) : (
              <div className="space-y-0 divide-y divide-outline-variant">
                {meeting.action_items.map((item: any) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 group">
                    <input 
                      type="checkbox"
                      checked={item.status === 'done'}
                      onChange={() => toggleActionItem(item.id, item.status)}
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer transition-all" 
                    />
                    <div className="flex-grow flex flex-col md:flex-row md:items-center gap-2">
                      <span className={`text-body-md font-body-md flex-grow ${item.status === 'done' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                        {item.task}
                      </span>
                      <div className="flex items-center gap-3">
                        {item.owner && (
                          <div className="flex -space-x-1">
                            <div className="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center text-[11px] font-bold border-2 border-surface-container-lowest" title={item.owner}>
                              {item.owner.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                        )}
                        {item.deadline && (
                           <span className="text-label-md text-on-surface-variant whitespace-nowrap">Due {item.deadline}</span>
                        )}
                        <span className={`px-2 py-1 rounded text-label-md ${item.status === 'done' ? 'bg-status-success/10 text-status-success' : 'bg-surface-container-low text-on-surface-variant'}`}>
                           {item.status === 'done' ? 'Done' : 'To Do'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="hidden w-full mt-stack-lg py-2 border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant hover:border-primary hover:text-primary transition-all items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]" data-icon="add">add</span>
              <span className="text-label-md font-semibold">Add Action Item</span>
            </button>
          </section>
        </div>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden transition-all duration-300">
          <button 
            className="w-full px-stack-lg py-stack-md flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary" data-icon="description">description</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">View Full Transcript</h3>
            </div>
            <span className={`material-symbols-outlined transform transition-transform duration-300 text-on-surface-variant ${showTranscript ? 'rotate-180' : ''}`} data-icon="expand_more">
              expand_more
            </span>
          </button>
          {showTranscript && (
            <div className="px-stack-lg pb-stack-lg animate-in slide-in-from-top-2">
              <div className="pt-stack-md border-t border-outline-variant">
                <pre className="whitespace-pre-wrap font-body-md text-body-sm sm:text-body-md text-on-surface-variant leading-relaxed">
                  {meeting.raw_transcript}
                </pre>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
