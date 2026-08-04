'use client'

import { createClient } from '@/utils/supabase/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
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

  const [isExtracting, setIsExtracting] = useState(false)
  const handleReExtract = async () => {
    const confirm = window.confirm("Are you sure you want to re-extract insights? This will overwrite current summary, decisions, and action items.")
    if (!confirm) return
    
    setIsExtracting(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/extract`, { method: 'POST' })
      if (!res.ok) throw new Error("Extraction failed")
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] })
      toast.success("Extraction complete!")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsExtracting(false)
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
      
      const { data: directData } = await supabase
        .from('action_items')
        .select('*')
        .eq('meeting_id', meetingId)

      const { data: mentionData } = await supabase
        .from('action_item_mentions')
        .select('action_items(*)')
        .eq('meeting_id', meetingId)

      const aiMap = new Map()
      directData?.forEach(item => aiMap.set(item.id, item))
      mentionData?.forEach((m: any) => {
        if (m.action_items) aiMap.set(m.action_items.id, m.action_items)
      })
      
      const aData = Array.from(aiMap.values()).sort((a, b) => a.id.localeCompare(b.id))

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
    <div className="bg-transparent text-on-surface h-full flex flex-col relative overflow-hidden animate-pulse">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <main className="max-w-4xl mx-auto px-4 md:px-0 py-12 w-full relative z-10 space-y-8">
        <div className="glass-panel p-8 rounded-3xl">
           <div className="h-10 bg-outline-variant/30 rounded w-3/4 mb-4"></div>
           <div className="h-6 bg-outline-variant/30 rounded w-1/4"></div>
        </div>
        <div className="glass-panel p-8 rounded-3xl">
           <div className="h-32 bg-outline-variant/30 rounded w-full"></div>
        </div>
      </main>
    </div>
  )
  if (!meeting) return (
    <div className="min-h-screen bg-background-page flex items-center justify-center">
      <div className="p-8 text-body-md text-error">Meeting not found</div>
    </div>
  )

  return (
    <div className="bg-transparent text-on-surface min-h-screen">
      <main className="px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1280px] mx-auto space-y-gutter relative z-10">
        
        <div className="mb-4">
          <button 
            className="flex items-center gap-2 cursor-pointer transition-all hover:bg-white/40 p-2 rounded-xl text-on-surface-variant hover:text-primary font-medium w-fit shadow-sm" 
            onClick={() => router.push('/dashboard')}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
        </div>

        <section className={`rounded-3xl p-8 shadow-premium mb-12 relative overflow-hidden ${
            meeting.tone === 'positive' ? 'bg-gradient-to-br from-status-success/10 to-transparent' : 
            meeting.tone === 'tense' ? 'bg-gradient-to-br from-error/10 to-transparent' : 
            'bg-gradient-to-br from-primary/10 to-transparent'
        }`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md relative z-10">
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
                  <h2 className="text-display font-display text-on-surface tracking-tight font-bold">{meeting.title}</h2>
                  <button 
                    onClick={() => { setNewTitle(meeting.title); setIsEditingTitle(true); }}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:bg-white/50 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white text-label-md font-semibold text-on-surface-variant flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-sm" data-icon="calendar_today">calendar_today</span>
                  {new Date(meeting.created_at).toLocaleDateString()}
                </span>
                {meeting.tone && (
                  <span className={`px-4 py-1.5 rounded-full border text-label-md font-semibold capitalize flex items-center gap-2 shadow-sm backdrop-blur-md ${
                    meeting.tone === 'positive' ? 'bg-status-success/20 text-status-success border-status-success/30' : 
                    meeting.tone === 'tense' ? 'bg-error/20 text-error border-error/30' : 
                    meeting.tone === 'mixed' ? 'bg-secondary-container/50 text-on-secondary-container border-secondary-container' : 
                    'bg-white/60 text-on-surface-variant border-white'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">{meeting.tone === 'positive' ? 'sentiment_very_satisfied' : meeting.tone === 'tense' ? 'sentiment_very_dissatisfied' : 'sentiment_neutral'}</span>
                    {meeting.tone} Tone
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {process.env.NODE_ENV === 'development' && (
                <button 
                  onClick={handleReExtract}
                  disabled={isExtracting}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/50 hover:bg-secondary-container text-on-secondary-container text-button transition-colors border border-transparent shadow-sm backdrop-blur-md disabled:opacity-50"
                  title="Re-run AI Extraction (Dev Only)"
                >
                  <span className="material-symbols-outlined text-[18px]">{isExtracting ? 'sync' : 'smart_toy'}</span>
                  <span className="hidden sm:inline">{isExtracting ? 'Extracting...' : 'Re-Extract'}</span>
                </button>
              )}
              <button onClick={handleDeleteMeeting} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 hover:bg-error/10 text-error text-button transition-colors border border-transparent hover:border-error/20 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </section>

        {meeting.summary && (
          <section className="relative overflow-hidden glass-panel rounded-3xl p-8 mb-8 group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-secondary opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <span className="material-symbols-outlined" data-icon="auto_awesome" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-label-md uppercase tracking-widest font-bold">AI Executive Summary</span>
            </div>
            <p className="text-headline-md font-medium text-on-surface leading-relaxed max-w-4xl">
                {meeting.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <section className="lg:col-span-5 glass-panel rounded-3xl p-8 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-headline-md font-bold flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg" data-icon="gavel">gavel</span>
                Key Decisions
              </h3>
            </div>
            {meeting.decisions.length === 0 ? (
              <p className="text-body-md text-on-surface-variant bg-white/50 p-4 rounded-xl border border-white/50 text-center">No decisions recorded.</p>
            ) : (
              <ul className="space-y-4">
                {meeting.decisions.map((d: any) => (
                  <li key={d.id} className="flex gap-4 group bg-white/40 p-4 rounded-xl border border-white/50 hover:bg-white/60 transition-colors shadow-sm">
                    <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                    <p className="text-body-lg font-medium text-on-surface">{d.decision_text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="lg:col-span-7 glass-panel rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-headline-md font-bold flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg" data-icon="checklist">checklist</span>
                Action Items
              </h3>
              {meeting.action_items.filter((a: any) => a.status === 'pending').length > 0 && (
                <span className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full text-label-md font-bold shadow-sm">
                  {meeting.action_items.filter((a: any) => a.status === 'pending').length} Remaining
                </span>
              )}
            </div>
            {meeting.action_items.length === 0 ? (
              <p className="text-body-md text-on-surface-variant bg-white/50 p-4 rounded-xl border border-white/50 text-center">No action items assigned.</p>
            ) : (
              <div className="space-y-4">
                {meeting.action_items.map((item: any) => (
                  <div key={item.id} className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col md:flex-row md:items-center gap-4 group ${item.status === 'done' ? 'bg-surface-container-low/50 border-transparent opacity-60' : 'bg-white/70 border-white hover:shadow-md'}`}>
                    <input 
                      type="checkbox"
                      checked={item.status === 'done'}
                      onChange={() => toggleActionItem(item.id, item.status)}
                      className="w-6 h-6 rounded-md border-2 border-outline-variant text-primary focus:ring-primary cursor-pointer transition-all" 
                    />
                    <div className="flex-grow flex flex-col gap-3 w-full">
                      <span className={`text-body-lg font-semibold flex-grow ${item.status === 'done' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                        {item.task}
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {item.owner && (
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tertiary to-tertiary-container text-white flex items-center justify-center text-[12px] font-bold border-2 border-white shadow-sm" title={item.owner}>
                              {item.owner.slice(0, 2).toUpperCase()}
                            </div>
                            {item.mention_count && item.mention_count > 1 && (
                              <div className="ml-4 inline-flex items-center gap-1.5 bg-tertiary-container/40 text-tertiary px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider backdrop-blur-sm border border-tertiary-container/30">
                                <span className="material-symbols-outlined text-[14px]">repeat</span>
                                Mentioned in {item.mention_count} meetings
                              </div>
                            )}
                          </div>
                        )}
                        {item.deadline && (
                           <span className="px-3 py-1 bg-white/50 border border-white/50 rounded-full text-label-md font-medium text-on-surface-variant shadow-sm flex items-center gap-1">
                             <span className="material-symbols-outlined text-[14px]">event</span>
                             {item.deadline}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {meeting.suggested_next_agenda && meeting.suggested_next_agenda.length > 0 && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
            <div className="flex items-center justify-between mb-stack-lg">
              <h3 className="text-headline-md font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">next_plan</span>
                Suggested for Next Meeting
              </h3>
            </div>
            <ul className="space-y-stack-md">
              {meeting.suggested_next_agenda.map((item: string, idx: number) => (
                <li key={idx} className="flex gap-stack-sm group">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0"></span>
                  <p className="text-body-md font-body-md text-on-surface">{item}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

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
