'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'

export default function SeriesPage() {
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [isCreating, setIsCreating] = useState(false)
  const [newSeriesName, setNewSeriesName] = useState('')
  const [newSeriesDesc, setNewSeriesDesc] = useState('')

  const { data: seriesList, isLoading } = useQuery({
    queryKey: ['series'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_series')
        .select('*, meetings(count)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const createSeriesMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('Not logged in')

      const { error } = await supabase.from('meeting_series').insert({
        user_id: userData.user.id,
        name: newSeriesName,
        description: newSeriesDesc
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      setIsCreating(false)
      setNewSeriesName('')
      setNewSeriesDesc('')
      toast.success('Series created successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to create series: ${error.message}`)
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSeriesName.trim()) return
    createSeriesMutation.mutate()
  }

  return (
    <div className="bg-background-page text-on-surface min-h-screen flex flex-col">
      <main className="flex-1 overflow-y-auto px-4 py-8 md:py-12 md:px-margin-desktop w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]">dynamic_feed</span>
            <h1 className="text-display font-display font-bold gradient-text">Meeting Series</h1>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-primary to-secondary text-white text-button px-6 py-3 rounded-full flex items-center gap-2 shadow-premium hover:shadow-lg hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">New Series</span>
          </button>
        </div>
        
        {isCreating && (
          <div className="mb-8 glass-panel border border-primary/30 rounded-3xl p-8 shadow-premium animate-in slide-in-from-top-4">
            <h2 className="text-headline-md font-bold mb-6 text-on-surface">Create New Series</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              <div>
                <label className="block text-label-md font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Series Name</label>
                <input 
                  type="text" 
                  value={newSeriesName}
                  onChange={(e) => setNewSeriesName(e.target.value)}
                  className="w-full glass-input rounded-xl px-5 py-4 text-body-lg focus:outline-none"
                  placeholder="e.g. Weekly Standup"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-label-md font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Description (Optional)</label>
                <input 
                  type="text" 
                  value={newSeriesDesc}
                  onChange={(e) => setNewSeriesDesc(e.target.value)}
                  className="w-full glass-input rounded-xl px-5 py-4 text-body-lg focus:outline-none"
                  placeholder="e.g. Engineering sync"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-3 rounded-full text-button font-semibold text-on-surface-variant hover:bg-white/50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newSeriesName.trim() || createSeriesMutation.isPending}
                  className="px-6 py-3 rounded-full text-button font-bold bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg disabled:opacity-50 transition-all hover:scale-105"
                >
                  {createSeriesMutation.isPending ? 'Creating...' : 'Create Series'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
               <div key={idx} className="glass-panel rounded-2xl p-6 animate-pulse flex justify-between items-center">
                 <div className="flex flex-col gap-2 w-1/3">
                   <div className="h-6 bg-outline-variant/30 rounded w-full"></div>
                   <div className="h-4 bg-outline-variant/30 rounded w-1/2"></div>
                 </div>
                 <div className="h-6 bg-outline-variant/30 rounded w-16"></div>
               </div>
            ))}
          </div>
        ) : seriesList?.length === 0 && !isCreating ? (
          <div className="flex flex-col items-center justify-center p-16 text-center glass-panel rounded-3xl animate-in fade-in">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">dynamic_feed</span>
            <h3 className="text-headline-md font-semibold text-on-surface">No series yet</h3>
            <p className="mt-3 text-body-lg text-on-surface-variant mb-8 max-w-md">Link recurring meetings together so the AI can remember past context across meetings.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-button px-8 py-4 rounded-full flex items-center gap-2 shadow-premium hover:opacity-90 hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Create your first series
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seriesList?.map((s, idx) => (
              <div 
                key={s.id} 
                onClick={() => router.push(`/dashboard/series/${s.id}`)}
                className="glass-panel rounded-3xl p-6 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden animate-in fade-in zoom-in-95 cursor-pointer" 
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">dynamic_feed</span>
                  </div>
                  <div>
                    <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">{s.name}</h3>
                    <p className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5 mt-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        Created {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {s.description && (
                  <p className="text-body-lg text-on-surface-variant mt-4 line-clamp-2 leading-relaxed bg-white/40 p-3 rounded-xl border border-white/50">{s.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-end">
                  <span className="text-label-md font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">video_camera_front</span>
                    {s.meetings[0]?.count || 0} Meetings
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
